<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role = 'citizen', array $extra = []): User
    {
        $user = new User(['name' => 'Test '.$role, 'email' => $role.'@test.com', 'password' => 'password123']);
        $user->role = $role;
        foreach ($extra as $key => $value) {
            $user->{$key} = $value;
        }
        $user->save();

        return $user;
    }

    private function registerPayload(array $override = []): array
    {
        return array_merge([
            'first_name' => 'Ana',
            'last_name' => 'Cruz',
            'email' => 'ana@email.com',
            'phone' => '0917 555 0100',
            'password' => 'Str0ng!Passw0rd',
            'password_confirmation' => 'Str0ng!Passw0rd',
            'terms' => true,
        ], $override);
    }

    public function test_register_creates_an_unverified_citizen_and_returns_no_token(): void
    {
        $response = $this->postJson('/api/register', $this->registerPayload());

        $response->assertCreated()->assertJsonPath('requiresVerification', true)->assertJsonMissingPath('token');
        $this->assertDatabaseHas('users', ['email' => 'ana@email.com', 'role' => 'citizen', 'email_verified_at' => null]);
    }

    public function test_register_cannot_choose_a_role(): void
    {
        $this->postJson('/api/register', $this->registerPayload(['role' => 'kennel_manager']))
            ->assertCreated();
        $this->assertSame('citizen', User::where('email', 'ana@email.com')->value('role'));
    }

    public function test_register_validates_input(): void
    {
        $this->postJson('/api/register', [])->assertUnprocessable()
            ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'phone', 'password', 'terms']);

        $this->makeUser();
        $this->postJson('/api/register', $this->registerPayload(['email' => 'citizen@test.com']))
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);

        $this->postJson('/api/register', $this->registerPayload(['password_confirmation' => 'different']))
            ->assertUnprocessable()->assertJsonValidationErrors(['password']);
    }

    public function test_login_returns_token_and_role(): void
    {
        $this->makeUser('vet_tech');

        $this->postJson('/api/login', ['email' => 'vet_tech@test.com', 'password' => 'password123'])
            ->assertOk()->assertJsonPath('user.role', 'vet_tech')->assertJsonStructure(['token']);
    }

    public function test_login_rejects_wrong_credentials_with_422(): void
    {
        $this->makeUser();

        $this->postJson('/api/login', ['email' => 'citizen@test.com', 'password' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->postJson('/api/login', ['email' => 'nobody@test.com', 'password' => 'password123'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    public function test_deactivated_account_cannot_log_in(): void
    {
        $this->makeUser('pound_staff', ['is_active' => false]);

        $this->postJson('/api/login', ['email' => 'pound_staff@test.com', 'password' => 'password123'])
            ->assertUnprocessable()->assertJsonPath('errors.email.0', 'Invalid email or password.');
    }

    public function test_me_requires_a_token(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();

        $token = $this->makeUser()->createToken('auth')->plainTextToken;
        $this->withToken($token)->getJson('/api/me')->assertOk()->assertJsonPath('user.email', 'citizen@test.com');
    }

    public function test_logout_revokes_the_token(): void
    {
        $user = $this->makeUser();
        $token = $user->createToken('auth')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);

        // The same token no longer works
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/me')->assertUnauthorized();
    }
}

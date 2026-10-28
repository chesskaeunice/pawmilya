<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// My Account (citizen Profile page and staff Settings page share it): full name and phone number
class ProfileNameTest extends TestCase
{
    use RefreshDatabase;

    private const ROLES = ['citizen', 'kennel_manager', 'adoption_counselor', 'vet_tech', 'pound_staff'];

    private function makeUser(string $role): User
    {
        $user = new User(['name' => 'Old Name', 'email' => $role.'@email.com', 'phone' => '09171234567', 'password' => 'Str0ng!Passw0rd']);
        $user->role = $role;
        $user->save();

        return $user;
    }

    private function save(User $user, array $data)
    {
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();

        return $this->withToken($user->createToken('t')->plainTextToken)->patchJson('/api/profile', $data);
    }

    public function test_every_role_can_change_its_name_and_it_is_still_there_in_me(): void
    {
        foreach (self::ROLES as $role) {
            $user = $this->makeUser($role);

            $this->save($user, ['name' => '  Maria Santos ', 'phone' => '0918 765 4321'])->assertOk()
                ->assertJsonPath('user.name', 'Maria Santos')
                ->assertJsonPath('user.phone', '09187654321');

            $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Maria Santos', 'phone' => '09187654321']);

            // a refresh / new login reads the same name
            $this->getJson('/api/me')->assertOk()->assertJsonPath('user.name', 'Maria Santos');
            $this->assertTrue(AuditLog::where('action', 'profile.updated')->where('user_id', $user->id)->exists(), $role);
        }
    }

    public function test_the_name_is_required_and_a_bad_phone_is_a_field_error(): void
    {
        $user = $this->makeUser('citizen');

        $this->save($user, ['name' => '   ', 'phone' => ''])->assertUnprocessable()
            ->assertJsonValidationErrors(['name'])
            ->assertJsonPath('errors.name.0', 'Please enter your full name.');

        $this->save($user, ['name' => 'Maria', 'phone' => '12345'])->assertUnprocessable()
            ->assertJsonValidationErrors(['phone']);

        $this->assertSame('Old Name', $user->fresh()->name);
    }

    public function test_an_empty_phone_clears_it_and_role_and_email_cannot_be_changed_here(): void
    {
        $user = $this->makeUser('vet_tech');

        $this->save($user, ['name' => 'Paolo', 'phone' => '', 'role' => 'kennel_manager', 'email' => 'x@y.com'])->assertOk()
            ->assertJsonPath('user.phone', null)
            ->assertJsonPath('user.role', 'vet_tech');

        $fresh = $user->fresh();
        $this->assertNull($fresh->phone);
        $this->assertSame('vet_tech@email.com', $fresh->email);
    }

    public function test_guests_get_401(): void
    {
        $this->patchJson('/api/profile', ['name' => 'X'])->assertUnauthorized();
    }
}

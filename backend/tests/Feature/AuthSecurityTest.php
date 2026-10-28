<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use App\Notifications\PawmilyaResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    private const GOOD = 'Str0ng!Passw0rd';

    private function makeUser(string $role = 'citizen', array $extra = []): User
    {
        $user = new User(['name' => 'Test '.$role, 'email' => $role.'@test.com', 'password' => self::GOOD]);
        $user->role = $role;
        $user->email_verified_at = now();
        foreach ($extra as $key => $value) {
            $user->{$key} = $value;
        }
        $user->save();

        return $user;
    }

    private function payload(array $override = []): array
    {
        return array_merge([
            'first_name' => 'Ana', 'last_name' => 'Cruz', 'email' => 'ana@email.com', 'phone' => '0917 555 0100',
            'password' => self::GOOD, 'password_confirmation' => self::GOOD, 'terms' => true,
        ], $override);
    }

    // ---- Sign up ----

    public function test_weak_passwords_are_rejected(): void
    {
        foreach (['Sh0rt!a', 'alllowercase1!', 'ALLUPPERCASE1!', 'NoNumbersHere!', 'NoSymbols12345'] as $weak) {
            $this->postJson('/api/register', $this->payload(['password' => $weak, 'password_confirmation' => $weak]))
                ->assertUnprocessable()->assertJsonValidationErrors(['password']);
        }
    }

    public function test_password_cannot_equal_the_email_or_name(): void
    {
        $this->postJson('/api/register', $this->payload(['email' => 'Aa1!Aa1!Aa1!@x.com', 'password' => 'Aa1!Aa1!Aa1!@x.com', 'password_confirmation' => 'Aa1!Aa1!Aa1!@x.com']))
            ->assertUnprocessable()->assertJsonValidationErrors(['password']);
    }

    public function test_leaked_password_check_can_be_turned_on(): void
    {
        config(['security.check_leaked_passwords' => true]);
        \Illuminate\Support\Facades\Http::fake(['api.pwnedpasswords.com/*' => \Illuminate\Support\Facades\Http::response(
            substr(strtoupper(sha1(self::GOOD)), 5).":9000\r\n", 200)]);

        $this->postJson('/api/register', $this->payload())->assertUnprocessable()->assertJsonValidationErrors(['password']);
    }

    public function test_register_ignores_role_and_flags_and_cleans_input(): void
    {
        $this->postJson('/api/register', $this->payload([
            'role' => 'kennel_manager', 'is_active' => false, 'is_admin' => true, 'must_change_password' => true,
            'email' => '  ANA@Email.com ', 'first_name' => '  Ana ',
        ]))->assertCreated()->assertJsonMissingPath('token');

        $user = User::where('email', 'ana@email.com')->firstOrFail();
        $this->assertSame('citizen', $user->role);
        $this->assertTrue($user->is_active);
        $this->assertFalse((bool) $user->must_change_password);
        $this->assertSame('Ana Cruz', $user->name);
    }

    public function test_terms_and_philippine_phone_are_required(): void
    {
        $this->postJson('/api/register', $this->payload(['terms' => false, 'phone' => '12345']))
            ->assertUnprocessable()->assertJsonValidationErrors(['terms', 'phone']);
    }

    public function test_register_is_limited_to_five_per_hour_per_ip(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $this->postJson('/api/register', $this->payload(['email' => "ana$i@email.com"]))->assertCreated();
        }
        $this->postJson('/api/register', $this->payload(['email' => 'ana6@email.com']))->assertStatus(429);
    }

    // ---- Login ----

    public function test_sixth_failed_login_in_a_minute_is_429_with_retry_after(): void
    {
        $this->makeUser();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', ['email' => 'citizen@test.com', 'password' => 'wrong'])->assertUnprocessable();
        }

        $this->postJson('/api/login', ['email' => 'citizen@test.com', 'password' => self::GOOD])
            ->assertStatus(429)->assertHeader('Retry-After');
    }

    public function test_error_is_identical_for_unknown_email_wrong_password_and_inactive(): void
    {
        $this->makeUser();
        $this->makeUser('pound_staff', ['is_active' => false]);

        $bodies = [
            $this->postJson('/api/login', ['email' => 'nobody@test.com', 'password' => 'x'])->assertUnprocessable()->json(),
            $this->postJson('/api/login', ['email' => 'citizen@test.com', 'password' => 'wrong'])->assertUnprocessable()->json(),
            $this->postJson('/api/login', ['email' => 'pound_staff@test.com', 'password' => self::GOOD])->assertUnprocessable()->json(),
        ];

        $this->assertSame($bodies[0], $bodies[1]);
        $this->assertSame($bodies[0], $bodies[2]);
        $this->assertSame('Invalid email or password.', $bodies[0]['errors']['email'][0]);

        // The inactive attempt is recorded privately
        $this->assertTrue(AuditLog::where('action', 'auth.login_failed')->get()
            ->contains(fn ($log) => ($log->details['reason'] ?? null) === 'inactive_account'));
    }

    public function test_login_ignores_role_in_the_body_and_logs_the_login(): void
    {
        $this->makeUser();

        $this->postJson('/api/login', ['email' => 'Citizen@Test.com ', 'password' => self::GOOD, 'role' => 'kennel_manager'])
            ->assertOk()->assertJsonPath('user.role', 'citizen');
        $this->assertDatabaseHas('audit_logs', ['action' => 'auth.login']);
    }

    // ---- Tokens ----

    public function test_tokens_expire_and_expired_tokens_are_refused(): void
    {
        $this->makeUser('pound_staff');

        $plain = $this->postJson('/api/login', ['email' => 'pound_staff@test.com', 'password' => self::GOOD])->assertOk()->json('token');
        $expires = User::first()->tokens()->first()->expires_at;
        $this->assertEqualsWithDelta(480, now()->diffInMinutes($expires), 1);

        $this->travel(9)->hours();
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();
        $this->withToken($plain)->getJson('/api/me')->assertUnauthorized();
    }

    public function test_change_password_revokes_all_tokens_and_returns_a_fresh_one(): void
    {
        $user = $this->makeUser();
        $a = $user->createToken('a')->plainTextToken;
        $user->createToken('b');

        $response = $this->withToken($a)->postJson('/api/change-password', [
            'current_password' => self::GOOD, 'password' => 'An0ther!Passw0rd', 'password_confirmation' => 'An0ther!Passw0rd',
        ])->assertOk();

        $this->assertSame(1, $user->tokens()->count());
        $this->assertNotEmpty($response->json('token'));
        $this->assertDatabaseHas('audit_logs', ['action' => 'auth.password_changed']);
    }

    public function test_logout_deletes_the_token_and_is_logged(): void
    {
        $user = $this->makeUser();
        $token = $user->createToken('auth')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertSame(0, $user->tokens()->count());
        $this->assertDatabaseHas('audit_logs', ['action' => 'auth.logout']);
    }

    // ---- Password reset ----

    public function test_forgot_password_answers_the_same_for_unknown_emails(): void
    {
        Notification::fake();
        $this->makeUser();

        $known = $this->postJson('/api/forgot-password', ['email' => 'citizen@test.com'])->assertOk()->json();
        $unknown = $this->postJson('/api/forgot-password', ['email' => 'nobody@test.com'])->assertOk()->json();

        $this->assertSame($known, $unknown);
        Notification::assertSentToTimes(User::first(), PawmilyaResetPassword::class, 1);
    }

    public function test_reset_works_once_and_revokes_tokens(): void
    {
        $user = $this->makeUser();
        $user->createToken('old');
        $token = Password::createToken($user);
        $new = ['token' => $token, 'email' => $user->email, 'password' => 'An0ther!Passw0rd', 'password_confirmation' => 'An0ther!Passw0rd'];

        $this->postJson('/api/reset-password', $new)->assertOk();
        $this->assertSame(0, $user->tokens()->count());
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'An0ther!Passw0rd'])->assertOk();

        // Single use
        $this->postJson('/api/reset-password', $new)->assertUnprocessable();
        $this->assertDatabaseHas('audit_logs', ['action' => 'auth.password_reset']);
    }

    public function test_expired_reset_token_is_rejected(): void
    {
        $user = $this->makeUser();
        $token = Password::createToken($user);

        $this->travel(61)->minutes();

        $this->postJson('/api/reset-password', [
            'token' => $token, 'email' => $user->email, 'password' => 'An0ther!Passw0rd', 'password_confirmation' => 'An0ther!Passw0rd',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email']);
    }

    // ---- Must change password ----

    public function test_temporary_password_blocks_other_endpoints_until_changed(): void
    {
        $staff = $this->makeUser('pound_staff', ['must_change_password' => true]);
        $token = $staff->createToken('auth')->plainTextToken;

        $this->withToken($token)->getJson('/api/animals')->assertForbidden()->assertJsonPath('code', 'password_change_required');
        $this->withToken($token)->getJson('/api/me')->assertOk()->assertJsonPath('user.mustChangePassword', true);

        $fresh = $this->withToken($token)->postJson('/api/change-password', [
            'current_password' => self::GOOD, 'password' => 'An0ther!Passw0rd', 'password_confirmation' => 'An0ther!Passw0rd',
        ])->assertOk()->json('token');

        $this->app['auth']->forgetGuards();
        $this->flushHeaders();
        $this->withToken($fresh)->getJson('/api/animals')->assertOk();
    }

    public function test_staff_account_created_by_the_manager_must_change_password(): void
    {
        $manager = $this->makeUser('kennel_manager');
        $this->actingAs($manager, 'sanctum');

        $this->postJson('/api/users', ['name' => 'New Vet', 'email' => 'v@x.com', 'role' => 'vet_tech', 'password' => 'Temp0rary!Pass'])->assertCreated();
        $this->assertTrue((bool) User::where('email', 'v@x.com')->value('must_change_password'));
    }

    // ---- Headers and regressions ----

    public function test_api_responses_carry_security_headers(): void
    {
        $this->getJson('/api/health')->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')->assertHeader('Referrer-Policy', 'no-referrer');
    }

    public function test_guests_get_401_and_wrong_roles_get_403(): void
    {
        $this->getJson('/api/animals')->assertUnauthorized();
        $this->getJson('/api/users')->assertUnauthorized();

        $token = $this->makeUser('pound_staff')->createToken('auth')->plainTextToken;
        $this->withToken($token)->getJson('/api/users')->assertForbidden();
    }
}

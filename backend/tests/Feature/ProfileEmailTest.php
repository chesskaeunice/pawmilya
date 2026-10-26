<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Profile page: the logged-in user changes their own email
class ProfileEmailTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $email, string $role = 'citizen'): User
    {
        $user = new User(['name' => 'Maria Santos', 'email' => $email, 'phone' => '09171234567', 'password' => 'Str0ng!Passw0rd']);
        $user->role = $role;
        $user->save();

        return $user;
    }

    private function change(User $user, string $email)
    {
        return $this->withToken($user->createToken('t')->plainTextToken)->patchJson('/api/profile/email', ['email' => $email]);
    }

    public function test_the_user_can_change_their_email_and_gets_the_updated_user_back(): void
    {
        $user = $this->makeUser('maria@email.com');

        $this->change($user, '  New.Maria@Email.com ')->assertOk()
            ->assertJsonPath('user.email', 'new.maria@email.com')
            ->assertJsonPath('user.id', $user->id);

        $this->assertSame('new.maria@email.com', $user->fresh()->email);

        // /api/me shows the new email too
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->withToken($user->createToken('t2')->plainTextToken)
            ->getJson('/api/me')->assertOk()->assertJsonPath('user.email', 'new.maria@email.com');

        $log = AuditLog::where('action', 'profile.email_changed')->firstOrFail();
        $this->assertSame($user->id, $log->user_id);
        $this->assertSame('maria@email.com', $log->details['from']);
        $this->assertSame('new.maria@email.com', $log->details['to']);
    }

    public function test_saving_the_same_email_again_is_fine_and_writes_no_audit_entry(): void
    {
        $user = $this->makeUser('maria@email.com');

        $this->change($user, 'MARIA@email.com')->assertOk()->assertJsonPath('user.email', 'maria@email.com');

        $this->assertSame(0, AuditLog::where('action', 'profile.email_changed')->count());
    }

    public function test_an_email_that_belongs_to_someone_else_is_refused(): void
    {
        $this->makeUser('juan@email.com');
        $user = $this->makeUser('maria@email.com');

        $this->change($user, 'Juan@Email.com')->assertUnprocessable()
            ->assertJsonValidationErrors(['email'])
            ->assertJsonPath('errors.email.0', 'This email is already registered.');

        $this->assertSame('maria@email.com', $user->fresh()->email);
    }

    public function test_an_invalid_email_is_refused(): void
    {
        $user = $this->makeUser('maria@email.com');

        foreach (['', 'not-an-email', 'a@', str_repeat('a', 250).'@x.com'] as $bad) {
            $this->change($user, $bad)->assertUnprocessable()->assertJsonValidationErrors(['email']);
            $this->flushHeaders();
        }

        $this->assertSame('maria@email.com', $user->fresh()->email);
    }

    public function test_guests_get_401(): void
    {
        $this->patchJson('/api/profile/email', ['email' => 'x@email.com'])->assertUnauthorized();
    }
}

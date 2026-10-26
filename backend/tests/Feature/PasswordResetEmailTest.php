<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\PawmilyaResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

// The Forgot Password email: branded, React reset link, 60 minutes, same answer for everyone
class PasswordResetEmailTest extends TestCase
{
    use RefreshDatabase;

    private function citizen(): User
    {
        $user = new User(['name' => 'Maria Santos', 'email' => 'maria@test.com', 'password' => 'Str0ng!Passw0rd']);
        $user->role = 'citizen';
        $user->save();

        return $user;
    }

    public function test_email_is_sent_only_to_an_existing_account(): void
    {
        Notification::fake();
        $user = $this->citizen();

        $this->postJson('/api/forgot-password', ['email' => 'maria@test.com'])->assertOk();
        $this->postJson('/api/forgot-password', ['email' => 'nobody@test.com'])->assertOk();

        Notification::assertSentTo($user, PawmilyaResetPassword::class);
        Notification::assertCount(1);
    }

    public function test_email_has_the_pawmilya_wording_react_link_and_60_minutes(): void
    {
        config(['app.name' => 'PAWmilya']);
        Notification::fake();
        $user = $this->citizen();

        $this->postJson('/api/forgot-password', ['email' => 'maria@test.com'])->assertOk();

        Notification::assertSentTo($user, PawmilyaResetPassword::class, function (PawmilyaResetPassword $notification) use ($user) {
            $mail = $notification->toMail($user);
            $html = (string) $mail->render();

            $this->assertSame('PAWmilya: Password Reset Request', $mail->subject);
            $this->assertStringContainsString('PAWmilya', $html);
            $this->assertStringContainsString('Hello Maria Santos', $html);
            $this->assertStringContainsString('valid for 60 minutes', $html);

            // the link opens the React page, not a Laravel route
            $expected = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/')
                .'/reset-password?token='.$notification->token.'&amp;email='.urlencode($user->email);
            $this->assertStringContainsString($expected, $html);

            return true;
        });
    }

    public function test_the_link_in_the_email_resets_the_password_once(): void
    {
        Notification::fake();
        $user = $this->citizen();
        $this->postJson('/api/forgot-password', ['email' => 'maria@test.com'])->assertOk();

        $token = null;
        Notification::assertSentTo($user, PawmilyaResetPassword::class, function ($notification) use (&$token) {
            $token = $notification->token;

            return true;
        });

        $new = ['token' => $token, 'email' => 'maria@test.com', 'password' => 'An0ther!Passw0rd', 'password_confirmation' => 'An0ther!Passw0rd'];

        $this->postJson('/api/reset-password', $new)->assertOk();
        $this->postJson('/api/reset-password', $new)->assertUnprocessable();
        $this->assertDatabaseHas('audit_logs', ['action' => 'auth.password_reset']);
    }

    public function test_a_broken_mail_server_gives_the_same_answer(): void
    {
        $this->citizen();
        $unknown = $this->postJson('/api/forgot-password', ['email' => 'nobody@test.com'])->assertOk()->json();

        // an SMTP server that refuses the connection
        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => '127.0.0.1',
            'mail.mailers.smtp.port' => 1,
        ]);

        $known = $this->postJson('/api/forgot-password', ['email' => 'maria@test.com'])->assertOk()->json();

        $this->assertSame($unknown, $known);
    }

    public function test_forgot_password_is_throttled(): void
    {
        Notification::fake();

        foreach (range(1, 5) as $ignored) {
            $this->postJson('/api/forgot-password', ['email' => 'nobody@test.com'])->assertOk();
        }

        $this->postJson('/api/forgot-password', ['email' => 'nobody@test.com'])->assertStatus(429);
    }
}

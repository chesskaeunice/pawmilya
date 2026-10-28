<?php

namespace Tests\Feature;

use App\Mail\VerifyEmailOtp;
use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailOtpTest extends TestCase
{
    use RefreshDatabase;

    private function register(array $override = []): void
    {
        $this->postJson('/api/register', array_merge([
            'first_name' => 'Ana', 'last_name' => 'Cruz', 'email' => 'ana@email.com', 'phone' => '09171234567',
            'password' => 'Str0ng!Passw0rd', 'password_confirmation' => 'Str0ng!Passw0rd', 'terms' => true,
        ], $override))->assertCreated();
    }

    // The plain code only exists in the sent email
    private function sentCode(): string
    {
        $code = null;
        Mail::assertSent(VerifyEmailOtp::class, function (VerifyEmailOtp $mail) use (&$code) {
            $code = $mail->code;

            return true;
        });

        return $code;
    }

    public function test_sign_up_sends_a_hashed_code_that_expires_in_ten_minutes(): void
    {
        Mail::fake();
        $this->register();

        $code = $this->sentCode();
        $this->assertMatchesRegularExpression('/^\d{6}$/', $code);
        Mail::assertSent(VerifyEmailOtp::class, fn ($mail) => $mail->hasTo('ana@email.com'));

        $otp = EmailOtp::firstOrFail();
        $this->assertNotSame($code, $otp->code_hash);
        $this->assertTrue(Hash::check($code, $otp->code_hash));
        $this->assertEqualsWithDelta(10, now()->diffInMinutes($otp->expires_at), 1);
    }

    public function test_an_unverified_user_cannot_log_in_and_a_verified_one_can(): void
    {
        Mail::fake();
        $this->register();

        $this->postJson('/api/login', ['email' => 'ana@email.com', 'password' => 'Str0ng!Passw0rd'])
            ->assertForbidden()->assertJsonPath('code', 'email_not_verified')->assertJsonMissingPath('token');

        $this->postJson('/api/email/otp/verify', ['email' => 'ana@email.com', 'code' => $this->sentCode()])
            ->assertOk()->assertJsonStructure(['token'])->assertJsonPath('user.role', 'citizen');

        $this->postJson('/api/login', ['email' => 'ana@email.com', 'password' => 'Str0ng!Passw0rd'])
            ->assertOk()->assertJsonStructure(['token']);
    }

    public function test_a_code_works_once(): void
    {
        Mail::fake();
        $this->register();
        $code = $this->sentCode();

        $this->postJson('/api/email/otp/verify', ['email' => 'ana@email.com', 'code' => $code])->assertOk();
        $this->postJson('/api/email/otp/verify', ['email' => 'ana@email.com', 'code' => $code])
            ->assertUnprocessable()->assertJsonValidationErrors('code');
    }

    public function test_a_wrong_code_is_refused_and_five_wrong_tries_invalidate_the_code(): void
    {
        Mail::fake();
        $this->register();
        $code = $this->sentCode();
        $wrong = $code === '000000' ? '111111' : '000000';

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/email/otp/verify', ['email' => 'ana@email.com', 'code' => $wrong])
                ->assertUnprocessable()->assertJsonValidationErrors('code');
        }

        // even the right code no longer works
        $this->postJson('/api/email/otp/verify', ['email' => 'ana@email.com', 'code' => $code])->assertUnprocessable();
        $this->assertNull(User::where('email', 'ana@email.com')->value('email_verified_at'));
    }

    public function test_an_expired_code_is_refused(): void
    {
        Mail::fake();
        $this->register();
        $code = $this->sentCode();

        $this->travel(11)->minutes();

        $this->postJson('/api/email/otp/verify', ['email' => 'ana@email.com', 'code' => $code])
            ->assertUnprocessable()->assertJsonValidationErrors('code');
    }

    public function test_resend_waits_a_minute_and_is_limited_to_three_an_hour(): void
    {
        Mail::fake();
        $this->register(); // send 1

        // inside the 60 second cooldown: the answer is the same but no new email
        $this->postJson('/api/email/otp/resend', ['email' => 'ana@email.com'])->assertOk();
        Mail::assertSent(VerifyEmailOtp::class, 1);

        $this->travel(61)->seconds();
        $this->postJson('/api/email/otp/resend', ['email' => 'ana@email.com'])->assertOk(); // send 2
        $this->travel(61)->seconds();
        $this->postJson('/api/email/otp/resend', ['email' => 'ana@email.com'])->assertOk(); // send 3
        $this->travel(61)->seconds();
        $this->postJson('/api/email/otp/resend', ['email' => 'ana@email.com'])->assertOk(); // over the limit
        Mail::assertSent(VerifyEmailOtp::class, 3);
    }

    public function test_resend_gives_the_same_answer_for_unknown_and_verified_emails(): void
    {
        Mail::fake();
        $verified = new User(['name' => 'Done', 'email' => 'done@email.com', 'password' => 'Str0ng!Passw0rd']);
        $verified->role = 'citizen';
        $verified->email_verified_at = now();
        $verified->save();

        $a = $this->postJson('/api/email/otp/resend', ['email' => 'nobody@email.com'])->assertOk()->json();
        $b = $this->postJson('/api/email/otp/resend', ['email' => 'done@email.com'])->assertOk()->json();

        $this->assertSame($a, $b);
        Mail::assertNothingSent();
    }

    public function test_staff_created_by_the_kennel_manager_are_verified(): void
    {
        $manager = new User(['name' => 'Boss', 'email' => 'boss@test.com', 'password' => 'Str0ng!Passw0rd']);
        $manager->role = 'kennel_manager';
        $manager->email_verified_at = now();
        $manager->save();

        $this->withToken($manager->createToken('t')->plainTextToken)
            ->postJson('/api/users', ['name' => 'New Vet', 'email' => 'newvet@test.com', 'role' => 'vet_tech', 'password' => 'Str0ng!Passw0rd#1'])
            ->assertCreated();

        $this->assertNotNull(User::where('email', 'newvet@test.com')->value('email_verified_at'));
    }
}

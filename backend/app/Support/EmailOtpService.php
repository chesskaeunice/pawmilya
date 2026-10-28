<?php

namespace App\Support;

use App\Mail\VerifyEmailOtp;
use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

// Sign-up email codes: 6 digits, stored as a hash, valid 10 minutes, single use,
// 5 wrong tries, a new one at most every 60 seconds and 3 per hour per account.
class EmailOtpService
{
    public const MINUTES = 10;
    public const MAX_ATTEMPTS = 5;
    public const COOLDOWN_SECONDS = 60;
    public const SENDS_PER_HOUR = 3;

    // Creates a new code and emails it. Returns false when the cooldown or the hourly limit says wait.
    public function send(User $user): bool
    {
        $key = 'email-otp-send:'.$user->id;
        $current = EmailOtp::where('user_id', $user->id)->first();

        if ($current && $current->sent_at->gt(now()->subSeconds(self::COOLDOWN_SECONDS))) {
            return false;
        }

        if (RateLimiter::tooManyAttempts($key, self::SENDS_PER_HOUR)) {
            return false;
        }
        RateLimiter::hit($key, 3600);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        EmailOtp::updateOrCreate(['user_id' => $user->id], [
            'code_hash' => Hash::make($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::MINUTES),
            'sent_at' => now(),
        ]);

        SafeMail::send($user->email, new VerifyEmailOtp($user->name, $code, self::MINUTES));

        return true;
    }

    // True once, with the right code before it expires; the account is then verified.
    public function verify(User $user, string $code): bool
    {
        $otp = EmailOtp::where('user_id', $user->id)->first();

        if (! $otp || $otp->expires_at->isPast()) {
            $otp?->delete();

            return false;
        }

        if (! Hash::check($code, $otp->code_hash)) {
            $otp->increment('attempts');

            if ($otp->attempts >= self::MAX_ATTEMPTS) {
                $otp->delete(); // too many wrong tries: a new code is needed
            }

            return false;
        }

        $otp->delete();
        $user->forceFill(['email_verified_at' => now()])->save();

        return true;
    }
}

<?php

namespace App\Support;

use Illuminate\Validation\Rules\Password;

// One place for the password policy (sign up, reset, change, staff accounts)
class PasswordRules
{
    /** @param  callable(): array  $identity  returns [email, name] the password must not match */
    public static function make(?callable $identity = null): array
    {
        $password = Password::min(10)->mixedCase()->numbers()->symbols();

        if (config('security.check_leaked_passwords')) {
            $password->uncompromised();
        }

        return [
            'required',
            'string',
            $password,
            function (string $attribute, mixed $value, \Closure $fail) use ($identity) {
                foreach ($identity ? $identity() : [] as $part) {
                    if ($part && strcasecmp(trim((string) $part), (string) $value) === 0) {
                        $fail('The password cannot be the same as your email or name.');
                    }
                }
            },
        ];
    }
}

<?php

return [

    // Reject passwords found in known data leaks (calls haveibeenpwned; needs internet).
    'check_leaked_passwords' => env('PASSWORD_CHECK_LEAKED', false),

    // Token lifetime in minutes (Sanctum deletes nothing; expired tokens are just refused).
    'token_ttl' => [
        'staff' => (int) env('TOKEN_TTL_STAFF', 480),      // 8 hours
        'citizen' => (int) env('TOKEN_TTL_CITIZEN', 10080), // 7 days
    ],

    // Login throttling: per email+IP per minute, per IP per minute, and a longer lockout.
    'login' => [
        'per_minute' => 5,
        'per_ip_minute' => 20,
        'lockout_failures' => 10,
        'lockout_seconds' => 900,
    ],

];

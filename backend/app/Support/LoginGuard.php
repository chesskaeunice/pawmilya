<?php

namespace App\Support;

use Illuminate\Support\Facades\RateLimiter;

// Login throttling: 5 tries/min per email+IP, 20/min per IP, 15 min lockout after 10 failures.
class LoginGuard
{
    public function __construct(private string $email, private string $ip) {}

    private function keys(): array
    {
        $pair = strtolower($this->email).'|'.$this->ip;

        return ['minute' => "login:min:$pair", 'ip' => "login:ip:{$this->ip}", 'lock' => "login:lock:$pair"];
    }

    /** Seconds to wait, or 0 when the attempt may go ahead. */
    public function retryAfter(): int
    {
        $k = $this->keys();
        $cfg = config('security.login');

        $waits = [0];
        if (RateLimiter::tooManyAttempts($k['lock'], $cfg['lockout_failures'])) {
            $waits[] = RateLimiter::availableIn($k['lock']);
        }
        if (RateLimiter::tooManyAttempts($k['minute'], $cfg['per_minute'])) {
            $waits[] = RateLimiter::availableIn($k['minute']);
        }
        if (RateLimiter::tooManyAttempts($k['ip'], $cfg['per_ip_minute'])) {
            $waits[] = RateLimiter::availableIn($k['ip']);
        }

        return max($waits);
    }

    public function fail(): void
    {
        $k = $this->keys();
        RateLimiter::hit($k['minute'], 60);
        RateLimiter::hit($k['ip'], 60);
        RateLimiter::hit($k['lock'], config('security.login.lockout_seconds'));
    }

    public function clear(): void
    {
        $k = $this->keys();
        RateLimiter::clear($k['minute']);
        RateLimiter::clear($k['lock']);
    }
}

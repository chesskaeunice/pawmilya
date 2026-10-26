<?php

namespace App\Support;

use App\Models\MissingPetReport;
use App\Models\User;
use Illuminate\Http\Exceptions\HttpResponseException;

// Rolling limit on how many missing pet reports one logged-in citizen can file (config/missing_pets.php).
// Guests and staff accounts are never limited.
class ReportPostingLimit
{
    // Throws a 429 response when the user is at the limit; call it before anything is validated or saved
    public function ensureWithinLimit(?User $user): void
    {
        $wait = $this->secondsUntilAllowed($user);

        if ($wait === null) {
            return;
        }

        $limit = (int) config('missing_pets.user_report_limit');
        $hours = (int) config('missing_pets.window_hours');

        throw new HttpResponseException(response()->json([
            'message' => "You have reached the limit of {$limit} reports per {$hours} hours. You can report again in {$this->waitText($wait)}.",
            'limit_reached' => true,
            'retry_after' => $wait,
        ], 429, ['Retry-After' => $wait]));
    }

    // null = may report; otherwise how many seconds until the oldest report that blocks them leaves the window
    public function secondsUntilAllowed(?User $user): ?int
    {
        if (! $user || $user->role !== 'citizen') {
            return null;
        }

        $limit = (int) config('missing_pets.user_report_limit');
        $window = (int) config('missing_pets.window_hours');

        $times = MissingPetReport::where('reporter_id', $user->id)
            ->where('created_at', '>', now()->subHours($window))
            ->orderBy('created_at')
            ->pluck('created_at');

        if ($times->count() < $limit) {
            return null;
        }

        // the report that must leave the window before the count drops below the limit
        $blocking = $times[$times->count() - $limit];

        return max(1, (int) now()->diffInSeconds($blocking->copy()->addHours($window), false));
    }

    // "5 hours 12 minutes", "1 hour", "12 minutes" (rounded up to the minute)
    private function waitText(int $seconds): string
    {
        $minutes = max(1, (int) ceil($seconds / 60));
        $h = intdiv($minutes, 60);
        $m = $minutes % 60;

        $parts = [];
        if ($h > 0) {
            $parts[] = $h.' '.($h === 1 ? 'hour' : 'hours');
        }
        if ($m > 0) {
            $parts[] = $m.' '.($m === 1 ? 'minute' : 'minutes');
        }

        return implode(' ', $parts);
    }
}

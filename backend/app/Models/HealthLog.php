<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthLog extends Model
{
    protected $fillable = [
        'animal_id', 'vaccine', 'administered_at', 'next_due_date', 'notes', 'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'administered_at' => 'date:Y-m-d',
            'next_due_date' => 'date:Y-m-d',
        ];
    }

    // Next due date when none is given: date given + the vaccine's interval
    public static function defaultNextDue(string $vaccine, Carbon|string $given): Carbon
    {
        $days = config("vaccines.intervals.{$vaccine}", config('vaccines.default_interval_days'));

        return Carbon::parse($given)->startOfDay()->addDays($days);
    }

    // Up to date / Due Soon / Overdue
    public function status(): string
    {
        if (! $this->next_due_date) {
            return 'Up to date';
        }

        $today = now()->startOfDay();

        if ($this->next_due_date->lt($today)) {
            return 'Overdue';
        }

        return $this->next_due_date->lte($today->copy()->addDays(config('vaccines.due_soon_days'))) ? 'Due Soon' : 'Up to date';
    }

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}

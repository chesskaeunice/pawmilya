<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shift extends Model
{
    protected $fillable = ['name', 'start_time', 'end_time', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    // End time earlier than start time means the shift ends the next day
    public function isOvernight(): bool
    {
        return $this->end_time < $this->start_time;
    }

    public function staffShifts(): HasMany
    {
        return $this->hasMany(StaffShift::class);
    }
}

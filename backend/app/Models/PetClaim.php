<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// An owner's claim on a Rescued pet (proof images are private files, see PetClaimPhoto)
class PetClaim extends Model
{
    public const PENDING = 'Pending';
    public const APPROVED = 'Approved';
    public const REJECTED = 'Rejected';

    // status, claimant and the decision are set by the code, never mass assigned from a request
    protected $fillable = ['contact_name', 'contact_number', 'contact_email', 'pickup_date'];

    protected function casts(): array
    {
        return ['pickup_date' => 'date', 'decided_at' => 'datetime'];
    }

    public function scopeLive(Builder $query): Builder
    {
        return $query->whereIn('status', [self::PENDING, self::APPROVED]);
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(MissingPetReport::class, 'missing_pet_report_id');
    }

    public function claimant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimant_id');
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(PetClaimPhoto::class)->orderBy('position');
    }
}

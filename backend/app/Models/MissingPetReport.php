<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MissingPetReport extends Model
{
    public const STATUSES = ['Lost', 'Rescued', 'For Adoption', 'Reunited'];
    // What staff can set by hand: "For Adoption" is set by the system after the claim period
    public const MANUAL_STATUSES = ['Lost', 'Rescued', 'Reunited'];
    // The status a new report starts with is decided by who files it: a concerned citizen hands the
    // pet to the pound (Rescued); an owner reports a missing pet (Lost)
    public const FILING_STATUS_BY_REPORTER_TYPE = ['Owner' => 'Lost', 'Citizen' => 'Rescued'];
    public const FILING_STATUSES = ['Lost', 'Rescued'];

    // Once its animal is on Adoptable Pets (or later), the report leaves the PUBLIC Missing Pets page
    public const HIDDEN_ANIMAL_STATUSES = ['Available for Adoption', 'Pending Adoption', 'Adopted'];

    // How long the owner can claim a Rescued pet
    public const CLAIM_DAYS = 7;

    // "I am the" on the report forms: the pet's owner or a concerned citizen
    public const REPORTER_TYPES = ['Owner', 'Citizen'];

    // status is set by the filing flow / staff, never mass assigned from a form
    protected $fillable = [
        'reporter_id', 'contact_name', 'contact_number', 'contact_email', 'name', 'species', 'other_species',
        'breed', 'sex', 'color', 'markings', 'location', 'last_seen_at', 'details', 'reporter_type',
    ];

    protected function casts(): array
    {
        return ['last_seen_at' => 'datetime', 'claim_deadline_at' => 'datetime'];
    }

    public static function filingStatusFor(string $reporterType): string
    {
        return self::FILING_STATUS_BY_REPORTER_TYPE[$reporterType];
    }

    // Identifies "the same report": reporter + pet + place + day. Used for the duplicate check.
    public static function makeFingerprint(string $reporterKey, string $species, ?string $name, string $location, string $lastSeenDate): string
    {
        $parts = [$reporterKey, $species, mb_strtolower(trim((string) $name)), mb_strtolower(trim($location)), $lastSeenDate];

        return sha1(implode('|', $parts));
    }

    // Guests are told apart by phone number (digits only), citizens by account
    public static function reporterKey(?User $user, ?string $phone): string
    {
        return $user ? 'user:'.$user->id : 'guest:'.preg_replace('/\D/', '', (string) $phone);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    // Owners' claims on this (Rescued) pet
    public function claims(): HasMany
    {
        return $this->hasMany(PetClaim::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(MissingPetPhoto::class)->orderBy('position');
    }

    // The animal registered in the pound from this (Rescued) report, if any
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    // Reports shown on the public Missing Pets page: not those whose animal is already adoptable.
    // Only the public list and details use it; the report's own status never changes.
    public function scopeVisibleToPublic(Builder $query): Builder
    {
        return $query->whereDoesntHave('animal', fn ($animal) => $animal->whereIn('status', self::HIDDEN_ANIMAL_STATUSES));
    }

    // True while a Rescued pet can still be claimed by its owner
    public function inClaimPeriod(): bool
    {
        return $this->status === 'Rescued' && $this->claim_deadline_at !== null && $this->claim_deadline_at->isFuture();
    }

    // Sets the claim deadline (7 days from now, Asia/Manila) the first time the report is Rescued; never changes it later
    public function startClaimPeriod(): void
    {
        if (! $this->claim_deadline_at) {
            $this->claim_deadline_at = now()->addDays(self::CLAIM_DAYS);
        }
    }

    // Name of what the animal is: "Rabbit" for Other + other_species
    public function typeLabel(): string
    {
        return $this->species === 'Other' ? ($this->other_species ?: 'Other') : $this->species;
    }
}

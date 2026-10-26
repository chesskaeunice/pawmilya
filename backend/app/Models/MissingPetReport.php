<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MissingPetReport extends Model
{
    public const STATUSES = ['Lost', 'Sighted', 'Found', 'Reunited'];
    // What a reporter can choose when filing (Reunited is set later)
    public const FILING_STATUSES = ['Lost', 'Sighted', 'Found'];

    // "I am the" on the report forms: the pet's owner or a concerned citizen
    public const REPORTER_TYPES = ['Owner', 'Citizen'];

    // status is set by the filing flow / staff, never mass assigned from a form
    protected $fillable = [
        'reporter_id', 'contact_name', 'contact_number', 'contact_email', 'name', 'species', 'other_species',
        'breed', 'sex', 'color', 'markings', 'location', 'last_seen_at', 'details', 'reporter_type',
    ];

    protected function casts(): array
    {
        return ['last_seen_at' => 'datetime'];
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

    public function photos(): HasMany
    {
        return $this->hasMany(MissingPetPhoto::class)->orderBy('position');
    }

    // The animal registered in the pound from this (Found) report, if any
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    // Name of what the animal is: "Rabbit" for Other + other_species
    public function typeLabel(): string
    {
        return $this->species === 'Other' ? ($this->other_species ?: 'Other') : $this->species;
    }
}

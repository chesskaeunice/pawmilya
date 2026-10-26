<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Animal extends Model
{
    public const ADOPTABLE = 'Available for Adoption';
    public const CLEARED = 'Cleared';

    public const STATUSES = ['Rescued', 'Available for Adoption', 'Pending Adoption', 'Adopted', 'Reunited with Owner'];
    public const HEALTH_STATUSES = ['Under Observation', 'Under Treatment', 'Cleared'];

    // Age groups used by the public filter (in months)
    public const AGE_GROUPS = [
        'baby' => [0, 11],
        'young' => [12, 35],
        'adult' => [36, null],
    ];

    // Same as the column defaults, so a freshly created model returns them too
    protected $attributes = [
        'vaccinated' => false,
        'neutered' => false,
    ];

    protected $fillable = [
        'animal_code', 'name', 'species', 'other_species', 'breed', 'sex', 'age_months', 'color', 'location',
        'status', 'health_status', 'personality', 'vaccinated', 'neutered', 'description', 'ideal_home',
        'rescued_at', 'owner_name', 'owner_contact', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'age_months' => 'integer',
            'personality' => 'array',
            'vaccinated' => 'boolean',
            'neutered' => 'boolean',
            'rescued_at' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Animal $animal) {
            $animal->qr_token ??= (string) Str::uuid();
            // Temporary code, replaced by PAW-0001 style once the id exists
            $animal->animal_code ??= 'TMP-'.Str::random(12);
        });

        static::created(function (Animal $animal) {
            if (str_starts_with($animal->animal_code, 'TMP-')) {
                $animal->forceFill(['animal_code' => sprintf('PAW-%04d', $animal->id)])->saveQuietly();
            }
        });
    }

    // The Found missing pet report this animal was registered from, if any
    public function missingPetReport(): HasOne
    {
        return $this->hasOne(MissingPetReport::class);
    }

    public function healthLogs(): HasMany
    {
        return $this->hasMany(HealthLog::class);
    }

    // The vaccination records of this animal (the health_logs table)
    public function vaccinations(): HasMany
    {
        return $this->healthLogs();
    }

    public function adoptionApplications(): HasMany
    {
        return $this->hasMany(AdoptionApplication::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(AnimalPhoto::class)->orderBy('position');
    }

    // "Vaccinated" = has at least one record that is not overdue (kept in step with the health logs)
    public function refreshVaccinated(): void
    {
        $current = $this->healthLogs()
            ->where(fn ($q) => $q->whereNull('next_due_date')->orWhere('next_due_date', '>=', now()->toDateString()))
            ->exists();

        $this->forceFill(['vaccinated' => $current])->saveQuietly();
    }

    public function scopeAdoptable(Builder $query): Builder
    {
        return $query->where('status', self::ADOPTABLE);
    }

    // "3 years old" / "8 months old"
    public function ageLabel(): ?string
    {
        if ($this->age_months === null) {
            return null;
        }

        if ($this->age_months < 12) {
            return $this->age_months.' '.Str::plural('month', $this->age_months).' old';
        }

        $years = intdiv($this->age_months, 12);

        return $years.' '.Str::plural('year', $years).' old';
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// A vaccine staff can pick when recording a vaccination. species: Dog, Cat or All.
class Vaccine extends Model
{
    protected $fillable = ['name', 'species', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    // The vaccines that fit an animal of this species (Anti-rabies is "All")
    public function scopeForSpecies(Builder $query, string $species): Builder
    {
        return $query->whereIn('species', [$species, 'All']);
    }

    public function fitsSpecies(string $species): bool
    {
        return in_array($this->species, [$species, 'All'], true);
    }

    public function vaccinations(): HasMany
    {
        return $this->hasMany(HealthLog::class);
    }

    // What to store on a record: the vaccine from the table, or a typed name ("Others").
    // Returns [vaccine_id, other_vaccine_name, vaccine (the name shown)].
    public static function resolve(?int $vaccineId, ?string $otherName): array
    {
        if ($vaccineId) {
            return [$vaccineId, null, static::findOrFail($vaccineId)->name];
        }

        $name = trim((string) $otherName);

        return [null, $name, $name];
    }
}

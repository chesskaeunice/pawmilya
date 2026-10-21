<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdoptionApplication extends Model
{
    public const PENDING = 'Pending';
    public const APPROVED = 'Approved';
    public const REJECTED = 'Rejected';

    // status and reviewed_* are set by the review flow, not by the citizen form
    protected $fillable = [
        'user_id', 'animal_id',
        'first_name', 'last_name', 'address', 'phone', 'email', 'birth_date',
        'employment_status', 'work', 'self_employed_field', 'self_employed_field_other',
        'social_media', 'civil_status', 'pronouns', 'referral_source', 'adopted_before',
        'residence', 'household_members', 'has_pets', 'pet_count', 'pet_experience',
        'valid_id_path', 'home_photo_paths', 'why_adopt', 'how_care', 'terms_accepted',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'adopted_before' => 'boolean',
            'has_pets' => 'boolean',
            'terms_accepted' => 'boolean',
            'home_photo_paths' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }

    // Pending or Approved: the applications that block a new one for the same animal
    public function scopeLive(Builder $query): Builder
    {
        return $query->whereIn('status', [self::PENDING, self::APPROVED]);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}

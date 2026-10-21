<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_CITIZEN = 'citizen';
    public const ROLE_POUND_STAFF = 'pound_staff';
    public const ROLE_VET_TECH = 'vet_tech';
    public const ROLE_ADOPTION_COUNSELOR = 'adoption_counselor';
    public const ROLE_KENNEL_MANAGER = 'kennel_manager';

    // Staff who go on the shift schedule (the kennel manager only manages it)
    public const SCHEDULED_ROLES = [
        self::ROLE_POUND_STAFF,
        self::ROLE_VET_TECH,
        self::ROLE_ADOPTION_COUNSELOR,
    ];

    // role is not mass assignable: set it explicitly (seeders, admin user management)
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isStaff(): bool
    {
        return $this->role !== self::ROLE_CITIZEN;
    }

    // Role permissions live in config/permissions.php
    public function hasPermission(string $permission): bool
    {
        return in_array($permission, config("permissions.{$this->role}", []), true);
    }

    public function adoptionApplications(): HasMany
    {
        return $this->hasMany(AdoptionApplication::class);
    }

    public function staffShifts(): HasMany
    {
        return $this->hasMany(StaffShift::class);
    }
}

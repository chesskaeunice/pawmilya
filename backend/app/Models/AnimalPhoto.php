<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class AnimalPhoto extends Model
{
    protected $fillable = ['animal_id', 'path', 'position'];

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function url(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}

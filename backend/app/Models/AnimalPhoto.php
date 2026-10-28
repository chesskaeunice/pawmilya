<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Support\PublicFile;

class AnimalPhoto extends Model
{
    protected $fillable = ['animal_id', 'path', 'position'];

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function url(): string
    {
        return PublicFile::url($this->path, 's3');
    }
}

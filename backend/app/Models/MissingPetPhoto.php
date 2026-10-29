<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Support\PublicFile;

class MissingPetPhoto extends Model
{
    protected $fillable = ['missing_pet_report_id', 'path', 'kind', 'position'];

    public function report(): BelongsTo
    {
        return $this->belongsTo(MissingPetReport::class, 'missing_pet_report_id');
    }

    public function url(): string
    {
        return PublicFile::url($this->path, 's3');
    }
}

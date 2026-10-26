<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Proof of ownership image: a PRIVATE file (storage/app/private), only reachable by a signed, expiring link
class PetClaimPhoto extends Model
{
    protected $fillable = ['pet_claim_id', 'path', 'position'];

    public function claim(): BelongsTo
    {
        return $this->belongsTo(PetClaim::class, 'pet_claim_id');
    }
}

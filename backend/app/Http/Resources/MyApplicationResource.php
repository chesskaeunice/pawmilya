<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// What a citizen sees about their own applications (no personal documents)
class MyApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $animal = $this->animal;

        return [
            'id' => $this->id,
            'petId' => $animal->id,
            'petName' => $animal->name,
            'type' => $animal->species,
            'breed' => $animal->breed,
            'image' => $animal->photos->first()?->url(),
            'date' => $this->created_at->format('M j, Y'),
            'status' => $this->status,
            'rejectionReason' => $this->rejection_reason ?? '',
        ];
    }
}

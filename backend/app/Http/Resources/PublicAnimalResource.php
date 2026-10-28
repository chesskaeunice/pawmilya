<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Citizen / guest view. Never includes health_status, owner info or the animal code.
class PublicAnimalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $photos = $this->photos->map->url()->values();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->species,
            'breed' => $this->breed,
            'sex' => $this->sex,
            'location' => $this->location,
            'status' => $this->status,
            'personality' => $this->personality ?? [],
            'vaccinated' => $this->vaccinated,
            'neutered' => $this->neutered,
            'description' => $this->description,
            'ideal_home' => $this->ideal_home,
            'dateAdded' => $this->rescued_at?->toDateString(),
            'image' => $photos->first(),
            'images' => $photos,
        ];
    }
}

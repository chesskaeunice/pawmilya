<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Staff view of an animal. Key names (type, sex, ageLabel, dateAdded) match what the UI already uses.
class AnimalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $photos = $this->photos->map->url()->values();

        return [
            'id' => $this->id,
            'animal_code' => $this->animal_code,
            'name' => $this->name,
            'type' => $this->species,
            // what an animal of type Other is ("Rabbit"), when known
            'other_species' => $this->other_species,
            'breed' => $this->breed,
            'sex' => $this->sex,
            'age_months' => $this->age_months,
            'ageLabel' => $this->ageLabel(),
            'color' => $this->color,
            'location' => $this->location,
            'status' => $this->status,
            'health_status' => $this->health_status,
            'personality' => $this->personality ?? [],
            'vaccinated' => $this->vaccinated,
            'neutered' => $this->neutered,
            'description' => $this->description,
            'ideal_home' => $this->ideal_home,
            'dateAdded' => $this->rescued_at?->toDateString(),
            'owner_name' => $this->owner_name,
            'owner_contact' => $this->owner_contact,
            // set while the pet can still be claimed (animals registered from a Rescued report)
            'claimDeadlineAt' => $this->missingPetReport?->inClaimPeriod() ? $this->missingPetReport->claim_deadline_at->toIso8601String() : null,
            // set once the claim period ended and the report is For Adoption (waiting for the vet's clearance)
            'claimEndedAt' => $this->missingPetReport?->status === 'For Adoption' ? $this->missingPetReport->claim_deadline_at?->toIso8601String() : null,
            'image' => $photos->first(),
            'images' => $photos,
            // with ids, so staff can remove one
            'photos' => $this->photos->map(fn ($photo) => ['id' => $photo->id, 'url' => $photo->url()])->values(),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// One health log row, in the shape the Vaccinations page already uses
class VaccinationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'petId' => $this->animal_id,
            'petCode' => $this->animal->animal_code,
            'petBreed' => $this->animal->breed,
            'petName' => $this->animal->name ?: $this->animal->animal_code,
            'petType' => $this->animal->species,
            // the vaccines table name, or the typed one ("Others")
            'vaccine' => $this->vaccineName(),
            'vaccineId' => $this->vaccine_id,
            'otherVaccineName' => $this->other_vaccine_name,
            'date' => $this->administered_at->toDateString(),
            'nextDue' => $this->next_due_date?->toDateString(),
            'status' => $this->status(),
            'notes' => $this->notes,
            // staff member who recorded it (null when that account was deleted)
            'givenBy' => $this->recorder?->name,
        ];
    }
}

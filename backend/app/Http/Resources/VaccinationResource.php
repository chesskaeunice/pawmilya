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
            'petName' => $this->animal->name ?: $this->animal->animal_code,
            'petType' => $this->animal->species,
            'vaccine' => $this->vaccine,
            'date' => $this->administered_at->toDateString(),
            'nextDue' => $this->next_due_date?->toDateString(),
            'status' => $this->status(),
            'notes' => $this->notes,
        ];
    }
}

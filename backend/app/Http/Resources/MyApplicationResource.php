<?php

namespace App\Http\Resources;

use App\Models\AdoptionApplication;
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
            // only the status of the check: never the ID file or any personal document
            'idVerificationStatus' => $this->id_verification_status,
            // the day it was approved (null while Pending or Rejected), same format as 'date'
            'approvedAt' => $this->status === AdoptionApplication::APPROVED ? $this->reviewed_at?->format('M j, Y') : null,
            // the citizen's OWN phone number from their application (the pound calls it for the pick-up)
            'phone' => $this->phone,
            'rejectionReason' => $this->rejection_reason ?? '',
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

// Staff view: the public data plus who reported it and how to reach them
class StaffMissingPetResource extends MissingPetResource
{
    public function toArray(Request $request): array
    {
        $reporter = $this->reporter;

        return array_merge(parent::toArray($request), [
            'reporterName' => $this->contact_name ?: $reporter?->name,
            'reporterPhone' => $this->contact_number ?: $reporter?->phone,
            'reporterEmail' => $this->contact_email ?: $reporter?->email,
            'reportedBy' => $reporter ? 'Citizen' : 'Guest',
            // "Owner" or "Citizen" (who filed it: the pet's owner or a concerned citizen); null on older reports
            'reporterType' => $this->reporter_type,
            // set once the pet is registered as an animal in the pound
            'animal_id' => $this->animal_id,
        ]);
    }
}

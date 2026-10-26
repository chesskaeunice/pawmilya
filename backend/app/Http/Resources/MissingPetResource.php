<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Public view of a missing pet report. Key names match what the pages already use.
// Reporter contact details are not included (staff only, see StaffMissingPetResource).
class MissingPetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $petPhotos = $this->photos->where('kind', 'pet')->map->url()->values();
        $areaPhotos = $this->photos->where('kind', 'last_seen')->map->url()->values();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->typeLabel(),
            'breed' => $this->breed,
            'color' => $this->color,
            'markings' => $this->markings,
            'sex' => $this->sex,
            'location' => $this->location,
            'status' => $this->status,
            'lastSeen' => $this->last_seen_at->toIso8601String(),
            'reportedAt' => $this->created_at->toIso8601String(),
            'image' => $petPhotos->first(),
            'petImages' => $petPhotos,
            'lastSeenImages' => $areaPhotos,
            'details' => $this->details,
            // end of the 7-day claim period of a Rescued pet (null before it is Rescued)
            'claimDeadlineAt' => $this->claim_deadline_at?->toIso8601String(),
        ];
    }
}

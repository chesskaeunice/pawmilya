<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

// Staff view of an application. Key names match what the staff pages already use.
// ID and home photos are private files: they are given as signed links that expire.
class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $animal = $this->animal;
        $petPhotos = $animal->photos->map->url()->values();

        return [
            'id' => $this->id,

            'petId' => $animal->id,
            'petName' => $animal->name,
            'petType' => $animal->species,
            'petBreed' => $animal->breed,
            'petSex' => $animal->sex,
            'petLocation' => $animal->location,
            'petImage' => $petPhotos->first(),
            'petImages' => $petPhotos,
            'petPersonality' => $animal->personality ?? [],

            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'applicantName' => trim($this->first_name.' '.$this->last_name),
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'birthDate' => $this->birth_date->toDateString(),
            'employmentStatus' => $this->employment_status,
            'work' => $this->work,
            'selfEmployedField' => $this->self_employed_field,
            'selfEmployedFieldOther' => $this->self_employed_field_other,
            'socialMedia' => $this->social_media,
            'civilStatus' => $this->civil_status,
            'pronouns' => $this->pronouns,
            'prompt' => $this->referral_source,
            'adoptedBefore' => $this->adopted_before ? 'Yes' : 'No',

            'validId' => ['name' => basename($this->valid_id_path), 'url' => $this->fileUrl('id', 0)],
            'idVerificationStatus' => $this->id_verification_status,

            'residence' => $this->residence,
            'householdMembers' => $this->household_members,
            'hasPets' => $this->has_pets ? 'Yes' : 'No',
            'petCount' => $this->pet_count,
            'petExperience' => $this->pet_experience,

            'homePhotos' => collect($this->home_photo_paths)->map(fn ($path, $index) => [
                'name' => basename($path),
                'url' => $this->fileUrl('home', $index),
            ])->values(),

            'whyAdopt' => $this->why_adopt,
            'howCare' => $this->how_care,
            'termsAccepted' => $this->terms_accepted,

            'date' => $this->created_at->format('M j, Y'),
            'submittedAt' => $this->created_at->toIso8601String(),
            'status' => $this->status,
            'rejectionReason' => $this->rejection_reason ?? '',
            'reviewedBy' => $this->reviewer?->name,
            'reviewedAt' => $this->reviewed_at?->toIso8601String(),
        ];
    }

    private function fileUrl(string $type, int $index): string
    {
        return URL::temporarySignedRoute(
            'application.file',
            now()->addMinutes(30),
            ['application' => $this->id, 'type' => $type, 'index' => $index]
        );
    }
}

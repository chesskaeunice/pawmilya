<?php

namespace App\Support;

use App\Models\Animal;
use App\Models\MissingPetReport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Throwable;

// A Found missing pet report means the pet is at the pound: this makes it an animal (status Rescued)
// and links the two. Used by the "Register in pound" button and when staff set a report to Found.
class ReportAnimalRegistrar
{
    // Creates the animal from the report (photos copied, first = main) and links it.
    // Run it inside a DB transaction with the report row locked; the caller has already checked
    // that the report has no animal yet. If anything fails, the copied files are removed again.
    public function register(MissingPetReport $report, User $user): Animal
    {
        $animal = null;

        try {
            // animal_code and qr_token are made by the Animal model, as for every animal
            $animal = new Animal([
                'name' => $report->name ?: null,
                'species' => $report->species,
                // "Rabbit" for a report of species Other
                'other_species' => $report->species === 'Other' ? $report->other_species : null,
                'breed' => $report->breed,
                'sex' => $report->sex,
                'color' => $report->color,
                'location' => $report->location,
                'status' => 'Rescued',
                'health_status' => 'Under Observation',
                'rescued_at' => now()->toDateString(),
                'description' => $report->details,
                // so the QR page shows who to contact
                'owner_name' => $report->contact_name,
                'owner_contact' => $report->contact_number,
            ]);
            $animal->created_by = $user->id;
            $animal->save();

            // the report's pet photos become the animal's photos (first = main)
            $disk = Storage::disk('public');
            $position = 0;

            foreach ($report->photos->where('kind', 'pet') as $photo) {
                if (! $disk->exists($photo->path)) {
                    continue;
                }

                $path = "animals/{$animal->id}/".basename($photo->path);
                $disk->copy($photo->path, $path);
                $animal->photos()->create(['path' => $path, 'position' => $position++]);
            }

            $report->forceFill(['animal_id' => $animal->id])->save();
        } catch (Throwable $e) {
            // the transaction rolls the rows back; do not leave copied files behind
            if ($animal?->id) {
                Storage::disk('public')->deleteDirectory("animals/{$animal->id}");
            }

            throw $e;
        }

        return $animal;
    }

    // Call after the transaction has committed
    public function audit(Request $request, Animal $animal, MissingPetReport $report): void
    {
        Audit::record($request, 'animal.created', $animal, [
            'animal_code' => $animal->animal_code,
            'source' => 'missing_pet_report',
            'report_id' => $report->id,
        ]);
    }
}

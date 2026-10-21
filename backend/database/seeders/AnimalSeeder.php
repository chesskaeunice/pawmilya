<?php

namespace Database\Seeders;

use App\Models\Animal;
use App\Models\HealthLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnimalSeeder extends Seeder
{
    public function run(): void
    {
        $staff = User::where('role', User::ROLE_POUND_STAFF)->first();
        $vet = User::where('role', User::ROLE_VET_TECH)->first();

        $animals = [
            ['PAW-0001', 'Milo', 'Dog', 'Mixed Breed', 'Male', 3, 'Brown', 'Main Animal Pound', 'Available for Adoption', 'Cleared', ['Friendly', 'Playful', 'Gentle'], true, true, '2026-09-20', 'Milo is a friendly and gentle dog who enjoys walks, attention, and spending time with people.'],
            ['PAW-0002', 'Luna', 'Cat', 'Domestic Shorthair', 'Female', 1, 'Gray', 'Main Animal Pound', 'Available for Adoption', 'Cleared', ['Calm', 'Affectionate'], true, true, '2026-09-25', 'Luna is a calm and affectionate cat who enjoys quiet spaces and gentle attention.'],
            ['PAW-0003', 'Buddy', 'Dog', 'Aspin Mix', 'Male', 2, 'Black and white', 'North Holding Area', 'Available for Adoption', 'Cleared', ['Playful', 'Energetic'], true, false, '2026-10-02', 'Buddy is energetic and enjoys outdoor activities and interacting with people.'],
            ['PAW-0004', 'Cleo', 'Cat', 'Domestic Longhair', 'Female', 2, 'Cream', 'Main Animal Pound', 'Pending Adoption', 'Cleared', ['Sweet', 'Independent'], true, true, '2026-10-08', 'Cleo is a sweet, independent cat.'],
            ['PAW-0005', null, 'Dog', 'Aspin', 'Male', 4, 'Brown', 'Quarantine Area', 'Rescued', 'Under Observation', null, false, false, '2026-10-18', 'Stray found near Commonwealth Avenue, Quezon City.'],
            ['PAW-0006', 'Bantay', 'Dog', 'Aspin', 'Male', 5, 'Black', 'Main Animal Pound', 'Rescued', 'Under Treatment', ['Loyal', 'Alert'], false, false, '2026-10-12', 'Treated for a skin infection.'],
            ['PAW-0007', 'Mingming', 'Cat', 'Puspin', 'Female', 1, 'Orange', 'Main Animal Pound', 'Adopted', 'Cleared', ['Curious', 'Playful'], true, true, '2026-08-30', 'Adopted in September 2026.'],
        ];

        foreach ($animals as [$code, $name, $species, $breed, $sex, $age, $color, $location, $status, $health, $personality, $vaccinated, $neutered, $rescuedAt, $description]) {
            Animal::updateOrCreate(['animal_code' => $code], [
                'name' => $name,
                'species' => $species,
                'breed' => $breed,
                'sex' => $sex,
                'age_months' => $age * 12,
                'color' => $color,
                'location' => $location,
                'status' => $status,
                'health_status' => $health,
                'personality' => $personality,
                'vaccinated' => $vaccinated,
                'neutered' => $neutered,
                'rescued_at' => $rescuedAt,
                'description' => $description,
                'created_by' => $staff?->id,
            ]);
        }

        // Stray whose owner is known (shown on the QR page)
        Animal::where('animal_code', 'PAW-0006')->update([
            'owner_name' => 'Mang Berting Cruz',
            'owner_contact' => '0920 555 0144',
        ]);

        $logs = [
            ['PAW-0001', 'Rabies', '2026-09-26', '2027-09-26'],
            ['PAW-0002', 'FVRCP', '2026-09-26', '2026-12-26'],
            ['PAW-0003', 'DHPP', '2026-09-26', '2026-10-20'],
        ];

        foreach ($logs as [$code, $vaccine, $given, $due]) {
            $animal = Animal::where('animal_code', $code)->first();

            HealthLog::firstOrCreate(
                ['animal_id' => $animal->id, 'vaccine' => $vaccine, 'administered_at' => $given],
                ['next_due_date' => $due, 'recorded_by' => $vet?->id]
            );
        }
    }
}

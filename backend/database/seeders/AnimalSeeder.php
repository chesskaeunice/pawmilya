<?php

namespace Database\Seeders;

use App\Models\Animal;
use App\Models\HealthLog;
use App\Models\User;
use App\Models\Vaccine;
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

        // Vaccinations, given by the vet tech. Every animal that is past its first day in the pound has
        // 2 or 3 different vaccines that fit its species (PAW-0005 is newly rescued: none yet).
        // [animal code, vaccine (from the vaccines table), date given, next due]
        $logs = [
            ['PAW-0001', 'Anti-rabies', '2026-09-26', '2027-09-26'],
            ['PAW-0001', '5-in-1 / DHPP', '2026-09-26', '2027-09-26'],
            ['PAW-0001', 'Kennel cough (Bordetella)', '2026-09-27', '2027-03-26'],

            ['PAW-0002', '4-in-1 / FVRCP', '2026-09-26', '2026-12-26'],
            ['PAW-0002', 'Anti-rabies', '2026-09-26', '2027-09-26'],
            ['PAW-0002', 'FeLV', '2026-10-10', '2027-10-10'],

            ['PAW-0003', '5-in-1 / DHPP', '2026-09-26', '2026-10-20'],
            ['PAW-0003', 'Anti-rabies', '2026-10-02', '2027-10-02'],
            ['PAW-0003', 'Leptospirosis', '2026-10-02', '2027-10-02'],

            ['PAW-0004', 'Anti-rabies', '2026-10-09', '2027-10-09'],
            ['PAW-0004', '4-in-1 / FVRCP', '2026-10-09', '2027-10-09'],

            ['PAW-0006', 'Anti-rabies', '2026-10-14', '2027-10-14'],
            ['PAW-0006', '5-in-1 / DHPP', '2026-10-14', '2026-11-04'],

            ['PAW-0007', 'Anti-rabies', '2026-09-05', '2027-09-05'],
            ['PAW-0007', '4-in-1 / FVRCP', '2026-09-05', '2026-12-05'],
            ['PAW-0007', 'FeLV', '2026-09-12', '2027-09-12'],
        ];

        $vet = User::where('email', 'vet@pawmilya.com')->first() ?? $vet;

        foreach ($logs as [$code, $vaccineName, $given, $due]) {
            $animal = Animal::where('animal_code', $code)->first();
            $vaccine = Vaccine::forSpecies($animal->species)->where('name', $vaccineName)->firstOrFail();

            HealthLog::updateOrCreate(
                ['animal_id' => $animal->id, 'vaccine' => $vaccine->name, 'administered_at' => $given],
                ['vaccine_id' => $vaccine->id, 'other_vaccine_name' => null, 'next_due_date' => $due, 'recorded_by' => $vet?->id]
            );
        }

        // "vaccinated" follows the records
        Animal::whereIn('animal_code', array_unique(array_column($logs, 0)))->get()->each->refreshVaccinated();
    }
}

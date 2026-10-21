<?php

namespace Database\Seeders;

use App\Models\MissingPetReport;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MissingPetSeeder extends Seeder
{
    public function run(): void
    {
        $juan = User::where('email', 'juan@email.com')->first();

        $reports = [
            // Logged-in reporter
            ['Miming', 'Cat', 'Domestic Shorthair', 'Male', 'Gray', 'Katipunan, Quezon City', 'Lost', '2026-10-18 01:15:00', $juan, null, null,
                'Miming was last seen near Katipunan. He is friendly but may hide around strangers.'],
            // Guest reporters: contact name and number are required
            ['Bruno', 'Dog', 'Golden Retriever', 'Male', 'Golden', 'Cubao, Quezon City', 'Sighted', '2026-10-17 20:30:00', null, 'Liza Ramos', '0919 555 0166',
                'Bruno was sighted near a residential area wearing a blue collar.'],
            ['Mimi', 'Cat', 'Puspin', 'Female', 'White and orange', 'Marikina City', 'Found', '2026-10-15 08:00:00', null, 'Ben Torres', '0926 555 0177',
                'Found by a neighbor and being kept safe.'],
            // Looks like the stray PAW-0005 in the pound (brown aspin found near Commonwealth Avenue)
            ['Brownie', 'Dog', 'Aspin', 'Male', 'Brown', 'Commonwealth Avenue, Quezon City', 'Lost', '2026-10-17 18:00:00', null, 'Rico Gonzales', '0932 555 0188',
                'Brownie slipped out of the gate on Commonwealth Avenue. He answers to his name.'],
        ];

        foreach ($reports as [$name, $species, $breed, $sex, $color, $location, $status, $lastSeen, $reporter, $contactName, $contactNumber, $details]) {
            $fingerprint = MissingPetReport::makeFingerprint(
                MissingPetReport::reporterKey($reporter, $contactNumber),
                $species,
                $name,
                $location,
                Carbon::parse($lastSeen)->toDateString(),
            );

            $report = MissingPetReport::firstOrNew(['fingerprint' => $fingerprint]);
            $report->fill([
                'reporter_id' => $reporter?->id,
                'contact_name' => $contactName,
                'contact_number' => $contactNumber,
                'name' => $name,
                'species' => $species,
                'breed' => $breed,
                'sex' => $sex,
                'color' => $color,
                'location' => $location,
                'last_seen_at' => $lastSeen,
                'details' => $details,
            ]);
            $report->status = $status;
            $report->save();
        }
    }
}

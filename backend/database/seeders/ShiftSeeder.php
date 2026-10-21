<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\Shift;
use App\Models\StaffShift;
use App\Models\User;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $shifts = [
            ['Morning', '06:00:00', '14:00:00'],
            ['Afternoon', '14:00:00', '22:00:00'],
            ['Night', '22:00:00', '06:00:00'], // overnight: ends the next day
        ];

        foreach ($shifts as [$name, $start, $end]) {
            Shift::updateOrCreate(['name' => $name], ['start_time' => $start, 'end_time' => $end, 'is_active' => true]);
        }

        // Roles that must be present on every shift
        Setting::firstOrCreate(['key' => 'shifts.required_roles'], ['value' => ['pound_staff', 'vet_tech']]);
        // Minutes before the start time that check-in is allowed
        Setting::firstOrCreate(['key' => 'shifts.check_in_grace_minutes'], ['value' => 30]);

        $this->seedSampleSchedule();
    }

    // A few assignments so the dashboards and the schedule page have something to show
    private function seedSampleSchedule(): void
    {
        $manager = User::where('email', 'manager@pawmilya.com')->first();
        $shifts = Shift::pluck('id', 'name');
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        $plan = [
            ['staff@pawmilya.com', 'Morning', $today],
            ['vet@pawmilya.com', 'Morning', $today],
            ['staff2@pawmilya.com', 'Afternoon', $today],
            ['vet2@pawmilya.com', 'Afternoon', $today],
            ['counselor@pawmilya.com', 'Afternoon', $today],
            ['staff@pawmilya.com', 'Morning', $tomorrow],
            ['vet@pawmilya.com', 'Morning', $tomorrow],
        ];

        foreach ($plan as [$email, $shiftName, $date]) {
            $user = User::where('email', $email)->first();

            StaffShift::firstOrCreate(
                ['user_id' => $user->id, 'shift_id' => $shifts[$shiftName], 'assigned_date' => $date, 'is_active' => true],
                ['assigned_by' => $manager->id]
            );
        }
    }
}

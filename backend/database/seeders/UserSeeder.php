<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    // Dev accounts, one per role. Password for all: "password"
    public function run(): void
    {
        $users = [
            ['Ramon Villanueva', 'manager@pawmilya.com', '0917 555 0101', User::ROLE_KENNEL_MANAGER],
            ['Dina Mercado', 'staff@pawmilya.com', '0917 555 0102', User::ROLE_POUND_STAFF],
            ['Paolo Aquino', 'vet@pawmilya.com', '0917 555 0103', User::ROLE_VET_TECH],
            ['Carla Bautista', 'counselor@pawmilya.com', '0917 555 0104', User::ROLE_ADOPTION_COUNSELOR],
            ['Jomar Dizon', 'staff2@pawmilya.com', '0917 555 0105', User::ROLE_POUND_STAFF],
            ['Liza Navarro', 'vet2@pawmilya.com', '0917 555 0106', User::ROLE_VET_TECH],
            ['Juan Dela Cruz', 'juan@email.com', '0917 555 0111', User::ROLE_CITIZEN],
            ['Maria Santos', 'maria@email.com', '0917 555 0187', User::ROLE_CITIZEN],
            ['John Reyes', 'john@email.com', '0918 222 0192', User::ROLE_CITIZEN],
        ];

        foreach ($users as [$name, $email, $phone, $role]) {
            $user = User::firstOrNew(['email' => $email]);
            $user->fill(['name' => $name, 'phone' => $phone, 'password' => 'password']);
            $user->role = $role;
            $user->is_active = true;
            $user->email_verified_at = now();
            $user->save();
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            AnimalSeeder::class,
            AdoptionApplicationSeeder::class,
            MissingPetSeeder::class,
            ShiftSeeder::class,
        ]);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

// Seeds only the test accounts and the default shifts. Pets are added through the Add Animal form;
// the vaccine list is created by its migration.
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ShiftSeeder::class,
        ]);
    }
}

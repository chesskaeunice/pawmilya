<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// The vaccines staff pick from when they record a vaccination. "Others" is not a row: the form lets the
// vet tech type the name, which is stored on the record (other_vaccine_name).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaccines', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->enum('species', ['Dog', 'Cat', 'All']);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['name', 'species']);
        });

        $now = now();

        DB::table('vaccines')->insert(array_map(
            fn (array $row) => $row + ['is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            [
                ['name' => 'Anti-rabies', 'species' => 'All'],
                ['name' => '5-in-1 / DHPP', 'species' => 'Dog'],
                ['name' => 'Kennel cough (Bordetella)', 'species' => 'Dog'],
                ['name' => 'Leptospirosis', 'species' => 'Dog'],
                ['name' => '4-in-1 / FVRCP', 'species' => 'Cat'],
                ['name' => 'FeLV', 'species' => 'Cat'],
            ]
        ));
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccines');
    }
};

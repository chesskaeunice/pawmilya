<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// A Found report can be registered as an animal in the pound; this links the two.
// One animal per report (unique), and the link is dropped if the animal is deleted.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->foreignId('animal_id')->nullable()->unique()->constrained('animals')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->dropConstrainedForeignId('animal_id');
        });
    }
};

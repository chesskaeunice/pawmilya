<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// What an animal with species "Other" really is ("Rabbit"). Filled when a Found report is registered
// as an animal (it carries the report's other_species); null for dogs, cats and older animals.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            $table->string('other_species', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            $table->dropColumn('other_species');
        });
    }
};

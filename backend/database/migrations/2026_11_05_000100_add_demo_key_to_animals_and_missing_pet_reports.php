<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Marks the sample pets (school project demo). NULL = a real record; a value (e.g. demo-luna-cat-04)
// = a demonstration record. Unique, so importing the demo pets twice cannot create duplicates.
return new class extends Migration
{
    public function up(): void
    {
        foreach (['animals', 'missing_pet_reports'] as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->string('demo_key', 80)->nullable()->unique();
            });
        }
    }

    public function down(): void
    {
        foreach (['animals', 'missing_pet_reports'] as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropUnique(['demo_key']);
                $table->dropColumn('demo_key');
            });
        }
    }
};

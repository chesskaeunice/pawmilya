<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// When a report becomes Rescued, the owner has 7 days to claim the pet. Set once, never changed.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->dateTime('claim_deadline_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->dropColumn('claim_deadline_at');
        });
    }
};

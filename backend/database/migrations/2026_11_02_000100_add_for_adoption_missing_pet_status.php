<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// New missing pet report status "For Adoption": set by the system when a Rescued report passes its
// 7-day claim deadline without a claim. Staff do not choose it.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->enum('status', ['Lost', 'Rescued', 'For Adoption', 'Reunited'])->default('Lost')->change();
        });
    }

    public function down(): void
    {
        // a report that was already released goes back to Rescued
        DB::table('missing_pet_reports')->where('status', 'For Adoption')->update(['status' => 'Rescued']);

        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->enum('status', ['Lost', 'Rescued', 'Reunited'])->default('Lost')->change();
        });
    }
};

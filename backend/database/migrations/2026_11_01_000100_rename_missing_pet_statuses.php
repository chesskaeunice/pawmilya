<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Missing pet report statuses become Lost, Rescued, Reunited: "Found" is renamed to "Rescued" and
// "Sighted" is removed. Stops when Sighted rows exist, so nothing is lost silently.
return new class extends Migration
{
    public function up(): void
    {
        $sighted = DB::table('missing_pet_reports')->where('status', 'Sighted')->count();

        if ($sighted > 0) {
            throw new RuntimeException("{$sighted} missing pet report(s) still have the status Sighted. Decide what to do with them before migrating.");
        }

        // widen first, so the rename below is allowed, then keep only the final values
        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->enum('status', ['Lost', 'Sighted', 'Found', 'Rescued', 'Reunited'])->default('Lost')->change();
        });

        DB::table('missing_pet_reports')->where('status', 'Found')->update(['status' => 'Rescued']);

        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->enum('status', ['Lost', 'Rescued', 'Reunited'])->default('Lost')->change();
        });
    }

    public function down(): void
    {
        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->enum('status', ['Lost', 'Sighted', 'Found', 'Rescued', 'Reunited'])->default('Lost')->change();
        });

        DB::table('missing_pet_reports')->where('status', 'Rescued')->update(['status' => 'Found']);

        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->enum('status', ['Lost', 'Sighted', 'Found', 'Reunited'])->default('Lost')->change();
        });
    }
};

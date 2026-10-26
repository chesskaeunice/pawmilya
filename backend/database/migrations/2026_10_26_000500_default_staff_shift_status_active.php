<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// A staff member who is assigned to a shift is "active" at once (it used to start as "pending").
// Only the default for NEW rows changes; existing assignments keep their status
// (check-in and check-out set it to active / completed anyway).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff_shifts', function (Blueprint $table) {
            $table->enum('status', ['pending', 'active', 'completed'])->default('active')->change();
        });
    }

    public function down(): void
    {
        Schema::table('staff_shifts', function (Blueprint $table) {
            $table->enum('status', ['pending', 'active', 'completed'])->default('pending')->change();
        });
    }
};

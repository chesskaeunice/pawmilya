<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Home address on the Profile page, in parts: province, city / municipality, barangay and
// "house no. / street" (free text, also where an old single-line address is kept). All optional.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('province', 120)->nullable();
            $table->string('city', 120)->nullable();
            $table->string('barangay', 120)->nullable();
            $table->string('street')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['province', 'city', 'barangay', 'street']);
        });
    }
};

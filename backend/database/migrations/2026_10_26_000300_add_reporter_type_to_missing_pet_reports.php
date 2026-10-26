<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Who is filing the report: "Owner" (the pet's owner) or "Citizen" (a concerned citizen).
// Nullable, so reports filed before this field existed stay valid (staff see "Not specified").
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->string('reporter_type', 20)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('missing_pet_reports', function (Blueprint $table) {
            $table->dropColumn('reporter_type');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('missing_pet_reports', function (Blueprint $table) {
            $table->id();
            // Guests may report: reporter_id is null and contact name + number are required (checked in the API)
            $table->foreignId('reporter_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('contact_name')->nullable();
            $table->string('contact_number', 30)->nullable();
            $table->string('contact_email')->nullable();

            $table->string('name')->nullable();
            $table->enum('species', ['Dog', 'Cat', 'Other']);
            $table->string('other_species', 100)->nullable(); // what the animal is when species is Other
            $table->string('breed')->nullable();
            $table->enum('sex', ['Male', 'Female', 'Unknown'])->default('Unknown');
            $table->string('color')->nullable();
            $table->string('markings')->nullable();
            $table->string('location');
            $table->enum('status', ['Lost', 'Sighted', 'Found', 'Reunited'])->default('Lost')->index();
            $table->dateTime('last_seen_at');
            $table->text('details')->nullable();

            // Duplicate protection: the same reporter cannot file the same pet (same name, place and day)
            // twice while the report is still open. Once Reunited, the slot is free again.
            $table->string('fingerprint', 40);
            $table->unsignedTinyInteger('open_slot')->nullable()
                ->storedAs("CASE WHEN status <> 'Reunited' THEN 1 ELSE NULL END");
            $table->unique(['fingerprint', 'open_slot'], 'missing_reports_one_open_per_fingerprint');

            $table->timestamps();
        });

        Schema::create('missing_pet_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('missing_pet_report_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->enum('kind', ['pet', 'last_seen']);
            $table->unsignedTinyInteger('position')->default(0);
            $table->timestamps();

            $table->index(['missing_pet_report_id', 'kind', 'position'], 'missing_photos_lookup');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('missing_pet_photos');
        Schema::dropIfExists('missing_pet_reports');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// A citizen claims a Rescued pet during its 7-day claim period. Pound staff approve or reject.
// The proof of ownership images are private files (storage/app/private), like the adoption valid ID.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pet_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('missing_pet_report_id')->constrained('missing_pet_reports')->cascadeOnDelete();
            $table->foreignId('claimant_id')->constrained('users')->cascadeOnDelete();

            $table->string('contact_name');
            $table->string('contact_number', 30);
            $table->string('contact_email')->nullable();
            $table->date('pickup_date');

            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending')->index();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('decided_at')->nullable();
            $table->text('reject_reason')->nullable();

            // A citizen has one live (Pending or Approved) claim per report; a Rejected one can be sent again.
            // Several citizens may have a Pending claim on the same report.
            $table->unsignedTinyInteger('live_slot')->nullable()
                ->storedAs("CASE WHEN status IN ('Pending', 'Approved') THEN 1 ELSE NULL END");
            $table->unique(['missing_pet_report_id', 'claimant_id', 'live_slot'], 'claims_one_live_per_user_report');

            $table->timestamps();
        });

        Schema::create('pet_claim_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_claim_id')->constrained('pet_claims')->cascadeOnDelete();
            $table->string('path');
            $table->unsignedTinyInteger('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pet_claim_photos');
        Schema::dropIfExists('pet_claims');
    }
};

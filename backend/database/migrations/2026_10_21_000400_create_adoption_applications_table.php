<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adoption_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('animal_id')->constrained()->cascadeOnDelete();

            // Personal information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('address');
            $table->string('phone', 30);
            $table->string('email');
            $table->date('birth_date');
            $table->enum('employment_status', ['Student', 'Employed', 'Self-employed', 'Unemployed']);
            $table->string('work')->nullable();
            $table->string('self_employed_field')->nullable();
            $table->string('self_employed_field_other')->nullable();
            $table->string('social_media')->nullable();
            $table->string('civil_status', 30);
            $table->string('pronouns', 30)->nullable();
            $table->string('referral_source')->nullable();
            $table->boolean('adopted_before')->default(false);

            // Home and pet experience
            $table->string('residence', 50);
            $table->unsignedTinyInteger('household_members');
            $table->boolean('has_pets')->default(false);
            $table->unsignedTinyInteger('pet_count')->nullable();
            $table->string('pet_experience')->nullable();

            // Uploads: valid ID, home photos (min 2, max 3)
            $table->string('valid_id_path');
            $table->enum('id_verification_status', ['Pending Verification', 'Verified', 'Rejected'])
                ->default('Pending Verification');
            $table->json('home_photo_paths');

            $table->text('why_adopt');
            $table->text('how_care');
            $table->boolean('terms_accepted');

            // Application status (not to be confused with civil_status)
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending')->index();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            // Duplicate protection in the database (NULL when the rule does not apply):
            // 1) a citizen has one live (Pending or Approved) application per animal
            $table->unsignedTinyInteger('live_slot')->nullable()
                ->storedAs("CASE WHEN status IN ('Pending', 'Approved') THEN 1 ELSE NULL END");
            $table->unique(['user_id', 'animal_id', 'live_slot'], 'applications_one_live_per_user_animal');
            // 2) an animal has at most one Approved application
            $table->unsignedTinyInteger('approved_slot')->nullable()
                ->storedAs("CASE WHEN status = 'Approved' THEN 1 ELSE NULL END");
            $table->unique(['animal_id', 'approved_slot'], 'applications_one_approved_per_animal');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adoption_applications');
    }
};

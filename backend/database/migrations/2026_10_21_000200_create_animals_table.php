<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('animals', function (Blueprint $table) {
            $table->id();
            $table->string('animal_code', 20)->unique();
            $table->string('name')->nullable();
            $table->enum('species', ['Dog', 'Cat', 'Other']);
            $table->string('breed')->nullable();
            $table->enum('sex', ['Male', 'Female', 'Unknown'])->default('Unknown');
            $table->unsignedSmallInteger('age_months')->nullable();
            $table->string('color')->nullable();
            $table->string('location')->nullable();
            $table->enum('status', [
                'Rescued', 'Available for Adoption', 'Pending Adoption', 'Adopted', 'Reunited with Owner',
            ])->default('Rescued')->index();
            // Staff-only; never shown on citizen pages
            $table->enum('health_status', ['Under Observation', 'Under Treatment', 'Cleared'])
                ->default('Under Observation');
            $table->json('personality')->nullable();
            $table->boolean('vaccinated')->default(false);
            $table->boolean('neutered')->default(false);
            $table->text('description')->nullable();
            $table->text('ideal_home')->nullable();
            $table->date('rescued_at')->nullable();

            // Stray QR page: owner info is shown only when known
            $table->uuid('qr_token')->unique();
            $table->string('owner_name')->nullable();
            $table->string('owner_contact', 50)->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animals');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained()->cascadeOnDelete();
            $table->string('vaccine', 100);
            $table->date('administered_at');
            $table->date('next_due_date')->nullable()->index();
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // The same vaccine cannot be recorded twice for one animal on the same day
            $table->unique(['animal_id', 'vaccine', 'administered_at'], 'health_logs_no_duplicate_dose');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_logs');
    }
};

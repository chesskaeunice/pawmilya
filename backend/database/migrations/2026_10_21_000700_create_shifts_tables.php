<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->time('start_time');
            $table->time('end_time'); // earlier than start_time = ends the next day
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('staff_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shift_id')->constrained()->cascadeOnDelete();
            $table->date('assigned_date')->index();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['pending', 'active', 'completed'])->default('pending');
            $table->dateTime('check_in_time')->nullable();
            $table->dateTime('check_out_time')->nullable();
            $table->boolean('is_active')->default(true); // false = soft removed

            // 1 while active, NULL once removed: the unique index then only covers active rows
            $table->unsignedTinyInteger('active_slot')->nullable()
                ->storedAs('CASE WHEN is_active = 1 THEN 1 ELSE NULL END');
            $table->unique(['user_id', 'shift_id', 'assigned_date', 'active_slot'], 'staff_shifts_active_unique');
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->json('value');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('staff_shifts');
        Schema::dropIfExists('shifts');
    }
};

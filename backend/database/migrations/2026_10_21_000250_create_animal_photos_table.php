<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('animal_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->unsignedTinyInteger('position')->default(0); // 0 = main photo
            $table->timestamps();

            $table->index(['animal_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animal_photos');
    }
};

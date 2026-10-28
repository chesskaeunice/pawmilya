<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Animals have no age anywhere on the site
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('animals', 'age_months')) {
            Schema::table('animals', function (Blueprint $table) {
                $table->dropColumn('age_months');
            });
        }
    }

    public function down(): void
    {
        Schema::table('animals', function (Blueprint $table) {
            $table->unsignedSmallInteger('age_months')->nullable()->after('sex');
        });
    }
};

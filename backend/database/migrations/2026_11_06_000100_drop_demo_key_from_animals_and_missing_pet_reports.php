<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// The sample pets were removed and the demo-only rules with them, so the demo_key column is not needed
// any more. Run after the demo records are gone (every row had it NULL for real records).
return new class extends Migration
{
    public function up(): void
    {
        foreach (['animals', 'missing_pet_reports'] as $table) {
            if (Schema::hasColumn($table, 'demo_key')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropUnique(['demo_key']);
                    $table->dropColumn('demo_key');
                });
            }
        }
    }

    public function down(): void
    {
        foreach (['animals', 'missing_pet_reports'] as $table) {
            if (! Schema::hasColumn($table, 'demo_key')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->string('demo_key', 80)->nullable()->unique();
                });
            }
        }
    }
};

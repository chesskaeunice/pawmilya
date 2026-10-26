<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// A vaccination record (health_logs row) points at a vaccine from the vaccines table (vaccine_id), or it
// carries a typed name for "Others" (other_vaccine_name). The old `vaccine` text column stays: it holds
// the vaccine's name as it was when the record was made, and the "same dose twice" unique key uses it.
return new class extends Migration
{
    // old free-text names (lower case) -> name in the vaccines table
    private const ALIASES = [
        'rabies' => 'Anti-rabies',
        'anti-rabies' => 'Anti-rabies',
        'anti rabies' => 'Anti-rabies',
        'dhpp' => '5-in-1 / DHPP',
        'dhpp / 5-in-1' => '5-in-1 / DHPP',
        '5-in-1' => '5-in-1 / DHPP',
        '5-in-1 / dhpp' => '5-in-1 / DHPP',
        'bordetella' => 'Kennel cough (Bordetella)',
        'kennel cough' => 'Kennel cough (Bordetella)',
        'kennel cough (bordetella)' => 'Kennel cough (Bordetella)',
        'leptospirosis' => 'Leptospirosis',
        'fvrcp' => '4-in-1 / FVRCP',
        'fvrcp / 3-in-1' => '4-in-1 / FVRCP',
        '3-in-1' => '4-in-1 / FVRCP',
        '4-in-1' => '4-in-1 / FVRCP',
        '4-in-1 / fvrcp' => '4-in-1 / FVRCP',
        'felv' => 'FeLV',
    ];

    public function up(): void
    {
        Schema::table('health_logs', function (Blueprint $table) {
            $table->foreignId('vaccine_id')->nullable()->after('animal_id')->constrained('vaccines')->nullOnDelete();
            $table->string('other_vaccine_name', 100)->nullable()->after('vaccine_id');
        });

        $this->mapExistingRecords();
    }

    // Existing records keep working: a name that matches a vaccine for the animal's species is linked to it
    // (and renamed to the table's spelling); any other name is kept as other_vaccine_name.
    private function mapExistingRecords(): void
    {
        $vaccines = DB::table('vaccines')->get();

        $logs = DB::table('health_logs')
            ->join('animals', 'animals.id', '=', 'health_logs.animal_id')
            ->select('health_logs.id', 'health_logs.animal_id', 'health_logs.vaccine', 'health_logs.administered_at', 'animals.species')
            ->orderBy('health_logs.id')
            ->get();

        foreach ($logs as $log) {
            $wanted = self::ALIASES[mb_strtolower(trim($log->vaccine))] ?? null;

            $match = $wanted
                ? $vaccines->first(fn ($v) => $v->name === $wanted && in_array($v->species, ['All', $log->species], true))
                : null;

            // renaming must not make two records of the same dose collide (unique key)
            $collides = $match && $match->name !== $log->vaccine && DB::table('health_logs')
                ->where('animal_id', $log->animal_id)->where('vaccine', $match->name)
                ->whereDate('administered_at', $log->administered_at)->where('id', '!=', $log->id)->exists();

            if ($match && ! $collides) {
                DB::table('health_logs')->where('id', $log->id)->update(['vaccine_id' => $match->id, 'vaccine' => $match->name]);
            } else {
                DB::table('health_logs')->where('id', $log->id)->update(['other_vaccine_name' => $log->vaccine]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('health_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('vaccine_id');
            $table->dropColumn('other_vaccine_name');
        });
    }
};

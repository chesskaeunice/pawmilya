<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\AuditLog;
use App\Models\HealthLog;
use App\Models\User;
use App\Models\Vaccine;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class VaccinationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-10-21 09:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function actingAsRole(string $role): User
    {
        $user = new User(['name' => $role, 'email' => $role.'@test.com', 'password' => 'password123']);
        $user->role = $role;
        $user->save();

        $this->app['auth']->forgetGuards();
        $this->withToken($user->createToken('auth')->plainTextToken);

        return $user;
    }

    private function animal(string $name = 'Milo', string $species = 'Dog'): Animal
    {
        return Animal::create([
            'name' => $name, 'species' => $species, 'breed' => 'Aspin', 'sex' => 'Male', 'age_months' => 24,
            'location' => 'Main', 'status' => 'Rescued', 'health_status' => 'Under Observation', 'personality' => ['Calm'],
        ]);
    }

    // id of a vaccine from the vaccines table (seeded by the migration)
    private function vaccineId(string $name): int
    {
        return Vaccine::where('name', $name)->firstOrFail()->id;
    }

    // a record for the form: a vaccine from the table, or (not found there) a typed one under "Others"
    private function record(string $vaccine, string $given, array $extra = []): array
    {
        $id = Vaccine::where('name', $vaccine)->value('id');

        return array_merge(
            $id ? ['vaccine_id' => $id] : ['vaccine_id' => null, 'other_vaccine_name' => $vaccine],
            ['administered_at' => $given],
            $extra
        );
    }

    private function add(Animal $animal, array $records)
    {
        return $this->postJson('/api/vaccinations', ['animal_id' => $animal->id, 'records' => $records]);
    }

    /* ---------- saving ---------- */

    public function test_vet_tech_adds_a_batch_and_the_next_due_date_follows_the_vaccine_interval(): void
    {
        $animal = $this->animal();
        $vet = $this->actingAsRole('vet_tech');

        $this->add($animal, [
            $this->record('Anti-rabies', '2026-10-01'),
            $this->record('Kennel cough (Bordetella)', '2026-10-01'),
            $this->record('5-in-1 / DHPP', '2026-10-01', ['next_due_date' => '2026-11-15']),
        ])->assertCreated()->assertJsonCount(3, 'data');

        $this->assertSame('2027-10-01', HealthLog::where('vaccine', 'Anti-rabies')->first()->next_due_date->toDateString());
        $this->assertSame('2027-03-30', HealthLog::where('vaccine', 'Kennel cough (Bordetella)')->first()->next_due_date->toDateString()); // 180 days
        $this->assertSame('2026-11-15', HealthLog::where('vaccine', '5-in-1 / DHPP')->first()->next_due_date->toDateString());
        $this->assertSame($vet->id, HealthLog::first()->recorded_by);
        $this->assertSame(3, AuditLog::where('action', 'vaccination.created')->count());
    }

    public function test_several_vaccines_are_saved_in_one_request_with_their_vaccine_ids_notes_and_names(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');

        $response = $this->add($animal, [
            $this->record('Anti-rabies', '2026-10-01', ['notes' => 'left hind leg']),
            $this->record('Leptospirosis', '2026-10-02'),
            ['vaccine_id' => null, 'other_vaccine_name' => '  Canine Influenza ', 'administered_at' => '2026-10-03', 'next_due_date' => '2027-01-03'],
        ])->assertCreated()->assertJsonCount(3, 'data');

        $this->assertSame(3, HealthLog::count());

        $rabies = HealthLog::where('vaccine_id', $this->vaccineId('Anti-rabies'))->firstOrFail();
        $this->assertSame($animal->id, $rabies->animal_id);
        $this->assertNull($rabies->other_vaccine_name);
        $this->assertSame('left hind leg', $rabies->notes);
        $this->assertSame('Anti-rabies', $rabies->vaccineType->name);

        // "Others": no vaccine id, the typed (trimmed) name is kept
        $other = HealthLog::whereNull('vaccine_id')->firstOrFail();
        $this->assertSame('Canine Influenza', $other->other_vaccine_name);

        // the list shows the table name or the typed name
        $names = collect($this->getJson('/api/vaccinations')->assertOk()->json('data'))->pluck('vaccine')->all();
        $this->assertEqualsCanonicalizing(['Anti-rabies', 'Leptospirosis', 'Canine Influenza'], $names);
    }

    public function test_it_is_all_or_nothing_and_at_most_five_vaccines_at_a_time(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');

        // the second record is invalid: nothing is saved
        $this->add($animal, [
            $this->record('Anti-rabies', '2026-10-01'),
            $this->record('Leptospirosis', '2026-12-31'),
        ])->assertUnprocessable()->assertJsonValidationErrors(['records.1.administered_at']);
        $this->assertSame(0, HealthLog::count());

        $six = array_map(fn ($day) => ['vaccine_id' => null, 'other_vaccine_name' => "Extra $day", 'administered_at' => '2026-10-0'.$day], [1, 2, 3, 4, 5, 6]);
        $this->add($animal, $six)->assertUnprocessable()->assertJsonValidationErrors(['records']);
        $this->add($animal, array_slice($six, 0, 5))->assertCreated()->assertJsonCount(5, 'data');
    }

    public function test_a_vaccine_that_does_not_fit_the_species_is_rejected(): void
    {
        $dog = $this->animal('Rex', 'Dog');
        $cat = $this->animal('Luna', 'Cat');
        $this->actingAsRole('vet_tech');

        // FeLV is for cats, 5-in-1 / DHPP is for dogs
        $this->add($dog, [$this->record('FeLV', '2026-10-01')])->assertUnprocessable()
            ->assertJsonValidationErrors(['records.0.vaccine_id']);
        $this->add($cat, [$this->record('5-in-1 / DHPP', '2026-10-01')])->assertUnprocessable()->assertJsonValidationErrors(['records.0.vaccine_id']);

        // Anti-rabies is for both; each species gets its own
        $this->add($dog, [$this->record('Anti-rabies', '2026-10-01'), $this->record('5-in-1 / DHPP', '2026-10-01')])->assertCreated();
        $this->add($cat, [$this->record('Anti-rabies', '2026-10-01'), $this->record('FeLV', '2026-10-01')])->assertCreated();

        // a vaccine that was switched off cannot be chosen
        Vaccine::where('name', 'Leptospirosis')->update(['is_active' => false]);
        $this->add($dog, [['vaccine_id' => $this->vaccineId('Leptospirosis'), 'administered_at' => '2026-10-02']])
            ->assertUnprocessable()->assertJsonValidationErrors(['records.0.vaccine_id']);
    }

    public function test_others_needs_a_name(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');

        foreach ([null, '', '   '] as $name) {
            $this->add($animal, [['vaccine_id' => null, 'other_vaccine_name' => $name, 'administered_at' => '2026-10-01']])
                ->assertUnprocessable()->assertJsonValidationErrors(['records.0.other_vaccine_name']);
        }

        // neither a vaccine nor a name
        $this->add($animal, [['administered_at' => '2026-10-01']])->assertUnprocessable()->assertJsonValidationErrors(['records.0.other_vaccine_name']);

        $this->add($animal, [['vaccine_id' => null, 'other_vaccine_name' => 'Canine Influenza', 'administered_at' => '2026-10-01']])->assertCreated();
        $this->assertSame(1, HealthLog::count());
    }

    public function test_the_list_has_what_the_grouped_view_needs_in_a_fixed_number_of_queries(): void
    {
        $vet = $this->actingAsRole('vet_tech');

        foreach (['Milo', 'Luna', 'Rex', 'Nala'] as $name) {
            $this->add($this->animal($name), [
                $this->record('Anti-rabies', '2026-10-01', ['notes' => 'left hind leg']),
                $this->record('Leptospirosis', '2026-10-02'),
            ])->assertCreated();
        }

        DB::enableQueryLog();
        $response = $this->getJson('/api/vaccinations')->assertOk()->assertJsonCount(8, 'data');
        $queries = collect(DB::getQueryLog())->pluck('query')->filter(fn ($q) => str_contains($q, 'from `'))->count();
        DB::disableQueryLog();

        // health_logs + animals + users + vaccines: 8 records, still the same few queries
        $this->assertLessThanOrEqual(6, $queries);

        $first = $response->json('data.0');
        $this->assertMatchesRegularExpression('/^PAW-\d{4}$/', $first['petCode']);
        $this->assertSame('Aspin', $first['petBreed']);
        $this->assertSame($vet->name, $first['givenBy']);
        $this->assertArrayHasKey('notes', $first);
    }

    public function test_the_vaccine_list_for_the_form_follows_the_species(): void
    {
        $this->actingAsRole('vet_tech');

        $names = fn (string $species) => collect($this->getJson("/api/vaccines?species=$species")->assertOk()->json('data'))->pluck('name')->all();

        $this->assertEqualsCanonicalizing(['Anti-rabies', '5-in-1 / DHPP', 'Kennel cough (Bordetella)', 'Leptospirosis'], $names('Dog'));
        $this->assertEqualsCanonicalizing(['Anti-rabies', '4-in-1 / FVRCP', 'FeLV'], $names('Cat'));
        $this->assertSame(['Anti-rabies'], $names('Other'));

        $all = $this->getJson('/api/vaccines')->assertOk()->json('data');
        $this->assertCount(6, $all);
        $this->assertSame(180, collect($all)->firstWhere('name', 'Kennel cough (Bordetella)')['intervalDays']);
    }

    public function test_status_is_up_to_date_due_soon_or_overdue(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');

        $this->add($animal, [
            $this->record('Old', '2025-09-01', ['next_due_date' => '2026-10-01']),      // past
            $this->record('Soon', '2026-09-25', ['next_due_date' => '2026-11-05']),     // within 30 days
            $this->record('Fine', '2026-10-01', ['next_due_date' => '2027-10-01']),     // later
        ])->assertCreated();

        $byVaccine = collect($this->getJson('/api/vaccinations')->assertOk()->json('data'))->pluck('status', 'vaccine');

        $this->assertSame('Overdue', $byVaccine['Old']);
        $this->assertSame('Due Soon', $byVaccine['Soon']);
        $this->assertSame('Up to date', $byVaccine['Fine']);
    }

    public function test_the_same_dose_cannot_be_recorded_twice(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');

        $this->add($animal, [$this->record('Anti-rabies', '2026-10-01')])->assertCreated();

        // already recorded
        $this->add($animal, [$this->record('Anti-rabies', '2026-10-01')])->assertUnprocessable();
        // listed twice in one request (a typed name matches whatever the case)
        $this->add($animal, [
            $this->record('Canine Influenza', '2026-10-02'),
            $this->record('canine influenza', '2026-10-02'),
        ])->assertUnprocessable();
        // a different date is a new dose
        $this->add($animal, [$this->record('Anti-rabies', '2026-10-10')])->assertCreated();

        $this->assertSame(2, HealthLog::count());
    }

    public function test_database_blocks_a_duplicate_dose_even_without_the_api_check(): void
    {
        $animal = $this->animal();
        HealthLog::create(['animal_id' => $animal->id, 'vaccine' => 'Anti-rabies', 'administered_at' => '2026-10-01']);

        $this->expectException(UniqueConstraintViolationException::class);
        HealthLog::create(['animal_id' => $animal->id, 'vaccine' => 'Anti-rabies', 'administered_at' => '2026-10-01']);
    }

    public function test_validation(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');

        $this->add($animal, [$this->record('Anti-rabies', '2026-12-01')])->assertUnprocessable();
        $this->add($animal, [$this->record('Anti-rabies', '2026-10-01', ['next_due_date' => '2026-09-01'])])->assertUnprocessable()
            ->assertJsonValidationErrors(['records.0.next_due_date']);
        $this->add($animal, [['vaccine_id' => 99999, 'administered_at' => '2026-10-01']])->assertUnprocessable()->assertJsonValidationErrors(['records.0.vaccine_id']);
        $this->postJson('/api/vaccinations', ['animal_id' => 999, 'records' => [$this->record('Anti-rabies', '2026-10-01')]])->assertUnprocessable();
        $this->assertSame(0, HealthLog::count());
    }

    public function test_vet_tech_can_add_and_the_kennel_manager_and_others_cannot(): void
    {
        $animal = $this->animal();

        $this->getJson('/api/vaccinations')->assertUnauthorized();
        $this->getJson('/api/vaccines')->assertUnauthorized();

        $this->actingAsRole('pound_staff');
        $this->getJson('/api/vaccinations')->assertOk();                                   // can view
        $this->getJson('/api/vaccines')->assertOk();
        $this->add($animal, [$this->record('Anti-rabies', '2026-10-01')])->assertForbidden();

        $this->actingAsRole('adoption_counselor');
        $this->add($animal, [$this->record('Anti-rabies', '2026-10-01')])->assertForbidden();

        // the kennel manager sees the vaccinations but does not record them
        $this->actingAsRole('kennel_manager');
        $this->getJson('/api/vaccinations')->assertOk();
        $this->add($animal, [$this->record('Anti-rabies', '2026-10-01')])->assertForbidden();
        $this->assertSame(0, HealthLog::count());

        // the vet tech does
        $this->actingAsRole('vet_tech');
        $this->add($animal, [$this->record('Anti-rabies', '2026-10-01')])->assertCreated();
        $this->assertSame(1, HealthLog::count());
    }

    /* ---------- editing ---------- */

    public function test_edit_and_delete_with_permissions_and_the_vaccinated_flag(): void
    {
        $animal = $this->animal();
        $vet = $this->actingAsRole('vet_tech');
        $this->add($animal, [$this->record('Anti-rabies', '2026-10-01')])->assertCreated();
        $log = HealthLog::first();

        $this->assertTrue($animal->fresh()->vaccinated);

        // a new date recalculates the next due date
        $this->patchJson("/api/vaccinations/{$log->id}", ['administered_at' => '2026-10-10'])->assertOk()->assertJsonPath('data.nextDue', '2027-10-10');
        $this->assertDatabaseHas('audit_logs', ['action' => 'vaccination.updated', 'entity_id' => $log->id]);

        // a next due date within 30 days is Due Soon; a past one is Overdue and the animal stops counting as vaccinated
        $this->patchJson("/api/vaccinations/{$log->id}", ['next_due_date' => '2026-10-30'])->assertOk()->assertJsonPath('data.status', 'Due Soon');
        $this->patchJson("/api/vaccinations/{$log->id}", ['administered_at' => '2025-01-01', 'next_due_date' => '2025-02-01'])->assertOk()->assertJsonPath('data.status', 'Overdue');
        $this->assertFalse($animal->fresh()->vaccinated);

        // pound staff and the kennel manager may not edit or delete
        foreach (['pound_staff', 'kennel_manager'] as $role) {
            $this->actingAsRole($role);
            $this->patchJson("/api/vaccinations/{$log->id}", ['other_vaccine_name' => 'X'])->assertForbidden();
            $this->deleteJson("/api/vaccinations/{$log->id}")->assertForbidden();
        }

        $this->app['auth']->forgetGuards();
        $this->withToken($vet->createToken('auth')->plainTextToken);
        $this->deleteJson("/api/vaccinations/{$log->id}")->assertOk();
        $this->assertDatabaseMissing('health_logs', ['id' => $log->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'vaccination.deleted']);
    }

    public function test_the_vaccine_of_a_record_can_be_changed_and_must_fit_the_species(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');
        $this->add($animal, [$this->record('Anti-rabies', '2026-10-01')])->assertCreated();
        $log = HealthLog::first();

        $this->patchJson("/api/vaccinations/{$log->id}", ['vaccine_id' => $this->vaccineId('FeLV')])->assertUnprocessable()->assertJsonValidationErrors(['vaccine_id']);

        $this->patchJson("/api/vaccinations/{$log->id}", ['vaccine_id' => $this->vaccineId('Leptospirosis')])
            ->assertOk()->assertJsonPath('data.vaccine', 'Leptospirosis');

        // to a typed vaccine: the id goes away
        $this->patchJson("/api/vaccinations/{$log->id}", ['vaccine_id' => null, 'other_vaccine_name' => 'Canine Influenza'])
            ->assertOk()->assertJsonPath('data.vaccine', 'Canine Influenza');
        $this->assertNull($log->fresh()->vaccine_id);
        $this->assertSame('Canine Influenza', $log->fresh()->other_vaccine_name);

        $this->patchJson("/api/vaccinations/{$log->id}", ['vaccine_id' => null, 'other_vaccine_name' => ''])->assertUnprocessable()->assertJsonValidationErrors(['other_vaccine_name']);
    }

    public function test_editing_into_an_existing_dose_is_refused(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');
        $this->add($animal, [
            $this->record('Anti-rabies', '2026-10-01'),
            $this->record('Anti-rabies', '2026-10-05'),
        ])->assertCreated();

        $second = HealthLog::where('administered_at', '2026-10-05')->first();
        $this->patchJson("/api/vaccinations/{$second->id}", ['administered_at' => '2026-10-01'])->assertUnprocessable();
    }

    /* ---------- the data that was there before ---------- */

    public function test_old_records_are_mapped_to_the_vaccines_table_and_unknown_names_are_kept(): void
    {
        $dog = $this->animal('Rex', 'Dog');
        $cat = $this->animal('Luna', 'Cat');

        // what the old migration step does to old free-text names
        $old = [
            [$dog, 'Rabies', 'Anti-rabies'],
            [$dog, 'DHPP / 5-in-1', '5-in-1 / DHPP'],
            [$dog, 'Bordetella', 'Kennel cough (Bordetella)'],
            [$cat, 'FVRCP / 3-in-1', '4-in-1 / FVRCP'],
            [$cat, 'FeLV', 'FeLV'],
            [$dog, 'Parvovirus', null],      // not in the table: kept as a typed name
            [$dog, 'FeLV', null],            // not a dog vaccine: kept as a typed name
        ];

        foreach ($old as $i => [$animal, $name]) {
            HealthLog::create(['animal_id' => $animal->id, 'vaccine' => $name, 'administered_at' => '2026-10-0'.($i + 1)]);
        }

        $migration = require database_path('migrations/2026_10_27_000200_add_vaccine_id_to_health_logs.php');
        $method = new \ReflectionMethod($migration, 'mapExistingRecords');
        $method->invoke($migration);

        foreach ($old as $i => [, $name, $mapped]) {
            $log = HealthLog::where('administered_at', '2026-10-0'.($i + 1))->firstOrFail();

            if ($mapped) {
                $this->assertSame($this->vaccineId($mapped), $log->vaccine_id, $name);
                $this->assertSame($mapped, $log->vaccine);
                $this->assertNull($log->other_vaccine_name);
            } else {
                $this->assertNull($log->vaccine_id, $name);
                $this->assertSame($name, $log->other_vaccine_name);
            }
        }
    }
}

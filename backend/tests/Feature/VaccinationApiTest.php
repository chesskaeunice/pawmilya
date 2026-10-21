<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\HealthLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    private function animal(string $name = 'Milo'): Animal
    {
        return Animal::create([
            'name' => $name, 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male', 'age_months' => 24,
            'location' => 'Main', 'status' => 'Rescued', 'health_status' => 'Under Observation', 'personality' => ['Calm'],
        ]);
    }

    private function add(Animal $animal, array $records)
    {
        return $this->postJson('/api/vaccinations', ['animal_id' => $animal->id, 'records' => $records]);
    }

    public function test_vet_tech_adds_a_batch_and_the_next_due_date_follows_the_vaccine_interval(): void
    {
        $animal = $this->animal();
        $vet = $this->actingAsRole('vet_tech');

        $this->add($animal, [
            ['vaccine' => 'Rabies', 'administered_at' => '2026-10-01'],
            ['vaccine' => 'Bordetella', 'administered_at' => '2026-10-01'],
            ['vaccine' => 'DHPP / 5-in-1', 'administered_at' => '2026-10-01', 'next_due_date' => '2026-11-15'],
        ])->assertCreated()->assertJsonCount(3, 'data');

        $this->assertSame('2027-10-01', HealthLog::where('vaccine', 'Rabies')->first()->next_due_date->toDateString());
        $this->assertSame('2027-03-30', HealthLog::where('vaccine', 'Bordetella')->first()->next_due_date->toDateString()); // 180 days
        $this->assertSame('2026-11-15', HealthLog::where('vaccine', 'DHPP / 5-in-1')->first()->next_due_date->toDateString());
        $this->assertSame($vet->id, HealthLog::first()->recorded_by);
        $this->assertSame(3, \App\Models\AuditLog::where('action', 'vaccination.created')->count());
    }

    public function test_status_is_up_to_date_due_soon_or_overdue(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('kennel_manager');

        $this->add($animal, [
            ['vaccine' => 'Old', 'administered_at' => '2025-09-01', 'next_due_date' => '2026-10-01'],      // past
            ['vaccine' => 'Soon', 'administered_at' => '2026-09-25', 'next_due_date' => '2026-11-05'],     // within 30 days
            ['vaccine' => 'Fine', 'administered_at' => '2026-10-01', 'next_due_date' => '2027-10-01'],     // later
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

        $this->add($animal, [['vaccine' => 'Rabies', 'administered_at' => '2026-10-01']])->assertCreated();

        // already recorded (spacing and case do not matter for the same stored name)
        $this->add($animal, [['vaccine' => 'Rabies', 'administered_at' => '2026-10-01']])->assertUnprocessable();
        // listed twice in one request
        $this->add($animal, [
            ['vaccine' => 'FeLV', 'administered_at' => '2026-10-02'],
            ['vaccine' => 'felv', 'administered_at' => '2026-10-02'],
        ])->assertUnprocessable();
        // a different date is a new dose
        $this->add($animal, [['vaccine' => 'Rabies', 'administered_at' => '2026-10-10']])->assertCreated();

        $this->assertSame(2, HealthLog::count());
    }

    public function test_database_blocks_a_duplicate_dose_even_without_the_api_check(): void
    {
        $animal = $this->animal();
        HealthLog::create(['animal_id' => $animal->id, 'vaccine' => 'Rabies', 'administered_at' => '2026-10-01']);

        $this->expectException(UniqueConstraintViolationException::class);
        HealthLog::create(['animal_id' => $animal->id, 'vaccine' => 'Rabies', 'administered_at' => '2026-10-01']);
    }

    public function test_validation(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');

        $this->add($animal, [['vaccine' => 'Rabies', 'administered_at' => '2026-12-01']])->assertUnprocessable();
        $this->add($animal, [['vaccine' => 'Rabies', 'administered_at' => '2026-10-01', 'next_due_date' => '2026-09-01']])->assertUnprocessable();
        $this->add($animal, [['vaccine' => '', 'administered_at' => '2026-10-01']])->assertUnprocessable();
        $this->postJson('/api/vaccinations', ['animal_id' => 999, 'records' => [['vaccine' => 'Rabies', 'administered_at' => '2026-10-01']]])->assertUnprocessable();
        $this->assertSame(0, HealthLog::count());
    }

    public function test_permissions(): void
    {
        $animal = $this->animal();

        $this->getJson('/api/vaccinations')->assertUnauthorized();

        $this->actingAsRole('pound_staff');
        $this->getJson('/api/vaccinations')->assertOk();                                   // can view
        $this->add($animal, [['vaccine' => 'Rabies', 'administered_at' => '2026-10-01']])->assertForbidden();

        $this->actingAsRole('adoption_counselor');
        $this->add($animal, [['vaccine' => 'Rabies', 'administered_at' => '2026-10-01']])->assertForbidden();
    }

    public function test_edit_and_delete_with_permissions_and_the_vaccinated_flag(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');
        $this->add($animal, [['vaccine' => 'Rabies', 'administered_at' => '2026-10-01']])->assertCreated();
        $log = HealthLog::first();

        $this->assertTrue($animal->fresh()->vaccinated);

        // a new date recalculates the next due date
        $this->patchJson("/api/vaccinations/{$log->id}", ['administered_at' => '2026-10-10'])->assertOk()->assertJsonPath('data.nextDue', '2027-10-10');
        $this->assertDatabaseHas('audit_logs', ['action' => 'vaccination.updated', 'entity_id' => $log->id]);

        // a next due date within 30 days is Due Soon; a past one is Overdue and the animal stops counting as vaccinated
        $this->patchJson("/api/vaccinations/{$log->id}", ['next_due_date' => '2026-10-30'])->assertOk()->assertJsonPath('data.status', 'Due Soon');
        $this->patchJson("/api/vaccinations/{$log->id}", ['administered_at' => '2025-01-01', 'next_due_date' => '2025-02-01'])->assertOk()->assertJsonPath('data.status', 'Overdue');
        $this->assertFalse($animal->fresh()->vaccinated);

        // pound staff may not edit or delete
        $this->actingAsRole('pound_staff');
        $this->patchJson("/api/vaccinations/{$log->id}", ['vaccine' => 'X'])->assertForbidden();
        $this->deleteJson("/api/vaccinations/{$log->id}")->assertForbidden();

        $this->actingAsRole('kennel_manager');
        $this->deleteJson("/api/vaccinations/{$log->id}")->assertOk();
        $this->assertDatabaseMissing('health_logs', ['id' => $log->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'vaccination.deleted']);
    }

    public function test_editing_into_an_existing_dose_is_refused(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');
        $this->add($animal, [
            ['vaccine' => 'Rabies', 'administered_at' => '2026-10-01'],
            ['vaccine' => 'Rabies', 'administered_at' => '2026-10-05'],
        ])->assertCreated();

        $second = HealthLog::where('administered_at', '2026-10-05')->first();
        $this->patchJson("/api/vaccinations/{$second->id}", ['administered_at' => '2026-10-01'])->assertUnprocessable();
    }
}

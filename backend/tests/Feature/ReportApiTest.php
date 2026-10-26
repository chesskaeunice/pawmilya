<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\AuditLog;
use App\Models\HealthLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// The Reports page reads its data from /api/reports/*: each report checks its own permission
class ReportApiTest extends TestCase
{
    use RefreshDatabase;

    private const REPORTS = ['animals', 'adoptions', 'missing-pets', 'vaccinations', 'health'];

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-10-26 09:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function as(?string $role): ?User
    {
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        if (! $role) {
            return null;
        }

        $user = new User(['name' => $role, 'email' => $role.'@test.com', 'password' => 'password123']);
        $user->role = $role;
        $user->save();
        $this->withToken($user->createToken('t')->plainTextToken);

        return $user;
    }

    private function animal(array $override = []): Animal
    {
        return Animal::create(array_merge([
            'name' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male', 'age_months' => 24,
            'location' => 'Main', 'status' => 'Rescued', 'health_status' => 'Under Observation', 'personality' => ['Calm'],
            'rescued_at' => '2026-10-16',
        ], $override));
    }

    public function test_each_role_reads_only_its_own_reports(): void
    {
        $allowed = [
            'kennel_manager' => self::REPORTS,
            'vet_tech' => ['animals', 'vaccinations', 'health'],
            'adoption_counselor' => ['animals', 'adoptions', 'missing-pets'],
            'pound_staff' => [],
            'citizen' => [],
        ];

        foreach ($allowed as $role => $reports) {
            $this->as($role);

            foreach (self::REPORTS as $report) {
                $response = $this->getJson("/api/reports/$report");

                in_array($report, $reports, true)
                    ? $response->assertOk()
                    : $response->assertForbidden();
            }
        }
    }

    public function test_guests_get_401_on_every_report(): void
    {
        foreach (self::REPORTS as $report) {
            $this->getJson("/api/reports/$report")->assertUnauthorized();
        }
    }

    public function test_specific_cross_role_reads_are_blocked(): void
    {
        // the vet tech cannot read the adoption and missing pet reports
        $this->as('vet_tech');
        $this->getJson('/api/reports/adoptions')->assertForbidden();
        $this->getJson('/api/reports/missing-pets')->assertForbidden();

        // the counselor cannot read the vaccination and health reports
        $this->as('adoption_counselor');
        $this->getJson('/api/reports/vaccinations')->assertForbidden();
        $this->getJson('/api/reports/health')->assertForbidden();
    }

    public function test_the_health_report_shows_how_long_each_animal_has_had_its_health_status(): void
    {
        $observed = $this->animal(['name' => 'Rex', 'rescued_at' => '2026-10-16']);               // never changed: since rescue
        $treated = $this->animal(['name' => 'Bantay', 'health_status' => 'Under Treatment', 'rescued_at' => '2026-09-01']);
        $cleared = $this->animal(['name' => 'Luna', 'species' => 'Cat', 'health_status' => 'Cleared', 'rescued_at' => '2026-09-10']);

        HealthLog::create(['animal_id' => $cleared->id, 'vaccine' => 'FeLV', 'administered_at' => '2026-10-01']);

        // Bantay's health status was last changed on 2026-10-21 (an older change does not count)
        foreach (['2026-10-01', '2026-10-21'] as $day) {
            $log = AuditLog::create([
                'action' => 'animal.updated', 'entity_type' => 'Animal', 'entity_id' => $treated->id,
                'details' => ['from' => ['health_status' => 'Under Observation'], 'to' => ['health_status' => 'Under Treatment']],
            ]);
            $log->forceFill(['created_at' => "$day 10:00:00"])->save();
        }

        // a change of another field does not move the date
        $other = AuditLog::create([
            'action' => 'animal.updated', 'entity_type' => 'Animal', 'entity_id' => $treated->id,
            'details' => ['from' => ['color' => 'Black'], 'to' => ['color' => 'Brown']],
        ]);
        $other->forceFill(['created_at' => '2026-10-25 10:00:00'])->save();

        $this->as('vet_tech');
        $rows = collect($this->getJson('/api/reports/health')->assertOk()->json('data'))->keyBy('name');

        $this->assertSame(10, $rows['Rex']['daysInStatus']);        // 16 -> 26 October
        $this->assertSame('2026-10-16', $rows['Rex']['since']);
        $this->assertSame(5, $rows['Bantay']['daysInStatus']);      // changed on 21 October
        $this->assertSame('Under Treatment', $rows['Bantay']['healthStatus']);
        $this->assertSame(1, $rows['Luna']['vaccineCount']);
        $this->assertSame(0, $rows['Rex']['vaccineCount']);
        $this->assertSame('Cat', $rows['Luna']['type']);
    }

    public function test_the_other_reports_return_the_same_data_as_the_lists_they_replace(): void
    {
        $animal = $this->animal();
        HealthLog::create(['animal_id' => $animal->id, 'vaccine' => 'Anti-rabies', 'administered_at' => '2026-10-01', 'next_due_date' => '2027-10-01']);

        $this->as('vet_tech');
        $this->getJson('/api/reports/animals')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.animal_code', $animal->animal_code);
        $this->getJson('/api/reports/vaccinations')->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.vaccine', 'Anti-rabies')->assertJsonPath('data.0.petId', $animal->id);
    }
}

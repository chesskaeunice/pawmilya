<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\AuditLog;
use App\Models\MissingPetReport;
use App\Models\User;
use App\Support\ReleaseUnclaimedReports;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// Days 0-7: Rescued, no health clearance, not adoptable. After day 7 the report is "For Adoption" and the
// pet waits for the vet; when the vet sets it to Cleared it becomes Available for Adoption at once.
class UnclaimedReportsTest extends TestCase
{
    use RefreshDatabase;

    private Carbon $start;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->start = Carbon::create(2026, 11, 2, 9, 0, 0, 'Asia/Manila');
        Carbon::setTestNow($this->start);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function as(?string $role): static
    {
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        if (! $role) {
            return $this;
        }

        $user = User::where('role', $role)->first() ?? tap(new User(['name' => ucfirst($role), 'email' => $role.'@test.com', 'password' => 'Str0ng!Passw0rd']), function ($u) use ($role) {
            $u->role = $role;
            $u->save();
        });

        return $this->withToken($user->createToken('t')->plainTextToken);
    }

    private function png(string $name): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    // A guest report: Rescued, with its animal and a claim deadline 7 days out
    private function submitReport(): array
    {
        $this->as(null)->post('/api/missing-pets', [
            'name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Gray',
            'location' => 'Katipunan, Quezon City', 'last_seen_at' => '2026-10-30 01:15:00',
            'details' => 'Friendly.', 'contact_name' => 'Liza Ramos', 'contact_number' => '0919 555 0166', 'contact_email' => 'reporter@example.com', 'reporter_type' => 'Citizen',
            'pet_images' => [$this->png('p1.png'), $this->png('p2.png')],
            'last_seen_images' => [$this->png('l1.png')],
        ], ['Accept' => 'application/json'])->assertCreated();

        $report = MissingPetReport::firstOrFail();

        return [$report, Animal::findOrFail($report->animal_id)];
    }

    private function afterDeadline(): void
    {
        Carbon::setTestNow($this->start->copy()->addDays(7)->addMinute());
    }

    private function clear(Animal $animal)
    {
        return $this->as('vet_tech')->patchJson("/api/animals/{$animal->id}", ['health_status' => 'Cleared']);
    }

    public function test_a_report_is_not_moved_before_the_deadline(): void
    {
        [$report] = $this->submitReport();

        Carbon::setTestNow($this->start->copy()->addDays(7)->subMinute());

        $this->assertSame(0, app(ReleaseUnclaimedReports::class)->run());
        $this->assertSame('Rescued', $report->fresh()->status);
    }

    public function test_a_report_is_moved_to_for_adoption_after_the_deadline_and_logged_by_the_system(): void
    {
        [$report, $animal] = $this->submitReport();
        $this->afterDeadline();

        $this->assertSame(1, app(ReleaseUnclaimedReports::class)->run());

        $this->assertSame('For Adoption', $report->fresh()->status);
        $log = AuditLog::where('action', 'missing_pet.status_changed')->where('entity_id', $report->id)->firstOrFail();
        $this->assertNull($log->user_id);
        $this->assertSame('system', $log->details['by']);
        $this->assertSame('For Adoption', $log->details['to']);

        // not Cleared yet: the animal stays Rescued
        $this->assertSame('Rescued', $animal->fresh()->status);
    }

    public function test_running_the_command_twice_changes_nothing_twice(): void
    {
        [$report] = $this->submitReport();
        $this->afterDeadline();

        Artisan::call('reports:release-unclaimed');
        Artisan::call('reports:release-unclaimed');

        $this->assertSame('For Adoption', $report->fresh()->status);
        $this->assertSame(1, AuditLog::where('action', 'missing_pet.status_changed')->where('entity_id', $report->id)->count());
    }

    public function test_the_vet_cannot_set_cleared_during_the_claim_period(): void
    {
        [, $animal] = $this->submitReport();

        $response = $this->clear($animal)->assertUnprocessable()->assertJsonValidationErrors('health_status');
        $this->assertStringContainsString('claim period until Nov 9, 2026', $response->json('errors.health_status.0'));
        $this->assertStringContainsString('Health clearance opens after that', $response->json('errors.health_status.0'));
        $this->assertSame('Under Observation', $animal->fresh()->health_status);

        // other health changes stay allowed during the claim period
        $this->as('vet_tech')->patchJson("/api/animals/{$animal->id}", ['health_status' => 'Under Treatment'])->assertOk();
        $this->as('vet_tech')->patchJson("/api/animals/{$animal->id}", ['health_status' => 'Under Observation'])->assertOk();
        $this->getJson('/api/pets')->assertJsonCount(0, 'data');
    }

    public function test_after_the_release_the_pet_waits_for_the_vet_and_is_not_public_until_cleared(): void
    {
        [$report, $animal] = $this->submitReport();
        $this->afterDeadline();
        app(ReleaseUnclaimedReports::class)->run();

        // released: still Rescued, not on Adoptable Pets, shown in the vet's clearance queue
        $this->assertSame('For Adoption', $report->fresh()->status);
        $this->assertSame('Rescued', $animal->fresh()->status);
        $this->getJson('/api/pets')->assertJsonCount(0, 'data');
        $this->as('vet_tech')->getJson('/api/animals')->assertOk()
            ->assertJsonPath('data.0.claimEndedAt', fn ($v) => $v !== null)
            ->assertJsonPath('data.0.claimDeadlineAt', null);

        // the vet clears it: Available for Adoption in the same update, logged by the system
        $this->clear($animal)->assertOk()->assertJsonPath('data.status', 'Available for Adoption');
        $this->assertSame('Available for Adoption', $animal->fresh()->status);
        $log = AuditLog::where('action', 'animal.status_changed')->where('entity_id', $animal->id)->firstOrFail();
        $this->assertNull($log->user_id);
        $this->assertSame('system', $log->details['by']);
        $this->getJson('/api/pets')->assertJsonCount(1, 'data');
    }
    public function test_clearing_after_the_deadline_works_even_if_the_scheduler_never_ran(): void
    {
        [$report, $animal] = $this->submitReport();
        $this->afterDeadline(); // nobody released the report yet

        $this->clear($animal)->assertOk()->assertJsonPath('data.status', 'Available for Adoption');
        $this->assertSame('For Adoption', $report->fresh()->status);
    }

    public function test_manual_available_for_adoption_is_refused_during_the_claim_period(): void
    {
        [, $animal] = $this->submitReport();

        foreach (['vet_tech', 'adoption_counselor'] as $role) {
            $response = $this->as($role)->patchJson("/api/animals/{$animal->id}", ['status' => 'Available for Adoption'])
                ->assertUnprocessable()->assertJsonValidationErrors('status');
            $this->assertStringContainsString('claim period until Nov 9, 2026', $response->json('errors.status.0'));
        }

        $this->assertSame('Rescued', $animal->fresh()->status);
        $this->getJson('/api/pets')->assertJsonCount(0, 'data');
    }
    public function test_the_claim_deadline_is_shown_to_staff_only_while_the_claim_period_runs(): void
    {
        [, $animal] = $this->submitReport();

        $this->as('vet_tech')->getJson("/api/animals/{$animal->id}")->assertOk()->assertJsonPath('data.claimDeadlineAt', fn ($v) => $v !== null);

        $this->afterDeadline();
        $this->as('vet_tech')->getJson("/api/animals/{$animal->id}")->assertOk()->assertJsonPath('data.claimDeadlineAt', null);
    }

    public function test_animals_not_from_a_report_are_unaffected(): void
    {
        $animal = Animal::create([
            'name' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male',
            'location' => 'Kennel A', 'status' => 'Rescued', 'health_status' => 'Cleared',
            'description' => 'Friendly.', 'personality' => ['Friendly'],
        ]);
        [$report] = $this->submitReport();
        $this->afterDeadline();

        app(ReleaseUnclaimedReports::class)->run();
        $this->assertSame('Rescued', $animal->fresh()->status); // nothing moves it by itself

        // the normal rule: the counselor can make a Cleared animal adoptable
        $this->as('adoption_counselor')->patchJson("/api/animals/{$animal->id}", ['status' => 'Available for Adoption'])->assertOk();
        $this->assertSame('Available for Adoption', $animal->fresh()->status);
    }

    public function test_the_public_and_staff_lists_release_due_reports_and_for_adoption_is_not_a_manual_choice(): void
    {
        [$report] = $this->submitReport();
        $this->afterDeadline();

        $this->as(null)->getJson('/api/missing-pets')->assertOk()->assertJsonPath('data.0.status', 'For Adoption');
        $this->assertNotNull($this->getJson('/api/missing-pets')->json('data.0.claimDeadlineAt'));
        $this->as('pound_staff')->getJson('/api/missing-pet-reports')->assertOk()->assertJsonPath('data.0.status', 'For Adoption');

        // staff cannot set it, and cannot pull a released report back to Rescued
        $this->as('pound_staff')->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'For Adoption'])->assertUnprocessable();
        $this->as('pound_staff')->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Rescued'])->assertUnprocessable();
        $this->as('pound_staff')->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Reunited'])->assertOk();
    }

    public function test_the_list_releases_a_due_report_before_the_cached_answer(): void
    {
        $this->submitReport();

        $this->as(null)->getJson('/api/missing-pets')->assertJsonPath('data.0.status', 'Rescued'); // fills the cache

        $this->afterDeadline();
        $this->getJson('/api/missing-pets')->assertJsonPath('data.0.status', 'For Adoption');
    }
}

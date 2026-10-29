<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\AuditLog;
use App\Models\MissingPetReport;
use App\Models\User;
use App\Support\ReportAnimalRegistrar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

// Pound staff setting a report to Rescued registers the pet as an animal (same logic as the register button)
class AutoRegisterOnFoundTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('s3');
    }

    private function as(?string $role): ?User
    {
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        if (! $role) {
            return null;
        }

        $user = User::where('role', $role)->first() ?? tap(new User(['name' => ucfirst($role), 'email' => $role.'@test.com', 'phone' => '0917 000 1111', 'password' => 'Str0ng!Passw0rd']), function ($u) use ($role) {
            $u->role = $role;
            $u->save();
        });

        $this->withToken($user->createToken('t')->plainTextToken);

        return $user;
    }

    private function report(string $status = 'Lost'): MissingPetReport
    {
        $report = new MissingPetReport([
            'name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Orange', 'sex' => 'Female',
            'location' => 'Hidalgo Street, Quiapo, Manila', 'last_seen_at' => '2026-10-20 08:00:00',
            'details' => 'Wears a red collar.', 'contact_name' => 'Maria Santos', 'contact_number' => '0917 123 4567', 'contact_email' => 'reporter@example.com',
        ]);
        $report->status = $status;
        $report->fingerprint = sha1(uniqid('', true));
        $report->save();

        $path = "missing-pets/{$report->id}/pet-a.jpg";
        Storage::disk('s3')->put($path, 'photo');
        $report->photos()->create(['path' => $path, 'kind' => 'pet', 'position' => 0]);

        return $report;
    }

    private function setStatus(MissingPetReport $report, string $status)
    {
        return $this->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => $status]);
    }

    private function png(string $name): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    public function test_setting_a_report_to_rescued_creates_and_links_one_animal(): void
    {
        $user = $this->as('pound_staff');
        $report = $this->report('Lost');

        $response = $this->setStatus($report, 'Rescued')->assertOk()->assertJsonPath('data.status', 'Rescued');

        $animal = Animal::firstOrFail();
        $this->assertSame(1, Animal::count());
        $response->assertJsonPath('data.animal_id', $animal->id);
        $this->assertSame($animal->id, $report->fresh()->animal_id);
        $this->assertSame('Miming', $animal->name);
        $this->assertSame('Rescued', $animal->status);
        $this->assertSame($user->id, $animal->created_by);
        $this->assertCount(1, $animal->photos);
        Storage::disk('s3')->assertExists($animal->photos->first()->path);

        // the 7-day claim period starts the first time the report is Rescued
        $this->assertNotNull($report->fresh()->claim_deadline_at);
        $this->assertDatabaseHas('audit_logs', ['action' => 'missing_pet.status_changed', 'entity_id' => $report->id]);
        $log = AuditLog::where('action', 'animal.created')->where('entity_id', $animal->id)->firstOrFail();
        $this->assertSame('missing_pet_report', $log->details['source']);
        $this->assertSame($report->id, $log->details['report_id']);
    }

    public function test_rescued_again_or_rescued_after_another_status_creates_no_second_animal(): void
    {
        $this->as('pound_staff');
        $report = $this->report('Lost');

        $this->setStatus($report, 'Rescued')->assertOk();
        $deadline = $report->fresh()->claim_deadline_at;
        $this->setStatus($report, 'Rescued')->assertOk();   // same status again
        $this->setStatus($report, 'Lost')->assertOk();
        $this->setStatus($report, 'Rescued')->assertOk();   // back to Rescued: already linked

        // the claim deadline is set once and never moved
        $this->assertTrue($deadline->equalTo($report->fresh()->claim_deadline_at));

        $this->assertSame(1, Animal::count());
        $this->assertSame(1, AuditLog::where('action', 'animal.created')->count());
        $this->assertSame(Animal::first()->id, $report->fresh()->animal_id);
    }

    public function test_other_statuses_create_no_animal(): void
    {
        $this->as('pound_staff');
        $report = $this->report('Lost');

        $this->setStatus($report, 'Sighted')->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->setStatus($report, 'Reunited')->assertOk();

        $this->assertSame(0, Animal::count());
        $this->assertNull($report->fresh()->animal_id);
    }

    public function test_a_public_report_filed_with_the_old_sighted_status_is_rejected(): void
    {
        $this->as(null);

        $this->post('/api/missing-pets', [
            'name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Gray',
            'location' => 'Quiapo, Manila', 'last_seen_at' => '2026-10-18 01:15:00', 'status' => 'Sighted',
            'details' => 'Friendly.', 'contact_name' => 'Liza Ramos', 'contact_number' => '0919 555 0166', 'contact_email' => 'reporter@example.com', 'reporter_type' => 'Citizen',
            'pet_images' => [$this->png('p1.png'), $this->png('p2.png')],
            'last_seen_images' => [$this->png('l1.png')],
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('status');

        $this->assertSame(0, MissingPetReport::count());
        $this->assertSame(0, Animal::count());
    }

    public function test_if_registering_fails_the_status_change_is_rolled_back(): void
    {
        $this->as('pound_staff');
        $report = $this->report('Lost');

        $this->mock(ReportAnimalRegistrar::class, fn ($mock) => $mock->shouldReceive('register')->andThrow(new RuntimeException('boom')));

        $this->setStatus($report, 'Rescued')->assertUnprocessable()->assertJsonValidationErrors('status');

        $this->assertSame('Lost', $report->fresh()->status);
        $this->assertNull($report->fresh()->animal_id);
        $this->assertSame(0, Animal::count());
        $this->assertSame(0, AuditLog::where('action', 'missing_pet.status_changed')->count());
    }

    public function test_kennel_manager_and_adoption_counselor_still_get_403(): void
    {
        $report = $this->report('Lost');

        foreach (['kennel_manager', 'adoption_counselor'] as $role) {
            $this->as($role);
            $this->setStatus($report, 'Rescued')->assertForbidden();
        }

        $this->assertSame('Lost', $report->fresh()->status);
        $this->assertSame(0, Animal::count());
    }
}

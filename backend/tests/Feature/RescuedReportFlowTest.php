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

// Submitting a report hands the pet to the pound: the report is Rescued at once, the pet becomes an
// animal with a QR token, and the owner has 7 days to claim it.
class RescuedReportFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    private function png(string $name): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    // The form sends no status: every submitted report is a Rescued report
    private function submit(array $override = [])
    {
        return $this->post('/api/missing-pets', array_merge([
            'name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Gray',
            'location' => 'Katipunan, Quezon City', 'last_seen_at' => '2026-10-18 01:15:00',
            'details' => 'Friendly.', 'contact_name' => 'Liza Ramos', 'contact_number' => '0919 555 0166', 'reporter_type' => 'Citizen',
            'pet_images' => [$this->png('p1.png'), $this->png('p2.png')],
            'last_seen_images' => [$this->png('l1.png')],
        ], $override), ['Accept' => 'application/json']);
    }

    private function citizen(): User
    {
        $user = new User(['name' => 'Citizen', 'email' => 'c@test.com', 'phone' => '0917 000 1111', 'password' => 'Str0ng!Passw0rd']);
        $user->role = 'citizen';
        $user->save();

        return $user;
    }

    public function test_submit_creates_a_rescued_report_an_animal_and_a_qr_token(): void
    {
        $response = $this->submit()->assertCreated()->assertJsonPath('data.status', 'Rescued');

        $report = MissingPetReport::findOrFail($response->json('data.id'));
        $animal = Animal::findOrFail($report->animal_id);

        $this->assertSame('Rescued', $report->status);
        $this->assertSame(1, Animal::count());
        $this->assertSame('Rescued', $animal->status);
        $this->assertSame('Miming', $animal->name);
        $this->assertNotEmpty($animal->qr_token);
        $this->assertMatchesRegularExpression('/^PAW-\d{4}$/', $animal->animal_code);
        $this->assertNull($animal->created_by); // guest report
        $this->assertCount(2, $animal->photos);  // the pet photos are copied
        $this->assertCount(3, $report->photos);
    }

    public function test_a_citizen_report_is_registered_too(): void
    {
        $citizen = $this->citizen();
        $this->withToken($citizen->createToken('t')->plainTextToken);

        $response = $this->submit(['contact_name' => null, 'contact_number' => null])->assertCreated();

        $this->assertSame($citizen->id, MissingPetReport::first()->reporter_id);
        $this->assertSame(1, Animal::count());
        $this->assertNotNull($response->json('data.claimDeadlineAt'));
    }

    public function test_the_qr_page_shows_the_pound_and_never_the_reporters_contact(): void
    {
        $this->submit(['contact_name' => 'Liza Ramos', 'contact_number' => '0919 555 0166', 'contact_email' => 'liza@example.com'])->assertCreated();
        $animal = Animal::firstOrFail();

        $this->assertNull($animal->owner_name);
        $this->assertNull($animal->owner_contact);

        $response = $this->getJson("/api/stray/{$animal->qr_token}")->assertOk();

        // no owner of its own: the page shows the pound's name, phone and address
        $response->assertJsonPath('data.owner', null)
            ->assertJsonPath('data.name', 'Miming')
            ->assertJsonStructure(['pound' => ['name', 'phone', 'address']]);
        $this->assertNotEmpty($response->json('pound.name'));

        $body = $response->getContent();
        foreach (['Liza Ramos', '0919 555 0166', '09195550166', 'liza@example.com'] as $private) {
            $this->assertStringNotContainsString($private, $body);
        }
    }

    public function test_the_claim_deadline_is_seven_days_out_and_public(): void
    {
        $this->travelTo(now()->setTimezone('Asia/Manila')->setDateTime(2026, 10, 26, 9, 0, 0));

        $response = $this->submit()->assertCreated();
        $report = MissingPetReport::first();

        $this->assertSame('Asia/Manila', config('app.timezone'));
        $this->assertTrue($report->claim_deadline_at->equalTo(now()->addDays(7)));
        $this->assertSame('2026-11-02 09:00:00', $report->claim_deadline_at->format('Y-m-d H:i:s'));

        // shown to everybody, in the list and on the details page
        $this->assertNotNull($response->json('data.claimDeadlineAt'));
        $this->getJson("/api/missing-pets/{$report->id}")->assertOk()->assertJson(fn ($json) => $json->has('data.claimDeadlineAt')->etc());
        $this->assertNotNull($this->getJson('/api/missing-pets')->json('data.0.claimDeadlineAt'));
    }

    public function test_a_double_submit_creates_one_report_and_one_animal(): void
    {
        $this->submit()->assertCreated();
        $this->submit()->assertUnprocessable()->assertJsonValidationErrors('name');

        $this->assertSame(1, MissingPetReport::count());
        $this->assertSame(1, Animal::count());
    }

    public function test_the_old_sighted_and_found_statuses_are_rejected(): void
    {
        foreach (['Sighted', 'Found', 'Lost', 'For Adoption', 'Reunited'] as $status) {
            $this->submit(['status' => $status])->assertUnprocessable()->assertJsonValidationErrors('status');
        }

        $this->assertSame(0, MissingPetReport::count());
        $this->assertSame(0, Animal::count());
        $this->assertSame(['Lost', 'Rescued', 'For Adoption', 'Reunited'], MissingPetReport::STATUSES);
    }

    public function test_the_automatic_registration_is_in_the_audit_log(): void
    {
        $this->submit()->assertCreated();
        $animal = Animal::firstOrFail();

        $log = AuditLog::where('action', 'animal.created')->where('entity_id', $animal->id)->firstOrFail();
        $this->assertSame('missing_pet_report', $log->details['source']);
        $this->assertTrue($log->details['automatic']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'missing_pet.reported']);
    }

    public function test_if_the_registration_fails_nothing_is_saved(): void
    {
        $this->mock(ReportAnimalRegistrar::class, fn ($mock) => $mock->shouldReceive('register')->andThrow(new RuntimeException('boom')));

        $this->withoutExceptionHandling();

        try {
            $this->submit();
            $this->fail('The exception should have been thrown.');
        } catch (RuntimeException $e) {
            $this->assertSame('boom', $e->getMessage());
        }

        $this->assertSame(0, MissingPetReport::count());
        $this->assertSame(0, Animal::count());
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_staff_changing_a_rescued_report_to_rescued_again_creates_no_second_animal(): void
    {
        $this->submit()->assertCreated();
        $report = MissingPetReport::firstOrFail();
        $deadline = $report->claim_deadline_at;

        $staff = new User(['name' => 'Staff', 'email' => 'staff@test.com', 'password' => 'Str0ng!Passw0rd']);
        $staff->role = 'pound_staff';
        $staff->save();
        $this->flushHeaders();
        $this->withToken($staff->createToken('t')->plainTextToken);

        $this->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Lost'])->assertOk();
        $this->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Rescued'])->assertOk();

        $this->assertSame(1, Animal::count());
        $this->assertTrue($deadline->equalTo($report->fresh()->claim_deadline_at));
    }
}

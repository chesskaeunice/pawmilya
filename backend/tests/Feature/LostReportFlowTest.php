<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\MissingPetReport;
use App\Models\User;
use App\Support\ReleaseUnclaimedReports;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// Two kinds of report, decided by reporter_type: a concerned Citizen hands the pet to the pound (Rescued,
// animal, QR, 7-day claim period); an Owner reports a missing pet (Lost: no animal, no QR, no claims).
class LostReportFlowTest extends TestCase
{
    use RefreshDatabase;

    private Carbon $start;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Storage::fake('local');
        $this->start = Carbon::create(2026, 11, 2, 9, 0, 0, 'Asia/Manila');
        Carbon::setTestNow($this->start);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function user(string $role, ?string $email = null): User
    {
        $email ??= $role.'@test.com';

        return User::where('email', $email)->first() ?? tap(
            new User(['name' => ucfirst($role), 'email' => $email, 'phone' => '0917 000 1111', 'password' => 'Str0ng!Passw0rd']),
            function ($u) use ($role) {
                $u->role = $role;
                $u->save();
            }
        );
    }

    private function as(?User $user): static
    {
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        return $user ? $this->withToken($user->createToken('t')->plainTextToken) : $this;
    }

    private function png(string $name = 'p.png'): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    private function submit(string $type, ?User $as = null, array $override = [])
    {
        return $this->as($as)->post('/api/missing-pets', array_merge([
            'name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Gray',
            'location' => 'Katipunan, Quezon City', 'last_seen_at' => '2026-10-30 01:15:00',
            'details' => 'Friendly.', 'contact_name' => 'Liza Ramos', 'contact_number' => '0919 555 0166',
            'contact_email' => 'liza@example.com', 'reporter_type' => $type,
            'pet_images' => [$this->png('p1.png'), $this->png('p2.png')],
            'last_seen_images' => [$this->png('l1.png')],
        ], $override), ['Accept' => 'application/json']);
    }

    private function lostReport(?User $as = null): MissingPetReport
    {
        $id = $this->submit('Owner', $as)->assertCreated()->json('data.id');

        return MissingPetReport::findOrFail($id);
    }

    /* ---------- filing ---------- */

    public function test_a_citizen_report_is_rescued_with_an_animal_a_qr_and_a_claim_deadline(): void
    {
        $response = $this->submit('Citizen')->assertCreated()->assertJsonPath('data.status', 'Rescued');

        $report = MissingPetReport::findOrFail($response->json('data.id'));
        $animal = Animal::findOrFail($report->animal_id);

        $this->assertSame('Rescued', $report->status);
        $this->assertNotEmpty($animal->qr_token);
        $this->assertSame('2026-11-09 09:00:00', $report->claim_deadline_at->format('Y-m-d H:i:s'));
        $this->assertNotNull($response->json('data.claimDeadlineAt'));
    }

    public function test_an_owner_report_is_lost_with_no_animal_no_qr_and_no_claim_deadline(): void
    {
        $response = $this->submit('Owner')->assertCreated()->assertJsonPath('data.status', 'Lost');

        $report = MissingPetReport::findOrFail($response->json('data.id'));

        $this->assertSame('Lost', $report->status);
        $this->assertNull($report->animal_id);
        $this->assertNull($report->claim_deadline_at);
        $this->assertNull($response->json('data.claimDeadlineAt'));
        $this->assertSame(0, Animal::count()); // no animal, so no qr_token anywhere
        $this->assertCount(3, $report->photos); // 2 pet photos + 1 last seen photo
        $this->assertDatabaseMissing('audit_logs', ['action' => 'animal.created']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'missing_pet.reported', 'entity_id' => $report->id]);
    }

    public function test_an_owner_report_still_needs_the_photos_and_the_contact_details(): void
    {
        $this->submit('Owner', null, ['pet_images' => [$this->png()]])->assertUnprocessable()->assertJsonValidationErrors('pet_images');
        $this->submit('Owner', null, ['last_seen_images' => []])->assertUnprocessable()->assertJsonValidationErrors('last_seen_images');
        $this->submit('Owner', null, ['contact_name' => null, 'contact_number' => null])->assertUnprocessable()->assertJsonValidationErrors(['contact_name', 'contact_number']);

        $this->assertSame(0, MissingPetReport::count());
    }

    public function test_a_status_sent_by_the_client_must_match_the_reporter_type(): void
    {
        foreach ([['Owner', 'Rescued'], ['Citizen', 'Lost'], ['Owner', 'For Adoption'], ['Owner', 'Reunited'], ['Citizen', 'Found']] as [$type, $status]) {
            $this->submit($type, null, ['status' => $status])->assertUnprocessable()->assertJsonValidationErrors('status');
        }

        $this->submit('Owner', null, ['status' => 'Lost'])->assertCreated()->assertJsonPath('data.status', 'Lost');
        $this->submit('Citizen', null, ['name' => 'Bruno', 'status' => 'Rescued'])->assertCreated()->assertJsonPath('data.status', 'Rescued');
    }

    public function test_public_output_of_a_lost_report_never_has_the_reporters_contact_details(): void
    {
        $report = $this->lostReport();

        foreach (["/api/missing-pets/{$report->id}", '/api/missing-pets'] as $url) {
            $body = $this->as(null)->getJson($url)->assertOk()->getContent();

            foreach (['Liza Ramos', '0919 555 0166', '09195550166', 'liza@example.com', 'contact_', 'reporterPhone'] as $private) {
                $this->assertStringNotContainsString($private, $body);
            }
        }

        $this->as(null)->getJson("/api/missing-pets/{$report->id}")->assertJsonPath('data.status', 'Lost');
    }

    /* ---------- claims and the claim period ---------- */

    public function test_a_claim_on_a_lost_report_is_refused_with_a_clear_message(): void
    {
        $report = $this->lostReport();
        $citizen = $this->user('citizen');

        $this->as($citizen)->post("/api/missing-pets/{$report->id}/claims", [
            'contact_name' => 'Maria Owner', 'contact_number' => '0917 123 4567',
            'pickup_date' => $this->start->copy()->addDays(2)->toDateString(),
            'proof_images' => [$this->png('a.png'), $this->png('b.png')],
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.report.0', 'This pet is reported as lost and is not at the pound, so it cannot be claimed.');

        $this->assertDatabaseCount('pet_claims', 0);
    }

    public function test_the_release_command_ignores_lost_reports(): void
    {
        $lost = $this->lostReport();
        $rescued = MissingPetReport::findOrFail($this->submit('Citizen', null, ['name' => 'Bruno'])->json('data.id'));

        Carbon::setTestNow($this->start->copy()->addDays(30));

        $this->assertSame(1, app(ReleaseUnclaimedReports::class)->run());
        $this->assertSame('Lost', $lost->fresh()->status);
        $this->assertNull($lost->fresh()->claim_deadline_at);
        $this->assertSame('For Adoption', $rescued->fresh()->status);

        $this->artisan('reports:release-unclaimed')->assertSuccessful();
        $this->assertSame('Lost', $lost->fresh()->status);
    }

    /* ---------- staff ---------- */

    public function test_the_matches_endpoint_works_for_a_lost_report(): void
    {
        $report = $this->lostReport();

        $animal = new Animal(['name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'sex' => 'Unknown', 'color' => 'Gray', 'status' => 'Rescued', 'health_status' => 'Under Observation', 'rescued_at' => '2026-11-01']);
        $animal->save();
        (new Animal(['name' => 'Rex', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male', 'color' => 'Black', 'status' => 'Rescued', 'health_status' => 'Under Observation', 'rescued_at' => '2026-11-01']))->save();

        $this->as($this->user('pound_staff'))->getJson("/api/missing-pet-reports/{$report->id}/matches")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $animal->id)
            ->assertJsonPath('data.0.name', 'Miming');
    }

    public function test_staff_see_lost_reports_with_the_reporter_type_and_contact(): void
    {
        $report = $this->lostReport();

        $this->as($this->user('adoption_counselor'))->getJson("/api/missing-pet-reports/{$report->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'Lost')
            ->assertJsonPath('data.reporterType', 'Owner')
            ->assertJsonPath('data.reporterPhone', '0919 555 0166')
            ->assertJsonPath('data.animal_id', null);

        $this->as($this->user('pound_staff'))->getJson('/api/missing-pet-reports')->assertOk()->assertJsonPath('data.0.status', 'Lost');
    }

    public function test_staff_can_move_a_lost_report_to_rescued_and_it_then_follows_the_rescued_flow(): void
    {
        $report = $this->lostReport();

        $this->as($this->user('pound_staff'))->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Rescued'])
            ->assertOk()
            ->assertJsonPath('data.status', 'Rescued');

        $report->refresh();
        $animal = Animal::findOrFail($report->animal_id);

        $this->assertSame('Rescued', $animal->status);
        $this->assertNotEmpty($animal->qr_token);
        $this->assertSame('2026-11-09 09:00:00', $report->claim_deadline_at->format('Y-m-d H:i:s'));
        $this->assertTrue($report->inClaimPeriod());
    }

    public function test_staff_can_set_a_lost_report_to_reunited_but_not_to_for_adoption(): void
    {
        $report = $this->lostReport();
        $staff = $this->user('pound_staff');

        $this->as($staff)->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'For Adoption'])
            ->assertUnprocessable();
        $this->assertSame('Lost', $report->fresh()->status);

        $this->as($staff)->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Reunited'])
            ->assertOk()->assertJsonPath('data.status', 'Reunited');
        $this->assertSame(0, Animal::count());
    }

    /* ---------- owner ---------- */

    public function test_an_owner_can_mark_their_own_lost_report_reunited_and_nobody_else_can(): void
    {
        $maria = $this->user('citizen', 'maria@test.com');
        $juan = $this->user('citizen', 'juan@test.com');
        $report = $this->lostReport($maria);

        $this->assertSame($maria->id, $report->reporter_id);
        $this->as($maria)->getJson('/api/my/missing-pets')->assertOk()->assertJsonPath('data.0.status', 'Lost');

        $this->as($juan)->postJson("/api/my/missing-pets/{$report->id}/reunited")->assertForbidden();
        $this->assertSame('Lost', $report->fresh()->status);

        $this->as($maria)->postJson("/api/my/missing-pets/{$report->id}/reunited")
            ->assertOk()->assertJsonPath('data.status', 'Reunited');
        $this->assertSame('Reunited', $report->fresh()->status);

        $this->as($maria)->postJson("/api/my/missing-pets/{$report->id}/reunited")->assertUnprocessable();
    }
}

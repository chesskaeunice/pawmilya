<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\AuditLog;
use App\Models\MissingPetReport;
use App\Models\PetClaim;
use App\Models\User;
use App\Support\ReleaseUnclaimedReports;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

// Owners claim a Rescued pet during the 7-day claim period; pound staff decide.
class PetClaimTest extends TestCase
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

    private function user(string $role, string $email = null): User
    {
        $user = User::where('email', $email ?? $role.'@test.com')->first() ?? tap(
            new User(['name' => ucfirst($role), 'email' => $email ?? $role.'@test.com', 'phone' => '0917 000 1111', 'password' => 'Str0ng!Passw0rd']),
            function ($u) use ($role) {
                $u->role = $role;
                $u->save();
            }
        );

        return $user;
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

    // A Rescued report (guest) with its animal and a claim deadline 7 days out
    private function rescuedReport(): MissingPetReport
    {
        $this->as(null)->post('/api/missing-pets', [
            'name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Gray',
            'location' => 'Katipunan, Quezon City', 'last_seen_at' => '2026-10-30 01:15:00',
            'details' => 'Friendly.', 'contact_name' => 'Liza Reporter', 'contact_number' => '0919 555 0166', 'contact_email' => 'reporter@example.com', 'reporter_type' => 'Citizen',
            'pet_images' => [$this->png('p1.png'), $this->png('p2.png')],
            'last_seen_images' => [$this->png('l1.png')],
        ], ['Accept' => 'application/json'])->assertCreated();

        return MissingPetReport::latest('id')->firstOrFail();
    }

    private function claimPayload(array $override = []): array
    {
        return array_merge([
            'contact_name' => 'Maria Owner', 'contact_number' => '0917 123 4567', 'contact_email' => 'maria@example.com',
            'pickup_date' => $this->start->copy()->addDays(2)->toDateString(),
            'proof_images' => [$this->png('a.png'), $this->png('b.png')],
        ], $override);
    }

    private function claim(MissingPetReport $report, ?User $as, array $override = [])
    {
        return $this->as($as)->post("/api/missing-pets/{$report->id}/claims", $this->claimPayload($override), ['Accept' => 'application/json']);
    }

    private function makeClaim(MissingPetReport $report, User $citizen, array $override = []): int
    {
        return $this->claim($report, $citizen, $override)->assertCreated()->json('data.id');
    }

    /* ---------- submitting a claim ---------- */

    public function test_guests_cannot_claim_and_staff_accounts_cannot_claim(): void
    {
        $report = $this->rescuedReport();

        $this->claim($report, null)->assertUnauthorized();
        $this->claim($report, $this->user('pound_staff'))->assertForbidden();
        $this->claim($report, $this->user('vet_tech'))->assertForbidden();

        $this->assertSame(0, PetClaim::count());
    }

    public function test_a_citizen_can_claim_a_rescued_pet_with_two_or_three_proof_images(): void
    {
        $report = $this->rescuedReport();
        $maria = $this->user('citizen', 'maria@test.com');
        $juan = $this->user('citizen', 'juan@test.com');

        $this->claim($report, $maria)->assertCreated()
            ->assertJsonPath('data.status', 'Pending')->assertJsonPath('data.reportId', $report->id);
        $this->claim($report, $juan, ['proof_images' => [$this->png('1.png'), $this->png('2.png'), $this->png('3.png')]])->assertCreated();

        $this->assertSame(2, PetClaim::count()); // several Pending claims on one report
        $this->assertCount(2, PetClaim::where('claimant_id', $maria->id)->first()->photos);
        $this->assertCount(3, PetClaim::where('claimant_id', $juan->id)->first()->photos);
        $this->assertDatabaseHas('audit_logs', ['action' => 'claim.submitted', 'user_id' => $maria->id]);
    }

    public function test_the_wrong_number_of_images_is_refused(): void
    {
        $report = $this->rescuedReport();
        $maria = $this->user('citizen', 'maria@test.com');

        $this->claim($report, $maria, ['proof_images' => [$this->png()]])->assertUnprocessable()->assertJsonValidationErrors('proof_images');
        $this->claim($report, $maria, ['proof_images' => [$this->png('1.png'), $this->png('2.png'), $this->png('3.png'), $this->png('4.png')]])
            ->assertUnprocessable()->assertJsonValidationErrors('proof_images');
        $this->claim($report, $maria, ['proof_images' => null])->assertUnprocessable()->assertJsonValidationErrors('proof_images');

        $this->assertSame(0, PetClaim::count());
    }

    public function test_the_form_fields_are_validated(): void
    {
        $report = $this->rescuedReport();
        $maria = $this->user('citizen', 'maria@test.com');

        $this->claim($report, $maria, ['contact_name' => '', 'contact_number' => 'abc', 'contact_email' => 'nope'])
            ->assertUnprocessable()->assertJsonValidationErrors(['contact_name', 'contact_number', 'contact_email']);

        // pickup: today or later, and no later than 7 days from today
        $this->claim($report, $maria, ['pickup_date' => $this->start->copy()->subDay()->toDateString()])->assertUnprocessable()->assertJsonValidationErrors('pickup_date');
        $this->claim($report, $maria, ['pickup_date' => $this->start->copy()->addDays(8)->toDateString()])->assertUnprocessable()->assertJsonValidationErrors('pickup_date');
        $this->claim($report, $maria, ['pickup_date' => $this->start->copy()->addDays(7)->toDateString(), 'contact_email' => null])->assertCreated();
    }

    public function test_a_claim_after_the_deadline_or_on_a_report_that_is_not_rescued_is_refused(): void
    {
        $report = $this->rescuedReport();
        $maria = $this->user('citizen', 'maria@test.com');

        Carbon::setTestNow($this->start->copy()->addDays(7)->addMinute());
        $this->claim($report, $maria, ['pickup_date' => now()->toDateString()])->assertUnprocessable()
            ->assertJsonPath('errors.report.0', 'This pet can no longer be claimed.');

        Carbon::setTestNow($this->start);
        foreach (['Lost', 'For Adoption', 'Reunited'] as $status) {
            $report->forceFill(['status' => $status])->save();
            // a Lost report has its own message (the pet is not at the pound)
            $message = $status === 'Lost'
                ? 'This pet is reported as lost and is not at the pound, so it cannot be claimed.'
                : 'This pet can no longer be claimed.';
            $this->claim($report, $maria)->assertUnprocessable()->assertJsonPath('errors.report.0', $message);
        }

        $this->assertSame(0, PetClaim::count());
    }

    public function test_one_live_claim_per_citizen_and_a_rejected_one_can_be_sent_again(): void
    {
        $report = $this->rescuedReport();
        $maria = $this->user('citizen', 'maria@test.com');

        $claimId = $this->makeClaim($report, $maria);
        $this->claim($report, $maria)->assertUnprocessable()->assertJsonPath('errors.report.0', 'You already have an active claim for this pet.');
        $this->assertSame(1, PetClaim::count());

        // a Rejected claim can be sent again
        $this->as($this->user('pound_staff'))->postJson("/api/missing-pet-reports/{$report->id}/claims/{$claimId}/reject", ['reason' => 'Photos unclear'])->assertOk();
        $this->claim($report, $maria)->assertCreated();
        $this->assertSame(2, PetClaim::count());

        // the database blocks a second live claim even without the request check
        $this->expectException(UniqueConstraintViolationException::class);

        $dup = new PetClaim(['contact_name' => 'x', 'contact_number' => '0917 123 4567', 'pickup_date' => now()->toDateString()]);
        $dup->missing_pet_report_id = $report->id;
        $dup->claimant_id = $maria->id;
        $dup->save();
    }

    /* ---------- a Pending claim stops the automatic release ---------- */

    public function test_a_pending_claim_blocks_the_release_until_every_claim_is_rejected(): void
    {
        $report = $this->rescuedReport();
        $maria = $this->user('citizen', 'maria@test.com');
        $claimId = $this->makeClaim($report, $maria);

        Carbon::setTestNow($this->start->copy()->addDays(8));
        $this->assertSame(0, app(ReleaseUnclaimedReports::class)->run());
        $this->as(null)->getJson('/api/missing-pets')->assertOk()->assertJsonPath('data.0.status', 'Rescued');

        // all claims rejected: the release resumes
        $this->as($this->user('pound_staff'))->postJson("/api/missing-pet-reports/{$report->id}/claims/{$claimId}/reject")->assertOk();
        $this->assertSame(1, app(ReleaseUnclaimedReports::class)->run());
        $this->assertSame('For Adoption', $report->fresh()->status);
    }

    /* ---------- staff decisions ---------- */

    public function test_approving_reunites_the_report_and_the_animal_and_rejects_the_other_pending_claims(): void
    {
        $report = $this->rescuedReport();
        $animal = Animal::findOrFail($report->animal_id);
        $maria = $this->user('citizen', 'maria@test.com');
        $juan = $this->user('citizen', 'juan@test.com');
        $first = $this->makeClaim($report, $maria);
        $second = $this->makeClaim($report, $juan);
        $staff = $this->user('pound_staff');

        $this->as($staff)->postJson("/api/missing-pet-reports/{$report->id}/claims/{$first}/approve")->assertOk();

        $this->assertSame('Approved', PetClaim::find($first)->status);
        $this->assertSame('Reunited', $report->fresh()->status);
        $this->assertSame('Reunited with Owner', $animal->fresh()->status);
        $other = PetClaim::find($second);
        $this->assertSame('Rejected', $other->status);
        $this->assertSame('Another claim for this pet was approved.', $other->reject_reason);
        $this->assertSame($staff->id, PetClaim::find($first)->decided_by);
        $this->assertDatabaseHas('audit_logs', ['action' => 'claim.approved', 'user_id' => $staff->id]);

        // the citizen sees the result
        $this->as($juan)->getJson('/api/my/claims')->assertOk()
            ->assertJsonPath('data.0.status', 'Rejected')->assertJsonPath('data.0.rejectReason', 'Another claim for this pet was approved.');
    }

    public function test_approving_or_deciding_twice_fails(): void
    {
        $report = $this->rescuedReport();
        $first = $this->makeClaim($report, $this->user('citizen', 'maria@test.com'));
        $staff = $this->user('pound_staff');

        $this->as($staff)->postJson("/api/missing-pet-reports/{$report->id}/claims/{$first}/approve")->assertOk();
        $this->as($staff)->postJson("/api/missing-pet-reports/{$report->id}/claims/{$first}/approve")->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->as($staff)->postJson("/api/missing-pet-reports/{$report->id}/claims/{$first}/reject")->assertUnprocessable();

        $this->assertSame(1, AuditLog::where('action', 'claim.approved')->count());
    }

    public function test_rejecting_keeps_the_reason_and_leaves_the_report_open(): void
    {
        $report = $this->rescuedReport();
        $claimId = $this->makeClaim($report, $this->user('citizen', 'maria@test.com'));

        $this->as($this->user('pound_staff'))->postJson("/api/missing-pet-reports/{$report->id}/claims/{$claimId}/reject", ['reason' => 'Photos do not match.'])->assertOk()
            ->assertJsonPath('data.0.status', 'Rejected')->assertJsonPath('data.0.rejectReason', 'Photos do not match.');

        $this->assertSame('Rescued', $report->fresh()->status);
        $this->assertDatabaseHas('audit_logs', ['action' => 'claim.rejected']);
    }

    public function test_only_pound_staff_decide_the_kennel_manager_views_and_other_roles_are_refused(): void
    {
        $report = $this->rescuedReport();
        $claimId = $this->makeClaim($report, $this->user('citizen', 'maria@test.com'));
        $base = "/api/missing-pet-reports/{$report->id}/claims";

        foreach (['vet_tech', 'adoption_counselor'] as $role) {
            $this->as($this->user($role))->getJson($base)->assertForbidden();
            $this->as($this->user($role))->postJson("{$base}/{$claimId}/approve")->assertForbidden();
            $this->as($this->user($role))->postJson("{$base}/{$claimId}/reject")->assertForbidden();
        }

        // the kennel manager can look but not decide
        $this->as($this->user('kennel_manager'))->getJson($base)->assertOk()->assertJsonCount(1, 'data');
        $this->as($this->user('kennel_manager'))->postJson("{$base}/{$claimId}/approve")->assertForbidden();
        $this->as($this->user('kennel_manager'))->postJson("{$base}/{$claimId}/reject")->assertForbidden();

        // citizens and guests cannot see claims either
        $this->as($this->user('citizen', 'maria@test.com'))->getJson($base)->assertForbidden();
        $this->as(null)->getJson($base)->assertUnauthorized();

        $this->assertSame('Pending', PetClaim::find($claimId)->status);
        $this->as($this->user('pound_staff'))->getJson($base)->assertOk()
            ->assertJsonPath('data.0.contactName', 'Maria Owner')->assertJsonCount(2, 'data.0.proofImages');
    }

    /* ---------- privacy ---------- */

    public function test_proof_images_and_contact_details_are_never_public(): void
    {
        $report = $this->rescuedReport();
        $claimId = $this->makeClaim($report, $this->user('citizen', 'maria@test.com'));
        $claim = PetClaim::findOrFail($claimId);

        // stored on the private disk only
        foreach ($claim->photos as $photo) {
            Storage::disk('local')->assertExists($photo->path);
            Storage::disk('public')->assertMissing($photo->path);
        }

        // nothing about claims in the public endpoints
        foreach (["/api/missing-pets", "/api/missing-pets/{$report->id}", '/api/pets'] as $url) {
            $body = $this->as(null)->getJson($url)->assertOk()->getContent();

            foreach (['Maria Owner', '0917 123 4567', 'maria@example.com', 'proofImages', 'pet-claims'] as $private) {
                $this->assertStringNotContainsString($private, $body);
            }
        }

        // the staff links are signed and expire; an unsigned or expired link is refused
        $signed = $this->as($this->user('pound_staff'))->getJson("/api/missing-pet-reports/{$report->id}/claims")->json('data.0.proofImages.0');
        $this->as(null)->get($signed)->assertOk();
        $this->as(null)->get(preg_replace('/\?.*/', '', $signed))->assertForbidden();
        $expired = URL::temporarySignedRoute('claim.file', now()->subMinute(), ['claim' => $claimId, 'index' => 0]);
        $this->as(null)->get($expired)->assertForbidden();
    }
}

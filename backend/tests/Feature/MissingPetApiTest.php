<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\MissingPetReport;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MissingPetApiTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, ?string $email = null): User
    {
        $user = new User(['name' => ucfirst($role), 'email' => $email ?? $role.'@test.com', 'phone' => '0917 000 1111', 'password' => 'password123']);
        $user->role = $role;
        $user->save();

        return $user;
    }

    // Switching users inside one test: drop the guard's cached user
    private function actingAs_(?User $user): void
    {
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        if ($user) {
            $this->withToken($user->createToken('auth')->plainTextToken);
        }
    }

    private function png(string $name = 'a.png'): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    private function payload(array $override = []): array
    {
        return array_merge([
            'name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Gray',
            'location' => 'Katipunan, Quezon City', 'last_seen_at' => '2026-10-18 01:15:00', 'status' => 'Lost',
            'details' => 'Friendly.', 'contact_name' => 'Liza Ramos', 'contact_number' => '0919 555 0166',
            'pet_images' => [$this->png('p1.png'), $this->png('p2.png')],
            'last_seen_images' => [$this->png('l1.png')],
        ], $override);
    }

    private function report(array $payload = [])
    {
        return $this->post('/api/missing-pets', $this->payload($payload), ['Accept' => 'application/json']);
    }

    private function storedReport(array $override = []): MissingPetReport
    {
        $report = new MissingPetReport(array_merge([
            'name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Gray', 'sex' => 'Unknown',
            'location' => 'Katipunan', 'last_seen_at' => '2026-10-18 01:15:00', 'contact_name' => 'A', 'contact_number' => '0919 555 0166',
        ], $override));
        $report->status = $override['status'] ?? 'Lost';
        $report->fingerprint = $override['fingerprint'] ?? sha1(uniqid('', true));
        $report->save();

        return $report;
    }

    /* ---------- filing a report ---------- */

    public function test_guest_can_file_a_report_with_contact_details_and_photos(): void
    {
        Storage::fake('public');

        $response = $this->report()->assertCreated()
            ->assertJsonPath('data.status', 'Lost')
            ->assertJsonPath('data.type', 'Cat')
            ->assertJsonCount(2, 'data.petImages')
            ->assertJsonCount(1, 'data.lastSeenImages');

        // the public view never shows the reporter's contact details
        $this->assertArrayNotHasKey('reporterPhone', $response->json('data'));
        $this->assertArrayNotHasKey('contact_number', $response->json('data'));

        $report = MissingPetReport::first();
        $this->assertNull($report->reporter_id);
        $this->assertSame('Liza Ramos', $report->contact_name);
        $this->assertCount(3, $report->photos);
        $this->assertDatabaseHas('audit_logs', ['action' => 'missing_pet.reported', 'entity_id' => $report->id]);
    }

    public function test_guest_must_leave_contact_name_and_number(): void
    {
        Storage::fake('public');

        $this->report(['contact_name' => null, 'contact_number' => null])
            ->assertUnprocessable()->assertJsonValidationErrors(['contact_name', 'contact_number']);
    }

    public function test_citizen_report_is_linked_to_the_account_and_uses_its_contact_details(): void
    {
        Storage::fake('public');
        $citizen = $this->makeUser('citizen');
        $this->actingAs_($citizen);

        $this->report(['contact_name' => null, 'contact_number' => null])->assertCreated();

        $report = MissingPetReport::first();
        $this->assertSame($citizen->id, $report->reporter_id);
        $this->assertSame('Citizen', $report->contact_name);
        $this->assertSame('0917 000 1111', $report->contact_number);
    }

    public function test_validation_rules(): void
    {
        Storage::fake('public');

        $this->report(['pet_images' => [$this->png()]])->assertUnprocessable()->assertJsonValidationErrors(['pet_images']);
        $this->report(['last_seen_images' => []])->assertUnprocessable()->assertJsonValidationErrors(['last_seen_images']);
        $this->report(['status' => 'Reunited'])->assertUnprocessable()->assertJsonValidationErrors(['status']);
        $this->report(['last_seen_at' => now()->addDay()->toDateTimeString()])->assertUnprocessable()->assertJsonValidationErrors(['last_seen_at']);
        $this->report(['species' => 'Other'])->assertUnprocessable()->assertJsonValidationErrors(['other_species']);
        $this->assertDatabaseCount('missing_pet_reports', 0);
    }

    public function test_other_species_is_shown_by_its_own_name(): void
    {
        Storage::fake('public');

        $this->report(['species' => 'Other', 'other_species' => 'Rabbit'])->assertCreated()->assertJsonPath('data.type', 'Rabbit');
    }

    /* ---------- duplicates ---------- */

    public function test_the_same_pet_cannot_be_reported_twice_by_the_same_reporter(): void
    {
        Storage::fake('public');

        $this->report()->assertCreated();
        // same phone (written differently), pet, place and day
        $this->report(['contact_number' => '09195550166', 'location' => ' katipunan, quezon city ', 'last_seen_at' => '2026-10-18 22:00:00'])
            ->assertUnprocessable()->assertJsonValidationErrors(['name']);

        $this->assertSame(1, MissingPetReport::count());
    }

    public function test_a_different_place_day_or_reporter_is_not_a_duplicate(): void
    {
        Storage::fake('public');

        $this->report()->assertCreated();
        $this->report(['location' => 'Cubao'])->assertCreated();
        $this->report(['last_seen_at' => '2026-10-17 10:00:00'])->assertCreated();
        $this->report(['contact_number' => '0920 111 2222'])->assertCreated();
        $this->assertSame(4, MissingPetReport::count());
    }

    public function test_the_same_pet_can_be_reported_again_after_it_was_reunited(): void
    {
        Storage::fake('public');

        $this->report()->assertCreated();
        MissingPetReport::first()->forceFill(['status' => 'Reunited'])->save();

        $this->report()->assertCreated();
    }

    public function test_database_blocks_duplicates_even_without_the_api_check(): void
    {
        $this->storedReport(['fingerprint' => 'same']);

        $this->expectException(UniqueConstraintViolationException::class);
        $this->storedReport(['fingerprint' => 'same']);
    }

    /* ---------- public list ---------- */

    public function test_public_list_and_details(): void
    {
        $report = $this->storedReport();

        $this->getJson('/api/missing-pets')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Miming');
        $this->getJson("/api/missing-pets/{$report->id}")->assertOk()->assertJsonPath('data.location', 'Katipunan');
        $this->getJson('/api/missing-pets/999')->assertNotFound();
    }

    /* ---------- my reports ---------- */

    public function test_my_reports_shows_only_my_own_and_needs_a_citizen_login(): void
    {
        $mine = $this->makeUser('citizen', 'mine@test.com');
        $other = $this->makeUser('citizen', 'other@test.com');
        $this->storedReport(['reporter_id' => $mine->id]);
        $this->storedReport(['reporter_id' => $other->id, 'name' => 'Other']);
        $this->storedReport(['name' => 'Guest report']);

        $this->getJson('/api/my/missing-pets')->assertUnauthorized();

        $this->actingAs_($mine);
        $this->getJson('/api/my/missing-pets')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Miming');

        $this->actingAs_($this->makeUser('vet_tech'));
        $this->getJson('/api/my/missing-pets')->assertForbidden();
    }

    public function test_owner_can_mark_the_report_as_reunited_only_once_and_only_their_own(): void
    {
        $owner = $this->makeUser('citizen', 'owner@test.com');
        $report = $this->storedReport(['reporter_id' => $owner->id]);

        $this->actingAs_($this->makeUser('citizen', 'someone@test.com'));
        $this->postJson("/api/my/missing-pets/{$report->id}/reunited")->assertForbidden();

        $this->actingAs_($owner);
        $this->postJson("/api/my/missing-pets/{$report->id}/reunited")->assertOk()->assertJsonPath('data.status', 'Reunited');
        $this->postJson("/api/my/missing-pets/{$report->id}/reunited")->assertUnprocessable();
        $this->assertDatabaseHas('audit_logs', ['action' => 'missing_pet.status_changed', 'entity_id' => $report->id]);
    }

    /* ---------- staff ---------- */

    public function test_staff_see_reporter_contact_details_but_citizens_and_guests_do_not(): void
    {
        $this->storedReport();

        $this->getJson('/api/missing-pet-reports')->assertUnauthorized();

        $this->actingAs_($this->makeUser('citizen'));
        $this->getJson('/api/missing-pet-reports')->assertForbidden();

        $this->actingAs_($this->makeUser('pound_staff'));
        $this->getJson('/api/missing-pet-reports')->assertOk()
            ->assertJsonPath('data.0.reporterName', 'A')
            ->assertJsonPath('data.0.reporterPhone', '0919 555 0166')
            ->assertJsonPath('data.0.reportedBy', 'Guest');
    }

    public function test_only_roles_with_update_status_permission_can_change_the_status(): void
    {
        $report = $this->storedReport();

        $this->actingAs_($this->makeUser('pound_staff'));
        $this->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Found'])->assertForbidden();

        $this->actingAs_($this->makeUser('adoption_counselor'));
        $this->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Nope'])->assertUnprocessable();
        $this->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Found'])->assertOk()->assertJsonPath('data.status', 'Found');
        $this->assertDatabaseHas('audit_logs', ['action' => 'missing_pet.status_changed', 'entity_id' => $report->id]);
    }

    /* ---------- comparison with pound animals ---------- */

    private function animal(array $override = []): Animal
    {
        return Animal::create(array_merge([
            'name' => 'Stray', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male', 'color' => 'Brown',
            'location' => 'Quarantine Area', 'status' => 'Rescued', 'health_status' => 'Under Observation',
            'rescued_at' => '2026-10-18', 'personality' => ['Calm'],
        ], $override));
    }

    public function test_matches_lists_pound_animals_that_could_be_the_missing_pet(): void
    {
        $match = $this->animal();
        $this->animal(['name' => 'Adopted one', 'status' => 'Adopted']);                       // left the pound
        $this->animal(['name' => 'A cat', 'species' => 'Cat']);                                // other species
        $this->animal(['name' => 'Different dog', 'breed' => 'Shih Tzu', 'color' => 'White']); // nothing in common

        $report = $this->storedReport(['species' => 'Dog', 'breed' => 'Aspin', 'color' => 'Dark brown', 'sex' => 'Male', 'name' => 'Brownie', 'last_seen_at' => '2026-10-17 18:00:00']);

        $this->actingAs_($this->makeUser('pound_staff'));
        $response = $this->getJson("/api/missing-pet-reports/{$report->id}/matches")->assertOk()->assertJsonCount(1, 'data');

        $this->assertSame($match->id, $response->json('data.0.id'));
        $this->assertContains('Similar breed', $response->json('data.0.reasons'));
        $this->assertContains('Matching color', $response->json('data.0.reasons'));
        $this->assertContains('Same sex', $response->json('data.0.reasons'));
    }

    public function test_matches_need_staff_access(): void
    {
        $report = $this->storedReport();

        $this->getJson("/api/missing-pet-reports/{$report->id}/matches")->assertUnauthorized();
        $this->actingAs_($this->makeUser('citizen'));
        $this->getJson("/api/missing-pet-reports/{$report->id}/matches")->assertForbidden();
    }
}

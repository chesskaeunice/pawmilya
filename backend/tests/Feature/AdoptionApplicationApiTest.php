<?php

namespace Tests\Feature;

use App\Models\AdoptionApplication;
use App\Models\Animal;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AdoptionApplicationApiTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, ?string $email = null): User
    {
        $user = new User(['name' => ucfirst($role), 'email' => $email ?? $role.'@test.com', 'password' => 'password123']);
        $user->role = $role;
        $user->save();

        return $user;
    }

    // Switching users inside one test: drop the guard's cached user
    private function actingAs_(User $user): void
    {
        $this->app['auth']->forgetGuards();
        $this->withToken($user->createToken('auth')->plainTextToken);
    }

    private function animal(array $override = []): Animal
    {
        return Animal::create(array_merge([
            'name' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male', 'age_months' => 24,
            'location' => 'Main Animal Pound', 'status' => 'Available for Adoption', 'health_status' => 'Cleared',
            'description' => 'Friendly dog.', 'personality' => ['Friendly'],
        ], $override));
    }

    private function png(string $name = 'a.png'): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    private function payload(Animal $animal, array $override = []): array
    {
        return array_merge([
            'animal_id' => $animal->id,
            'first_name' => 'Maria', 'last_name' => 'Santos', 'address' => 'Quezon City',
            'phone' => '0917 555 0187', 'email' => 'maria@email.com', 'birth_date' => '1999-05-14',
            'employment_status' => 'Employed', 'work' => 'Bank Teller',
            'social_media' => 'https://facebook.com/maria', 'civil_status' => 'Single', 'pronouns' => 'She/her',
            'referral_source' => 'Friends', 'adopted_before' => '0',
            'residence' => 'House', 'household_members' => '4', 'has_pets' => '1', 'pet_count' => '2',
            'pet_experience' => 'Experienced pet owner',
            'why_adopt' => 'I want a companion.', 'how_care' => 'Food, exercise and vet care.', 'terms_accepted' => '1',
            'valid_id' => $this->png('id.png'),
            'home_photos' => [$this->png('h1.png'), $this->png('h2.png')],
        ], $override);
    }

    private function submit(Animal $animal, array $override = [])
    {
        return $this->post('/api/adoption-applications', $this->payload($animal, $override), ['Accept' => 'application/json']);
    }

    // A stored application without going through the API (for review tests)
    private function pendingApplication(User $citizen, Animal $animal): AdoptionApplication
    {
        $application = new AdoptionApplication(['user_id' => $citizen->id, 'animal_id' => $animal->id]);
        $application->forceFill([
            'first_name' => 'A', 'last_name' => 'B', 'address' => 'x', 'phone' => '0917 000 0000', 'email' => $citizen->email,
            'birth_date' => '1999-01-01', 'employment_status' => 'Student', 'civil_status' => 'Single', 'residence' => 'House',
            'household_members' => 2, 'valid_id_path' => 'adoption-applications/x/id.png',
            'home_photo_paths' => ['adoption-applications/x/h1.png', 'adoption-applications/x/h2.png'],
            'why_adopt' => 'x', 'how_care' => 'x', 'terms_accepted' => true,
        ])->save();

        return $application;
    }

    /* ---------- submitting ---------- */

    public function test_citizen_submits_an_application_with_private_files(): void
    {
        Storage::fake('local');
        $animal = $this->animal();
        $citizen = $this->makeUser('citizen');
        $this->actingAs_($citizen);

        $this->submit($animal)->assertCreated()->assertJsonPath('data.status', 'Pending')->assertJsonPath('data.petName', 'Milo');

        $application = AdoptionApplication::first();
        $this->assertSame($citizen->id, $application->user_id);
        $this->assertCount(2, $application->home_photo_paths);
        Storage::disk('local')->assertExists($application->valid_id_path);
        $this->assertDatabaseHas('audit_logs', ['action' => 'application.submitted', 'entity_id' => $application->id]);
    }

    public function test_only_citizens_can_submit_and_guests_get_401(): void
    {
        $animal = $this->animal();

        $this->post('/api/adoption-applications', $this->payload($animal), ['Accept' => 'application/json'])->assertUnauthorized();

        $this->actingAs_($this->makeUser('pound_staff'));
        $this->submit($animal)->assertForbidden();
    }

    public function test_validation_rules(): void
    {
        Storage::fake('local');
        $animal = $this->animal();
        $this->actingAs_($this->makeUser('citizen'));

        // one home photo is not enough, valid ID is required
        $this->submit($animal, ['home_photos' => [$this->png()], 'valid_id' => null])
            ->assertUnprocessable()->assertJsonValidationErrors(['home_photos', 'valid_id']);

        // four is too many
        $this->submit($animal, ['home_photos' => [$this->png(), $this->png(), $this->png(), $this->png()]])
            ->assertUnprocessable()->assertJsonValidationErrors(['home_photos']);

        // self-employed needs a field, and "Other" needs the text
        $this->submit($animal, ['employment_status' => 'Self-employed'])
            ->assertUnprocessable()->assertJsonValidationErrors(['self_employed_field']);
        $this->submit($animal, ['employment_status' => 'Self-employed', 'self_employed_field' => 'Other'])
            ->assertUnprocessable()->assertJsonValidationErrors(['self_employed_field_other']);

        // pet count is needed when the applicant has pets; terms must be accepted
        $this->submit($animal, ['pet_count' => null])->assertUnprocessable()->assertJsonValidationErrors(['pet_count']);
        $this->submit($animal, ['terms_accepted' => '0'])->assertUnprocessable()->assertJsonValidationErrors(['terms_accepted']);

        $this->assertDatabaseCount('adoption_applications', 0);
    }

    public function test_self_employed_application_with_other_field_is_accepted(): void
    {
        Storage::fake('local');
        $animal = $this->animal();
        $this->actingAs_($this->makeUser('citizen'));

        $this->submit($animal, [
            'employment_status' => 'Self-employed', 'work' => 'Tailor',
            'self_employed_field' => 'Other', 'self_employed_field_other' => 'Dressmaking',
        ])->assertCreated();
    }

    public function test_cannot_apply_for_an_animal_that_is_not_open_for_adoption(): void
    {
        Storage::fake('local');
        $animal = $this->animal(['status' => 'Rescued', 'health_status' => 'Under Observation']);
        $this->actingAs_($this->makeUser('citizen'));

        $this->submit($animal)->assertUnprocessable()->assertJsonValidationErrors(['animal_id']);
    }

    /* ---------- duplicates ---------- */

    public function test_same_citizen_cannot_apply_twice_for_the_same_animal(): void
    {
        Storage::fake('local');
        $animal = $this->animal();
        $this->actingAs_($this->makeUser('citizen'));

        $this->submit($animal)->assertCreated();
        $this->submit($animal)->assertUnprocessable()->assertJsonValidationErrors(['animal_id']);

        $this->assertSame(1, AdoptionApplication::count());
    }

    public function test_citizen_can_apply_again_after_a_rejection(): void
    {
        Storage::fake('local');
        $animal = $this->animal();
        $citizen = $this->makeUser('citizen');
        $this->actingAs_($citizen);

        $this->submit($animal)->assertCreated();
        AdoptionApplication::first()->forceFill(['status' => 'Rejected'])->save();

        $this->submit($animal)->assertCreated();
        $this->assertSame(2, AdoptionApplication::count());
    }

    public function test_different_citizens_can_apply_for_the_same_animal(): void
    {
        Storage::fake('local');
        $animal = $this->animal();

        $this->actingAs_($this->makeUser('citizen', 'one@test.com'));
        $this->submit($animal)->assertCreated();

        $this->actingAs_($this->makeUser('citizen', 'two@test.com'));
        $this->submit($animal)->assertCreated();
    }

    public function test_database_blocks_duplicates_even_without_the_api_check(): void
    {
        $animal = $this->animal();
        $citizen = $this->makeUser('citizen');

        $this->pendingApplication($citizen, $animal);

        $this->expectException(UniqueConstraintViolationException::class);
        $this->pendingApplication($citizen, $animal);
    }

    public function test_database_allows_only_one_approved_application_per_animal(): void
    {
        $animal = $this->animal();
        $first = $this->pendingApplication($this->makeUser('citizen', 'one@test.com'), $animal);
        $second = $this->pendingApplication($this->makeUser('citizen', 'two@test.com'), $animal);

        $first->forceFill(['status' => 'Approved'])->save();

        $this->expectException(UniqueConstraintViolationException::class);
        $second->forceFill(['status' => 'Approved'])->save();
    }

    /* ---------- my applications ---------- */

    public function test_citizen_sees_only_their_own_applications(): void
    {
        $animal = $this->animal();
        $mine = $this->makeUser('citizen', 'mine@test.com');
        $other = $this->makeUser('citizen', 'other@test.com');
        $this->pendingApplication($mine, $animal);
        $this->pendingApplication($other, $animal);

        $this->actingAs_($mine);
        $response = $this->getJson('/api/my/adoption-applications')->assertOk()->assertJsonCount(1, 'data');
        $this->assertArrayNotHasKey('phone', $response->json('data.0'));
        $this->assertArrayNotHasKey('validId', $response->json('data.0'));

        // staff and guests cannot use the citizen endpoint
        $this->actingAs_($this->makeUser('vet_tech'));
        $this->getJson('/api/my/adoption-applications')->assertForbidden();
    }

    /* ---------- staff review ---------- */

    public function test_staff_list_filters_by_status_and_citizens_cannot_see_it(): void
    {
        $citizen = $this->makeUser('citizen');
        $animalA = $this->animal(['name' => 'A']);
        $animalB = $this->animal(['name' => 'B']);
        $this->pendingApplication($citizen, $animalA);
        $this->pendingApplication($citizen, $animalB)->forceFill(['status' => 'Rejected'])->save();

        $this->getJson('/api/adoption-applications')->assertUnauthorized();

        $this->actingAs_($citizen);
        $this->getJson('/api/adoption-applications')->assertForbidden();

        $this->actingAs_($this->makeUser('adoption_counselor'));
        $this->getJson('/api/adoption-applications')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/adoption-applications?status=Rejected')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.petName', 'B');
        $this->getJson('/api/adoption-applications?q=A')->assertOk();
    }

    public function test_staff_detail_has_pet_pictures_location_and_signed_file_links(): void
    {
        Storage::fake('local');
        $animal = $this->animal(['location' => 'North Holding Area']);
        $animal->photos()->create(['path' => 'animals/1/a.png', 'position' => 0]);
        $animal->photos()->create(['path' => 'animals/1/b.png', 'position' => 1]);
        $application = $this->pendingApplication($this->makeUser('citizen'), $animal);
        Storage::disk('local')->put($application->valid_id_path, 'id-bytes');

        $this->actingAs_($this->makeUser('adoption_counselor'));
        $response = $this->getJson("/api/adoption-applications/{$application->id}")->assertOk()
            ->assertJsonPath('data.petLocation', 'North Holding Area')
            ->assertJsonCount(2, 'data.petImages')
            ->assertJsonPath('data.status', 'Pending');

        $idUrl = $response->json('data.validId.url');
        $this->assertStringContainsString('signature=', $idUrl);

        // The signed link works without a login; a tampered or unsigned link does not
        $this->app['auth']->forgetGuards();
        $this->withHeaders(['Authorization' => ''])->get($idUrl)->assertOk();
        $this->get("/api/adoption-applications/{$application->id}/files/id/0")->assertForbidden();
        $this->get(str_replace('signature=', 'signature=x', $idUrl))->assertForbidden();
    }

    public function test_approve_adopts_the_animal_and_rejects_the_competing_applications(): void
    {
        $animal = $this->animal();
        $winner = $this->pendingApplication($this->makeUser('citizen', 'one@test.com'), $animal);
        $loser = $this->pendingApplication($this->makeUser('citizen', 'two@test.com'), $animal);
        $counselor = $this->makeUser('adoption_counselor');
        $this->actingAs_($counselor);

        $this->postJson("/api/adoption-applications/{$winner->id}/approve")->assertOk()->assertJsonPath('data.status', 'Approved');

        $this->assertSame('Adopted', $animal->fresh()->status);

        // the adopter is now the owner shown on the QR scan page (the other applicant is not)
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();
        $this->getJson("/api/stray/{$animal->qr_token}")->assertOk()
            ->assertJsonPath('data.owner.name', 'A B')
            ->assertJsonPath('data.owner.contact', '0917 000 0000');
        $this->actingAs_($counselor);

        $this->assertSame('Approved', $winner->fresh()->status);
        $this->assertSame($counselor->id, $winner->fresh()->reviewed_by);
        $this->assertSame('Rejected', $loser->fresh()->status);
        $this->assertSame('Another application for this animal was approved.', $loser->fresh()->rejection_reason);
        $this->assertDatabaseHas('audit_logs', ['action' => 'application.approved', 'entity_id' => $winner->id]);

        // the adopted animal is gone from the public list
        $this->app['auth']->forgetGuards();
        $this->withHeaders(['Authorization' => ''])->getJson('/api/pets')->assertJsonCount(0, 'data');
    }

    public function test_second_approval_for_the_same_animal_is_refused(): void
    {
        $animal = $this->animal();
        $first = $this->pendingApplication($this->makeUser('citizen', 'one@test.com'), $animal);
        $second = $this->pendingApplication($this->makeUser('citizen', 'two@test.com'), $animal);
        $this->actingAs_($this->makeUser('adoption_counselor'));

        $this->postJson("/api/adoption-applications/{$first->id}/approve")->assertOk();

        // the competitor was auto-rejected, so approving it fails and nothing changes
        $this->postJson("/api/adoption-applications/{$second->id}/approve")->assertUnprocessable();
        // approving the same application again (double click) also fails
        $this->postJson("/api/adoption-applications/{$first->id}/approve")->assertUnprocessable();

        $this->assertSame(1, AdoptionApplication::where('animal_id', $animal->id)->where('status', 'Approved')->count());
        $this->assertSame(1, AuditLog::where('action', 'application.approved')->count());
    }

    public function test_cannot_approve_when_the_animal_is_no_longer_adoptable(): void
    {
        $animal = $this->animal(['status' => 'Reunited with Owner']);
        $application = $this->pendingApplication($this->makeUser('citizen'), $animal);
        $this->actingAs_($this->makeUser('adoption_counselor'));

        $this->postJson("/api/adoption-applications/{$application->id}/approve")->assertUnprocessable();
        $this->assertSame('Pending', $application->fresh()->status);
    }

    public function test_reject_saves_the_reason_and_cannot_be_repeated_or_undone(): void
    {
        $animal = $this->animal();
        $application = $this->pendingApplication($this->makeUser('citizen'), $animal);
        $this->actingAs_($this->makeUser('adoption_counselor'));

        $this->postJson("/api/adoption-applications/{$application->id}/reject", ['reason' => 'Home photos were not clear.'])
            ->assertOk()->assertJsonPath('data.rejectionReason', 'Home photos were not clear.');

        $this->assertSame('Available for Adoption', $animal->fresh()->status);
        $this->postJson("/api/adoption-applications/{$application->id}/reject")->assertUnprocessable();
        $this->postJson("/api/adoption-applications/{$application->id}/approve")->assertUnprocessable();
    }

    public function test_only_roles_with_review_permissions_can_decide(): void
    {
        $animal = $this->animal();
        $application = $this->pendingApplication($this->makeUser('citizen'), $animal);

        // the adoption counselor is the only role that decides; the kennel manager only oversees
        $kennelManager = null;
        foreach (['pound_staff', 'vet_tech', 'kennel_manager', 'citizen'] as $role) {
            $user = $this->makeUser($role, $role.'-staff@test.com');
            $kennelManager = $role === 'kennel_manager' ? $user : $kennelManager;
            $this->actingAs_($user);
            $this->postJson("/api/adoption-applications/{$application->id}/approve")->assertForbidden();
            $this->postJson("/api/adoption-applications/{$application->id}/reject")->assertForbidden();
        }

        $this->assertSame('Pending', $application->fresh()->status);

        // the kennel manager can still read the applications
        $this->actingAs_($kennelManager);
        $this->getJson('/api/adoption-applications')->assertOk();
        $this->getJson("/api/adoption-applications/{$application->id}")->assertOk();

        $this->actingAs_($this->makeUser('adoption_counselor'));
        $this->postJson("/api/adoption-applications/{$application->id}/reject")->assertOk();
    }
}

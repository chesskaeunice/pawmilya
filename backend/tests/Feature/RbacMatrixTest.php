<?php

namespace Tests\Feature;

use App\Models\AdoptionApplication;
use App\Models\Animal;
use App\Models\MissingPetReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// The role tables from the RBAC spec (module matrix + actions inside Animals)
class RbacMatrixTest extends TestCase
{
    use RefreshDatabase;

    private const STAFF = ['kennel_manager', 'adoption_counselor', 'vet_tech', 'pound_staff'];

    private function as(string $role): static
    {
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();

        $user = User::where('role', $role)->first() ?? tap(new User(['name' => $role, 'email' => $role.'@t.com', 'password' => 'Str0ng!Passw0rd']), function ($u) use ($role) {
            $u->role = $role;
            $u->save();
        });

        return $this->withToken($user->createToken('t')->plainTextToken);
    }

    private function animal(): Animal
    {
        return Animal::create([
            'name' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male',
            'location' => 'Kennel A', 'status' => 'Rescued', 'health_status' => 'Under Observation',
            'description' => 'Friendly.', 'personality' => ['Friendly'],
        ]);
    }

    private function png(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('a.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));
    }

    public function test_module_access_matches_the_matrix(): void
    {
        // Adoption applications: kennel manager and counselor only
        foreach (['kennel_manager' => 200, 'adoption_counselor' => 200, 'vet_tech' => 403, 'pound_staff' => 403] as $role => $code) {
            $this->as($role)->getJson('/api/adoption-applications')->assertStatus($code);
        }
        // Reports data is not in the API, but permissions say pound staff has no reports.view
        $this->assertFalse((new User(['role' => 'x']))->hasPermission('reports.view'));
        foreach (self::STAFF as $role) {
            $u = new User();
            $u->role = $role;
            $this->assertSame($role !== 'pound_staff', $u->hasPermission('reports.view'), $role);
        }
        // Vaccinations: only the vet tech creates (the kennel manager only views); everyone views
        foreach (self::STAFF as $role) {
            $this->as($role)->getJson('/api/vaccinations')->assertOk();
        }
        // Missing pets: every staff role can view
        foreach (self::STAFF as $role) {
            $this->as($role)->getJson('/api/missing-pet-reports')->assertOk();
        }
    }

    public function test_everyone_views_animals_but_only_pound_staff_adds_them(): void
    {
        $animal = $this->animal();

        foreach (self::STAFF as $role) {
            $this->as($role)->getJson('/api/animals')->assertOk();
            $this->as($role)->getJson("/api/animals/{$animal->id}")->assertOk();
        }
        foreach (['kennel_manager', 'adoption_counselor', 'vet_tech'] as $role) {
            $this->as($role)->postJson('/api/animals', [])->assertForbidden();
        }
        // pound staff passes the permission check (an empty form then fails validation)
        $this->as('pound_staff')->postJson('/api/animals', [])->assertUnprocessable();
    }

    public function test_basic_and_intake_fields_are_pound_staff_only(): void
    {
        $animal = $this->animal();

        foreach (['kennel_manager', 'adoption_counselor', 'vet_tech'] as $role) {
            foreach (['name' => 'X', 'species' => 'Cat', 'breed' => 'Y', 'sex' => 'Female', 'color' => 'Red', 'rescued_at' => '2026-01-01'] as $field => $value) {
                $this->as($role)->patchJson("/api/animals/{$animal->id}", [$field => $value])->assertForbidden();
            }
        }
        $this->as('pound_staff')->patchJson("/api/animals/{$animal->id}", ['name' => 'Rex', 'color' => 'Brown'])->assertOk();
    }

    public function test_location_notes_and_status_follow_the_matrix(): void
    {
        $animal = $this->animal();
        $url = "/api/animals/{$animal->id}";

        // Kennel location: pound staff only (the kennel manager only oversees)
        $this->as('pound_staff')->patchJson($url, ['location' => 'Kennel B'])->assertOk();
        $this->as('kennel_manager')->patchJson($url, ['location' => 'Kennel C'])->assertForbidden();
        $this->as('adoption_counselor')->patchJson($url, ['location' => 'X'])->assertForbidden();
        $this->as('vet_tech')->patchJson($url, ['location' => 'X'])->assertForbidden();

        // Temperament / personality / description notes: pound staff and adoption counselor
        foreach (['adoption_counselor', 'pound_staff'] as $role) {
            $this->as($role)->patchJson($url, ['personality' => ['Calm'], 'description' => 'Daily note.'])->assertOk();
        }
        $this->as('kennel_manager')->patchJson($url, ['personality' => ['Calm']])->assertForbidden();
        $this->as('vet_tech')->patchJson($url, ['personality' => ['Calm']])->assertForbidden();
        $this->as('vet_tech')->patchJson($url, ['description' => 'x'])->assertForbidden();

        // General status: pound staff only Rescued / Reunited (the adoption statuses belong to the adoption
        // flow), counselor and vet limited, kennel manager none
        $this->as('pound_staff')->patchJson($url, ['status' => 'Pending Adoption'])->assertForbidden();
        $this->as('adoption_counselor')->patchJson($url, ['status' => 'Pending Adoption'])->assertOk();
        $this->as('adoption_counselor')->patchJson($url, ['status' => 'Reunited with Owner'])->assertForbidden();
        $this->as('adoption_counselor')->patchJson($url, ['status' => 'Rescued'])->assertForbidden();
        $this->as('vet_tech')->patchJson($url, ['status' => 'Adopted'])->assertForbidden();
        $this->as('vet_tech')->patchJson($url, ['status' => 'Rescued'])->assertOk();
        $this->as('kennel_manager')->patchJson($url, ['status' => 'Reunited with Owner'])->assertForbidden();
        $this->as('pound_staff')->patchJson($url, ['status' => 'Reunited with Owner'])->assertOk();

        // Health status: pound staff (animals.edit) and vet tech
        $this->as('vet_tech')->patchJson($url, ['health_status' => 'Cleared'])->assertOk();
        $this->as('pound_staff')->patchJson($url, ['health_status' => 'Under Treatment'])->assertOk();
        $this->as('kennel_manager')->patchJson($url, ['health_status' => 'Under Treatment'])->assertForbidden();
        $this->as('adoption_counselor')->patchJson($url, ['health_status' => 'Under Treatment'])->assertForbidden();
    }

    public function test_every_hands_on_staff_role_can_change_the_main_photo(): void
    {
        Storage::fake('public');
        $animal = $this->animal();
        $url = "/api/animals/{$animal->id}/photo";

        foreach (['adoption_counselor', 'vet_tech', 'pound_staff'] as $role) {
            $this->as($role)->postJson($url, ['image' => $this->png()])->assertOk();
        }
        $this->assertSame(1, $animal->photos()->count()); // replaced, not piled up

        // the kennel manager only oversees
        $this->as('kennel_manager')->postJson($url, ['image' => $this->png()])->assertForbidden();
        $this->assertSame(1, $animal->photos()->count());

        $this->as('citizen')->postJson($url, ['image' => $this->png()])->assertForbidden();
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->postJson($url, ['image' => $this->png()])->assertUnauthorized();
        $this->as('pound_staff')->postJson($url, ['image' => UploadedFile::fake()->create('x.pdf', 5, 'application/pdf')])->assertUnprocessable();
    }

    public function test_the_qr_can_be_viewed_by_pound_staff_and_kennel_manager_only(): void
    {
        $animal = $this->animal();

        foreach (['pound_staff' => 200, 'kennel_manager' => 200, 'vet_tech' => 403, 'adoption_counselor' => 403, 'citizen' => 403] as $role => $code) {
            $this->as($role)->getJson("/api/animals/{$animal->id}/qr")->assertStatus($code);
        }

        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/animals/{$animal->id}/qr")->assertUnauthorized();
    }

    /* ---------- the reorganized roles: who acts and who only oversees ---------- */

    private function noAuth(): static
    {
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();

        return $this;
    }

    private function createPayload(): array
    {
        return [
            'name' => 'Biscuit', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male', 'neutered' => 0,
            'location' => 'Main Animal Pound', 'status' => 'Rescued', 'health_status' => 'Under Observation',
            'rescued_at' => '2026-10-01', 'description' => 'A friendly dog.', 'ideal_home' => 'A home with a yard.',
            'personality' => ['Friendly'],
            'images' => [$this->png(), $this->png(), $this->png()],
        ];
    }

    private function report(): MissingPetReport
    {
        $report = new MissingPetReport([
            'name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Gray', 'sex' => 'Unknown',
            'location' => 'Katipunan', 'last_seen_at' => '2026-10-18 01:15:00', 'contact_name' => 'A', 'contact_number' => '0919 555 0166', 'contact_email' => 'reporter@example.com',
        ]);
        $report->status = 'Lost';
        $report->fingerprint = sha1(uniqid('', true));
        $report->save();

        return $report;
    }

    // A pending application for an animal that is open for adoption
    private function pendingApplication(): AdoptionApplication
    {
        $animal = Animal::create([
            'name' => 'Luna', 'species' => 'Cat', 'sex' => 'Female', 'location' => 'Kennel B',
            'status' => 'Available for Adoption', 'health_status' => 'Cleared',
        ]);
        $applicant = new User(['name' => 'Applicant', 'email' => 'applicant'.uniqid().'@t.com', 'password' => 'Str0ng!Passw0rd']);
        $applicant->role = 'citizen';
        $applicant->save();

        $application = new AdoptionApplication(['user_id' => $applicant->id, 'animal_id' => $animal->id]);
        $application->forceFill([
            'first_name' => 'A', 'last_name' => 'B', 'address' => 'x', 'phone' => '0917 000 0000', 'email' => $applicant->email,
            'birth_date' => '1999-01-01', 'employment_status' => 'Student', 'civil_status' => 'Single', 'residence' => 'House',
            'household_members' => 2, 'valid_id_path' => 'x', 'home_photo_paths' => ['a', 'b'],
            'why_adopt' => 'x', 'how_care' => 'x', 'terms_accepted' => true,
            'id_verification_status' => 'Verified', // approving needs a verified valid ID
        ])->save();

        return $application;
    }

    public function test_pound_staff_creates_edits_and_deletes_animals_and_updates_report_status(): void
    {
        Storage::fake('public');
        $report = $this->report();

        $id = $this->as('pound_staff')->post('/api/animals', $this->createPayload(), ['Accept' => 'application/json'])
            ->assertCreated()->json('data.id');

        $this->patchJson("/api/animals/{$id}", ['name' => 'Rex', 'location' => 'Kennel D'])->assertOk();
        $this->assertSame('Rex', Animal::find($id)->name);

        $this->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Rescued'])->assertOk();
        $this->assertSame('Rescued', $report->fresh()->status);

        $this->deleteJson("/api/animals/{$id}")->assertOk();
        $this->assertNull(Animal::find($id));
    }

    public function test_kennel_manager_oversees_but_cannot_act(): void
    {
        Storage::fake('public');
        $animal = $this->animal();
        $report = $this->report();
        $application = $this->pendingApplication();

        $this->as('kennel_manager');

        // everything is readable
        $this->getJson('/api/animals')->assertOk();
        $this->getJson("/api/animals/{$animal->id}")->assertOk();
        $this->getJson('/api/adoption-applications')->assertOk();
        $this->getJson("/api/adoption-applications/{$application->id}")->assertOk();
        $this->getJson('/api/missing-pet-reports')->assertOk();
        $this->getJson("/api/missing-pet-reports/{$report->id}")->assertOk();
        $this->getJson('/api/vaccinations')->assertOk();
        $this->getJson('/api/audit-logs')->assertOk();                  // settings.system
        $this->getJson('/api/schedule/meta')->assertOk();               // shifts.manage

        // nothing can be changed
        $this->post('/api/animals', $this->createPayload(), ['Accept' => 'application/json'])->assertForbidden();
        $this->patchJson("/api/animals/{$animal->id}", ['name' => 'X'])->assertForbidden();
        $this->deleteJson("/api/animals/{$animal->id}")->assertForbidden();
        $this->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Rescued'])->assertForbidden();
        $this->postJson("/api/adoption-applications/{$application->id}/approve")->assertForbidden();
        $this->postJson("/api/adoption-applications/{$application->id}/reject")->assertForbidden();
        $this->postJson("/api/missing-pets/{$report->id}/register-animal")->assertForbidden();
        $this->postJson('/api/vaccinations', ['animal_id' => $animal->id, 'records' => [['vaccine_id' => \App\Models\Vaccine::where('name', 'Anti-rabies')->value('id'), 'administered_at' => '2026-01-01']]])->assertForbidden();

        $this->assertSame(2, Animal::count());                          // the two made for this test
        $this->assertSame('Lost', $report->fresh()->status);
        $this->assertSame('Pending', $application->fresh()->status);
    }

    public function test_adoption_counselor_decides_applications_but_not_report_status(): void
    {
        $report = $this->report();
        $toApprove = $this->pendingApplication();
        $toReject = $this->pendingApplication();

        $this->as('adoption_counselor');

        $this->postJson("/api/adoption-applications/{$toApprove->id}/approve")->assertOk();
        $this->postJson("/api/adoption-applications/{$toReject->id}/reject")->assertOk();
        $this->assertSame('Approved', $toApprove->fresh()->status);
        $this->assertSame('Rejected', $toReject->fresh()->status);

        $this->getJson("/api/missing-pet-reports/{$report->id}")->assertOk();
        $this->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Rescued'])->assertForbidden();
        $this->assertSame('Lost', $report->fresh()->status);
    }

    public function test_vet_tech_and_citizens_are_unchanged(): void
    {
        Storage::fake('public');
        $animal = $this->animal();
        $report = $this->report();
        $application = $this->pendingApplication();

        // vet tech: still records vaccinations and sets health status, still no animal, report or application actions
        $this->as('vet_tech');
        $this->postJson('/api/vaccinations', ['animal_id' => $animal->id, 'records' => [['vaccine_id' => \App\Models\Vaccine::where('name', 'Anti-rabies')->value('id'), 'administered_at' => '2026-01-01']]])->assertCreated();
        $this->patchJson("/api/animals/{$animal->id}", ['health_status' => 'Cleared'])->assertOk();

        foreach (['vet_tech', 'citizen'] as $role) {
            $this->as($role);
            $this->post('/api/animals', $this->createPayload(), ['Accept' => 'application/json'])->assertForbidden();
            $this->deleteJson("/api/animals/{$animal->id}")->assertForbidden();
            $this->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Rescued'])->assertForbidden();
            $this->postJson("/api/adoption-applications/{$application->id}/approve")->assertForbidden();
            $this->postJson("/api/adoption-applications/{$application->id}/reject")->assertForbidden();
        }

        $this->assertNotNull(Animal::find($animal->id));
        $this->assertSame('Pending', $application->fresh()->status);
    }

    public function test_guests_get_401_on_all_of_them(): void
    {
        Storage::fake('public');
        $animal = $this->animal();
        $report = $this->report();
        $application = $this->pendingApplication();

        $this->noAuth()->post('/api/animals', $this->createPayload(), ['Accept' => 'application/json'])->assertUnauthorized();
        $this->patchJson("/api/animals/{$animal->id}", ['name' => 'X'])->assertUnauthorized();
        $this->deleteJson("/api/animals/{$animal->id}")->assertUnauthorized();
        $this->patchJson("/api/missing-pet-reports/{$report->id}/status", ['status' => 'Rescued'])->assertUnauthorized();
        $this->postJson("/api/adoption-applications/{$application->id}/approve")->assertUnauthorized();
        $this->postJson("/api/adoption-applications/{$application->id}/reject")->assertUnauthorized();
        $this->postJson("/api/missing-pets/{$report->id}/register-animal")->assertUnauthorized();
    }
}

<?php

namespace Tests\Feature;

use App\Models\Animal;
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
            'name' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male', 'age_months' => 24,
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
        // Vaccinations: create only kennel manager and vet tech; everyone views
        foreach (self::STAFF as $role) {
            $this->as($role)->getJson('/api/vaccinations')->assertOk();
        }
        // Missing pets: every staff role can view
        foreach (self::STAFF as $role) {
            $this->as($role)->getJson('/api/missing-pet-reports')->assertOk();
        }
    }

    public function test_everyone_views_animals_but_only_the_manager_adds_them(): void
    {
        $animal = $this->animal();

        foreach (self::STAFF as $role) {
            $this->as($role)->getJson('/api/animals')->assertOk();
            $this->as($role)->getJson("/api/animals/{$animal->id}")->assertOk();
        }
        foreach (['adoption_counselor', 'vet_tech', 'pound_staff'] as $role) {
            $this->as($role)->postJson('/api/animals', [])->assertForbidden();
        }
    }

    public function test_basic_and_intake_fields_are_manager_only(): void
    {
        $animal = $this->animal();

        foreach (['adoption_counselor', 'vet_tech', 'pound_staff'] as $role) {
            foreach (['name' => 'X', 'species' => 'Cat', 'breed' => 'Y', 'sex' => 'Female', 'age_months' => 5, 'color' => 'Red', 'rescued_at' => '2026-01-01'] as $field => $value) {
                $this->as($role)->patchJson("/api/animals/{$animal->id}", [$field => $value])->assertForbidden();
            }
        }
        $this->as('kennel_manager')->patchJson("/api/animals/{$animal->id}", ['name' => 'Rex', 'color' => 'Brown'])->assertOk();
    }

    public function test_location_notes_and_status_follow_the_matrix(): void
    {
        $animal = $this->animal();
        $url = "/api/animals/{$animal->id}";

        // Kennel location: manager and pound staff
        $this->as('pound_staff')->patchJson($url, ['location' => 'Kennel B'])->assertOk();
        $this->as('kennel_manager')->patchJson($url, ['location' => 'Kennel C'])->assertOk();
        $this->as('adoption_counselor')->patchJson($url, ['location' => 'X'])->assertForbidden();
        $this->as('vet_tech')->patchJson($url, ['location' => 'X'])->assertForbidden();

        // Temperament / personality / description notes: all but vet tech
        foreach (['kennel_manager', 'adoption_counselor', 'pound_staff'] as $role) {
            $this->as($role)->patchJson($url, ['personality' => ['Calm'], 'description' => 'Daily note.'])->assertOk();
        }
        $this->as('vet_tech')->patchJson($url, ['personality' => ['Calm']])->assertForbidden();
        $this->as('vet_tech')->patchJson($url, ['description' => 'x'])->assertForbidden();

        // General status: pound staff none, counselor and vet limited, manager anything
        $this->as('pound_staff')->patchJson($url, ['status' => 'Pending Adoption'])->assertForbidden();
        $this->as('adoption_counselor')->patchJson($url, ['status' => 'Pending Adoption'])->assertOk();
        $this->as('adoption_counselor')->patchJson($url, ['status' => 'Reunited with Owner'])->assertForbidden();
        $this->as('adoption_counselor')->patchJson($url, ['status' => 'Rescued'])->assertForbidden();
        $this->as('vet_tech')->patchJson($url, ['status' => 'Adopted'])->assertForbidden();
        $this->as('vet_tech')->patchJson($url, ['status' => 'Rescued'])->assertOk();
        $this->as('kennel_manager')->patchJson($url, ['status' => 'Reunited with Owner'])->assertOk();

        // Health status: manager and vet tech only
        $this->as('vet_tech')->patchJson($url, ['health_status' => 'Cleared'])->assertOk();
        $this->as('pound_staff')->patchJson($url, ['health_status' => 'Under Treatment'])->assertForbidden();
        $this->as('adoption_counselor')->patchJson($url, ['health_status' => 'Under Treatment'])->assertForbidden();
    }

    public function test_every_staff_role_can_change_the_main_photo(): void
    {
        Storage::fake('public');
        $animal = $this->animal();
        $url = "/api/animals/{$animal->id}/photo";

        foreach (self::STAFF as $role) {
            $this->as($role)->postJson($url, ['image' => $this->png()])->assertOk();
        }
        $this->assertSame(1, $animal->photos()->count()); // replaced, not piled up

        $this->as('citizen')->postJson($url, ['image' => $this->png()])->assertForbidden();
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->postJson($url, ['image' => $this->png()])->assertUnauthorized();
        $this->as('pound_staff')->postJson($url, ['image' => UploadedFile::fake()->create('x.pdf', 5, 'application/pdf')])->assertUnprocessable();
    }

    public function test_qr_generation_is_for_kennel_manager_and_pound_staff_only(): void
    {
        $animal = $this->animal();

        foreach (['kennel_manager' => 200, 'pound_staff' => 200, 'vet_tech' => 403, 'adoption_counselor' => 403, 'citizen' => 403] as $role => $code) {
            $this->as($role)->getJson("/api/animals/{$animal->id}/qr")->assertStatus($code);
        }

        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->getJson("/api/animals/{$animal->id}/qr")->assertUnauthorized();
    }
}


<?php

namespace Tests\Feature;

use App\Models\AdoptionApplication;
use App\Models\Animal;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AnimalApiTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsRole(string $role): User
    {
        $user = new User(['name' => $role, 'email' => $role.'@test.com', 'password' => 'password123']);
        $user->role = $role;
        $user->save();

        // Switching users inside one test: drop the guard's cached user
        $this->app['auth']->forgetGuards();
        $this->withToken($user->createToken('auth')->plainTextToken);

        return $user;
    }

    private function animal(array $override = []): Animal
    {
        return Animal::create(array_merge([
            'name' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male', 'age_months' => 24,
            'location' => 'Main Animal Pound', 'status' => 'Rescued', 'health_status' => 'Under Observation',
            'description' => 'Friendly dog.', 'personality' => ['Friendly'],
        ], $override));
    }

    // Tiny real PNG (no GD needed)
    private function photo(string $name = 'photo.png'): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    private function payload(array $override = []): array
    {
        return array_merge([
            'name' => 'Biscuit', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male', 'age_months' => 18,
            'location' => 'Main Animal Pound', 'status' => 'Rescued', 'health_status' => 'Under Observation',
            'rescued_at' => '2026-10-01', 'description' => 'A friendly dog.', 'ideal_home' => 'A home with a yard.',
            'personality' => ['Friendly', 'Playful'],
            'images' => [$this->photo('a.png'), $this->photo('b.png'), $this->photo('c.png')],
        ], $override);
    }

    /* ---------- access ---------- */

    public function test_guest_gets_401_and_citizen_gets_403_on_staff_endpoints(): void
    {
        $this->getJson('/api/animals')->assertUnauthorized();

        $this->actingAsRole('citizen');
        $this->getJson('/api/animals')->assertForbidden();
        $this->postJson('/api/animals', [])->assertForbidden();
    }

    /* ---------- staff create / list ---------- */

    public function test_pound_staff_creates_an_animal_with_photos_code_and_audit_entry(): void
    {
        Storage::fake('public');
        $staff = $this->actingAsRole('pound_staff');

        $response = $this->post('/api/animals', $this->payload(), ['Accept' => 'application/json']);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Biscuit')
            ->assertJsonPath('data.status', 'Rescued')
            ->assertJsonCount(3, 'data.images');

        $animal = Animal::first();
        $this->assertSame(sprintf('PAW-%04d', $animal->id), $animal->animal_code);
        $this->assertNotEmpty($animal->qr_token);
        $this->assertCount(3, $animal->photos);
        Storage::disk('public')->assertExists($animal->photos->first()->path);
        $this->assertDatabaseHas('audit_logs', ['user_id' => $staff->id, 'action' => 'animal.created', 'entity_id' => $animal->id]);
    }

    public function test_create_needs_three_to_four_photos(): void
    {
        Storage::fake('public');
        $this->actingAsRole('pound_staff');

        $this->post('/api/animals', $this->payload(['images' => [$this->photo()]]), ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors(['images']);
    }

    public function test_a_new_animal_always_starts_as_rescued(): void
    {
        Storage::fake('public');
        $this->actingAsRole('pound_staff');

        // no other status is accepted, whatever the health status says (even a cleared animal)
        foreach (['Available for Adoption', 'Pending Adoption', 'Adopted', 'Reunited with Owner'] as $status) {
            $response = $this->post('/api/animals', $this->payload(['status' => $status, 'health_status' => 'Cleared']), ['Accept' => 'application/json'])
                ->assertUnprocessable()->assertJsonValidationErrors(['status']);

            $this->assertStringContainsString('always starts as "Rescued"', $response->json('errors.status.0'));
        }
        $this->assertSame(0, Animal::count());

        // Rescued, or no status at all, creates a Rescued animal
        $this->post('/api/animals', $this->payload(), ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonPath('data.status', 'Rescued');

        $withoutStatus = $this->payload();
        unset($withoutStatus['status']);
        $this->post('/api/animals', $withoutStatus, ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonPath('data.status', 'Rescued');

        $this->assertSame(['Rescued'], Animal::pluck('status')->unique()->values()->all());
    }

    public function test_only_roles_with_create_permission_can_create(): void
    {
        Storage::fake('public');

        // the kennel manager only oversees: no creating, editing or deleting animals
        foreach (['vet_tech', 'adoption_counselor', 'kennel_manager'] as $role) {
            $this->actingAsRole($role);
            $this->post('/api/animals', $this->payload(), ['Accept' => 'application/json'])->assertForbidden();
        }

        $this->assertSame(0, Animal::count());
    }

    public function test_staff_list_filters_and_paginates(): void
    {
        $this->actingAsRole('pound_staff');
        $this->animal(['name' => 'Milo']);
        $this->animal(['name' => 'Luna', 'species' => 'Cat', 'status' => 'Adopted']);

        $this->getJson('/api/animals?type=Cat')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Luna');
        $this->getJson('/api/animals?q=milo')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/animals?status=Adopted&per_page=1')->assertOk()->assertJsonPath('meta.total', 1);
    }

    public function test_staff_list_filters_animals_of_species_other_and_shows_what_they_are(): void
    {
        $this->actingAsRole('pound_staff');
        $this->animal(['name' => 'Milo']);
        $this->animal(['name' => 'Thumper', 'species' => 'Other', 'other_species' => 'Rabbit']);
        $this->animal(['name' => 'Nameless', 'species' => 'Other']);

        $response = $this->getJson('/api/animals?type=Other')->assertOk()->assertJsonCount(2, 'data');
        $this->assertEqualsCanonicalizing(['Thumper', 'Nameless'], collect($response->json('data'))->pluck('name')->all());

        $thumper = collect($response->json('data'))->firstWhere('name', 'Thumper');
        $this->assertSame('Other', $thumper['type']);
        $this->assertSame('Rabbit', $thumper['other_species']);
        $this->assertNull(collect($response->json('data'))->firstWhere('name', 'Nameless')['other_species']);
    }

    /* ---------- field level permissions ---------- */

    public function test_pound_staff_can_edit_the_animal_and_the_kennel_manager_cannot(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('pound_staff');

        $this->patchJson("/api/animals/{$animal->id}", ['location' => 'North Holding Area'])->assertOk();
        $this->assertSame('North Holding Area', $animal->fresh()->location);

        // animals.edit covers the basic, intake and health fields too
        $this->patchJson("/api/animals/{$animal->id}", ['name' => 'Renamed', 'color' => 'Brown'])->assertOk();
        $this->patchJson("/api/animals/{$animal->id}", ['health_status' => 'Cleared'])->assertOk();
        $this->assertSame('Renamed', $animal->fresh()->name);

        $this->actingAsRole('kennel_manager');
        $this->patchJson("/api/animals/{$animal->id}", ['name' => 'Nope'])->assertForbidden();
        $this->patchJson("/api/animals/{$animal->id}", ['location' => 'Nope'])->assertForbidden();
        $this->assertSame('Renamed', $animal->fresh()->name);
    }

    public function test_counselor_can_set_status_but_not_health_status(): void
    {
        $animal = $this->animal(['health_status' => 'Cleared']);
        $this->actingAsRole('adoption_counselor');

        $this->patchJson("/api/animals/{$animal->id}", ['status' => 'Available for Adoption'])->assertOk();
        $this->patchJson("/api/animals/{$animal->id}", ['health_status' => 'Under Treatment'])->assertForbidden();
    }

    public function test_vet_tech_can_set_health_status_but_not_location(): void
    {
        $animal = $this->animal();
        $this->actingAsRole('vet_tech');

        $this->patchJson("/api/animals/{$animal->id}", ['health_status' => 'Cleared'])->assertOk();
        $this->patchJson("/api/animals/{$animal->id}", ['location' => 'Elsewhere'])->assertForbidden();
    }

    public function test_update_keeps_the_cleared_rule_and_writes_an_audit_entry(): void
    {
        $animal = $this->animal();
        $counselor = $this->actingAsRole('adoption_counselor');

        // the counselor may list it for adoption, but not before it is cleared
        $this->patchJson("/api/animals/{$animal->id}", ['status' => 'Available for Adoption'])
            ->assertUnprocessable()->assertJsonValidationErrors(['status']);

        $this->actingAsRole('vet_tech');
        $this->patchJson("/api/animals/{$animal->id}", ['health_status' => 'Cleared'])->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($counselor->createToken('auth')->plainTextToken);
        $this->patchJson("/api/animals/{$animal->id}", ['status' => 'Available for Adoption'])->assertOk();
        $this->assertDatabaseHas('audit_logs', ['action' => 'animal.updated', 'entity_id' => $animal->id]);

        // Going back to Under Treatment while still listed is also refused
        $this->actingAsRole('pound_staff');
        $this->patchJson("/api/animals/{$animal->id}", ['health_status' => 'Under Treatment'])->assertUnprocessable();
    }

    public function test_pound_staff_cannot_set_an_adoption_status(): void
    {
        $animal = $this->animal(['health_status' => 'Cleared']);
        $url = "/api/animals/{$animal->id}";
        $this->actingAsRole('pound_staff');

        // Available / Pending / Adopted belong to the adoption flow
        foreach (['Available for Adoption', 'Pending Adoption', 'Adopted'] as $status) {
            $this->patchJson($url, ['status' => $status])->assertForbidden();
        }
        // also when the health status is sent along (the cleared rule would be met)
        $this->patchJson($url, ['status' => 'Available for Adoption', 'health_status' => 'Cleared'])->assertForbidden();
        $this->assertSame('Rescued', $animal->fresh()->status);

        // Rescued and Reunited with Owner stay available to pound staff
        $this->patchJson($url, ['status' => 'Reunited with Owner'])->assertOk();
        $this->assertSame('Reunited with Owner', $animal->fresh()->status);
        $this->patchJson($url, ['status' => 'Rescued'])->assertOk();
        $this->assertSame('Rescued', $animal->fresh()->status);
    }

    public function test_pound_staff_cannot_move_an_animal_out_of_an_adoption_status_but_can_keep_editing_it(): void
    {
        $this->actingAsRole('pound_staff');

        foreach (['Available for Adoption', 'Pending Adoption', 'Adopted'] as $status) {
            $animal = $this->animal(['status' => $status, 'health_status' => 'Cleared']);
            $url = "/api/animals/{$animal->id}";

            // the Edit page sends the unchanged status along with the other fields: that is fine
            $this->patchJson($url, ['status' => $status, 'name' => 'Renamed', 'location' => 'Kennel Z'])->assertOk();
            $this->assertSame($status, $animal->fresh()->status);
            $this->assertSame('Renamed', $animal->fresh()->name);

            // but it cannot be moved out of that status
            foreach (['Rescued', 'Reunited with Owner'] as $to) {
                $this->patchJson($url, ['status' => $to])->assertForbidden();
            }
            $this->assertSame($status, $animal->fresh()->status);
        }
    }

    public function test_counselor_and_vet_tech_keep_their_status_powers(): void
    {
        $animal = $this->animal(['health_status' => 'Cleared']);
        $url = "/api/animals/{$animal->id}";

        // counselor: the adoption statuses only
        $this->actingAsRole('adoption_counselor');
        foreach (['Available for Adoption', 'Pending Adoption', 'Adopted'] as $status) {
            $this->patchJson($url, ['status' => $status])->assertOk();
        }
        $this->patchJson($url, ['status' => 'Rescued'])->assertForbidden();
        $this->patchJson($url, ['status' => 'Reunited with Owner'])->assertForbidden();

        // vet tech: back to Rescued or ready for adoption, also out of an adoption status
        $this->actingAsRole('vet_tech');
        $this->patchJson($url, ['status' => 'Rescued'])->assertOk();
        $this->patchJson($url, ['status' => 'Available for Adoption'])->assertOk();
        $this->patchJson($url, ['status' => 'Pending Adoption'])->assertForbidden();
        $this->assertSame('Available for Adoption', $animal->fresh()->status);
    }

    public function test_delete_is_pound_staff_only_and_blocked_by_applications(): void
    {
        $animal = $this->animal();

        foreach (['vet_tech', 'adoption_counselor', 'kennel_manager'] as $role) {
            $this->actingAsRole($role);
            $this->deleteJson("/api/animals/{$animal->id}")->assertForbidden();
        }

        $staff = $this->actingAsRole('pound_staff');
        $applicant = new User(['name' => 'A', 'email' => 'a@test.com', 'password' => 'password123']);
        $applicant->save();
        $application = new AdoptionApplication(['user_id' => $applicant->id, 'animal_id' => $animal->id]);
        $application->forceFill([
            'first_name' => 'A', 'last_name' => 'B', 'address' => 'x', 'phone' => '0917 000 0000', 'email' => 'a@test.com',
            'birth_date' => '1999-01-01', 'employment_status' => 'Student', 'civil_status' => 'Single', 'residence' => 'House',
            'household_members' => 2, 'valid_id_path' => 'x', 'home_photo_paths' => ['a', 'b'], 'why_adopt' => 'x',
            'how_care' => 'x', 'terms_accepted' => true,
        ])->save();

        $this->deleteJson("/api/animals/{$animal->id}")->assertUnprocessable();

        $application->delete();
        $this->deleteJson("/api/animals/{$animal->id}")->assertOk();
        $this->assertDatabaseMissing('animals', ['id' => $animal->id]);
        $this->assertDatabaseHas('audit_logs', ['user_id' => $staff->id, 'action' => 'animal.deleted']);
        $this->assertSame(1, AuditLog::where('action', 'animal.deleted')->count());
    }

    /* ---------- public listing ---------- */

    public function test_public_list_only_shows_adoptable_animals_without_health_status(): void
    {
        $this->animal(['name' => 'Open', 'status' => 'Available for Adoption', 'health_status' => 'Cleared']);
        $this->animal(['name' => 'Hidden', 'status' => 'Rescued']);
        $this->animal(['name' => 'Gone', 'status' => 'Adopted', 'health_status' => 'Cleared']);

        $response = $this->getJson('/api/pets')->assertOk();

        $response->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Open');
        $this->assertArrayNotHasKey('health_status', $response->json('data.0'));
        $this->assertArrayNotHasKey('owner_name', $response->json('data.0'));
    }

    public function test_public_filters(): void
    {
        $base = ['status' => 'Available for Adoption', 'health_status' => 'Cleared'];
        $this->animal($base + ['name' => 'Puppy', 'age_months' => 6, 'sex' => 'Male', 'breed' => 'Aspin']);
        $this->animal($base + ['name' => 'Cat1', 'species' => 'Cat', 'age_months' => 48, 'sex' => 'Female', 'breed' => 'Puspin']);

        $this->getJson('/api/pets?type=Cat')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Cat1');
        $this->getJson('/api/pets?age=baby')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Puppy');
        $this->getJson('/api/pets?age=adult')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Cat1');
        $this->getJson('/api/pets?sex=Female')->assertJsonCount(1, 'data');
        $this->getJson('/api/pets?breed=Aspin')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Puppy');
        $this->getJson('/api/pets')->assertJsonPath('breeds', ['Aspin', 'Puspin']);
    }

    public function test_public_details_404_for_animals_not_open_for_adoption(): void
    {
        $open = $this->animal(['status' => 'Available for Adoption', 'health_status' => 'Cleared']);
        $closed = $this->animal(['name' => 'Closed']);

        $this->getJson("/api/pets/{$open->id}")->assertOk()->assertJsonPath('data.name', 'Milo');
        $this->getJson("/api/pets/{$closed->id}")->assertNotFound();
    }

    /* ---------- stray QR ---------- */

    public function test_stray_page_shows_owner_info_only_when_known(): void
    {
        $withOwner = $this->animal(['owner_name' => 'Mang Berting', 'owner_contact' => '0920 555 0144']);
        $stray = $this->animal(['name' => 'Stray']);

        $this->getJson("/api/stray/{$withOwner->qr_token}")->assertOk()
            ->assertJsonPath('data.owner.name', 'Mang Berting')
            ->assertJsonMissingPath('data.health_status');
        $this->getJson("/api/stray/{$stray->qr_token}")->assertOk()->assertJsonPath('data.owner', null);

        // the scan page never shows or receives the age
        $this->getJson("/api/stray/{$withOwner->qr_token}")->assertOk()
            ->assertJsonMissingPath('data.ageLabel')->assertJsonMissingPath('data.age_months');
        $this->getJson('/api/stray/not-a-real-token')->assertNotFound();
    }

    public function test_staff_can_get_the_qr_svg(): void
    {
        $animal = $this->animal();

        $this->getJson("/api/animals/{$animal->id}/qr")->assertUnauthorized();

        $this->actingAsRole('pound_staff');
        $response = $this->get("/api/animals/{$animal->id}/qr");
        $response->assertOk()->assertHeader('Content-Type', 'image/svg+xml');
        $this->assertStringContainsString('<svg', $response->getContent());
    }

    public function test_history_lists_the_changes_vaccinations_and_decisions_for_that_animal_only(): void
    {
        $animal = $this->animal();
        $other = $this->animal();
        $this->actingAsRole('pound_staff');

        $this->patchJson("/api/animals/{$animal->id}", ['location' => 'North Holding Area'])->assertOk();
        $this->patchJson("/api/animals/{$other->id}", ['location' => 'Elsewhere'])->assertOk();

        $this->actingAsRole('vet_tech');
        $this->postJson('/api/vaccinations', ['animal_id' => $animal->id, 'records' => [['vaccine_id' => \App\Models\Vaccine::where('name', 'Anti-rabies')->value('id'), 'administered_at' => '2026-01-01']]])->assertCreated();

        // the kennel manager reads the history (overview) without changing anything
        $this->actingAsRole('kennel_manager');
        $actions = collect($this->getJson("/api/animals/{$animal->id}/history")->assertOk()->json('data'))->pluck('action')->all();

        $this->assertEqualsCanonicalizing(['animal.updated', 'vaccination.created'], $actions);

        $this->actingAsRole('citizen');
        $this->getJson("/api/animals/{$animal->id}/history")->assertForbidden();
    }
}

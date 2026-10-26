<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\AnimalPhoto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// The QR: who can view it, and what pound staff can still correct on an Adopted animal
// (name, description, owner info, photos), which the public scan page shows at once.
class AdoptedAnimalQrEditTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsRole(string $role): User
    {
        $user = new User(['name' => $role, 'email' => $role.'@test.com', 'password' => 'password123']);
        $user->role = $role;
        $user->save();

        // switching users inside one test: drop the guard's cached user
        $this->app['auth']->forgetGuards();
        $this->withToken($user->createToken('auth')->plainTextToken);

        return $user;
    }

    // Tiny real PNG (no GD needed)
    private function png(string $name = 'photo.png'): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    private function adopted(int $photos = 3): Animal
    {
        $animal = Animal::create([
            'name' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male', 'age_months' => 24,
            'location' => 'Main Animal Pound', 'status' => 'Adopted', 'health_status' => 'Cleared',
            'description' => 'Friendly dog.', 'personality' => ['Friendly'],
            'owner_name' => 'Maria Santos', 'owner_contact' => '0917 555 0187',
        ]);

        foreach (range(0, $photos - 1) as $position) {
            $animal->photos()->create(['path' => "animals/{$animal->id}/p{$position}.png", 'position' => $position]);
        }

        return $animal;
    }

    /* ---------- who can view the QR ---------- */

    public function test_pound_staff_and_kennel_manager_can_view_the_qr_and_others_get_403(): void
    {
        $animal = $this->adopted();

        foreach (['pound_staff' => 200, 'kennel_manager' => 200, 'vet_tech' => 403, 'adoption_counselor' => 403, 'citizen' => 403] as $role => $code) {
            $this->actingAsRole($role);
            $this->get("/api/animals/{$animal->id}/qr", ['Accept' => 'application/json'])->assertStatus($code);
        }
    }

    public function test_the_qr_exists_without_any_button_click(): void
    {
        // every animal gets its token when it is created
        $this->assertNotEmpty($this->adopted()->qr_token);
    }

    /* ---------- editing an Adopted animal ---------- */

    public function test_pound_staff_can_edit_name_description_and_owner_of_an_adopted_animal_and_the_scan_page_shows_it(): void
    {
        $staff = $this->actingAsRole('pound_staff');
        $animal = $this->adopted();

        $this->patchJson("/api/animals/{$animal->id}", [
            'name' => 'Milo Jr', 'description' => 'Now a happy family dog.',
            'owner_name' => 'Maria S. Santos', 'owner_contact' => '0999 000 1111',
            // the Edit page also sends the current statuses along: unchanged values are fine
            'status' => 'Adopted', 'health_status' => 'Cleared',
        ])->assertOk();

        $this->assertDatabaseHas('audit_logs', ['user_id' => $staff->id, 'action' => 'animal.updated', 'entity_id' => $animal->id]);

        // the public scan page reads the new values right away
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();
        $response = $this->getJson("/api/stray/{$animal->qr_token}")->assertOk()
            ->assertJsonPath('data.name', 'Milo Jr')
            ->assertJsonPath('data.description', 'Now a happy family dog.')
            ->assertJsonPath('data.owner.name', 'Maria S. Santos')
            ->assertJsonPath('data.owner.contact', '0999 000 1111');

        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
    }

    public function test_pound_staff_still_cannot_change_adoption_or_health_status(): void
    {
        $this->actingAsRole('pound_staff');
        $animal = $this->adopted();

        $this->patchJson("/api/animals/{$animal->id}", ['status' => 'Available for Adoption'])->assertForbidden();
        $this->patchJson("/api/animals/{$animal->id}", ['status' => 'Rescued'])->assertForbidden();

        $this->patchJson("/api/animals/{$animal->id}", ['status' => 'Pending Adoption'])->assertForbidden();

        $this->assertSame('Adopted', $animal->fresh()->status);
    }

    public function test_the_kennel_manager_and_the_vet_cannot_edit_the_owner_or_name(): void
    {
        $animal = $this->adopted();

        foreach (['kennel_manager', 'vet_tech', 'adoption_counselor'] as $role) {
            $this->actingAsRole($role);
            $this->patchJson("/api/animals/{$animal->id}", ['owner_name' => 'Someone Else'])->assertForbidden();
            $this->patchJson("/api/animals/{$animal->id}", ['name' => 'Renamed'])->assertForbidden();
        }

        $this->assertSame('Maria Santos', $animal->fresh()->owner_name);
    }

    /* ---------- photos of an Adopted animal ---------- */

    public function test_pound_staff_can_add_replace_and_remove_photos_within_three_to_four_and_it_is_audited(): void
    {
        Storage::fake('public');
        $staff = $this->actingAsRole('pound_staff');
        $animal = $this->adopted(3);

        // add: 3 -> 4
        $this->post("/api/animals/{$animal->id}/photos", ['image' => $this->png()], ['Accept' => 'application/json'])
            ->assertOk()->assertJsonCount(4, 'data.photos');
        $this->assertDatabaseHas('audit_logs', ['user_id' => $staff->id, 'action' => 'animal.photo_added', 'entity_id' => $animal->id]);

        // a fifth one is refused
        $this->post("/api/animals/{$animal->id}/photos", ['image' => $this->png()], ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors(['image']);
        $this->assertSame(4, $animal->photos()->count());

        // replace the main photo
        $mainBefore = $animal->photos()->first()->path;
        $this->post("/api/animals/{$animal->id}/photo", ['image' => $this->png()], ['Accept' => 'application/json'])->assertOk();
        $this->assertNotSame($mainBefore, $animal->photos()->first()->fresh()->path);
        $this->assertDatabaseHas('audit_logs', ['action' => 'animal.photo_changed', 'entity_id' => $animal->id]);

        // remove: 4 -> 3, then the third is protected
        $photo = $animal->photos()->get()->last();
        $this->deleteJson("/api/animals/{$animal->id}/photos/{$photo->id}")->assertOk()->assertJsonCount(3, 'data.photos');
        $this->assertDatabaseHas('audit_logs', ['user_id' => $staff->id, 'action' => 'animal.photo_removed', 'entity_id' => $animal->id]);

        $another = $animal->photos()->first();
        $this->deleteJson("/api/animals/{$animal->id}/photos/{$another->id}")
            ->assertUnprocessable()->assertJsonValidationErrors(['photo']);
        $this->assertSame(3, $animal->photos()->count());

        // the scan page shows the current photos
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();
        $this->getJson("/api/stray/{$animal->qr_token}")->assertOk()->assertJsonCount(3, 'data.images');
    }

    public function test_a_photo_of_another_animal_cannot_be_removed_and_other_roles_cannot_manage_photos(): void
    {
        Storage::fake('public');
        $animal = $this->adopted(4);
        $other = $this->adopted(4);
        $foreign = AnimalPhoto::where('animal_id', $other->id)->first();

        $this->actingAsRole('pound_staff');
        $this->deleteJson("/api/animals/{$animal->id}/photos/{$foreign->id}")->assertNotFound();

        $own = $animal->photos()->first();
        foreach (['kennel_manager', 'vet_tech', 'adoption_counselor', 'citizen'] as $role) {
            $this->actingAsRole($role);
            $this->post("/api/animals/{$animal->id}/photos", ['image' => $this->png()], ['Accept' => 'application/json'])->assertForbidden();
            $this->deleteJson("/api/animals/{$animal->id}/photos/{$own->id}")->assertForbidden();
        }
        $this->assertSame(4, $animal->photos()->count());
    }

    public function test_the_photo_upload_keeps_the_existing_validation(): void
    {
        Storage::fake('public');
        $this->actingAsRole('pound_staff');
        $animal = $this->adopted(3);

        $this->post("/api/animals/{$animal->id}/photos", ['image' => UploadedFile::fake()->create('x.pdf', 5, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertUnprocessable();
        $this->assertSame(3, $animal->photos()->count());
    }
}

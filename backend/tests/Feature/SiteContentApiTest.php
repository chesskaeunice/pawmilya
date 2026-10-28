<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SiteContentApiTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(string $role): string
    {
        $user = new User(['name' => $role, 'email' => $role.'@test.com', 'password' => 'Str0ng!Passw0rd']);
        $user->role = $role;
        $user->save();

        return $user->createToken('t')->plainTextToken;
    }

    // Tiny real PNG (no GD needed)
    private function pngBytes(): string
    {
        return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    private function png(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('qr.png', $this->pngBytes());
    }

    private function animal(array $override = []): Animal
    {
        return Animal::create(array_merge([
            'name' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male',
            'location' => 'Main Animal Pound', 'status' => 'Rescued', 'health_status' => 'Under Observation',
            'description' => 'Friendly dog.', 'personality' => ['Friendly'],
        ], $override));
    }

    public function test_public_site_info_needs_no_login_and_has_defaults(): void
    {
        $this->getJson('/api/public/site-info')->assertOk()
            ->assertJsonPath('data.pound.phone', '(02) 8000 0000')
            ->assertJsonPath('data.donation.qr', null)
            ->assertJsonPath('data.about.images', [])
            ->assertJsonCount(2, 'data.inKind');
    }

    public function test_only_the_kennel_manager_can_change_site_content(): void
    {
        $this->putJson('/api/site-content', [])->assertUnauthorized();
        $this->getJson('/api/site-content')->assertUnauthorized();

        foreach (['pound_staff', 'vet_tech', 'adoption_counselor', 'citizen'] as $role) {
            $token = $this->tokenFor($role);
            $this->withToken($token)->putJson('/api/site-content', ['pound' => ['phone' => '1']])->assertForbidden();
            $this->withToken($token)->postJson('/api/site-content/images/donation_qr')->assertForbidden();
            $this->flushHeaders();
        }
    }

    public function test_manager_edits_text_and_empty_values_are_hidden_publicly(): void
    {
        $token = $this->tokenFor('kennel_manager');

        $this->withToken($token)->putJson('/api/site-content', [
            'pound' => ['phone' => '0917 000 1111', 'hours' => '', 'map_link' => 'https://maps.example.com/x'],
            'in_kind' => [['title' => 'Food', 'items' => ['Dog food', '', 'Cat food']], ['title' => 'Empty list', 'items' => []]],
        ])->assertOk();

        // public cache is cleared by the save
        $this->flushHeaders();
        $public = $this->getJson('/api/public/site-info')->assertOk();
        $public->assertJsonPath('data.pound.phone', '0917 000 1111')->assertJsonPath('data.pound.hours', '');
        $this->assertSame(['Dog food', 'Cat food'], $public->json('data.inKind.0.items'));
        $this->assertCount(1, $public->json('data.inKind')); // group without items is dropped
        $this->assertDatabaseHas('audit_logs', ['action' => 'site.updated']);
    }

    public function test_text_update_validates_email_and_link_and_cannot_set_image_paths(): void
    {
        $token = $this->tokenFor('kennel_manager');

        $this->withToken($token)->putJson('/api/site-content', ['pound' => ['email' => 'nope', 'map_link' => 'javascript:alert(1)']])
            ->assertUnprocessable()->assertJsonValidationErrors(['pound.email', 'pound.map_link']);

        $this->withToken($token)->putJson('/api/site-content', ['donation' => ['qr' => '../../.env']])->assertOk();
        $this->assertNull($this->getJson('/api/public/site-info')->json('data.donation.qr'));
    }

    private function poundInfo(array $override = []): array
    {
        return array_merge([
            'name' => 'Quiapo Animal Pound',
            'address' => 'Barangay 387, Quiapo, Manila',
            'phone' => '(02) 8555 0100',
            'email' => 'pound@pawmilya.ph',
            'hours' => 'Mon-Sat, 8:00 AM - 5:00 PM',
            'vision' => 'A Manila where every pet has a home.',
            'mission' => 'Connect adopters and the pound.',
        ], $override);
    }

    public function test_kennel_manager_saves_pound_information_and_the_public_endpoint_returns_it(): void
    {
        $token = $this->tokenFor('kennel_manager');

        $this->withToken($token)->patchJson('/api/pound-info', $this->poundInfo())
            ->assertOk()->assertJsonPath('data.pound.name', 'Quiapo Animal Pound');

        $this->flushHeaders();
        $this->getJson('/api/public/site-info')->assertOk()
            ->assertJsonPath('data.pound.name', 'Quiapo Animal Pound')
            ->assertJsonPath('data.pound.address', 'Barangay 387, Quiapo, Manila')
            ->assertJsonPath('data.pound.phone', '(02) 8555 0100')
            ->assertJsonPath('data.pound.email', 'pound@pawmilya.ph')
            ->assertJsonPath('data.pound.hours', 'Mon-Sat, 8:00 AM - 5:00 PM')
            ->assertJsonPath('data.about.vision', 'A Manila where every pet has a home.')
            ->assertJsonPath('data.about.mission', 'Connect adopters and the pound.');

        $this->assertDatabaseHas('audit_logs', ['action' => 'site.pound_updated']);
    }

    public function test_pound_information_is_for_the_kennel_manager_only(): void
    {
        $this->patchJson('/api/pound-info', $this->poundInfo())->assertUnauthorized();

        foreach (['pound_staff', 'vet_tech', 'adoption_counselor', 'citizen'] as $role) {
            $this->withToken($this->tokenFor($role))->patchJson('/api/pound-info', $this->poundInfo())->assertForbidden();
            $this->flushHeaders();
        }
    }

    public function test_pound_information_is_validated(): void
    {
        $token = $this->tokenFor('kennel_manager');

        $this->withToken($token)->patchJson('/api/pound-info', $this->poundInfo([
            'name' => '', 'phone' => 'call me', 'email' => 'nope', 'address' => str_repeat('a', 256), 'vision' => str_repeat('v', 1001),
        ]))->assertUnprocessable()->assertJsonValidationErrors(['name', 'phone', 'email', 'address', 'vision']);

        $this->withToken($token)->patchJson('/api/pound-info', [])->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'address', 'phone', 'email', 'hours', 'vision', 'mission']);

        // nothing was saved
        $this->assertSame('(02) 8000 0000', $this->getJson('/api/public/site-info')->json('data.pound.phone'));
    }

    public function test_image_upload_accepts_images_and_rejects_bad_files(): void
    {
        Storage::fake('public');
        $token = $this->tokenFor('kennel_manager');

        $this->withToken($token)->postJson('/api/site-content/images/donation_qr', ['image' => $this->png()])
            ->assertOk();
        $this->assertNotNull($this->getJson('/api/public/site-info')->json('data.donation.qr'));

        // wrong type, too large, svg, unknown slot
        $this->withToken($token)->postJson('/api/site-content/images/about_1', ['image' => UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')])->assertUnprocessable();
        $this->withToken($token)->postJson('/api/site-content/images/about_1', ['image' => UploadedFile::fake()->createWithContent('big.png', $this->pngBytes().str_repeat('0', 6 * 1024 * 1024))])->assertUnprocessable();
        $this->withToken($token)->postJson('/api/site-content/images/about_1', ['image' => UploadedFile::fake()->create('x.svg', 5, 'image/svg+xml')])->assertUnprocessable();
        $this->withToken($token)->postJson('/api/site-content/images/hacker', ['image' => $this->png()])->assertNotFound();

        $this->withToken($token)->deleteJson('/api/site-content/images/donation_qr')->assertOk();
        $this->assertNull($this->getJson('/api/public/site-info')->json('data.donation.qr'));
    }

    public function test_public_pet_list_shows_only_available_animals_without_private_fields_and_follows_edits(): void
    {
        $this->getJson('/api/pets')->assertOk()->assertJsonCount(0, 'data');

        $animal = $this->animal(['status' => 'Available for Adoption', 'health_status' => 'Cleared']);
        $this->animal(['status' => 'Rescued']);

        // The earlier empty answer was cached; saving an animal must clear it
        $response = $this->getJson('/api/pets')->assertOk();
        $response->assertJsonCount(1, 'data')->assertJsonMissingPath('data.0.health_status')->assertJsonMissingPath('data.0.animal_code');

        $animal->update(['status' => 'Adopted']);
        $this->getJson('/api/pets')->assertJsonCount(0, 'data');
    }
}

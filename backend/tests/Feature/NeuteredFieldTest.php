<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

// Spayed / Neutered is a health field: kennel manager and vet tech edit it, counselor and pound staff only view it
class NeuteredFieldTest extends TestCase
{
    use RefreshDatabase;

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

    private function newAnimal(array $override = []): array
    {
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');

        return array_merge([
            'name' => 'Rex', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male', 'neutered' => 0,
            'location' => 'Kennel A', 'health_status' => 'Under Observation', 'rescued_at' => '2026-01-01',
            'description' => 'Friendly.', 'ideal_home' => 'A quiet home.', 'personality' => ['Calm'],
            'images' => array_map(fn ($i) => UploadedFile::fake()->createWithContent("p$i.png", $png), [1, 2, 3]),
        ], $override);
    }

    public function test_vet_tech_and_kennel_manager_can_edit_it(): void
    {
        $animal = $this->animal();

        foreach (['vet_tech' => true, 'kennel_manager' => false] as $role => $value) {
            $this->as($role)->patchJson("/api/animals/{$animal->id}", ['neutered' => $value])
                ->assertOk()->assertJsonPath('data.neutered', $value);
            $this->assertSame($value, $animal->fresh()->neutered, $role);
        }
    }

    public function test_counselor_and_pound_staff_only_view_it(): void
    {
        $animal = $this->animal();

        foreach (['adoption_counselor', 'pound_staff'] as $role) {
            $this->as($role)->patchJson("/api/animals/{$animal->id}", ['neutered' => true])->assertForbidden();
            $this->as($role)->getJson("/api/animals/{$animal->id}")->assertOk()->assertJsonPath('data.neutered', false);
        }

        $this->assertFalse($animal->fresh()->neutered);
    }

    public function test_it_must_be_yes_or_no(): void
    {
        $animal = $this->animal();

        $this->as('vet_tech')->patchJson("/api/animals/{$animal->id}", ['neutered' => 'maybe'])
            ->assertUnprocessable()->assertJsonValidationErrors(['neutered']);
    }

    public function test_a_new_animal_needs_it_and_stores_it(): void
    {
        $this->as('pound_staff')->post('/api/animals', $this->newAnimal(['neutered' => null]), ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors(['neutered']);

        $this->as('pound_staff')->post('/api/animals', $this->newAnimal(['neutered' => 1]), ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonPath('data.neutered', true);
    }

    public function test_the_age_is_gone(): void
    {
        $animal = $this->animal();

        $this->assertFalse(Schema::hasColumn('animals', 'age_months'));
        $this->as('vet_tech')->getJson("/api/animals/{$animal->id}")->assertOk()
            ->assertJsonMissingPath('data.age_months')->assertJsonMissingPath('data.ageLabel');
    }
}

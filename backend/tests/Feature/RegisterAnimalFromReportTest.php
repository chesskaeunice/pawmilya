<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\AuditLog;
use App\Models\MissingPetReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// A Found missing pet report can be registered as an animal in the pound (status Rescued)
class RegisterAnimalFromReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    private function as(?string $role): ?User
    {
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        if (! $role) {
            return null;
        }

        $user = User::where('role', $role)->first() ?? tap(new User(['name' => ucfirst($role), 'email' => $role.'@test.com', 'phone' => '0917 000 1111', 'password' => 'Str0ng!Passw0rd']), function ($u) use ($role) {
            $u->role = $role;
            $u->save();
        });

        $this->withToken($user->createToken('t')->plainTextToken);

        return $user;
    }

    // A stored report with 2 pet photos and 1 last seen photo (real files on the fake disk)
    private function report(string $status = 'Found', array $override = []): MissingPetReport
    {
        $report = new MissingPetReport(array_merge([
            'name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Orange', 'sex' => 'Female',
            'location' => 'Hidalgo Street, Barangay 306, Quiapo, Manila', 'last_seen_at' => '2026-10-20 08:00:00',
            'details' => 'Wears a red collar.', 'contact_name' => 'Maria Santos', 'contact_number' => '0917 123 4567',
        ], $override));
        $report->status = $status;
        $report->fingerprint = sha1(uniqid('', true));
        $report->save();

        foreach ([['pet', 0, 'pet-a.jpg'], ['pet', 1, 'pet-b.jpg'], ['last_seen', 0, 'area.jpg']] as [$kind, $position, $file]) {
            $path = "missing-pets/{$report->id}/{$file}";
            Storage::disk('public')->put($path, "photo {$file}");
            $report->photos()->create(['path' => $path, 'kind' => $kind, 'position' => $position]);
        }

        return $report;
    }

    private function register(MissingPetReport $report)
    {
        return $this->postJson("/api/missing-pets/{$report->id}/register-animal");
    }

    public function test_pound_staff_can_register_a_found_report(): void
    {
        foreach (['pound_staff'] as $role) {
            $user = $this->as($role);
            $report = $this->report('Found');

            $response = $this->register($report)->assertCreated();
            $animal = Animal::findOrFail($response->json('data.id'));

            // the animal comes from the report
            $this->assertSame('Miming', $animal->name);
            $this->assertSame('Cat', $animal->species);
            $this->assertSame('Puspin', $animal->breed);
            $this->assertSame('Female', $animal->sex);
            $this->assertSame('Orange', $animal->color);
            $this->assertSame('Hidalgo Street, Barangay 306, Quiapo, Manila', $animal->location);
            $this->assertSame('Wears a red collar.', $animal->description);
            $this->assertNull($animal->age_months);

            // a new stray in the pound
            $this->assertSame('Rescued', $animal->status);
            $this->assertSame('Under Observation', $animal->health_status);
            $this->assertSame(now()->toDateString(), $animal->rescued_at->toDateString());
            $this->assertSame($user->id, $animal->created_by);

            // the QR page shows who to contact; code and token made like for any animal
            $this->assertSame('Maria Santos', $animal->owner_name);
            $this->assertSame('0917 123 4567', $animal->owner_contact);
            $this->assertMatchesRegularExpression('/^PAW-\d{4}$/', $animal->animal_code);
            $this->assertNotEmpty($animal->qr_token);

            // the two pet photos were copied (first = main); the last seen photo was not
            $photos = $animal->photos;
            $this->assertCount(2, $photos);
            $this->assertSame([0, 1], $photos->pluck('position')->all());
            foreach ($photos as $photo) {
                $this->assertStringStartsWith("animals/{$animal->id}/", $photo->path);
                Storage::disk('public')->assertExists($photo->path);
            }
            $this->assertSame('photo pet-a.jpg', Storage::disk('public')->get($photos[0]->path));

            // the report keeps its own photos and is linked to the animal
            foreach ($report->photos as $photo) {
                Storage::disk('public')->assertExists($photo->path);
            }
            $this->assertSame($animal->id, $report->fresh()->animal_id);
            $this->assertSame($report->id, $animal->missingPetReport->id);

            $this->assertDatabaseHas('audit_logs', ['user_id' => $user->id, 'action' => 'animal.created', 'entity_type' => 'Animal', 'entity_id' => $animal->id]);
            $log = AuditLog::where('action', 'animal.created')->where('entity_id', $animal->id)->first();
            $this->assertSame('missing_pet_report', $log->details['source']);
            $this->assertSame($report->id, $log->details['report_id']);
        }

        $this->assertSame(1, Animal::count());
    }

    public function test_a_report_of_species_other_keeps_what_the_animal_is(): void
    {
        $this->as('pound_staff');
        $report = $this->report('Found', ['species' => 'Other', 'other_species' => 'Rabbit', 'breed' => null]);

        $response = $this->register($report)->assertCreated()
            ->assertJsonPath('data.type', 'Other')
            ->assertJsonPath('data.other_species', 'Rabbit');

        $this->assertSame('Rabbit', Animal::findOrFail($response->json('data.id'))->other_species);

        // a dog report carries nothing
        $dog = $this->report('Found', ['name' => 'Rex', 'species' => 'Dog', 'other_species' => 'ignored']);
        $this->assertNull(Animal::findOrFail($this->register($dog)->json('data.id'))->other_species);
    }

    public function test_only_a_found_report_can_be_registered(): void
    {
        $this->as('pound_staff');

        foreach (['Lost', 'Sighted', 'Reunited'] as $status) {
            $report = $this->report($status);

            $this->register($report)->assertUnprocessable()
                ->assertJsonPath('message', 'Only a Found report can be registered in the pound.');

            $this->assertNull($report->fresh()->animal_id);
        }

        $this->assertSame(0, Animal::count());
    }

    public function test_registering_twice_is_refused_and_creates_no_second_animal(): void
    {
        $this->as('pound_staff');
        $report = $this->report('Found');

        $first = $this->register($report)->assertCreated()->json('data.id');

        $this->register($report)->assertUnprocessable()
            ->assertJsonPath('message', 'This report is already registered as an animal.')
            ->assertJsonPath('animal_id', $first);

        // a second click (or another pound staff member) gets the same answer
        $this->register($report)->assertUnprocessable()->assertJsonPath('animal_id', $first);

        $this->assertSame(1, Animal::count());
        $this->assertSame(2, Animal::first()->photos()->count());
    }

    public function test_other_roles_and_guests_are_refused(): void
    {
        $report = $this->report('Found');

        foreach (['vet_tech' => 403, 'adoption_counselor' => 403, 'kennel_manager' => 403, 'citizen' => 403] as $role => $code) {
            $this->as($role);
            $this->register($report)->assertStatus($code);
        }

        $this->as(null);
        $this->register($report)->assertUnauthorized();

        $this->assertSame(0, Animal::count());
        $this->assertNull($report->fresh()->animal_id);
    }

    public function test_the_registered_animal_is_not_adoptable(): void
    {
        $this->as('pound_staff');
        $report = $this->report('Found');
        $id = $this->register($report)->assertCreated()->json('data.id');

        $this->assertSame('Rescued', Animal::find($id)->status);
        $this->assertSame(0, Animal::adoptable()->count());

        $this->as(null);
        $this->getJson('/api/pets')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson("/api/pets/{$id}")->assertNotFound();
    }

    public function test_the_staff_report_shows_the_animal_it_was_registered_as(): void
    {
        $this->as('pound_staff');
        $report = $this->report('Found');

        $this->getJson("/api/missing-pet-reports/{$report->id}")->assertOk()->assertJsonPath('data.animal_id', null);

        $id = $this->register($report)->json('data.id');

        $this->getJson("/api/missing-pet-reports/{$report->id}")->assertOk()->assertJsonPath('data.animal_id', $id);
    }

    public function test_a_report_without_a_name_or_a_photo_file_still_registers(): void
    {
        $this->as('pound_staff');
        $report = $this->report('Found', ['name' => null, 'breed' => null, 'details' => null]);
        Storage::disk('public')->delete("missing-pets/{$report->id}/pet-b.jpg");

        $animal = Animal::findOrFail($this->register($report)->assertCreated()->json('data.id'));

        $this->assertNull($animal->name);
        $this->assertNull($animal->breed);
        $this->assertNull($animal->description);
        $this->assertCount(1, $animal->photos);
        $this->assertSame(0, $animal->photos[0]->position);
    }
}

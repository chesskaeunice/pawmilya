<?php

namespace Tests\Feature;

use App\Models\Animal;
use App\Models\MissingPetReport;
use App\Models\User;
use App\Support\ReleaseUnclaimedReports;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

// A report leaves the PUBLIC Missing Pets page once its animal is on Adoptable Pets (or later).
// The report's own status, the staff pages and My Reports do not change.
class MissingPetPublicVisibilityTest extends TestCase
{
    use RefreshDatabase;

    private Carbon $start;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('s3');
        $this->start = Carbon::create(2026, 11, 2, 9, 0, 0, 'Asia/Manila');
        Carbon::setTestNow($this->start);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function as(?User $user): static
    {
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        return $user ? $this->withToken($user->createToken('t')->plainTextToken) : $this;
    }

    private function user(string $role): User
    {
        return User::where('role', $role)->first() ?? tap(
            new User(['name' => ucfirst($role), 'email' => $role.'@test.com', 'phone' => '0917 000 1111', 'password' => 'Str0ng!Passw0rd']),
            function ($u) use ($role) {
                $u->role = $role;
                $u->save();
            }
        );
    }

    private function png(string $name): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'png');
        file_put_contents($path, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        return new UploadedFile($path, $name, 'image/png', null, true);
    }

    // A report filed by a logged-in citizen: Rescued, with its animal
    private function submitReport(User $citizen): MissingPetReport
    {
        $this->as($citizen)->post('/api/missing-pets', [
            'name' => 'Miming', 'species' => 'Cat', 'breed' => 'Puspin', 'color' => 'Gray',
            'location' => 'Katipunan, Quezon City', 'last_seen_at' => '2026-10-30 01:15:00',
            'details' => 'Friendly.', 'reporter_type' => 'Citizen', 'contact_email' => 'reporter@example.com',
            'pet_images' => [$this->png('p1.png'), $this->png('p2.png')],
            'last_seen_images' => [$this->png('l1.png')],
        ], ['Accept' => 'application/json'])->assertCreated();

        return MissingPetReport::latest('id')->firstOrFail();
    }

    private function publicIds(): array
    {
        return collect($this->as(null)->getJson('/api/missing-pets')->assertOk()->json('data'))->pluck('id')->all();
    }

    public function test_a_rescued_report_and_a_for_adoption_report_with_a_waiting_animal_stay_visible(): void
    {
        $report = $this->submitReport($this->user('citizen'));

        // Rescued (inside the claim period)
        $this->assertSame([$report->id], $this->publicIds());
        $this->as(null)->getJson("/api/missing-pets/{$report->id}")->assertOk()->assertJsonPath('data.status', 'Rescued');

        // For Adoption, but the animal still waits for the vet's Cleared: still visible
        Carbon::setTestNow($this->start->copy()->addDays(7)->addMinute());
        app(ReleaseUnclaimedReports::class)->run();

        $this->assertSame('Rescued', Animal::findOrFail($report->animal_id)->status);
        $this->assertSame([$report->id], $this->publicIds());
        $this->as(null)->getJson("/api/missing-pets/{$report->id}")->assertOk()->assertJsonPath('data.status', 'For Adoption');
    }

    public function test_the_report_leaves_the_public_pages_once_the_animal_is_adoptable_and_stays_for_staff_and_the_reporter(): void
    {
        $citizen = $this->user('citizen');
        $report = $this->submitReport($citizen);
        $animal = Animal::findOrFail($report->animal_id);

        Carbon::setTestNow($this->start->copy()->addDays(7)->addMinute());
        app(ReleaseUnclaimedReports::class)->run();

        // the list is cached: it is filled while the animal still waits
        $this->assertSame([$report->id], $this->publicIds());

        // the vet clears the pet: the animal becomes Available for Adoption (and shows on Adoptable Pets)
        $this->as($this->user('vet_tech'))->patchJson("/api/animals/{$animal->id}", ['health_status' => 'Cleared'])
            ->assertOk()->assertJsonPath('data.status', 'Available for Adoption');
        $this->as(null)->getJson('/api/pets')->assertJsonCount(1, 'data');

        // gone from the public Missing Pets list and details (the cache was refreshed too)
        $this->assertSame([], $this->publicIds());
        $this->as(null)->getJson("/api/missing-pets/{$report->id}")->assertNotFound();

        // the report itself did not change, and staff and the reporter still see it
        $this->assertSame('For Adoption', $report->fresh()->status);
        $this->as($this->user('pound_staff'))->getJson('/api/missing-pet-reports')->assertOk()
            ->assertJsonPath('data.0.id', $report->id)->assertJsonPath('data.0.status', 'For Adoption');
        $this->as($this->user('vet_tech'))->getJson("/api/missing-pet-reports/{$report->id}")->assertOk();
        $this->as($citizen)->getJson('/api/my/missing-pets')->assertOk()
            ->assertJsonPath('data.0.id', $report->id)->assertJsonPath('data.0.status', 'For Adoption');
    }

    public function test_pending_adoption_and_adopted_animals_are_hidden_too_and_other_statuses_are_not(): void
    {
        $report = $this->submitReport($this->user('citizen'));
        $animal = Animal::findOrFail($report->animal_id);

        foreach (['Pending Adoption', 'Adopted'] as $status) {
            $animal->forceFill(['status' => $status])->save();
            $this->assertSame([], $this->publicIds(), $status);
        }

        // back to Rescued (cache refreshed again), and a Lost report with no animal is not affected
        $animal->forceFill(['status' => 'Rescued'])->save();
        $this->assertSame([$report->id], $this->publicIds());

        $lost = new MissingPetReport(['name' => 'Bruno', 'species' => 'Dog', 'location' => 'Cubao', 'last_seen_at' => '2026-10-29 08:00:00', 'contact_name' => 'A', 'contact_number' => '0917 123 4567']);
        $lost->status = 'Lost';
        $lost->fingerprint = sha1('lost');
        $lost->save();

        $this->assertEqualsCanonicalizing([$report->id, $lost->id], $this->publicIds());
    }

    public function test_a_reunited_report_stays_visible_as_before(): void
    {
        $report = $this->submitReport($this->user('citizen'));
        Animal::findOrFail($report->animal_id)->forceFill(['status' => 'Reunited with Owner'])->save();
        $report->forceFill(['status' => 'Reunited'])->save();

        $this->assertSame([$report->id], $this->publicIds());
    }
}

<?php

namespace Tests\Feature;

use App\Models\AdoptionApplication;
use App\Models\Animal;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// The adoption counselor checks the valid ID of a Pending application before approving it.
class ValidIdVerificationTest extends TestCase
{
    use RefreshDatabase;

    private const DEFAULT_REASON = 'Your valid ID could not be verified. Please re-apply with a clear photo of a valid government ID.';

    private function user(string $role, ?string $email = null): User
    {
        return User::where('email', $email ?? $role.'@test.com')->first() ?? tap(
            new User(['name' => ucfirst($role), 'email' => $email ?? $role.'@test.com', 'password' => 'Str0ng!Passw0rd']),
            function ($u) use ($role) {
                $u->role = $role;
                $u->save();
            }
        );
    }

    private function as(User $user): static
    {
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        return $this->withToken($user->createToken('t')->plainTextToken);
    }

    private function animal(): Animal
    {
        return Animal::create([
            'name' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'sex' => 'Male',
            'location' => 'Main Animal Pound', 'status' => 'Available for Adoption', 'health_status' => 'Cleared',
            'description' => 'Friendly dog.', 'personality' => ['Friendly'],
        ]);
    }

    private function application(Animal $animal, string $email = 'maria@test.com'): AdoptionApplication
    {
        $citizen = $this->user('citizen', $email);
        $application = new AdoptionApplication(['user_id' => $citizen->id, 'animal_id' => $animal->id]);
        $application->forceFill([
            'first_name' => 'Maria', 'last_name' => 'Cruz', 'address' => 'x', 'phone' => '0917 000 0000', 'email' => $email,
            'birth_date' => '1999-01-01', 'employment_status' => 'Student', 'civil_status' => 'Single', 'residence' => 'House',
            'household_members' => 2, 'valid_id_path' => 'adoption-applications/x/id.png',
            'home_photo_paths' => ['adoption-applications/x/h1.png', 'adoption-applications/x/h2.png'],
            'why_adopt' => 'x', 'how_care' => 'x', 'terms_accepted' => true,
        ])->save();

        return $application;
    }

    private function idStatus(AdoptionApplication $application, string $status, array $extra = [])
    {
        return $this->patchJson("/api/adoption-applications/{$application->id}/id-verification", array_merge(['status' => $status], $extra));
    }

    public function test_the_counselor_can_verify_and_undo_the_id_check(): void
    {
        $application = $this->application($this->animal());
        $this->as($this->user('adoption_counselor'));

        $this->assertSame('Pending Verification', $application->fresh()->id_verification_status);

        $this->idStatus($application, 'Verified')->assertOk()
            ->assertJsonPath('data.idVerificationStatus', 'Verified')->assertJsonPath('data.status', 'Pending');
        $this->assertDatabaseHas('audit_logs', ['action' => 'application.id_verified', 'entity_id' => $application->id]);

        $this->idStatus($application, 'Pending Verification')->assertOk()->assertJsonPath('data.idVerificationStatus', 'Pending Verification');
        $this->assertSame('Pending', $application->fresh()->status);
    }

    public function test_rejecting_the_id_also_rejects_the_application_and_leaves_the_animal_and_others_alone(): void
    {
        $animal = $this->animal();
        $application = $this->application($animal);
        $other = $this->application($animal, 'juan@test.com');
        $this->as($this->user('adoption_counselor'));

        // with a reason
        $this->idStatus($application, 'Rejected', ['reason' => 'The ID photo is blurry.'])->assertOk()
            ->assertJsonPath('data.idVerificationStatus', 'Rejected')
            ->assertJsonPath('data.status', 'Rejected')
            ->assertJsonPath('data.rejectionReason', 'The ID photo is blurry.');

        $application->refresh();
        $this->assertNotNull($application->reviewed_at);
        $this->assertSame($this->user('adoption_counselor')->id, $application->reviewed_by);
        $this->assertSame('Available for Adoption', $animal->fresh()->status);
        $this->assertSame('Pending', $other->fresh()->status);
        $this->assertDatabaseHas('audit_logs', ['action' => 'application.id_rejected', 'entity_id' => $application->id]);

        // without a reason: the default text
        $this->idStatus($other, 'Rejected')->assertOk()->assertJsonPath('data.rejectionReason', self::DEFAULT_REASON);
        $this->assertSame('Available for Adoption', $animal->fresh()->status);

        // the citizen can apply again after a rejection
        $this->assertSame(0, AdoptionApplication::live()->where('animal_id', $animal->id)->count());
    }

    public function test_nothing_changes_after_the_application_is_decided(): void
    {
        $approved = $this->application($this->animal());
        $rejected = $this->application($this->animal(), 'juan@test.com');
        $this->as($this->user('adoption_counselor'));

        $this->idStatus($approved, 'Verified')->assertOk();
        $this->postJson("/api/adoption-applications/{$approved->id}/approve")->assertOk();
        $this->postJson("/api/adoption-applications/{$rejected->id}/reject")->assertOk();

        foreach ([$approved, $rejected] as $application) {
            foreach (['Verified', 'Rejected', 'Pending Verification'] as $status) {
                $this->idStatus($application, $status)->assertUnprocessable();
            }
        }

        $this->assertSame('Verified', $approved->fresh()->id_verification_status);
        $this->assertSame('Pending Verification', $rejected->fresh()->id_verification_status);
    }

    public function test_the_status_is_validated(): void
    {
        $application = $this->application($this->animal());
        $this->as($this->user('adoption_counselor'));

        $this->idStatus($application, 'Maybe')->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->patchJson("/api/adoption-applications/{$application->id}/id-verification", [])->assertUnprocessable()->assertJsonValidationErrors('status');
        $this->idStatus($application, 'Rejected', ['reason' => str_repeat('x', 1001)])->assertUnprocessable()->assertJsonValidationErrors('reason');
        $this->assertSame('Pending Verification', $application->fresh()->id_verification_status);
    }

    public function test_only_the_counselor_can_check_the_id(): void
    {
        $application = $this->application($this->animal());

        foreach (['kennel_manager', 'pound_staff', 'vet_tech', 'citizen'] as $role) {
            $this->as($this->user($role, $role.'-x@test.com'));
            $this->idStatus($application, 'Verified')->assertForbidden();
        }

        $this->as($this->user('citizen', 'maria@test.com'));
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
        $this->idStatus($application, 'Verified')->assertUnauthorized();

        $this->assertSame('Pending Verification', $application->fresh()->id_verification_status);
    }

    public function test_approving_needs_a_verified_id(): void
    {
        $animal = $this->animal();
        $application = $this->application($animal);
        $this->as($this->user('adoption_counselor'));

        // not verified yet, and an ID that was un-verified again: refused, nothing changes
        $this->postJson("/api/adoption-applications/{$application->id}/approve")
            ->assertUnprocessable()->assertJsonPath('errors.status.0', "Verify the applicant's valid ID before approving.");
        $this->idStatus($application, 'Verified')->assertOk();
        $this->idStatus($application, 'Pending Verification')->assertOk();
        $this->postJson("/api/adoption-applications/{$application->id}/approve")->assertUnprocessable();

        $this->assertSame('Pending', $application->fresh()->status);
        $this->assertSame('Available for Adoption', $animal->fresh()->status);

        // verified: approving works as before
        $this->idStatus($application, 'Verified')->assertOk();
        $this->postJson("/api/adoption-applications/{$application->id}/approve")->assertOk()->assertJsonPath('data.status', 'Approved');
        $this->assertSame('Adopted', $animal->fresh()->status);
        $this->assertSame(1, AuditLog::where('action', 'application.approved')->count());
    }

    public function test_reject_stays_available_without_a_verified_id(): void
    {
        $application = $this->application($this->animal());
        $this->as($this->user('adoption_counselor'));

        $this->postJson("/api/adoption-applications/{$application->id}/reject", ['reason' => 'Not suitable.'])->assertOk()->assertJsonPath('data.status', 'Rejected');
    }

    public function test_the_citizen_sees_the_id_status_and_nothing_sensitive(): void
    {
        $application = $this->application($this->animal());
        $this->as($this->user('adoption_counselor'));
        $this->idStatus($application, 'Verified')->assertOk();

        $response = $this->as($this->user('citizen', 'maria@test.com'))->getJson('/api/my/adoption-applications')->assertOk();

        $response->assertJsonPath('data.0.idVerificationStatus', 'Verified');

        $row = $response->json('data.0');
        foreach (['validId', 'valid_id_path', 'homePhotos', 'email', 'address', 'birthDate', 'whyAdopt', 'reviewedBy'] as $private) {
            $this->assertArrayNotHasKey($private, $row);
        }
        $this->assertStringNotContainsString('adoption-applications/x', $response->getContent());
    }
}

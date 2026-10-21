<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementApiTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role, ?string $email = null): User
    {
        $user = new User(['name' => ucfirst($role), 'email' => $email ?? $role.'@test.com', 'password' => 'password123']);
        $user->role = $role;
        $user->save();

        return $user;
    }

    private function actingAs_(User $user): void
    {
        $this->app['auth']->forgetGuards();
        $this->withToken($user->createToken('auth')->plainTextToken);
    }

    public function test_only_the_kennel_manager_can_manage_accounts_or_see_the_audit_log(): void
    {
        $this->getJson('/api/users')->assertUnauthorized();
        $this->getJson('/api/audit-logs')->assertUnauthorized();

        foreach (['citizen', 'pound_staff', 'vet_tech', 'adoption_counselor'] as $role) {
            $this->actingAs_($this->makeUser($role));
            $this->getJson('/api/users')->assertForbidden();
            $this->postJson('/api/users', [])->assertForbidden();
            $this->getJson('/api/audit-logs')->assertForbidden();
        }
    }

    public function test_manager_lists_staff_but_not_citizens_by_default(): void
    {
        $this->makeUser('citizen');
        $this->makeUser('vet_tech');
        $this->actingAs_($this->makeUser('kennel_manager'));

        $roles = collect($this->getJson('/api/users')->assertOk()->json('data'))->pluck('role');

        $this->assertContains('vet_tech', $roles->all());
        $this->assertNotContains('citizen', $roles->all());
    }

    public function test_manager_creates_a_staff_account_with_a_unique_email(): void
    {
        $manager = $this->makeUser('kennel_manager');
        $this->actingAs_($manager);

        $payload = ['name' => 'New Vet', 'email' => 'newvet@pawmilya.com', 'role' => 'vet_tech', 'password' => 'Str0ng!Passw0rd'];

        $this->postJson('/api/users', $payload)->assertCreated()->assertJsonPath('data.role', 'vet_tech');
        $this->postJson('/api/users', $payload)->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->postJson('/api/users', array_merge($payload, ['email' => 'x@y.com', 'role' => 'citizen']))->assertUnprocessable()->assertJsonValidationErrors(['role']);
        $this->postJson('/api/users', array_merge($payload, ['email' => 'z@y.com', 'password' => 'short']))->assertUnprocessable()->assertJsonValidationErrors(['password']);

        $this->assertDatabaseHas('audit_logs', ['action' => 'user.created', 'user_id' => $manager->id]);

        // the new account can log in with its role
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();
        $this->postJson('/api/login', ['email' => 'newvet@pawmilya.com', 'password' => 'Str0ng!Passw0rd'])->assertOk()->assertJsonPath('user.role', 'vet_tech');
    }

    public function test_manager_changes_a_role_and_deactivates_an_account_which_signs_it_out(): void
    {
        $staff = $this->makeUser('pound_staff');
        $staffToken = $staff->createToken('auth')->plainTextToken;
        $manager = $this->makeUser('kennel_manager');
        $this->actingAs_($manager);

        $this->patchJson("/api/users/{$staff->id}", ['role' => 'vet_tech'])->assertOk()->assertJsonPath('data.role', 'vet_tech');
        $this->patchJson("/api/users/{$staff->id}", ['is_active' => false])->assertOk()->assertJsonPath('data.active', false);

        // tokens are revoked and login is refused
        $this->assertSame(0, $staff->tokens()->count());
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();
        $this->withToken($staffToken)->getJson('/api/me')->assertUnauthorized();
        $this->flushHeaders();
        $this->postJson('/api/login', ['email' => $staff->email, 'password' => 'password123'])->assertUnprocessable();

        $this->assertSame(2, AuditLog::where('action', 'user.updated')->count());
    }

    public function test_a_manager_cannot_demote_or_deactivate_themselves(): void
    {
        $manager = $this->makeUser('kennel_manager');
        $this->actingAs_($manager);

        $this->patchJson("/api/users/{$manager->id}", ['role' => 'vet_tech'])->assertUnprocessable();
        $this->patchJson("/api/users/{$manager->id}", ['is_active' => false])->assertUnprocessable();
        $this->assertSame('kennel_manager', $manager->fresh()->role);
        $this->assertTrue($manager->fresh()->is_active);
    }

    public function test_audit_log_lists_entries_with_filters(): void
    {
        $manager = $this->makeUser('kennel_manager');
        $this->actingAs_($manager);
        $this->postJson('/api/users', ['name' => 'A', 'email' => 'a@x.com', 'role' => 'vet_tech', 'password' => 'Str0ng!Passw0rd'])->assertCreated();

        $all = $this->getJson('/api/audit-logs')->assertOk();
        $this->assertSame('user.created', $all->json('data.0.action'));
        $this->assertSame($manager->name, $all->json('data.0.user.name'));

        $this->getJson('/api/audit-logs?action=shift')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/audit-logs?action=user')->assertOk()->assertJsonCount(1, 'data');
    }
}

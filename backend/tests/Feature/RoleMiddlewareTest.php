<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Throwaway routes: the real protected endpoints come in later phases
        Route::middleware(['api', 'auth:sanctum', 'role:kennel_manager'])->get('/api/_t/manager-only', fn () => 'ok');
        Route::middleware(['api', 'auth:sanctum', 'permission:shifts.manage'])->get('/api/_t/shifts-manage', fn () => 'ok');
        Route::middleware(['api', 'auth:sanctum', 'permission:shifts.viewOwn'])->get('/api/_t/shifts-own', fn () => 'ok');
    }

    private function actingAsRole(string $role): void
    {
        $user = new User(['name' => $role, 'email' => $role.'@test.com', 'password' => 'password123']);
        $user->role = $role;
        $user->save();

        $this->withToken($user->createToken('auth')->plainTextToken);
    }

    public function test_guest_gets_401(): void
    {
        $this->getJson('/api/_t/manager-only')->assertUnauthorized();
        $this->getJson('/api/_t/shifts-manage')->assertUnauthorized();
    }

    public function test_role_middleware_allows_only_listed_roles(): void
    {
        $this->actingAsRole('pound_staff');
        $this->getJson('/api/_t/manager-only')->assertForbidden();
    }

    public function test_role_middleware_allows_the_manager(): void
    {
        $this->actingAsRole('kennel_manager');
        $this->getJson('/api/_t/manager-only')->assertOk();
    }

    public function test_only_the_manager_has_shifts_manage(): void
    {
        $this->actingAsRole('vet_tech');
        $this->getJson('/api/_t/shifts-manage')->assertForbidden();
    }

    public function test_manager_has_shifts_manage_and_citizen_has_nothing(): void
    {
        $this->actingAsRole('kennel_manager');
        $this->getJson('/api/_t/shifts-manage')->assertOk();
        $this->getJson('/api/_t/shifts-own')->assertForbidden();
    }

    public function test_scheduled_staff_roles_have_shifts_view_own(): void
    {
        foreach (User::SCHEDULED_ROLES as $role) {
            $this->assertTrue(in_array('shifts.viewOwn', config("permissions.$role"), true), $role);
        }
        $this->assertNotContains('shifts.viewOwn', config('permissions.citizen'));
    }
}

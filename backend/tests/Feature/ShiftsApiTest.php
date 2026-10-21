<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Shift;
use App\Models\StaffShift;
use App\Models\User;
use App\Support\ShiftService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShiftsApiTest extends TestCase
{
    use RefreshDatabase;

    private Shift $morning;
    private Shift $afternoon;
    private Shift $night;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-10-21 09:00:00'); // Asia/Manila

        $this->morning = Shift::create(['name' => 'Morning', 'start_time' => '06:00:00', 'end_time' => '14:00:00']);
        $this->afternoon = Shift::create(['name' => 'Afternoon', 'start_time' => '14:00:00', 'end_time' => '22:00:00']);
        $this->night = Shift::create(['name' => 'Night', 'start_time' => '22:00:00', 'end_time' => '06:00:00']);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function makeUser(string $role, ?string $email = null, bool $active = true): User
    {
        $user = new User(['name' => ucfirst($role), 'email' => $email ?? $role.'@test.com', 'password' => 'password123']);
        $user->role = $role;
        $user->is_active = $active;
        $user->save();

        return $user;
    }

    // Switching users inside one test: drop the guard's cached user
    private function actingAs_(?User $user): void
    {
        $this->app['auth']->forgetGuards();
        $this->flushHeaders();

        if ($user) {
            $this->withToken($user->createToken('auth')->plainTextToken);
        }
    }

    private function assign(User $user, Shift $shift, string $date, array $extra = []): StaffShift
    {
        $assignment = new StaffShift(['user_id' => $user->id, 'shift_id' => $shift->id, 'assigned_date' => $date]);
        $assignment->forceFill($extra)->save();

        return $assignment;
    }

    /* =========================================================
       MY SHIFTS: security
    ========================================================= */

    public function test_guests_get_401_and_roles_without_shifts_view_own_get_403(): void
    {
        $assignment = $this->assign($this->makeUser('pound_staff'), $this->morning, '2026-10-21');

        $this->getJson('/api/my/shifts?range=today')->assertUnauthorized();
        $this->postJson("/api/my/shifts/{$assignment->id}/check-in")->assertUnauthorized();

        foreach (['citizen', 'kennel_manager'] as $role) {
            $this->actingAs_($this->makeUser($role));
            $this->getJson('/api/my/shifts?range=today')->assertForbidden();
            $this->postJson("/api/my/shifts/{$assignment->id}/check-in")->assertForbidden();
        }
    }

    public function test_a_staff_member_cannot_check_in_or_out_on_someone_elses_shift(): void
    {
        $owner = $this->makeUser('pound_staff');
        $assignment = $this->assign($owner, $this->morning, '2026-10-21', ['check_in_time' => '2026-10-21 06:00:00']);

        $this->actingAs_($this->makeUser('vet_tech'));
        $this->postJson("/api/my/shifts/{$assignment->id}/check-in")->assertForbidden();
        $this->postJson("/api/my/shifts/{$assignment->id}/check-out")->assertForbidden();

        $this->assertNull($assignment->fresh()->check_out_time);
    }

    public function test_a_missing_shift_is_404(): void
    {
        $this->actingAs_($this->makeUser('pound_staff'));
        $this->postJson('/api/my/shifts/999/check-in')->assertNotFound();
        $this->postJson('/api/my/shifts/999/check-out')->assertNotFound();
    }

    /* =========================================================
       MY SHIFTS: check in / check out rules
    ========================================================= */

    public function test_check_in_works_once_and_uses_the_server_time(): void
    {
        $staff = $this->makeUser('pound_staff');
        $assignment = $this->assign($staff, $this->morning, '2026-10-21');
        $this->actingAs_($staff);

        // the client cannot choose the time or the status
        $this->postJson("/api/my/shifts/{$assignment->id}/check-in", ['check_in_time' => '2020-01-01 00:00:00', 'status' => 'completed'])
            ->assertOk()->assertJsonPath('data.status', 'active');

        $fresh = $assignment->fresh();
        $this->assertSame('2026-10-21 09:00:00', $fresh->check_in_time->format('Y-m-d H:i:s'));

        $this->postJson("/api/my/shifts/{$assignment->id}/check-in")->assertUnprocessable();
        $this->assertSame('2026-10-21 09:00:00', $assignment->fresh()->check_in_time->format('Y-m-d H:i:s'));
        $this->assertDatabaseHas('audit_logs', ['action' => 'shift.check_in', 'entity_id' => $assignment->id]);
    }

    public function test_check_in_only_within_the_grace_window_before_the_start_and_before_the_end(): void
    {
        $staff = $this->makeUser('pound_staff');
        $afternoon = $this->assign($staff, $this->afternoon, '2026-10-21');   // 14:00 - 22:00
        $tomorrow = $this->assign($staff, $this->morning, '2026-10-22');
        $this->actingAs_($staff);

        // 09:00 is much too early for a 14:00 shift; tomorrow's shift is not today
        $this->postJson("/api/my/shifts/{$afternoon->id}/check-in")->assertUnprocessable();
        $this->postJson("/api/my/shifts/{$tomorrow->id}/check-in")->assertUnprocessable();

        // 13:29 is still outside the 30 minute grace window, 13:31 is inside it
        Carbon::setTestNow('2026-10-21 13:29:00');
        $this->postJson("/api/my/shifts/{$afternoon->id}/check-in")->assertUnprocessable();
        Carbon::setTestNow('2026-10-21 13:31:00');
        $this->postJson("/api/my/shifts/{$afternoon->id}/check-in")->assertOk();

        // the grace window is a setting
        \App\Models\Setting::create(['key' => 'shifts.check_in_grace_minutes', 'value' => 120]);
        Carbon::setTestNow('2026-10-21 20:00:00');
        $other = $this->makeUser('vet_tech');
        $morningToday = $this->assign($other, $this->morning, '2026-10-21');
        $this->actingAs_($other);
        $this->postJson("/api/my/shifts/{$morningToday->id}/check-in")->assertUnprocessable(); // morning already ended
    }

    public function test_cannot_check_out_before_checking_in_or_before_the_shift_ends_but_can_after(): void
    {
        $staff = $this->makeUser('pound_staff');
        $assignment = $this->assign($staff, $this->morning, '2026-10-21');   // 06:00 - 14:00
        $this->actingAs_($staff);

        $this->postJson("/api/my/shifts/{$assignment->id}/check-out")->assertUnprocessable();        // not checked in
        $this->postJson("/api/my/shifts/{$assignment->id}/check-in")->assertOk();

        Carbon::setTestNow('2026-10-21 13:59:00');
        $this->postJson("/api/my/shifts/{$assignment->id}/check-out")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'You cannot check out before your shift ends.');
        $this->assertNull($assignment->fresh()->check_out_time);

        Carbon::setTestNow('2026-10-21 14:00:00');
        $this->postJson("/api/my/shifts/{$assignment->id}/check-out", ['check_out_time' => '2020-01-01'])
            ->assertOk()->assertJsonPath('data.status', 'completed');
        $this->assertSame('2026-10-21 14:00:00', $assignment->fresh()->check_out_time->format('Y-m-d H:i:s'));

        // not twice
        $this->postJson("/api/my/shifts/{$assignment->id}/check-out")->assertUnprocessable();
    }

    public function test_an_overnight_shift_ends_the_next_day(): void
    {
        $staff = $this->makeUser('vet_tech');
        $assignment = $this->assign($staff, $this->night, '2026-10-20');   // 22:00 on the 20th until 06:00 on the 21st
        $this->actingAs_($staff);

        $service = app(ShiftService::class);
        [$start, $end] = $service->window($this->night, Carbon::parse('2026-10-20'));
        $this->assertSame('2026-10-20 22:00:00', $start->format('Y-m-d H:i:s'));
        $this->assertSame('2026-10-21 06:00:00', $end->format('Y-m-d H:i:s'));

        // at 02:00 on the 21st: the previous day's overnight shift is still in Today
        Carbon::setTestNow('2026-10-21 02:00:00');
        $this->getJson('/api/my/shifts?range=today')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.isOvernight', true);

        $this->postJson("/api/my/shifts/{$assignment->id}/check-in")->assertOk();
        $this->postJson("/api/my/shifts/{$assignment->id}/check-out")->assertUnprocessable();   // ends at 06:00

        Carbon::setTestNow('2026-10-21 06:00:00');
        $this->postJson("/api/my/shifts/{$assignment->id}/check-out")->assertOk();

        // once it ended it leaves Today
        Carbon::setTestNow('2026-10-21 06:01:00');
        $this->getJson('/api/my/shifts?range=today')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_today_and_upcoming_lists_only_show_my_own_shifts(): void
    {
        $me = $this->makeUser('pound_staff');
        $other = $this->makeUser('vet_tech');

        $this->assign($me, $this->morning, '2026-10-21');
        $this->assign($me, $this->afternoon, '2026-10-21');
        $this->assign($me, $this->morning, '2026-10-22');
        $this->assign($me, $this->morning, '2026-10-28');   // 7 days ahead: included
        $this->assign($me, $this->morning, '2026-10-29');   // 8 days ahead: not yet
        $this->assign($me, $this->morning, '2026-10-20');   // yesterday, not overnight: gone
        $this->assign($other, $this->morning, '2026-10-21');
        $removed = $this->assign($me, $this->night, '2026-10-22');
        $removed->forceFill(['is_active' => false])->save();

        $this->actingAs_($me);
        $this->getJson('/api/my/shifts?range=today')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/my/shifts?range=upcoming')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/my/shifts?range=week')->assertUnprocessable();
    }

    /* =========================================================
       SCHEDULE: access
    ========================================================= */

    public function test_only_the_kennel_manager_can_use_the_schedule_endpoints(): void
    {
        $staff = $this->makeUser('pound_staff');
        $assignment = $this->assign($staff, $this->morning, '2026-10-22');
        $calls = [
            ['getJson', '/api/schedule/meta', []],
            ['getJson', '/api/schedule/assignments', []],
            ['getJson', '/api/schedule/today', []],
            ['postJson', '/api/schedule/assignments', ['user_id' => $staff->id, 'shift_id' => $this->morning->id, 'assigned_date' => '2026-10-23']],
            ['patchJson', "/api/schedule/assignments/{$assignment->id}/status", ['status' => 'active']],
            ['deleteJson', "/api/schedule/assignments/{$assignment->id}", []],
        ];

        // guests: 401
        $this->actingAs_(null);
        foreach ($calls as [$method, $url, $body]) {
            $this->{$method}($url, $body)->assertUnauthorized();
        }

        // everyone else: 403
        foreach (['citizen', 'pound_staff', 'vet_tech', 'adoption_counselor'] as $role) {
            $this->actingAs_($this->makeUser($role, "{$role}-x@test.com"));
            foreach ($calls as [$method, $url, $body]) {
                $this->{$method}($url, $body)->assertForbidden();
            }
        }

        $this->assertTrue($assignment->fresh()->is_active);
    }

    /* =========================================================
       SCHEDULE: assigning
    ========================================================= */

    public function test_manager_assigns_staff_and_gets_the_coverage(): void
    {
        $manager = $this->makeUser('kennel_manager');
        $poundStaff = $this->makeUser('pound_staff');
        $vet = $this->makeUser('vet_tech');
        $this->actingAs_($manager);

        $body = fn ($user) => ['user_id' => $user->id, 'shift_id' => $this->morning->id, 'assigned_date' => '2026-10-22'];

        // one role only: the other required role is reported as missing
        $this->postJson('/api/schedule/assignments', $body($poundStaff))->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('coverage.complete', false)
            ->assertJsonPath('coverage.missing', ['vet_tech']);

        $this->postJson('/api/schedule/assignments', $body($vet))->assertCreated()
            ->assertJsonPath('coverage.complete', true)
            ->assertJsonPath('coverage.missing', []);

        $this->assertSame(2, AuditLog::where('action', 'shift.assigned')->count());
        $this->assertSame($manager->id, StaffShift::first()->assigned_by);
    }

    public function test_a_duplicate_assignment_is_refused_and_never_touches_the_existing_row(): void
    {
        $staff = $this->makeUser('pound_staff');
        $original = $this->assign($staff, $this->morning, '2026-10-22', ['check_in_time' => '2026-10-22 06:05:00', 'status' => 'active']);
        $this->actingAs_($this->makeUser('kennel_manager'));

        $this->postJson('/api/schedule/assignments', ['user_id' => $staff->id, 'shift_id' => $this->morning->id, 'assigned_date' => '2026-10-22'])
            ->assertUnprocessable()->assertJsonValidationErrors(['user_id']);

        // same row, same id, check-in data intact (the old code deleted and re-inserted it)
        $this->assertSame(1, StaffShift::count());
        $row = StaffShift::first();
        $this->assertSame($original->id, $row->id);
        $this->assertSame('2026-10-22 06:05:00', $row->check_in_time->format('Y-m-d H:i:s'));
        $this->assertSame('active', $row->status);
    }

    public function test_cannot_assign_inactive_users_non_scheduled_roles_or_past_dates(): void
    {
        $this->actingAs_($this->makeUser('kennel_manager'));
        $inactive = $this->makeUser('pound_staff', 'inactive@test.com', false);
        $body = fn ($userId, $date = '2026-10-22') => ['user_id' => $userId, 'shift_id' => $this->morning->id, 'assigned_date' => $date];

        $this->postJson('/api/schedule/assignments', $body($inactive->id))->assertUnprocessable()->assertJsonValidationErrors(['user_id']);
        $this->postJson('/api/schedule/assignments', $body($this->makeUser('citizen')->id))->assertUnprocessable()->assertJsonValidationErrors(['user_id']);
        $this->postJson('/api/schedule/assignments', $body(User::where('role', 'kennel_manager')->first()->id))->assertUnprocessable()->assertJsonValidationErrors(['user_id']);
        $this->postJson('/api/schedule/assignments', $body($this->makeUser('vet_tech')->id, '2026-10-20'))->assertUnprocessable()->assertJsonValidationErrors(['assigned_date']);

        $this->assertSame(0, StaffShift::count());
    }

    public function test_a_person_cannot_be_on_two_overlapping_shifts_on_the_same_date(): void
    {
        $staff = $this->makeUser('pound_staff');
        $this->actingAs_($this->makeUser('kennel_manager'));
        $early = Shift::create(['name' => 'Early', 'start_time' => '05:00:00', 'end_time' => '09:00:00']);

        $this->assign($staff, $this->morning, '2026-10-22');   // 06:00 - 14:00

        $body = fn (Shift $shift, $date = '2026-10-22') => ['user_id' => $staff->id, 'shift_id' => $shift->id, 'assigned_date' => $date];

        $this->postJson('/api/schedule/assignments', $body($early))->assertUnprocessable()->assertJsonValidationErrors(['shift_id']);

        // back to back shifts do not overlap
        $this->postJson('/api/schedule/assignments', $body($this->afternoon))->assertCreated();
        // the night shift (22:00 - 06:00) starts when the afternoon ends, and ends when the next morning starts
        $this->postJson('/api/schedule/assignments', $body($this->night))->assertCreated();
        // but the overnight shift of the 22nd runs into the early shift of the 23rd
        $this->postJson('/api/schedule/assignments', $body($early, '2026-10-23'))->assertUnprocessable();
    }

    public function test_status_change_and_soft_remove_are_audited_and_the_slot_can_be_reused(): void
    {
        $manager = $this->makeUser('kennel_manager');
        $staff = $this->makeUser('pound_staff');
        $assignment = $this->assign($staff, $this->morning, '2026-10-22', ['check_in_time' => '2026-10-22 06:00:00']);
        $this->actingAs_($manager);

        $this->patchJson("/api/schedule/assignments/{$assignment->id}/status", ['status' => 'bogus'])->assertUnprocessable();
        $this->patchJson("/api/schedule/assignments/{$assignment->id}/status", ['status' => 'active'])->assertOk()->assertJsonPath('data.status', 'active');
        $this->assertDatabaseHas('audit_logs', ['action' => 'shift.status_changed', 'entity_id' => $assignment->id]);

        // soft remove: the row stays, with its check-in data, but no longer counts
        $this->deleteJson("/api/schedule/assignments/{$assignment->id}")->assertOk()->assertJsonPath('coverage.complete', false);
        $row = StaffShift::find($assignment->id);
        $this->assertFalse($row->is_active);
        $this->assertNotNull($row->check_in_time);
        $this->assertDatabaseHas('audit_logs', ['action' => 'shift.removed', 'entity_id' => $assignment->id]);
        $this->deleteJson("/api/schedule/assignments/{$assignment->id}")->assertNotFound();

        // the same person can be assigned again afterwards (a new row)
        $this->postJson('/api/schedule/assignments', ['user_id' => $staff->id, 'shift_id' => $this->morning->id, 'assigned_date' => '2026-10-22'])->assertCreated();
        $this->assertSame(2, StaffShift::count());
    }

    public function test_the_database_allows_only_one_active_row_per_person_shift_and_date(): void
    {
        $staff = $this->makeUser('pound_staff');
        $first = $this->assign($staff, $this->morning, '2026-10-22');

        try {
            $this->assign($staff, $this->morning, '2026-10-22');
            $this->fail('A second active row was allowed.');
        } catch (\Illuminate\Database\UniqueConstraintViolationException) {
            $this->assertTrue(true);
        }

        $first->forceFill(['is_active' => false])->save();
        $this->assign($staff, $this->morning, '2026-10-22');   // allowed once the first is removed
        $this->assertSame(2, StaffShift::count());
    }

    /* =========================================================
       COVERAGE
    ========================================================= */

    public function test_coverage_counts_only_active_assignments_of_active_users_with_the_required_roles(): void
    {
        $service = app(ShiftService::class);
        $date = '2026-10-22';

        $this->assertSame(['pound_staff', 'vet_tech'], $service->coverage($date, $this->morning->id)['missing']);

        $pound = $this->makeUser('pound_staff');
        $vet = $this->makeUser('vet_tech');
        $counselor = $this->makeUser('adoption_counselor');

        $this->assign($counselor, $this->morning, $date);   // not a required role
        $this->assertSame(['pound_staff', 'vet_tech'], $service->coverage($date, $this->morning->id)['missing']);

        $this->assign($pound, $this->morning, $date);
        $this->assertSame(['vet_tech'], $service->coverage($date, $this->morning->id)['missing']);

        $vetShift = $this->assign($vet, $this->morning, $date);
        $this->assertTrue($service->coverage($date, $this->morning->id)['complete']);

        // other shifts and other dates are separate
        $this->assertFalse($service->coverage($date, $this->afternoon->id)['complete']);
        $this->assertFalse($service->coverage('2026-10-23', $this->morning->id)['complete']);

        // removing an assignment, or deactivating the person, breaks the coverage again
        $vetShift->forceFill(['is_active' => false])->save();
        $this->assertSame(['vet_tech'], $service->coverage($date, $this->morning->id)['missing']);

        $vetShift2 = $this->assign($vet, $this->morning, $date);
        $this->assertTrue($service->coverage($date, $this->morning->id)['complete']);
        $vet->forceFill(['is_active' => false])->save();
        $this->assertSame(['vet_tech'], $service->coverage($date, $this->morning->id)['missing']);
        $this->assertNotNull($vetShift2);
    }

    public function test_coverage_works_for_an_overnight_shift_and_the_required_roles_setting(): void
    {
        $service = app(ShiftService::class);
        $date = '2026-10-22';

        // the night shift is counted under the date it starts on
        $this->assign($this->makeUser('pound_staff'), $this->night, $date);
        $this->assign($this->makeUser('vet_tech'), $this->night, $date);
        $this->assertTrue($service->coverage($date, $this->night->id)['complete']);
        $this->assertFalse($service->coverage('2026-10-23', $this->night->id)['complete']);

        // the required roles can be changed in the settings
        \App\Models\Setting::create(['key' => 'shifts.required_roles', 'value' => ['adoption_counselor']]);
        $this->assertSame(['adoption_counselor'], $service->coverage($date, $this->night->id)['missing']);
    }

    public function test_assignments_endpoint_returns_coverage_for_every_shift_and_day(): void
    {
        $this->assign($this->makeUser('pound_staff'), $this->morning, '2026-10-21');
        $this->actingAs_($this->makeUser('kennel_manager'));

        $response = $this->getJson('/api/schedule/assignments?from=2026-10-21&to=2026-10-22')->assertOk();

        $response->assertJsonCount(1, 'data');
        $response->assertJsonCount(6, 'coverage');   // 2 days x 3 shifts
        $this->getJson('/api/schedule/assignments?from=2026-10-01&to=2026-12-31')->assertUnprocessable();
    }

    public function test_today_overview_shows_who_is_on_duty_with_check_in_state_and_coverage(): void
    {
        $pound = $this->makeUser('pound_staff');
        $this->assign($pound, $this->morning, '2026-10-21', ['check_in_time' => '2026-10-21 06:02:00', 'status' => 'active']);
        $this->assign($this->makeUser('vet_tech'), $this->morning, '2026-10-21');
        $this->actingAs_($this->makeUser('kennel_manager'));

        $response = $this->getJson('/api/schedule/today')->assertOk()->assertJsonCount(2, 'data');

        $byRole = collect($response->json('data'))->keyBy('userRole');
        $this->assertNotNull($byRole['pound_staff']['checkInTime']);
        $this->assertNull($byRole['vet_tech']['checkInTime']);
        $this->assertTrue(collect($response->json('coverage'))->firstWhere('shiftId', $this->morning->id)['complete']);
    }
}

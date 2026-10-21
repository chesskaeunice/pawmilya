<?php

namespace App\Support;

use App\Models\Setting;
use App\Models\Shift;
use App\Models\StaffShift;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

// The rules of the staff schedule: times, overlaps, coverage, check-in and check-out.
// All times are in the app timezone (Asia/Manila).
class ShiftService
{
    public const NOT_YET_MESSAGE = 'You cannot check out before your shift ends.';

    /* ---------- time ---------- */

    // [start, end] of a shift on a date; an end earlier than the start means it ends the next day
    public function window(Shift $shift, Carbon $date): array
    {
        $start = $date->copy()->startOfDay()->setTimeFromTimeString($shift->start_time);
        $end = $date->copy()->startOfDay()->setTimeFromTimeString($shift->end_time);

        if ($shift->end_time < $shift->start_time) {
            $end->addDay();
        }

        return [$start, $end];
    }

    public function startsAt(StaffShift $assignment): Carbon
    {
        return $this->window($assignment->shift, $assignment->assigned_date)[0];
    }

    public function endsAt(StaffShift $assignment): Carbon
    {
        return $this->window($assignment->shift, $assignment->assigned_date)[1];
    }

    /* ---------- settings ---------- */

    /** @return array<int, string> */
    public function requiredRoles(): array
    {
        return Setting::get('shifts.required_roles', [User::ROLE_POUND_STAFF, User::ROLE_VET_TECH]);
    }

    public function graceMinutes(): int
    {
        return (int) Setting::get('shifts.check_in_grace_minutes', 30);
    }

    /* ---------- schedule rules ---------- */

    // Does the person already have a shift that overlaps this one (the days around it are checked too)?
    public function overlaps(int $userId, Shift $shift, Carbon $date, ?int $ignoreId = null): bool
    {
        [$start, $end] = $this->window($shift, $date);

        $others = StaffShift::with('shift')
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->whereBetween('assigned_date', [$date->copy()->subDay()->toDateString(), $date->copy()->addDay()->toDateString()])
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->get();

        foreach ($others as $other) {
            [$otherStart, $otherEnd] = $this->window($other->shift, $other->assigned_date);

            if ($start->lt($otherEnd) && $otherStart->lt($end)) {
                return true;
            }
        }

        return false;
    }

    // Who is on a shift on a date and which required roles are missing
    public function coverage(string $date, int $shiftId): array
    {
        $required = $this->requiredRoles();

        $present = StaffShift::query()
            ->join('users', 'users.id', '=', 'staff_shifts.user_id')
            ->where('staff_shifts.shift_id', $shiftId)
            ->where('staff_shifts.assigned_date', $date)
            ->where('staff_shifts.is_active', true)
            ->where('users.is_active', true)
            ->pluck('users.role')
            ->countBy()
            ->all();

        $missing = array_values(array_filter($required, fn ($role) => empty($present[$role])));

        return [
            'date' => $date,
            'shiftId' => $shiftId,
            'required' => $required,
            'present' => $present,
            'missing' => $missing,
            'complete' => $missing === [],
        ];
    }

    /** Coverage of every active shift on every day of a range. */
    public function coverageForRange(Carbon $from, Carbon $to): Collection
    {
        $shifts = Shift::where('is_active', true)->get();
        $rows = collect();

        for ($day = $from->copy(); $day->lte($to); $day->addDay()) {
            foreach ($shifts as $shift) {
                $rows->push($this->coverage($day->toDateString(), $shift->id));
            }
        }

        return $rows;
    }

    /* ---------- check in / check out (server time only) ---------- */

    // Returns null when the person may check in now, otherwise the reason
    public function checkInProblem(StaffShift $assignment, ?Carbon $now = null): ?string
    {
        $now ??= now();

        if (! $assignment->is_active) {
            return 'This shift assignment was removed.';
        }

        if ($assignment->check_in_time) {
            return 'You already checked in for this shift.';
        }

        [$start, $end] = $this->window($assignment->shift, $assignment->assigned_date);

        if ($now->lt($start->copy()->subMinutes($this->graceMinutes()))) {
            return 'It is too early to check in for this shift.';
        }

        if ($now->gte($end)) {
            return 'This shift has already ended.';
        }

        return null;
    }

    public function checkOutProblem(StaffShift $assignment, ?Carbon $now = null): ?string
    {
        $now ??= now();

        if (! $assignment->is_active) {
            return 'This shift assignment was removed.';
        }

        if (! $assignment->check_in_time) {
            return 'You must check in before you can check out.';
        }

        if ($assignment->check_out_time) {
            return 'You already checked out of this shift.';
        }

        if ($now->lt($this->endsAt($assignment))) {
            return self::NOT_YET_MESSAGE;
        }

        return null;
    }

    /* ---------- "my shifts" lists ---------- */

    // Today: today's shifts, plus yesterday's overnight shift until it ends
    public function todayFor(?int $userId = null, ?Carbon $now = null): Collection
    {
        $now ??= now();
        $today = $now->copy()->startOfDay();

        return StaffShift::with(['shift', 'user'])
            ->where('is_active', true)
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->whereBetween('assigned_date', [$today->copy()->subDay()->toDateString(), $today->toDateString()])
            ->get()
            ->filter(fn (StaffShift $a) => $a->assigned_date->isSameDay($today) || $this->endsAt($a)->gt($now))
            ->sortBy(fn (StaffShift $a) => $this->startsAt($a)->timestamp)
            ->values();
    }

    // Upcoming: the next 7 days
    public function upcomingFor(int $userId, ?Carbon $now = null): Collection
    {
        $now ??= now();
        $today = $now->copy()->startOfDay();

        return StaffShift::with(['shift', 'user'])
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->whereBetween('assigned_date', [$today->copy()->addDay()->toDateString(), $today->copy()->addDays(7)->toDateString()])
            ->get()
            ->sortBy(fn (StaffShift $a) => $this->startsAt($a)->timestamp)
            ->values();
    }
}

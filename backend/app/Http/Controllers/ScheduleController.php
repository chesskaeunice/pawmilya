<?php

namespace App\Http\Controllers;

use App\Http\Requests\Shift\AssignShiftRequest;
use App\Http\Resources\ShiftAssignmentResource;
use App\Models\Shift;
use App\Models\StaffShift;
use App\Models\User;
use App\Support\Audit;
use App\Support\ShiftService;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

// Staff Schedule: kennel manager only (permission shifts.manage)
class ScheduleController extends Controller
{
    public function __construct(private ShiftService $shifts)
    {
    }

    // Shifts, the staff directory and the coverage rule
    public function meta(): JsonResponse
    {
        return response()->json([
            'shifts' => Shift::where('is_active', true)->orderBy('start_time')->get()->map(fn (Shift $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'startTime' => substr($s->start_time, 0, 5),
                'endTime' => substr($s->end_time, 0, 5),
                'isOvernight' => $s->isOvernight(),
            ]),
            'staff' => User::whereIn('role', User::SCHEDULED_ROLES)->where('is_active', true)->orderBy('name')->get()->map(fn (User $u) => [
                'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role,
            ]),
            'requiredRoles' => $this->shifts->requiredRoles(),
            'checkInGraceMinutes' => $this->shifts->graceMinutes(),
        ]);
    }

    // Assignments and coverage for a date range (default: today and the next 13 days)
    public function assignments(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $from = Carbon::parse($data['from'] ?? now())->startOfDay();
        $to = Carbon::parse($data['to'] ?? $from->copy()->addDays(13))->startOfDay();

        if ($from->diffInDays($to) > 31) {
            throw ValidationException::withMessages(['to' => ['Choose a range of 31 days or less.']]);
        }

        $assignments = StaffShift::with(['shift', 'user'])
            ->where('is_active', true)
            ->whereBetween('assigned_date', [$from->toDateString(), $to->toDateString()])
            ->orderBy('assigned_date')
            ->get();

        return response()->json([
            'data' => ShiftAssignmentResource::collection($assignments)->resolve(),
            'coverage' => $this->shifts->coverageForRange($from, $to)->values(),
        ]);
    }

    // Who is on duty now (today's shifts, and last night's shift until it ends) with coverage
    public function today(): JsonResponse
    {
        $assignments = $this->shifts->todayFor();
        $today = now()->toDateString();

        $coverage = Shift::where('is_active', true)->get()->map(fn (Shift $s) => $this->shifts->coverage($today, $s->id));

        return response()->json([
            'data' => ShiftAssignmentResource::collection($assignments)->resolve(),
            'coverage' => $coverage->values(),
        ]);
    }

    public function store(AssignShiftRequest $request): JsonResponse
    {
        $data = $request->validated();

        try {
            // A duplicate is refused; the existing row (and its check-in data) is never touched
            $assignment = new StaffShift($data);
            $assignment->assigned_by = $request->user()->id;
            $assignment->save();
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['user_id' => [AssignShiftRequest::DUPLICATE_MESSAGE]]);
        }

        Audit::record($request, 'shift.assigned', $assignment, $data);

        return response()->json([
            'data' => (new ShiftAssignmentResource($assignment->refresh()->load(['shift', 'user'])))->resolve(),
            'coverage' => $this->shifts->coverage($assignment->assigned_date->toDateString(), $assignment->shift_id),
        ], 201);
    }

    public function updateStatus(Request $request, StaffShift $assignment): JsonResponse
    {
        abort_unless($assignment->is_active, 404);

        $data = $request->validate(['status' => ['required', Rule::in(['pending', 'active', 'completed'])]]);

        $from = $assignment->status;
        $assignment->forceFill(['status' => $data['status']])->save();

        if ($from !== $data['status']) {
            Audit::record($request, 'shift.status_changed', $assignment, ['from' => $from, 'to' => $data['status']]);
        }

        return response()->json(['data' => (new ShiftAssignmentResource($assignment->load(['shift', 'user'])))->resolve()]);
    }

    // Soft remove: the row stays (with its check-in data) but no longer counts
    public function destroy(Request $request, StaffShift $assignment): JsonResponse
    {
        abort_unless($assignment->is_active, 404);

        $assignment->forceFill(['is_active' => false])->save();

        Audit::record($request, 'shift.removed', $assignment, [
            'user_id' => $assignment->user_id, 'shift_id' => $assignment->shift_id, 'assigned_date' => $assignment->assigned_date->toDateString(),
        ]);

        return response()->json([
            'message' => 'Assignment removed.',
            'coverage' => $this->shifts->coverage($assignment->assigned_date->toDateString(), $assignment->shift_id),
        ]);
    }
}

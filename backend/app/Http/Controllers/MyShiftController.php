<?php

namespace App\Http\Controllers;

use App\Http\Resources\ShiftAssignmentResource;
use App\Models\StaffShift;
use App\Support\Audit;
use App\Support\ShiftService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

// "My Shifts" for every staff role. A person can only act on their OWN assignment,
// and the times always come from the server clock, never from the client.
class MyShiftController extends Controller
{
    public function __construct(private ShiftService $shifts)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $range = $request->validate(['range' => ['required', 'in:today,upcoming']])['range'];
        $userId = $request->user()->id;

        $assignments = $range === 'today'
            ? $this->shifts->todayFor($userId)
            : $this->shifts->upcomingFor($userId);

        return response()->json(['data' => ShiftAssignmentResource::collection($assignments)->resolve()]);
    }

    public function checkIn(Request $request, int $id): JsonResponse
    {
        $assignment = $this->ownAssignment($request, $id);

        if ($problem = $this->shifts->checkInProblem($assignment)) {
            throw ValidationException::withMessages(['shift' => [$problem]]);
        }

        $assignment->forceFill(['check_in_time' => now(), 'status' => 'active'])->save();

        Audit::record($request, 'shift.check_in', $assignment);

        return response()->json(['data' => (new ShiftAssignmentResource($assignment->load(['shift', 'user'])))->resolve()]);
    }

    public function checkOut(Request $request, int $id): JsonResponse
    {
        $assignment = $this->ownAssignment($request, $id);

        if ($problem = $this->shifts->checkOutProblem($assignment)) {
            throw ValidationException::withMessages(['shift' => [$problem]]);
        }

        $assignment->forceFill(['check_out_time' => now(), 'status' => 'completed'])->save();

        Audit::record($request, 'shift.check_out', $assignment);

        return response()->json(['data' => (new ShiftAssignmentResource($assignment->load(['shift', 'user'])))->resolve()]);
    }

    // 404 if it does not exist, 403 if it belongs to someone else
    private function ownAssignment(Request $request, int $id): StaffShift
    {
        $assignment = StaffShift::with(['shift', 'user'])->find($id);

        abort_unless($assignment, 404, 'Shift not found.');
        abort_unless($assignment->user_id === $request->user()->id, 403, 'This is not your shift.');

        return $assignment;
    }
}

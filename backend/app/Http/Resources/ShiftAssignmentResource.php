<?php

namespace App\Http\Resources;

use App\Support\ShiftService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// One staff shift assignment. canCheckIn / canCheckOut come from the server rules, so the buttons never guess.
class ShiftAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $service = app(ShiftService::class);
        [$start, $end] = $service->window($this->shift, $this->assigned_date);

        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'userName' => $this->user->name,
            'userRole' => $this->user->role,
            'shiftId' => $this->shift_id,
            'shiftName' => $this->shift->name,
            'startTime' => substr($this->shift->start_time, 0, 5),
            'endTime' => substr($this->shift->end_time, 0, 5),
            'isOvernight' => $this->shift->isOvernight(),
            'assignedDate' => $this->assigned_date->toDateString(),
            'startsAt' => $start->toIso8601String(),
            'endsAt' => $end->toIso8601String(),
            'status' => $this->status,
            'checkInTime' => $this->check_in_time?->toIso8601String(),
            'checkOutTime' => $this->check_out_time?->toIso8601String(),
            'canCheckIn' => $service->checkInProblem($this->resource) === null,
            'canCheckOut' => $service->checkOutProblem($this->resource) === null,
        ];
    }
}

<?php

namespace App\Http\Requests\Shift;

use App\Models\Shift;
use App\Models\StaffShift;
use App\Models\User;
use App\Support\ShiftService;
use Carbon\Carbon;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class AssignShiftRequest extends FormRequest
{
    public const DUPLICATE_MESSAGE = 'This person is already assigned to that shift on that date.';

    // The route middleware already limits this to shifts.manage
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'shift_id' => ['required', 'integer', 'exists:shifts,id'],
            'assigned_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $user = User::find($this->input('user_id'));
                $shift = Shift::find($this->input('shift_id'));
                $date = Carbon::parse($this->input('assigned_date'))->startOfDay();

                if (! $user->is_active) {
                    $validator->errors()->add('user_id', 'This account is deactivated and cannot be scheduled.');

                    return;
                }

                if (! in_array($user->role, User::SCHEDULED_ROLES, true)) {
                    $validator->errors()->add('user_id', 'Only pound staff, vet techs and adoption counselors can be scheduled.');

                    return;
                }

                if (! $shift->is_active) {
                    $validator->errors()->add('shift_id', 'This shift is not active.');

                    return;
                }

                $duplicate = StaffShift::where('user_id', $user->id)
                    ->where('shift_id', $shift->id)
                    ->where('assigned_date', $date->toDateString())
                    ->where('is_active', true)
                    ->exists();

                if ($duplicate) {
                    $validator->errors()->add('user_id', self::DUPLICATE_MESSAGE);

                    return;
                }

                if (app(ShiftService::class)->overlaps($user->id, $shift, $date)) {
                    $validator->errors()->add('shift_id', 'This person already has an overlapping shift on that date.');
                }
            },
        ];
    }
}

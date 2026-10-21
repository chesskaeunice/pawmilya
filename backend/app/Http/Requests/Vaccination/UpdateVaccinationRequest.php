<?php

namespace App\Http\Requests\Vaccination;

use App\Models\HealthLog;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateVaccinationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('vaccinations.edit');
    }

    public function rules(): array
    {
        return [
            'vaccine' => ['sometimes', 'required', 'string', 'max:100'],
            'administered_at' => ['sometimes', 'required', 'date', 'before_or_equal:today'],
            'next_due_date' => ['sometimes', 'nullable', 'date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $log = $this->route('log');
                $vaccine = trim($this->input('vaccine', $log->vaccine));
                $given = substr($this->input('administered_at', $log->administered_at->toDateString()), 0, 10);
                $due = array_key_exists('next_due_date', $this->all()) ? $this->input('next_due_date') : $log->next_due_date?->toDateString();

                if ($due && substr($due, 0, 10) < $given) {
                    $validator->errors()->add('next_due_date', 'Next due date must be after the date given.');
                }

                $duplicate = HealthLog::where('animal_id', $log->animal_id)
                    ->where('vaccine', $vaccine)
                    ->whereDate('administered_at', $given)
                    ->where('id', '!=', $log->id)
                    ->exists();

                if ($duplicate) {
                    $validator->errors()->add('vaccine', "$vaccine is already recorded for this animal on that date.");
                }
            },
        ];
    }
}

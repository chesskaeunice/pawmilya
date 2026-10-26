<?php

namespace App\Http\Requests\Vaccination;

use App\Models\HealthLog;
use App\Models\Vaccine;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVaccinationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('vaccinations.edit');
    }

    public function rules(): array
    {
        return [
            'vaccine_id' => ['sometimes', 'nullable', 'integer', Rule::exists('vaccines', 'id')->where('is_active', true)],
            'other_vaccine_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'administered_at' => ['sometimes', 'required', 'date', 'before_or_equal:today'],
            'next_due_date' => ['sometimes', 'nullable', 'date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return ['vaccine_id.exists' => 'Please choose a vaccine from the list.'];
    }

    // Changing the vaccine: the vaccine id or the typed name was sent
    public function changesVaccine(): bool
    {
        return $this->has('vaccine_id') || $this->has('other_vaccine_name');
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $log = $this->route('log');
                $name = $log->vaccine;

                if ($this->changesVaccine()) {
                    $vaccineId = $this->input('vaccine_id');
                    $other = $this->input('other_vaccine_name');

                    if (! $vaccineId && trim((string) $other) === '') {
                        $validator->errors()->add('other_vaccine_name', 'Please specify the vaccine.');

                        return;
                    }

                    if ($vaccineId && ! Vaccine::find($vaccineId)->fitsSpecies($log->animal->species)) {
                        $validator->errors()->add('vaccine_id', 'This vaccine is not for '.strtolower($log->animal->species).'s.');

                        return;
                    }

                    [, , $name] = Vaccine::resolve($vaccineId, $other);
                }

                $given = substr($this->input('administered_at', $log->administered_at->toDateString()), 0, 10);
                $due = array_key_exists('next_due_date', $this->all()) ? $this->input('next_due_date') : $log->next_due_date?->toDateString();

                if ($due && substr($due, 0, 10) < $given) {
                    $validator->errors()->add('next_due_date', 'Next due date must be after the date given.');
                }

                $duplicate = HealthLog::where('animal_id', $log->animal_id)
                    ->where('vaccine', $name)
                    ->whereDate('administered_at', $given)
                    ->where('id', '!=', $log->id)
                    ->exists();

                if ($duplicate) {
                    $validator->errors()->add('vaccine_id', "$name is already recorded for this animal on that date.");
                }
            },
        ];
    }
}

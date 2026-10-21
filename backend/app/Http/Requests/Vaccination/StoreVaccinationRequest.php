<?php

namespace App\Http\Requests\Vaccination;

use App\Models\HealthLog;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

// One animal, one or more vaccines (the Add button on the Vaccinations page)
class StoreVaccinationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('vaccinations.create');
    }

    public function rules(): array
    {
        return [
            'animal_id' => ['required', 'integer', 'exists:animals,id'],
            'records' => ['required', 'array', 'min:1', 'max:20'],
            'records.*.vaccine' => ['required', 'string', 'max:100'],
            'records.*.administered_at' => ['required', 'date', 'before_or_equal:today'],
            'records.*.next_due_date' => ['nullable', 'date'],
            'records.*.notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $seen = [];

                foreach ($this->input('records') as $index => $record) {
                    $given = substr($record['administered_at'], 0, 10);
                    $due = $record['next_due_date'] ?? null;

                    if ($due && substr($due, 0, 10) < $given) {
                        $validator->errors()->add("records.$index.next_due_date", 'Next due date must be after the date given.');
                    }

                    $key = mb_strtolower(trim($record['vaccine'])).'|'.$given;

                    $listedTwice = isset($seen[$key]);
                    $alreadyRecorded = HealthLog::where('animal_id', $this->input('animal_id'))
                        ->where('vaccine', trim($record['vaccine']))
                        ->whereDate('administered_at', $given)
                        ->exists();

                    if ($listedTwice || $alreadyRecorded) {
                        $validator->errors()->add("records.$index.vaccine", "{$record['vaccine']} is already recorded for this animal on that date.");
                    }

                    $seen[$key] = true;
                }
            },
        ];
    }
}

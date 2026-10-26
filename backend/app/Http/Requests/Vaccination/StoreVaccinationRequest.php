<?php

namespace App\Http\Requests\Vaccination;

use App\Models\Animal;
use App\Models\HealthLog;
use App\Models\Vaccine;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// One animal, one to five vaccines (the form on the Vaccinations page). Each record is either a vaccine
// from the vaccines table (vaccine_id) or "Others" (other_vaccine_name, no vaccine_id).
class StoreVaccinationRequest extends FormRequest
{
    public const MAX_RECORDS = 5;

    public function authorize(): bool
    {
        return $this->user()->hasPermission('vaccinations.create');
    }

    public function rules(): array
    {
        return [
            'animal_id' => ['required', 'integer', 'exists:animals,id'],
            'records' => ['required', 'array', 'min:1', 'max:'.self::MAX_RECORDS],
            'records.*.vaccine_id' => ['nullable', 'integer', Rule::exists('vaccines', 'id')->where('is_active', true)],
            'records.*.other_vaccine_name' => ['nullable', 'required_without:records.*.vaccine_id', 'string', 'max:100'],
            'records.*.administered_at' => ['required', 'date', 'before_or_equal:today'],
            'records.*.next_due_date' => ['nullable', 'date'],
            'records.*.notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'records.*.other_vaccine_name.required_without' => 'Please specify the vaccine.',
            'records.*.vaccine_id.exists' => 'Please choose a vaccine from the list.',
            'records.max' => 'You can add up to '.self::MAX_RECORDS.' vaccines at a time.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $animal = Animal::find($this->input('animal_id'));
                $seen = [];

                foreach ($this->input('records') as $index => $record) {
                    $given = substr($record['administered_at'], 0, 10);
                    $due = $record['next_due_date'] ?? null;

                    if ($due && substr($due, 0, 10) < $given) {
                        $validator->errors()->add("records.$index.next_due_date", 'Next due date must be after the date given.');
                    }

                    // the vaccine must fit the animal's species (Dog, Cat, or All)
                    if (! empty($record['vaccine_id']) && ! Vaccine::find($record['vaccine_id'])->fitsSpecies($animal->species)) {
                        $validator->errors()->add("records.$index.vaccine_id", 'This vaccine is not for '.strtolower($animal->species).'s.');

                        continue;
                    }

                    [, , $name] = Vaccine::resolve($record['vaccine_id'] ?? null, $record['other_vaccine_name'] ?? null);
                    $key = mb_strtolower($name).'|'.$given;

                    $listedTwice = isset($seen[$key]);
                    $alreadyRecorded = HealthLog::where('animal_id', $animal->id)
                        ->where('vaccine', $name)
                        ->whereDate('administered_at', $given)
                        ->exists();

                    if ($listedTwice || $alreadyRecorded) {
                        $field = empty($record['vaccine_id']) ? 'other_vaccine_name' : 'vaccine_id';
                        $validator->errors()->add("records.$index.$field", "$name is already recorded for this animal on that date.");
                    }

                    $seen[$key] = true;
                }
            },
        ];
    }
}

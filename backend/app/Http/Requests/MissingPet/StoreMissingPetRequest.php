<?php

namespace App\Http\Requests\MissingPet;

use App\Models\MissingPetReport;
use App\Support\ReportPostingLimit;
use Carbon\Carbon;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMissingPetRequest extends FormRequest
{
    public const DUPLICATE_MESSAGE = 'You already reported this pet for this place and date.';

    // Open to guests: the token (when sent) is read with the sanctum guard
    public function authorize(): bool
    {
        return true;
    }

    public function reporter()
    {
        return $this->user('sanctum');
    }

    // A logged-in citizen who is at the posting limit is stopped here (429), before validation,
    // so nothing is stored. Guests and staff are not limited.
    protected function prepareForValidation(): void
    {
        app(ReportPostingLimit::class)->ensureWithinLimit($this->reporter());

        $this->merge(['contact_email' => strtolower(trim((string) $this->input('contact_email')))]);
    }

    public function rules(): array
    {
        $isGuest = ! $this->reporter();

        return [
            'name' => ['nullable', 'string', 'max:100'],
            'species' => ['required', Rule::in(['Dog', 'Cat', 'Other'])],
            'other_species' => ['nullable', 'required_if:species,Other', 'string', 'max:100'],
            'breed' => ['nullable', 'string', 'max:100'],
            'sex' => ['nullable', Rule::in(['Male', 'Female', 'Unknown'])],
            'color' => ['nullable', 'string', 'max:100'],
            'markings' => ['nullable', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'last_seen_at' => ['required', 'date', 'before_or_equal:now'],
            // optional: the status follows reporter_type (Owner = Lost, Citizen = Rescued); any other value is rejected
            'status' => ['nullable', Rule::in(array_filter([MissingPetReport::FILING_STATUS_BY_REPORTER_TYPE[$this->input('reporter_type')] ?? null]) ?: MissingPetReport::FILING_STATUSES)],
            'details' => ['nullable', 'string', 'max:2000'],

            // "I am the": the pet's owner or a concerned citizen
            'reporter_type' => ['required', Rule::in(MissingPetReport::REPORTER_TYPES)],

            // Guests must leave a contact name and number; citizens default to their account details
            'contact_name' => [Rule::requiredIf($isGuest), 'nullable', 'string', 'max:255'],
            'contact_number' => [Rule::requiredIf($isGuest), 'nullable', 'string', 'max:30', 'regex:/^[0-9+()\s-]{7,}$/'],
            'contact_email' => ['required', 'email', 'max:255'],

            'pet_images' => ['required', 'array', 'min:2', 'max:3'],
            'pet_images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'last_seen_images' => ['nullable', 'array', 'max:3'],
            'last_seen_images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'reporter_type.required' => 'Please choose one.',
            'reporter_type.in' => 'Please choose one.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $fingerprint = $this->fingerprint();

                if (MissingPetReport::where('fingerprint', $fingerprint)->where('status', '<>', 'Reunited')->exists()) {
                    $validator->errors()->add('name', self::DUPLICATE_MESSAGE);
                }
            },
        ];
    }

    // Same reporter + pet + place + day = same report
    public function fingerprint(): string
    {
        $phone = $this->input('contact_number') ?? $this->reporter()?->phone;

        return MissingPetReport::makeFingerprint(
            MissingPetReport::reporterKey($this->reporter(), $phone),
            $this->input('species'),
            $this->input('name'),
            $this->input('location'),
            Carbon::parse($this->input('last_seen_at'))->toDateString(),
        );
    }
}

<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

// Profile page: the logged-in user's home address, in parts.
// Province, city and barangay go together (all three or none); the street is free text.
// (The Profile page makes the user pick the first three from the Philippine address list.)
class UpdateAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // Trimmed; an empty part is the same as not sent
    protected function prepareForValidation(): void
    {
        $clean = [];

        foreach (['province', 'city', 'barangay', 'street'] as $field) {
            $value = trim((string) $this->input($field));
            $clean[$field] = $value === '' ? null : $value;
        }

        $this->merge($clean);
    }

    public function rules(): array
    {
        return [
            'province' => ['nullable', 'string', 'max:120', 'required_with:city,barangay'],
            'city' => ['nullable', 'string', 'max:120', 'required_with:province,barangay'],
            'barangay' => ['nullable', 'string', 'max:120', 'required_with:province,city'],
            'street' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'province.required_with' => 'Please choose your province.',
            'city.required_with' => 'Please choose your city or municipality.',
            'barangay.required_with' => 'Please choose your barangay.',
        ];
    }
}

<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

// My Account (citizens and staff): the logged-in user's full name and phone number.
// (Email, address and photo have their own requests.)
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // Trimmed name; phone without spaces; an empty phone clears it
    protected function prepareForValidation(): void
    {
        $phone = preg_replace('/[\s()-]+/', '', trim((string) $this->input('phone')));

        $this->merge([
            'name' => trim((string) $this->input('name')),
            'phone' => $phone === '' ? null : $phone,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            // Philippine mobile: 09XXXXXXXXX or +639XXXXXXXXX
            'phone' => ['nullable', 'string', 'regex:/^(\+63|0)9\d{9}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please enter your full name.',
            'phone.regex' => 'Please enter a valid mobile number, for example 0917 123 4567.',
        ];
    }
}

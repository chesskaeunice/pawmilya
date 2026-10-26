<?php

namespace App\Http\Requests\Auth;

use App\Support\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // Clean the input before validating: trimmed names, lowercase email, phone without spaces
    protected function prepareForValidation(): void
    {
        $this->merge([
            'first_name' => trim((string) $this->input('first_name')),
            'last_name' => trim((string) $this->input('last_name')),
            'email' => strtolower(trim((string) $this->input('email'))),
            'phone' => preg_replace('/[\s()-]+/', '', trim((string) $this->input('phone'))),
        ]);
    }

    // Registration only creates citizens: no role field is accepted
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            // Philippine mobile: 09XXXXXXXXX or +639XXXXXXXXX
            'phone' => ['required', 'string', 'regex:/^(\+63|0)9\d{9}$/'],
            'password' => [...PasswordRules::make(fn () => [
                $this->input('email'),
                trim($this->input('first_name').' '.$this->input('last_name')),
            ]), 'confirmed'],
            'terms' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Please enter a valid mobile number, for example 0917 123 4567.',
        ];
    }
}

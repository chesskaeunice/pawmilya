<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// Profile page: the logged-in user changes their own email
class UpdateEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // Trimmed and lowercase, like on registration
    protected function prepareForValidation(): void
    {
        $this->merge(['email' => strtolower(trim((string) $this->input('email')))]);
    }

    // The unique rule ignores the user's own row, so saving the same email again is fine
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->user()->id)],
        ];
    }
}

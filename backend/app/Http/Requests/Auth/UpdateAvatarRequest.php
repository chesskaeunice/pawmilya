<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

// Profile page: one profile photo (jpg, png or webp, up to 2 MB; no svg)
class UpdateAvatarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'avatar' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.required' => 'Please choose a photo.',
            'avatar.uploaded' => 'The photo could not be uploaded. Please try a smaller file.',
            'avatar.file' => 'Please choose an image file.',
            'avatar.mimes' => 'The photo must be a JPG, PNG or WebP image.',
            'avatar.max' => 'The photo must be 2 MB or smaller.',
        ];
    }
}

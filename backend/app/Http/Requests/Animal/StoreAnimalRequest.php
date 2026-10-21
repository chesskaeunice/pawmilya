<?php

namespace App\Http\Requests\Animal;

use App\Models\Animal;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAnimalRequest extends FormRequest
{
    public const CLEARED_MESSAGE = 'An animal can only be set to "Available for Adoption" when its health status is "Cleared".';

    public function authorize(): bool
    {
        return $this->user()->hasPermission('animals.create');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:40'],
            'species' => ['required', Rule::in(['Dog', 'Cat', 'Other'])],
            'breed' => ['required', 'string', 'max:100'],
            'sex' => ['required', Rule::in(['Male', 'Female', 'Unknown'])],
            'age_months' => ['required', 'integer', 'min:0', 'max:360'],
            'color' => ['nullable', 'string', 'max:100'],
            'location' => ['required', 'string', 'max:255'],
            'status' => ['required', Rule::in(Animal::STATUSES)],
            'health_status' => ['required', Rule::in(Animal::HEALTH_STATUSES)],
            'rescued_at' => ['required', 'date', 'before_or_equal:today'],
            'description' => ['required', 'string', 'max:500'],
            'ideal_home' => ['required', 'string', 'max:1000'],
            'personality' => ['required', 'array', 'min:1', 'max:6'],
            'personality.*' => ['string', 'max:20'],
            'owner_name' => ['nullable', 'string', 'max:255'],
            'owner_contact' => ['nullable', 'string', 'max:50'],
            // 3 to 4 photos; the first one is the main photo
            'images' => ['required', 'array', 'min:3', 'max:4'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    // Only a cleared animal can be listed for adoption
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->input('status') === Animal::ADOPTABLE && $this->input('health_status') !== Animal::CLEARED) {
                    $validator->errors()->add('status', self::CLEARED_MESSAGE);
                }
            },
        ];
    }
}

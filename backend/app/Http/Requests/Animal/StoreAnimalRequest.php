<?php

namespace App\Http\Requests\Animal;

use App\Models\Animal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAnimalRequest extends FormRequest
{
    // Every new animal starts as Rescued. The other statuses are set later (the adoption statuses by
    // the adoption counselor / vet tech, see UpdateAnimalRequest), so no other status is accepted here.
    public const START_STATUS = 'Rescued';

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
            'color' => ['nullable', 'string', 'max:100'],
            'neutered' => ['required', 'boolean'],
            'location' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in([self::START_STATUS])],
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

    public function messages(): array
    {
        return [
            'status.in' => 'A new animal always starts as "Rescued". Its status is changed later: '
                .'Available, Pending and Adopted by the adoption counselor, Rescued and Reunited with Owner by pound staff.',
        ];
    }
}

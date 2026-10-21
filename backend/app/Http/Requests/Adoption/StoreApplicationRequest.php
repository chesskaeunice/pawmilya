<?php

namespace App\Http\Requests\Adoption;

use App\Models\AdoptionApplication;
use App\Models\Animal;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreApplicationRequest extends FormRequest
{
    public const SELF_EMPLOYED_FIELDS = [
        'Retail / Sales', 'Food & Beverage', 'Freelance / Online', 'Agriculture / Fishing',
        'Transport', 'Services', 'Other',
    ];

    public const DUPLICATE_MESSAGE = 'You already have an active application for this animal.';

    public function authorize(): bool
    {
        return $this->user()->role === 'citizen';
    }

    public function rules(): array
    {
        return [
            'animal_id' => ['required', 'integer', 'exists:animals,id'],

            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+()\s-]{7,}$/'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'birth_date' => ['required', 'date', 'before:today'],
            'employment_status' => ['required', Rule::in(['Student', 'Employed', 'Self-employed', 'Unemployed'])],
            'work' => ['nullable', 'required_if:employment_status,Employed,Self-employed', 'string', 'max:255'],
            'self_employed_field' => ['nullable', 'required_if:employment_status,Self-employed', Rule::in(self::SELF_EMPLOYED_FIELDS)],
            'self_employed_field_other' => ['nullable', 'required_if:self_employed_field,Other', 'string', 'max:255'],
            'social_media' => ['required', 'url', 'max:255'],
            'civil_status' => ['required', Rule::in(['Single', 'Married', 'Other'])],
            'pronouns' => ['required', Rule::in(['She/her', 'He/him', 'They/them'])],
            'referral_source' => ['required', Rule::in(['Friends', 'Website', 'Social Media', 'Others'])],
            'adopted_before' => ['required', 'boolean'],

            'residence' => ['required', 'string', 'max:50'],
            'household_members' => ['required', 'integer', 'min:1', 'max:50'],
            'has_pets' => ['required', 'boolean'],
            'pet_count' => ['nullable', 'required_if:has_pets,1,true', 'integer', 'min:1', 'max:100'],
            'pet_experience' => ['required', Rule::in(['No experience', 'Some experience', 'Experienced pet owner'])],

            'why_adopt' => ['required', 'string', 'max:2000'],
            'how_care' => ['required', 'string', 'max:2000'],
            'terms_accepted' => ['accepted'],

            // Valid ID, and home photos (min 2, max 3)
            'valid_id' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'home_photos' => ['required', 'array', 'min:2', 'max:3'],
            'home_photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    // The animal must be open for adoption and the citizen must not have a live application for it
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->has('animal_id')) {
                    return;
                }

                $animal = Animal::find($this->input('animal_id'));

                if ($animal->status !== Animal::ADOPTABLE) {
                    $validator->errors()->add('animal_id', 'This animal is not available for adoption.');

                    return;
                }

                $alreadyApplied = AdoptionApplication::live()
                    ->where('user_id', $this->user()->id)
                    ->where('animal_id', $animal->id)
                    ->exists();

                if ($alreadyApplied) {
                    $validator->errors()->add('animal_id', self::DUPLICATE_MESSAGE);
                }
            },
        ];
    }
}

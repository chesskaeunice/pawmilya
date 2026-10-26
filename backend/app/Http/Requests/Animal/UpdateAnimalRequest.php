<?php

namespace App\Http\Requests\Animal;

use App\Models\Animal;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAnimalRequest extends FormRequest
{
    // Which permissions allow editing which field (any one of them is enough)
    public const FIELD_PERMISSIONS = [
        'name' => ['animals.edit'],
        'species' => ['animals.edit'],
        'breed' => ['animals.edit'],
        'sex' => ['animals.edit'],
        'age_months' => ['animals.edit'],
        'color' => ['animals.edit'],
        'rescued_at' => ['animals.edit'],
        'personality' => ['animals.edit', 'animals.adoptionUpdate', 'animals.husbandryUpdate'],
        'ideal_home' => ['animals.edit'],
        'owner_name' => ['animals.edit'],
        'owner_contact' => ['animals.edit'],
        'status' => ['animals.edit', 'animals.adoptionUpdate', 'animals.healthUpdate'],
        'health_status' => ['animals.edit', 'animals.healthUpdate'],
        'location' => ['animals.edit', 'animals.husbandryUpdate'],
        'description' => ['animals.edit', 'animals.adoptionUpdate', 'animals.husbandryUpdate'],
    ];

    // The statuses that belong to the adoption flow (the counselor, and the approval of an application)
    public const ADOPTION_STATUSES = ['Available for Adoption', 'Pending Adoption', 'Adopted'];

    // Which statuses each permission may set. A role gets everything its permissions allow.
    // animals.edit (pound staff) covers Rescued and Reunited with Owner only: it cannot set an
    // adoption status, nor move an animal out of one (see authorize()).
    // (counselor: adoption flow; vet tech: back to Rescued or ready for adoption)
    public const STATUS_LIMITS = [
        'animals.edit' => ['Rescued', 'Reunited with Owner'],
        'animals.adoptionUpdate' => self::ADOPTION_STATUSES,
        'animals.healthUpdate' => ['Rescued', 'Available for Adoption'],
    ];

    // Sending a field this role may not edit is rejected with 403
    public function authorize(): bool
    {
        $user = $this->user();
        $animal = $this->route('animal');

        // Only a real change is checked: the Edit page sends the current status along every time
        if ($this->has('status') && $this->input('status') !== $animal->status) {
            $allowed = collect(self::STATUS_LIMITS)
                ->filter(fn ($statuses, $permission) => $user->hasPermission($permission))
                ->flatten();

            if (! $allowed->contains($this->input('status'))) {
                return false;
            }

            // An animal in the adoption flow can only be moved by the roles of that flow
            if (
                in_array($animal->status, self::ADOPTION_STATUSES, true)
                && ! $user->hasPermission('animals.adoptionUpdate')
                && ! $user->hasPermission('animals.healthUpdate')
            ) {
                return false;
            }
        }

        foreach (array_keys(self::FIELD_PERMISSIONS) as $field) {
            if (! $this->has($field)) {
                continue;
            }

            $allowed = collect(self::FIELD_PERMISSIONS[$field])->contains(fn ($p) => $user->hasPermission($p));

            if (! $allowed) {
                return false;
            }
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:40'],
            'species' => ['sometimes', Rule::in(['Dog', 'Cat', 'Other'])],
            'breed' => ['sometimes', 'required', 'string', 'max:100'],
            'sex' => ['sometimes', Rule::in(['Male', 'Female', 'Unknown'])],
            'age_months' => ['sometimes', 'integer', 'min:0', 'max:360'],
            'color' => ['sometimes', 'nullable', 'string', 'max:100'],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(Animal::STATUSES)],
            'health_status' => ['sometimes', Rule::in(Animal::HEALTH_STATUSES)],
            'rescued_at' => ['sometimes', 'date', 'before_or_equal:today'],
            'description' => ['sometimes', 'required', 'string', 'max:500'],
            'ideal_home' => ['sometimes', 'required', 'string', 'max:1000'],
            'personality' => ['sometimes', 'array', 'min:1', 'max:6'],
            'personality.*' => ['string', 'max:20'],
            'owner_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'owner_contact' => ['sometimes', 'nullable', 'string', 'max:50'],
        ];
    }

    // The result must still obey the cleared rule, using the stored value for fields not sent
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $animal = $this->route('animal');
                $status = $this->input('status', $animal->status);
                $health = $this->input('health_status', $animal->health_status);

                if ($status === Animal::ADOPTABLE && $health !== Animal::CLEARED) {
                    $validator->errors()->add('status', StoreAnimalRequest::CLEARED_MESSAGE);
                }
            },
        ];
    }
}

<?php

namespace App\Http\Requests\MissingPet;

use App\Models\PetClaim;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreClaimRequest extends FormRequest
{
    public const CLOSED_MESSAGE = 'This pet can no longer be claimed.';
    public const LOST_MESSAGE = 'This pet is reported as lost and is not at the pound, so it cannot be claimed.';
    public const DUPLICATE_MESSAGE = 'You already have an active claim for this pet.';

    // Citizens only (staff accounts cannot claim); guests are stopped by the login check on the route
    public function authorize(): bool
    {
        return $this->user()?->role === 'citizen';
    }

    public function rules(): array
    {
        return [
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:30', 'regex:/^[0-9+()\s-]{7,}$/'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            // today or later, and within the next 7 days
            'pickup_date' => ['required', 'date', 'after_or_equal:today', 'before_or_equal:'.now()->addDays(7)->toDateString()],
            'proof_images' => ['required', 'array', 'min:2', 'max:3'],
            'proof_images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'proof_images.min' => 'Please upload at least 2 proof of ownership photos.',
            'proof_images.max' => 'You can upload up to 3 proof of ownership photos.',
            'proof_images.required' => 'Please upload at least 2 proof of ownership photos.',
            'contact_number.regex' => 'Enter a valid contact number.',
        ];
    }

    // The report must still be Rescued and inside its claim period; one live claim per citizen
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $report = $this->route('report');

                if (! $report->inClaimPeriod()) {
                    $validator->errors()->add('report', $report->status === 'Lost' ? self::LOST_MESSAGE : self::CLOSED_MESSAGE);

                    return;
                }

                $already = PetClaim::live()
                    ->where('missing_pet_report_id', $report->id)
                    ->where('claimant_id', $this->user()->id)
                    ->exists();

                if ($already) {
                    $validator->errors()->add('report', self::DUPLICATE_MESSAGE);
                }
            },
        ];
    }
}

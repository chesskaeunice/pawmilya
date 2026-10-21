<?php

namespace Database\Seeders;

use App\Models\AdoptionApplication;
use App\Models\Animal;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class AdoptionApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $counselor = User::where('role', User::ROLE_ADOPTION_COUNSELOR)->first();

        // Tiny placeholder images so the staff pages can show the private ID and home photos
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        foreach (['valid-id', 'home-1', 'home-2'] as $name) {
            Storage::disk('local')->put("seed/{$name}.png", $png);
        }

        $base = [
            'valid_id_path' => 'seed/valid-id.png',
            'home_photo_paths' => ['seed/home-1.png', 'seed/home-2.png'],
            'terms_accepted' => true,
            'civil_status' => 'Single',
            'residence' => 'House',
            'household_members' => 3,
        ];

        $applications = [
            [
                'email' => 'maria@email.com', 'animal' => 'PAW-0001',
                'data' => [
                    'first_name' => 'Maria', 'last_name' => 'Santos',
                    'address' => '142 Katipunan Avenue, Quezon City', 'phone' => '0917 555 0187',
                    'birth_date' => '1999-05-14', 'employment_status' => 'Employed', 'work' => 'Bank Teller',
                    'social_media' => 'https://facebook.com/maria.sample', 'pronouns' => 'She/her',
                    'referral_source' => 'Social Media', 'has_pets' => true, 'pet_count' => 2,
                    'pet_experience' => 'Experienced pet owner', 'household_members' => 4,
                    'why_adopt' => 'I have been looking for a loving companion for our family.',
                    'how_care' => 'Milo will stay inside our home with proper food, exercise and vet care.',
                ],
                'status' => 'Pending',
            ],
            [
                'email' => 'john@email.com', 'animal' => 'PAW-0004',
                'data' => [
                    'first_name' => 'John', 'last_name' => 'Reyes',
                    'address' => 'Diliman, Quezon City', 'phone' => '0918 222 0192',
                    'birth_date' => '1996-03-22', 'employment_status' => 'Self-employed',
                    'work' => 'Sari-sari store owner', 'self_employed_field' => 'Retail / Sales',
                    'pronouns' => 'He/him', 'referral_source' => 'Friends', 'has_pets' => false,
                    'pet_experience' => 'First-time owner',
                    'why_adopt' => 'My store gets quiet and I would like a cat for company.',
                    'how_care' => 'Cleo will have a safe room, regular meals and vet visits.',
                ],
                'status' => 'Approved',
            ],
        ];

        foreach ($applications as $item) {
            $user = User::where('email', $item['email'])->first();
            $animal = Animal::where('animal_code', $item['animal'])->first();

            $application = AdoptionApplication::firstOrNew(['user_id' => $user->id, 'animal_id' => $animal->id]);
            $application->fill([...$base, ...$item['data'], 'email' => $item['email']]);
            $application->status = $item['status'];

            if ($item['status'] !== 'Pending') {
                $application->reviewed_by = $counselor?->id;
                $application->reviewed_at = now();
            }

            $application->save();
        }
    }
}

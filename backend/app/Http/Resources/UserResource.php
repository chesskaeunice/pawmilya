<?php

namespace App\Http\Resources;

use App\Support\PublicFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// The only shape a user is sent to the client in (no password, remember_token or internal flags)
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            // absolute URL of the profile photo, null when there is none
            // home address in parts (Profile page); every part is null until it is saved
            'address' => [
                'province' => $this->province,
                'city' => $this->city,
                'barangay' => $this->barangay,
                'street' => $this->street,
            ],
            'avatar_url' => $this->avatar_path ? PublicFile::url($this->avatar_path) : null,
            'mustChangePassword' => (bool) $this->must_change_password,
        ];
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\UpdateAddressRequest;
use App\Http\Requests\Auth\UpdateAvatarRequest;
use App\Http\Requests\Auth\UpdateEmailRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Support\Audit;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    // Full name and phone number of the logged-in user (citizen or staff). Returns the updated user like /api/me.
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $before = $user->only(['name', 'phone']);

        $user->forceFill($request->validated())->save();

        if ($user->wasChanged(['name', 'phone'])) {
            Audit::record($request, 'profile.updated', $user, ['from' => $before]);
        }

        return response()->json(['user' => (new UserResource($user))->resolve()]);
    }

    // Returns the updated user in the same shape as /api/me, so the app can use it right away
    public function updateEmail(UpdateEmailRequest $request): JsonResponse
    {
        $user = $request->user();
        $from = $user->email;
        $to = $request->validated('email');

        if ($from !== $to) {
            try {
                $user->forceFill(['email' => $to])->save();
            } catch (UniqueConstraintViolationException) {
                // someone registered it between the check and the save
                throw ValidationException::withMessages(['email' => [trans('validation.custom.email.unique')]]);
            }

            Audit::record($request, 'profile.email_changed', $user, ['from' => $from, 'to' => $to]);
        }

        return response()->json(['user' => (new UserResource($user))->resolve()]);
    }

    // Home address in parts; sending every part empty clears it. Returns the updated user like /api/me.
    public function updateAddress(UpdateAddressRequest $request): JsonResponse
    {
        $user = $request->user();
        $address = $request->safe()->only(['province', 'city', 'barangay', 'street']);

        $user->forceFill($address)->save();

        if ($user->wasChanged(array_keys($address))) {
            Audit::record($request, 'profile.address_changed', $user);
        }

        return response()->json(['user' => (new UserResource($user))->resolve()]);
    }

    // Profile photo on the public disk (run `php artisan storage:link` once so the URL loads);
    // the old file is deleted. No image processing: gd is not installed.
    public function updateAvatar(UpdateAvatarRequest $request): JsonResponse
    {
        $user = $request->user();
        $old = $user->avatar_path;

        $user->forceFill(['avatar_path' => $request->file('avatar')->store('avatars', 'public')])->save();

        if ($old) {
            Storage::disk('public')->delete($old);
        }

        return response()->json(['user' => (new UserResource($user))->resolve()]);
    }

    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($old = $user->avatar_path) {
            $user->forceFill(['avatar_path' => null])->save();
            Storage::disk('public')->delete($old);
        }

        return response()->json(['user' => (new UserResource($user))->resolve()]);
    }
}

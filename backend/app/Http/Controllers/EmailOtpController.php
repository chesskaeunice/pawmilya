<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\Audit;
use App\Support\EmailOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

// Email verification after sign up (6-digit code). Answers never say whether an account exists.
class EmailOtpController extends Controller
{
    // A right code verifies the account and signs the person in
    public function verify(Request $request, EmailOtpService $otp): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'code' => ['required', 'string', 'digits:6'],
        ]);

        $user = User::where('email', strtolower(trim($data['email'])))->first();

        if (! $user || $user->email_verified_at || ! $otp->verify($user, $data['code'])) {
            throw ValidationException::withMessages(['code' => ['That code is incorrect or has expired. Request a new one.']]);
        }

        Audit::record($request, 'auth.email_verified', $user, [], $user);

        return response()->json([
            'token' => AuthController::issueToken($request, $user),
            'user' => (new UserResource($user))->resolve(),
        ]);
    }

    // Same answer for every email; a code is sent only to an unverified account and not too often
    public function resend(Request $request, EmailOtpService $otp): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'string', 'email']]);

        $user = User::where('email', strtolower(trim($data['email'])))->first();

        if ($user && ! $user->email_verified_at && $user->is_active) {
            $otp->send($user);
        }

        return response()->json(['message' => 'If that account is waiting for verification, a new code has been sent.']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Support\Audit;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

// Forgot / reset (public) and change (logged in) password
class PasswordController extends Controller
{
    // Same answer whether or not the email exists
    public function forgot(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        // A mail server problem is only logged: the answer must not change (or fail)
        // for an account that exists, or it would show which emails are registered
        try {
            Password::sendResetLink(['email' => strtolower(trim($request->input('email')))]);
        } catch (Throwable $e) {
            report($e);
        }

        return response()->json(['message' => 'If that email has an account, a reset link has been sent.']);
    }

    // Token lasts 60 minutes (config/auth.php) and is deleted once used
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) use ($request) {
                $user->forceFill([
                    'password' => $password,
                    'must_change_password' => false,
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();
                Audit::record($request, 'auth.password_reset', $user, [], $user);
                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => ['This reset link is invalid or has expired.']]);
        }

        return response()->json(['message' => 'Your password has been reset. You can log in now.']);
    }

    // Revokes every token, then gives this device a fresh one
    public function change(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->forceFill(['password' => $request->validated('password'), 'must_change_password' => false])->save();
        $user->tokens()->delete();
        Audit::record($request, 'auth.password_changed', $user);

        return response()->json([
            'message' => 'Password changed.',
            'token' => AuthController::issueToken($request, $user),
        ]);
    }
}

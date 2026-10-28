<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\Audit;
use App\Support\EmailOtpService;
use App\Support\LoginGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const INVALID = 'Invalid email or password.';

    // Public sign up: always a citizen (role is never read from the request)
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = new User([
            'name' => trim($data['first_name'].' '.$data['last_name']),
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => $data['password'],
        ]);
        $user->role = User::ROLE_CITIZEN;
        $user->save();

        Audit::record($request, 'auth.registered', $user, [], $user);

        // No token yet: the email must be verified with the code that was just sent
        app(EmailOtpService::class)->send($user);

        return response()->json([
            'message' => 'Account created. Enter the code we emailed you to verify your email.',
            'email' => $user->email,
            'requiresVerification' => true,
        ], 201);
    }

    // Same login for citizens and staff; the role in the response decides where the app goes
    public function login(LoginRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        $password = $request->validated('password');
        $guard = new LoginGuard($email, (string) $request->ip());

        $wait = $guard->retryAfter();
        if ($wait > 0) {
            Audit::record($request, 'auth.login_blocked', null, ['email' => $email]);

            return response()->json([
                'message' => 'Too many attempts. Try again in '.ceil($wait / 60).' minute(s).',
            ], 429)->header('Retry-After', $wait);
        }

        $user = User::where('email', $email)->first();

        // Always run one hash check so unknown emails take about as long as known ones
        $passwordOk = Hash::check($password, $user?->password ?? $this->dummyHash());

        if (! $user || ! $passwordOk || ! $user->is_active) {
            $guard->fail();
            Audit::record($request, 'auth.login_failed', $user, [
                'email' => $email,
                'reason' => ! $user ? 'unknown_email' : (! $passwordOk ? 'wrong_password' : 'inactive_account'),
            ], $user);

            // Same message whatever went wrong
            throw ValidationException::withMessages(['email' => [self::INVALID]]);
        }

        $guard->clear();

        // A citizen must verify the email first (staff accounts are created verified)
        if (! $user->isStaff() && ! $user->email_verified_at) {
            app(EmailOtpService::class)->send($user);

            return response()->json([
                'message' => 'Please verify your email. We sent you a code.',
                'code' => 'email_not_verified',
                'email' => $user->email,
            ], 403);
        }

        Audit::record($request, 'auth.login', $user, [], $user);

        return $this->tokenResponse($request, $user);
    }

    public function logout(Request $request): JsonResponse
    {
        Audit::record($request, 'auth.logout', $request->user());
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => (new UserResource($request->user()))->resolve()]);
    }

    // Token named after the device, with a lifetime by role
    public static function issueToken(Request $request, User $user): string
    {
        $minutes = config('security.token_ttl.'.($user->isStaff() ? 'staff' : 'citizen'));
        $device = Str::limit($request->userAgent() ?: 'unknown device', 100, '');

        return $user->createToken($device, ['*'], now()->addMinutes($minutes))->plainTextToken;
    }

    private function tokenResponse(Request $request, User $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'token' => self::issueToken($request, $user),
            'user' => (new UserResource($user))->resolve(),
        ], $status);
    }

    private function dummyHash(): string
    {
        static $hash = null;

        return $hash ??= Hash::make('not-a-real-password');
    }
}

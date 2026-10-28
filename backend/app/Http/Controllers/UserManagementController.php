<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Audit;
use App\Support\PasswordRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

// Staff accounts and roles. Kennel manager only (permission settings.system).
class UserManagementController extends Controller
{
    private const STAFF_ROLES = [
        User::ROLE_KENNEL_MANAGER,
        User::ROLE_POUND_STAFF,
        User::ROLE_VET_TECH,
        User::ROLE_ADOPTION_COUNSELOR,
    ];

    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->query('type') === 'citizens',
                fn ($q) => $q->where('role', User::ROLE_CITIZEN),
                fn ($q) => $q->whereIn('role', self::STAFF_ROLES))
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => $this->present($user));

        return response()->json(['data' => $users]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', Rule::in(self::STAFF_ROLES)],
            'password' => PasswordRules::make(fn () => [$request->input('email'), $request->input('name')]),
        ]);

        $user = new User(['name' => $data['name'], 'email' => $data['email'], 'phone' => $data['phone'] ?? null, 'password' => $data['password']]);
        $user->role = $data['role'];
        $user->is_active = true;
        $user->email_verified_at = now(); // staff accounts do not need the sign-up code
        $user->must_change_password = true; // temporary password: replaced at first login
        $user->save();

        Audit::record($request, 'user.created', $user, ['role' => $user->role]);

        return response()->json(['data' => $this->present($user)], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'role' => ['sometimes', Rule::in(self::STAFF_ROLES)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        // Nobody can lock themselves out (this also keeps at least one active manager)
        if ($user->is($request->user()) && (
            (isset($data['role']) && $data['role'] !== $user->role)
            || (isset($data['is_active']) && ! $data['is_active'])
        )) {
            throw ValidationException::withMessages(['role' => ['You cannot change your own role or deactivate your own account.']]);
        }

        abort_unless(in_array($user->role, self::STAFF_ROLES, true), 404);

        $before = ['role' => $user->role, 'is_active' => $user->is_active];

        if (isset($data['name'])) {
            $user->name = $data['name'];
        }
        if (isset($data['role'])) {
            $user->role = $data['role'];
        }
        if (isset($data['is_active'])) {
            $user->is_active = $data['is_active'];
        }

        $user->save();

        // A deactivated account is signed out everywhere; a changed role takes effect on the next login
        if (! $user->is_active || $user->role !== $before['role']) {
            $user->tokens()->delete();
        }

        if ($user->role !== $before['role']) {
            Audit::record($request, 'user.role_changed', $user, ['from' => $before['role'], 'to' => $user->role]);
        }
        if ($before['is_active'] && ! $user->is_active) {
            Audit::record($request, 'user.deactivated', $user);
        }

        Audit::record($request, 'user.updated', $user, ['from' => $before, 'to' => ['role' => $user->role, 'is_active' => $user->is_active]]);

        return response()->json(['data' => $this->present($user)]);
    }

    private function present(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'active' => $user->is_active,
        ];
    }
}

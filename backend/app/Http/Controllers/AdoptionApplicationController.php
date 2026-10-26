<?php

namespace App\Http\Controllers;

use App\Http\Requests\Adoption\StoreApplicationRequest;
use App\Http\Resources\ApplicationResource;
use App\Http\Resources\MyApplicationResource;
use App\Models\AdoptionApplication;
use App\Models\Animal;
use App\Support\Audit;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdoptionApplicationController extends Controller
{
    private const ID_VERIFIED = 'Verified';
    private const ID_REJECTED_REASON = 'Your valid ID could not be verified. Please re-apply with a clear photo of a valid government ID.';

    /* ---------- citizen ---------- */

    public function store(StoreApplicationRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->safe()->except(['valid_id', 'home_photos']);

        // ID and home photos are private: they are stored outside the public disk
        $directory = "adoption-applications/{$user->id}";
        $validIdPath = $request->file('valid_id')->store($directory, 'local');
        $homePaths = collect($request->file('home_photos'))
            ->map(fn ($file) => $file->store($directory, 'local'))
            ->all();

        try {
            $application = new AdoptionApplication($data);
            $application->fill([
                'user_id' => $user->id,
                'valid_id_path' => $validIdPath,
                'home_photo_paths' => $homePaths,
                'pet_count' => $data['has_pets'] ? ($data['pet_count'] ?? null) : null,
            ]);
            $application->save();
        } catch (UniqueConstraintViolationException) {
            // Two submits at the same time: the database allows only one
            Storage::disk('local')->delete([$validIdPath, ...$homePaths]);

            throw ValidationException::withMessages(['animal_id' => [StoreApplicationRequest::DUPLICATE_MESSAGE]]);
        }

        Audit::record($request, 'application.submitted', $application, ['animal_id' => $application->animal_id]);

        return response()->json(['data' => (new MyApplicationResource($application->refresh()->load('animal.photos')))->resolve()], 201);
    }

    public function mine(Request $request)
    {
        $applications = AdoptionApplication::with('animal.photos')
            ->where('user_id', $request->user()->id)
            ->latest('id')
            ->get();

        return MyApplicationResource::collection($applications);
    }

    /* ---------- staff ---------- */

    public function index(Request $request)
    {
        $query = AdoptionApplication::with(['animal.photos', 'reviewer']);

        $query->when($request->query('status'), fn ($q, $v) => $q->where('status', $v));

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('animal', fn ($a) => $a->where('name', 'like', "%{$search}%"));
            });
        }

        $perPage = min(max((int) $request->query('per_page', 20), 1), 200);

        return ApplicationResource::collection($query->latest('id')->paginate($perPage)->withQueryString());
    }

    public function show(AdoptionApplication $application): ApplicationResource
    {
        return new ApplicationResource($application->load(['animal.photos', 'reviewer']));
    }

    // Approve: the application, the animal and the competing applications change together
    public function approve(Request $request, AdoptionApplication $application): ApplicationResource
    {
        $rejectedIds = [];

        DB::transaction(function () use ($request, $application, &$rejectedIds) {
            // Lock both rows so two staff members (or a double click) cannot both approve
            $current = AdoptionApplication::whereKey($application->id)->lockForUpdate()->firstOrFail();
            $animal = Animal::whereKey($current->animal_id)->lockForUpdate()->firstOrFail();

            $this->ensurePending($current);

            // the counselor must have checked the valid ID first (see verifyId)
            if ($current->id_verification_status !== self::ID_VERIFIED) {
                throw ValidationException::withMessages(['status' => ["Verify the applicant's valid ID before approving."]]);
            }

            if (! in_array($animal->status, [Animal::ADOPTABLE, 'Pending Adoption'], true)) {
                throw ValidationException::withMessages(['status' => ['This animal can no longer be adopted.']]);
            }

            $this->decide($current, AdoptionApplication::APPROVED, $request, null);
            // The adopter becomes the owner shown on the animal's QR scan page
            $animal->forceFill([
                'status' => 'Adopted',
                'owner_name' => trim($current->first_name.' '.$current->last_name),
                'owner_contact' => $current->phone,
            ])->save();

            // Anyone else waiting for the same animal is rejected
            $others = AdoptionApplication::where('animal_id', $animal->id)
                ->where('id', '!=', $current->id)
                ->where('status', AdoptionApplication::PENDING)
                ->lockForUpdate()
                ->get();

            foreach ($others as $other) {
                $this->decide($other, AdoptionApplication::REJECTED, $request, 'Another application for this animal was approved.');
                $rejectedIds[] = $other->id;
            }

            Audit::record($request, 'application.approved', $current, [
                'animal_id' => $animal->id,
                'auto_rejected' => $rejectedIds,
            ]);
        });

        return new ApplicationResource($application->refresh()->load(['animal.photos', 'reviewer']));
    }

    // The counselor checks the valid ID of a Pending application: Verified, Pending Verification (undo),
    // or Rejected, which also rejects the application (the animal's status does not change).
    public function verifyId(Request $request, AdoptionApplication $application): ApplicationResource
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['Verified', 'Rejected', 'Pending Verification'])],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($request, $application, $data) {
            $current = AdoptionApplication::whereKey($application->id)->lockForUpdate()->firstOrFail();

            $this->ensurePending($current);

            $from = $current->id_verification_status;
            $current->forceFill(['id_verification_status' => $data['status']])->save();

            if ($data['status'] === 'Rejected') {
                $reason = trim((string) ($data['reason'] ?? '')) ?: self::ID_REJECTED_REASON;
                $this->decide($current, AdoptionApplication::REJECTED, $request, $reason);

                Audit::record($request, 'application.id_rejected', $current, ['animal_id' => $current->animal_id, 'reason' => $reason]);

                return;
            }

            Audit::record($request, $data['status'] === 'Verified' ? 'application.id_verified' : 'application.id_reset', $current, ['from' => $from]);
        });

        return new ApplicationResource($application->refresh()->load(['animal.photos', 'reviewer']));
    }

    public function reject(Request $request, AdoptionApplication $application): ApplicationResource
    {
        $data = $request->validate(['reason' => ['nullable', 'string', 'max:1000']]);

        DB::transaction(function () use ($request, $application, $data) {
            $current = AdoptionApplication::whereKey($application->id)->lockForUpdate()->firstOrFail();

            $this->ensurePending($current);
            $this->decide($current, AdoptionApplication::REJECTED, $request, $data['reason'] ?? null);

            Audit::record($request, 'application.rejected', $current, ['animal_id' => $current->animal_id, 'reason' => $data['reason'] ?? null]);
        });

        return new ApplicationResource($application->refresh()->load(['animal.photos', 'reviewer']));
    }

    /* ---------- private files (signed, expiring links) ---------- */

    public function file(AdoptionApplication $application, string $type, int $index): StreamedResponse
    {
        $path = match ($type) {
            'id' => $application->valid_id_path,
            'home' => $application->home_photo_paths[$index] ?? null,
            default => null,
        };

        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }

    /* ---------- helpers ---------- */

    // Only a pending application can be decided (blocks double approvals and changing a decision)
    private function ensurePending(AdoptionApplication $application): void
    {
        if ($application->status !== AdoptionApplication::PENDING) {
            throw ValidationException::withMessages(['status' => ["This application was already {$application->status}."]]);
        }
    }

    private function decide(AdoptionApplication $application, string $status, Request $request, ?string $reason): void
    {
        $application->forceFill([
            'status' => $status,
            'rejection_reason' => $reason,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ])->save();
    }
}

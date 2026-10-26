<?php

namespace App\Http\Controllers;

use App\Http\Requests\Animal\StoreAnimalRequest;
use App\Http\Requests\Animal\UpdateAnimalRequest;
use App\Http\Resources\AnimalResource;
use App\Models\Animal;
use App\Models\AnimalPhoto;
use App\Models\AuditLog;
use App\Support\Audit;
use App\Support\ReleaseUnclaimedReports;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

// Staff side. Permissions are checked by route middleware or the Form Request.
class AnimalController extends Controller
{
    // Photos per animal (the same 3 to 4 as when it is created)
    private const MIN_PHOTOS = 3;
    private const MAX_PHOTOS = 4;

    public function index(Request $request)
    {
        $query = Animal::with(['photos', 'missingPetReport']);

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('breed', 'like', "%{$search}%")
                    ->orWhere('animal_code', 'like', "%{$search}%");
            });
        }

        $query->when($request->query('type'), fn ($q, $v) => $q->where('species', $v))
            ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->query('health_status'), fn ($q, $v) => $q->where('health_status', $v));

        match ($request->query('sort')) {
            'name_asc' => $query->orderBy('name'),
            'name_desc' => $query->orderByDesc('name'),
            default => $query->orderByDesc('id'),
        };

        $perPage = min(max((int) $request->query('per_page', 10), 1), 500);

        return AnimalResource::collection($query->paginate($perPage)->withQueryString());
    }

    public function show(Animal $animal): AnimalResource
    {
        return new AnimalResource($animal->load(['photos', 'missingPetReport']));
    }

    public function store(StoreAnimalRequest $request): JsonResponse
    {
        $data = $request->safe()->except('images');

        $animal = DB::transaction(function () use ($request, $data) {
            $animal = new Animal($data);
            $animal->status = StoreAnimalRequest::START_STATUS;
            $animal->created_by = $request->user()->id;
            $animal->save();

            foreach ($request->file('images') as $position => $file) {
                $animal->photos()->create([
                    'path' => $file->store("animals/{$animal->id}", 'public'),
                    'position' => $position,
                ]);
            }

            return $animal;
        });

        Audit::record($request, 'animal.created', $animal, ['animal_code' => $animal->animal_code]);

        return (new AnimalResource($animal->load('photos')))->response()->setStatusCode(201);
    }

    public function update(UpdateAnimalRequest $request, Animal $animal, ReleaseUnclaimedReports $release): AnimalResource
    {
        // one transaction: the update and, when the vet clears a pet whose claim period is over,
        // its automatic change to Available for Adoption
        DB::transaction(function () use ($request, $animal, $release) {
            $animal->fill($request->validated());
            $changes = $animal->getDirty();
            $original = collect($changes)->mapWithKeys(fn ($v, $k) => [$k => $animal->getOriginal($k)])->all();
            $animal->save();

            if ($changes) {
                Audit::record($request, 'animal.updated', $animal, ['from' => $original, 'to' => $changes]);
            }

            $release->promoteAnimal($animal);
        });

        return new AnimalResource($animal->refresh()->load(['photos', 'missingPetReport']));
    }

    // Replaces the main photo (first position). Adoption counselor, vet tech and pound staff (animals.photo).
    public function updatePhoto(Request $request, Animal $animal): AnimalResource
    {
        $request->validate(['image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120']]);

        $path = $request->file('image')->store("animals/{$animal->id}", 'public');
        $main = $animal->photos()->orderBy('position')->first();

        if ($main) {
            Storage::disk('public')->delete($main->path);
            $main->update(['path' => $path]);
        } else {
            $animal->photos()->create(['path' => $path, 'position' => 0]);
        }

        Audit::record($request, 'animal.photo_changed', $animal);

        return new AnimalResource($animal->load('photos'));
    }

    // Adds a photo (pound staff, animals.edit). An animal keeps 3 to 4 photos.
    public function addPhoto(Request $request, Animal $animal): AnimalResource
    {
        $request->validate(['image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120']]);

        if ($animal->photos()->count() >= self::MAX_PHOTOS) {
            throw ValidationException::withMessages(['image' => 'An animal can have at most '.self::MAX_PHOTOS.' photos. Remove one first.']);
        }

        $position = ((int) $animal->photos()->max('position')) + 1;
        $animal->photos()->create([
            'path' => $request->file('image')->store("animals/{$animal->id}", 'public'),
            'position' => $position,
        ]);

        Audit::record($request, 'animal.photo_added', $animal);

        return new AnimalResource($animal->load(['photos', 'missingPetReport']));
    }

    // Removes one photo (pound staff, animals.edit). The next photo becomes the main one when needed.
    public function removePhoto(Request $request, Animal $animal, AnimalPhoto $photo): AnimalResource
    {
        abort_unless($photo->animal_id === $animal->id, 404);

        if ($animal->photos()->count() <= self::MIN_PHOTOS) {
            throw ValidationException::withMessages(['photo' => 'An animal needs at least '.self::MIN_PHOTOS.' photos. Add another one before removing this one.']);
        }

        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        Audit::record($request, 'animal.photo_removed', $animal);

        return new AnimalResource($animal->load(['photos', 'missingPetReport']));
    }

    public function destroy(Request $request, Animal $animal): JsonResponse
    {
        // Adoption records must not disappear with the animal
        if ($animal->adoptionApplications()->exists()) {
            return response()->json(['message' => 'This animal has adoption applications and cannot be deleted.'], 422);
        }

        $code = $animal->animal_code;
        Storage::disk('public')->deleteDirectory("animals/{$animal->id}");
        $animal->delete();

        Audit::record($request, 'animal.deleted', $animal, ['animal_code' => $code]);

        return response()->json(['message' => 'Animal deleted.']);
    }

    // Everything recorded about one animal: its own changes, vaccinations and adoption decisions
    public function history(Animal $animal): JsonResponse
    {
        $logs = AuditLog::with('user')
            ->where(fn ($q) => $q
                ->where(fn ($own) => $own->where('entity_type', 'Animal')->where('entity_id', $animal->id))
                ->orWhere('details->animal_id', $animal->id))
            ->latest('id')
            ->limit(100)
            ->get();

        return response()->json([
            'data' => $logs->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'user' => $log->user?->name,
                'details' => $log->details,
                'createdAt' => $log->created_at?->toIso8601String(),
            ]),
        ]);
    }

    // SVG QR code that opens the public stray page (pet info, owner info if known)
    public function qr(Animal $animal): Response
    {
        $url = rtrim(config('app.frontend_url'), '/').'/stray/'.$animal->qr_token;

        $writer = new Writer(new ImageRenderer(new RendererStyle(260, 2), new SvgImageBackEnd()));

        return response($writer->writeString($url), 200, ['Content-Type' => 'image/svg+xml']);
    }
}

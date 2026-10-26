<?php

namespace App\Http\Controllers;

use App\Http\Requests\MissingPet\StoreMissingPetRequest;
use App\Http\Resources\AnimalResource;
use App\Http\Resources\MissingPetResource;
use App\Http\Resources\StaffMissingPetResource;
use App\Models\Animal;
use App\Models\MissingPetReport;
use App\Support\Audit;
use App\Support\PoundMatcher;
use App\Support\PublicCache;
use App\Support\ReportAnimalRegistrar;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class MissingPetReportController extends Controller
{
    /* ---------- public ---------- */

    // Newest first. The pages filter on the client, so one call returns the list (capped).
    public function index(Request $request)
    {
        $limit = min(max((int) $request->query('per_page', 100), 1), 500);

        return PublicCache::json($request, fn () => MissingPetResource::collection(
            MissingPetReport::with('photos')->latest('id')->limit($limit)->get()
        )->response()->getData(true));
    }

    public function show(int $id): MissingPetResource
    {
        return new MissingPetResource(MissingPetReport::with('photos')->findOrFail($id));
    }

    // Open to guests (reporter_id stays null) and citizens
    public function store(StoreMissingPetRequest $request): JsonResponse
    {
        $user = $request->reporter();
        $data = $request->safe()->except(['pet_images', 'last_seen_images']);

        $report = new MissingPetReport($data);
        $report->reporter_id = $user?->id;
        $report->status = $request->validated('status');
        $report->sex = $data['sex'] ?? 'Unknown';
        // Citizens may leave the contact fields empty: their account details are used
        $report->contact_name = $data['contact_name'] ?? $user?->name;
        $report->contact_number = $data['contact_number'] ?? $user?->phone;
        $report->fingerprint = $request->fingerprint();

        $paths = [];

        try {
            DB::transaction(function () use ($request, $report, &$paths) {
                $report->save();

                foreach (['pet' => 'pet_images', 'last_seen' => 'last_seen_images'] as $kind => $field) {
                    foreach ($request->file($field) as $position => $file) {
                        $path = $file->store("missing-pets/{$report->id}", 'public');
                        $paths[] = $path;
                        $report->photos()->create(['path' => $path, 'kind' => $kind, 'position' => $position]);
                    }
                }
            });
        } catch (UniqueConstraintViolationException) {
            // Two identical submits at the same moment: the database keeps only one
            Storage::disk('public')->delete($paths);

            throw ValidationException::withMessages(['name' => [StoreMissingPetRequest::DUPLICATE_MESSAGE]]);
        }

        Audit::record($request, 'missing_pet.reported', $report, ['status' => $report->status, 'guest' => ! $user]);

        return (new MissingPetResource($report->refresh()->load('photos')))->response()->setStatusCode(201);
    }

    /* ---------- citizen ---------- */

    public function mine(Request $request)
    {
        return MissingPetResource::collection(
            MissingPetReport::with('photos')->where('reporter_id', $request->user()->id)->latest('id')->get()
        );
    }

    // The owner found the pet ("Mark as Found" on My Reports)
    public function markReunited(Request $request, MissingPetReport $report): MissingPetResource
    {
        abort_unless($report->reporter_id === $request->user()->id, 403, 'This is not your report.');

        if ($report->status === 'Reunited') {
            throw ValidationException::withMessages(['status' => ['This report is already marked as reunited.']]);
        }

        $from = $report->status;
        $report->forceFill(['status' => 'Reunited'])->save();

        Audit::record($request, 'missing_pet.status_changed', $report, ['from' => $from, 'to' => 'Reunited', 'by' => 'owner']);

        return new MissingPetResource($report->load('photos'));
    }

    /* ---------- staff ---------- */

    public function staffIndex(Request $request)
    {
        $limit = min(max((int) $request->query('per_page', 200), 1), 500);

        return StaffMissingPetResource::collection(
            MissingPetReport::with(['photos', 'reporter'])->latest('id')->limit($limit)->get()
        );
    }

    public function staffShow(MissingPetReport $report): StaffMissingPetResource
    {
        return new StaffMissingPetResource($report->load(['photos', 'reporter']));
    }

    // Setting a report to Found also registers the pet as an animal (same steps as registerAnimal),
    // in the same transaction: if that fails, the status stays as it was.
    public function updateStatus(Request $request, MissingPetReport $report, ReportAnimalRegistrar $registrar): StaffMissingPetResource
    {
        $data = $request->validate(['status' => ['required', Rule::in(MissingPetReport::STATUSES)]]);
        $to = $data['status'];

        if ($report->status !== $to) {
            try {
                [$report, $from, $animal] = DB::transaction(function () use ($request, $report, $to, $registrar) {
                    $locked = MissingPetReport::with('photos')->whereKey($report->id)->lockForUpdate()->firstOrFail();
                    $from = $locked->status;

                    if ($from === $to) {
                        return [$locked, $from, null];
                    }

                    $locked->forceFill(['status' => $to])->save();

                    $animal = $to === 'Found' && ! $locked->animal_id
                        ? $registrar->register($locked, $request->user())
                        : null;

                    return [$locked, $from, $animal];
                });
            } catch (UniqueConstraintViolationException) {
                // Re-opening a Reunited report while the same reporter already filed an open one
                throw ValidationException::withMessages(['status' => ['The same pet was already reported again by this reporter.']]);
            } catch (Throwable $e) {
                report($e);

                throw ValidationException::withMessages(['status' => ['The pet could not be added to the Animals list, so the status was not changed. Please try again.']]);
            }

            if ($from !== $to) {
                Audit::record($request, 'missing_pet.status_changed', $report, ['from' => $from, 'to' => $to]);
            }
            if ($animal) {
                $registrar->audit($request, $animal, $report);
            }
        }

        return new StaffMissingPetResource($report->load(['photos', 'reporter']));
    }

    // Animals in the pound that could be this pet
    // A Found report means the pet is now at the pound: register it as an animal (status Rescued) and
    // link the two, so staff can print its QR / collar tag. Pound staff only.
    public function registerAnimal(Request $request, MissingPetReport $report, ReportAnimalRegistrar $registrar): JsonResponse
    {
        $result = DB::transaction(function () use ($request, $report, $registrar) {
            // lock the row, so a double click or two staff members cannot register it twice
            $report = MissingPetReport::with('photos')->whereKey($report->id)->lockForUpdate()->firstOrFail();

            if ($report->status !== 'Found') {
                return ['error' => ['message' => 'Only a Found report can be registered in the pound.']];
            }

            if ($report->animal_id) {
                return ['error' => ['message' => 'This report is already registered as an animal.', 'animal_id' => $report->animal_id]];
            }

            return ['animal' => $registrar->register($report, $request->user()), 'report' => $report];
        });

        if (isset($result['error'])) {
            return response()->json($result['error'], 422);
        }

        $registrar->audit($request, $result['animal'], $result['report']);

        return (new AnimalResource($result['animal']->load('photos')))->response()->setStatusCode(201);
    }

    public function matches(MissingPetReport $report, PoundMatcher $matcher): JsonResponse
    {
        $matches = $matcher->matchesFor($report)->map(fn ($match) => [
            'id' => $match['animal']->id,
            'animal_code' => $match['animal']->animal_code,
            'name' => $match['animal']->name,
            'type' => $match['animal']->species,
            'breed' => $match['animal']->breed,
            'color' => $match['animal']->color,
            'sex' => $match['animal']->sex,
            'status' => $match['animal']->status,
            'location' => $match['animal']->location,
            'image' => $match['animal']->photos->first()?->url(),
            'score' => $match['score'],
            'reasons' => $match['reasons'],
        ]);

        return response()->json(['data' => $matches]);
    }
}

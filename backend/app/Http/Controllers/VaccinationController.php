<?php

namespace App\Http\Controllers;

use App\Http\Requests\Vaccination\StoreVaccinationRequest;
use App\Http\Requests\Vaccination\UpdateVaccinationRequest;
use App\Http\Resources\VaccinationResource;
use App\Models\HealthLog;
use App\Models\Vaccine;
use App\Support\Audit;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

// Vaccination records are the health_logs table
class VaccinationController extends Controller
{
    // Optional ?animal_id= limits the list to one animal
    public function index(Request $request)
    {
        return VaccinationResource::collection(
            HealthLog::with(['animal:id,name,animal_code,species,breed', 'recorder:id,name', 'vaccineType:id,name'])
                ->when($request->query('animal_id'), fn ($q, $id) => $q->where('animal_id', $id))
                ->orderByDesc('administered_at')->orderByDesc('id')->limit(2000)->get()
        );
    }

    public function store(StoreVaccinationRequest $request): JsonResponse
    {
        $animalId = $request->validated('animal_id');
        $created = collect();

        try {
            DB::transaction(function () use ($request, $animalId, &$created) {
                foreach ($request->validated('records') as $record) {
                    [$vaccineId, $otherName, $vaccine] = Vaccine::resolve($record['vaccine_id'] ?? null, $record['other_vaccine_name'] ?? null);
                    $given = substr($record['administered_at'], 0, 10);

                    $log = HealthLog::create([
                        'animal_id' => $animalId,
                        'vaccine_id' => $vaccineId,
                        'other_vaccine_name' => $otherName,
                        'vaccine' => $vaccine,
                        'administered_at' => $given,
                        // no date given: date given + the vaccine's usual interval
                        'next_due_date' => ($record['next_due_date'] ?? null) ?: HealthLog::defaultNextDue($vaccine, $given)->toDateString(),
                        'notes' => $record['notes'] ?? null,
                        'recorded_by' => $request->user()->id,
                    ]);

                    $created->push($log);
                    Audit::record($request, 'vaccination.created', $log, ['animal_id' => $animalId, 'vaccine' => $vaccine]);
                }
            });
        } catch (UniqueConstraintViolationException) {
            // The same dose sent twice at the same moment
            throw ValidationException::withMessages(['records' => ['One of these vaccinations was already recorded.']]);
        }

        $created->first()->animal->refreshVaccinated();

        $logs = HealthLog::with(['animal', 'recorder:id,name', 'vaccineType:id,name'])->whereIn('id', $created->pluck('id'))->orderBy('id')->get();

        return VaccinationResource::collection($logs)->response()->setStatusCode(201);
    }

    public function update(UpdateVaccinationRequest $request, HealthLog $log): VaccinationResource
    {
        $data =$request->validated();

        // a new vaccine (from the list, or typed): the name stored with the record follows it
        if ($request->changesVaccine()) {
            [$data['vaccine_id'], $data['other_vaccine_name'], $data['vaccine']] = Vaccine::resolve($data['vaccine_id'] ?? null, $data['other_vaccine_name'] ?? null);
        }

        // Changing the date or vaccine without a new next due date recalculates it
        if (! array_key_exists('next_due_date', $data) && (isset($data['administered_at']) || isset($data['vaccine']))) {
            $data['next_due_date'] = HealthLog::defaultNextDue(
                $data['vaccine'] ?? $log->vaccine,
                $data['administered_at'] ?? $log->administered_at
            )->toDateString();
        }

        $log->fill($data);
        $changes = $log->getDirty();
        $log->save();
        $log->animal->refreshVaccinated();

        if ($changes) {
            Audit::record($request, 'vaccination.updated', $log, ['animal_id' => $log->animal_id, 'vaccine' => $log->vaccine, 'changes' => $changes]);
        }

        return new VaccinationResource($log->load('animal'));
    }

    public function destroy(Request $request, HealthLog $log): JsonResponse
    {
        $animal = $log->animal;
        $details = ['animal_id' => $log->animal_id, 'vaccine' => $log->vaccine];
        $log->delete();
        $animal->refreshVaccinated();

        Audit::record($request, 'vaccination.deleted', $log, $details);

        return response()->json(['message' => 'Vaccination record deleted.']);
    }
}

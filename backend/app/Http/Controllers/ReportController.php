<?php

namespace App\Http\Controllers;

use App\Http\Resources\AnimalResource;
use App\Http\Resources\ApplicationResource;
use App\Http\Resources\StaffMissingPetResource;
use App\Http\Resources\VaccinationResource;
use App\Models\AdoptionApplication;
use App\Models\Animal;
use App\Models\AuditLog;
use App\Models\HealthLog;
use App\Models\MissingPetReport;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// The data behind the tabs of the staff Reports page. Each report checks its own permission, so a role
// cannot read another tab's data by calling the API directly:
//   animals       reports.view
//   adoptions     reports.adoption       (or reports.all)
//   missing-pets  reports.missingPets    (or reports.all)
//   vaccinations  reports.vaccinations   (or reports.all)
//   health        reports.health         (or reports.all)
class ReportController extends Controller
{
    private const LIMIT = 1000;

    private function allow(Request $request, string $permission, bool $orAll = true): void
    {
        $user = $request->user();

        abort_unless(
            $user->hasPermission($permission) || ($orAll && $user->hasPermission('reports.all')),
            403,
            'You do not have permission to do this.'
        );
    }

    public function animals(Request $request)
    {
        $this->allow($request, 'reports.view', orAll: false);

        return AnimalResource::collection(Animal::with('photos')->orderByDesc('id')->limit(self::LIMIT)->get());
    }

    public function adoptions(Request $request)
    {
        $this->allow($request, 'reports.adoption');

        return ApplicationResource::collection(
            AdoptionApplication::with(['animal.photos', 'reviewer'])->latest('id')->limit(self::LIMIT)->get()
        );
    }

    public function missingPets(Request $request)
    {
        $this->allow($request, 'reports.missingPets');

        return StaffMissingPetResource::collection(
            MissingPetReport::with(['photos', 'reporter'])->latest('id')->limit(self::LIMIT)->get()
        );
    }

    public function vaccinations(Request $request)
    {
        $this->allow($request, 'reports.vaccinations');

        return VaccinationResource::collection(
            HealthLog::with(['animal:id,name,animal_code,species,breed', 'recorder:id,name', 'vaccineType:id,name'])
                ->orderByDesc('administered_at')->orderByDesc('id')->limit(2000)->get()
        );
    }

    // Every animal with its health status, since when it has had it, and how many vaccines are recorded.
    // "Since": the last time the health status was changed (the audit log), else the day it was rescued.
    public function health(Request $request): JsonResponse
    {
        $this->allow($request, 'reports.health');

        $changedAt = AuditLog::where('entity_type', 'Animal')
            ->where('action', 'animal.updated')
            ->whereNotNull('details->to->health_status')
            ->selectRaw('entity_id, MAX(created_at) as changed_at')
            ->groupBy('entity_id')
            ->pluck('changed_at', 'entity_id');

        $today = now()->startOfDay();

        $animals = Animal::withCount('healthLogs')->orderByDesc('id')->limit(self::LIMIT)->get()
            ->map(function (Animal $animal) use ($changedAt, $today) {
                $since = Carbon::parse($changedAt[$animal->id] ?? $animal->rescued_at ?? $animal->created_at)->startOfDay();

                return [
                    'id' => $animal->id,
                    'code' => $animal->animal_code,
                    'name' => $animal->name,
                    'type' => $animal->species,
                    'otherSpecies' => $animal->other_species,
                    'status' => $animal->status,
                    'healthStatus' => $animal->health_status,
                    'since' => $since->toDateString(),
                    'daysInStatus' => max(0, $since->diffInDays($today)),
                    'vaccineCount' => $animal->health_logs_count,
                ];
            })
            ->values();

        return response()->json(['data' => $animals]);
    }
}

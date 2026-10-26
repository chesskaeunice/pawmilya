<?php

namespace App\Http\Controllers;

use App\Models\Vaccine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

// The vaccines to choose from in the vaccination form
class VaccineController extends Controller
{
    // Optional ?species=Dog|Cat limits the list to the vaccines that fit (those for that species and for All)
    public function index(Request $request): JsonResponse
    {
        $request->validate(['species' => ['nullable', Rule::in(['Dog', 'Cat', 'Other'])]]);

        $vaccines = Vaccine::active()
            ->when($request->query('species'), fn ($q, $species) => $q->forSpecies($species))
            ->orderByRaw("CASE species WHEN 'All' THEN 0 WHEN 'Dog' THEN 1 ELSE 2 END")
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $vaccines->map(fn (Vaccine $v) => [
            'id' => $v->id,
            'name' => $v->name,
            'species' => $v->species,
            // days until the next dose when no due date is typed (for the form's preview)
            'intervalDays' => config("vaccines.intervals.{$v->name}", config('vaccines.default_interval_days')),
        ])->values()]);
    }
}

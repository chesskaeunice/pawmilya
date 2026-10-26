<?php

namespace App\Http\Controllers;

use App\Http\Requests\MissingPet\StoreClaimRequest;
use App\Models\Animal;
use App\Models\MissingPetReport;
use App\Models\PetClaim;
use App\Support\Audit;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

// Owners claim a Rescued pet during its 7-day claim period; pound staff approve or reject.
// Contact details and proof images are never part of a public endpoint.
class PetClaimController extends Controller
{
    /* ---------- citizen ---------- */

    public function store(StoreClaimRequest $request, MissingPetReport $report): JsonResponse
    {
        $user = $request->user();
        $paths = [];

        try {
            $claim = DB::transaction(function () use ($request, $report, $user, &$paths) {
                $claim = new PetClaim($request->safe()->only(['contact_name', 'contact_number', 'contact_email', 'pickup_date']));
                $claim->missing_pet_report_id = $report->id;
                $claim->claimant_id = $user->id;
                $claim->save();

                // proof of ownership: private disk, outside the public folder
                foreach ($request->file('proof_images') as $position => $file) {
                    $path = $file->store("pet-claims/{$report->id}/{$user->id}", 'local');
                    $paths[] = $path;
                    $claim->photos()->create(['path' => $path, 'position' => $position]);
                }

                return $claim;
            });
        } catch (UniqueConstraintViolationException) {
            // two submits at the same moment: the database keeps only one live claim
            Storage::disk('local')->delete($paths);

            throw ValidationException::withMessages(['report' => [StoreClaimRequest::DUPLICATE_MESSAGE]]);
        }

        Audit::record($request, 'claim.submitted', $claim, ['report_id' => $report->id]);

        return response()->json(['data' => $this->mineRow($claim->refresh()->load('report.photos'))], 201);
    }

    // The citizen's own claims, newest first (status and the reject reason)
    public function mine(Request $request): JsonResponse
    {
        $claims = PetClaim::with('report.photos')->where('claimant_id', $request->user()->id)->latest('id')->get();

        return response()->json(['data' => $claims->map(fn (PetClaim $claim) => $this->mineRow($claim))->values()]);
    }

    /* ---------- staff ---------- */

    // Claimants' contact details and proof images (signed links that expire): staff only
    public function index(MissingPetReport $report): JsonResponse
    {
        return response()->json(['data' => $this->staffRows($report)]);
    }

    public function approve(Request $request, MissingPetReport $report, PetClaim $claim): JsonResponse
    {
        abort_unless($claim->missing_pet_report_id === $report->id, 404);

        DB::transaction(function () use ($request, $report, $claim) {
            // lock the rows, so a double click or two staff members cannot approve twice
            $lockedReport = MissingPetReport::whereKey($report->id)->lockForUpdate()->firstOrFail();
            $current = PetClaim::whereKey($claim->id)->lockForUpdate()->firstOrFail();
            $animal = $lockedReport->animal_id ? Animal::whereKey($lockedReport->animal_id)->lockForUpdate()->first() : null;

            $this->ensurePending($current);

            if (! in_array($lockedReport->status, ['Rescued', 'For Adoption'], true)) {
                throw ValidationException::withMessages(['status' => ['This report is no longer open for claims.']]);
            }

            $this->decide($current, PetClaim::APPROVED, $request, null);

            $from = $lockedReport->status;
            $lockedReport->forceFill(['status' => 'Reunited'])->save();

            if ($animal) {
                $animal->forceFill(['status' => 'Reunited with Owner'])->save();
            }

            // everybody else waiting for the same pet is rejected
            $others = PetClaim::where('missing_pet_report_id', $lockedReport->id)
                ->where('id', '!=', $current->id)
                ->where('status', PetClaim::PENDING)
                ->lockForUpdate()
                ->get();

            foreach ($others as $other) {
                $this->decide($other, PetClaim::REJECTED, $request, 'Another claim for this pet was approved.');
            }

            Audit::record($request, 'claim.approved', $current, [
                'report_id' => $lockedReport->id,
                'animal_id' => $animal?->id,
                'auto_rejected' => $others->pluck('id')->all(),
            ]);
            Audit::record($request, 'missing_pet.status_changed', $lockedReport, ['from' => $from, 'to' => 'Reunited', 'by' => 'claim']);
        });

        return response()->json(['data' => $this->staffRows($report)]);
    }

    public function reject(Request $request, MissingPetReport $report, PetClaim $claim): JsonResponse
    {
        abort_unless($claim->missing_pet_report_id === $report->id, 404);

        $data = $request->validate(['reason' => ['nullable', 'string', 'max:1000']]);

        DB::transaction(function () use ($request, $report, $claim, $data) {
            $current = PetClaim::whereKey($claim->id)->lockForUpdate()->firstOrFail();

            $this->ensurePending($current);
            $this->decide($current, PetClaim::REJECTED, $request, $data['reason'] ?? null);

            Audit::record($request, 'claim.rejected', $current, ['report_id' => $report->id, 'reason' => $data['reason'] ?? null]);
        });

        return response()->json(['data' => $this->staffRows($report)]);
    }

    /* ---------- private files (signed, expiring links) ---------- */

    public function file(PetClaim $claim, int $index): StreamedResponse
    {
        $path = $claim->photos()->skip($index)->first()?->path;

        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }

    /* ---------- helpers ---------- */

    private function ensurePending(PetClaim $claim): void
    {
        if ($claim->status !== PetClaim::PENDING) {
            throw ValidationException::withMessages(['status' => ["This claim was already {$claim->status}."]]);
        }
    }

    private function decide(PetClaim $claim, string $status, Request $request, ?string $reason): void
    {
        $claim->forceFill([
            'status' => $status,
            'reject_reason' => $reason,
            'decided_by' => $request->user()->id,
            'decided_at' => now(),
        ])->save();
    }

    private function mineRow(PetClaim $claim): array
    {
        $report = $claim->report;

        return [
            'id' => $claim->id,
            'reportId' => $report->id,
            'petName' => $report->name,
            'petType' => $report->typeLabel(),
            'petImage' => $report->photos->where('kind', 'pet')->first()?->url(),
            'status' => $claim->status,
            'pickupDate' => $claim->pickup_date->toDateString(),
            'rejectReason' => $claim->reject_reason,
            'submittedAt' => $claim->created_at->toIso8601String(),
        ];
    }

    private function staffRows(MissingPetReport $report): array
    {
        return PetClaim::with(['photos', 'claimant', 'decider'])
            ->where('missing_pet_report_id', $report->id)
            ->latest('id')
            ->get()
            ->map(fn (PetClaim $claim) => [
                'id' => $claim->id,
                'status' => $claim->status,
                'contactName' => $claim->contact_name,
                'contactNumber' => $claim->contact_number,
                'contactEmail' => $claim->contact_email,
                'pickupDate' => $claim->pickup_date->toDateString(),
                'submittedAt' => $claim->created_at->toIso8601String(),
                'rejectReason' => $claim->reject_reason,
                'decidedBy' => $claim->decider?->name,
                'decidedAt' => $claim->decided_at?->toIso8601String(),
                // private files: links expire after 30 minutes
                'proofImages' => $claim->photos->values()->map(fn ($photo, $index) => URL::temporarySignedRoute(
                    'claim.file',
                    now()->addMinutes(30),
                    ['claim' => $claim->id, 'index' => $index]
                ))->all(),
            ])->values()->all();
    }
}

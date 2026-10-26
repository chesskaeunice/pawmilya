<?php

namespace App\Support;

use App\Models\Animal;
use App\Models\MissingPetReport;
use App\Models\PetClaim;
use Illuminate\Support\Facades\DB;

// After the 7-day claim period a Rescued report becomes "For Adoption" (done by the system). The pet
// then waits in the vet's clearance queue; it stays Rescued and is not adoptable yet.
// When the vet sets its health status to Cleared, the animal becomes Available for Adoption
// (promoteAnimal, called inside the same transaction as the health update).
// A report with a Pending claim is never released (see PetClaimController).
// Safe to run any number of times, also at the same time: rows are locked and re-checked.
class ReleaseUnclaimedReports
{
    // Releases every Rescued report whose claim deadline has passed. Returns how many it changed.
    public function run(): int
    {
        // cheap check first: this runs at the start of the missing pet lists
        if (! $this->dueQuery()->exists()) {
            return 0;
        }

        $changed = 0;

        foreach ($this->dueQuery()->pluck('id') as $id) {
            if ($this->release($id)) {
                $changed++;
            }
        }

        return $changed;
    }

    // Makes one report For Adoption if it is due (locked, re-checked)
    public function release(int $reportId): bool
    {
        return DB::transaction(function () use ($reportId) {
            $report = MissingPetReport::whereKey($reportId)->lockForUpdate()->first();

            if (! $report || $report->status !== 'Rescued' || ! $report->claim_deadline_at || $report->claim_deadline_at->isFuture()) {
                return false;
            }

            // a claim is waiting for a decision: it resumes only if every claim ends up Rejected
            if ($report->claims()->where('status', PetClaim::PENDING)->exists()) {
                return false;
            }

            $report->status = 'For Adoption';
            $report->save();

            Audit::system('missing_pet.status_changed', $report, ['from' => 'Rescued', 'to' => 'For Adoption', 'reason' => 'claim period ended']);

            return true;
        }) === true;
    }

    // Available for Adoption when the report is For Adoption (claim period over) and the animal is
    // Rescued + Cleared. Also releases the report first if its deadline has just passed (no scheduler).
    public function promoteAnimal(Animal $animal): bool
    {
        $report = $animal->missingPetReport()->first();

        if (! $report) {
            return false; // not from a report: the normal rules apply
        }

        if ($report->status === 'Rescued') {
            $this->release($report->id);
            $report->refresh();
        }

        if ($report->status !== 'For Adoption') {
            return false;
        }

        return DB::transaction(function () use ($animal) {
            $locked = Animal::whereKey($animal->id)->lockForUpdate()->first();

            if (! $locked || $locked->status !== 'Rescued' || $locked->health_status !== Animal::CLEARED) {
                return false;
            }

            $locked->status = Animal::ADOPTABLE;
            $locked->save();

            Audit::system('animal.status_changed', $locked, [
                'from' => 'Rescued',
                'to' => Animal::ADOPTABLE,
                'reason' => 'vet cleared the pet after the claim period',
            ]);

            return true;
        });
    }

    private function dueQuery()
    {
        return MissingPetReport::query()
            ->where('status', 'Rescued')
            ->whereNotNull('claim_deadline_at')
            ->where('claim_deadline_at', '<=', now())
            ->whereDoesntHave('claims', fn ($claims) => $claims->where('status', PetClaim::PENDING));
    }
}

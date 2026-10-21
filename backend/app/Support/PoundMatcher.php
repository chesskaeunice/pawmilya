<?php

namespace App\Support;

use App\Models\Animal;
use App\Models\MissingPetReport;
use Illuminate\Support\Collection;

// Compares a missing pet report with the animals still in the pound, so staff can spot a possible match.
class PoundMatcher
{
    // Animals that left the pound (adopted or returned to the owner) are not candidates
    private const IN_POUND = ['Rescued', 'Available for Adoption', 'Pending Adoption'];

    // Breeds that say nothing about identity
    private const GENERIC_BREEDS = ['mixed breed', 'mixed', 'unknown', 'other / unknown', 'other', ''];

    private const FILLER_WORDS = ['and', 'with', 'the', 'a', 'of', 'color', 'colour'];

    /** @return Collection<int, array{animal: Animal, score: int, strong: bool, reasons: array<int, string>}> */
    public function matchesFor(MissingPetReport $report, int $limit = 10): Collection
    {
        $candidates = Animal::with('photos')
            ->whereIn('status', self::IN_POUND)
            ->where('species', $report->species)
            ->get();

        return $candidates
            ->map(fn (Animal $animal) => $this->score($report, $animal))
            ->filter(fn ($match) => $match['strong'])   // sex and dates alone say too little
            ->sortByDesc('score')
            ->take($limit)
            ->values();
    }

    private function score(MissingPetReport $report, Animal $animal): array
    {
        $score = 0;
        $reasons = [];
        $strong = false; // a name, breed or color match

        if ($report->name && $animal->name && mb_strtolower(trim($report->name)) === mb_strtolower(trim($animal->name))) {
            $score += 4;
            $strong = true;
            $reasons[] = 'Same name';
        }

        $reportBreed = mb_strtolower(trim((string) $report->breed));
        $animalBreed = mb_strtolower(trim((string) $animal->breed));

        if (! in_array($reportBreed, self::GENERIC_BREEDS, true) && ! in_array($animalBreed, self::GENERIC_BREEDS, true)
            && ($reportBreed === $animalBreed || str_contains($animalBreed, $reportBreed) || str_contains($reportBreed, $animalBreed))) {
            $score += 3;
            $strong = true;
            $reasons[] = 'Similar breed';
        }

        if (array_intersect($this->words($report->color), $this->words($animal->color))) {
            $score += 2;
            $strong = true;
            $reasons[] = 'Matching color';
        }

        if ($report->sex !== 'Unknown' && $report->sex === $animal->sex) {
            $score += 1;
            $reasons[] = 'Same sex';
        }

        // Rescued shortly after the pet was last seen
        if ($animal->rescued_at && $animal->rescued_at->between($report->last_seen_at->copy()->startOfDay(), $report->last_seen_at->copy()->addDays(14))) {
            $score += 1;
            $reasons[] = 'Rescued soon after it was last seen';
        }

        return ['animal' => $animal, 'score' => $score, 'strong' => $strong, 'reasons' => $reasons];
    }

    /** @return array<int, string> */
    private function words(?string $text): array
    {
        $words = preg_split('/[^a-z]+/', mb_strtolower((string) $text), -1, PREG_SPLIT_NO_EMPTY);

        return array_values(array_diff($words, self::FILLER_WORDS));
    }
}

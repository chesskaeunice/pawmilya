<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicAnimalResource;
use App\Models\Animal;
use Illuminate\Http\JsonResponse;
use App\Support\PublicCache;
use App\Support\SiteContent;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

// Guests and citizens: only animals "Available for Adoption", never health_status.
class PublicAnimalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Cached for 60 s; staff edits clear it (PublicCache::bump)
        return PublicCache::json($request, fn () => $this->listing($request));
    }

    private function listing(Request $request): array
    {
        $query = Animal::adoptable()->with('photos');

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('breed', 'like', "%{$search}%")
                    ->orWhere('species', 'like', "%{$search}%");
            });
        }

        $query->when($request->query('type'), fn ($q, $v) => $q->where('species', $v))
            ->when($request->query('breed'), fn ($q, $v) => $q->where('breed', $v))
            ->when($request->query('sex'), fn ($q, $v) => $q->where('sex', $v));

        if ($range = Animal::AGE_GROUPS[$request->query('age')] ?? null) {
            [$min, $max] = $range;
            $query->where('age_months', '>=', $min)
                ->when($max !== null, fn ($q) => $q->where('age_months', '<=', $max));
        }

        $perPage = min(max((int) $request->query('per_page', 6), 1), 50);
        $page = $query->orderByDesc('rescued_at')->orderByDesc('id')->paginate($perPage);

        return [
            'data' => PublicAnimalResource::collection($page->items())->resolve(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
            // Breed choices for the filter dropdown
            'breeds' => Animal::adoptable()->whereNotNull('breed')->distinct()->orderBy('breed')->pluck('breed')->all(),
        ];
    }

    public function show(int $id): PublicAnimalResource
    {
        return new PublicAnimalResource(Animal::adoptable()->with('photos')->findOrFail($id));
    }

    // Page opened by scanning an animal's QR code: pet info plus owner info when known
    public function stray(string $token): JsonResponse
    {
        $animal = Animal::with('photos')->where('qr_token', $token)->firstOrFail();

        return response()->json([
            // no age on the scan page
            'data' => array_merge(Arr::except((new PublicAnimalResource($animal))->resolve(), ['ageLabel']), [
                'color' => $animal->color,
                'owner' => $animal->owner_name || $animal->owner_contact
                    ? ['name' => $animal->owner_name, 'contact' => $animal->owner_contact]
                    : null,
            ]),
            // Pound details for "contact the pound" on the scan page
            'pound' => array_intersect_key(SiteContent::publicPayload()['pound'], array_flip(['name', 'phone', 'address'])),
        ])->header('Cache-Control', 'no-store, private'); // read fresh on every scan
    }
}

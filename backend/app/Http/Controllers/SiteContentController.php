<?php

namespace App\Http\Controllers;

use App\Support\Audit;
use App\Support\PublicCache;
use App\Support\SiteContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteContentController extends Controller
{
    // Public: no login, cached for a minute (the cache is cleared whenever staff save)
    public function publicInfo(Request $request): JsonResponse
    {
        return PublicCache::json($request, fn () => ['data' => SiteContent::publicPayload()]);
    }

    /* ---------- staff (settings.system) ---------- */

    public function show(): JsonResponse
    {
        return response()->json(['data' => SiteContent::editorPayload()]);
    }

    // Text fields only; images have their own endpoints
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pound.name' => ['nullable', 'string', 'max:120'],
            'pound.address' => ['nullable', 'string', 'max:255'],
            'pound.phone' => ['nullable', 'string', 'max:40'],
            'pound.email' => ['nullable', 'email', 'max:255'],
            'pound.hours' => ['nullable', 'string', 'max:255'],
            'pound.map_link' => ['nullable', 'url:http,https', 'max:500'],
            'donation.caption' => ['nullable', 'string', 'max:255'],
            'about.headline' => ['nullable', 'string', 'max:200'],
            'about.vision' => ['nullable', 'string', 'max:1000'],
            'about.mission' => ['nullable', 'string', 'max:1000'],
            'about.goals' => ['nullable', 'array', 'max:10'],
            'about.goals.*' => ['nullable', 'string', 'max:255'],
            'in_kind' => ['nullable', 'array', 'max:6'],
            'in_kind.*.title' => ['required', 'string', 'max:100'],
            'in_kind.*.items' => ['nullable', 'array', 'max:30'],
            'in_kind.*.items.*' => ['nullable', 'string', 'max:120'],
        ]);

        $content = SiteContent::all();

        // Only validated text keys are taken, so image paths can never be set from the request
        foreach (['pound', 'donation', 'about'] as $section) {
            foreach ($data[$section] ?? [] as $field => $value) {
                $content[$section][$field] = is_array($value) ? array_values($value) : (string) $value;
            }
        }
        if (array_key_exists('in_kind', $data)) {
            $content['in_kind'] = array_map(
                fn ($g) => ['title' => $g['title'], 'items' => array_values($g['items'] ?? [])],
                $data['in_kind'] ?? []
            );
        }

        SiteContent::save($content);
        Audit::record($request, 'site.updated');

        return $this->show();
    }

    // jpg/png/webp, max 5 MB, stored on the public disk (no image processing: gd is not installed)
    public function uploadImage(Request $request, string $slot): JsonResponse
    {
        abort_unless(array_key_exists($slot, SiteContent::IMAGE_SLOTS), 404);

        $request->validate(['image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120']]);

        $content = SiteContent::all();
        $old = SiteContent::imagePath($content, $slot);

        $path = $request->file('image')->store('site', 'public');
        SiteContent::save(SiteContent::withImage($content, $slot, $path));

        if ($old) {
            Storage::disk('public')->delete($old);
        }
        Audit::record($request, 'site.image_uploaded', null, ['slot' => $slot]);

        return $this->show();
    }

    public function deleteImage(Request $request, string $slot): JsonResponse
    {
        abort_unless(array_key_exists($slot, SiteContent::IMAGE_SLOTS), 404);

        $content = SiteContent::all();
        if ($old = SiteContent::imagePath($content, $slot)) {
            Storage::disk('public')->delete($old);
        }
        SiteContent::save(SiteContent::withImage($content, $slot, null));
        Audit::record($request, 'site.image_removed', null, ['slot' => $slot]);

        return $this->show();
    }
}

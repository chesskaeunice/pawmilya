<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

// Public site content (pound info, donation, about, in-kind wishlist) kept in one setting.
class SiteContent
{
    public const KEY = 'site.content';

    // Image slots staff can upload: slot => [section, index]
    public const IMAGE_SLOTS = ['donation_qr' => ['donation', 'qr'], 'about_1' => ['about', 0], 'about_2' => ['about', 1]];

    // Stored values win over the defaults, even when empty (an emptied field stays hidden)
    public static function all(): array
    {
        $stored = Setting::get(self::KEY, []);
        $merged = [];

        foreach (config('site') as $section => $defaults) {
            $merged[$section] = array_key_exists($section, $stored) ? $stored[$section] : $defaults;
        }

        return $merged;
    }

    public static function save(array $content): void
    {
        Setting::updateOrCreate(['key' => self::KEY], ['value' => $content]);
    }

    public static function imagePath(array $content, string $slot): ?string
    {
        [$section, $index] = self::IMAGE_SLOTS[$slot];

        return $content[$section][$index] ?? null;
    }

    public static function withImage(array $content, string $slot, ?string $path): array
    {
        [$section, $index] = self::IMAGE_SLOTS[$slot];
        $content[$section][$index] = $path;

        return $content;
    }

    // What visitors get: empty strings and empty lists are removed so the pages can hide them
    public static function publicPayload(): array
    {
        $c = self::all();
        $url = fn (?string $path) => $path ? Storage::disk('public')->url($path) : null;
        $filled = fn (array $list) => array_values(array_filter(array_map('trim', $list), 'strlen'));

        return [
            'pound' => array_map(fn ($v) => trim((string) $v), $c['pound']),
            'donation' => ['caption' => trim((string) $c['donation']['caption']), 'qr' => $url($c['donation']['qr'])],
            'about' => [
                'headline' => trim((string) $c['about']['headline']),
                'vision' => trim((string) $c['about']['vision']),
                'mission' => trim((string) $c['about']['mission']),
                'goals' => $filled($c['about']['goals']),
                'images' => array_values(array_filter(array_map($url, $c['about']['images']))),
            ],
            'inKind' => array_values(array_filter(array_map(
                fn ($group) => ['title' => trim($group['title']), 'items' => $filled($group['items'] ?? [])],
                $c['in_kind']
            ), fn ($group) => $group['title'] !== '' && $group['items'])),
        ];
    }

    // Editing view for staff: raw text plus image URLs
    public static function editorPayload(): array
    {
        $c = self::all();
        $url = fn (?string $path) => $path ? Storage::disk('public')->url($path) : null;

        $c['donation']['qr'] = $url($c['donation']['qr']);
        $c['about']['images'] = array_map($url, $c['about']['images']);

        return $c;
    }
}

<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

// Short cache for public list endpoints. Any change to animals, missing reports or settings
// bumps the version (see AppServiceProvider), so staff edits show up immediately.
class PublicCache
{
    private const VERSION_KEY = 'public-cache-version';

    public static function json(Request $request, callable $build, int $seconds = 60): JsonResponse
    {
        $key = 'public:'.Cache::get(self::VERSION_KEY, 1).':'.sha1($request->fullUrl());

        return response()->json(Cache::remember($key, $seconds, $build));
    }

    public static function bump(): void
    {
        Cache::forever(self::VERSION_KEY, (int) Cache::get(self::VERSION_KEY, 1) + 1);
    }
}

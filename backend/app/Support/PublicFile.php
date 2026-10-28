<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class PublicFile
{
    public static function url(string $path, string $disk = 'public'): string
    {
        $path = ltrim($path, '/');

        if ($disk === 's3') {
            $baseUrl = rtrim(
                (string) config('filesystems.disks.s3.url'),
                '/'
            );

            if ($baseUrl !== '') {
                return $baseUrl.'/'.implode(
                    '/',
                    array_map('rawurlencode', explode('/', $path))
                );
            }

            return Storage::disk('s3')->url($path);
        }

        return asset('storage/'.$path);
    }
}

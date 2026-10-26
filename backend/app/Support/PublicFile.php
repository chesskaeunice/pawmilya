<?php

namespace App\Support;

// Absolute URL of a file on the public disk (storage/app/public), the way the browser reaches it:
// <backend>/storage/<path>, served through the public/storage link (`php artisan storage:link`).
//
// asset() builds the address from the request that is being answered, so the photo URL always
// has the same host and port the frontend used to call the API, even when APP_URL is missing or
// different. (Storage::url() would use the fixed APP_URL instead.)
class PublicFile
{
    public static function url(string $path): string
    {
        return asset('storage/'.ltrim($path, '/'));
    }
}

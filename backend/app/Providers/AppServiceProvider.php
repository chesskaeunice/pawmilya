<?php

namespace App\Providers;

use App\Models\Animal;
use App\Models\AnimalPhoto;
use App\Models\MissingPetPhoto;
use App\Models\MissingPetReport;
use App\Models\Setting;
use App\Support\PublicCache;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('register', fn (Request $request) => Limit::perHour(5)->by($request->ip()));
        RateLimiter::for('email-otp', fn (Request $request) => Limit::perMinute(10)->by($request->ip()));
        RateLimiter::for('password-reset', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));

        // Staff changes clear the short public cache right away
        foreach ([Animal::class, AnimalPhoto::class, MissingPetReport::class, MissingPetPhoto::class, Setting::class] as $model) {
            $model::saved(fn () => PublicCache::bump());
            $model::deleted(fn () => PublicCache::bump());
        }

        // The reset email links to the React page, not to a Laravel route
        ResetPassword::createUrlUsing(fn ($user, string $token) => rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/')
            .'/reset-password?token='.$token.'&email='.urlencode($user->getEmailForPasswordReset()));
    }
}

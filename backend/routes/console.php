<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Rescued reports whose 7-day claim period ended become "For Adoption" (also done on the missing pet lists)
Schedule::command('reports:release-unclaimed')->hourly();

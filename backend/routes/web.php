<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Development only: see the emails in the browser, e.g. /dev/mail-preview/verify-otp
// (names: verify-otp, reset-password, report-submitted)
if (app()->environment('local')) {
    Route::get('/dev/mail-preview/{name}', function (string $name) {
        $samples = [
            'verify-otp' => ['emails.verify-otp', ['name' => 'Maria Santos', 'code' => '482913', 'minutes' => 10]],
            'reset-password' => ['emails.reset-password', ['name' => 'Maria Santos', 'url' => rtrim(config('app.frontend_url'), '/').'/reset-password?token=sample&email=maria%40email.com', 'minutes' => 60]],
            'report-submitted' => ['emails.report-submitted', ['details' => [
                'petName' => 'Bruno',
                'rows' => [
                    'Report number' => 'MPR-012', 'Pet name' => 'Bruno', 'Type' => 'Dog / Aspin', 'Color' => 'Brown',
                    'Markings' => 'White patch on the chest', 'Date last seen' => 'October 18, 2026',
                    'Last known location' => 'Katipunan Avenue, Quezon City', 'Additional details' => 'Wears a red collar.',
                    'Contact name' => 'Liza Ramos', 'Contact number' => '0919 555 0166', 'Contact email' => 'liza@email.com', 'Photos attached' => 3,
                ],
            ]]],
        ];

        abort_unless(isset($samples[$name]), 404);
        [$view, $data] = $samples[$name];

        return view($view, $data + ['previewing' => true]);
    });
}

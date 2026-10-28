<?php

namespace App\Support;

use Illuminate\Contracts\Mail\Mailable;
use Illuminate\Support\Facades\Mail;
use Throwable;

// Sends an email after the response has gone out. A mail server problem is only logged:
// the request that asked for the email never fails because of it.
class SafeMail
{
    public static function send(string $to, Mailable $mailable): void
    {
        $sent = false; // the app can run its terminating callbacks again in tests: send only once

        app()->terminating(function () use ($to, $mailable, &$sent) {
            if ($sent) {
                return;
            }
            $sent = true;

            try {
                Mail::to($to)->send($mailable);
            } catch (Throwable $e) {
                report($e);
            }
        });
    }
}

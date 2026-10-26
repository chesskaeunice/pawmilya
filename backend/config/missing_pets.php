<?php

// Numbers for the "Report a Missing Pet" form, in one place.
return [

    // Logged-in citizens can file at most this many reports inside the rolling window.
    // Guests (emergencies) and staff accounts are not limited.
    'user_report_limit' => 3,
    'window_hours' => 24,

];

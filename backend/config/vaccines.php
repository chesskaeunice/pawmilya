<?php

// When no next due date is given, it is the date given plus this many days.
return [
    'default_interval_days' => 365,

    'intervals' => [
        'Bordetella' => 180,
        'Canine Influenza' => 365,
        'Leptospirosis' => 365,
    ],

    // A record is "Due Soon" when its next due date is within this many days
    'due_soon_days' => 30,
];

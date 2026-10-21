<?php

// Default public site content. Staff edit all of it in Settings (stored in the settings table);
// these values are used only until the first save. An empty value hides that line on the site.
return [

    'pound' => [
        'name' => 'Pawmilya Animal Pound',
        'address' => 'Animal Pound Compound, Katipunan Avenue, Quezon City, Metro Manila',
        'phone' => '(02) 8123 4567',
        'email' => 'hello@pawmilya.ph',
        'hours' => 'Mon-Sat, 8:00 AM - 5:00 PM',
        'map_link' => '',
    ],

    'donation' => [
        'caption' => 'Scan to support our rescued pets',
        'qr' => null, // uploaded image path (public disk)
    ],

    'about' => [
        'headline' => 'Every pet deserves a safe place to call home.',
        'vision' => 'A community where no pet is left without care, and every animal can find a loving family.',
        'mission' => 'To connect adopters, pet owners and the animal pound through one simple platform for adoption, lost-and-found reports and pet education.',
        'goals' => [
            'Make it easy for families to find and adopt pets in need of a home.',
            'Help lost pets and their owners find each other quickly.',
            'Share clear, trustworthy guides on responsible pet care.',
            'Support the local animal pound with simple, organized records.',
        ],
        'images' => [null, null], // uploaded image paths (public disk)
    ],

    'in_kind' => [
        ['title' => 'Cats & Dogs Wishlist', 'items' => [
            'Dog food', 'Cat food', 'Crates and carriers', 'Pee pads', 'Chew toys',
            'Scratching posts', 'Leashes, harnesses and collars', 'Vitamins or medicines',
        ]],
        ['title' => 'Shelter Wishlist', 'items' => [
            'Detergent and bleach', 'Dishwashing soap', 'Towels and blankets', 'Garbage bags',
            'Toilet paper', 'Old newspapers', 'Mops and brooms',
        ]],
    ],

];

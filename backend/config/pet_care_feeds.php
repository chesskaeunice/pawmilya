<?php

// RSS feeds used by Pet Care Corner (GET /api/pet-care-articles).
// Each feed was fetched and checked: direct article links, recent items.
// A feed that stops working is simply skipped; add or remove entries freely.
return [
    'feeds' => [
        ['source' => 'ASPCA', 'url' => 'https://www.aspca.org/rss.xml'],
        ['source' => 'Catster', 'url' => 'https://www.catster.com/feed/'],
        ['source' => 'iHeartDogs', 'url' => 'https://iheartdogs.com/feed/'],
        ['source' => 'Vetstreet', 'url' => 'https://www.vetstreet.com/rss'],
        ['source' => 'Cats.com', 'url' => 'https://cats.com/feed'],
    ],

    'limit' => 12,
    'excerpt_length' => 160,
    'timeout' => 8,
];

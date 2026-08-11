<?php

declare(strict_types=1);

return [
    'db' => [
        'host' => 'hamilton-weather.911emerge-n-see.com',
        'port' => 3306,
        'database' => 'hamilton_weather',
        'username' => 'hamilton_weather',
        'password' => 'hamilton_weather#1',
        'charset' => 'utf8mb4',
    ],

    'tomorrow' => [
        'api_key' => 'lSBzGNNimvqQBqZxqqAHXe0zOajoa8Ai',
        'base_url' => 'https://api.tomorrow.io/v4/map/tile',
        'format' => 'png',
        'timeout_seconds' => 15,
        'layers' => [
            'precipitation' => 'precipitationIntensity',
            'clouds' => 'cloudCover',
        ],
    ],

    'cache' => [
        'root_dir' => __DIR__ . '/cache',
        'tmp_dir' => __DIR__ . '/tmp',
        'fresh_seconds' => 360,
        'stale_if_error_seconds' => 1800,
        'lock_timeout_seconds' => 30,
    ],

    'hamilton' => [
    'center' => [35.153, -85.214],
    'zoom' => 10,
    'bounds' => [
        'min_lat' => 34.82,
        'min_lng' => -86.10,
        'max_lat' => 35.72,
        'max_lng' => -84.10,
    ],
    'max_tile_count_warning' => 25,
],
];

<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

$tiles = array_values(build_hamilton_allowed_tiles($config));

send_json([
    'hamilton' => [
        'center' => $config['hamilton']['center'],
        'zoom' => $config['hamilton']['zoom'],
        'bounds' => $config['hamilton']['bounds'],
        'tile_count' => count($tiles),
        'max_tile_count_warning' => $config['hamilton']['max_tile_count_warning'],
        'tiles' => $tiles,
    ],
    'layers' => array_keys($config['tomorrow']['layers']),
    'cache' => [
        'fresh_seconds' => $config['cache']['fresh_seconds'],
        'stale_if_error_seconds' => $config['cache']['stale_if_error_seconds'],
    ],
]);

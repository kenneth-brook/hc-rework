<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';
require_once __DIR__ . '/lib/tiles.php';
require_once __DIR__ . '/lib/tomorrow.php';
require_once __DIR__ . '/lib/response.php';

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'ok' => true,
    'loaded' => [
        'config' => is_array($config),
        'tiles' => function_exists('build_hamilton_allowed_tiles'),
        'tomorrow' => function_exists('fetch_tomorrow_tile'),
        'response' => function_exists('send_json'),
    ],
]);
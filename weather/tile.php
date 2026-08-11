<?php

declare(strict_types=1);

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

$config = require __DIR__ . '/config.php';

require_once __DIR__ . '/lib/tiles.php';
require_once __DIR__ . '/lib/tomorrow.php';
require_once __DIR__ . '/lib/response.php';

$layer = $_GET['layer'] ?? '';
$z = isset($_GET['z']) ? (int) $_GET['z'] : -1;
$x = isset($_GET['x']) ? (int) $_GET['x'] : -1;
$y = isset($_GET['y']) ? (int) $_GET['y'] : -1;

if (!isset($config['tomorrow']['layers'][$layer])) {
    send_json(['error' => 'Unsupported layer.'], 400);
}

$allowedTiles = build_hamilton_allowed_tiles($config);

if (!isset($allowedTiles[tile_key($z, $x, $y)])) {
    send_json([
        'error' => 'Tile is outside the allowed Hamilton footprint.',
        'requested' => compact('z', 'x', 'y')
    ], 403);
}

try {
    $tile = fetch_tomorrow_tile($config, $layer, $z, $x, $y);

    header('Content-Type: ' . $tile['content_type']);
    header('Cache-Control: no-cache, no-store, must-revalidate');
    echo $tile['body'];
    exit;
} catch (Throwable $e) {
    header('Content-Type: application/json; charset=utf-8', true, 502);
    echo json_encode([
        'error' => 'Upstream fetch failed',
        'message' => $e->getMessage(),
        'type' => get_class($e),
    ], JSON_PRETTY_PRINT);
    exit;
}
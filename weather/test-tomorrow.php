<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';
require_once __DIR__ . '/lib/tomorrow.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $tile = fetch_tomorrow_tile($config, 'precipitation', 8, 67, 100);

    echo json_encode([
        'ok' => true,
        'status' => $tile['status'],
        'content_type' => $tile['content_type'],
        'bytes' => strlen($tile['body']),
    ], JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    echo json_encode([
        'ok' => false,
        'type' => get_class($e),
        'message' => $e->getMessage(),
    ], JSON_PRETTY_PRINT);
}
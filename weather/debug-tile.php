<?php

declare(strict_types=1);

$log = __DIR__ . '/debug.log';

function dbg(string $msg): void
{
    global $log;
    file_put_contents($log, date('c') . ' ' . $msg . PHP_EOL, FILE_APPEND);
}

register_shutdown_function(function () {
    $err = error_get_last();
    if ($err) {
        dbg('SHUTDOWN ERROR: ' . json_encode($err));
    } else {
        dbg('SHUTDOWN: clean');
    }
});

dbg('START');

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

dbg('BEFORE CONFIG');
$config = require __DIR__ . '/config.php';
dbg('AFTER CONFIG');

dbg('BEFORE TOMORROW INCLUDE');
require_once __DIR__ . '/lib/tomorrow.php';
dbg('AFTER TOMORROW INCLUDE');

dbg('BEFORE FETCH');

try {
    $tile = fetch_tomorrow_tile($config, 'precipitation', 8, 67, 100);
    dbg('AFTER FETCH');
    dbg('CONTENT TYPE: ' . ($tile['content_type'] ?? 'none'));
    dbg('BODY BYTES: ' . strlen($tile['body'] ?? ''));

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => true,
        'content_type' => $tile['content_type'] ?? null,
        'bytes' => strlen($tile['body'] ?? ''),
    ], JSON_PRETTY_PRINT);
    exit;
} catch (Throwable $e) {
    dbg('CATCH: ' . get_class($e) . ' ' . $e->getMessage());
    header('Content-Type: application/json; charset=utf-8', true, 500);
    echo json_encode([
        'ok' => false,
        'type' => get_class($e),
        'message' => $e->getMessage(),
    ], JSON_PRETTY_PRINT);
    exit;
}
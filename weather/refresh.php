<?php

declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

$layer = isset($_GET['layer']) ? strtolower(trim((string) $_GET['layer'])) : null;
$layers = $layer ? [$layer] : array_keys($config['tomorrow']['layers']);
$tiles = array_values(build_hamilton_allowed_tiles($config));

$results = [];
$pdo = db_connect($config);

foreach ($layers as $currentLayer) {
    if (!validate_layer($config, $currentLayer)) {
        $results[] = ['layer' => $currentLayer, 'status' => 'skipped', 'reason' => 'invalid'];
        continue;
    }

    foreach ($tiles as $tile) {
        try {
            $fresh = fetch_tomorrow_tile($config, $currentLayer, $tile['z'], $tile['x'], $tile['y']);
            $filePath = build_cache_file_path($config, $currentLayer, $tile['z'], $tile['x'], $tile['y']);
            ensure_parent_dir($filePath);
            file_put_contents($filePath, $fresh['body']);

            $fetchedAt = $fresh['fetched_at'];
            $expiresAt = $fetchedAt->modify('+' . (int) $config['cache']['fresh_seconds'] . ' seconds');

            db_upsert_tile(
                $pdo,
                $currentLayer,
                $tile['z'],
                $tile['x'],
                $tile['y'],
                $filePath,
                $fetchedAt,
                $expiresAt,
                $fresh['status'],
                filesize($filePath)
            );

            $results[] = ['layer' => $currentLayer, 'tile' => $tile, 'status' => 'ok'];
        } catch (Throwable $e) {
            $results[] = ['layer' => $currentLayer, 'tile' => $tile, 'status' => 'error', 'detail' => $e->getMessage()];
        }
    }
}

send_json(['results' => $results]);

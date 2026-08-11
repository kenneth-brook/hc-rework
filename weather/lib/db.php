<?php

declare(strict_types=1);

function db_connect(array $config): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $db = $config['db'];
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $db['host'],
        $db['port'],
        $db['database'],
        $db['charset']
    );

    $pdo = new PDO($dsn, $db['username'], $db['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function db_find_tile(PDO $pdo, string $layer, int $z, int $x, int $y): ?array
{
    $sql = 'SELECT layer, z, x, y, file_path, fetched_at, expires_at, upstream_status, file_size
            FROM weather_tile_cache
            WHERE layer = :layer AND z = :z AND x = :x AND y = :y
            LIMIT 1';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':layer' => $layer,
        ':z' => $z,
        ':x' => $x,
        ':y' => $y,
    ]);

    $row = $stmt->fetch();
    return $row ?: null;
}

function db_upsert_tile(PDO $pdo, string $layer, int $z, int $x, int $y, string $filePath, DateTimeImmutable $fetchedAt, DateTimeImmutable $expiresAt, int $status, int $fileSize): void
{
    $sql = 'INSERT INTO weather_tile_cache (layer, z, x, y, file_path, fetched_at, expires_at, upstream_status, file_size)
            VALUES (:layer, :z, :x, :y, :file_path, :fetched_at, :expires_at, :upstream_status, :file_size)
            ON DUPLICATE KEY UPDATE
                file_path = VALUES(file_path),
                fetched_at = VALUES(fetched_at),
                expires_at = VALUES(expires_at),
                upstream_status = VALUES(upstream_status),
                file_size = VALUES(file_size)';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':layer' => $layer,
        ':z' => $z,
        ':x' => $x,
        ':y' => $y,
        ':file_path' => $filePath,
        ':fetched_at' => $fetchedAt->format('Y-m-d H:i:s'),
        ':expires_at' => $expiresAt->format('Y-m-d H:i:s'),
        ':upstream_status' => $status,
        ':file_size' => $fileSize,
    ]);
}

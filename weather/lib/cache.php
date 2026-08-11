<?php

declare(strict_types=1);

function validate_layer(array $config, string $layer): bool
{
    return array_key_exists($layer, $config['tomorrow']['layers']);
}

function build_cache_file_path(array $config, string $layer, int $z, int $x, int $y): string
{
    return rtrim($config['cache']['root_dir'], '/') . '/' . $layer . '/' . $z . '/' . $x . '/' . $y . '.png';
}

function ensure_parent_dir(string $filePath): void
{
    $dir = dirname($filePath);
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        throw new RuntimeException('Failed to create cache directory: ' . $dir);
    }
}

function file_is_fresh(array $row): bool
{
    return strtotime($row['expires_at']) > time() && is_file($row['file_path']);
}

function file_is_servable_stale(array $config, array $row): bool
{
    if (!is_file($row['file_path'])) {
        return false;
    }

    $maxAge = strtotime($row['expires_at']) + (int) $config['cache']['stale_if_error_seconds'];
    return $maxAge > time();
}

function acquire_lock(array $config, string $layer, int $z, int $x, int $y)
{
    $lockDir = rtrim($config['cache']['tmp_dir'], '/');
    if (!is_dir($lockDir) && !mkdir($lockDir, 0775, true) && !is_dir($lockDir)) {
        throw new RuntimeException('Failed to create tmp directory: ' . $lockDir);
    }

    $lockPath = $lockDir . '/' . sprintf('%s_%d_%d_%d.lock', $layer, $z, $x, $y);

    if (is_file($lockPath)) {
        $age = time() - filemtime($lockPath);
        if ($age > (int) $config['cache']['lock_timeout_seconds']) {
            @unlink($lockPath);
        }
    }

    $handle = @fopen($lockPath, 'x');
    if ($handle === false) {
        return false;
    }

    fwrite($handle, (string) getmypid());
    fclose($handle);

    return $lockPath;
}

function release_lock($lock): void
{
    if (is_string($lock) && is_file($lock)) {
        @unlink($lock);
    }
}

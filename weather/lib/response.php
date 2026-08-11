<?php

declare(strict_types=1);

function send_png_file(string $filePath, int $maxAge = 60): void
{
    if (!is_file($filePath)) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Tile not found.';
        exit;
    }

    header('Content-Type: image/png');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: public, max-age=' . $maxAge . ', stale-while-revalidate=120, stale-if-error=1800');
    readfile($filePath);
    exit;
}

function send_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

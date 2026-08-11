<?php

declare(strict_types=1);

function fetch_tomorrow_tile(array $config, string $layer, int $z, int $x, int $y): array
{
    $apiKey = trim((string) $config['tomorrow']['api_key']);
    if ($apiKey === '') {
        throw new RuntimeException('Missing TOMORROW_API_KEY.');
    }

    $field = $config['tomorrow']['layers'][$layer] ?? null;
    if (!$field) {
        throw new InvalidArgumentException('Unsupported layer: ' . $layer);
    }

    $time = 'now';
    $format = $config['tomorrow']['format'];
    $url = sprintf(
        '%s/%d/%d/%d/%s/%s.%s?apikey=%s',
        rtrim($config['tomorrow']['base_url'], '/'),
        $z,
        $x,
        $y,
        rawurlencode($field),
        rawurlencode($time),
        rawurlencode($format),
        rawurlencode($apiKey)
    );

    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_USERAGENT => 'HamiltonWeatherCache/1.0',
        CURLOPT_HEADER => true,
        CURLOPT_FAILONERROR => false,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);

    error_log('Tomorrow tile request: ' . $url);

    $response = curl_exec($ch);

    if ($response === false) {
        $error = curl_error($ch);
        $errno = curl_errno($ch);
        curl_close($ch);
        throw new RuntimeException('Tomorrow.io request failed: [' . $errno . '] ' . $error);
    }

    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);

    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);

    error_log('Tomorrow tile success: ' . $status . ' ' . $contentType);

    curl_close($ch);

    if ($status !== 200) {
        throw new RuntimeException('Tomorrow.io returned HTTP ' . $status . '. Headers: ' . trim($headers));
    }

    if (stripos($contentType, 'image/') !== 0) {
        throw new RuntimeException('Unexpected content type from Tomorrow.io: ' . $contentType);
    }

    return [
        'body' => $body,
        'status' => $status,
        'content_type' => $contentType,
        'fetched_at' => new DateTimeImmutable('now', new DateTimeZone('UTC')),
    ];
}

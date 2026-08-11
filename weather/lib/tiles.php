<?php

declare(strict_types=1);

function lng_to_tile_x(float $lng, int $zoom): int
{
    return (int) floor((($lng + 180.0) / 360.0) * (2 ** $zoom));
}

function lat_to_tile_y(float $lat, int $zoom): int
{
    $latRad = deg2rad($lat);
    $n = 2 ** $zoom;

    return (int) floor(
        (1.0 - log(tan($latRad) + (1.0 / cos($latRad))) / M_PI) / 2.0 * $n
    );
}

function build_hamilton_allowed_tiles(array $config): array
{
    $bounds = $config['hamilton']['bounds'];
    $z = (int) $config['hamilton']['zoom'];

    $minX = lng_to_tile_x((float) $bounds['min_lng'], $z);
    $maxX = lng_to_tile_x((float) $bounds['max_lng'], $z);
    $minY = lat_to_tile_y((float) $bounds['max_lat'], $z);
    $maxY = lat_to_tile_y((float) $bounds['min_lat'], $z);

    $tiles = [];
    for ($x = $minX; $x <= $maxX; $x++) {
        for ($y = $minY; $y <= $maxY; $y++) {
            $tiles[tile_key($z, $x, $y)] = ['z' => $z, 'x' => $x, 'y' => $y];
        }
    }

    return $tiles;
}

function tile_key(int $z, int $x, int $y): string
{
    return $z . ':' . $x . ':' . $y;
}

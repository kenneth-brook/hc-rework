<?php

declare(strict_types=1);

$path = __DIR__ . '/tmp/test-tile.jpg';

while (ob_get_level()) {
    ob_end_clean();
}

@ini_set('zlib.output_compression', 'Off');
if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', '1');
}

header('Content-Type: image/jpeg');
header('Content-Length: ' . filesize($path));
readfile($path);
exit;
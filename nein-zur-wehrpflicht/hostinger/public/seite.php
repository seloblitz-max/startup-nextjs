<?php
declare(strict_types=1);

/*
 * Liefert Seiten, Seiten-Daten (.txt), Sitemap und Kalender aus und setzt dabei die Adresse der Website ein,
 * etwa für die Teilen-Vorschau. Beim Bauen steht dort ein Platzhalter, weil die Domain noch nicht feststeht.
 * Was es nicht gibt, bekommt die 404-Seite.
 */

require __DIR__ . '/_app/bootstrap.php';

const GZSA_TYPES = [
    'html' => 'text/html; charset=utf-8',
    'txt' => 'text/plain; charset=utf-8',
    'xml' => 'application/xml; charset=utf-8',
    'ics' => 'text/calendar; charset=utf-8',
];

/** Kalender-Zeilen nach dem Einsetzen der Adresse neu falten: höchstens 75 Bytes, nie mitten in einem Zeichen. */
function gzsa_fold_ics(string $ics): string
{
    $out = [];
    foreach (explode("\r\n", (string) preg_replace("/\r\n[ \t]/", '', $ics)) as $line) {
        $prefix = '';
        while (strlen($prefix . $line) > 75) {
            $cut = 75 - strlen($prefix);
            while ($cut > 0 && (ord($line[$cut]) & 0xc0) === 0x80) {
                $cut--;
            }
            $out[] = $prefix . substr($line, 0, $cut);
            $line = substr($line, $cut);
            $prefix = ' ';
        }
        $out[] = $prefix . $line;
    }
    return implode("\r\n", $out);
}

function gzsa_send(string $file, string $ext, int $status): void
{
    $body = str_replace(gzsa_data()['placeholder'], gzsa_origin(), (string) file_get_contents($file));
    if ($ext === 'ics') {
        $body = gzsa_fold_ics($body);
    }
    $etag = '"' . substr(md5($body), 0, 20) . '"';

    http_response_code($status);
    gzsa_security_headers();
    header('Content-Type: ' . GZSA_TYPES[$ext]);
    if ($ext === 'html' && gzsa_tls()) {
        header('Strict-Transport-Security: max-age=31536000');
    }
    if ($ext === 'ics') {
        header('Content-Disposition: attachment; filename="protest-' . basename($file, '.ics') . '.ics"');
    }
    // Nie im Server-Cache: Die Adresse hängt vom Aufruf ab. Der Browser fragt kurz nach und bekommt meist 304.
    // no-transform bittet ein CDN, die Seiten nicht umzuschreiben (etwa zu minifizieren): React erwartet sie genau so.
    header('X-LiteSpeed-Cache-Control: no-cache');
    if ($status !== 200) {
        header('Cache-Control: no-store, no-transform');
    } else {
        header('Cache-Control: public, max-age=0, must-revalidate, no-transform');
        header('ETag: ' . $etag);
        if (gzsa_not_modified($etag)) {
            http_response_code(304);
            return;
        }
    }
    echo $body;
}

function gzsa_not_found(): void
{
    gzsa_send(GZSA_ROOT . '/404.html', 'html', 404);
}

$method = (string) ($_SERVER['REQUEST_METHOD'] ?? 'GET');
if ($method !== 'GET' && $method !== 'HEAD') {
    header('Allow: GET, HEAD');
    http_response_code(405);
    exit;
}

$uri = (string) ($_SERVER['REQUEST_URI'] ?? '/');
$q = strpos($uri, '?');
$rawPath = $q === false ? $uri : substr($uri, 0, $q);
$path = gzsa_request_path();

// Nur einfache Pfade: keine versteckten Dateien, kein „..“, keine leeren Abschnitte, nichts aus _app.
$segments = explode('/', $path);
$valid = $path !== '' && $path[0] === '/' && strpos($rawPath, '//') === false && strpbrk($path, "\\\0") === false;
foreach ($segments as $i => $segment) {
    if ($i === 0) {
        continue;
    }
    $last = $i === count($segments) - 1;
    if (($segment === '' && !$last) || ($segment !== '' && $segment[0] === '.') || ($i === 1 && $segment === '_app')) {
        $valid = false;
    }
}
if (!$valid) {
    gzsa_not_found();
    exit;
}

$rel = substr($path, 1);
if ($rel === '' || substr($rel, -1) === '/') {
    $rel .= 'index.html';
} elseif (is_dir(GZSA_ROOT . '/' . $rel)) {
    // Wie beim Bauen (trailingSlash): Ordner immer mit Schrägstrich am Ende.
    header('Location: ' . $rawPath . '/' . ($q === false ? '' : substr($uri, $q)), true, 301);
    exit;
}
$ext = strtolower(pathinfo($rel, PATHINFO_EXTENSION));
$file = GZSA_ROOT . '/' . $rel;
if (!array_key_exists($ext, GZSA_TYPES) || !is_file($file)) {
    gzsa_not_found();
    exit;
}
gzsa_send($file, $ext, 200);

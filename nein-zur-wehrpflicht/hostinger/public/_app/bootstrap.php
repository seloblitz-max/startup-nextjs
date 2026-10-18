<?php
declare(strict_types=1);

/*
 * Gemeinsamer Teil von api.php und seite.php. Läuft ab PHP 7.4.
 * Dieser Ordner ist von außen gesperrt (siehe .htaccess hier und im Hauptordner).
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

define('GZSA_ROOT', dirname(__DIR__));

/** Einstellungen aus config.php mit Standardwerten. */
function gzsa_config(): array
{
    static $config = null;
    if ($config === null) {
        $defaults = [
            'site_url' => '',
            'data_dir' => '',
            'mysql' => ['host' => 'localhost', 'database' => '', 'user' => '', 'password' => '', 'port' => ''],
            'max_new_devices_per_day' => 150,
            'max_votes_per_minute' => 40,
            'ip_header' => '',
            'contact_to' => '',
            'contact_from' => '',
            'smtp' => ['host' => '', 'port' => 465, 'user' => '', 'password' => ''],
        ];
        $file = __DIR__ . '/config.php';
        $user = is_file($file) ? (include $file) : [];
        $config = array_replace_recursive($defaults, is_array($user) ? $user : []);
    }
    return $config;
}

/** Städte, Löschtermin und Platzhalter aus dem Bau der Seite (data.php wird von scripts/hostinger-paket.mjs erzeugt). */
function gzsa_data(): array
{
    static $data = null;
    if ($data === null) {
        $data = include __DIR__ . '/data.php';
    }
    return $data;
}

function gzsa_is_city($city): bool
{
    return is_string($city) && in_array($city, gzsa_data()['cities'], true);
}

/** Löschtermin der Zusagen in Sekunden. */
function gzsa_delete_at(): int
{
    return intdiv((int) gzsa_data()['delete_at'], 1000);
}

/** Echte HTTPS-Verbindung zu diesem Server. */
function gzsa_tls(): bool
{
    $https = strtolower((string) ($_SERVER['HTTPS'] ?? ''));
    return ($https !== '' && $https !== 'off') || (string) ($_SERVER['SERVER_PORT'] ?? '') === '443';
}

/** HTTPS, auch wenn ein Proxy oder CDN davor die Verschlüsselung übernimmt. */
function gzsa_https(): bool
{
    if (gzsa_tls()) {
        return true;
    }
    if (strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https') {
        return true;
    }
    if (strpos((string) ($_SERVER['HTTP_CF_VISITOR'] ?? ''), '"https"') !== false) {
        return true;
    }
    return strtolower((string) ($_SERVER['REQUEST_SCHEME'] ?? '')) === 'https';
}

/** Adresse der Website ohne Schrägstrich am Ende, etwa https://beispiel.de */
function gzsa_origin(): string
{
    // Nur eine schlichte Adresse wie https://beispiel.de, sie landet unverändert in Seiten und Skripten.
    $fixed = rtrim(trim((string) gzsa_config()['site_url']), '/');
    if (preg_match('#^https?://[a-z0-9.-]+(:\d{1,5})?\z#i', $fixed)) {
        return strtolower($fixed);
    }
    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    if (!preg_match('/^[a-z0-9.-]+(:\d{1,5})?\z/', $host)) {
        $host = strtolower((string) ($_SERVER['SERVER_NAME'] ?? ''));
        if (!preg_match('/^[a-z0-9.-]+\z/', $host)) {
            $host = 'localhost';
        }
    }
    $https = gzsa_https();
    $host = preg_replace($https ? '/:443\z/' : '/:80\z/', '', $host);
    return ($https ? 'https://' : 'http://') . $host;
}

/** Pfad der Anfrage ohne Query, dekodiert. */
function gzsa_request_path(): string
{
    $uri = (string) ($_SERVER['REQUEST_URI'] ?? '/');
    $q = strpos($uri, '?');
    return rawurldecode($q === false ? $uri : substr($uri, 0, $q));
}

function gzsa_security_headers(): void
{
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('X-Frame-Options: DENY');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()');
}

/** Stimmt die ETag der Antwort mit der im Browser überein? Apache hängt beim Komprimieren -gzip an. */
function gzsa_not_modified(string $etag): bool
{
    $given = (string) ($_SERVER['HTTP_IF_NONE_MATCH'] ?? '');
    if ($given === '') {
        return false;
    }
    foreach (explode(',', $given) as $tag) {
        $tag = preg_replace('/^W\//', '', trim($tag));
        $tag = preg_replace('/-(gzip|br|deflate)"\z/', '"', $tag);
        if ($tag === $etag || $tag === '*') {
            return true;
        }
    }
    return false;
}

function gzsa_json_encode($body, int $flags = 0): string
{
    return (string) json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | $flags);
}

/** JSON-Antwort. Persönliches und Fehler werden nie zwischengespeichert. */
function gzsa_json($body, int $status = 200, array $headers = []): void
{
    http_response_code($status);
    gzsa_security_headers();
    header('Content-Type: application/json; charset=utf-8');
    $headers += ['Cache-Control' => 'no-store', 'X-LiteSpeed-Cache-Control' => 'no-cache'];
    foreach ($headers as $name => $value) {
        header($name . ': ' . $value);
    }
    echo gzsa_json_encode($body);
}

<?php
declare(strict_types=1);

/*
 * Abstimmung im Datei-Paket. Gleiche Adressen und Antworten wie die Node-Fassung (src/app/api):
 *   GET    /api/counts  öffentlicher Zählerstand
 *   GET    /api/me      Zusage dieses Geräts
 *   POST   /api/vote    {"city": "berlin"} zusagen oder wechseln, {"withdraw": true} zurückziehen
 *   DELETE /api/vote    zurückziehen
 *   GET    /api/status  Prüfseite für die Einrichtung
 */

require __DIR__ . '/_app/bootstrap.php';
require __DIR__ . '/_app/device.php';
require __DIR__ . '/_app/store.php';

function gzsa_deny(string $error, int $status): void
{
    gzsa_json(['error' => $error], $status);
}

function gzsa_setup_missing(): void
{
    gzsa_json(['error' => 'setup', 'message' => 'Die Abstimmung ist noch nicht mit einer Datenbank verbunden.'], 503);
}

function gzsa_failed(Throwable $e, string $what): void
{
    if ($e instanceof GzsaSetupError) {
        gzsa_setup_missing();
        return;
    }
    error_log('gzsa ' . $what . ': ' . $e->getMessage());
    gzsa_deny('unavailable', 503);
}

/** Stimmen nur von dieser Seite aus, nicht von fremden Websites. */
function gzsa_foreign(): bool
{
    if (strtolower((string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '')) === 'cross-site') {
        return true;
    }
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin === '') {
        return false;
    }
    $url = parse_url($origin);
    if (!is_array($url) || empty($url['host']) || empty($url['scheme'])) {
        return true;
    }
    $port = isset($url['port']) ? (int) $url['port'] : null;
    $default = ['http' => 80, 'https' => 443][strtolower($url['scheme'])] ?? null;
    $host = strtolower($url['host']) . ($port !== null && $port !== $default ? ':' . $port : '');
    return $host !== strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
}

function gzsa_counts(): void
{
    try {
        $snap = GzsaStore::open()->snapshot();
    } catch (Throwable $e) {
        gzsa_failed($e, 'counts');
        return;
    }
    // Für alle gleich: Der Browser fragt jedes Mal nach, LiteSpeed beantwortet zwei Sekunden lang aus dem Cache.
    $json = gzsa_json_encode($snap);
    $etag = '"' . substr(md5($json), 0, 16) . '"';
    gzsa_security_headers();
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: public, max-age=0, must-revalidate');
    header('CDN-Cache-Control: public, max-age=2, stale-while-revalidate=8');
    header('ETag: ' . $etag);
    if (gzsa_not_modified($etag)) {
        header('X-LiteSpeed-Cache-Control: no-cache');
        http_response_code(304);
        return;
    }
    header('X-LiteSpeed-Cache-Control: public,max-age=2');
    echo $json;
}

/** Wofür hat dieses Gerät gestimmt? Ein neues Gerät bekommt hier noch keine Kennung, erst mit der ersten Zusage. */
function gzsa_me(): void
{
    if (!gzsa_presented_tokens()) {
        gzsa_personal(['mine' => null], null);
        return;
    }
    $device = null;
    try {
        $store = GzsaStore::open();
        $device = gzsa_known_device($store->secret());
        if ($device === null) {
            gzsa_personal(['mine' => null], null);
            return;
        }
        $mine = $store->mine($device['id']);
    } catch (Throwable $e) {
        if ($e instanceof GzsaSetupError) {
            gzsa_setup_missing();
            return;
        }
        error_log('gzsa me: ' . $e->getMessage());
        gzsa_personal(['mine' => null, 'error' => 'unavailable'], $device['token'] ?? null, 503);
        return;
    }
    gzsa_personal(['mine' => $mine], $device['token']);
}

/** Zusage für eine Stadt (oder Wechsel dorthin). Mit {"withdraw": true} wird sie zurückgezogen. */
function gzsa_vote(): void
{
    if (gzsa_foreign()) {
        gzsa_deny('forbidden', 403);
        return;
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        gzsa_withdraw();
        return;
    }
    $type = (string) ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
    if (stripos($type, 'application/json') === false) {
        gzsa_deny('bad_request', 415);
        return;
    }
    $text = (string) file_get_contents('php://input', false, null, 0, 201);
    if (strlen($text) > 200) {
        gzsa_deny('bad_request', 413);
        return;
    }
    $body = json_decode($text, true);
    if ($body === null) {
        gzsa_deny('bad_request', 400);
        return;
    }
    if (is_array($body) && ($body['withdraw'] ?? null) === true) {
        gzsa_withdraw();
        return;
    }
    $city = is_array($body) ? ($body['city'] ?? null) : null;
    if (!gzsa_is_city($city)) {
        gzsa_deny('unknown_city', 400);
        return;
    }

    try {
        $store = GzsaStore::open();
        $secret = $store->secret();
        $device = gzsa_resolve_device($secret);
        $result = $store->vote($device['id'], gzsa_network_hash($secret), $city);
    } catch (Throwable $e) {
        gzsa_failed($e, 'vote');
        return;
    }
    if (!$result['ok']) {
        // Ein neues Gerät ohne gezählte Zusage bekommt auch keine Kennung.
        gzsa_personal(['error' => $result['reason'], 'snapshot' => $result['snapshot']], $device['fresh'] ? null : $device['token'], 429);
        return;
    }
    gzsa_personal(['mine' => $result['mine'], 'previous' => $result['previous'], 'snapshot' => $result['snapshot']], $device['token']);
}

/** Zusage zurückziehen. */
function gzsa_withdraw(): void
{
    if (!gzsa_presented_tokens()) {
        gzsa_personal(['mine' => null, 'removed' => null], null);
        return;
    }
    try {
        $store = GzsaStore::open();
        $secret = $store->secret();
        $device = gzsa_known_device($secret);
        if ($device === null) {
            gzsa_personal(['mine' => null, 'removed' => null], null);
            return;
        }
        $result = $store->withdraw($device['id'], gzsa_network_hash($secret));
    } catch (Throwable $e) {
        gzsa_failed($e, 'withdraw');
        return;
    }
    if (!$result['ok']) {
        gzsa_personal(['error' => $result['reason'], 'snapshot' => $result['snapshot']], $device['token'], 429);
        return;
    }
    gzsa_personal(['mine' => null, 'removed' => $result['removed'], 'snapshot' => $result['snapshot']], $device['token']);
}

/** Prüfseite nach dem Hochladen: Läuft die Datenbank, fehlt etwas? Zeigt nur Zustände, keine Daten. */
function gzsa_status(): void
{
    $out = ['ok' => false, 'speicher' => null, 'zusagen' => null, 'hinweis' => ''];
    $tips = [];
    try {
        $store = GzsaStore::open();
        $store->secret();
        $snap = $store->snapshot();
        $out['ok'] = true;
        $out['speicher'] = $store->label();
        $out['zusagen'] = $snap['total'];
        if ($store->insideWebroot()) {
            $tips[] = 'Die Datenbank liegt im gesperrten Ordner _app/daten. Diesen Ordner beim Aktualisieren der Website nicht löschen.';
        }
    } catch (GzsaSetupError $e) {
        $tips[] = $e->getMessage();
    } catch (Throwable $e) {
        error_log('gzsa status: ' . $e->getMessage());
        $tips[] = GzsaStore::mysqlConfigured()
            ? 'Die MySQL-Datenbank antwortet nicht. Bitte Host, Datenbank, Benutzer und Passwort in _app/config.php prüfen.'
            : 'Die Datenbank antwortet gerade nicht. Bitte in ein paar Minuten noch einmal versuchen.';
    }
    if (!gzsa_https()) {
        $tips[] = 'Die Seite läuft noch ohne HTTPS. Bitte im hPanel unter Sicherheit → SSL das Zertifikat einrichten und „HTTPS erzwingen“ einschalten.';
    }
    $proxy = gzsa_proxy_hint();
    if ($proxy !== '') {
        $tips[] = $proxy;
    }
    if (PHP_VERSION_ID < 80100) {
        $tips[] = 'Hier läuft PHP ' . PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION . '. Empfohlen ist 8.1 oder neuer (hPanel → Erweitert → PHP-Konfiguration).';
    }
    $out['hinweis'] = $out['ok'] && !$tips ? 'Alles bereit. Die Abstimmung läuft.' : implode(' ', $tips);

    http_response_code($out['ok'] ? 200 : 503);
    gzsa_security_headers();
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-LiteSpeed-Cache-Control: no-cache');
    echo gzsa_json_encode($out, JSON_PRETTY_PRINT), "\n";
}

$routes = [
    'counts' => ['GET', 'HEAD'],
    'me' => ['GET', 'HEAD'],
    'vote' => ['POST', 'DELETE'],
    'status' => ['GET', 'HEAD'],
];
$method = (string) ($_SERVER['REQUEST_METHOD'] ?? 'GET');
if (!preg_match('#^/api/([a-z]+)/?\z#', gzsa_request_path(), $m) || !isset($routes[$m[1]])) {
    gzsa_json(['error' => 'not_found'], 404);
    exit;
}
if (!in_array($method, $routes[$m[1]], true)) {
    header('Allow: ' . implode(', ', $routes[$m[1]]));
    gzsa_json(['error' => 'method_not_allowed'], 405);
    exit;
}
switch ($m[1]) {
    case 'counts':
        gzsa_counts();
        break;
    case 'me':
        gzsa_me();
        break;
    case 'vote':
        gzsa_vote();
        break;
    default:
        gzsa_status();
}

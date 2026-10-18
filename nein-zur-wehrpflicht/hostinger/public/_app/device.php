<?php
declare(strict_types=1);

/*
 * Geräte-Kennung und Netz, genau wie in der Node-Fassung (src/lib/device.ts und src/lib/api.ts):
 * Kennung `<uuid>.<signatur>` im Cookie wp_device und im Browser-Speicher, Grenzwerte über einen gesalzenen
 * Hash des Netzes. IP-Adressen werden nie gespeichert.
 */

const GZSA_COOKIE = 'wp_device';
const GZSA_COOKIE_MAX_AGE = 60 * 60 * 24 * 120;

/** Cloudflare schickt die Adresse der Besucher*innen mit, aber nur Anfragen aus diesen Netzen glauben wir das. */
const GZSA_CLOUDFLARE = [
    '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18',
    '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17',
    '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
    '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32',
    '2a06:98c0::/29', '2c0f:f248::/32',
];

function gzsa_b64url(string $bytes): string
{
    return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
}

function gzsa_uuid(): string
{
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    $h = bin2hex($b);
    return substr($h, 0, 8) . '-' . substr($h, 8, 4) . '-' . substr($h, 12, 4) . '-' . substr($h, 16, 4) . '-' . substr($h, 20);
}

function gzsa_sign(string $secret, string $id): string
{
    return substr(gzsa_b64url(hash_hmac('sha256', $id, $secret, true)), 0, 32);
}

function gzsa_issue_token(string $secret): string
{
    $id = gzsa_uuid();
    return $id . '.' . gzsa_sign($secret, $id);
}

/** Geräte-ID, wenn das Token von uns signiert wurde. */
function gzsa_verify_token(string $secret, $token): ?string
{
    if (!is_string($token) || $token === '' || strlen($token) > 100) {
        return null;
    }
    $parts = explode('.', $token);
    $id = $parts[0];
    $sig = $parts[1] ?? '';
    if ($id === '' || $sig === '' || !preg_match('/^[0-9a-f-]{36}\z/', $id)) {
        return null;
    }
    return hash_equals(gzsa_sign($secret, $id), $sig) ? $id : null;
}

/** Kommt überhaupt eine Kennung mit? Dann lohnt es sich, die Datenbank zu öffnen. */
function gzsa_presented_tokens(): array
{
    $tokens = [];
    foreach ([$_COOKIE[GZSA_COOKIE] ?? null, $_SERVER['HTTP_X_DEVICE_TOKEN'] ?? null] as $t) {
        if (is_string($t) && $t !== '') {
            $tokens[] = $t;
        }
    }
    return $tokens;
}

/** Cookie zuerst, sonst das im Browser gespeicherte Token. */
function gzsa_known_device(string $secret): ?array
{
    foreach (gzsa_presented_tokens() as $token) {
        $id = gzsa_verify_token($secret, $token);
        if ($id !== null) {
            return ['id' => $id, 'token' => $token, 'fresh' => false];
        }
    }
    return null;
}

/** Wie gzsa_known_device, legt für ein neues Gerät aber eine Kennung an. Nur für die Zusage selbst. */
function gzsa_resolve_device(string $secret): array
{
    $known = gzsa_known_device($secret);
    if ($known !== null) {
        return $known;
    }
    $token = gzsa_issue_token($secret);
    return ['id' => (string) gzsa_verify_token($secret, $token), 'token' => $token, 'fresh' => true];
}

/** Der Cookie läuft zusammen mit den Einträgen in der Datenbank ab, nach dem Löschtermin nach einem Tag. */
function gzsa_cookie_max_age(): int
{
    $untilDelete = gzsa_delete_at() - time();
    return $untilDelete > 0 ? min(GZSA_COOKIE_MAX_AGE, $untilDelete) : 86400;
}

/**
 * Persönliche Antwort: nie zwischenspeichern. Mit Token kommt es als Cookie und im Body mit,
 * ohne Token wird im Browser nichts gespeichert.
 */
function gzsa_personal(array $body, ?string $token, int $status = 200): void
{
    if ($token !== null) {
        $body['deviceToken'] = $token;
        $age = gzsa_cookie_max_age();
        header(
            'Set-Cookie: ' . GZSA_COOKIE . '=' . $token
            . '; Path=/; Expires=' . gmdate('D, d M Y H:i:s', time() + $age) . ' GMT; Max-Age=' . $age
            . (gzsa_https() ? '; Secure' : '') . '; HttpOnly; SameSite=Lax',
            false
        );
    }
    gzsa_json($body, $status, ['Cache-Control' => 'private, no-store']);
}

function gzsa_ip_in(string $ip, string $cidr): bool
{
    [$net, $bits] = explode('/', $cidr);
    $a = @inet_pton($ip);
    $b = @inet_pton($net);
    if ($a === false || $b === false || strlen($a) !== strlen($b)) {
        return false;
    }
    $bits = (int) $bits;
    $full = intdiv($bits, 8);
    if (substr($a, 0, $full) !== substr($b, 0, $full)) {
        return false;
    }
    $rest = $bits % 8;
    if ($rest === 0) {
        return true;
    }
    $mask = (0xff << (8 - $rest)) & 0xff;
    return (ord($a[$full]) & $mask) === (ord($b[$full]) & $mask);
}

function gzsa_is_cloudflare(string $ip): bool
{
    foreach (GZSA_CLOUDFLARE as $cidr) {
        if (gzsa_ip_in($ip, $cidr)) {
            return true;
        }
    }
    return false;
}

/** Lokale oder private Adresse, etwa ein Proxy des Webhosters direkt vor PHP. */
function gzsa_is_internal(string $ip): bool
{
    return filter_var($ip, FILTER_VALIDATE_IP) !== false && !gzsa_is_public($ip);
}

function gzsa_is_public(string $ip): bool
{
    return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
}

/** Wert eines Request-Headers, etwa X-Real-IP (in PHP HTTP_X_REAL_IP). */
function gzsa_request_header(string $name): string
{
    return (string) ($_SERVER['HTTP_' . strtoupper(str_replace('-', '_', trim($name)))] ?? '');
}

/**
 * Adresse der Besucher*in aus einem weitergeleiteten Header, leer wenn keine gültige drinsteht. In einer Liste wie
 * X-Forwarded-For hängt jeder Proxy die Adresse an, von der die Anfrage kam. Darum zählt von rechts die erste
 * Adresse, die kein Proxy ist (intern oder Cloudflare). Was weiter links steht, kann jede*r selbst mitschicken.
 */
function gzsa_forwarded_ip(string $value): string
{
    $ips = [];
    foreach (explode(',', $value) as $part) {
        $ip = trim($part);
        // Manche Proxys hängen den Port an, etwa 203.0.113.5:4711 oder [2001:db8::5]:4711.
        if (preg_match('/^\[([0-9a-f:.]+)\](?::\d+)?\z/i', $ip, $m) || preg_match('/^(\d{1,3}(?:\.\d{1,3}){3}):\d+\z/', $ip, $m)) {
            $ip = $m[1];
        }
        if (filter_var($ip, FILTER_VALIDATE_IP) !== false) {
            $ips[] = $ip;
        }
    }
    foreach (array_reverse($ips) as $ip) {
        if (!gzsa_is_internal($ip) && !gzsa_is_cloudflare($ip)) {
            return $ip;
        }
    }
    // Nur Proxys oder Adressen aus dem eigenen Netz: dann die erste.
    return $ips[0] ?? '';
}

/**
 * Adresse der Besucher*in. Weitergeleitete Adressen zählen nur aus dem Header in config.php oder wenn die Anfrage
 * von Cloudflare oder einem internen Proxy kommt. Sonst könnte jedes Skript sich mit einem Header eine neue Adresse
 * geben. Beim Hostinger-CDN steht die Adresse der Besucher*in schon in REMOTE_ADDR.
 */
function gzsa_client_ip(): string
{
    $remote = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    $headers = [];
    $own = trim((string) gzsa_config()['ip_header']);
    if ($own !== '') {
        $headers[] = $own;
    }
    if (gzsa_is_cloudflare($remote)) {
        $headers[] = 'CF-Connecting-IP';
    } elseif (gzsa_is_internal($remote)) {
        array_push($headers, 'X-Forwarded-For', 'X-Real-IP');
    }
    foreach ($headers as $name) {
        $ip = gzsa_forwarded_ip(gzsa_request_header($name));
        if ($ip !== '') {
            return $ip;
        }
    }
    return $remote !== '' ? $remote : 'unknown';
}

/**
 * Hinweis für /api/status, wenn PHP hinter einem Proxy oder CDN nur dessen Adresse sieht. Das Hostinger-CDN schickt
 * die Adresse der Besucher*in in X-Real-IP und X-Forwarded-For mit, und der Server setzt sie schon als REMOTE_ADDR
 * ein. Dann stimmen beide überein, und es ist nichts zu tun.
 */
function gzsa_proxy_hint(): string
{
    $own = trim((string) gzsa_config()['ip_header']);
    if ($own !== '') {
        return gzsa_forwarded_ip(gzsa_request_header($own)) !== '' ? '' : 'In _app/config.php steht bei ip_header „'
            . $own . '“, aber diese Anfrage bringt dort keine Adresse mit. Bitte den Eintrag prüfen oder wieder leeren.';
    }
    $remote = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    if (!gzsa_is_public($remote) || gzsa_is_cloudflare($remote)) {
        return '';
    }
    $suggest = '';
    foreach (['X-Real-IP', 'X-Forwarded-For'] as $name) {
        $ip = gzsa_forwarded_ip(gzsa_request_header($name));
        if (!gzsa_is_public($ip)) {
            continue;
        }
        if (gzsa_network($ip) === gzsa_network($remote)) {
            return '';
        }
        if ($suggest === '') {
            $suggest = $name;
        }
    }
    return $suggest === '' ? '' : 'Diese Anfrage kam über einen Proxy oder ein CDN, und PHP sieht nur dessen Adresse. '
        . "Bitte in _app/config.php bei ip_header '" . $suggest . "' eintragen, sonst teilen sich alle Besucher*innen "
        . 'dieselben Grenzwerte.';
}

/**
 * Netz des Geräts: IPv4 als ganze Adresse, IPv6 als /64-Präfix.
 * Ein Anschluss bekommt bei IPv6 meist ein ganzes /64, einzelne Adressen daraus wechseln ständig.
 */
function gzsa_network(string $ip): string
{
    if (preg_match('/^(?:::ffff:)?(\d{1,3}(?:\.\d{1,3}){3})\z/i', $ip, $m)) {
        return $m[1];
    }
    if (strpos($ip, ':') === false) {
        return $ip;
    }
    $bytes = @inet_pton(explode('%', $ip)[0]);
    if ($bytes === false || strlen($bytes) !== 16) {
        return $ip;
    }
    $groups = array_slice(array_values(unpack('n8', $bytes)), 0, 4);
    return implode(':', array_map('dechex', $groups)) . '::/64';
}

/** Gesalzener Hash des Netzes, nur für die Grenzwerte. */
function gzsa_network_hash(string $secret): string
{
    return substr(gzsa_b64url(hash('sha256', $secret . '|' . gzsa_network(gzsa_client_ip()), true)), 0, 22);
}

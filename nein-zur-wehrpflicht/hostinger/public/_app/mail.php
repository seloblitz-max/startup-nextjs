<?php
declare(strict_types=1);

/*
 * Kontaktformular im Datei-Paket, wie src/lib/contact.ts und src/lib/smtp.ts in der Node-Fassung: dieselben
 * Prüfregeln, die Nachricht geht nur per E-Mail weiter und wird nie auf dem Server gespeichert.
 * Versand über PHP mail() (bei Hostinger ohne Einrichtung) oder, wenn in config.php eingetragen, über ein
 * E-Mail-Postfach (SMTP).
 */

final class GzsaMailError extends RuntimeException
{
}

/** Adresse, Grenzwerte und Anliegen aus dem Bau der Seite (src/lib/contact.ts, über data.php). */
function gzsa_contact(): array
{
    return gzsa_data()['contact'];
}

/** Empfänger: contact_to aus config.php, sonst die Adresse von der Website. */
function gzsa_contact_to(): string
{
    $to = trim((string) gzsa_config()['contact_to']);
    return gzsa_valid_address($to) ? $to : gzsa_contact()['email'];
}

/** Absender: contact_from aus config.php, das SMTP-Postfach oder website@<Domain der Seite>. */
function gzsa_contact_from(): string
{
    $config = gzsa_config();
    foreach ([$config['contact_from'], $config['smtp']['user']] as $from) {
        $from = trim((string) $from);
        if (gzsa_valid_address($from)) {
            return $from;
        }
    }
    $host = (string) parse_url(gzsa_origin(), PHP_URL_HOST);
    $host = preg_replace('/^www\./', '', $host);
    return 'website@' . ($host !== '' && strpos($host, '.') !== false ? $host : 'localhost.localdomain');
}

function gzsa_smtp_configured(): bool
{
    $smtp = gzsa_config()['smtp'];
    return trim((string) $smtp['host']) !== '' && trim((string) $smtp['user']) !== '' && (string) $smtp['password'] !== '';
}

/** Ob diese Seite überhaupt E-Mails verschicken kann (für /api/status). */
function gzsa_mail_available(): bool
{
    if (gzsa_smtp_configured()) {
        return true;
    }
    $disabled = array_map('trim', explode(',', strtolower((string) ini_get('disable_functions'))));
    return function_exists('mail') && !in_array('mail', $disabled, true);
}

/** Schlichte Adresse ohne Namen, sicher für Kopfzeilen und den Absender beim Versand. */
function gzsa_valid_address(string $address): bool
{
    return strlen($address) <= 200 && (bool) preg_match('/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\z/', $address);
}

/** Wie die Prüfung im Formular (EMAIL in src/lib/contact.ts). */
function gzsa_valid_email(string $email): bool
{
    $part = '[^\s@<>()",;:\\\\\[\]]';
    return (bool) preg_match('/^' . $part . '+@' . $part . '+\.' . $part . '{2,}\z/u', $email);
}

/** Zeichen zählen wie [...text].length in JavaScript (Unicode-Zeichen, nicht Bytes). */
function gzsa_text_length(string $text): int
{
    return (int) preg_match_all('/./us', $text);
}

/** Steuerzeichen raus, alles in eine Zeile. Kaputtes UTF-8 gilt als leer. */
function gzsa_one_line($value): string
{
    if (!is_string($value) || !preg_match('//u', $value)) {
        return '';
    }
    $value = preg_replace('/[\x00-\x1f\x7f]+/', ' ', $value);
    return trim((string) preg_replace('/\s+/u', ' ', $value));
}

/** Steuerzeichen raus, Zeilenumbrüche bleiben. */
function gzsa_multi_line($value): string
{
    if (!is_string($value) || !preg_match('//u', $value)) {
        return '';
    }
    $value = preg_replace('/\r\n?/', "\n", $value);
    return trim((string) preg_replace('/[\x00-\x08\x0b-\x1f\x7f]+/', '', $value));
}

/** Prüft die Angaben wie checkContact(): ['ok' => true, 'value' => …] oder ['ok' => false, 'field' => …]. */
function gzsa_contact_check(array $body): array
{
    $contact = gzsa_contact();
    $limits = $contact['limits'];
    $name = gzsa_one_line($body['name'] ?? '');
    $email = gzsa_one_line($body['email'] ?? '');
    $message = gzsa_multi_line($body['message'] ?? '');
    if ($name === '' || gzsa_text_length($name) > $limits['name']) {
        return ['ok' => false, 'field' => 'name'];
    }
    if (strlen($email) > $limits['email'] || !gzsa_valid_email($email)) {
        return ['ok' => false, 'field' => 'email'];
    }
    $length = gzsa_text_length($message);
    if ($length < $limits['minMessage'] || $length > $limits['message']) {
        return ['ok' => false, 'field' => 'message'];
    }
    if (($body['consent'] ?? null) !== true) {
        return ['ok' => false, 'field' => 'consent'];
    }
    $topic = $body['topic'] ?? null;
    if (!is_string($topic) || !isset($contact['topics'][$topic])) {
        $topic = $contact['default_topic'];
    }
    return ['ok' => true, 'value' => ['topic' => $topic, 'name' => $name, 'email' => $email, 'message' => $message]];
}

/** Ausgefülltes Honigtopf-Feld oder zu schnell abgeschickt: still annehmen, aber nichts senden. */
function gzsa_looks_automated(array $body): bool
{
    $trap = is_string($body['website'] ?? null) ? trim($body['website']) : '';
    $elapsed = $body['elapsed'] ?? 0;
    $elapsed = is_int($elapsed) || is_float($elapsed) ? $elapsed : 0;
    return $trap !== '' || $elapsed < gzsa_contact()['min_fill_ms'];
}

/** Kopfzeile mit Umlauten nach RFC 2047, in Stücken, die kein Zeichen zerteilen. */
function gzsa_mime_header(string $text): string
{
    if (preg_match('/^[\x20-\x7e]*\z/', $text)) {
        return $text;
    }
    $words = [];
    $chunk = '';
    foreach (preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [] as $char) {
        if (strlen($chunk . $char) > 45) {
            $words[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
            $chunk = '';
        }
        $chunk .= $char;
    }
    if ($chunk !== '') {
        $words[] = '=?UTF-8?B?' . base64_encode($chunk) . '?=';
    }
    return implode(' ', $words);
}

/** Name vor einer Adresse: Umlaute kodiert, Satzzeichen wie Komma in Anführungszeichen. */
function gzsa_display_name(string $name): string
{
    $name = str_replace(['"', '\\'], '', $name);
    if (preg_match('/^[\x20-\x7e]*\z/', $name) && preg_match('/[()<>\[\]:;@,.]/', $name)) {
        return '"' . $name . '"';
    }
    return gzsa_mime_header($name);
}

/** Betreff, Kopfzeilen und Text der E-Mail an Gen Z regelt. */
function gzsa_contact_mail(array $input, string $site): array
{
    $label = gzsa_contact()['topics'][$input['topic']] ?? 'Nachricht';
    $text = implode("\r\n", [
        'Neue Nachricht über das Kontaktformular auf ' . $site . '.',
        '',
        'Anliegen: ' . $label,
        'Name: ' . $input['name'],
        'E-Mail: ' . $input['email'],
        '',
        'Nachricht:',
        str_replace("\n", "\r\n", $input['message']),
        '',
        'Zum Antworten einfach auf diese E-Mail antworten.',
    ]);
    $from = gzsa_contact_from();
    return [
        'from' => $from,
        'to' => gzsa_contact_to(),
        'subject' => gzsa_mime_header('[' . $label . '] Nachricht von ' . $input['name']),
        'headers' => [
            'From' => gzsa_mime_header('Gen Z steht auf') . ' <' . $from . '>',
            'Reply-To' => gzsa_display_name($input['name']) . ' <' . $input['email'] . '>',
            'MIME-Version' => '1.0',
            'Content-Type' => 'text/plain; charset=utf-8',
            'Content-Transfer-Encoding' => 'base64',
        ],
        'body' => rtrim(chunk_split(base64_encode($text), 76, "\r\n")),
    ];
}

/** Schickt die Nachricht. Wirft bei jedem Fehler, damit das Formular auf die E-Mail-Adresse verweisen kann. */
function gzsa_send_contact(array $input, string $site): void
{
    $mail = gzsa_contact_mail($input, $site);
    if (gzsa_smtp_configured()) {
        gzsa_smtp_send($mail);
        return;
    }
    if (!gzsa_mail_available()) {
        throw new GzsaMailError('PHP mail() ist abgeschaltet');
    }
    $headers = '';
    foreach ($mail['headers'] as $name => $value) {
        $headers .= $name . ': ' . $value . "\r\n";
    }
    // Absender auch im Umschlag, das hilft gegen Spamfilter. Die Adresse ist geprüft (gzsa_valid_address).
    $params = gzsa_valid_address($mail['from']) ? '-f' . $mail['from'] : '';
    if (!mail($mail['to'], $mail['subject'], $mail['body'], rtrim($headers), $params)) {
        throw new GzsaMailError('PHP mail() hat die Nachricht nicht angenommen');
    }
}

/** Versand über ein Postfach: Port 465 verschlüsselt, sonst (meist 587) mit STARTTLS. */
function gzsa_smtp_send(array $mail): void
{
    $smtp = gzsa_config()['smtp'];
    $host = trim((string) $smtp['host']);
    $port = (int) $smtp['port'] > 0 ? (int) $smtp['port'] : 465;
    $timeout = 15;
    $context = stream_context_create(['ssl' => ['peer_name' => $host, 'verify_peer' => true, 'verify_peer_name' => true]]);
    $errno = 0;
    $error = '';
    $socket = @stream_socket_client(($port === 465 ? 'ssl://' : 'tcp://') . $host . ':' . $port, $errno, $error, $timeout, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        throw new GzsaMailError('SMTP-Verbindung: ' . $error . ' (' . $errno . ')');
    }
    stream_set_timeout($socket, $timeout);

    $reply = function (array $expect) use ($socket): int {
        do {
            $line = fgets($socket, 2048);
            if ($line === false) {
                throw new GzsaMailError('SMTP: keine Antwort');
            }
        } while (isset($line[3]) && $line[3] === '-');
        $code = (int) substr($line, 0, 3);
        if (!in_array($code, $expect, true)) {
            throw new GzsaMailError('SMTP: ' . trim($line));
        }
        return $code;
    };
    $command = function (string $line, array $expect) use ($socket, $reply): int {
        fwrite($socket, $line . "\r\n");
        return $reply($expect);
    };

    try {
        $me = 'gen-z-steht-auf';
        $reply([220]);
        $command('EHLO ' . $me, [250]);
        if ($port !== 465) {
            $command('STARTTLS', [220]);
            $method = STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
            if (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT')) {
                $method |= STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
            }
            if (stream_socket_enable_crypto($socket, true, $method) !== true) {
                throw new GzsaMailError('SMTP: STARTTLS fehlgeschlagen');
            }
            $command('EHLO ' . $me, [250]);
        }
        $command('AUTH PLAIN ' . base64_encode("\0" . trim((string) $smtp['user']) . "\0" . (string) $smtp['password']), [235]);
        $command('MAIL FROM:<' . $mail['from'] . '>', [250]);
        $command('RCPT TO:<' . $mail['to'] . '>', [250, 251]);
        $command('DATA', [354]);
        $domain = substr((string) strrchr($mail['from'], '@'), 1) ?: 'localhost';
        $lines = ['To: <' . $mail['to'] . '>', 'Subject: ' . $mail['subject'], 'Date: ' . date('r'), 'Message-ID: <' . gzsa_uuid() . '@' . $domain . '>'];
        foreach ($mail['headers'] as $name => $value) {
            $lines[] = $name . ': ' . $value;
        }
        $data = implode("\r\n", $lines) . "\r\n\r\n" . $mail['body'];
        // Zeilen mit Punkt am Anfang verdoppeln (SMTP), dann mit „.“ abschließen.
        $command(preg_replace('/^\./m', '..', $data) . "\r\n.", [250]);
        try {
            $command('QUIT', [221]);
        } catch (Throwable $e) {
            // Die Nachricht ist schon angenommen.
        }
    } finally {
        fclose($socket);
    }
}

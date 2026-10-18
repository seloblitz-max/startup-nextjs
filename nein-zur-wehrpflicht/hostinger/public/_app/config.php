<?php
/*
 * Einstellungen für die Abstimmung. Meist muss hier nichts geändert werden: Ohne Angaben speichert die Seite
 * die Zusagen in einer kleinen SQLite-Datenbank außerhalb von public_html.
 *
 * Diese Datei beim Aktualisieren der Website nicht überschreiben, wenn hier etwas eingetragen ist.
 */
return [
    // Feste Adresse der Website, etwa 'https://beispiel.de'. Leer lassen: Die Adresse kommt aus dem Aufruf.
    'site_url' => '',

    // Ordner für die SQLite-Datenbank. Leer lassen: automatisch im Home-Verzeichnis (Ordner gzsa-daten neben
    // „domains“ bzw. „public_html“), und wenn das nicht geht, in _app/daten.
    'data_dir' => '',

    // Nur nötig, wenn SQLite beim Webhoster fehlt: Zugangsdaten einer MySQL-Datenbank (hPanel → Datenbanken).
    'mysql' => [
        'host' => 'localhost',
        'database' => '',
        'user' => '',
        'password' => '',
    ],

    // Grenzwerte gegen Skripte, wie in der Datenschutzerklärung beschrieben.
    'max_new_devices_per_day' => 150,
    'max_votes_per_minute' => 40,

    // Nur hinter einem CDN oder Proxy, das die Adresse der Besucher*innen in einem eigenen Header mitschickt,
    // etwa 'X-Forwarded-For'. Cloudflare wird von selbst erkannt.
    'ip_header' => '',
];

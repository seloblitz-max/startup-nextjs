# Gen Z steht auf: Website bei Hostinger hochladen

`gen-z-steht-auf-hostinger.zip` ist die fertige Website. Die Seiten sind fertige Dateien. Nur die Abstimmung („Ich bin dabei“), der Klickzähler der Städte und das Kontaktformular laufen über PHP, mit einer kleinen Datenbank, die sich beim ersten Aufruf selbst einrichtet.

## In sechs Schritten online

1. **Eigene Domain oder Subdomain anlegen.** Im hPanel eine neue Website hinzufügen, etwa `beispiel.de` oder `protest.beispiel.de`. Nicht in den Ordner einer bestehenden Website entpacken, sonst wird sie überschrieben.
2. **PHP 8.1 oder neuer.** Unter *Erweitert → PHP-Konfiguration* prüfen. Meist ist das schon eingestellt.
3. **ZIP hochladen und entpacken.** Im *Dateimanager* in den Ordner `public_html` der neuen Website wechseln und Platzhalter wie `default.php` löschen. Die ZIP hochladen, per Rechtsklick direkt dort entpacken und die ZIP danach löschen. Jetzt liegen `index.html`, `api.php`, `seite.php` und die versteckte Datei `.htaccess` direkt in `public_html`.
4. **HTTPS einschalten.** Unter *Sicherheit → SSL* das Zertifikat einrichten und *HTTPS erzwingen* aktivieren. Das erst nach dem Entpacken machen, weil die ZIP eine eigene `.htaccess` mitbringt.
5. **Prüfen.** `https://deine-domain.de/api/status` öffnen. Dort muss `"ok": true` und „Alles bereit. Die Abstimmung läuft.“ stehen. Sonst steht dort, was fehlt.
6. **Einmal durchklicken.** Bei einer Stadt „Ich bin dabei“ tippen: Das Ticket öffnet sich, die Zahl steigt. Im Ticket „Zusage zurückziehen“: Die Zahl sinkt wieder. Dann unten im Kontaktformular eine Testnachricht abschicken und prüfen, ob sie im Postfach ankommt (auch im Spam-Ordner nachsehen).

## Gut zu wissen

- **Feste Adresse (empfohlen):** In `_app/config.php` bei `site_url` die Hauptadresse eintragen, etwa `'https://beispiel.de'`. Dann zeigen Teilen-Vorschau, Kalender und Sitemap immer auf diese Adresse, auch wenn jemand `www.` davor tippt. Ohne Eintrag nimmt die Seite die Adresse, unter der sie gerade aufgerufen wird.
- **Wo die Zusagen liegen:** in einer SQLite-Datei im Ordner `gzsa-daten` im Home-Verzeichnis (neben `domains`), also außerhalb von `public_html` und nie von außen erreichbar. Klappt das beim Webhoster nicht, nimmt die Seite den gesperrten Ordner `_app/daten`, und `/api/status` sagt Bescheid.
- **Falls SQLite fehlt:** Meldet `/api/status`, dass `pdo_sqlite` fehlt, die Erweiterung unter *PHP-Konfiguration → PHP-Erweiterungen* einschalten. Oder eine MySQL-Datenbank anlegen (*Datenbanken*) und Datenbank, Benutzer und Passwort im Dateimanager in `_app/config.php` eintragen.
- **Kontaktformular:** Die Nachrichten gehen per E-Mail an die Adresse, die auf der Website steht, und werden nicht gespeichert. Absender ist `website@` mit der Domain der Website. Besser ist ein echtes Postfach auf der Domain: im hPanel unter *E-Mails* anlegen und in `_app/config.php` bei `contact_from` eintragen. Kommen keine Nachrichten an, dort unter `smtp` das Postfach mit Passwort eintragen (`smtp.hostinger.com`, Port 465). Eine andere Empfänger-Adresse geht über `contact_to`. `/api/status` zeigt unter `kontaktformular`, wie die Seite sendet. Klappt der Versand nicht, bietet das Formular die fertige Nachricht als E-Mail an.
- **Löschtermin:** Am 14. November 2026 löschen sich die Einträge der Geräte von selbst, beim nächsten Aufruf der Seite. Die Zahlen pro Stadt bleiben stehen. Danach kann der Ordner `gzsa-daten` gelöscht werden.
- **Datenschutz:** Diese Fassung der Datenschutzerklärung nennt Hostinger als Hoster und Speicherort. Der Vertrag zur Auftragsverarbeitung ist bei Hostinger Teil der Nutzungsbedingungen.
- **Aktualisieren:** Eine neue ZIP genauso entpacken und alles überschreiben. Steht in `_app/config.php` etwas, die Datei vorher sichern und danach zurückspielen. Die Zusagen bleiben erhalten. Ist das Hostinger-CDN an, danach dort den Cache leeren, sonst zeigt es Bilder noch bis zu einen Tag in der alten Fassung.
- **Hostinger-CDN:** Das CDN (*Leistung → CDN*) darf an bleiben, die Abstimmung läuft auch damit. Ist dort bei den Optionen „Smart Image Optimization“ (Bildoptimierung) an, bitte ausschalten: Sie verkleinert Bilder für Handys, dann werden Themenbilder und Story-Bilder unscharf. Bei einem anderen CDN sagt `/api/status`, ob etwas fehlt.

## Für Entwickler*innen

Paket neu bauen: im Ordner `nein-zur-wehrpflicht` `npm run build:hostinger` ausführen. Das Ergebnis liegt in `paket/`.

- `hostinger/public/` kommt unverändert ins Paket: `.htaccess`, `api.php` (Abstimmung, Klickzähler und Kontaktformular mit denselben Antworten wie `src/app/api`), `seite.php` (setzt die Adresse in Seiten, Sitemap und Kalender ein) und `_app/` (Einstellungen, Speicher, Geräte-Kennung, E-Mail-Versand).
- `_app/data.php` entsteht beim Bauen aus `src/lib/cities.ts` und `src/lib/contact.ts` (Städte, Löschtermin, E-Mail-Adresse, Anliegen und Grenzwerte des Formulars).
- `scripts/hostinger-paket.mjs` rechnet die Bildgrößen als WebP vor, setzt die Events (JSON-LD) in die Startseite ein, prüft die Seiten-Daten auf den Platzhalter der Adresse und packt die ZIP.

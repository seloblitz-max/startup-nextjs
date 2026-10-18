# Gen Z steht auf, 31. Oktober

Website für den bundesweiten Protest der Generation Z am Samstag, 31. Oktober 2026, ab 14 Uhr in 21 Städten. „Unsere Zukunft liegt in unseren Händen.“ Jede Person sagt mit einem Tipp, wo sie dabei ist, und alle sehen live, wie viele kommen. Inhalte und Forderungen stammen aus den Papieren von Gen Z regelt (`public/dokumente/`).

## Was die Seite kann

- **Karte mit allen Städten.** Orange sind die fünf Städte, für die Gen Z regelt hauptverantwortlich ist (Inhalte, Organisation), weiß alle weiteren Städte auf der Plattform. Die Legende steht neben der Karte, auf dem Handy darunter. Antippen (oder per Tastatur auswählen) zeigt Treffpunkt, Uhrzeit und Zusagen.
- **Städteliste.** Die fünf eigenen Städte stehen immer oben, alle anderen darunter, sortiert nach Aufrufen. Suche nach Stadt oder Treffpunkt, auch ohne Umlaute.
- **Live-Abstimmung „Ich bin dabei“.** Ein Gerät, eine Zusage. Die Zahlen aktualisieren sich alle paar Sekunden und in allen offenen Tabs sofort.
- **Ticket nach der Zusage** mit Stadt, Treffpunkt und Nummer, dazu Story-Bild (1080 × 1920), WhatsApp, Link kopieren, Kalendereintrag (`/kalender/<stadt>.ics`), Route und die Telegram-Gruppe der Stadt. Die Zusage lässt sich wechseln oder zurückziehen.
- **Forderungen und Haltung** aus Positionspapier, Erklärung und Flyer: sechs Themen mit Bild, Überschrift, kurzer Erklärung und konkreter Forderung, dazu Werte, Grundsätze und Tipps für eine friedliche Demo.
- **Kontaktformular** für Mitmachen, fehlende Städte, Organisationen, Presse und Fragen. Die Nachricht geht per E-Mail weiter und wird nicht gespeichert.
- **Einladungslinks** pro Stadt (`/dabei/<stadt>`) mit eigenem Vorschaubild für WhatsApp, Instagram und Co.
- Fürs Handy gebaut, barrierearm (Tastatur, Screenreader, Kontraste nach WCAG AA) und mit weniger Bewegung, wenn das Gerät das so eingestellt hat.

## Inhalte ändern

- **Städte:** `src/lib/cities.ts`. Eine neue Stadt ist ein Eintrag mehr, Karte, Liste, Ticket, Einladungslink, Teilen-Bilder, Kalender und die PHP-Abstimmung kommen von selbst mit. `lead: true` macht eine Stadt orange und setzt sie nach oben. Bei `telegram` den Link zur Gruppe eintragen, sobald es ihn gibt.
- **Texte, Forderungen, Grundsätze, Social Media:** `src/lib/content.ts`. Social-Media-Links erscheinen erst, wenn eine Adresse eingetragen ist.
- **E-Mail-Adresse und Anliegen im Formular:** `src/lib/contact.ts`.
- **PDFs:** `public/dokumente/`, verlinkt in `DOCUMENTS` in `src/lib/content.ts`.

## Gestaltung

Nach dem Designguide von Gen Z regelt: Lexend (400, 700, 800, 900) für alles, BBH Bartle nur für die Signatur #GENZREGELT. Farben #212121 und #2A2A2A als Grund, Weiß für Text, ein Orange (#FF7302) für Schlagwörter und die wichtigsten Knöpfe, Schwarz nur für Sticker und Logo. Text auf Orange ist immer #212121, weil Weiß dort zu wenig Kontrast hat. Die Regeln stehen als Klassen in `src/app/globals.css`.

- **Logo:** das Eichhörnchen als Original-SVG in `src/img/logo.svg`, unverändert. Es wird nie nachgezeichnet, umgefärbt, verzerrt oder beschnitten. Auf orangem Grund liegt es in einem schwarzen Kreis wie auf den Stickern (`<Logo badge />`). Die App-Symbole (`src/app/icon.png`, `apple-icon.png`, `public/icon-*.png`) sind daraus erzeugt.
- **Fotos:** `src/img/foto-*.jpg`, zugeschnitten und schwarz-weiß, damit Orange die einzige Akzentfarbe bleibt. Ausnahme ist das Eichhörnchen auf der Fehlerseite. Text steht nie auf einem Foto.
- **Grafik:** das Megafon aus dem Kampagnen-Set (`src/img/megafon.svg`) neben „Schreib uns. Mach mit.“

## Eine Stimme pro Gerät

- Jedes Gerät bekommt mit der ersten Zusage eine zufällige, vom Server signierte Kennung (HMAC). Wer nur schaut, bekommt keinen Cookie, deshalb braucht die Seite kein Cookie-Banner. Die Kennung liegt in einem HttpOnly-Cookie und zusätzlich im Browser-Speicher. Fehlt eins von beiden, erkennt der Server das Gerät am anderen wieder. Gefälschte Kennungen werden verworfen.
- Zusagen, Wechseln und Zurückziehen laufen in Redis als Lua-Skript, also atomar. Ein Gerät zählt immer genau einmal, auch bei vielen gleichzeitigen Klicks.
- Schutz vor Skripten: höchstens `MAX_VOTES_PER_IP_MINUTE` Abstimmungen pro Anschluss und Minute (Standard 40) und `MAX_NEW_DEVICES_PER_IP` neue Geräte pro Anschluss und Tag (Standard 150, großzügig wegen Schulen, Unis und Mobilfunk). IPv6-Anschlüsse zählen pro /64-Netz. Gespeichert wird dafür nur ein gesalzener Hash mit kurzer Laufzeit, nie die IP-Adresse.
- Klickzähler für die Reihenfolge der Liste: Jede Stadt zählt pro Anschluss höchstens einmal pro Stunde. Gespeichert wird am Ende nur eine Zahl pro Stadt.
- Anfragen von fremden Websites werden abgelehnt.
- Alle Geräte-Einträge löschen sich am 14. November 2026 von selbst. Der Cookie läuft zum selben Zeitpunkt ab, die Kennung im Browser-Speicher verschwindet beim nächsten Besuch danach.

Grenze: Wer im Inkognito-Modus abstimmt, einen anderen Browser nimmt oder alle Browserdaten löscht, gilt als neues Gerät. Eine lückenlose Sperre gibt es im Web nur mit Login oder SMS-Bestätigung. Die Seite sagt das auch offen in den Fragen und Antworten.

## Veröffentlichen

**Bei Hostinger (oder einem anderen PHP-Webspace):** `npm run build:hostinger` baut `paket/gen-z-steht-auf-hostinger.zip`. Anleitung zum Hochladen: `hostinger/LIESMICH.md`.

**Auf Vercel:**

1. Auf [vercel.com/new](https://vercel.com/new) dieses Repository importieren.
2. **Root Directory** auf `nein-zur-wehrpflicht` stellen.
3. Unter **Storage** eine **Upstash Redis**-Datenbank in der Region **Frankfurt (eu-central-1)** anlegen und mit dem Projekt verbinden. So steht es in der Datenschutzerklärung. Das setzt `KV_REST_API_URL` und `KV_REST_API_TOKEN`. Die Server-Funktionen laufen über `vercel.json` ebenfalls in Frankfurt (`fra1`).
4. Unter **Environment Variables** `DEVICE_SECRET` mit einem langen Zufallswert anlegen (z. B. `openssl rand -hex 32`). Mit eigener Domain zusätzlich `NEXT_PUBLIC_SITE_URL` setzen, damit Teilen-Links und Vorschaubilder sie zeigen.
5. Für das Kontaktformular `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` und `SMTP_PASS` eines E-Mail-Postfachs eintragen. Ohne diese Angaben verweist das Formular auf die E-Mail-Adresse.
6. Impressum und Datenschutz nennen Akram Selo als Verantwortlichen, die Seite ist privat und nicht gewerblich. Einen Vertrag über die Auftragsverarbeitung (Art. 28 DSGVO) bietet Vercel nur ab dem Pro-Tarif an. Wer Hoster oder Datenbank ändert, passt `src/app/datenschutz/page.tsx` an.
7. **Deploy** klicken. Fehlt die Datenbank, zeigt die Live-Seite einen Hinweis, statt Stimmen still zu verlieren.

Alle Einstellungen stehen in `.env.example`.

## Lokal starten

```bash
npm install
npm run dev
```

Ohne Redis läuft die Abstimmung lokal im Speicher und ist nach einem Neustart leer. Mit `REQUIRE_DATABASE=1` verhält sich die Seite wie auf Vercel.

## Woraus die Seite gebaut ist

- Next.js 16 (App Router), React 19, Tailwind CSS 4, Motion
- Upstash Redis für die Zählung, im Hostinger-Paket SQLite oder MySQL über PHP
- Ticket-Fenster (vaul) und Hinweise (sonner) wie in shadcn/ui, Phosphor Icons
- Zähler-Animation aus [React Bits](https://github.com/DavidHDev/react-bits), angepasst (siehe `src/components/bits/README.md`)
- Schriften Lexend und BBH Bartle (SIL Open Font License). Sie liegen auf dem eigenen Server, beim Besuch gehen keine Anfragen an Google.
- Die Teilen-Bilder entstehen beim Bauen (`src/og`), Nummer und Adresse im Story-Bild setzt der Browser ein.

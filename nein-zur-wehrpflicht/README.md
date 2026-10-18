# Nein zur Wehrpflicht, 31. Oktober

Website für den Protest gegen die Wehrpflicht am Samstag, 31. Oktober 2026, ab 14 Uhr in 21 Städten. Jede Person sagt mit einem Tipp, an welchem Treffpunkt sie dabei ist, und alle sehen live, wie viele kommen.

## Was die Seite kann

- Live-Abstimmung „Ich bin dabei“ für alle 21 Treffpunkte vom Aufruf. Suche nach Stadt oder Treffpunkt (auch ohne Umlaute, etwa „munchen“), Sortierung A bis Z oder nach Beliebtheit. Die Zahlen aktualisieren sich alle 5 Sekunden und in allen offenen Tabs sofort.
- Deutschlandkarte mit einer Spitze pro Stadt. Antippen zeigt den Treffpunkt und lässt direkt zusagen.
- Nach der Zusage ein persönliches Ticket mit Nummer, ein Story-Bild (1080 × 1920) zum Teilen, WhatsApp, Link kopieren, Kalendereintrag (`/kalender/<stadt>`) und Route. Die Zusage lässt sich jederzeit wechseln oder zurückziehen.
- Einladungslinks pro Stadt (`/dabei/<stadt>`) mit eigenem Vorschaubild für WhatsApp, Instagram und Co.
- Countdown als Klapptafel, Tipps für eine sichere Demo, Fragen und Antworten, Impressum und Datenschutz.
- Fürs Handy gebaut: große Tippflächen, schnelle Ladezeit, weniger Bewegung, wenn das Handy das so eingestellt hat.

## Eine Stimme pro Gerät

- Jedes Gerät bekommt eine zufällige, vom Server signierte Kennung (HMAC). Sie liegt in einem HttpOnly-Cookie und zusätzlich im Browser-Speicher. Fehlt eins von beiden, erkennt der Server das Gerät am anderen wieder. Gefälschte Kennungen werden verworfen.
- Zusagen, Wechseln und Zurückziehen laufen in Redis als Lua-Skript, also atomar. Ein Gerät zählt immer genau einmal, auch bei vielen gleichzeitigen Klicks. Getestet mit 200 Geräten gleichzeitig und 40 parallelen Klicks von einem Gerät.
- Schutz vor Skripten: höchstens `MAX_VOTES_PER_IP_MINUTE` Abstimmungen pro Anschluss und Minute (Standard 40) und `MAX_NEW_DEVICES_PER_IP` neue Geräte pro Anschluss und Tag (Standard 150, großzügig wegen Schulen, Unis und Mobilfunk). IPv6-Anschlüsse zählen pro /64-Netz. Gespeichert wird dafür nur ein gesalzener Hash mit kurzer Laufzeit, nie die IP-Adresse.
- Abstimmungen von fremden Websites werden abgelehnt.
- Alle Geräte-Einträge löschen sich am 14. November 2026 von selbst.

Grenze: Wer im Inkognito-Modus abstimmt, einen anderen Browser nimmt oder alle Browserdaten löscht, gilt als neues Gerät. Eine lückenlose Sperre gibt es im Web nur mit Login oder SMS-Bestätigung. Die Seite sagt das auch offen in den Fragen und Antworten.

## Veröffentlichen auf Vercel

1. Auf [vercel.com/new](https://vercel.com/new) dieses Repository importieren.
2. **Root Directory** auf `nein-zur-wehrpflicht` stellen.
3. Unter **Storage** eine **Upstash Redis**-Datenbank anlegen, am besten in einer EU-Region wie Frankfurt, und mit dem Projekt verbinden. Das setzt `KV_REST_API_URL` und `KV_REST_API_TOKEN`.
4. Unter **Environment Variables** `DEVICE_SECRET` mit einem langen Zufallswert anlegen (z. B. `openssl rand -hex 32`). Mit eigener Domain zusätzlich `NEXT_PUBLIC_SITE_URL` setzen, damit Teilen-Links und Vorschaubilder sie zeigen.
5. Impressum und Datenschutz ausfüllen: die gelb markierten Stellen in `src/app/impressum/page.tsx` und `src/app/datenschutz/page.tsx`. Ein Impressum ist in Deutschland Pflicht.
6. **Deploy** klicken. Fehlt die Datenbank, zeigt die Live-Seite einen Hinweis, statt Stimmen still zu verlieren.

Alle Einstellungen stehen in `.env.example`.

## Lokal starten

```bash
npm install
npm run dev
```

Ohne Redis läuft die Abstimmung lokal im Speicher und ist nach einem Neustart leer. Mit `REQUIRE_DATABASE=1` verhält sich die Seite wie auf Vercel.

## Woraus die Seite gebaut ist

- Next.js 16 (App Router), React 19, Tailwind CSS 4, Motion
- Upstash Redis für die Zählung
- Bausteine aus [React Bits](https://github.com/DavidHDev/react-bits), angepasst (siehe `src/components/bits/README.md`)
- Gestaltungsregeln aus taste-skill für Typografie, Kontraste und Bewegung
- Ticket-Fenster (vaul) und Hinweise (sonner) wie in shadcn/ui
- Phosphor Icons und die Schriften Big Shoulders, Bricolage Grotesque, Martian Mono und Permanent Marker. Die Schriften liegen auf dem eigenen Server, beim Besuch gehen keine Anfragen an Google.
- Die Fotos sind Symbolbilder und auf der Seite so beschriftet. Die Teilen-Bilder entstehen auf dem Server (`src/og`).

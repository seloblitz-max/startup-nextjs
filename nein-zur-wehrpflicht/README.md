# Nein zur Wehrpflicht · 31. Oktober

Website für den Protest gegen die Wehrpflicht am 31. Oktober 2026 ab 14 Uhr in 21 Städten. Jede Person kann sagen, an welchem Treffpunkt sie dabei ist, und sieht live, wie viele schon zugesagt haben.

## Was die Seite kann

- Alle 21 Städte und Treffpunkte vom Aufruf, mit Kartenlink und Kalendereintrag (`/kalender/<stadt>`)
- „Ich bin dabei“ pro Stadt, Live-Zähler (alle 5 Sekunden), Top 3, Suche und Sortierung
- Countdown bis Samstag 14 Uhr, Teilen per WhatsApp, Telegram oder Teilen-Menü des Handys
- Tipps für eine sichere Demo, Impressum und Datenschutz

## Eine Stimme pro Gerät

- Jedes Gerät bekommt eine zufällige, vom Server signierte Kennung. Sie liegt in einem HttpOnly-Cookie und zusätzlich im Browser-Speicher. Fehlt eins von beiden, erkennt der Server das Gerät am anderen wieder.
- Die Stimme wird in Redis atomar gespeichert (Lua-Skript). Ein Gerät zählt immer genau einmal, beim Wechsel zieht die Stimme mit um.
- Pro Internetanschluss dürfen am Tag höchstens `MAX_NEW_DEVICES_PER_IP` neue Geräte abstimmen (Standard 60). Dafür wird nur ein gesalzener Hash der IP gespeichert, nie die IP selbst.
- Stimmen von fremden Websites werden abgelehnt.

Grenze: Wer im Inkognito-Modus ist oder Cookies und Browserdaten löscht, gilt als neues Gerät. Eine lückenlose Sperre pro Gerät gibt es im Web nicht ohne Login oder SMS-Bestätigung.

## Veröffentlichen auf Vercel

1. Auf [vercel.com/new](https://vercel.com/new) dieses Repository importieren.
2. **Root Directory** auf `nein-zur-wehrpflicht` stellen.
3. Unter **Storage** eine **Upstash Redis**-Datenbank anlegen und mit dem Projekt verbinden. Das setzt `KV_REST_API_URL` und `KV_REST_API_TOKEN` automatisch.
4. Unter **Environment Variables** `DEVICE_SECRET` mit einem langen Zufallswert anlegen (z. B. `openssl rand -hex 32`).
5. **Deploy** klicken.
6. Vorher `src/app/impressum/page.tsx` und `src/app/datenschutz/page.tsx` ausfüllen (gelb markierte Stellen). Ein Impressum ist in Deutschland Pflicht.

## Lokal starten

```bash
npm install
npm run dev
```

Ohne Redis-Zugang läuft die Abstimmung lokal im Speicher und ist nach einem Neustart leer.

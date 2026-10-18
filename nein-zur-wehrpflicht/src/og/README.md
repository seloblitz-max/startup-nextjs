# Dateien für Teilen-Bilder

Diese Dateien nutzen die Teilen-Bilder, die beim Bauen entstehen: `/og/<name>.jpg` (Vorschau für geteilte Links) und
`/story/<stadt>.jpg` (Grundbild für Storys, Nummer und Adresse setzt `src/lib/story-image.ts` im Browser ein).

- `fonts/`: Big Shoulders, Bricolage Grotesque, Martian Mono (SIL Open Font License 1.1) und
  Permanent Marker (Apache License 2.0), als WOFF aus den Fontsource-Paketen. Zwei davon liegen auch in
  `public/fonts/`, weil der Browser sie für das Story-Bild braucht.
- `og-tor.jpg`, `story-tor.jpg`: Symbolbild Brandenburger Tor, aus dem Bild in `src/img/tor.jpg`.
- `squirrel.ts`: das Eichhörnchen-Logo als SVG-Pfad, auch für Kopfzeile, Ticket und App-Icon.

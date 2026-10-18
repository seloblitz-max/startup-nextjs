# Dateien für Teilen-Bilder

Diese Dateien nutzen die Teilen-Bilder, die beim Bauen entstehen: `/og/<name>.jpg` (Vorschau für geteilte Links,
1200 × 630) und `/story/<stadt>.jpg` (Grundbild für Storys, 1080 × 1920). Nummer und Adresse setzt
`src/lib/story-image.ts` erst im Browser ein, die Maße dafür stehen in `src/lib/story-layout.ts`.

- `cards.tsx`: die Layouts, im selben Stil wie die Seite (#212121, #2A2A2A, Weiß, ein Orange, Lexend, Sticker
  „JETZT ODER NIE!“ und das Original-Logo aus `src/img/logo.svg`).
- `assets.ts`: liest Schriften und Logo und macht aus dem fertigen Bild ein JPEG.
- `fonts/`: Lexend (400, 700, 800, 900) und BBH Bartle (400) als WOFF aus den Fontsource-Paketen, beide unter der
  SIL Open Font License 1.1. Lexend 700 und 900 liegen zusätzlich als WOFF2 in `public/fonts/`, weil der Browser sie
  für Nummer und Adresse im Story-Bild braucht.

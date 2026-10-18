/**
 * Maße des Story-Bilds (1080 × 1920). Das Grundbild (src/og/cards.tsx, beim Bauen gerendert) lässt rechts neben der
 * Stadt und unter „Sag auch, wo du dabei bist:“ Platz, dort setzt src/lib/story-image.ts im Browser Nummer und Adresse
 * ein. Beide lesen die Werte von hier, damit sie zusammenpassen.
 */
export const STORY = {
  width: 1080,
  height: 1920,
  pad: 80,
  /** Spalte mit Stadt und Treffpunkt */
  city: { top: 1240, width: 560, maxSize: 120, minSize: 84, maxTwoLine: 100 },
  /** Nummernfeld: rechte Kante und Oberkante */
  number: { right: 1000, top: 1240 },
  /** Trennlinie über der Fußzeile */
  rule: 1590,
  /** Fußzeile: Aufforderung, darunter die Adresse der Seite (Grundlinie, Größe in px, Lexend 700) */
  prompt: { top: 1630, size: 30 },
  host: { baseline: 1722, size: 36, maxWidth: 540 },
} as const;

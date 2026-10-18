/**
 * Bilder für das Datei-Paket (STATIC_EXPORT=1): Es gibt dort keinen Bild-Server. Jede Breite liegt als fertiges WebP
 * neben dem Original, erzeugt von scripts/hostinger-paket.mjs.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  return `${src.replace(/\.(jpe?g|png)$/i, "")}.w${width}.webp`;
}

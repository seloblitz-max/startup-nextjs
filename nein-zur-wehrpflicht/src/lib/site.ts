export const SITE_NAME = "Gen Z steht auf";

/**
 * Platzhalter für das Datei-Paket ohne feste Adresse. Beim Ausliefern setzt seite.php (hostinger/public) dafür die echte
 * Adresse ein, unter der die Seite aufgerufen wurde.
 */
export const ORIGIN_PLACEHOLDER = "https://gzsa-origin.invalid";

/** Öffentliche Adresse der Seite, für Teilen-Links, OG-Bilder und Sitemap. */
export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.STATIC_EXPORT === "1") return ORIGIN_PLACEHOLDER;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Adresse ohne Protokoll, so wie sie auf Bildern stehen soll. Ohne feste Adresse (Datei-Paket) `null`. */
export function siteHost() {
  const url = siteUrl();
  return url === ORIGIN_PLACEHOLDER ? null : url.replace(/^https?:\/\//, "");
}

/** Seitenpfad passend zur Seite: Im Datei-Paket enden Seiten-Adressen auf „/“ (next.config.mjs). */
export function pagePath(path: string) {
  return process.env.SITE_TRAILING_SLASH === "1" && !path.endsWith("/") ? `${path}/` : path;
}

/** Vorschaubild für geteilte Links, erzeugt von src/app/og/[file]/route.tsx. */
export function ogImage(file: string, alt: string) {
  return { url: `/og/${file}`, width: 1200, height: 630, alt, type: "image/jpeg" };
}

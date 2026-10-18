export const SITE_NAME = "Gen Z steht auf";

/** Öffentliche Adresse der Seite, für Teilen-Links, OG-Bilder und Sitemap. */
export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Adresse ohne Protokoll, so wie sie auf Bildern stehen soll. */
export function siteHost() {
  return siteUrl().replace(/^https?:\/\//, "");
}

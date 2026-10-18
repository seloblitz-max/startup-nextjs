/**
 * Alle Städte der Seite. Eine neue Stadt ist ein Eintrag mehr in CITIES, sonst muss nichts geändert werden:
 * Karte, Liste, Ticket, Einladungslink (/dabei/<id>), Teilen-Bilder, Kalender und die PHP-Abstimmung im Datei-Paket
 * kommen von selbst mit.
 *
 * - id: Teil der Adresse, nur a–z, Ziffern und Bindestrich (etwa "frankfurt"). Später nicht mehr ändern,
 *   sonst verlieren die Zusagen ihre Stadt.
 * - name: wie er überall steht. short: kürzere Form für die Karte, falls der Name lang ist.
 * - place: Treffpunkt.
 * - lat, lng: Koordinaten des Treffpunkts (in Google Maps: Rechtsklick auf den Ort, erste Zeile). Die Route im Ticket
 *   führt genau dorthin. Geprüft im Oktober 2026: Mitte des Platzes laut seinem Wikipedia-Artikel, in Berlin das Tor
 *   selbst, in Mainz das Gutenberg-Denkmal, in Freiburg und Magdeburg nach OpenStreetMap.
 * - lead: true, wenn Gen Z regelt für die Stadt hauptverantwortlich ist (Inhalte, Organisation).
 *   Diese Städte sind auf der Karte orange und stehen in der Liste immer oben, in der Reihenfolge von hier.
 *   Alle anderen sind weiß und stehen darunter, sortiert nach Aufrufen.
 * - telegram: Einladungslink zur Telegram-Gruppe der Stadt ("https://t.me/…"). Öffnet auf dem Handy direkt die
 *   Telegram-App. Leer lassen, bis es ihn gibt.
 */
export type City = {
  id: string;
  name: string;
  short?: string;
  place: string;
  lat: number;
  lng: number;
  lead?: boolean;
  telegram?: string;
};

export const CITIES: City[] = [
  // Hauptverantwortlich: Gen Z regelt (Reihenfolge wie auf dem Plakat „Fünf Städte. Eine Stimme.“)
  { id: "berlin", name: "Berlin", place: "Brandenburger Tor", lat: 52.5163, lng: 13.3777, lead: true, telegram: "https://t.me/+EFjnf8z1ZSJkZjdi" },
  { id: "frankfurt", name: "Frankfurt am Main", short: "Frankfurt", place: "Römerberg", lat: 50.11028, lng: 8.68222, lead: true, telegram: "https://t.me/+oLsak_f_S8M1Nzky" },
  { id: "hamburg", name: "Hamburg", place: "Rathausplatz", lat: 53.55083, lng: 9.99306, lead: true, telegram: "https://t.me/+t78JmjhTXCA4OGNi" },
  { id: "muenchen", name: "München", place: "Marienplatz", lat: 48.13722, lng: 11.57528, lead: true, telegram: "https://t.me/+wqoLrrkWiAIyNmQy" },
  { id: "koeln", name: "Köln", place: "Heumarkt", lat: 50.93621, lng: 6.96071, lead: true, telegram: "https://t.me/+tUjIJF82ZBowZWJi" },

  // Weitere Städte auf der Plattform, vor Ort von anderen Gruppen organisiert (Reihenfolge wie auf dem Aufruf)
  { id: "hannover", name: "Hannover", place: "Opernplatz", lat: 52.3731, lng: 9.74015 },
  { id: "dortmund", name: "Dortmund", place: "Friedensplatz", lat: 51.51139, lng: 7.46639 },
  { id: "essen", name: "Essen", place: "Kennedyplatz", lat: 51.4565, lng: 7.01103 },
  { id: "bielefeld", name: "Bielefeld", place: "Jahnplatz", lat: 52.02325, lng: 8.53333 },
  { id: "stuttgart", name: "Stuttgart", place: "Schlossplatz", lat: 48.77855, lng: 9.17991 },
  { id: "bremen", name: "Bremen", place: "Marktplatz", lat: 53.07556, lng: 8.80694 },
  { id: "nuernberg", name: "Nürnberg", place: "Hauptmarkt", lat: 49.45389, lng: 11.07694 },
  { id: "dresden", name: "Dresden", place: "Theaterplatz", lat: 51.05403, lng: 13.73603 },
  { id: "leipzig", name: "Leipzig", place: "Augustusplatz", lat: 51.33917, lng: 12.38083 },
  { id: "duesseldorf", name: "Düsseldorf", place: "Altstadt, Burgplatz", lat: 51.22692, lng: 6.77138 },
  { id: "bonn", name: "Bonn", place: "Hofgarten", lat: 50.73262, lng: 7.10453 },
  { id: "freiburg", name: "Freiburg", place: "Platz der Alten Synagoge", lat: 47.99523, lng: 7.8459 },
  { id: "mainz", name: "Mainz", place: "Gutenbergplatz", lat: 49.99882, lng: 8.27163 },
  { id: "magdeburg", name: "Magdeburg", place: "Willy-Brandt-Platz", lat: 52.13, lng: 11.629 },
  { id: "erfurt", name: "Erfurt", place: "Domplatz", lat: 50.97694, lng: 11.02389 },
  { id: "karlsruhe", name: "Karlsruhe", place: "Marktplatz", lat: 49.00889, lng: 8.40389 },
];

export const CITY_IDS = new Set(CITIES.map((c) => c.id));
export const CITY_BY_ID: Record<string, City> = Object.fromEntries(CITIES.map((c) => [c.id, c]));
export const LEAD_CITIES = CITIES.filter((c) => c.lead);
export const CITY_COUNT = CITIES.length;

/** Städte ohne Hauptverantwortung, nach Aufrufen sortiert (gleich oft aufgerufen: von A bis Z). */
export function byViews(views: Record<string, number>) {
  return CITIES.filter((c) => !c.lead).sort(
    (a, b) => (views[b.id] ?? 0) - (views[a.id] ?? 0) || a.name.localeCompare(b.name, "de"),
  );
}

export const shortName = (c: City) => c.short ?? c.name;

// 31.10.2026, 14:00 Uhr MEZ (UTC+1, die Sommerzeit endet am 25.10.)
export const EVENT_START = Date.UTC(2026, 9, 31, 13, 0, 0);
export const EVENT_END = Date.UTC(2026, 9, 31, 17, 0, 0);
export const EVENT_START_ISO = "2026-10-31T14:00:00+01:00";
/** Zwei Wochen nach dem Protest (14.11.2026) löschen sich Zusagen, Cookie und die Kennung im Browser. */
export const DATA_DELETE_AT = EVENT_END + 14 * 86_400_000;

/**
 * Route zum Treffpunkt in Google Maps (App oder Browser), vom eigenen Standort aus mit Bus und Bahn. Das Ziel sind die
 * Koordinaten aus CITIES, nicht der Name: „Marktplatz“ gibt es in vielen Städten, die Koordinaten sind eindeutig.
 */
export function mapsUrl(c: City) {
  return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&travelmode=transit`;
}

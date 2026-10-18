export type City = { id: string; name: string; place: string };

// Reihenfolge wie auf dem Aufruf
export const CITIES: City[] = [
  { id: "berlin", name: "Berlin", place: "Brandenburger Tor" },
  { id: "hamburg", name: "Hamburg", place: "Rathausplatz" },
  { id: "koeln", name: "Köln", place: "Heumarkt" },
  { id: "hannover", name: "Hannover", place: "Opernplatz" },
  { id: "dortmund", name: "Dortmund", place: "Friedensplatz" },
  { id: "essen", name: "Essen", place: "Kennedyplatz" },
  { id: "bielefeld", name: "Bielefeld", place: "Jahnplatz" },
  { id: "stuttgart", name: "Stuttgart", place: "Schlossplatz" },
  { id: "bremen", name: "Bremen", place: "Marktplatz" },
  { id: "muenchen", name: "München", place: "Marienplatz" },
  { id: "nuernberg", name: "Nürnberg", place: "Hauptmarkt" },
  { id: "dresden", name: "Dresden", place: "Theaterplatz" },
  { id: "leipzig", name: "Leipzig", place: "Augustusplatz" },
  { id: "frankfurt", name: "Frankfurt am Main", place: "Römerberg" },
  { id: "duesseldorf", name: "Düsseldorf", place: "Altstadt, Burgplatz" },
  { id: "bonn", name: "Bonn", place: "Hofgarten" },
  { id: "freiburg", name: "Freiburg", place: "Platz der Alten Synagoge" },
  { id: "mainz", name: "Mainz", place: "Gutenbergplatz" },
  { id: "magdeburg", name: "Magdeburg", place: "Willy-Brandt-Platz" },
  { id: "erfurt", name: "Erfurt", place: "Domplatz" },
  { id: "karlsruhe", name: "Karlsruhe", place: "Marktplatz" },
];

export const CITY_IDS = new Set(CITIES.map((c) => c.id));
export const CITY_BY_ID: Record<string, City> = Object.fromEntries(CITIES.map((c) => [c.id, c]));

// 31.10.2026, 14:00 Uhr MEZ (UTC+1, die Sommerzeit endet am 25.10.)
export const EVENT_START = Date.UTC(2026, 9, 31, 13, 0, 0);
export const EVENT_END = Date.UTC(2026, 9, 31, 17, 0, 0);
export const EVENT_START_ISO = "2026-10-31T14:00:00+01:00";

export function mapsUrl(c: City) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${c.place}, ${c.name}`);
}

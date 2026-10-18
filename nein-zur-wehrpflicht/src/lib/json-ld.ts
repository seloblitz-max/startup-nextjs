import { CITIES, EVENT_END, EVENT_START_ISO } from "./cities";
import { pagePath, siteUrl } from "./site";

/** Strukturierte Daten für Suchmaschinen: alle Proteste als Events. Veranstalter steht nur bei den eigenen Städten. */
export function eventsJsonLd() {
  const url = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": CITIES.map((c) => ({
      "@type": "Event",
      name: `Gen Z steht auf: Protest in ${c.name}`,
      description:
        "Bundesweiter Protest der Generation Z. Unsere Zukunft liegt in unseren Händen: für Bildung, Gesundheit und ein bezahlbares Leben, gegen Wehrpflicht und Sparkurs auf unserem Rücken.",
      startDate: EVENT_START_ISO,
      endDate: new Date(EVENT_END).toISOString(),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: true,
      url: `${url}${pagePath(`/dabei/${c.id}`)}`,
      image: `${url}/og/${c.id}.jpg`,
      location: {
        "@type": "Place",
        name: c.place,
        address: { "@type": "PostalAddress", addressLocality: c.name, addressCountry: "DE" },
      },
      ...(c.lead ? { organizer: { "@type": "Organization", name: "Gen Z regelt", url } } : {}),
    })),
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

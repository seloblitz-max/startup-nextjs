import { CITIES, EVENT_END, EVENT_START_ISO } from "./cities";
import { pagePath, SITE_NAME, siteUrl } from "./site";

/** Strukturierte Daten für Suchmaschinen: die 21 Proteste als Events. */
export function eventsJsonLd() {
  const url = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": CITIES.map((c) => ({
      "@type": "Event",
      name: `Protest gegen die Wehrpflicht in ${c.name}`,
      description: "Gen Z steht auf: Nein zur Wehrpflicht. Für unsere Zukunft, gemeinsam für Deutschland.",
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
      organizer: { "@type": "Organization", name: SITE_NAME, url },
    })),
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

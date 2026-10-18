import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { CITIES, EVENT_END, EVENT_START_ISO } from "@/lib/cities";
import { SITE_NAME, siteUrl } from "@/lib/site";
import { safeSnapshot } from "@/lib/store";

// Die Seite wird höchstens alle 30 Sekunden neu gebaut, die Zahlen kommen danach live im Browser.
export const revalidate = 30;

export const metadata: Metadata = { alternates: { canonical: "/" } };

function jsonLd() {
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
      url: `${url}/dabei/${c.id}`,
      image: `${url}/opengraph-image`,
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

export default async function Page() {
  const snapshot = await safeSnapshot();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <HomePage snapshot={snapshot} />
    </>
  );
}

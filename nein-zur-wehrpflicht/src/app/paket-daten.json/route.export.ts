import { CITIES, DATA_DELETE_AT } from "@/lib/cities";
import { CONTACT_EMAIL, CONTACT_PER_HOUR, CONTACT_TOPICS, DEFAULT_TOPIC, LIMITS, MIN_FILL_MS } from "@/lib/contact";
import { ORIGIN_PLACEHOLDER } from "@/lib/site";

export const dynamic = "force-static";

/** Nur im Datei-Paket: Daten für Abstimmung und Kontaktformular in PHP. scripts/hostinger-paket.mjs macht daraus _app/data.php. */
export function GET() {
  return Response.json({
    cities: CITIES.map((c) => c.id),
    deleteAt: DATA_DELETE_AT,
    origin: ORIGIN_PLACEHOLDER,
    contact: {
      email: CONTACT_EMAIL,
      per_hour: CONTACT_PER_HOUR,
      min_fill_ms: MIN_FILL_MS,
      limits: LIMITS,
      topics: Object.fromEntries(CONTACT_TOPICS.map((t) => [t.id, t.label])),
      default_topic: DEFAULT_TOPIC,
    },
  });
}

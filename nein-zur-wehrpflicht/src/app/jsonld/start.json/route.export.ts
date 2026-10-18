import { eventsJsonLd } from "@/lib/json-ld";

export const dynamic = "force-static";

/** Nur im Datei-Paket: Vorlage für die Events, die scripts/hostinger-paket.mjs in die Startseite einsetzt. */
export function GET() {
  return new Response(eventsJsonLd(), { headers: { "Content-Type": "application/ld+json" } });
}

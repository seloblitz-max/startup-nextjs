import { CITIES, DATA_DELETE_AT } from "@/lib/cities";
import { ORIGIN_PLACEHOLDER } from "@/lib/site";

export const dynamic = "force-static";

/** Nur im Datei-Paket: Daten für die Abstimmung in PHP. scripts/hostinger-paket.mjs macht daraus _app/data.php. */
export function GET() {
  return Response.json({
    cities: CITIES.map((c) => c.id),
    deleteAt: DATA_DELETE_AT,
    origin: ORIGIN_PLACEHOLDER,
  });
}

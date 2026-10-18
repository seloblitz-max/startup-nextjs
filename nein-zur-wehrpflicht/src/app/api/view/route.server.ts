import { NextResponse, type NextRequest } from "next/server";
import { CITY_IDS } from "@/lib/cities";
import { deny, foreign, network, readJson } from "@/lib/api";
import { getStore, StoreNotConfiguredError } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * Klickzähler pro Stadt: {"city": "berlin"}, wenn jemand eine Stadt auf der Karte, in der Liste oder über einen
 * Einladungslink öffnet. Pro Anschluss zählt jede Stadt höchstens einmal pro Stunde. Gespeichert wird dafür nur ein
 * gesalzener Hash des Netzes mit einer Stunde Laufzeit, nie die IP-Adresse.
 */
export async function POST(req: NextRequest) {
  if (foreign(req)) return deny("forbidden", 403);
  const body = await readJson(req, 100);
  if (body === "too_large") return deny("bad_request", 413);
  if (!body) return deny("bad_request", 400);
  const city = body.city;
  if (typeof city !== "string" || !CITY_IDS.has(city)) return deny("unknown_city", 400);
  try {
    const counted = await getStore().view(network(req), city);
    return NextResponse.json({ counted }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (!(err instanceof StoreNotConfiguredError)) console.error("view", err);
    return deny("unavailable", 503);
  }
}

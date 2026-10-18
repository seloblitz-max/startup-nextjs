import { NextResponse } from "next/server";
import { readSnapshot, StoreNotConfiguredError } from "@/lib/store";
import { setupMissing } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Öffentlicher Zählerstand, für alle gleich. Das CDN darf ihn kurz zwischenspeichern:
 * so landen auch bei sehr vielen Besucher*innen nur wenige Anfragen bei der Datenbank.
 */
export async function GET() {
  try {
    const snap = await readSnapshot();
    return NextResponse.json(snap, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "CDN-Cache-Control": "public, max-age=2, stale-while-revalidate=8",
      },
    });
  } catch (err) {
    if (err instanceof StoreNotConfiguredError) return setupMissing();
    console.error("counts", err);
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

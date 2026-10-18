import { NextResponse, type NextRequest } from "next/server";
import { CITY_IDS } from "@/lib/cities";
import { clientIp, hashIp, networkOf } from "@/lib/device";
import { getStore, rememberSnapshot, StoreNotConfiguredError } from "@/lib/store";
import { personal, resolveDevice, setupMissing } from "@/lib/api";

export const dynamic = "force-dynamic";

const deny = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

/** Stimmen nur von dieser Seite aus, nicht von fremden Websites. */
function foreign(req: NextRequest) {
  if (req.headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== req.headers.get("host");
  } catch {
    return true;
  }
}

const network = (req: NextRequest) => hashIp(networkOf(clientIp(req.headers)));

function failed(err: unknown, what: string) {
  if (err instanceof StoreNotConfiguredError) return setupMissing();
  console.error(what, err);
  return deny("unavailable", 503);
}

/** Zusage für eine Stadt (oder Wechsel dorthin). */
export async function POST(req: NextRequest) {
  if (foreign(req)) return deny("forbidden", 403);
  if (!req.headers.get("content-type")?.includes("application/json")) return deny("bad_request", 415);

  let city: unknown;
  try {
    const text = await req.text();
    if (text.length > 200) return deny("bad_request", 413);
    ({ city } = JSON.parse(text));
  } catch {
    return deny("bad_request", 400);
  }
  if (typeof city !== "string" || !CITY_IDS.has(city)) return deny("unknown_city", 400);

  const device = resolveDevice(req);
  try {
    const result = await getStore().vote(device.id, network(req), city);
    rememberSnapshot(result.snapshot);
    if (!result.ok) {
      return personal({ error: result.reason, snapshot: result.snapshot }, device.token, 429);
    }
    return personal(
      { mine: result.mine, previous: result.previous, snapshot: result.snapshot },
      device.token,
    );
  } catch (err) {
    return failed(err, "vote");
  }
}

/** Zusage zurückziehen. */
export async function DELETE(req: NextRequest) {
  if (foreign(req)) return deny("forbidden", 403);
  const device = resolveDevice(req);
  if (device.fresh) return personal({ mine: null, removed: null }, device.token);
  try {
    const result = await getStore().withdraw(device.id, network(req));
    rememberSnapshot(result.snapshot);
    if (!result.ok) {
      return personal({ error: result.reason, snapshot: result.snapshot }, device.token, 429);
    }
    return personal({ mine: null, removed: result.removed, snapshot: result.snapshot }, device.token);
  } catch (err) {
    return failed(err, "withdraw");
  }
}

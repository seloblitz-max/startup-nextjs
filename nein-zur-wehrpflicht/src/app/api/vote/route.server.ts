import { type NextRequest } from "next/server";
import { CITY_IDS } from "@/lib/cities";
import { getStore, rememberSnapshot, StoreNotConfiguredError } from "@/lib/store";
import { deny, foreign, knownDevice, network, personal, resolveDevice, setupMissing } from "@/lib/api";

export const dynamic = "force-dynamic";

function failed(err: unknown, what: string) {
  if (err instanceof StoreNotConfiguredError) return setupMissing();
  console.error(what, err);
  return deny("unavailable", 503);
}

/** Zusage für eine Stadt (oder Wechsel dorthin). Mit `{"withdraw": true}` wird sie zurückgezogen. */
export async function POST(req: NextRequest) {
  if (foreign(req)) return deny("forbidden", 403);
  if (!req.headers.get("content-type")?.includes("application/json")) return deny("bad_request", 415);

  let city: unknown;
  let withdraw: unknown;
  try {
    const text = await req.text();
    if (text.length > 200) return deny("bad_request", 413);
    ({ city, withdraw } = JSON.parse(text));
  } catch {
    return deny("bad_request", 400);
  }
  if (withdraw === true) return withdrawVote(req);
  if (typeof city !== "string" || !CITY_IDS.has(city)) return deny("unknown_city", 400);

  const device = resolveDevice(req);
  try {
    const result = await getStore().vote(device.id, network(req), city);
    rememberSnapshot(result.snapshot);
    if (!result.ok) {
      // Ein neues Gerät ohne gezählte Zusage bekommt auch keine Kennung.
      return personal({ error: result.reason, snapshot: result.snapshot }, device.fresh ? null : device.token, 429);
    }
    return personal(
      { mine: result.mine, previous: result.previous, snapshot: result.snapshot },
      device.token,
    );
  } catch (err) {
    return failed(err, "vote");
  }
}

/**
 * Zusage zurückziehen. Die Seite selbst schickt dafür POST, weil manche Firewalls bei Webhostern DELETE sperren
 * und das Zurückziehen immer klappen muss.
 */
export async function DELETE(req: NextRequest) {
  if (foreign(req)) return deny("forbidden", 403);
  return withdrawVote(req);
}

async function withdrawVote(req: NextRequest) {
  const device = knownDevice(req);
  if (!device) return personal({ mine: null, removed: null }, null);
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

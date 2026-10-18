import { type NextRequest } from "next/server";
import { getStore, StoreNotConfiguredError } from "@/lib/store";
import { knownDevice, personal, setupMissing } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Wofür hat dieses Gerät gestimmt? Ein neues Gerät bekommt hier noch keine Kennung, erst mit der ersten Zusage. */
export async function GET(req: NextRequest) {
  const device = knownDevice(req);
  if (!device) return personal({ mine: null }, null);
  try {
    const mine = await getStore().mine(device.id);
    return personal({ mine }, device.token);
  } catch (err) {
    if (err instanceof StoreNotConfiguredError) return setupMissing();
    console.error("me", err);
    return personal({ mine: null, error: "unavailable" }, device.token, 503);
  }
}

import { type NextRequest } from "next/server";
import { getStore, StoreNotConfiguredError } from "@/lib/store";
import { personal, resolveDevice, setupMissing } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Wofür hat dieses Gerät gestimmt? Legt beim ersten Besuch die Geräte-Kennung an. */
export async function GET(req: NextRequest) {
  const device = resolveDevice(req);
  try {
    const mine = device.fresh ? null : await getStore().mine(device.id);
    return personal({ mine }, device.token);
  } catch (err) {
    if (err instanceof StoreNotConfiguredError) return setupMissing();
    console.error("me", err);
    return personal({ mine: null, error: "unavailable" }, device.token, 503);
  }
}

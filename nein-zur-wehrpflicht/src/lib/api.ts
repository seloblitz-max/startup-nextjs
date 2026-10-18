import { NextResponse, type NextRequest } from "next/server";
import { DATA_DELETE_AT } from "./cities";
import { clientIp, DEVICE_COOKIE, DEVICE_HEADER, hashIp, issueToken, networkOf, verifyToken } from "./device";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 120;

/** Der Cookie läuft zusammen mit den Einträgen in der Datenbank ab, nach dem Löschtermin nach einem Tag. */
function cookieMaxAge() {
  const untilDelete = Math.floor((DATA_DELETE_AT - Date.now()) / 1000);
  return untilDelete > 0 ? Math.min(COOKIE_MAX_AGE, untilDelete) : 86_400;
}

/** Cookie zuerst, sonst das im Browser gespeicherte Token. Ohne beides hat das Gerät noch keine Kennung. */
export function knownDevice(req: NextRequest) {
  const fromCookie = req.cookies.get(DEVICE_COOKIE)?.value;
  const fromHeader = req.headers.get(DEVICE_HEADER);
  for (const token of [fromCookie, fromHeader]) {
    const id = verifyToken(token);
    if (id && token) return { id, token };
  }
  return null;
}

/** Wie `knownDevice`, legt für ein neues Gerät aber eine Kennung an. Nur für die Zusage selbst. */
export function resolveDevice(req: NextRequest) {
  const known = knownDevice(req);
  if (known) return { ...known, fresh: false };
  const token = issueToken();
  return { id: verifyToken(token)!, token, fresh: true };
}

/**
 * Persönliche Antwort: nie zwischenspeichern. Mit Token kommt es als Cookie und im Body mit,
 * ohne Token wird im Browser nichts gespeichert.
 */
export function personal(body: Record<string, unknown>, token: string | null, status = 200) {
  const res = NextResponse.json(token ? { ...body, deviceToken: token } : body, { status });
  if (token) {
    res.cookies.set(DEVICE_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: cookieMaxAge(),
    });
  }
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export function setupMissing() {
  return NextResponse.json(
    { error: "setup", message: "Die Abstimmung ist noch nicht mit einer Datenbank verbunden." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export const deny = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

/** Anfragen nur von dieser Seite aus, nicht von fremden Websites. */
export function foreign(req: NextRequest) {
  if (req.headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== req.headers.get("host");
  } catch {
    return true;
  }
}

/** Gesalzener Hash des Netzes (IPv4-Adresse oder IPv6-/64), nie die Adresse selbst. */
export const network = (req: NextRequest) => hashIp(networkOf(clientIp(req.headers)));

/** JSON-Body mit Größengrenze lesen. `null` heißt: kein gültiges JSON-Objekt. */
export async function readJson(req: NextRequest, maxBytes: number): Promise<Record<string, unknown> | "too_large" | null> {
  if (!req.headers.get("content-type")?.includes("application/json")) return null;
  const text = await req.text();
  if (Buffer.byteLength(text) > maxBytes) return "too_large";
  try {
    const body = JSON.parse(text);
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

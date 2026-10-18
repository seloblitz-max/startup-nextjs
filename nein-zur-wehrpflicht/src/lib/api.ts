import { NextResponse, type NextRequest } from "next/server";
import { DATA_DELETE_AT } from "./cities";
import { DEVICE_COOKIE, DEVICE_HEADER, issueToken, verifyToken } from "./device";

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

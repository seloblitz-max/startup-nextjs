import { NextResponse, type NextRequest } from "next/server";
import { DEVICE_COOKIE, DEVICE_HEADER, issueToken, verifyToken } from "./device";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 120;

/** Cookie zuerst, sonst das im Browser gespeicherte Token. Fehlt beides, ist es ein neues Gerät. */
export function resolveDevice(req: NextRequest) {
  const fromCookie = req.cookies.get(DEVICE_COOKIE)?.value;
  const fromHeader = req.headers.get(DEVICE_HEADER);
  for (const token of [fromCookie, fromHeader]) {
    const id = verifyToken(token);
    if (id && token) return { id, token, fresh: false };
  }
  const token = issueToken();
  return { id: verifyToken(token)!, token, fresh: true };
}

/** Persönliche Antwort: nie zwischenspeichern, Geräte-Token als Cookie und im Body mitgeben. */
export function personal(body: Record<string, unknown>, token: string, status = 200) {
  const res = NextResponse.json({ ...body, deviceToken: token }, { status });
  res.cookies.set(DEVICE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export function setupMissing() {
  return NextResponse.json(
    { error: "setup", message: "Die Abstimmung ist noch nicht mit einer Datenbank verbunden." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

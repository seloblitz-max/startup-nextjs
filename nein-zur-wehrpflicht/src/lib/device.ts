import { createHmac, createHash, randomUUID, timingSafeEqual } from "node:crypto";

export const DEVICE_COOKIE = "wp_device";
export const DEVICE_HEADER = "x-device-token";

function secret() {
  const s = process.env.DEVICE_SECRET || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("DEVICE_SECRET fehlt");
  }
  return "dev-only-secret";
}

function sign(id: string) {
  return createHmac("sha256", secret()).update(id).digest("base64url").slice(0, 32);
}

/** Neues Geräte-Token im Format `<uuid>.<signatur>`. */
export function issueToken() {
  const id = randomUUID();
  return `${id}.${sign(id)}`;
}

/** Gibt die Geräte-ID zurück, wenn das Token von uns signiert wurde. */
export function verifyToken(token: string | null | undefined): string | null {
  if (!token || token.length > 100) return null;
  const [id, sig] = token.split(".");
  if (!id || !sig || !/^[0-9a-f-]{36}$/.test(id)) return null;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return id;
}

/** IP-Adressen werden nie gespeichert, nur ein gesalzener Hash für die Tagesgrenze. */
export function hashIp(ip: string) {
  return createHash("sha256").update(secret() + "|" + ip).digest("base64url").slice(0, 22);
}

export function clientIp(headers: Headers) {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}

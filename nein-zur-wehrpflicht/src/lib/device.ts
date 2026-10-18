import { createHmac, createHash, randomUUID, timingSafeEqual } from "node:crypto";

export const DEVICE_COOKIE = "wp_device";
export const DEVICE_HEADER = "x-device-token";

function secret() {
  const s = process.env.DEVICE_SECRET || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (s) return s;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
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

/** IP-Adressen werden nie gespeichert, nur ein gesalzener Hash für die Grenzwerte. */
export function hashIp(ip: string) {
  return createHash("sha256").update(secret() + "|" + ip).digest("base64url").slice(0, 22);
}

/**
 * Netz des Geräts: IPv4 als ganze Adresse, IPv6 als /64-Präfix.
 * Ein Anschluss bekommt bei IPv6 meist ein ganzes /64, einzelne Adressen daraus wechseln ständig.
 */
export function networkOf(ip: string) {
  const v4 = ip.match(/^(?:::ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (v4) return v4[1];
  if (!ip.includes(":")) return ip;
  const [head, tail = ""] = ip.split("%")[0].split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const full = ip.includes("::") ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right] : left;
  return full
    .slice(0, 4)
    .map((h) => (parseInt(h, 16) || 0).toString(16))
    .join(":") + "::/64";
}

export function clientIp(headers: Headers) {
  const direct = headers.get("x-vercel-forwarded-for") || headers.get("x-real-ip");
  if (direct) return direct.split(",")[0].trim();
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "unknown";
}

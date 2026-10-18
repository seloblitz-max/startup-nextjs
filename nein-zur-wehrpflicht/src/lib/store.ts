import { Redis } from "@upstash/redis";
import { CITY_IDS } from "./cities";

export type Counts = Record<string, number>;
export type VoteResult = { ok: true; city: string; previous: string | null } | { ok: false; reason: "limit" };

const COUNTS_KEY = "wp:counts";
const deviceKey = (id: string) => `wp:device:${id}`;
const ipKey = (ipHash: string) => `wp:ip:${ipHash}:${new Date().toISOString().slice(0, 10)}`;

// Atomar: eine Stimme pro Gerät, Wechsel verschiebt die Stimme, neue Geräte pro Anschluss und Tag begrenzt.
const VOTE_SCRIPT = `
local old = redis.call('GET', KEYS[1])
local city = ARGV[1]
if old == city then return {0, old} end
if not old then
  local n = redis.call('INCR', KEYS[3])
  if n == 1 then redis.call('EXPIRE', KEYS[3], 90000) end
  if n > tonumber(ARGV[2]) then return {-1, ''} end
end
if old then redis.call('HINCRBY', KEYS[2], old, -1) end
redis.call('SET', KEYS[1], city)
redis.call('HINCRBY', KEYS[2], city, 1)
if old then return {1, old} end
return {1, ''}
`;

function maxNewDevices() {
  const n = Number(process.env.MAX_NEW_DEVICES_PER_IP);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 60;
}

function clean(raw: Record<string, unknown> | null): Counts {
  const out: Counts = {};
  if (!raw) return out;
  for (const [k, v] of Object.entries(raw)) {
    const n = Number(v);
    if (CITY_IDS.has(k) && Number.isFinite(n) && n > 0) out[k] = n;
  }
  return out;
}

interface Store {
  counts(): Promise<Counts>;
  myVote(deviceId: string): Promise<string | null>;
  vote(deviceId: string, ipHash: string, city: string): Promise<VoteResult>;
}

class RedisStore implements Store {
  constructor(private r: Redis) {}
  async counts() {
    return clean(await this.r.hgetall<Record<string, unknown>>(COUNTS_KEY));
  }
  async myVote(deviceId: string) {
    const v = await this.r.get<string>(deviceKey(deviceId));
    return v && CITY_IDS.has(v) ? v : null;
  }
  async vote(deviceId: string, ipHash: string, city: string): Promise<VoteResult> {
    const [status, prev] = (await this.r.eval(
      VOTE_SCRIPT,
      [deviceKey(deviceId), COUNTS_KEY, ipKey(ipHash)],
      [city, String(maxNewDevices())],
    )) as [number, string];
    if (Number(status) === -1) return { ok: false, reason: "limit" };
    return { ok: true, city, previous: prev ? String(prev) : null };
  }
}

// Nur für die lokale Entwicklung ohne Datenbank.
class MemoryStore implements Store {
  private c: Counts = {};
  private d = new Map<string, string>();
  private ip = new Map<string, number>();
  async counts() {
    return clean(this.c);
  }
  async myVote(deviceId: string) {
    return this.d.get(deviceId) ?? null;
  }
  async vote(deviceId: string, ipHash: string, city: string): Promise<VoteResult> {
    const old = this.d.get(deviceId) ?? null;
    if (old === city) return { ok: true, city, previous: old };
    if (!old) {
      const k = ipKey(ipHash);
      const n = (this.ip.get(k) ?? 0) + 1;
      this.ip.set(k, n);
      if (n > maxNewDevices()) return { ok: false, reason: "limit" };
    } else {
      this.c[old] = (this.c[old] ?? 1) - 1;
    }
    this.d.set(deviceId, city);
    this.c[city] = (this.c[city] ?? 0) + 1;
    return { ok: true, city, previous: old };
  }
}

let store: Store | null = null;
const g = globalThis as unknown as { __wpMemStore?: MemoryStore };

export function getStore(): Store {
  if (store) return store;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    store = new RedisStore(new Redis({ url, token }));
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn("Keine Redis-Datenbank verbunden: Stimmen gehen beim Neustart verloren.");
    }
    store = g.__wpMemStore ??= new MemoryStore();
  }
  return store;
}

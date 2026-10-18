import { Redis } from "@upstash/redis";
import { CITY_IDS, EVENT_END } from "./cities";

export type Counts = Record<string, number>;
/** Zählerstand mit Versionsnummer. Jede Stimme erhöht `v`, so erkennt der Browser veraltete Antworten. */
export type Snapshot = { counts: Counts; total: number; v: number };
export type Mine = { city: string; rank: number } | null;
export type VoteOutcome =
  | { ok: true; mine: { city: string; rank: number }; previous: string | null; snapshot: Snapshot }
  | { ok: false; reason: "limit" | "rate"; snapshot: Snapshot };
export type WithdrawOutcome =
  | { ok: true; removed: string | null; snapshot: Snapshot }
  | { ok: false; reason: "rate"; snapshot: Snapshot };

export class StoreNotConfiguredError extends Error {}

const day = () => new Date().toISOString().slice(0, 10);
const minute = () => Math.floor(Date.now() / 60_000);

// Alle Schlüssel tragen denselben Hash-Tag, damit Lua-Skripte auch auf verteilten Datenbanken laufen.
const K = {
  counts: "{wp}:counts",
  version: "{wp}:v",
  device: (id: string) => `{wp}:device:${id}`,
  netDay: (net: string) => `{wp}:ip:${net}:${day()}`,
  netMinute: (net: string) => `{wp}:rl:${net}:${minute()}`,
};

function envInt(name: string, fallback: number) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
/** Neue Geräte pro Anschluss und Tag. Großzügig, weil Schulen, Unis und Mobilfunk sich Adressen teilen. */
const maxNewPerDay = () => envInt("MAX_NEW_DEVICES_PER_IP", 150);
/** Abstimmungen pro Anschluss und Minute, gegen Skripte. */
const maxPerMinute = () => envInt("MAX_VOTES_PER_IP_MINUTE", 40);

/** Geräte-Einträge löschen sich zwei Wochen nach der Demo von selbst (14. November 2026). */
function deviceExpireAt() {
  const target = Math.floor(EVENT_END / 1000) + 14 * 86_400;
  const now = Math.floor(Date.now() / 1000);
  return String(Math.max(target, now + 86_400));
}

// Gemeinsamer Teil: Version plus Zählerstand als Lua-Tabelle.
const snapshotLua = (counts: number, version: number) =>
  `{tonumber(redis.call('GET', KEYS[${version}]) or '0'), redis.call('HGETALL', KEYS[${counts}])}`;
const SNAPSHOT_LUA = snapshotLua(2, 3);

/**
 * Atomar in Redis:
 * eine Stimme pro Gerät, ein Wechsel verschiebt die Stimme, Grenzwerte pro Anschluss.
 * KEYS: 1 Gerät, 2 Zähler, 3 Version, 4 Anschluss/Tag, 5 Anschluss/Minute
 * ARGV: 1 Stadt, 2 max. neue Geräte pro Tag, 3 max. Stimmen pro Minute, 4 Ablaufzeit Gerät
 * Rückgabe: {Status, alte Stadt, Rang, Snapshot}; Status 1 gezählt, 0 unverändert, -1 Tagesgrenze, -2 Minutengrenze
 */
const VOTE_LUA = `
local hits = redis.call('INCR', KEYS[5])
if hits == 1 then redis.call('EXPIRE', KEYS[5], 120) end
if hits > tonumber(ARGV[3]) then return {-2, '', 0, ${SNAPSHOT_LUA}} end
local city = ARGV[1]
local raw = redis.call('GET', KEYS[1])
local old = false
local oldRank = 0
if raw then
  old = string.match(raw, '^([^:]+)')
  oldRank = tonumber(string.match(raw, ':(%d+)$') or '0')
end
if old == city then return {0, old, oldRank, ${SNAPSHOT_LUA}} end
if not old then
  local n = redis.call('INCR', KEYS[4])
  if n == 1 then redis.call('EXPIRE', KEYS[4], 90000) end
  if n > tonumber(ARGV[2]) then return {-1, '', 0, ${SNAPSHOT_LUA}} end
end
if old then redis.call('HINCRBY', KEYS[2], old, -1) end
local rank = redis.call('HINCRBY', KEYS[2], city, 1)
redis.call('SET', KEYS[1], city .. ':' .. rank)
redis.call('EXPIREAT', KEYS[1], tonumber(ARGV[4]))
redis.call('INCR', KEYS[3])
return {1, old or '', rank, ${SNAPSHOT_LUA}}
`;

/**
 * Zusage zurückziehen: Geräte-Eintrag löschen und die Stadt um eins verringern.
 * KEYS: 1 Gerät, 2 Zähler, 3 Version, 4 Anschluss/Minute
 * ARGV: 1 max. Stimmen pro Minute
 * Rückgabe: {Status, alte Stadt, Snapshot}; Status 1 entfernt, 0 gab nichts zu entfernen, -2 Minutengrenze
 */
const WITHDRAW_LUA = `
local hits = redis.call('INCR', KEYS[4])
if hits == 1 then redis.call('EXPIRE', KEYS[4], 120) end
if hits > tonumber(ARGV[1]) then return {-2, '', ${SNAPSHOT_LUA}} end
local raw = redis.call('GET', KEYS[1])
if not raw then return {0, '', ${SNAPSHOT_LUA}} end
local old = string.match(raw, '^([^:]+)')
redis.call('DEL', KEYS[1])
if old then
  local n = redis.call('HINCRBY', KEYS[2], old, -1)
  if n < 0 then redis.call('HSET', KEYS[2], old, 0) end
end
redis.call('INCR', KEYS[3])
return {1, old or '', ${SNAPSHOT_LUA}}
`;

// KEYS: 1 Zähler, 2 Version
const READ_LUA = `return ${snapshotLua(1, 2)}`;

function toSnapshot(raw: unknown): Snapshot {
  const [v, flat] = (Array.isArray(raw) ? raw : [0, []]) as [unknown, unknown[]];
  const counts: Counts = {};
  let total = 0;
  if (Array.isArray(flat)) {
    for (let i = 0; i + 1 < flat.length; i += 2) {
      const k = String(flat[i]);
      const n = Number(flat[i + 1]);
      if (CITY_IDS.has(k) && Number.isFinite(n) && n > 0) {
        counts[k] = n;
        total += n;
      }
    }
  }
  return { counts, total, v: Number(v) || 0 };
}

function parseMine(raw: unknown): Mine {
  if (typeof raw !== "string") return null;
  const [city, rank] = raw.split(":");
  return CITY_IDS.has(city) ? { city, rank: Number(rank) || 0 } : null;
}

interface Store {
  readonly persistent: boolean;
  snapshot(): Promise<Snapshot>;
  mine(deviceId: string): Promise<Mine>;
  vote(deviceId: string, net: string, city: string): Promise<VoteOutcome>;
  withdraw(deviceId: string, net: string): Promise<WithdrawOutcome>;
}

class RedisStore implements Store {
  readonly persistent = true;
  private voteScript;
  private withdrawScript;
  private readScript;
  constructor(private r: Redis) {
    this.voteScript = r.createScript<unknown[]>(VOTE_LUA);
    this.withdrawScript = r.createScript<unknown[]>(WITHDRAW_LUA);
    this.readScript = r.createScript<unknown[]>(READ_LUA);
  }
  async snapshot() {
    return toSnapshot(await this.readScript.exec([K.counts, K.version], []));
  }
  async mine(deviceId: string) {
    return parseMine(await this.r.get<string>(K.device(deviceId)));
  }
  async vote(deviceId: string, net: string, city: string): Promise<VoteOutcome> {
    const res = await this.voteScript.exec(
      [K.device(deviceId), K.counts, K.version, K.netDay(net), K.netMinute(net)],
      [city, String(maxNewPerDay()), String(maxPerMinute()), deviceExpireAt()],
    );
    const [status, prev, rank, snap] = res as [number, string, number, unknown];
    const snapshot = toSnapshot(snap);
    if (Number(status) === -1) return { ok: false, reason: "limit", snapshot };
    if (Number(status) === -2) return { ok: false, reason: "rate", snapshot };
    return {
      ok: true,
      mine: { city, rank: Number(rank) || 0 },
      previous: prev && prev !== city ? String(prev) : null,
      snapshot,
    };
  }
  async withdraw(deviceId: string, net: string): Promise<WithdrawOutcome> {
    const res = await this.withdrawScript.exec(
      [K.device(deviceId), K.counts, K.version, K.netMinute(net)],
      [String(maxPerMinute())],
    );
    const [status, old, snap] = res as [number, string, unknown];
    const snapshot = toSnapshot(snap);
    if (Number(status) === -2) return { ok: false, reason: "rate", snapshot };
    return { ok: true, removed: old && CITY_IDS.has(String(old)) ? String(old) : null, snapshot };
  }
}

/** Nur für die lokale Entwicklung ohne Datenbank. */
class MemoryStore implements Store {
  readonly persistent = false;
  private c: Counts = {};
  private v = 0;
  private d = new Map<string, { city: string; rank: number }>();
  private nets = new Map<string, number>();
  private snap(): Snapshot {
    const counts: Counts = {};
    let total = 0;
    for (const [k, n] of Object.entries(this.c)) if (n > 0) (counts[k] = n), (total += n);
    return { counts, total, v: this.v };
  }
  async snapshot() {
    return this.snap();
  }
  async mine(deviceId: string) {
    return this.d.get(deviceId) ?? null;
  }
  async vote(deviceId: string, net: string, city: string): Promise<VoteOutcome> {
    const minuteKey = K.netMinute(net);
    const hits = (this.nets.get(minuteKey) ?? 0) + 1;
    this.nets.set(minuteKey, hits);
    if (hits > maxPerMinute()) return { ok: false, reason: "rate", snapshot: this.snap() };
    const old = this.d.get(deviceId);
    if (old?.city === city) return { ok: true, mine: old, previous: null, snapshot: this.snap() };
    if (!old) {
      const dayKey = K.netDay(net);
      const n = (this.nets.get(dayKey) ?? 0) + 1;
      this.nets.set(dayKey, n);
      if (n > maxNewPerDay()) return { ok: false, reason: "limit", snapshot: this.snap() };
    } else {
      this.c[old.city] = (this.c[old.city] ?? 1) - 1;
    }
    const rank = (this.c[city] = (this.c[city] ?? 0) + 1);
    this.d.set(deviceId, { city, rank });
    this.v += 1;
    return { ok: true, mine: { city, rank }, previous: old?.city ?? null, snapshot: this.snap() };
  }
  async withdraw(deviceId: string, net: string): Promise<WithdrawOutcome> {
    const minuteKey = K.netMinute(net);
    const hits = (this.nets.get(minuteKey) ?? 0) + 1;
    this.nets.set(minuteKey, hits);
    if (hits > maxPerMinute()) return { ok: false, reason: "rate", snapshot: this.snap() };
    const old = this.d.get(deviceId);
    if (!old) return { ok: true, removed: null, snapshot: this.snap() };
    this.d.delete(deviceId);
    this.c[old.city] = Math.max(0, (this.c[old.city] ?? 1) - 1);
    this.v += 1;
    return { ok: true, removed: old.city, snapshot: this.snap() };
  }
}

let store: Store | null = null;
const g = globalThis as unknown as { __wpMemStore?: MemoryStore };

export function getStore(): Store {
  if (store) return store;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    store = new RedisStore(new Redis({ url, token, enableTelemetry: false }));
    return store;
  }
  // Auf Vercel ohne Datenbank würden Stimmen still verloren gehen. Lieber laut scheitern.
  if (process.env.VERCEL_ENV === "production" || process.env.REQUIRE_DATABASE === "1") {
    throw new StoreNotConfiguredError("Keine Redis-Datenbank verbunden");
  }
  store = g.__wpMemStore ??= new MemoryStore();
  return store;
}

// Kurzer Zwischenspeicher pro Server-Instanz, damit Spitzen nicht jede Anfrage bis zu Redis durchreichen.
let cached: { at: number; snap: Snapshot } | null = null;
const CACHE_MS = 1000;

export async function readSnapshot(): Promise<Snapshot> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.snap;
  const snap = await getStore().snapshot();
  rememberSnapshot(snap);
  return snap;
}

export function rememberSnapshot(snap: Snapshot) {
  if (!cached || snap.v >= cached.snap.v || Date.now() - cached.at > CACHE_MS) cached = { at: Date.now(), snap };
}

/** Für die Seite selbst: Fehler dürfen das Rendern nie verhindern. */
export async function safeSnapshot(): Promise<Snapshot | null> {
  try {
    return await readSnapshot();
  } catch {
    return null;
  }
}

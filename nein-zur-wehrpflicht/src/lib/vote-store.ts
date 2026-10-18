import type { Counts, Snapshot } from "./store";

export type MyVote = { city: string; rank: number };
export type VoteState = {
  counts: Counts;
  total: number;
  v: number;
  /** Es gibt einen Zählerstand (vom Server gerendert oder geladen). */
  ready: boolean;
  /** Letzte Abfrage hat geklappt. */
  live: boolean;
  /** false, wenn auf dem Server noch keine Datenbank eingerichtet ist. */
  setup: boolean;
  mine: MyVote | null;
  meLoaded: boolean;
  pending: string | null;
  sheet: boolean;
  /** Hervorgehobene Stadt (Karte oder geteilter Link). */
  focus: string | null;
  invite: string | null;
};

export type VoteResult =
  | { ok: true; city: string; previous: string | null; rank: number; same: boolean }
  | { ok: false; reason: "busy" | "limit" | "rate" | "setup" | "network" | "error" };
export type WithdrawResult =
  | { ok: true; city: string | null }
  | { ok: false; reason: "busy" | "rate" | "setup" | "network" | "error" };

/** Markiert in `pending`, dass gerade eine Zusage zurückgezogen wird. */
export const WITHDRAWING = "__withdraw";

const TOKEN_KEY = "wp-device-token";
const POLL_MS = 5000;
const STALE_GUARD_MS = 30_000;

export function initialState(snap: Snapshot | null, invite: string | null): VoteState {
  return {
    counts: snap?.counts ?? {},
    total: snap?.total ?? 0,
    v: snap?.v ?? 0,
    ready: !!snap,
    live: !!snap,
    setup: true,
    mine: null,
    meLoaded: false,
    pending: null,
    sheet: false,
    focus: invite,
    invite,
  };
}

let state: VoteState = initialState(null, null);
let hydrated = false;
let started = false;
let lastApplyAt = 0;
let failures = 0;
let lastMeAt = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let channel: BroadcastChannel | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<VoteState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function saveToken(t: unknown) {
  if (typeof t !== "string" || !t) return;
  try {
    localStorage.setItem(TOKEN_KEY, t);
  } catch {}
}
function tokenHeader(): Record<string, string> {
  const t = readToken();
  return t ? { "x-device-token": t } : {};
}

function isSnapshot(s: unknown): s is Snapshot {
  return !!s && typeof s === "object" && "counts" in s && "v" in s;
}

function applySnapshot(s: unknown, force = false) {
  if (!isSnapshot(s)) return;
  if (state.pending && !force) return;
  // Ältere Stände (etwa aus dem CDN) überschreiben nie eine frischere Antwort, etwa direkt nach der eigenen Stimme.
  if (!force && s.v < state.v && Date.now() - lastApplyAt < STALE_GUARD_MS) return;
  lastApplyAt = Date.now();
  set({ counts: s.counts, total: s.total, v: s.v, ready: true, live: true });
}

async function fetchCounts() {
  try {
    const res = await fetch("/api/counts");
    const json = await res.json().catch(() => null);
    if (res.status === 503 && json?.error === "setup") {
      failures = 0;
      set({ setup: false, live: false });
      return;
    }
    if (!res.ok) throw new Error(String(res.status));
    failures = 0;
    applySnapshot(json);
    if (!state.live) set({ live: true });
  } catch {
    failures += 1;
    set({ live: false });
  }
}

async function fetchMe() {
  lastMeAt = Date.now();
  try {
    const res = await fetch("/api/me", { headers: tokenHeader(), cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (!json) return;
    saveToken(json.deviceToken);
    if (res.ok && !state.pending) set({ mine: json.mine ?? null, meLoaded: true });
    else if (res.status === 503 && json.error === "setup") set({ setup: false, meLoaded: true });
  } catch {
    // Beim nächsten Sichtbarwerden der Seite noch einmal.
  }
}

function schedule() {
  if (timer) clearTimeout(timer);
  const delay = failures ? Math.min(30_000, POLL_MS * 2 ** failures) : POLL_MS;
  timer = setTimeout(async () => {
    if (document.visibilityState === "visible") await fetchCounts();
    schedule();
  }, delay);
}

function onVisible() {
  if (document.visibilityState !== "visible") return;
  fetchCounts();
  if (Date.now() - lastMeAt > 20_000) fetchMe();
}

export const voteStore = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  /** Einmal pro Tab: Startwerte aus dem Server-Rendering übernehmen. */
  hydrate(init: VoteState) {
    if (hydrated) return;
    hydrated = true;
    state = { ...init };
    lastApplyAt = Date.now();
  },
  start() {
    if (started) return;
    started = true;
    fetchMe();
    fetchCounts();
    schedule();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);
    try {
      channel = new BroadcastChannel("wp-vote");
      channel.onmessage = (e) => {
        const d = e.data as { mine?: MyVote; withdrawn?: boolean; snapshot?: Snapshot };
        if (d?.snapshot) applySnapshot(d.snapshot);
        if (d?.mine) set({ mine: d.mine });
        if (d?.withdrawn) set({ mine: null, sheet: false });
      };
    } catch {}
  },
  async vote(city: string): Promise<VoteResult> {
    if (state.pending) return { ok: false, reason: "busy" };
    if (state.mine?.city === city) {
      set({ sheet: true });
      return { ok: true, city, previous: null, rank: state.mine.rank, same: true };
    }
    const before = { counts: state.counts, total: state.total };
    const old = state.mine?.city ?? null;
    const counts = { ...state.counts, [city]: (state.counts[city] ?? 0) + 1 };
    if (old) counts[old] = Math.max(0, (counts[old] ?? 1) - 1);
    set({ pending: city, counts, total: old ? state.total : state.total + 1 });

    const revert = () => set({ pending: null, counts: before.counts, total: before.total });
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "content-type": "application/json", ...tokenHeader() },
        body: JSON.stringify({ city }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      saveToken(json.deviceToken);
      if (res.ok && json.mine) {
        set({ pending: null });
        applySnapshot(json.snapshot, true);
        set({ mine: json.mine, meLoaded: true, sheet: true, focus: city });
        try {
          channel?.postMessage({ mine: json.mine, snapshot: json.snapshot });
        } catch {}
        return { ok: true, city, previous: json.previous ?? null, rank: json.mine.rank, same: false };
      }
      revert();
      if (json.snapshot) applySnapshot(json.snapshot, true);
      if (res.status === 429) return { ok: false, reason: json.error === "rate" ? "rate" : "limit" };
      if (res.status === 503 && json.error === "setup") {
        set({ setup: false });
        return { ok: false, reason: "setup" };
      }
      return { ok: false, reason: "error" };
    } catch {
      revert();
      return { ok: false, reason: "network" };
    }
  },
  async withdraw(): Promise<WithdrawResult> {
    if (state.pending) return { ok: false, reason: "busy" };
    const mine = state.mine;
    if (!mine) return { ok: true, city: null };
    const before = { counts: state.counts, total: state.total, mine };
    const counts = { ...state.counts, [mine.city]: Math.max(0, (state.counts[mine.city] ?? 1) - 1) };
    set({ pending: WITHDRAWING, counts, total: Math.max(0, state.total - 1), mine: null, sheet: false });

    const revert = () => set({ pending: null, counts: before.counts, total: before.total, mine: before.mine });
    try {
      const res = await fetch("/api/vote", { method: "DELETE", headers: tokenHeader(), cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      saveToken(json.deviceToken);
      if (res.ok) {
        set({ pending: null, focus: null, meLoaded: true });
        if (json.snapshot) applySnapshot(json.snapshot, true);
        try {
          channel?.postMessage({ withdrawn: true, snapshot: json.snapshot });
        } catch {}
        return { ok: true, city: mine.city };
      }
      revert();
      if (json.snapshot) applySnapshot(json.snapshot, true);
      if (res.status === 429) return { ok: false, reason: "rate" };
      if (res.status === 503 && json.error === "setup") return { ok: false, reason: "setup" };
      return { ok: false, reason: "error" };
    } catch {
      revert();
      return { ok: false, reason: "network" };
    }
  },
  openSheet: () => set({ sheet: true }),
  closeSheet: () => set({ sheet: false }),
  setFocus: (focus: string | null) => set({ focus }),
};

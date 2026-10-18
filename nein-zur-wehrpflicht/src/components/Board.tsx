"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CITIES, mapsUrl } from "@/lib/cities";

type Counts = Record<string, number>;
type Sort = "flyer" | "top" | "az";
type ApiState = { counts: Counts; total: number; mine: string | null; deviceToken?: string; error?: string };

const TOKEN_KEY = "wp-device-token";
const POLL_MS = 5000;

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function saveToken(t?: string) {
  if (!t) return;
  try {
    localStorage.setItem(TOKEN_KEY, t);
  } catch {}
}
function headers(): HeadersInit {
  const t = readToken();
  return t ? { "x-device-token": t } : {};
}
const fmt = (n: number) => n.toLocaleString("de-DE");

export default function Board() {
  const [data, setData] = useState<ApiState | null>(null);
  const [offline, setOffline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("flyer");
  const [toast, setToast] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/votes", { headers: headers(), cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json: ApiState = await res.json();
      saveToken(json.deviceToken);
      setData(json);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    load();
    const tick = () => {
      if (document.visibilityState === "visible") load();
    };
    const t = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [load]);

  const vote = async (cityId: string) => {
    if (busy || !data) return;
    const prev = data.mine;
    setBusy(true);
    // Sofort anzeigen, der Server bestätigt gleich danach.
    const optimistic: Counts = { ...data.counts, [cityId]: (data.counts[cityId] ?? 0) + 1 };
    if (prev) optimistic[prev] = Math.max(0, (optimistic[prev] ?? 1) - 1);
    setData({ ...data, counts: optimistic, total: prev ? data.total : data.total + 1, mine: cityId });
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers() },
        body: JSON.stringify({ city: cityId }),
      });
      const json: ApiState = await res.json();
      saveToken(json.deviceToken);
      if (res.status === 429) {
        setData({ ...json, mine: prev });
        showToast("Von deinem Internetanschluss kamen heute schon sehr viele Stimmen. Bitte versuch es morgen noch einmal.");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setData(json);
      const name = CITIES.find((c) => c.id === cityId)?.name ?? "";
      showToast(prev ? `Gewechselt: du bist in ${name} dabei` : `Du bist in ${name} dabei.`);
      setShareOpen(true);
    } catch {
      setData(data);
      showToast("Das hat nicht geklappt. Prüf deine Verbindung und versuch es noch einmal.");
    } finally {
      setBusy(false);
    }
  };

  const counts = data?.counts ?? {};
  const max = Math.max(1, ...CITIES.map((c) => counts[c.id] ?? 0));
  const top = useMemo(
    () =>
      [...CITIES]
        .filter((c) => (counts[c.id] ?? 0) > 0)
        .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
        .slice(0, 3),
    [counts],
  );
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = CITIES.filter((c) => !q || c.name.toLowerCase().includes(q) || c.place.toLowerCase().includes(q));
    if (sort === "top") return [...filtered].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
    if (sort === "az") return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "de"));
    return filtered;
  }, [query, sort, counts]);

  const mineCity = CITIES.find((c) => c.id === data?.mine);
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = mineCity
    ? `Ich bin am 31.10. ab 14 Uhr in ${mineCity.name} (${mineCity.place}) dabei: Protest gegen die Wehrpflicht, für unsere Zukunft. Kommst du mit?`
    : "Am 31.10. ab 14 Uhr: Protest gegen die Wehrpflicht in 21 Städten. Sag, wo du dabei bist:";

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Nein zur Wehrpflicht", text: shareText, url: shareUrl });
      } catch {}
    } else {
      copyLink();
    }
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      showToast("Link kopiert");
    } catch {
      showToast(shareUrl);
    }
  };

  return (
    <section className="board" id="staedte" aria-labelledby="board-h">
      <div className="inner">
        <h2 className="section-title" id="board-h">
          Wo bist <em>du dabei?</em>
        </h2>

        <div className="total" aria-live="polite">
          <span className="total-num">{data ? fmt(data.total) : "…"}</span>
          <span className="total-text">{data?.total === 1 ? "Person ist schon dabei" : "Leute sind schon dabei"}</span>
        </div>

        {offline && <div className="alert">Die Live-Zahlen laden gerade nicht. Wir versuchen es automatisch weiter.</div>}

        {top.length > 0 && (
          <div>
            <p className="eyebrow" style={{ margin: "0 0 8px" }}>
              Am lautesten gerade
            </p>
            <div className="podium">
              {top.map((c, i) => (
                <div className="podium-item" key={c.id}>
                  <span className="podium-rank">Platz {i + 1}</span>
                  <span className="podium-name">{c.name}</span>
                  <span className="podium-count">{fmt(counts[c.id] ?? 0)} dabei</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="controls">
          <input
            id="city-search"
            className="search"
            type="search"
            placeholder="Deine Stadt suchen"
            aria-label="Stadt suchen"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="pills" role="group" aria-label="Sortierung">
            {(
              [
                ["flyer", "Alle"],
                ["top", "Top"],
                ["az", "A–Z"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" className="pill" aria-pressed={sort === k} onClick={() => setSort(k)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <ul className="grid">
          {list.length === 0 && <li className="empty">Keine Stadt gefunden. Der Aufruf nennt 21 Städte.</li>}
          {list.map((c) => {
            const n = counts[c.id] ?? 0;
            const mine = data?.mine === c.id;
            return (
              <li key={c.id} className={"card" + (mine ? " mine" : "")}>
                {mine && <span className="mine-tag">Du bist dabei</span>}
                <div className="card-head">
                  <h3 className="card-name">{c.name}</h3>
                  <div className="card-count">
                    <b>{data ? fmt(n) : "–"}</b>
                    <small>dabei</small>
                  </div>
                </div>
                <div className="card-place">
                  <a href={mapsUrl(c)} target="_blank" rel="noopener noreferrer">
                    {c.place}
                  </a>
                  <span>ab 14:00 Uhr</span>
                </div>
                <div className="bar" aria-hidden="true">
                  <i style={{ width: `${(n / max) * 100}%` }} />
                </div>
                {mine ? (
                  <button type="button" className="vote-btn on" disabled>
                    ✓ Du bist dabei
                  </button>
                ) : (
                  <button
                    type="button"
                    className={"vote-btn" + (data?.mine ? " switch" : "")}
                    disabled={!data || busy}
                    onClick={() => vote(c.id)}
                  >
                    {data?.mine ? "Hierhin wechseln" : "Ich bin dabei"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <p className="note">
          Pro Gerät zählt eine Stimme. Du kannst deinen Standort jederzeit wechseln, die Stimme zieht dann einfach mit um.
        </p>
      </div>

      <div className={"share-bar" + (shareOpen && mineCity ? " show" : "")} role="region" aria-label="Teilen">
        <div className="share-inner">
          <span className="share-text">
            Du bist in <b>{mineCity?.name}</b> dabei. Sag es weiter.
          </span>
          <div className="share-actions">
            <button type="button" className="primary" onClick={nativeShare}>
              Teilen
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram
            </a>
            {mineCity && <a href={`/kalender/${mineCity.id}`}>In Kalender</a>}
            <button type="button" className="share-close" aria-label="Schließen" onClick={() => setShareOpen(false)}>
              ×
            </button>
          </div>
        </div>
      </div>

      <div className={"toast" + (toast ? " show" : "")} role="status" aria-live="polite">
        {toast}
      </div>
    </section>
  );
}

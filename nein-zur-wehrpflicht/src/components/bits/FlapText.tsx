"use client";

// Basiert auf "SplitFlapText" aus React Bits (MIT + Commons Clause, siehe README in diesem Ordner).
// Angepasst: blättert bei jeder Änderung von `text` um (für einen Countdown), Farben aus dem Seiten-Thema,
// Styles einmal global statt pro Instanz, Klappen fallen nacheinander wie bei einer echten Anzeigetafel.

import { useEffect, useRef, useState } from "react";

type Tile = { current: string; next: string; flipping: boolean; tick: number };

const tilesOf = (s: string): Tile[] => s.split("").map((c) => ({ current: c, next: c, flipping: false, tick: 0 }));
const DIGITS = "0123456789";

export default function FlapText({
  text,
  flips = 2,
  flipMs = 110,
  staggerMs = 50,
  className = "",
}: {
  text: string;
  flips?: number;
  flipMs?: number;
  staggerMs?: number;
  className?: string;
}) {
  const [tiles, setTiles] = useState<Tile[]>(() => tilesOf(text));
  const shown = useRef(text);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const from = shown.current.padEnd(text.length, " ").slice(0, text.length);
    if (from === text) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || document.visibilityState !== "visible") {
      shown.current = text;
      setTiles(tilesOf(text));
      return;
    }
    if (from.length !== tiles.length) setTiles(tilesOf(from));

    const plans = text
      .split("")
      .map((target, index) => {
        if (from[index] === target) return null;
        const seq = Array.from({ length: flips }, () => DIGITS[Math.floor(Math.random() * 10)]);
        seq.push(target);
        return { index, from: from[index], seq, start: index * staggerMs, step: -1, done: false };
      })
      .filter((p): p is NonNullable<typeof p> => !!p);

    const t0 = performance.now();
    const tick = (now: number) => {
      const elapsed = now - t0;
      const updates: Array<[number, Partial<Tile>]> = [];
      let more = false;
      for (const p of plans) {
        const local = elapsed - p.start;
        if (local < 0) {
          more = true;
          continue;
        }
        const step = Math.floor(local / flipMs);
        if (step < p.seq.length) {
          more = true;
          if (step !== p.step) {
            p.step = step;
            updates.push([p.index, { current: step === 0 ? p.from : p.seq[step - 1], next: p.seq[step], flipping: true }]);
          }
        } else if (!p.done) {
          p.done = true;
          const last = p.seq[p.seq.length - 1];
          updates.push([p.index, { current: last, next: last, flipping: false }]);
        }
      }
      if (updates.length)
        setTiles((prev) => {
          const next = prev.length === text.length ? [...prev] : tilesOf(from);
          for (const [i, u] of updates) next[i] = { ...next[i], ...u, tick: next[i].tick + 1 };
          return next;
        });
      if (more) raf.current = requestAnimationFrame(tick);
      else shown.current = text;
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      shown.current = text;
      setTiles(tilesOf(text));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span className={`flap inline-flex ${className}`} role="img" aria-label={text}>
      {tiles.map((t, i) => (
        <span className="flap-tile" aria-hidden="true" key={i}>
          {/* Oben steht schon das neue Zeichen, unten noch das alte, bis die Klappen darüberfallen. */}
          <span className="flap-half flap-top">
            <span className="flap-char">{t.flipping ? t.next : t.current}</span>
          </span>
          <span className="flap-half flap-bottom">
            <span className="flap-char">{t.current}</span>
          </span>
          {t.flipping ? (
            <>
              <span className="flap-leaf flap-front" key={`f${t.tick}`} style={{ animationDuration: `${flipMs}ms` }}>
                <span className="flap-char">{t.current}</span>
              </span>
              <span className="flap-leaf flap-back" key={`b${t.tick}`} style={{ animationDuration: `${flipMs}ms` }}>
                <span className="flap-char">{t.next}</span>
              </span>
            </>
          ) : null}
        </span>
      ))}
    </span>
  );
}

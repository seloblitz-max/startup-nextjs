"use client";

import { CheckCircle, CircleNotch, X } from "@phosphor-icons/react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CITIES, CITY_BY_ID } from "@/lib/cities";
import { fmt } from "@/lib/format";
import { CITY_XY, GERMANY_PATH, MAP_H, MAP_W } from "@/lib/germany-map";
import type { Counts } from "@/lib/store";
import { castVote, useVote } from "./VoteProvider";

const TOP = 80; // Platz über Deutschland für hohe Spitzen
const MAX_SPIKE = 300;
const MIN_SPIKE = 26;
const BASE = 11;
const SPRING = { type: "spring" as const, stiffness: 90, damping: 18, mass: 0.9 };

// Nördliche Städte zuerst zeichnen, damit südliche Spitzen davor liegen.
const ORDER = [...CITIES].sort((a, b) => CITY_XY[a.id][1] - CITY_XY[b.id][1]);

function heightFor(n: number, max: number) {
  if (n <= 0) return 0;
  return MIN_SPIKE + (MAX_SPIKE - MIN_SPIKE) * (n / max);
}

type NameLabel = { x: number; y: number; anchor: "start" | "end" | "middle"; leader?: boolean };

/**
 * Wo der Name jeder Stadt steht (Grundlinie, in Kartenkoordinaten). Von Hand gesetzt, damit sich auch im
 * Ruhrgebiet nichts überlappt; dort führen kurze Linien vom Punkt zum Namen.
 */
const NAME_AT: Record<string, NameLabel> = {
  hamburg: { x: 472, y: 288, anchor: "start" },
  bremen: { x: 324, y: 365, anchor: "end" },
  berlin: { x: 812, y: 453, anchor: "start" },
  hannover: { x: 446, y: 483, anchor: "start" },
  bielefeld: { x: 322, y: 539, anchor: "start" },
  magdeburg: { x: 607, y: 522, anchor: "end" },
  leipzig: { x: 717, y: 651, anchor: "start" },
  dresden: { x: 859, y: 694, anchor: "start" },
  erfurt: { x: 577, y: 714, anchor: "start" },
  dortmund: { x: 213, y: 621, anchor: "start" },
  essen: { x: 228, y: 663, anchor: "start", leader: true },
  duesseldorf: { x: 228, y: 705, anchor: "start", leader: true },
  koeln: { x: 228, y: 747, anchor: "start", leader: true },
  bonn: { x: 228, y: 789, anchor: "start", leader: true },
  frankfurt: { x: 330, y: 856, anchor: "start" },
  mainz: { x: 256, y: 873, anchor: "end" },
  nuernberg: { x: 555, y: 966, anchor: "end" },
  karlsruhe: { x: 265, y: 1037, anchor: "end" },
  stuttgart: { x: 379, y: 1077, anchor: "start" },
  muenchen: { x: 642, y: 1184, anchor: "start" },
  freiburg: { x: 199, y: 1203, anchor: "end" },
};

const shortName = (name: string) => (name === "Frankfurt am Main" ? "Frankfurt" : name);

/** Die drei Städte mit den meisten Zusagen und die eigene Stadt bekommen ihre Zahl hinter den Namen. */
function pickLabels(counts: Counts, mine: string | null) {
  const out = new Set(
    CITIES.filter((c) => (counts[c.id] ?? 0) > 0)
      .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
      .slice(0, 3)
      .map((c) => c.id),
  );
  if (mine) out.add(mine);
  return out;
}

export default function SpikeMap() {
  const counts = useVote((s) => s.counts);
  const mine = useVote((s) => s.mine?.city ?? null);
  const pending = useVote((s) => s.pending);
  const ready = useVote((s) => s.ready);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [sel, setSel] = useState<string | null>(null);
  // Erst nach dem ersten Rendern wachsen lassen, damit Server und Browser dasselbe zeichnen.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (inView || reduce) setGrown(true);
  }, [inView, reduce]);

  const max = Math.max(1, ...Object.values(counts));
  const labels = useMemo(() => pickLabels(counts, mine), [counts, mine]);
  const top = useMemo(
    () =>
      CITIES.filter((c) => (counts[c.id] ?? 0) > 0)
        .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
        .slice(0, 3),
    [counts],
  );
  const summary = top.length
    ? `Karte der Zusagen. Am meisten: ${top.map((c) => `${c.name} ${fmt(counts[c.id] ?? 0)}`).join(", ")}.`
    : "Karte der 21 Städte. Noch keine Zusagen.";

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSel(null);
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setSel(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [sel]);

  const selCity = sel ? CITY_BY_ID[sel] : null;
  const [sx, sy] = sel ? CITY_XY[sel] : [0, 0];

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[34rem]">
      <svg
        viewBox={`0 ${-TOP} ${MAP_W} ${MAP_H + TOP}`}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={summary}
      >
        <defs>
          <pattern id="map-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="2.3" fill="#f3efe6" fillOpacity="0.2" />
          </pattern>
          <linearGradient id="spike-signal" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#a84300" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#ff7405" />
            <stop offset="1" stopColor="#ff8f2e" />
          </linearGradient>
          <linearGradient id="spike-paper" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#f3efe6" stopOpacity="0.5" />
            <stop offset="1" stopColor="#f3efe6" />
          </linearGradient>
        </defs>

        <path d={GERMANY_PATH} fill="url(#map-dots)" stroke="#f3efe6" strokeOpacity="0.32" strokeWidth="2.2" strokeLinejoin="round" />

        {ORDER.map((c) => {
          const [x, y] = CITY_XY[c.id];
          const n = counts[c.id] ?? 0;
          const h = grown ? heightFor(n, max) : 0;
          const isMine = mine === c.id;
          const isSel = sel === c.id;
          return (
            <g key={c.id} transform={`translate(${x} ${y})`}>
              <motion.path
                initial={false}
                animate={{ d: `M${-BASE} 0 L0 ${-h} L${BASE} 0 Z` }}
                transition={reduce ? { duration: 0 } : SPRING}
                fill={isMine ? "url(#spike-paper)" : "url(#spike-signal)"}
              />
              <circle r={isSel ? 8 : 5.5} fill={isMine ? "#f3efe6" : n > 0 ? "#ff8f2e" : "#f3efe6"} fillOpacity={n > 0 || isMine ? 1 : 0.55} />
              {isSel ? <circle r="16" fill="none" stroke="#f3efe6" strokeWidth="2.5" /> : null}
              <circle
                r="34"
                fill="transparent"
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSel(isSel ? null : c.id);
                }}
              >
                <title>{`${c.name}: ${fmt(n)} dabei`}</title>
              </circle>
            </g>
          );
        })}

        {CITIES.map((c) => {
          const [x, y] = CITY_XY[c.id];
          const at = NAME_AT[c.id];
          const isMine = mine === c.id;
          const n = counts[c.id] ?? 0;
          return (
            <g
              key={c.id}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSel(sel === c.id ? null : c.id);
              }}
            >
              {at.leader ? (
                <path d={`M${x + 9} ${y + 3} L${at.x - 8} ${at.y - 10}`} stroke="#f3efe6" strokeOpacity="0.4" strokeWidth="2" fill="none" />
              ) : null}
              <text
                x={at.x}
                y={at.y}
                textAnchor={at.anchor}
                className={`font-display text-[30px] font-extrabold uppercase ${isMine ? "fill-signal-hi" : "fill-paper"}`}
                style={{ paintOrder: "stroke", stroke: "#0c0b0a", strokeWidth: 7, strokeLinejoin: "round" }}
              >
                {shortName(c.name)}
                {ready && labels.has(c.id) ? (
                  <tspan dx="9" className={isMine ? "fill-paper" : "fill-signal-hi"}>
                    {fmt(n)}
                  </tspan>
                ) : null}
              </text>
            </g>
          );
        })}
      </svg>

      {selCity ? (
        <div
          className="map-tip"
          style={
            {
              "--x": `${(sx / MAP_W) * 100}%`,
              "--y": `${((sy + TOP) / (MAP_H + TOP)) * 100}%`,
            } as React.CSSProperties
          }
          data-below={sy < 420 || undefined}
          role="dialog"
          aria-label={selCity.name}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-2xl font-extrabold uppercase leading-none">{selCity.name}</p>
              <p className="mt-1 text-sm text-paper-2">{selCity.place}</p>
            </div>
            <button type="button" onClick={() => setSel(null)} className="-m-1 rounded-sm p-1 text-paper-2 hover:text-paper" aria-label="Schließen">
              <X weight="bold" className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-paper-2">
            <span className="text-paper">{fmt(counts[selCity.id] ?? 0)}</span> dabei
          </p>
          {mine === selCity.id ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-paper">
              <CheckCircle weight="fill" className="size-5 text-signal" aria-hidden="true" /> Du bist dabei
            </p>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-signal mt-3 w-full"
              disabled={!!pending}
              onClick={async () => {
                const r = await castVote(selCity.id);
                if (r.ok) setSel(null);
              }}
            >
              {pending === selCity.id ? <CircleNotch className="size-4 animate-spin" aria-hidden="true" /> : null}
              {mine ? "Hierher wechseln" : "Ich bin dabei"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

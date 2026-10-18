"use client";

import { useRef, type KeyboardEvent, type MouseEvent } from "react";
import { CITIES, CITY_COUNT, shortName } from "@/lib/cities";
import { cn, fmt } from "@/lib/format";
import {
  CITY_XY,
  GERMANY_PATH,
  LAYOUT_COMPACT,
  LAYOUT_WIDE,
  MAP_H,
  MAP_W,
  nearestCity,
  type MapLayout,
} from "@/lib/map-layout";
import type { Counts } from "@/lib/store";
import { voteStore } from "@/lib/vote-store";
import { useVote } from "./VoteProvider";

/** Ab dieser Breite (30rem, wie in globals.css) gilt die Beschriftung für breite Karten. */
const WIDE_PX = 480;

function select(id: string) {
  voteStore.setFocus(id);
  voteStore.trackView(id);
}

/**
 * Deutschlandkarte mit allen Treffpunkten. Städte, für die Gen Z regelt hauptverantwortlich ist, sind orange, alle
 * anderen weiß. Ein Tipp in die Nähe einer Stadt wählt sie aus, ihr Treffpunkt steht dann neben der Karte.
 */
export default function CityMap() {
  const counts = useVote((s) => s.counts);
  const ready = useVote((s) => s.ready);
  const focus = useVote((s) => s.focus);
  const mine = useVote((s) => s.mine?.city ?? null);
  const selected = focus ?? mine;
  const svg = useRef<SVGSVGElement>(null);

  // Tipp neben einen Punkt: die nächste Stadt in Reichweite nehmen, damit auch kleine Punkte leicht zu treffen sind.
  function onClick(e: MouseEvent<SVGSVGElement>) {
    const el = svg.current;
    const ctm = el?.getScreenCTM();
    if (!el || !ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const wide = el.clientWidth >= WIDE_PX;
    // Etwa 22 Pixel auf dem Bildschirm, umgerechnet in Kartenpunkte
    const reach = (22 * MAP_W) / Math.max(1, el.clientWidth);
    const id = nearestCity(p.x, p.y, wide ? LAYOUT_WIDE : LAYOUT_COMPACT, Math.max(40, reach));
    if (id) select(id);
  }

  return (
    <div className="map">
      <svg
        ref={svg}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        role="group"
        aria-label={`Karte von Deutschland mit allen ${CITY_COUNT} Treffpunkten`}
        onClick={onClick}
      >
        <path d={GERMANY_PATH} className="map-land" />
        <Layer layout={LAYOUT_COMPACT} className="map-compact" counts={counts} ready={ready} selected={selected} mine={mine} />
        <Layer layout={LAYOUT_WIDE} className="map-wide" counts={counts} ready={ready} selected={selected} mine={mine} />
      </svg>
    </div>
  );
}

function Layer({
  layout,
  className,
  counts,
  ready,
  selected,
  mine,
}: {
  layout: MapLayout;
  className: string;
  counts: Counts;
  ready: boolean;
  selected: string | null;
  mine: string | null;
}) {
  // Ausgewählte Stadt zuletzt zeichnen, damit ihr Ring über allem liegt.
  const order = selected ? [...CITIES.filter((c) => c.id !== selected), ...CITIES.filter((c) => c.id === selected)] : CITIES;
  return (
    <g className={className}>
      {CITIES.map((c) => {
        const leader = layout.labels[c.id].leader;
        return leader ? <line key={c.id} className="map-leader" x1={leader[0]} y1={leader[1]} x2={leader[2]} y2={leader[3]} /> : null;
      })}
      {order.map((c) => {
        const [x, y] = CITY_XY[c.id];
        const r = c.lead ? layout.marker.lead : layout.marker.other;
        const label = layout.labels[c.id];
        const n = counts[c.id] ?? 0;
        const isSelected = selected === c.id;
        const onKey = (e: KeyboardEvent<SVGGElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            select(c.id);
          }
        };
        return (
          <g
            key={c.id}
            className={cn("map-city", c.lead && "is-lead")}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${c.name}, Treffpunkt ${c.place}${ready ? `, ${fmt(n)} dabei` : ""}${mine === c.id ? ", deine Stadt" : ""}${
              c.lead ? ", organisiert von Gen Z regelt" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              select(c.id);
            }}
            onKeyDown={onKey}
          >
            {isSelected ? <circle className="map-pulse" cx={x} cy={y} r={r} /> : null}
            <circle className="map-ring" cx={x} cy={y} r={r + 7} />
            <circle className="map-dot" cx={x} cy={y} r={r} />
            <text className="map-label" x={label.x} y={label.y} textAnchor={label.anchor} fontSize={layout.font}>
              {shortName(c)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

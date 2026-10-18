import { CITIES, shortName } from "./cities";
import { MAP_H, MAP_W, PROJECTION } from "./germany-map";

export { GERMANY_PATH, MAP_H, MAP_W } from "./germany-map";

const { n, F, r0, lon0, minX, minY, scale, pad } = PROJECTION;
const rad = (d: number) => (d * Math.PI) / 180;
const t = (p: number) => Math.tan(Math.PI / 4 + p / 2);

/** Punkt auf der Karte für eine Koordinate, mit derselben Projektion wie der Umriss (scripts/build-map.mjs). */
export function project(lat: number, lng: number): [number, number] {
  const r = F / Math.pow(t(rad(lat)), n);
  const a = n * (rad(lng) - lon0);
  return [pad + (r * Math.sin(a) - minX) * scale, pad + (r * Math.cos(a) - r0 - minY) * scale];
}

export const CITY_XY: Record<string, [number, number]> = Object.fromEntries(CITIES.map((c) => [c.id, project(c.lat, c.lng)]));

// Breite der Zeichen in Lexend Bold, in em, gemessen an der Schriftdatei. Unbekannte Zeichen zählen breit.
const ADVANCE: Record<string, number> = {
  A: 0.694, B: 0.701, C: 0.694, D: 0.772, E: 0.645, F: 0.618, G: 0.782, H: 0.779, I: 0.555, J: 0.665, K: 0.739,
  L: 0.609, M: 0.878, N: 0.807, O: 0.812, P: 0.662, Q: 0.812, R: 0.702, S: 0.634, T: 0.655, U: 0.765, V: 0.712,
  W: 0.993, X: 0.705, Y: 0.689, Z: 0.683, a: 0.659, b: 0.658, c: 0.545, d: 0.654, e: 0.586, f: 0.393, g: 0.669,
  h: 0.635, i: 0.319, j: 0.316, k: 0.626, l: 0.304, m: 0.962, n: 0.635, o: 0.641, p: 0.659, q: 0.658, r: 0.455,
  s: 0.495, t: 0.398, u: 0.642, v: 0.605, w: 0.834, x: 0.606, y: 0.62, z: 0.55, Ä: 0.694, Ö: 0.812, Ü: 0.765,
  ä: 0.659, ö: 0.641, ü: 0.642, ß: 0.667, " ": 0.32, "-": 0.448, ".": 0.257,
};
const textWidth = (s: string) => [...s].reduce((w, ch) => w + (ADVANCE[ch] ?? 0.8), 0);

type Box = [number, number, number, number];

export type MapLabel = {
  /** Textanker und Grundlinie */
  x: number;
  y: number;
  anchor: "start" | "end" | "middle";
  /** Fläche des Namens, auch zum Antippen */
  box: Box;
  /** Linie vom Punkt zum Namen, wo es eng ist */
  leader: [number, number, number, number] | null;
};

export type MapLayout = {
  /** Schriftgröße der Namen in Kartenpunkten */
  font: number;
  marker: { lead: number; other: number };
  labels: Record<string, MapLabel>;
};

const overlap = (a: Box, b: Box) =>
  Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
const grow = (b: Box, d: number): Box => [b[0] - d, b[1] - d, b[2] + d, b[3] + d];

function circleHitsBox(cx: number, cy: number, r: number, b: Box) {
  const dx = cx - Math.max(b[0], Math.min(cx, b[2]));
  const dy = cy - Math.max(b[1], Math.min(cy, b[3]));
  return dx * dx + dy * dy < r * r;
}

function segmentNearPoint(s: [number, number, number, number], px: number, py: number, r: number) {
  const [x1, y1, x2, y2] = s;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = dx * dx + dy * dy || 1;
  const k = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len));
  return Math.hypot(x1 + k * dx - px, y1 + k * dy - py) < r;
}

function segmentHitsBox(s: [number, number, number, number], b: Box) {
  // Stichproben entlang der Linie reichen hier: Die Namen sind viel größer als der Abstand der Proben.
  for (let i = 0; i <= 12; i++) {
    const x = s[0] + ((s[2] - s[0]) * i) / 12;
    const y = s[1] + ((s[3] - s[1]) * i) / 12;
    if (x > b[0] && x < b[2] && y > b[1] && y < b[3]) return true;
  }
  return false;
}

/**
 * Setzt die Namen aller Städte so, dass sie sich nicht überlappen und keinen anderen Punkt verdecken.
 * Zuerst rechts oder links neben dem Punkt, dann schräg darüber oder darunter, und wo es eng ist (Rheinland,
 * Ruhrgebiet) etwas weiter weg mit einer kurzen Linie. Die engsten Städte kommen zuerst an die Reihe.
 */
function placeLabels(font: number, markerLead: number, markerOther: number): MapLayout {
  const pts = CITIES.map((c) => {
    const [x, y] = CITY_XY[c.id];
    return { id: c.id, x, y, r: c.lead ? markerLead : markerOther, w: textWidth(shortName(c)) * font * (c.lead ? 1.03 : 1) };
  });
  const crowd = (p: (typeof pts)[number]) => pts.filter((q) => q !== p && Math.hypot(q.x - p.x, q.y - p.y) < font * 5).length;
  const order = [...pts].sort((a, b) => crowd(b) - crowd(a) || a.x - b.x);

  const asc = font * 0.74; // Großbuchstaben über der Grundlinie, mit etwas Luft
  const desc = font * 0.24; // Unterlängen (g, p)
  const placed: Box[] = [];
  const lines: Array<[number, number, number, number]> = [];
  const labels: Record<string, MapLabel> = {};

  for (const p of order) {
    const gap = p.r + font * 0.3;
    const cands: Array<{ anchor: MapLabel["anchor"]; x: number; cy: number; leader: boolean }> = [
      { anchor: "start", x: p.x + gap, cy: p.y, leader: false },
      { anchor: "end", x: p.x - gap, cy: p.y, leader: false },
      { anchor: "start", x: p.x + gap * 0.55, cy: p.y - p.r - font * 0.5, leader: false },
      { anchor: "start", x: p.x + gap * 0.55, cy: p.y + p.r + font * 0.5, leader: false },
      { anchor: "end", x: p.x - gap * 0.55, cy: p.y - p.r - font * 0.5, leader: false },
      { anchor: "end", x: p.x - gap * 0.55, cy: p.y + p.r + font * 0.5, leader: false },
      { anchor: "middle", x: p.x, cy: p.y - p.r - font * 0.75, leader: false },
      { anchor: "middle", x: p.x, cy: p.y + p.r + font * 0.75, leader: false },
    ];
    for (const dist of [1.6, 2.6, 3.6, 4.6]) {
      for (const dy of [0, -1.15, 1.15, -2.3, 2.3, -3.45, 3.45]) {
        cands.push({ anchor: "start", x: p.x + gap + font * dist, cy: p.y + font * dy, leader: true });
        cands.push({ anchor: "end", x: p.x - gap - font * dist, cy: p.y + font * dy, leader: true });
      }
    }

    let best: { label: MapLabel; cost: number } | null = null;
    for (const c of cands) {
      const x0 = c.anchor === "start" ? c.x : c.anchor === "end" ? c.x - p.w : c.x - p.w / 2;
      const baseline = c.cy + (asc - desc) / 2;
      const box: Box = [x0, baseline - asc, x0 + p.w, baseline + desc];
      const near = c.anchor === "start" ? box[0] - font * 0.15 : box[2] + font * 0.15;
      const leader: MapLabel["leader"] = c.leader ? [p.x, p.y, near, c.cy] : null;

      let cost = c.leader ? 1 : 0;
      if (box[0] < 6 || box[2] > MAP_W - 6 || box[1] < 6 || box[3] > MAP_H - 6) cost += 1000;
      const padded = grow(box, font * 0.22);
      for (const b of placed) cost += overlap(padded, b) * 10;
      for (const q of pts) {
        if (circleHitsBox(q.x, q.y, q.r + font * 0.18, box)) cost += 400;
        if (leader && q !== p && segmentNearPoint(leader, q.x, q.y, q.r + font * 0.2)) cost += 400;
      }
      if (leader) for (const b of placed) if (segmentHitsBox(leader, b)) cost += 300;
      for (const l of lines) if (segmentHitsBox(l, box)) cost += 300;

      if (!best || cost < best.cost) best = { label: { x: c.x, y: baseline, anchor: c.anchor, box, leader }, cost };
      if (cost === 0) break;
    }
    const label = best!.label;
    labels[p.id] = label;
    placed.push(grow(label.box, font * 0.05));
    if (label.leader) lines.push(label.leader);
  }
  return { font, marker: { lead: markerLead, other: markerOther }, labels };
}

/** Für schmale Karten (Handy): größere Schrift im Verhältnis zur Karte. */
export const LAYOUT_COMPACT = placeLabels(34, 15, 11);
/** Für breite Karten (Tablet, Computer). */
export const LAYOUT_WIDE = placeLabels(29, 12.5, 9);

/** Nächste Stadt zu einem Punkt auf der Karte, für großzügiges Antippen. */
export function nearestCity(x: number, y: number, layout: MapLayout, max: number) {
  let best: string | null = null;
  let dist = Infinity;
  for (const c of CITIES) {
    const b = layout.labels[c.id].box;
    if (x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) return c.id;
    const [cx, cy] = CITY_XY[c.id];
    const d = Math.hypot(cx - x, cy - y);
    if (d < dist) (dist = d), (best = c.id);
  }
  return dist <= max ? best : null;
}

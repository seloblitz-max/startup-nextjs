// Erzeugt src/lib/germany-map.ts aus Natural-Earth-Daten (world-atlas, 1:10 Mio.): Umriss und Projektion.
// Projektion: Lambert, winkeltreu, Standardbreiten 48° und 53° (übliche Deutschlandkarte).
// Die Städte rechnet src/lib/map-layout.ts mit denselben Werten aus ihren Koordinaten (src/lib/cities.ts) aus,
// deshalb braucht eine neue Stadt kein neues Bauen der Karte.
// Aufruf: node scripts/build-map.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";

const topo = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/countries-10m.json", import.meta.url)));
const de = feature(topo, topo.objects.countries.geometries.find((g) => g.id === "276"));


const rad = (d) => (d * Math.PI) / 180;
const p1 = rad(48), p2 = rad(53), p0 = rad(51), l0 = rad(10.4);
const t = (p) => Math.tan(Math.PI / 4 + p / 2);
const n = Math.log(Math.cos(p1) / Math.cos(p2)) / Math.log(t(p2) / t(p1));
const F = (Math.cos(p1) * Math.pow(t(p1), n)) / n;
const rho = (p) => F / Math.pow(t(p), n);
const r0 = rho(p0);
function project([lon, lat]) {
  const r = rho(rad(lat));
  const a = n * (rad(lon) - l0);
  return [r * Math.sin(a), -(r0 - r * Math.cos(a))];
}

// Douglas-Peucker im projizierten Raum
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0, idx = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    for (let i = a + 1; i < b; i++) {
      // Geschlossene Ringe: Anfang und Ende fallen zusammen, dann zählt der Abstand zum Punkt.
      const d = len < 1e-6
        ? Math.hypot(pts[i][0] - ax, pts[i][1] - ay)
        : Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
      if (d > max) (max = d), (idx = i);
    }
    if (max > eps && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

const polys = de.geometry.type === "MultiPolygon" ? de.geometry.coordinates : [de.geometry.coordinates];
let rings = polys.flatMap((poly) => poly.map((ring) => ring.map(project)));

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const ring of rings) for (const [x, y] of ring) {
  minX = Math.min(minX, x); maxX = Math.max(maxX, x);
  minY = Math.min(minY, y); maxY = Math.max(maxY, y);
}
const PAD = 24, W = 1000;
const s = (W - 2 * PAD) / (maxX - minX);
const H = Math.round((maxY - minY) * s + 2 * PAD);
const fit = ([x, y]) => [PAD + (x - minX) * s, PAD + (y - minY) * s];

rings = rings.map((r) => simplify(r.map(fit), 0.7)).filter((r) => {
  // Winzige Inseln weglassen
  let a = 0;
  for (let i = 0; i < r.length; i++) {
    const [x1, y1] = r[i], [x2, y2] = r[(i + 1) % r.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2) > 6;
});

const f1 = (v) => Math.round(v * 10) / 10;
const path = rings.map((r) => "M" + r.map(([x, y]) => `${f1(x)} ${f1(y)}`).join("L") + "Z").join("");

const out = `// Automatisch erzeugt von scripts/build-map.mjs. Nicht von Hand bearbeiten.
// Kartengrundlage: Natural Earth (gemeinfrei) über world-atlas.
export const MAP_W = ${W};
export const MAP_H = ${H};
export const GERMANY_PATH = ${JSON.stringify(path)};
/** Lambert-Projektion (Standardbreiten 48° und 53°, Mitte 51° N, 10,4° O) und Einpassen in die Karte. */
export const PROJECTION = ${JSON.stringify({ n, F, r0, lon0: l0, minX, minY, scale: s, pad: PAD })};
`;
writeFileSync(new URL("../src/lib/germany-map.ts", import.meta.url), out);
console.log("rings", rings.length, "points", rings.reduce((a, r) => a + r.length, 0), "bytes", path.length, "H", H);

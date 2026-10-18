// Macht aus dem Datei-Export (`STATIC_EXPORT=1 SITE_HOSTING=hostinger next build`, Ordner out/) das fertige Paket
// für einen PHP-Webspace wie Hostinger: paket/public_html/ und paket/gen-z-steht-auf-hostinger.zip.
// Aufruf über `npm run build:hostinger`. Anleitung für das Hochladen: hostinger/LIESMICH.md
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const APP = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(APP, "out");
const PHP = join(APP, "hostinger", "public");
const PAKET = join(APP, "paket");
const ROOT = join(PAKET, "public_html");
const ZIP = join(PAKET, "gen-z-steht-auf-hostinger.zip");

// Wie next/image ohne eigene Angaben (node_modules/next/dist/shared/lib/image-config.js)
const IMAGE_WIDTHS = [32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];
const WEBP_QUALITY = 82;

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function files(dir) {
  const list = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) list.push(...files(path));
    else list.push(path);
  }
  return list;
}

// 1. Ist out/ der richtige Export?
if (!existsSync(join(OUT, "index.html"))) fail("out/ fehlt. Erst `STATIC_EXPORT=1 SITE_HOSTING=hostinger next build` ausführen.");
const daten = JSON.parse(readFileSync(join(OUT, "paket-daten.json"), "utf8"));
if (!readFileSync(join(OUT, "datenschutz", "index.html"), "utf8").includes("Hostinger International")) {
  fail("Die Datenschutzerklärung nennt nicht Hostinger. Bitte mit SITE_HOSTING=hostinger bauen.");
}
const PLACEHOLDER = daten.origin;

// 2. Kopie anlegen. out/ bleibt unverändert, so lässt sich das Skript beliebig oft ausführen.
rmSync(PAKET, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });
cpSync(OUT, ROOT, { recursive: true });
rmSync(join(ROOT, "paket-daten.json"));

// 3. Events (JSON-LD) in die Startseite. Sie stehen nicht im React-Baum, weil die Adresse darin erst auf dem
//    Server eingesetzt wird und lange Texte in den Seiten-Daten ihre Länge mitführen (siehe src/app/page.tsx).
{
  const file = join(ROOT, "index.html");
  const html = readFileSync(file, "utf8");
  const jsonLd = readFileSync(join(ROOT, "jsonld", "start.json"), "utf8");
  if (html.includes("application/ld+json")) fail("index.html enthält schon JSON-LD.");
  if (!html.includes("</head>")) fail("index.html ohne </head>.");
  writeFileSync(file, html.replace("</head>", `<script type="application/ld+json">${jsonLd}</script></head>`));
  rmSync(join(ROOT, "jsonld"), { recursive: true });
}

// 4. Die Adresse darf nie in einer längenkodierten Zeile (T-Zeile) der Seiten-Daten stehen, sonst stimmt die Länge
//    nach dem Einsetzen nicht mehr und React bricht ab.
function flightOf(file, text) {
  if (!file.endsWith(".html")) return text;
  const parts = [];
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  for (let m; (m = re.exec(text)); ) parts.push(JSON.parse(m[1]));
  return parts.join("");
}
function placeholderInTextRow(flight) {
  const buf = Buffer.from(flight, "utf8");
  let i = 0;
  while (i < buf.length) {
    const colon = buf.indexOf(0x3a, i);
    if (colon < 0) return false;
    if (buf[colon + 1] === 0x54 /* T */) {
      const comma = buf.indexOf(0x2c, colon);
      const len = parseInt(buf.subarray(colon + 2, comma).toString(), 16);
      if (buf.subarray(comma + 1, comma + 1 + len).toString().includes(PLACEHOLDER)) return true;
      i = comma + 1 + len;
    } else {
      const nl = buf.indexOf(0x0a, colon);
      i = nl < 0 ? buf.length : nl + 1;
    }
  }
  return false;
}
const pages = files(ROOT).filter((f) => /\.(html|txt)$/.test(f) && !f.endsWith("robots.txt"));
for (const file of pages) {
  const text = readFileSync(file, "utf8");
  if (text.includes(PLACEHOLDER) && placeholderInTextRow(flightOf(file, text))) {
    fail(`${relative(ROOT, file)}: Platzhalter in einer T-Zeile. Den langen Text aus dem React-Baum nehmen.`);
  }
}

// 5. Bildgrößen für next/image vorrechnen (ohne Bild-Server, siehe src/lib/image-loader.ts).
{
  const wanted = new Map();
  const re = /\/_next\/static\/media\/([A-Za-z0-9._-]+?)\.w(\d+)\.webp/g;
  for (const file of files(ROOT).filter((f) => /\.(html|txt|js)$/.test(f))) {
    const text = readFileSync(file, "utf8");
    for (let m; (m = re.exec(text)); ) {
      if (!wanted.has(m[1])) wanted.set(m[1], new Set(IMAGE_WIDTHS));
      wanted.get(m[1]).add(Number(m[2]));
    }
  }
  const media = join(ROOT, "_next", "static", "media");
  let count = 0;
  for (const [base, widths] of wanted) {
    const original = ["jpg", "jpeg", "png"].map((ext) => join(media, `${base}.${ext}`)).find(existsSync);
    if (!original) fail(`Bild ${base} fehlt in _next/static/media.`);
    const { width: full } = await sharp(original).metadata();
    const done = new Map();
    for (const width of [...widths].sort((a, b) => a - b)) {
      const target = Math.min(width, full);
      // Größer als das Original wird nichts: Die großen Stufen bekommen das Original als WebP.
      if (!done.has(target)) {
        done.set(target, await sharp(original).resize({ width: target, withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toBuffer());
      }
      writeFileSync(join(media, `${base}.w${width}.webp`), done.get(target));
      count++;
    }
  }
  console.log(`✓ ${count} Bildgrößen als WebP`);
}

// 6. PHP-Teil dazu, mit den Daten aus dem Bau.
cpSync(PHP, ROOT, { recursive: true });
writeFileSync(
  join(ROOT, "_app", "data.php"),
  `<?php
// Automatisch erzeugt von scripts/hostinger-paket.mjs aus src/lib/cities.ts. Nicht von Hand ändern.
return ${phpArray({ cities: daten.cities, delete_at: daten.deleteAt, placeholder: PLACEHOLDER })};
`,
);

function phpArray(value, indent = "") {
  if (Array.isArray(value)) return `[${value.map((v) => phpArray(v, indent)).join(", ")}]`;
  if (value && typeof value === "object") {
    const inner = indent + "    ";
    return `[\n${Object.entries(value)
      .map(([k, v]) => `${inner}${phpArray(k)} => ${phpArray(v, inner)},`)
      .join("\n")}\n${indent}]`;
  }
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

// 7. Prüfen und packen.
for (const need of [".htaccess", "api.php", "seite.php", "404.html", "_app/.htaccess", "_app/data.php", "_app/config.php"]) {
  if (!existsSync(join(ROOT, need))) fail(`${need} fehlt im Paket.`);
}
try {
  for (const php of files(ROOT).filter((f) => f.endsWith(".php"))) execFileSync("php", ["-l", php], { stdio: "pipe" });
  console.log("✓ PHP-Dateien ohne Syntaxfehler");
} catch (err) {
  if (err.code === "ENOENT") console.log("· PHP ist hier nicht installiert, Syntax nicht geprüft");
  else fail(`PHP-Syntaxfehler:\n${err.stdout ?? err.message}`);
}
try {
  execFileSync("zip", ["-r", "-X", "-q", "-9", ZIP, "."], { cwd: ROOT });
} catch (err) {
  fail(err.code === "ENOENT" ? "Das Programm zip fehlt. paket/public_html ist trotzdem fertig." : `zip: ${err.message}`);
}

const all = files(ROOT);
const size = all.reduce((sum, f) => sum + statSync(f).size, 0);
console.log(`✓ ${all.length} Dateien, ${(size / 1e6).toFixed(1)} MB`);
console.log(`✓ ${relative(APP, ZIP)} (${(statSync(ZIP).size / 1e6).toFixed(1)} MB)`);

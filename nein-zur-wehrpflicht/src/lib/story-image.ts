import { fmt } from "./format";

/**
 * Story-Bild für das Ticket: Grundbild der Stadt (/story/<stadt>.jpg, gebaut mit src/og/cards.tsx) plus Nummernfeld
 * und Adresse der Seite. Beides kommt erst im Browser dazu, so braucht es keinen Bild-Server und die Adresse stimmt
 * auf jeder Domain.
 *
 * Die Maße stammen aus dem Satori-Layout der Story (gemessen an Bildern mit Nummer, die der Server früher gerendert
 * hat). Ändert sich dort der untere Teil, müssen sie neu gemessen werden.
 */
const W = 1080;
const H = 1920;
const ORANGE = "#ff7405";
const INK = "#0c0b0a";
const PAPER = "#f3efe6";

/** Nummernfeld: unten rechts bündig mit der Stadt-Spalte, Innenabstand 26 × 28, Ecken 14. */
const BOX = { right: 1000, bottom: 1462, minWidth: 200, padX: 28, radius: 14 };
/** Höhe = Schriftgröße + 80. Grundlinien von der Oberkante des Felds gemessen. */
const LABEL = { size: 24, spacing: 4, baseline: 49 };
const NUMBER = [
  { upTo: 999, size: 104, baseline: 147 },
  { upTo: 99_999, size: 82, baseline: 127 },
  { upTo: Infinity, size: 64, baseline: 111 },
];
/** Adresse unter „Sag auch, wo du dabei bist:“, links neben #GENZregelt. */
const HOST = { x: 80, baseline: 1644, size: 30, maxWidth: 560 };

const DISPLAY = "StoryDisplay";
const MONO = "StoryMono";

let fonts: Promise<void> | null = null;

/** Dieselben Schriftdateien wie beim Grundbild, damit Ziffern und Abstände genau passen. */
function loadFonts() {
  fonts ??= Promise.all(
    [
      new FontFace(DISPLAY, "url(/fonts/big-shoulders-latin-900-normal.woff)", { weight: "900" }),
      new FontFace(MONO, "url(/fonts/martian-mono-latin-500-normal.woff)", { weight: "500" }),
    ].map(async (f) => {
      await f.load();
      document.fonts.add(f);
    }),
  ).then(
    () => undefined,
    (err) => {
      fonts = null;
      throw err;
    },
  );
  return fonts;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Bild fehlt: ${src}`));
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Text mit Abstand nach jedem Zeichen, wie CSS letter-spacing. */
function spacedWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number) {
  return [...text].reduce((w, ch) => w + ctx.measureText(ch).width + spacing, 0);
}
function drawSpaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  for (const ch of text) {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + spacing;
  }
}

function drawNumber(ctx: CanvasRenderingContext2D, nr: number) {
  const num = NUMBER.find((n) => nr <= n.upTo)!;
  const text = fmt(nr);
  ctx.font = `500 ${LABEL.size}px ${MONO}`;
  const labelW = spacedWidth(ctx, "NR.", LABEL.spacing);
  ctx.font = `900 ${num.size}px ${DISPLAY}`;
  const numW = ctx.measureText(text).width;

  const w = Math.max(BOX.minWidth, Math.round(Math.max(labelW, numW)) + 2 * BOX.padX);
  const h = num.size + 80;
  const x = BOX.right - w;
  const y = BOX.bottom - h;
  ctx.fillStyle = ORANGE;
  roundRect(ctx, x, y, w, h, BOX.radius);
  ctx.fill();

  ctx.fillStyle = INK;
  ctx.fillText(text, x + (w - numW) / 2, y + num.baseline);
  ctx.font = `500 ${LABEL.size}px ${MONO}`;
  drawSpaced(ctx, "NR.", x + (w - labelW) / 2, y + LABEL.baseline, LABEL.spacing);
}

function drawHost(ctx: CanvasRenderingContext2D, host: string) {
  ctx.font = `500 ${HOST.size}px ${MONO}`;
  const w = ctx.measureText(host).width;
  // Sehr lange Adressen werden kleiner, damit sie nicht in #GENZregelt laufen.
  if (w > HOST.maxWidth) ctx.font = `500 ${Math.floor((HOST.size * HOST.maxWidth) / w)}px ${MONO}`;
  ctx.fillStyle = PAPER;
  ctx.fillText(host, HOST.x, HOST.baseline);
}

/** Fertiges Story-Bild als JPEG. */
export async function composeStory(cityId: string, nr: number, host: string): Promise<Blob> {
  const [img] = await Promise.all([loadImage(`/story/${cityId}.jpg`), loadFonts()]);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kein Canvas");
  ctx.drawImage(img, 0, 0, W, H);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  drawNumber(ctx, nr);
  drawHost(ctx, host);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Kein Bild"))), "image/jpeg", 0.9),
  );
}

/** Adresse, wie sie auf dem Bild steht: ohne Protokoll und ohne „www.“. */
export function storyHost() {
  return window.location.host.replace(/^www\./, "");
}

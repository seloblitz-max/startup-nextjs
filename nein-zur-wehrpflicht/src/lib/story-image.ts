import { CITY_BY_ID } from "./cities";
import { fmt } from "./format";
import { STORY } from "./story-layout";
import { fitName } from "./type-metrics";

/**
 * Story-Bild für das Ticket: Grundbild der Stadt (/story/<stadt>.jpg, gebaut mit src/og/cards.tsx) plus Nummernfeld
 * und Adresse der Seite. Beides kommt erst im Browser dazu, so braucht es keinen Bild-Server und die Adresse stimmt
 * auf jeder Domain. Wo was hinkommt, steht in story-layout.ts.
 */
const ORANGE = "#ff7302";
const BASE = "#212121";
const WHITE = "#ffffff";

/** Nummernfeld wie der Abriss am Ticket: orange, Schrift in #212121. */
const BOX = { minWidth: 200, padX: 28, radius: 12 };
const LABEL = { size: 26, baseline: 40 };
/** Je mehr Stellen, desto kleiner die Nummer. Großbuchstaben und Ziffern sind in Lexend 0,7 em hoch. */
const NUMBER = [
  { upTo: 999, size: 96 },
  { upTo: 99_999, size: 76 },
  { upTo: Infinity, size: 60 },
];

const FAMILY = "StoryLexend";

let fonts: Promise<void> | null = null;

/** Lexend aus /public/fonts, dieselbe Schrift wie im Grundbild. */
function loadFonts() {
  fonts ??= Promise.all(
    [
      new FontFace(FAMILY, "url(/fonts/lexend-latin-700-normal.woff2)", { weight: "700" }),
      new FontFace(FAMILY, "url(/fonts/lexend-latin-900-normal.woff2)", { weight: "900" }),
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

/** Nummernfeld rechts neben der Stadt, oben bündig mit den Großbuchstaben des Stadtnamens. */
function drawNumber(ctx: CanvasRenderingContext2D, nr: number, cityName: string) {
  const { size } = NUMBER.find((n) => nr <= n.upTo)!;
  const text = fmt(nr);
  ctx.font = `700 ${LABEL.size}px ${FAMILY}`;
  const labelW = ctx.measureText("NR.").width;
  ctx.font = `900 ${size}px ${FAMILY}`;
  const numW = ctx.measureText(text).width;

  const col = STORY.city;
  const citySize = fitName(cityName.toUpperCase(), col.width, col.maxSize, col.minSize, col.maxTwoLine).size;
  const w = Math.max(BOX.minWidth, Math.ceil(Math.max(labelW, numW)) + 2 * BOX.padX);
  const h = Math.round(78 + 0.7 * size);
  const x = STORY.number.right - w;
  const y = STORY.number.top + Math.round(0.175 * citySize);
  ctx.fillStyle = ORANGE;
  roundRect(ctx, x, y, w, h, BOX.radius);
  ctx.fill();

  ctx.fillStyle = BASE;
  ctx.fillText(text, x + (w - numW) / 2, y + 54 + 0.7 * size);
  ctx.font = `700 ${LABEL.size}px ${FAMILY}`;
  ctx.fillText("NR.", x + (w - labelW) / 2, y + LABEL.baseline);
}

/** Adresse der Seite unter „Sag auch, wo du dabei bist:“. Sehr lange Adressen werden kleiner. */
function drawHost(ctx: CanvasRenderingContext2D, host: string) {
  const { baseline, size, maxWidth } = STORY.host;
  ctx.font = `700 ${size}px ${FAMILY}`;
  const w = ctx.measureText(host).width;
  if (w > maxWidth) ctx.font = `700 ${Math.floor((size * maxWidth) / w)}px ${FAMILY}`;
  ctx.fillStyle = WHITE;
  ctx.fillText(host, STORY.pad, baseline);
}

/** Fertiges Story-Bild als JPEG. */
export async function composeStory(cityId: string, nr: number, host: string): Promise<Blob> {
  const city = CITY_BY_ID[cityId];
  if (!city) throw new Error(`Unbekannte Stadt: ${cityId}`);
  const [img] = await Promise.all([loadImage(`/story/${cityId}.jpg`), loadFonts()]);
  const canvas = document.createElement("canvas");
  canvas.width = STORY.width;
  canvas.height = STORY.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kein Canvas");
  ctx.drawImage(img, 0, 0, STORY.width, STORY.height);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  drawNumber(ctx, nr, city.name);
  drawHost(ctx, host);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Kein Bild"))), "image/jpeg", 0.9),
  );
}

/** Adresse, wie sie auf dem Bild steht: ohne Protokoll und ohne „www.“. */
export function storyHost() {
  return window.location.host.replace(/^www\./, "");
}

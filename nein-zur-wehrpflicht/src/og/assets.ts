import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Wird nur auf dem Server gelesen (Teilen-Bilder). next.config nimmt den Ordner in die Server-Dateien auf.
const DIR = join(process.cwd(), "src", "og");

type Weight = 400 | 500 | 700 | 900;
export type OgFont = { name: string; data: ArrayBuffer; weight: Weight; style: "normal" };

const FONT_FILES: Array<[string, string, Weight]> = [
  ["Big Shoulders", "big-shoulders-latin-700-normal.woff", 700],
  ["Big Shoulders", "big-shoulders-latin-900-normal.woff", 900],
  ["Bricolage", "bricolage-grotesque-latin-500-normal.woff", 500],
  ["Bricolage", "bricolage-grotesque-latin-700-normal.woff", 700],
  ["Martian Mono", "martian-mono-latin-500-normal.woff", 500],
  ["Marker", "permanent-marker-latin-400-normal.woff", 400],
];

async function bytes(file: string) {
  return new Uint8Array(await readFile(join(DIR, file))).buffer;
}

let fonts: Promise<OgFont[]> | null = null;

export function ogFonts() {
  fonts ??= Promise.all(
    FONT_FILES.map(async ([name, file, weight]) => ({ name, data: await bytes(join("fonts", file)), weight, style: "normal" as const })),
  ).catch((err) => {
    fonts = null;
    throw err;
  });
  return fonts;
}

const photos = new Map<string, Promise<string>>();

export function ogPhoto(file: "og-tor.jpg" | "story-tor.jpg") {
  let p = photos.get(file);
  if (!p) {
    p = readFile(join(DIR, file))
      .then((b) => `data:image/jpeg;base64,${b.toString("base64")}`)
      .catch((err) => {
        photos.delete(file);
        throw err;
      });
    photos.set(file, p);
  }
  return p;
}

/** Macht aus dem PNG von next/og ein JPEG. Das ist viel kleiner, WhatsApp zeigt große Vorschaubilder sonst nicht an. */
export async function toJpeg(png: ArrayBuffer, quality = 86) {
  try {
    const { default: sharp } = await import("sharp");
    return new Uint8Array(await sharp(Buffer.from(png)).jpeg({ quality, mozjpeg: true }).toBuffer());
  } catch {
    return null;
  }
}

/** Teilen-Bild als JPEG ausliefern, ohne sharp als PNG. */
export async function imageResponse(image: Response, headers: Record<string, string> = {}) {
  const png = await image.arrayBuffer();
  const jpg = await toJpeg(png);
  return new Response(jpg ?? png, { headers: { ...headers, "Content-Type": jpg ? "image/jpeg" : "image/png" } });
}

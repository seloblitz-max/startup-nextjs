import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Wird nur auf dem Server gelesen (Teilen-Bilder). next.config nimmt die Ordner in die Server-Dateien auf.
const SRC = join(process.cwd(), "src");

type Weight = 400 | 700 | 800 | 900;
export type OgFont = { name: string; data: ArrayBuffer; weight: Weight; style: "normal" };

// Schriften aus dem Designguide: Lexend für alles, BBH Bartle nur für die Signatur #GENZREGELT.
const FONT_FILES: Array<[string, string, Weight]> = [
  ["Lexend", "lexend-latin-400-normal.woff", 400],
  ["Lexend", "lexend-latin-700-normal.woff", 700],
  ["Lexend", "lexend-latin-800-normal.woff", 800],
  ["Lexend", "lexend-latin-900-normal.woff", 900],
  ["BBH Bartle", "bbh-bartle-latin-400-normal.woff", 400],
];

async function bytes(...path: string[]) {
  return new Uint8Array(await readFile(join(SRC, ...path))).buffer;
}

/** Hält ein einmal gelesenes Ergebnis fest. Schlägt das Lesen fehl, versucht es der nächste Aufruf neu. */
function once<T>(load: () => Promise<T>) {
  let p: Promise<T> | null = null;
  return () => {
    p ??= load().catch((err) => {
      p = null;
      throw err;
    });
    return p;
  };
}

export const ogFonts = once(() =>
  Promise.all(
    FONT_FILES.map(async ([name, file, weight]): Promise<OgFont> => ({
      name,
      data: await bytes("og", "fonts", file),
      weight,
      style: "normal",
    })),
  ),
);

/** Das Original-Logo (src/img/logo.svg) als Daten-Adresse für die Bilder. */
export const ogLogo = once(async () => `data:image/svg+xml;base64,${Buffer.from(await bytes("img", "logo.svg")).toString("base64")}`);

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
export async function imageResponse(image: Response, headers: Record<string, string> = {}, quality = 86) {
  const png = await image.arrayBuffer();
  const jpg = await toJpeg(png, quality);
  return new Response(jpg ?? png, { headers: { ...headers, "Content-Type": jpg ? "image/jpeg" : "image/png" } });
}

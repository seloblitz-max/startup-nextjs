import { ImageResponse } from "next/og";
import { CITIES, CITY_BY_ID } from "@/lib/cities";
import { siteHost } from "@/lib/site";
import { imageResponse, ogFonts, ogPhoto } from "@/og/assets";
import { OgCity, OgHome } from "@/og/cards";

export const dynamic = "force-static";
export const dynamicParams = false;

const OG_SIZE = { width: 1200, height: 630 };

export function generateStaticParams() {
  return [{ file: "start.jpg" }, ...CITIES.map((c) => ({ file: `${c.id}.jpg` }))];
}

/** Vorschaubilder für geteilte Links (1200 × 630): /og/start.jpg für die Startseite, /og/<stadt>.jpg für Einladungen. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const id = (await params).file.replace(/\.jpg$/, "");
  const city = id === "start" ? null : CITY_BY_ID[id];
  if (id !== "start" && !city) return new Response("Nicht gefunden", { status: 404 });
  const [photo, fonts] = await Promise.all([ogPhoto("og-tor.jpg"), ogFonts()]);
  const card = city ? <OgCity photo={photo} city={city} host={siteHost()} /> : <OgHome photo={photo} host={siteHost()} />;
  return imageResponse(new ImageResponse(card, { ...OG_SIZE, fonts }), { "Cache-Control": "public, max-age=86400" });
}

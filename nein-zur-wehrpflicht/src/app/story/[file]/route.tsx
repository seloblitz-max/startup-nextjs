import { ImageResponse } from "next/og";
import { CITIES, CITY_BY_ID } from "@/lib/cities";
import { ogFonts, ogPhoto, toJpeg } from "@/og/assets";
import { Story } from "@/og/cards";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return CITIES.map((c) => ({ file: `${c.id}.jpg` }));
}

/** Story-Grundbild (1080 × 1920) pro Stadt, etwa /story/berlin.jpg. Nummer und Adresse setzt der Browser ein. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const city = CITY_BY_ID[(await params).file.replace(/\.jpg$/, "")];
  if (!city) return new Response("Nicht gefunden", { status: 404 });
  const [photo, fonts] = await Promise.all([ogPhoto("story-tor.jpg"), ogFonts()]);
  const png = await new ImageResponse(<Story photo={photo} city={city} />, { width: 1080, height: 1920, fonts }).arrayBuffer();
  const jpg = await toJpeg(png, 90);
  return new Response(jpg ?? png, {
    headers: { "Content-Type": jpg ? "image/jpeg" : "image/png", "Cache-Control": "public, max-age=86400" },
  });
}

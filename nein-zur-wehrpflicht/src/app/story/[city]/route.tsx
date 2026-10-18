import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { CITY_BY_ID } from "@/lib/cities";
import { siteHost } from "@/lib/site";
import { ogFonts, ogPhoto, toJpeg } from "@/og/assets";
import { Story } from "@/og/cards";

/**
 * Story-Bild (1080 × 1920) für eine Stadt, optional mit der eigenen Nummer (?nr=128).
 * Das Bild hängt nur von der Adresse ab, deshalb darf das CDN es lange behalten.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ city: string }> }) {
  const city = CITY_BY_ID[(await params).city];
  if (!city) return new Response("Nicht gefunden", { status: 404 });
  const raw = req.nextUrl.searchParams.get("nr");
  const nr = raw && /^[1-9]\d{0,6}$/.test(raw) ? Number(raw) : null;
  const [photo, fonts] = await Promise.all([ogPhoto("story-tor.jpg"), ogFonts()]);
  const png = await new ImageResponse(<Story photo={photo} city={city} nr={nr} host={siteHost()} />, {
    width: 1080,
    height: 1920,
    fonts,
  }).arrayBuffer();
  const jpg = await toJpeg(png);
  const ext = jpg ? "jpg" : "png";
  return new Response(jpg ?? png, {
    headers: {
      "Content-Type": jpg ? "image/jpeg" : "image/png",
      "Content-Disposition": `inline; filename="ich-bin-dabei-${city.id}.${ext}"`,
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}

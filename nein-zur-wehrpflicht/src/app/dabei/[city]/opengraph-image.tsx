import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { CITIES, CITY_BY_ID } from "@/lib/cities";
import { siteHost } from "@/lib/site";
import { imageResponse, ogFonts, ogPhoto } from "@/og/assets";
import { OgCity } from "@/og/cards";

export const alt = "Einladung zum Protest gegen die Wehrpflicht am 31. Oktober";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.id }));
}

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const city = CITY_BY_ID[(await params).city];
  if (!city) notFound();
  const [photo, fonts] = await Promise.all([ogPhoto("og-tor.jpg"), ogFonts()]);
  return imageResponse(new ImageResponse(<OgCity photo={photo} city={city} host={siteHost()} />, { ...size, fonts }));
}

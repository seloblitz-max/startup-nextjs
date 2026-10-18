import { ImageResponse } from "next/og";
import { imageResponse, ogFonts, ogPhoto } from "@/og/assets";
import { OgHome } from "@/og/cards";
import { siteHost } from "@/lib/site";

export const alt = "Nein zur Wehrpflicht. Protest am Samstag, 31. Oktober, ab 14 Uhr in 21 Städten.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

export default async function Image() {
  const [photo, fonts] = await Promise.all([ogPhoto("og-tor.jpg"), ogFonts()]);
  return imageResponse(new ImageResponse(<OgHome photo={photo} host={siteHost()} />, { ...size, fonts }));
}

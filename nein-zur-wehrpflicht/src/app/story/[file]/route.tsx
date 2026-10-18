import { ImageResponse } from "next/og";
import { CITIES, CITY_BY_ID } from "@/lib/cities";
import { STORY } from "@/lib/story-layout";
import { imageResponse, ogFonts, ogLogo } from "@/og/assets";
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
  const [logo, fonts] = await Promise.all([ogLogo(), ogFonts()]);
  const image = new ImageResponse(<Story logo={logo} city={city} />, { width: STORY.width, height: STORY.height, fonts });
  return imageResponse(image, { "Cache-Control": "public, max-age=86400" }, 90);
}

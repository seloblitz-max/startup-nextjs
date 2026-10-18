import type { MetadataRoute } from "next";
import { CITY_COUNT } from "@/lib/cities";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}: Protest am 31. Oktober`,
    short_name: SITE_NAME,
    description: `Unsere Zukunft liegt in unseren Händen. Protest der Generation Z am 31. Oktober ab 14 Uhr in ${CITY_COUNT} Städten.`,
    lang: "de",
    start_url: "/",
    display: "standalone",
    background_color: "#212121",
    theme_color: "#212121",
    icons: [
      { src: "/icon.png", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Das Logo liegt mit Freiraum in der Mitte, Android darf das Symbol rund oder eckig zuschneiden.
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

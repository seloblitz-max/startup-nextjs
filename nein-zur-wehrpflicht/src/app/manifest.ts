import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}: Nein zur Wehrpflicht`,
    short_name: SITE_NAME,
    description: "Protest gegen die Wehrpflicht am 31. Oktober ab 14 Uhr in 21 Städten.",
    lang: "de",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0b0a",
    theme_color: "#0c0b0a",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

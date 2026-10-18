import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/cities";
import { pagePath, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "hourly", priority: 1 },
    ...CITIES.map((c) => ({ url: `${base}${pagePath(`/dabei/${c.id}`)}`, changeFrequency: "daily" as const, priority: 0.7 })),
    { url: `${base}${pagePath("/impressum")}`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}${pagePath("/datenschutz")}`, changeFrequency: "yearly", priority: 0.2 },
  ];
}

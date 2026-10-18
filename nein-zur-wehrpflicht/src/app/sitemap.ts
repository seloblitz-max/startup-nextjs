import type { MetadataRoute } from "next";
import { CITIES } from "@/lib/cities";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "hourly", priority: 1 },
    ...CITIES.map((c) => ({ url: `${base}/dabei/${c.id}`, changeFrequency: "daily" as const, priority: 0.7 })),
    { url: `${base}/impressum`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/datenschutz`, changeFrequency: "yearly", priority: 0.2 },
  ];
}

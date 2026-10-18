import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePage from "@/components/HomePage";
import { CITIES, CITY_BY_ID } from "@/lib/cities";
import { SITE_NAME } from "@/lib/site";
import { safeSnapshot } from "@/lib/store";

// Einladungslink: "Ich bin in Berlin dabei, kommst du mit?"
export const revalidate = 30;
export const dynamicParams = false;

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.id }));
}

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = CITY_BY_ID[(await params).city];
  if (!city) return {};
  const title = `Ich bin in ${city.name} dabei`;
  const description = `Nein zur Wehrpflicht: Samstag, 31. Oktober, 14 Uhr, ${city.place} in ${city.name}. Kommst du mit?`;
  return {
    title,
    description,
    alternates: { canonical: `/dabei/${city.id}` },
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: SITE_NAME,
      title: `${title}. Kommst du mit?`,
      description,
      url: `/dabei/${city.id}`,
    },
  };
}

export default async function InvitePage({ params }: Props) {
  const city = CITY_BY_ID[(await params).city];
  if (!city) notFound();
  const snapshot = await safeSnapshot();
  return <HomePage snapshot={snapshot} invite={city.id} />;
}

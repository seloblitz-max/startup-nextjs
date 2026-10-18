import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Bricolage_Grotesque, Martian_Mono, Permanent_Marker } from "next/font/google";
import { ogImage, SITE_NAME, siteUrl } from "@/lib/site";
import "./globals.css";

// Alle Schriften werden beim Bauen heruntergeladen und von der eigenen Domain ausgeliefert.
const display = Big_Shoulders({ subsets: ["latin"], variable: "--nf-display", display: "swap", adjustFontFallback: false });
const body = Bricolage_Grotesque({ subsets: ["latin"], variable: "--nf-body", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], variable: "--nf-mono", display: "swap", preload: false });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--nf-marker", display: "swap", preload: false });

const description =
  "Protest gegen die Wehrpflicht am Samstag, 31. Oktober, ab 14 Uhr in 21 Städten. Sag, wo du dabei bist, und sieh live, wie viele kommen.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Nein zur Wehrpflicht: Protest am 31. Oktober in 21 Städten",
    template: `%s | ${SITE_NAME}`,
  },
  description,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE_NAME,
    title: "Nein zur Wehrpflicht. 31. Oktober, 14 Uhr, 21 Städte.",
    description: "Sag, wo du dabei bist, und sieh live, wie viele kommen.",
    images: [ogImage("start.jpg", "Nein zur Wehrpflicht. Protest am Samstag, 31. Oktober, ab 14 Uhr in 21 Städten.")],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: { title: SITE_NAME, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0c0b0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable} ${mono.variable} ${marker.variable}`}>
      <body>
        <a href="#inhalt" className="skip-link">
          Zum Inhalt springen
        </a>
        {children}
      </body>
    </html>
  );
}

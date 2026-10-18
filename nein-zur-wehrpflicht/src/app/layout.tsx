import type { Metadata, Viewport } from "next";
import { BBH_Bartle, Lexend } from "next/font/google";
import { CITY_COUNT } from "@/lib/cities";
import { ogImage, SITE_NAME, siteUrl } from "@/lib/site";
import "./globals.css";

// Schriften aus dem Designguide. Sie werden beim Bauen heruntergeladen und von der eigenen Domain ausgeliefert.
const lexend = Lexend({ subsets: ["latin", "latin-ext"], variable: "--nf-lexend", display: "swap" });
// BBH Bartle hat keine Messwerte für eine angepasste Ersatzschrift, Next würde sonst bei jedem Bauen warnen.
const bartle = BBH_Bartle({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-bartle",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

const description = `Unsere Zukunft liegt in unseren Händen. Am Samstag, 31. Oktober, ab 14 Uhr gehen wir in ${CITY_COUNT} Städten auf die Straße: für Bildung, Gesundheit und ein bezahlbares Leben, gegen Wehrpflicht und Sparkurs auf unserem Rücken.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `Gen Z steht auf: Protest am 31. Oktober in ${CITY_COUNT} Städten`,
    template: `%s | ${SITE_NAME}`,
  },
  description,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE_NAME,
    title: `Gen Z steht auf. 31. Oktober, 14 Uhr, ${CITY_COUNT} Städte.`,
    description: "Unsere Zukunft liegt in unseren Händen. Sag, wo du dabei bist, und sieh live, wie viele kommen.",
    images: [ogImage("start.jpg", `Gen Z steht auf. Protest am Samstag, 31. Oktober, ab 14 Uhr in ${CITY_COUNT} Städten.`)],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: { title: SITE_NAME, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#212121",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${lexend.variable} ${bartle.variable}`}>
      <body>
        <a href="#inhalt" className="skip-link">
          Zum Inhalt springen
        </a>
        {children}
      </body>
    </html>
  );
}

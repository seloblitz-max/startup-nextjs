import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Bricolage_Grotesque, Martian_Mono, Permanent_Marker } from "next/font/google";
import "./globals.css";

const display = Big_Shoulders({ subsets: ["latin"], weight: ["800", "900"], variable: "--font-display" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker" });
const body = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-body" });
const mono = Martian_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Gen Z steht auf · Nein zur Wehrpflicht",
  description: "Protest gegen die Wehrpflicht am 31. Oktober ab 14 Uhr in 21 Städten. Sag, wo du dabei bist, und sieh live, wer noch kommt.",
  openGraph: {
    title: "Nein zur Wehrpflicht · 31.10. · 14 Uhr",
    description: "21 Städte, ein Tag. Sag, wo du dabei bist.",
    locale: "de_DE",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${marker.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

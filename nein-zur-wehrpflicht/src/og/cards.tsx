/* eslint-disable @next/next/no-img-element */
// Layouts für die Teilen-Bilder (gerendert mit next/og). Jedes Element mit mehreren Kindern braucht display: flex.
// Wie auf der Seite: #212121, #2A2A2A, Weiß und ein Orange für Schlagwörter, Lexend, #GENZREGELT nur als Signatur.

import type { CSSProperties } from "react";
import { CITY_COUNT, type City } from "@/lib/cities";
import { STORY } from "@/lib/story-layout";
import { fitName } from "@/lib/type-metrics";

const BASE = "#212121";
const MARK = "#2a2a2a";
const LINE = "#3d3d3d";
const WHITE = "#ffffff";
const SOFT = "#c7c7c7";
const ORANGE = "#ff7302";
const BLACK = "#000000";

const frame: CSSProperties = {
  position: "relative",
  display: "flex",
  width: "100%",
  height: "100%",
  background: BASE,
  color: WHITE,
  fontFamily: "Lexend",
  fontWeight: 400,
};

/** Seitenverhältnis des Original-Logos (src/img/logo.svg, 300 × 314). */
const LOGO_RATIO = 300 / 314;

/** Das Original-Logo, `height` hoch, nicht verzerrt. */
function LogoImg({ logo, height, style }: { logo: string; height: number; style?: CSSProperties }) {
  return <img src={logo} alt="" width={Math.round(height * LOGO_RATIO)} height={height} style={style} />;
}

/** Logo und Schriftzug wie in der Kopfzeile der Seite: „GEN Z“ in ExtraBold, „STEHT AUF“ normal. */
function Brand({ logo, size }: { logo: string; size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <LogoImg logo={logo} height={Math.round(size * 2.1)} />
      <span style={{ marginLeft: size * 0.6, fontSize: size, fontWeight: 800, lineHeight: 1 }}>GEN Z</span>
      <span style={{ marginLeft: size * 0.3, fontSize: size, lineHeight: 1 }}>STEHT AUF</span>
    </div>
  );
}

/** Sticker „JETZT ODER NIE!“ mit denselben Maßen wie .sticker auf der Seite (alles in Prozent der Breite). */
function Sticker({ logo, size }: { logo: string; size: number }) {
  const u = size / 100;
  return (
    <div style={{ position: "relative", display: "flex", width: size, height: size, borderRadius: size, background: BLACK }}>
      <LogoImg logo={logo} height={13.74 * u} style={{ position: "absolute", top: 6.37 * u, left: 43.44 * u }} />
      <div
        style={{
          position: "absolute",
          top: 23.79 * u,
          left: 0,
          width: size,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: 21.494 * u,
          fontWeight: 900,
          lineHeight: 16.383 / 21.494,
        }}
      >
        <span>JETZT</span>
        <span>ODER</span>
        <span style={{ color: ORANGE }}>NIE!</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 85.07 * u,
          left: 0,
          width: size,
          display: "flex",
          justifyContent: "center",
          fontFamily: "BBH Bartle",
          fontSize: 2.621 * u,
          lineHeight: 1,
        }}
      >
        #GENZREGELT
      </div>
    </div>
  );
}

/** Großes „31.10.“ in #2A2A2A als Hintergrundzeichen, nur hinter dem Sticker und großer Schrift. */
function DateMark({ size, style }: { size: number; style: CSSProperties }) {
  return (
    <div style={{ position: "absolute", display: "flex", fontSize: size, fontWeight: 900, lineHeight: 1, color: MARK, ...style }}>31.10.</div>
  );
}

const label = (size: number, color = ORANGE): CSSProperties => ({ fontSize: size, fontWeight: 700, lineHeight: 1.3, color });

/** Fußzeile der Vorschaubilder: die Adresse der Seite, im Datei-Paket ohne feste Adresse die Signatur. */
function Footer({ host }: { host: string | null }) {
  return host ? (
    <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: SOFT }}>{host}</span>
  ) : (
    <span style={{ fontFamily: "BBH Bartle", fontSize: 20, lineHeight: 1 }}>#GENZREGELT</span>
  );
}

const ogColumn: CSSProperties = {
  position: "absolute",
  left: 64,
  top: 0,
  width: 660,
  height: 630,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "52px 0 50px",
};

/**
 * Sticker rechts mit „31.10.“ dahinter. Gibt zwei Elemente zurück, die direkt im Rahmen liegen müssen: Satori dreht
 * verschachtelte, absolut gesetzte Elemente nicht und setzt sie nur über left/top zuverlässig.
 */
function ogSticker(logo: string) {
  return [
    <DateMark key="mark" size={200} style={{ left: 592, top: 10 }} />,
    <div key="sticker" style={{ position: "absolute", left: 726, top: 128, display: "flex", transform: "rotate(-6deg)" }}>
      <Sticker logo={logo} size={396} />
    </div>,
  ];
}

/** 1200 × 630, für die Startseite. */
export function OgHome({ logo, host }: { logo: string; host: string | null }) {
  return (
    <div style={frame}>
      {ogSticker(logo)}
      <div style={ogColumn}>
        <Brand logo={logo} size={24} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={label(22)}>BUNDESWEITER PROTEST DER GENERATION Z</span>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 14, fontSize: 72, fontWeight: 900, lineHeight: 78 / 72 }}>
            <span>Unsere Zukunft</span>
            <div style={{ display: "flex" }}>
              <span>liegt in</span>
              <span style={{ marginLeft: 25, color: ORANGE }}>unseren</span>
            </div>
            <span style={{ color: ORANGE }}>Händen.</span>
          </div>
          <span style={{ marginTop: 24, fontSize: 30, fontWeight: 700, lineHeight: 1.25 }}>Samstag, 31. Oktober, ab 14 Uhr</span>
          <span style={{ marginTop: 4, fontSize: 24, lineHeight: 1.3, color: SOFT }}>
            In {CITY_COUNT} Städten gleichzeitig. Sag, wo du dabei bist.
          </span>
        </div>
        <Footer host={host} />
      </div>
    </div>
  );
}

/** 1200 × 630, für Einladungen in eine Stadt. */
export function OgCity({ logo, city, host }: { logo: string; city: City; host: string | null }) {
  const name = fitName(city.name.toUpperCase(), 600, 104, 76, 92);
  return (
    <div style={frame}>
      {ogSticker(logo)}
      <div style={{ ...ogColumn, padding: "48px 0 46px" }}>
        <Brand logo={logo} size={22} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={label(22)}>SAMSTAG, 31. OKTOBER · AB 14 UHR</span>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 10, fontWeight: 900 }}>
            <span style={{ fontSize: 54, lineHeight: 1.05 }}>Ich bin in</span>
            <div style={{ display: "flex", flexDirection: "column", fontSize: name.size, lineHeight: 0.98, color: ORANGE }}>
              {name.lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
            <span style={{ fontSize: 54, lineHeight: 1.05 }}>dabei.</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 16 }}>
            <span style={label(18, SOFT)}>TREFFPUNKT</span>
            <span style={{ marginLeft: 14, fontSize: 30, fontWeight: 700, lineHeight: 1.25 }}>{city.place}</span>
          </div>
        </div>
        <Footer host={host} />
      </div>
    </div>
  );
}

/** Treffpunkt so groß wie möglich (höchstens 40 px), damit er in die Spalte passt. Grob geschätzt: 0,56 em je Zeichen. */
function placeSize(place: string) {
  return Math.max(28, Math.min(40, Math.floor(STORY.city.width / (place.length * 0.56))));
}

/**
 * 1080 × 1920, Grundbild für Instagram- und WhatsApp-Storys. Nummernfeld und Adresse setzt src/lib/story-image.ts im
 * Browser ein: rechts neben die Stadt und unter „Sag auch, wo du dabei bist:“. Die Maße stehen in src/lib/story-layout.ts.
 * Oben und unten bleibt Platz für die Bedienelemente von Instagram.
 */
export function Story({ logo, city }: { logo: string; city: City }) {
  const { pad, city: col } = STORY;
  const name = fitName(city.name.toUpperCase(), col.width, col.maxSize, col.minSize, col.maxTwoLine);
  return (
    <div style={frame}>
      <DateMark size={340} style={{ left: 0, width: STORY.width, justifyContent: "center", top: 96 }} />
      <div style={{ position: "absolute", left: 280, top: 260, display: "flex", transform: "rotate(-6deg)" }}>
        <Sticker logo={logo} size={520} />
      </div>

      <div style={{ position: "absolute", left: pad, top: 846, display: "flex", flexDirection: "column" }}>
        <span style={label(30)}>GEN Z STEHT AUF · SA, 31.10. · 14 UHR</span>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 10, fontSize: 150, fontWeight: 900, lineHeight: 1 }}>
          <span>Ich bin</span>
          <span style={{ color: ORANGE }}>dabei.</span>
        </div>
      </div>

      <div style={{ position: "absolute", left: pad, top: col.top, width: col.width, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: name.size, fontWeight: 900, lineHeight: 1 }}>
          {name.lines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <span style={{ ...label(24, SOFT), marginTop: 24 }}>TREFFPUNKT</span>
        <span style={{ marginTop: 4, fontSize: placeSize(city.place), fontWeight: 700, lineHeight: 1.2 }}>{city.place}</span>
      </div>

      <div style={{ position: "absolute", left: pad, right: pad, top: STORY.rule, height: 2, display: "flex", background: LINE }} />
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: STORY.prompt.top,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* Darunter kommt im Browser die Adresse der Seite dazu. */}
        <span style={{ fontSize: STORY.prompt.size, lineHeight: 1.2, color: SOFT }}>Sag auch, wo du dabei bist:</span>
        <span style={{ marginTop: 40, fontFamily: "BBH Bartle", fontSize: 24, lineHeight: 1 }}>#GENZREGELT</span>
      </div>
    </div>
  );
}

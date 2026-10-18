/* eslint-disable @next/next/no-img-element */
// Layouts für die Teilen-Bilder (gerendert mit next/og). Jedes Element mit mehreren Kindern braucht display: flex.

import type { City } from "@/lib/cities";
import { CROWN_PATH } from "./crown";

const INK = "#0c0b0a";
const PAPER = "#f3efe6";
const PAPER_2 = "#d9d3c7";
const MUTE = "#9a9488";
const RED = "#e5251c";
const RED_DEEP = "#cf1c14";

function Brand({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.32 }}>
      <svg width={size * 1.05} height={size * 1.05} viewBox="0 0 256 256">
        <path d={CROWN_PATH} fill={RED} />
      </svg>
      <span
        style={{
          fontFamily: "Big Shoulders",
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: size * 0.04,
          textTransform: "uppercase",
          color: PAPER,
        }}
      >
        Gen Z steht auf
      </span>
    </div>
  );
}

function citySize(name: string, sizes: [number, number, number, number]) {
  const n = name.length;
  if (n <= 7) return sizes[0];
  if (n <= 10) return sizes[1];
  if (n <= 13) return sizes[2];
  return sizes[3];
}

function Photo({ photo, width }: { photo: string; width: number }) {
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex" }}>
      <img
        src={photo}
        alt=""
        width={width}
        height={630}
        style={{ position: "absolute", right: 0, top: 0, width, height: 630, objectFit: "cover", objectPosition: "50% 40%" }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width,
          height: 630,
          display: "flex",
          backgroundImage: `linear-gradient(90deg, ${INK} 0%, rgba(12,11,10,0.82) 30%, rgba(12,11,10,0) 72%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: 1200,
          height: 170,
          display: "flex",
          backgroundImage: "linear-gradient(0deg, rgba(12,11,10,0.85), rgba(12,11,10,0))",
        }}
      />
    </div>
  );
}

const frame = {
  width: "100%",
  height: "100%",
  display: "flex",
  position: "relative" as const,
  background: INK,
  color: PAPER,
  fontFamily: "Bricolage",
};

const column = {
  position: "relative" as const,
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  width: "100%",
  height: "100%",
  padding: "54px 64px",
};

const hostStyle = {
  display: "flex",
  fontFamily: "Martian Mono",
  fontWeight: 500,
  fontSize: 18,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
  color: MUTE,
};

/** 1200 × 630, für die Startseite. */
export function OgHome({ photo, host }: { photo: string; host: string }) {
  return (
    <div style={frame}>
      <Photo photo={photo} width={540} />
      <div style={column}>
        <Brand size={34} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Big Shoulders",
              fontWeight: 900,
              fontSize: 132,
              lineHeight: 0.86,
              textTransform: "uppercase",
            }}
          >
            <span>Nein zur</span>
            <span style={{ color: RED }}>Wehrpflicht.</span>
          </div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 36, fontWeight: 700 }}>Samstag, 31. Oktober, 14 Uhr</div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 28, fontWeight: 500, color: PAPER_2 }}>
            In 21 Städten gleichzeitig. Sag, wo du dabei bist.
          </div>
        </div>
        <div style={hostStyle}>{host}</div>
      </div>
    </div>
  );
}

/** 1200 × 630, für Einladungen in eine Stadt. */
export function OgCity({ photo, city, host }: { photo: string; city: City; host: string }) {
  const size = citySize(city.name, [138, 118, 96, 78]);
  return (
    <div style={frame}>
      <Photo photo={photo} width={540} />
      <div style={column}>
        <Brand size={34} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Big Shoulders",
              fontWeight: 900,
              lineHeight: 0.88,
              textTransform: "uppercase",
            }}
          >
            <span style={{ fontSize: 84 }}>Ich bin in</span>
            <span style={{ fontSize: size, color: RED, marginTop: 6, maxWidth: 700 }}>{city.name}</span>
            <span style={{ fontSize: 84, marginTop: 6 }}>dabei.</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 32, fontWeight: 700 }}>
            {city.place}, Samstag, 31. Oktober, 14 Uhr
          </div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 28, fontWeight: 500, color: PAPER_2 }}>
            Nein zur Wehrpflicht. Kommst du mit?
          </div>
        </div>
        <div style={hostStyle}>{host}</div>
      </div>
    </div>
  );
}

/** 1080 × 1920, Bild für Instagram- und WhatsApp-Storys. */
export function Story({ photo, city, nr, host }: { photo: string; city: City; nr: number | null; host: string }) {
  const size = citySize(city.name, [176, 150, 124, 100]);
  return (
    <div style={{ ...frame, flexDirection: "column" }}>
      <img src={photo} alt="" width={1080} height={1227} style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 1227 }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1240,
          display: "flex",
          backgroundImage: `linear-gradient(180deg, rgba(12,11,10,0.6) 0%, rgba(12,11,10,0) 16%, rgba(12,11,10,0) 38%, rgba(12,11,10,0.75) 62%, ${INK} 92%)`,
        }}
      />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "130px 80px 270px" }}>
        <Brand size={46} />
        <div style={{ display: "flex", flexGrow: 1 }} />
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              background: PAPER,
              color: INK,
              fontFamily: "Big Shoulders",
              fontWeight: 900,
              fontSize: 42,
              letterSpacing: 2,
              textTransform: "uppercase",
              padding: "10px 26px 8px",
              transform: "rotate(-2deg)",
            }}
          >
            Nein zur Wehrpflicht
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            fontFamily: "Big Shoulders",
            fontWeight: 900,
            fontSize: 196,
            lineHeight: 0.84,
            textTransform: "uppercase",
          }}
        >
          <span>Ich bin</span>
          <span style={{ color: RED }}>dabei.</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40, marginTop: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", flexShrink: 1 }}>
            <span
              style={{
                fontFamily: "Big Shoulders",
                fontWeight: 900,
                fontSize: size,
                lineHeight: 0.86,
                textTransform: "uppercase",
                maxWidth: 640,
              }}
            >
              {city.name}
            </span>
            <span style={{ marginTop: 22, fontSize: 44, fontWeight: 700 }}>{city.place}</span>
            <span style={{ marginTop: 10, fontSize: 40, fontWeight: 500, color: PAPER_2 }}>Samstag, 31. Oktober, 14 Uhr</span>
          </div>
          {nr ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                minWidth: 200,
                padding: "26px 28px",
                background: RED_DEEP,
                color: PAPER,
                borderRadius: 14,
              }}
            >
              <span style={{ fontFamily: "Martian Mono", fontWeight: 500, fontSize: 24, letterSpacing: 4, textTransform: "uppercase" }}>Nr.</span>
              <span style={{ fontFamily: "Big Shoulders", fontWeight: 900, fontSize: nr > 99999 ? 64 : nr > 999 ? 82 : 104, lineHeight: 1 }}>
                {nr.toLocaleString("de-DE")}
              </span>
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 70,
            paddingTop: 34,
            borderTop: `2px solid rgba(243,239,230,0.18)`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 32, fontWeight: 500, color: PAPER_2 }}>Sag auch, wo du dabei bist:</span>
            <span style={{ marginTop: 8, fontFamily: "Martian Mono", fontWeight: 500, fontSize: 30, color: PAPER }}>{host}</span>
          </div>
          <span style={{ fontFamily: "Marker", fontSize: 50, color: RED, transform: "rotate(-4deg)" }}>#GENZregelt</span>
        </div>
      </div>
    </div>
  );
}

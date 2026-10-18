import { CITIES } from "@/lib/cities";
import { pagePath, siteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return CITIES.map((c) => ({ file: `${c.id}.ics` }));
}

function esc(s: string) {
  return s.replace(/[\\,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
}

// Zeilen über 75 Byte werden laut RFC 5545 umgebrochen, ohne UTF-8-Zeichen zu zerteilen.
function fold(line: string) {
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch);
    if (bytes + b > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join("\r\n ");
}

/** Kalendereintrag pro Stadt, etwa /kalender/berlin.ics. */
export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const city = (await ctx.params).file.replace(/\.ics$/, "");
  const c = CITIES.find((x) => x.id === city);
  if (!c) return new Response("Nicht gefunden", { status: 404 });
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//gen-z-steht-auf//protest//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:protest-2026-10-31-${c.id}@gen-z-steht-auf`,
    "DTSTAMP:20261018T000000Z",
    "DTSTART:20261031T130000Z",
    "DTEND:20261031T160000Z",
    `SUMMARY:${esc(`Protest gegen die Wehrpflicht: ${c.name}`)}`,
    `LOCATION:${esc(`${c.place}, ${c.name}`)}`,
    `DESCRIPTION:${esc(`Treffpunkt ${c.place}, ab 14 Uhr. Bleib friedlich und komm mit Freund*innen. ${siteUrl()}`)}`,
    `URL:${siteUrl()}${pagePath(`/dabei/${c.id}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(`In zwei Stunden geht es los: ${c.place}, ${c.name}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="protest-${c.id}.ics"`,
    },
  });
}

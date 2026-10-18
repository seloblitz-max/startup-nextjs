import { CITIES } from "@/lib/cities";

export const dynamic = "force-static";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.id }));
}

function esc(s: string) {
  return s.replace(/[\\,;]/g, (m) => "\\" + m);
}

export async function GET(_req: Request, ctx: { params: Promise<{ city: string }> }) {
  const { city } = await ctx.params;
  const c = CITIES.find((x) => x.id === city);
  if (!c) return new Response("Nicht gefunden", { status: 404 });
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//nein-zur-wehrpflicht//DE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:protest-2026-10-31-${c.id}@nein-zur-wehrpflicht`,
    "DTSTAMP:20261018T000000Z",
    "DTSTART:20261031T130000Z",
    "DTEND:20261031T160000Z",
    `SUMMARY:${esc("Protest gegen die Wehrpflicht · " + c.name)}`,
    `LOCATION:${esc(c.place + ", " + c.name)}`,
    `DESCRIPTION:${esc("Treffpunkt ab 14:00 Uhr. Bleib friedlich, nimm Wasser und deine Crew mit.")}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc("Gleich geht's los: " + c.place)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="protest-${c.id}.ics"`,
    },
  });
}

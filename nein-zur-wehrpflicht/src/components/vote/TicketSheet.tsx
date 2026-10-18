"use client";

import {
  CalendarPlus,
  Check,
  CircleNotch,
  ImageSquare,
  LinkSimple,
  MapPin,
  NavigationArrow,
  ShareNetwork,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { CITY_BY_ID, mapsUrl, type City } from "@/lib/cities";
import { cn, fmt } from "@/lib/format";
import { pagePath } from "@/lib/site";
import { composeStory, storyHost } from "@/lib/story-image";
import { blackWidth } from "@/lib/type-metrics";
import { voteStore } from "@/lib/vote-store";
import Logo from "@/components/brand/Logo";
import { TelegramLink } from "./CityPanel";
import { useVote, withdrawVote } from "./VoteProvider";

/** Ticket nach der Zusage: zeigt Stadt und Nummer und macht das Weitersagen leicht. */
export default function TicketSheet() {
  const open = useVote((s) => s.sheet);
  const mine = useVote((s) => s.mine);
  const city = mine ? CITY_BY_ID[mine.city] : null;

  return (
    <Drawer.Root
      open={open && !!city}
      onOpenChange={(o) => {
        if (!o) voteStore.closeSheet();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="sheet-overlay" />
        <Drawer.Content className="sheet">
          <div className="sheet-handle" aria-hidden="true" />
          {city && mine ? <TicketBody city={city} rank={mine.rank} /> : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function shareText(city: City) {
  return `Ich bin am 31.10. ab 14 Uhr in ${city.name} dabei, Treffpunkt ${city.place}. Unsere Zukunft liegt in unseren Händen. Kommst du mit?`;
}

function inviteUrl(city: City) {
  return `${window.location.origin}${pagePath(`/dabei/${city.id}`)}`;
}

function toFile(blob: Blob, name: string) {
  const type = blob.type === "image/png" ? "image/png" : "image/jpeg";
  return new File([blob], `${name}.${type === "image/png" ? "png" : "jpg"}`, { type });
}

/** Story-Bild mit Nummer und Adresse. Klappt das Zeichnen nicht, gibt es wenigstens das Grundbild der Stadt. */
async function storyFile(city: City, rank: number, name: string) {
  try {
    return toFile(await composeStory(city.id, rank, storyHost()), name);
  } catch {
    const r = await fetch(`/story/${city.id}.jpg`);
    if (!r.ok) throw new Error(String(r.status));
    return toFile(await r.blob(), name);
  }
}

function saveFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    ta.remove();
    return ok;
  }
}

function TicketBody({ city, rank }: { city: City; rank: number }) {
  const fileName = `ich-bin-dabei-${city.id}`;
  const file = useRef<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => setCanShare(typeof navigator.share === "function"), []);

  // Bild schon vorab bauen: iOS erlaubt das Teilen nur direkt nach dem Antippen.
  useEffect(() => {
    let alive = true;
    file.current = null;
    storyFile(city, rank, fileName)
      .then((f) => {
        if (alive) file.current = f;
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [city, rank, fileName]);

  async function shareStory() {
    if (busy) return;
    setBusy(true);
    try {
      let f = file.current;
      if (!f) {
        f = await storyFile(city, rank, fileName);
        file.current = f;
      }
      if (navigator.canShare?.({ files: [f] })) {
        try {
          await navigator.share({ files: [f] });
          return;
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
        }
      }
      saveFile(f);
      toast.success("Bild gespeichert. Jetzt ab in deine Story.");
    } catch {
      toast.error("Das Bild konnte nicht geladen werden. Versuch es noch einmal.");
    } finally {
      setBusy(false);
    }
  }

  async function shareNative() {
    try {
      await navigator.share({ title: "Gen Z steht auf", text: shareText(city), url: inviteUrl(city) });
    } catch {}
  }

  async function copyLink() {
    const ok = await copyText(inviteUrl(city));
    if (!ok) {
      toast.error("Kopieren hat nicht geklappt.");
      return;
    }
    setCopied(true);
    toast.success("Link kopiert. Schick ihn deinen Leuten.");
    setTimeout(() => setCopied(false), 2400);
  }

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${shareText(city)} ${inviteUrl(city)}`)}`;

  return (
    <div className="sheet-scroll">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Drawer.Title className="t-h2">
            Du bist <span className="text-orange">dabei.</span>
          </Drawer.Title>
          <Drawer.Description className="mt-2 max-w-[24rem]">
            Samstag, 31. Oktober, ab 14 Uhr in {city.name}. Sag es weiter, zusammen sind wir lauter.
          </Drawer.Description>
        </div>
        <Drawer.Close className="icon-btn" aria-label="Schließen">
          <X weight="bold" className="size-5" aria-hidden="true" />
        </Drawer.Close>
      </div>

      <Ticket city={city} rank={rank} />

      <div className="mt-6 grid gap-3">
        <button type="button" className="btn btn-lg btn-primary w-full" onClick={shareStory} aria-busy={busy || undefined}>
          {busy ? (
            <CircleNotch weight="bold" className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <ImageSquare weight="bold" className="size-5" aria-hidden="true" />
          )}
          Story-Bild teilen
        </button>
        {/* Wenig Innenabstand, damit „Link kopieren“ auch auf schmalen Handys in eine Zeile passt. Unter 360 px untereinander. */}
        <div className="grid gap-3 min-[360px]:grid-cols-2 [&>.btn]:gap-1.5 [&>.btn]:px-2.5">
          <a className="btn btn-quiet" href={whatsapp} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo weight="bold" className="size-5" aria-hidden="true" />
            WhatsApp
          </a>
          <button type="button" className="btn btn-quiet" onClick={copyLink}>
            {copied ? (
              <Check weight="bold" className="size-5 text-orange" aria-hidden="true" />
            ) : (
              <LinkSimple weight="bold" className="size-5" aria-hidden="true" />
            )}
            {copied ? "Kopiert" : "Link kopieren"}
          </button>
          <a className="btn btn-quiet" href={`/kalender/${city.id}.ics`}>
            <CalendarPlus weight="bold" className="size-5" aria-hidden="true" />
            Kalender
          </a>
          <a className="btn btn-quiet" href={mapsUrl(city)} target="_blank" rel="noopener noreferrer">
            <NavigationArrow weight="bold" className="size-5" aria-hidden="true" />
            Route
          </a>
        </div>
        {canShare ? (
          <button type="button" className="btn btn-quiet w-full" onClick={shareNative}>
            <ShareNetwork weight="bold" className="size-5" aria-hidden="true" />
            Mehr Möglichkeiten zum Teilen
          </button>
        ) : null}
      </div>

      {city.lead ? (
        <div className="mt-3">
          <TelegramLink city={city} button />
        </div>
      ) : null}
      <p className="mt-6 text-soft">
        Falsche Stadt? Tipp in der Liste einfach auf eine andere. Deine Zusage zieht mit um und zählt weiter nur einmal.
      </p>
      <Withdraw />
    </div>
  );
}

function Withdraw() {
  const [ask, setAsk] = useState(false);
  if (!ask) {
    return (
      <p className="mt-2 text-soft">
        Doch keine Zeit?{" "}
        <button type="button" className="link-quiet" onClick={() => setAsk(true)}>
          Zusage zurückziehen
        </button>
      </p>
    );
  }
  return (
    <div className="card mt-4 p-4" role="group" aria-label="Zusage zurückziehen">
      <p>
        Willst du deine Zusage wirklich zurückziehen? Du kannst später jederzeit wieder zusagen.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-sm btn-light" onClick={() => setAsk(false)} autoFocus>
          Ich bleibe dabei
        </button>
        <button type="button" className="btn btn-sm btn-quiet" onClick={() => void withdrawVote()}>
          Ja, zurückziehen
        </button>
      </div>
    </div>
  );
}

function Ticket({ city, rank }: { city: City; rank: number }) {
  const nr = fmt(rank);
  const long = city.name.length > 10;
  // Breite des längsten Worts in em: Auf schmalen Handys wird der Name so weit kleiner, dass kein Wort umbricht.
  const em = Math.max(...city.name.split(" ").map(blackWidth));
  return (
    <div
      className="ticket mt-6"
      role="img"
      aria-label={`Dein Ticket: ${city.name}, Treffpunkt ${city.place}, Samstag 31. Oktober, ab 14 Uhr. Du bist Nummer ${nr}.`}
    >
      <div className="ticket-main">
        <p className="t-label font-bold">Gen Z steht auf · 31.10.2026</p>
        <p className={cn("ticket-city", long && "is-long")} style={{ "--em": em.toFixed(2) } as CSSProperties}>
          {city.name}
        </p>
        {city.lead ? <p className="t-label mt-1">Organisiert von Gen Z regelt</p> : null}
        <div className="ticket-place">
          <p className="t-label">Treffpunkt</p>
          <p className="mt-1 flex items-start gap-1.5 text-[1.25rem] font-bold leading-7">
            <MapPin weight="fill" className="mt-1 size-5 shrink-0 text-orange" aria-hidden="true" />
            {city.place}
          </p>
        </div>
        <div className="ticket-meta">
          <p>
            <span className="t-label block">Datum</span>
            <span className="font-bold">Sa, 31.10.</span>
          </p>
          <p>
            <span className="t-label block">Start</span>
            <span className="font-bold">14:00 Uhr</span>
          </p>
        </div>
      </div>
      <div className="ticket-stub">
        <span className="t-label font-bold">Nr.</span>
        <span className={cn("ticket-nr", nr.length > 3 && "is-mid", nr.length > 5 && "is-long")}>{nr}</span>
        <Logo size={40} badge />
      </div>
    </div>
  );
}

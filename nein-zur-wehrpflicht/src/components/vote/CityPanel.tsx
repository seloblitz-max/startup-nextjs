"use client";

import { Clock, MapPin, NavigationArrow, TelegramLogo, UsersThree } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { CITY_BY_ID, mapsUrl, type City } from "@/lib/cities";
import { cn, fmt } from "@/lib/format";
import VoteButton from "./VoteButton";
import { useVote } from "./VoteProvider";

/**
 * Telegram-Gruppe einer Stadt, für die Gen Z regelt verantwortlich ist. Der Link führt direkt zur Gruppe (auf dem Handy
 * in die Telegram-App). Ohne Link steht dort, dass sie folgt. `button`: als breiter Knopf, etwa im Ticket.
 */
export function TelegramLink({ city, className, button = false }: { city: City; className?: string; button?: boolean }) {
  if (!city.lead) return null;
  if (!city.telegram) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-mute", className)}>
        <TelegramLogo weight="bold" className="size-4" aria-hidden="true" />
        Telegram-Gruppe folgt
      </span>
    );
  }
  return (
    <a
      href={city.telegram}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        // Als Knopf darf der Text auf sehr schmalen Handys umbrechen, statt aus dem Knopf zu laufen.
        button ? "btn btn-quiet h-auto min-h-12 w-full whitespace-normal py-2.5 text-center leading-snug" : "link-quiet inline-flex items-center gap-1.5",
        className,
      )}
    >
      <TelegramLogo weight={button ? "fill" : "bold"} className={button ? "size-5 text-orange" : "size-4"} aria-hidden="true" />
      <span>
        Telegram-Gruppe {city.short ?? city.name}
        {button ? <span className="max-[399px]:hidden"> beitreten</span> : null}
      </span>
    </a>
  );
}

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-soft" aria-hidden="true">
        {icon}
      </span>
      <div>
        <dt className="t-label text-soft">{label}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}

/** Was zur gewählten Stadt wichtig ist: wer organisiert, Treffpunkt, Uhrzeit, Zusagen. */
export default function CityPanel() {
  const focus = useVote((s) => s.focus);
  const mine = useVote((s) => s.mine?.city ?? null);
  const counts = useVote((s) => s.counts);
  const ready = useVote((s) => s.ready);
  const id = focus ?? mine;
  const city = id ? CITY_BY_ID[id] : null;

  if (!city) {
    return (
      <div className="card p-5 sm:p-6">
        <p className="t-h4">Wähle deine Stadt</p>
        <p className="mt-2 text-soft">
          Tipp auf einen Punkt in der Karte oder such deine Stadt in der Liste. Dann siehst du Treffpunkt, Uhrzeit und wie viele
          schon dabei sind.
        </p>
      </div>
    );
  }

  const n = counts[city.id] ?? 0;
  return (
    <div className="card p-5 sm:p-6" aria-live="polite">
      <p className={cn("t-label font-bold", city.lead ? "text-orange" : "text-soft")}>
        {city.lead ? "Hauptverantwortlich: Gen Z regelt" : "Weitere Stadt auf der Plattform"}
      </p>
      <h3 className="t-h3 mt-2">{city.name}</h3>
      <dl className="mt-4 grid gap-3">
        <Fact icon={<MapPin weight="bold" className="size-5" />} label="Treffpunkt">
          <span className="font-bold">{city.place}</span>
        </Fact>
        <Fact icon={<Clock weight="bold" className="size-5" />} label="Wann">
          Samstag, 31.10., ab 14 Uhr
        </Fact>
        <Fact icon={<UsersThree weight="bold" className="size-5" />} label="Zusagen">
          {ready ? `${fmt(n)} ${n === 1 ? "Person ist" : "Menschen sind"} dabei` : "werden geladen"}
        </Fact>
      </dl>
      <VoteButton city={city} strong className="mt-5 w-full" />
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <a href={mapsUrl(city)} target="_blank" rel="noopener noreferrer" className="link-quiet inline-flex items-center gap-1.5">
          <NavigationArrow weight="bold" className="size-4" aria-hidden="true" />
          Route planen
        </a>
        <TelegramLink city={city} />
      </div>
    </div>
  );
}

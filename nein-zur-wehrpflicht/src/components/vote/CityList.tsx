"use client";

import { CaretDown, MagnifyingGlass, NavigationArrow, WarningCircle, WifiSlash, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { byViews, CITIES, CITY_BY_ID, CITY_COUNT, LEAD_CITIES, mapsUrl, type City } from "@/lib/cities";
import { cn, fmt } from "@/lib/format";
import { voteStore } from "@/lib/vote-store";
import { TelegramLink } from "./CityPanel";
import VoteButton from "./VoteButton";
import { useVote } from "./VoteProvider";

// "Köln", "koln" und "koeln" sollen alle Köln finden.
const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
const translit = (s: string) =>
  s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
const HAY: Record<string, string> = Object.fromEntries(
  CITIES.map((c) => {
    const t = `${c.name} ${c.place}`;
    return [c.id, `${fold(t)} ${translit(t)}`];
  }),
);

/** So viele weitere Städte sind zu sehen, bevor man „alle zeigen“ antippt. */
const FIRST = 6;
const ROW_SPRING = { type: "spring" as const, stiffness: 420, damping: 40 };
const LEAD_IDS = LEAD_CITIES.map((c) => c.id);

/**
 * Liste aller Städte: oben die fünf Städte von Gen Z regelt (feste Reihenfolge), darunter alle weiteren, sortiert nach
 * Aufrufen. Die Reihenfolge steht nach dem ersten Zählerstand fest, damit beim Tippen nichts verrutscht.
 */
export default function CityList() {
  const counts = useVote((s) => s.counts);
  const views = useVote((s) => s.views);
  const ready = useVote((s) => s.ready);
  const mine = useVote((s) => s.mine?.city ?? null);
  const focus = useVote((s) => s.focus);
  const setup = useVote((s) => s.setup);
  const live = useVote((s) => s.live);

  const [query, setQuery] = useState("");
  const [all, setAll] = useState(false);
  const [others, setOthers] = useState<string[]>(() => byViews(views).map((c) => c.id));
  const frozen = useRef(ready);

  useEffect(() => {
    if (frozen.current || !ready) return;
    frozen.current = true;
    setOthers(byViews(views).map((c) => c.id));
  }, [ready, views]);

  const q = fold(query.trim());
  const match = (id: string) => !q || HAY[id].includes(q);
  const lead = LEAD_IDS.filter(match);
  const rest = others.filter(match);
  // Eingeklappt: die beliebtesten weiteren Städte, dazu immer die eigene und die gerade gewählte.
  const shown = q || all ? rest : rest.filter((id, i) => i < FIRST || id === mine || id === focus);
  const hidden = rest.length - shown.length;

  const row = (id: string) => (
    <Row key={id} city={CITY_BY_ID[id]} n={counts[id] ?? 0} ready={ready} mine={mine === id} open={focus === id} />
  );

  return (
    <div>
      <label className="search">
        <MagnifyingGlass weight="bold" className="size-5 shrink-0 text-mute" aria-hidden="true" />
        <span className="sr-only">Stadt oder Treffpunkt suchen</span>
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Stadt oder Treffpunkt suchen"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setQuery("")}
        />
        {query ? (
          <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="Suche löschen">
            <X weight="bold" className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </label>

      {!setup ? (
        <Notice icon={<WarningCircle weight="fill" className="size-5 shrink-0 text-orange" aria-hidden="true" />}>
          Die Abstimmung startet in Kürze. Schau gleich noch einmal vorbei.
        </Notice>
      ) : !live && ready ? (
        <Notice icon={<WifiSlash weight="bold" className="size-5 shrink-0 text-soft" aria-hidden="true" />}>
          Keine Verbindung. Die Zahlen sind vielleicht nicht ganz aktuell.
        </Notice>
      ) : null}

      {lead.length ? (
        <Group title={`Unsere ${LEAD_IDS.length} Städte`} note="Hier organisiert Gen Z regelt Inhalte und Ablauf." lead>
          {lead.map(row)}
        </Group>
      ) : null}

      {rest.length ? (
        <Group title="Weitere Städte" note="Auf der Plattform dabei, sortiert nach Aufrufen.">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map(row)}
          </AnimatePresence>
        </Group>
      ) : null}

      {hidden > 0 ? (
        <button type="button" className="btn btn-quiet mt-4 w-full" onClick={() => setAll(true)}>
          Alle {rest.length} weiteren Städte zeigen
          <CaretDown weight="bold" className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {!lead.length && !rest.length ? (
        <div className="py-10 text-center">
          <p className="t-h4">Keine Stadt gefunden</p>
          <p className="mx-auto mt-2 max-w-[22rem] text-soft">
            Der Protest läuft in {CITY_COUNT} Städten. Vielleicht ist eine in deiner Nähe dabei.
          </p>
          <button type="button" className="btn btn-sm btn-quiet mt-5" onClick={() => setQuery("")}>
            Alle Städte zeigen
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Group({ title, note, lead = false, children }: { title: string; note: string; lead?: boolean; children: ReactNode }) {
  return (
    <section className="mt-8" aria-label={title}>
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <h3 className="t-h4 flex items-center gap-2.5">
          <span className={cn("legend-dot mt-0", lead && "is-lead")} aria-hidden="true" />
          {title}
        </h3>
      </div>
      <p className="mt-3 text-soft">{note}</p>
      <ul className="relative mt-2">{children}</ul>
    </section>
  );
}

function Notice({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="card mt-4 flex items-start gap-3 px-4 py-3" role="status">
      {icon}
      <span>{children}</span>
    </p>
  );
}

function Row({
  ref,
  city,
  n,
  ready,
  mine,
  open,
}: {
  ref?: React.Ref<HTMLLIElement>;
  city: City;
  n: number;
  /** Erst wenn Zahlen da sind, wird gezählt. Davor ein Strich statt einer falschen Null. */
  ready: boolean;
  mine: boolean;
  open: boolean;
}) {
  const count = ready ? fmt(n) : "–";
  return (
    <motion.li
      ref={ref}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ layout: ROW_SPRING, opacity: { duration: 0.18 } }}
      className={cn("city-row", city.lead && "is-lead", mine && "is-mine")}
      data-selected={open || undefined}
    >
      <span className="city-dot" aria-hidden="true" />
      <button
        type="button"
        className="city-pick"
        aria-expanded={open}
        onClick={() => {
          voteStore.setFocus(open ? null : city.id);
          if (!open) voteStore.trackView(city.id);
        }}
      >
        <span className="city-name">{city.name}</span>
        <span className="city-place">
          {city.place}
          <span className="sm:hidden"> · {count} dabei</span>
        </span>
      </button>
      <p className="city-count max-sm:hidden" aria-label={`${count} dabei`}>
        <Ticker value={count} />
        <span className="t-label font-normal text-soft">dabei</span>
      </p>
      <VoteButton city={city} small />
      {open ? (
        <div className="flex flex-wrap gap-x-5 gap-y-2 pb-1 [grid-column:2/-1]">
          <span className="text-soft">Samstag, 31.10., ab 14 Uhr</span>
          <a href={mapsUrl(city)} target="_blank" rel="noopener noreferrer" className="link-quiet inline-flex items-center gap-1.5">
            <NavigationArrow weight="bold" className="size-4" aria-hidden="true" />
            Route
          </a>
          <TelegramLink city={city} />
        </div>
      ) : null}
    </motion.li>
  );
}

/** Zahl, die bei jeder Änderung von oben hereinrollt. */
function Ticker({ value }: { value: string }) {
  return (
    <span className="inline-grid overflow-hidden" aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          className="col-start-1 row-start-1"
          initial={{ y: "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

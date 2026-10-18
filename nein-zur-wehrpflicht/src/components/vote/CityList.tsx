"use client";

import { Check, CircleNotch, MagnifyingGlass, WarningCircle, WifiSlash, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CITIES, type City } from "@/lib/cities";
import { cn, fmt } from "@/lib/format";
import type { Counts } from "@/lib/store";
import { voteStore } from "@/lib/vote-store";
import { castVote, useVote } from "./VoteProvider";

type Sort = "az" | "top";

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

const FLYER: Record<string, number> = Object.fromEntries(CITIES.map((c, i) => [c.id, i]));
const AZ = [...CITIES].sort((a, b) => a.name.localeCompare(b.name, "de")).map((c) => c.id);
const byTop = (counts: Counts) =>
  [...CITIES]
    .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0) || FLYER[a.id] - FLYER[b.id])
    .map((c) => c.id);
const BY_ID: Record<string, City> = Object.fromEntries(CITIES.map((c) => [c.id, c]));

const SORTS: Array<[Sort, string]> = [
  ["az", "A bis Z"],
  ["top", "Beliebteste"],
];
// Solange jemand gerade in der Liste tippt, springt die Reihenfolge nicht um.
const HOLD_MS = 2500;
const ROW_SPRING = { type: "spring" as const, stiffness: 420, damping: 40 };

export default function CityList() {
  const counts = useVote((s) => s.counts);
  const mine = useVote((s) => s.mine?.city ?? null);
  const pending = useVote((s) => s.pending);
  const focus = useVote((s) => s.focus);
  const setup = useVote((s) => s.setup);
  const live = useVote((s) => s.live);
  const ready = useVote((s) => s.ready);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("az");
  const [order, setOrder] = useState<string[]>(AZ);
  const touched = useRef(0);

  useEffect(() => {
    if (sort === "az") {
      setOrder(AZ);
      return;
    }
    const apply = () => setOrder(byTop(voteStore.get().counts));
    const wait = HOLD_MS - (Date.now() - touched.current);
    if (wait <= 0) {
      apply();
      return;
    }
    const t = setTimeout(apply, wait);
    return () => clearTimeout(t);
  }, [sort, counts]);

  const q = fold(query.trim());
  const visible = q ? order.filter((id) => HAY[id].includes(q)) : order;
  const max = Math.max(1, ...Object.values(counts));

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        <div className="segmented" role="group" aria-label="Sortierung">
          {SORTS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={sort === id}
              onClick={() => {
                touched.current = 0;
                setSort(id);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!setup ? (
        <Notice icon={<WarningCircle weight="fill" className="size-5 shrink-0 text-signal-hi" aria-hidden="true" />}>
          Die Abstimmung startet in Kürze. Schau gleich noch einmal vorbei.
        </Notice>
      ) : !live && ready ? (
        <Notice icon={<WifiSlash weight="bold" className="size-5 shrink-0 text-paper-2" aria-hidden="true" />}>
          Keine Verbindung. Die Zahlen sind vielleicht nicht ganz aktuell.
        </Notice>
      ) : null}

      <ul className="relative mt-5 border-t border-line" onPointerDownCapture={() => (touched.current = Date.now())}>
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((id) => (
            <Row
              key={id}
              city={BY_ID[id]}
              n={counts[id] ?? 0}
              max={max}
              rank={sort === "top" ? order.indexOf(id) + 1 : 0}
              mine={mine}
              pending={pending}
              focused={focus === id}
            />
          ))}
        </AnimatePresence>
      </ul>

      {visible.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-display text-3xl font-extrabold uppercase">Keine Stadt gefunden</p>
          <p className="mx-auto mt-2 max-w-[22rem] text-paper-2">
            Der Protest läuft in 21 Städten. Vielleicht ist eine in deiner Nähe dabei.
          </p>
          <button type="button" className="btn btn-sm btn-ghost mt-5" onClick={() => setQuery("")}>
            Alle Städte zeigen
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Notice({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="mt-4 flex items-start gap-3 rounded-sm border border-line bg-ink-2 px-4 py-3 text-sm text-paper-2" role="status">
      {icon}
      <span>{children}</span>
    </p>
  );
}

function Row({
  ref,
  city,
  n,
  max,
  rank,
  mine,
  pending,
  focused,
}: {
  ref?: React.Ref<HTMLLIElement>;
  city: City;
  n: number;
  max: number;
  rank: number;
  mine: string | null;
  pending: string | null;
  focused: boolean;
}) {
  const isMine = mine === city.id;
  return (
    <motion.li
      ref={ref}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ layout: ROW_SPRING, opacity: { duration: 0.18 } }}
      className={cn("city-row", rank > 0 && "with-rank", isMine && "is-mine")}
      data-focus={focused || undefined}
    >
      {rank > 0 ? <span className={cn("city-rank", rank <= 3 && n > 0 && "is-top")}>{String(rank).padStart(2, "0")}</span> : null}
      <div className="min-w-0">
        <p className="city-name">{city.name}</p>
        <p className="city-place">{city.place}</p>
      </div>
      <p className="city-count">
        <Ticker n={n} />
        <span className="city-count-label">dabei</span>
      </p>
      <VoteButton city={city} mine={mine} pending={pending} />
      <span className="city-bar" style={{ transform: `scaleX(${n / max})` }} aria-hidden="true" />
    </motion.li>
  );
}

/** Zahl, die bei jeder Änderung von oben hereinrollt. */
function Ticker({ n }: { n: number }) {
  return (
    <span className="inline-grid overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.span
          key={n}
          className="col-start-1 row-start-1"
          initial={{ y: "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        >
          {fmt(n)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function VoteButton({ city, mine, pending }: { city: City; mine: string | null; pending: string | null }) {
  if (mine === city.id) {
    return (
      <button type="button" className="btn btn-sm btn-paper city-btn" onClick={voteStore.openSheet}>
        <Check weight="bold" className="size-4" aria-hidden="true" />
        Dabei
        <span className="sr-only">: Ticket für {city.name} zeigen</span>
      </button>
    );
  }
  const busy = pending === city.id;
  return (
    <button
      type="button"
      className={cn("btn btn-sm city-btn", mine ? "btn-ghost" : "btn-outline")}
      disabled={!!pending}
      aria-busy={busy || undefined}
      onClick={() => void castVote(city.id)}
    >
      {busy ? <CircleNotch weight="bold" className="size-4 animate-spin" aria-hidden="true" /> : null}
      {mine ? "Wechseln" : "Ich bin dabei"}
      <span className="sr-only">{mine ? ` zu ${city.name}` : `: ${city.name}`}</span>
    </button>
  );
}

"use client";

import { Check, CircleNotch } from "@phosphor-icons/react";
import type { City } from "@/lib/cities";
import { cn } from "@/lib/format";
import { voteStore } from "@/lib/vote-store";
import { castVote, useVote } from "./VoteProvider";

/**
 * Zusagen, wechseln oder das eigene Ticket öffnen. In der Liste bleibt der Knopf weiß umrandet (kein orangefarbener
 * Teppich aus 21 Knöpfen), im Stadtfenster ist er orange (`strong`).
 */
export default function VoteButton({
  city,
  small = false,
  strong = false,
  className,
}: {
  city: City;
  small?: boolean;
  strong?: boolean;
  className?: string;
}) {
  const mine = useVote((s) => s.mine?.city ?? null);
  const pending = useVote((s) => s.pending);
  const size = small ? "btn-sm" : null;

  if (mine === city.id) {
    return (
      <button type="button" className={cn("btn btn-light", size, className)} onClick={voteStore.openSheet}>
        <Check weight="bold" className={small ? "size-4" : "size-5"} aria-hidden="true" />
        Dabei
        <span className="sr-only">: Ticket für {city.name} zeigen</span>
      </button>
    );
  }
  const busy = pending === city.id;
  return (
    <button
      type="button"
      className={cn("btn", size, mine ? "btn-quiet" : strong ? "btn-primary" : "btn-secondary", className)}
      disabled={!!pending}
      aria-busy={busy || undefined}
      onClick={() => void castVote(city.id)}
    >
      {busy ? <CircleNotch weight="bold" className={cn("animate-spin", small ? "size-4" : "size-5")} aria-hidden="true" /> : null}
      {mine ? "Wechseln" : "Ich bin dabei"}
      <span className="sr-only">{mine ? ` zu ${city.name}` : `: ${city.name}`}</span>
    </button>
  );
}

"use client";

import { MotionConfig } from "motion/react";
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { toast } from "sonner";
import { CITY_BY_ID } from "@/lib/cities";
import type { Snapshot } from "@/lib/store";
import { initialState, voteStore, type VoteResult, type VoteState, type WithdrawResult } from "@/lib/vote-store";

const InitialCtx = createContext<VoteState>(initialState(null, null));

export function VoteProvider({
  snapshot,
  invite = null,
  children,
}: {
  snapshot: Snapshot | null;
  invite?: string | null;
  children: ReactNode;
}) {
  const init = useMemo(() => initialState(snapshot, invite), [snapshot, invite]);
  if (typeof window !== "undefined") voteStore.hydrate(init);
  useEffect(() => voteStore.start(), []);
  return (
    <InitialCtx.Provider value={init}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </InitialCtx.Provider>
  );
}

/** Liest einen Teil des Abstimmungs-Zustands. Beim Server-Rendern gelten die Startwerte. */
export function useVote<T>(select: (s: VoteState) => T): T {
  const init = useContext(InitialCtx);
  return useSyncExternalStore(
    voteStore.subscribe,
    () => select(voteStore.get()),
    () => select(init),
  );
}

const name = (id: string) => CITY_BY_ID[id]?.name ?? id;

/** Stimme abgeben und das Ergebnis als kurze Meldung zeigen. */
export async function castVote(city: string): Promise<VoteResult> {
  const res = await voteStore.vote(city);
  if (res.ok) {
    if (res.previous) toast.success(`Gewechselt. Du bist jetzt in ${name(city)} dabei.`);
    return res;
  }
  const retry = { label: "Nochmal", onClick: () => void castVote(city) };
  switch (res.reason) {
    case "busy":
      break;
    case "limit":
      toast.error("Von deinem Internetanschluss kamen heute schon sehr viele neue Stimmen. Versuch es morgen noch einmal oder über mobile Daten.");
      break;
    case "rate":
      toast.error("Gerade kommen zu viele Stimmen von deinem Anschluss. Warte eine Minute und versuch es dann noch einmal.", { action: retry });
      break;
    case "setup":
      toast.error("Die Abstimmung ist noch nicht eingerichtet. Schau später noch einmal vorbei.");
      break;
    case "network":
      toast.error("Keine Verbindung. Prüf dein Internet und versuch es noch einmal.", { action: retry });
      break;
    default:
      toast.error("Das hat nicht geklappt. Versuch es noch einmal.", { action: retry });
  }
  return res;
}

/** Zusage zurückziehen, mit kurzer Rückmeldung. */
export async function withdrawVote(): Promise<WithdrawResult> {
  const res = await voteStore.withdraw();
  if (res.ok) {
    if (res.city) toast.success(`Deine Zusage für ${name(res.city)} ist zurückgezogen.`);
    return res;
  }
  switch (res.reason) {
    case "busy":
      break;
    case "rate":
      toast.error("Gerade kommen zu viele Anfragen von deinem Anschluss. Warte eine Minute.");
      break;
    case "network":
      toast.error("Keine Verbindung. Prüf dein Internet und versuch es noch einmal.");
      break;
    default:
      toast.error("Das hat nicht geklappt. Versuch es noch einmal.");
  }
  return res;
}

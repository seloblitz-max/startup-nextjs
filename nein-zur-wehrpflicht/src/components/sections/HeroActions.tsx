"use client";

import { ArrowRight, CircleNotch, Ticket } from "@phosphor-icons/react";
import RollingNumber from "@/components/bits/RollingNumber";
import { castVote, useVote } from "@/components/vote/VoteProvider";
import { CITY_BY_ID } from "@/lib/cities";
import { voteStore } from "@/lib/vote-store";

export default function HeroActions() {
  const total = useVote((s) => s.total);
  const ready = useVote((s) => s.ready);
  const mine = useVote((s) => s.mine);
  const invite = useVote((s) => s.invite);
  const pending = useVote((s) => s.pending);
  const inviteCity = invite ? CITY_BY_ID[invite] : null;
  const myCity = mine ? CITY_BY_ID[mine.city] : null;

  if (inviteCity && !myCity) {
    return (
      <div className="invite">
        <p className="text-paper-2">
          Du wurdest eingeladen: <strong className="text-paper">{inviteCity.name}</strong>, {inviteCity.place}.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            className="btn btn-lg btn-signal"
            disabled={!!pending}
            aria-busy={pending === inviteCity.id || undefined}
            onClick={() => castVote(inviteCity.id)}
          >
            {pending === inviteCity.id ? <CircleNotch className="size-5 animate-spin" aria-hidden="true" /> : null}
            Ich bin auch dabei
          </button>
          <a href="#staedte" className="link-quiet">
            Andere Stadt wählen
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-5">
      {myCity ? (
        <button type="button" className="btn btn-lg btn-paper" onClick={voteStore.openSheet}>
          <Ticket weight="bold" className="size-5" aria-hidden="true" />
          Du bist in {myCity.name} dabei
        </button>
      ) : (
        <a href="#staedte" className="btn btn-lg btn-signal group">
          Ich bin dabei
          <ArrowRight weight="bold" className="size-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </a>
      )}
      <p className="flex items-center gap-3" aria-live="off">
        <span className="font-display text-[2.6rem] font-black leading-none text-paper">
          {ready ? <RollingNumber value={total} /> : <span aria-hidden="true">&nbsp;</span>}
        </span>
        <span className="text-sm leading-tight text-paper-2">
          {total === 1 ? "Mensch ist" : "Menschen sind"}
          <br />
          schon dabei
          <span className="live-dot ml-2 align-middle" aria-hidden="true" />
        </span>
      </p>
    </div>
  );
}

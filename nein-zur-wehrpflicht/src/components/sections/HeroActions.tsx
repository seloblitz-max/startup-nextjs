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

  return (
    <>
      {inviteCity && !myCity ? (
        <div className="mt-8 border-l-[3px] border-orange pl-4">
          <p>
            Du wurdest eingeladen: <strong className="font-bold">{inviteCity.name}</strong>, Treffpunkt {inviteCity.place}.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="button"
              className="btn btn-lg btn-primary"
              disabled={!!pending}
              aria-busy={pending === inviteCity.id || undefined}
              onClick={() => castVote(inviteCity.id)}
            >
              {pending === inviteCity.id ? <CircleNotch weight="bold" className="size-5 animate-spin" aria-hidden="true" /> : null}
              Ich bin auch dabei
            </button>
            <a href="#staedte" className="link-quiet">
              Andere Stadt wählen
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap gap-3">
          {myCity ? (
            <button type="button" className="btn btn-lg btn-light" onClick={voteStore.openSheet}>
              <Ticket weight="bold" className="size-5" aria-hidden="true" />
              Dein Ticket für {myCity.name}
            </button>
          ) : (
            <a href="#staedte" className="btn btn-lg btn-primary group">
              Ich bin dabei
              <ArrowRight weight="bold" className="size-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
          )}
          <a href="#forderungen" className="btn btn-lg btn-secondary">
            Unsere Forderungen
          </a>
        </div>
      )}

      <p className="mt-8 flex items-center gap-3">
        <span className="text-[2.5rem] font-extrabold leading-none">
          {ready ? <RollingNumber value={total} /> : <span className="text-mute">–</span>}
        </span>
        <span className="leading-tight">
          {total === 1 ? "Mensch ist" : "Menschen sind"} schon dabei
          <span className="live-dot ml-2 align-middle" aria-hidden="true" />
        </span>
      </p>
    </>
  );
}

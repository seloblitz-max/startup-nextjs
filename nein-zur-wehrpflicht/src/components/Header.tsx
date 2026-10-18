"use client";

import { Ticket } from "@phosphor-icons/react";
import { useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { voteStore } from "@/lib/vote-store";
import SquirrelMark from "./SquirrelMark";
import { fmt } from "@/lib/format";
import { useVote } from "./vote/VoteProvider";

export default function Header() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 24));
  const mine = useVote((s) => s.mine);
  const total = useVote((s) => s.total);
  const ready = useVote((s) => s.ready);

  return (
    <header
      data-solid={solid || undefined}
      className="fixed inset-x-0 top-0 z-40 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-300 data-[solid]:border-line data-[solid]:bg-ink/85 data-[solid]:backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-2" aria-label="Gen Z steht auf, zur Startseite">
          <SquirrelMark className="size-7 text-signal transition-transform duration-300 group-hover:-rotate-6" />
          <span className="font-display text-[1.35rem] font-extrabold uppercase leading-none tracking-[0.04em]">Gen Z steht auf</span>
        </Link>
        <nav aria-label="Hauptnavigation" className="flex items-center gap-1 sm:gap-2">
          <a href="#staedte" className="nav-link hidden lg:inline-flex">Städte</a>
          <a href="#warum" className="nav-link hidden lg:inline-flex">Warum</a>
          <a href="#infos" className="nav-link hidden lg:inline-flex">Infos</a>
          {ready ? (
            <a href="#staedte" className="hidden items-center gap-2 px-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-paper-2 md:inline-flex">
              <span className="live-dot" aria-hidden="true" />
              {fmt(total)} dabei
            </a>
          ) : null}
          {mine ? (
            <button type="button" onClick={voteStore.openSheet} className="btn btn-sm btn-paper">
              <Ticket weight="bold" className="size-4" aria-hidden="true" />
              Dein Ticket
            </button>
          ) : (
            <a href="#staedte" className="btn btn-sm btn-signal">
              Ich bin dabei
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

"use client";

import { List, Ticket, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fmt } from "@/lib/format";
import { voteStore } from "@/lib/vote-store";
import Logo from "./brand/Logo";
import Wordmark from "./brand/Wordmark";
import { useVote } from "./vote/VoteProvider";

const NAV = [
  { href: "#staedte", label: "Städte" },
  { href: "#forderungen", label: "Forderungen" },
  { href: "#haltung", label: "Haltung" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const mine = useVote((s) => s.mine);
  const total = useVote((s) => s.total);
  const ready = useVote((s) => s.ready);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onWide = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onWide);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="site-header" data-solid={solid || undefined} data-open={open || undefined}>
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Gen Z steht auf, zur Startseite" onClick={close}>
          <Logo size={36} eager />
          <Wordmark className="whitespace-nowrap text-[0.875rem] min-[360px]:text-[1.0625rem]" />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden items-center lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {ready ? (
            <a href="#staedte" className="t-label hidden items-center gap-2 px-2 xl:inline-flex">
              <span className="live-dot" aria-hidden="true" />
              {fmt(total)} dabei
            </a>
          ) : null}
          {mine ? (
            <button type="button" onClick={voteStore.openSheet} className="btn btn-sm btn-light max-lg:hidden">
              <Ticket weight="bold" className="size-4" aria-hidden="true" />
              Dein Ticket
            </button>
          ) : (
            <a href="#staedte" className="btn btn-sm btn-primary max-lg:hidden">
              Ich bin dabei
            </a>
          )}
          {mine ? (
            <button type="button" onClick={voteStore.openSheet} className="icon-btn lg:hidden" aria-label="Dein Ticket zeigen">
              <Ticket weight="bold" className="size-5" aria-hidden="true" />
            </button>
          ) : null}
          <button
            type="button"
            className="icon-btn lg:hidden"
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X weight="bold" className="size-5" aria-hidden="true" /> : <List weight="bold" className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav id="menu" aria-label="Menü" className="menu-panel lg:hidden">
          <div className="container-page pb-6">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="menu-link" onClick={close}>
                {item.label}
              </a>
            ))}
            {mine ? (
              <button
                type="button"
                className="btn btn-light mt-6 w-full"
                onClick={() => {
                  close();
                  voteStore.openSheet();
                }}
              >
                <Ticket weight="bold" className="size-5" aria-hidden="true" />
                Dein Ticket
              </button>
            ) : (
              <a href="#staedte" className="btn btn-primary mt-6 w-full" onClick={close}>
                Ich bin dabei
              </a>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

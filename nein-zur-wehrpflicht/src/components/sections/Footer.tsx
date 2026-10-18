import { Crown } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1320px] px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-12 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2">
              <Crown weight="fill" className="size-6 text-signal" aria-hidden="true" />
              <span className="font-display text-[1.5rem] font-extrabold uppercase leading-none tracking-[0.04em]">Gen Z steht auf</span>
            </p>
            <p className="mt-3 max-w-[28rem] text-sm leading-relaxed text-mute">
              Für unsere Zukunft. Gemeinsam für Deutschland. Deine Zusage ist anonym, ohne Konto und ohne Tracking.
            </p>
          </div>
          <nav aria-label="Rechtliches" className="flex gap-6 text-sm font-semibold">
            <Link href="/impressum" className="nav-link px-0">
              Impressum
            </Link>
            <Link href="/datenschutz" className="nav-link px-0">
              Datenschutz
            </Link>
          </nav>
        </div>
        <p className="mt-10 text-xs text-mute">Fotos auf dieser Seite sind Symbolbilder.</p>
        <p className="mt-6 border-t border-line pt-6 text-sm text-paper-2">
          <a
            href="https://selodigital.com.de"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-paper underline decoration-signal decoration-2 underline-offset-4 transition-colors hover:text-signal-hi"
          >
            selodigital
          </a>{" "}
          steht hinter Gen Z.
        </p>
      </div>
    </footer>
  );
}

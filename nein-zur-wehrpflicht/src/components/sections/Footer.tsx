import Link from "next/link";
import Logo from "@/components/brand/Logo";
import Wordmark from "@/components/brand/Wordmark";
import { CONTACT_EMAIL } from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="border-t border-mark-2">
      <div className="container-page pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-3">
              <Logo size={44} alt="Logo von Gen Z regelt: ein orangefarbenes Eichhörnchen" />
              <Wordmark className="text-[1.25rem]" />
            </p>
            <p className="mt-4">
              Für <span className="text-orange">unsere</span> Zukunft. Für <span className="text-orange">Demokratie.</span>
            </p>
            <p className="mt-2 text-soft">
              Kontakt:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="link-quiet">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
          <nav aria-label="Rechtliches" className="flex gap-6">
            <Link href="/impressum" className="nav-link px-0">
              Impressum
            </Link>
            <Link href="/datenschutz" className="nav-link px-0">
              Datenschutz
            </Link>
          </nav>
        </div>
        <p className="mt-10 border-t border-mark-2 pt-6 text-soft">
          <a
            href="https://selodigital.com.de"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-white underline decoration-orange decoration-2 underline-offset-4 transition-colors hover:text-orange"
          >
            selodigital
          </a>{" "}
          steht hinter Gen Z.
        </p>
      </div>
    </footer>
  );
}

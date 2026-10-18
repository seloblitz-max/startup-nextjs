import { ArrowLeft, Crown } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "@/components/sections/Footer";

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2" aria-label="Gen Z steht auf, zur Startseite">
            <Crown weight="fill" className="size-6 text-signal" aria-hidden="true" />
            <span className="font-display text-[1.35rem] font-extrabold uppercase leading-none tracking-[0.04em]">Gen Z steht auf</span>
          </Link>
          <Link href="/" className="nav-link gap-2">
            <ArrowLeft weight="bold" className="size-4" aria-hidden="true" />
            Startseite
          </Link>
        </div>
      </header>
      <main id="inhalt" className="mx-auto max-w-[46rem] px-4 py-16 sm:px-6 lg:py-24">
        <h1 className="section-title">{title}</h1>
        <div className="legal mt-10">{children}</div>
      </main>
      <Footer />
    </>
  );
}

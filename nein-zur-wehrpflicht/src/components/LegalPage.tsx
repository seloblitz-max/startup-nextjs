import { ArrowLeft } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/brand/Logo";
import Wordmark from "@/components/brand/Wordmark";
import Footer from "@/components/sections/Footer";

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <header className="border-b border-mark-2">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Gen Z steht auf, zur Startseite">
            <Logo size={36} />
            <Wordmark />
          </Link>
          <Link href="/" className="nav-link gap-2">
            <ArrowLeft weight="bold" className="size-4" aria-hidden="true" />
            Startseite
          </Link>
        </div>
      </header>
      <main id="inhalt" className="mx-auto max-w-[46rem] px-4 py-16 sm:px-6 lg:py-24">
        <h1 className="t-h1 hyphens-auto break-words">{title}</h1>
        <div className="legal mt-10">{children}</div>
      </main>
      <Footer />
    </>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main id="inhalt" className="grid min-h-[100svh] place-items-center px-4 py-20 text-center">
      <div>
        <p className="eyebrow justify-center">Fehler 404</p>
        <h1 className="section-title mt-5">
          Diese Seite <span className="text-signal">gibt es nicht.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[26rem] text-paper-2">Vielleicht ist der Link nicht ganz richtig. Alles zum Protest findest du auf der Startseite.</p>
        <Link href="/" className="btn btn-lg btn-red mt-10">
          Zur Startseite
        </Link>
      </div>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import hoernchen from "@/img/foto-hoernchen.jpg";

export default function NotFound() {
  return (
    <main id="inhalt" className="grid min-h-[100svh] place-items-center px-4 py-20 text-center">
      <div>
        <Image
          src={hoernchen}
          alt="Ein Eichhörnchen mit einer Walnuss im Maul schaut in die Kamera."
          sizes="192px"
          className="photo mx-auto mb-10 w-40 sm:w-48"
        />
        <p className="eyebrow">Fehler 404</p>
        <h1 className="t-h1 mt-4">
          Diese Seite <span className="text-orange">gibt es nicht.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[26rem]">Vielleicht ist der Link nicht ganz richtig. Alles zum Protest findest du auf der Startseite.</p>
        <Link href="/" className="btn btn-lg btn-primary mt-10">
          Zur Startseite
        </Link>
      </div>
    </main>
  );
}

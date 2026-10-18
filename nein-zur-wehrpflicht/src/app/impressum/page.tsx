import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

// Vor der Veröffentlichung ausfüllen (markierte Stellen): Pflichtangaben nach § 5 DDG und § 18 MStV.
export default function Impressum() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben nach § 5 DDG</h2>
      <p>
        <mark className="todo">Vor- und Nachname oder Name der Gruppe</mark>
        <br />
        <mark className="todo">Straße und Hausnummer</mark>
        <br />
        <mark className="todo">PLZ und Ort</mark>
      </p>
      <h2>Kontakt</h2>
      <p>
        E-Mail: <mark className="todo">kontakt@beispiel.de</mark>
      </p>
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        <mark className="todo">Name und Anschrift wie oben</mark>
      </p>
      <h2>Hinweis</h2>
      <p>
        Die Treffpunkte stammen aus dem öffentlichen Aufruf zum Protest am 31. Oktober. Für die einzelnen Versammlungen sind die
        jeweiligen Anmelder*innen vor Ort verantwortlich. Die Fotos auf dieser Seite sind Symbolbilder.
      </p>
    </LegalPage>
  );
}

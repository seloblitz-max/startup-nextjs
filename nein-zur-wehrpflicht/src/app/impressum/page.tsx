import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

// Private, nicht gewerbliche Seite: Angaben nach § 18 MStV, keine Unternehmensangaben nach § 5 DDG.
export default function Impressum() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß §&nbsp;18 Abs.&nbsp;1 MStV</h2>
      <p>
        Akram Selo
        <br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href="tel:+4917612748240">0176&nbsp;12748240</a>
        <br />
        E-Mail: <a href="mailto:selodigital.web@gmail.com">selodigital.web@gmail.com</a>
      </p>

      <h2>Verantwortlich für den Inhalt nach §&nbsp;18 Abs.&nbsp;2 MStV</h2>
      <p>
        Akram Selo
        <br />
        Deutschland
      </p>

      <h2>Hinweis</h2>
      <p>
        Diese Website ist ein privates, nicht kommerzielles Angebot. Forderungen, Haltung und Erklärung stammen aus den Papieren
        von Gen Z regelt (Kontakt: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>). Die Treffpunkte stammen aus dem
        öffentlichen Aufruf zum Protest am 31.&nbsp;Oktober. Für die einzelnen Versammlungen sind die jeweiligen
        Anmelder*innen vor Ort verantwortlich.
      </p>
    </LegalPage>
  );
}

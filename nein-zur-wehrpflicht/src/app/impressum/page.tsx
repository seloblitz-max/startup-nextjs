import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

export default function Impressum() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß §&nbsp;5 DDG</h2>
      <p>
        Selo Digital
        <br />
        Einzelunternehmen
        <br />
        Inhaber: Akram Selo
      </p>

      <h2>Anschrift</h2>
      <p>Deutschland</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href="tel:+4917612748240">0176&nbsp;12748240</a>
        <br />
        E-Mail: <a href="mailto:selodigital.web@gmail.com">selodigital.web@gmail.com</a>
        <br />
        Website:{" "}
        <a href="https://selodigital.com.de" target="_blank" rel="noopener noreferrer">
          selodigital.com.de
        </a>
      </p>

      <h2>Tätigkeit</h2>
      <p>Webdesign und digitale Dienstleistungen</p>

      <h2>Umsatzsteuer</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß §&nbsp;27a UStG:
        <br />
        Nicht vorhanden.
      </p>

      <h2>Verantwortlich für den Inhalt nach §&nbsp;18 Abs.&nbsp;2 MStV</h2>
      <p>
        Akram Selo
        <br />
        Deutschland
      </p>

      <h2>Hinweis zur Verbraucher&shy;streit&shy;beilegung</h2>
      <p>
        Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht verpflichtet
        und grundsätzlich nicht bereit.
      </p>

      <h2>Hinweis zu den Treffpunkten</h2>
      <p>
        Die Treffpunkte stammen aus dem öffentlichen Aufruf zum Protest am 31.&nbsp;Oktober. Für die einzelnen Versammlungen sind die
        jeweiligen Anmelder*innen vor Ort verantwortlich. Die Fotos auf dieser Seite sind Symbolbilder.
      </p>
    </LegalPage>
  );
}

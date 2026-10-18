import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Datenschutzerklärung", alternates: { canonical: "/datenschutz" } };

const MAIL = "selodigital.web@gmail.com";

export default function Datenschutz() {
  return (
    <LegalPage title={"Datenschutz­erklärung"}>
      <p>
        Kurz gesagt: Diese Website kommt ohne Konto, ohne Tracking, ohne Analyse-Tools und ohne Werbung aus. Gespeichert wird
        nur, was für Ihre Zusage „Ich bin dabei“ nötig ist.
      </p>

      <h2>Verantwortlicher</h2>
      <p>
        Akram Selo
        <br />
        Deutschland
        <br />
        Telefon: <a href="tel:+4917612748240">0176&nbsp;12748240</a>
        <br />
        E-Mail: <a href={`mailto:${MAIL}`}>{MAIL}</a>
      </p>

      <h2>1. Hosting</h2>
      <p>
        Diese Website wird bei Vercel gehostet. Anbieter ist die Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA&nbsp;91723,
        USA. Wenn Sie unsere Website besuchen, werden die unter „Server-Logfiles“ genannten Daten auf den Servern von Vercel
        verarbeitet. Die Server-Funktionen dieser Website laufen in Frankfurt am Main.
      </p>
      <p>
        Vercel kann Daten auch in die USA übermitteln und ist dafür nach dem EU-US Data Privacy Framework zertifiziert.
        Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO. Unser berechtigtes Interesse
        liegt in einer sicheren, schnellen und zuverlässigen Bereitstellung unserer Website. Weitere Informationen finden Sie
        in der{" "}
        <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">
          Datenschutzerklärung von Vercel
        </a>
        .
      </p>
      <p>
        Schriften, Bilder und Skripte werden direkt von dieser Website geladen. Inhalte von Google oder anderen
        Drittanbietern werden nicht nachgeladen.
      </p>

      <h2>2. Server-Logfiles</h2>
      <p>
        Beim Besuch der Website können durch den Hosting-Anbieter technische Daten wie IP-Adresse, Datum und Uhrzeit,
        Browser, Betriebssystem und aufgerufene Seiten verarbeitet werden. Dies dient dem sicheren und technisch
        störungsfreien Betrieb der Website.
      </p>

      <h2>3. Ihre Zusage „Ich bin dabei“</h2>
      <p>
        Wenn Sie bei einer Stadt auf „Ich bin dabei“ tippen, speichern wir Ihre Zusage. So sehen alle live, wie viele Menschen
        in jeder Stadt dabei sind, und jedes Gerät zählt nur einmal. Gespeichert werden:
      </p>
      <ul>
        <li>
          <strong>Geräte-Kennung:</strong> eine zufällige, vom Server signierte Kennung, die Ihr Gerät mit der ersten Zusage
          bekommt. Sie verrät nicht, wer Sie sind.
        </li>
        <li>
          <strong>Ihre Zusage:</strong> die gewählte Stadt und Ihre Nummer in dieser Stadt. Kein Name, keine E-Mail-Adresse,
          keine Telefonnummer.
        </li>
        <li>
          <strong>Zählerstand:</strong> eine Gesamtzahl pro Stadt, ohne Bezug zu einzelnen Personen.
        </li>
      </ul>
      <p>
        Die Zusage ist freiwillig, die Website funktioniert auch ohne sie. Weil eine Zusage zu einem Protest eine politische
        Meinung erkennen lassen kann, speichern wir sie nur mit Ihrer Einwilligung, die Sie mit dem Antippen erteilen
        (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a und Art.&nbsp;9 Abs.&nbsp;2 lit.&nbsp;a DSGVO). Sie können die Einwilligung jederzeit widerrufen: Öffnen Sie
        Ihr Ticket und tippen Sie auf „Zusage zurückziehen“. Der Eintrag wird dann sofort gelöscht.
      </p>
      <p>
        Die Daten liegen in einer Datenbank der Upstash, Inc. (USA) im Rechenzentrum Frankfurt am Main. Mit Upstash besteht
        ein Vertrag über die Auftragsverarbeitung gemäß Art.&nbsp;28 DSGVO. Für mögliche Übermittlungen in die USA nutzt Upstash
        das EU-US Data Privacy Framework und die Standardvertragsklauseln der EU-Kommission. Weitere Informationen finden Sie
        in der{" "}
        <a href="https://upstash.com/static/trust/privacy.pdf" target="_blank" rel="noopener noreferrer">
          Datenschutzerklärung von Upstash
        </a>
        .
      </p>

      <h2>4. Schutz vor Missbrauch</h2>
      <p>
        Damit niemand die Zahlen mit Skripten verfälscht, begrenzen wir, wie oft aus einem Netz abgestimmt werden kann. Dazu
        bilden wir aus Ihrer IP-Adresse (bei IPv6 aus den ersten 64 Bit) mit einem geheimen Schlüssel einen Hash, aus dem
        sich die Adresse nicht ablesen lässt. Damit zählen wir die Stimmen pro Minute und die neuen Geräte pro Tag. Die
        IP-Adresse selbst speichern wir nicht. Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO. Unser berechtigtes Interesse
        liegt in einer fälschungssicheren Zählung.
      </p>

      <h2>5. Cookies und ähnliche Technologien</h2>
      <p>
        Diese Website verwendet nur technisch notwendige Technologien, und das erst, wenn Sie „Ich bin dabei“ tippen:
      </p>
      <ul>
        <li>
          den Cookie <code>wp_device</code> mit Ihrer Geräte-Kennung,
        </li>
        <li>
          dieselbe Kennung im Speicher Ihres Browsers (<code>wp-device-token</code>), falls Ihr Browser den Cookie nicht
          behält.
        </li>
      </ul>
      <p>
        Nur so erkennt die Website, dass Ihr Gerät schon zugesagt hat. Dafür ist keine Einwilligung nötig
        (§&nbsp;25 Abs.&nbsp;2 Nr.&nbsp;2 TDDDG). Cookies für Analyse, Tracking oder Werbung verwenden wir nicht.
      </p>

      <h2>6. Externe Links</h2>
      <p>
        Die Links zu Google Maps und WhatsApp öffnen fremde Dienste erst, wenn Sie sie antippen. Erst dann werden Daten an
        diese Anbieter übertragen, und es gelten deren Datenschutzbestimmungen.
      </p>

      <h2>7. Rechtsgrundlagen</h2>
      <p>
        Die Verarbeitung personenbezogener Daten erfolgt auf Grundlage von Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a und Art.&nbsp;9 Abs.&nbsp;2 lit.&nbsp;a DSGVO
        (Ihre Zusage), Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (Hosting, Server-Logfiles und Schutz vor Missbrauch) sowie
        §&nbsp;25 Abs.&nbsp;2 Nr.&nbsp;2 TDDDG (Geräte-Kennung in Ihrem Browser).
      </p>

      <h2>8. Speicherdauer</h2>
      <p>
        Personenbezogene Daten werden nur so lange gespeichert, wie dies für den jeweiligen Zweck erforderlich ist.
      </p>
      <ul>
        <li>
          Ihre Zusage und Ihre Geräte-Kennung löschen wir, sobald Sie die Zusage zurückziehen, sonst automatisch
          am 14.&nbsp;November 2026, zwei Wochen nach dem Protest. Spätere Zusagen löschen sich nach einem Tag.
        </li>
        <li>
          Der Cookie läuft zum selben Zeitpunkt ab. Die Kennung im Speicher Ihres Browsers wird beim nächsten Besuch danach
          gelöscht. Sie können beides jederzeit selbst entfernen, indem Sie die Website-Daten in Ihrem Browser löschen.
        </li>
        <li>
          Die Zähler zum Schutz vor Missbrauch löschen sich nach zwei Minuten (Stimmen pro Minute) und nach 25 Stunden (neue
          Geräte pro Tag).
        </li>
      </ul>

      <h2>9. Ihre Rechte</h2>
      <p>Sie haben insbesondere das Recht auf:</p>
      <ul className="is-tight">
        <li>Auskunft</li>
        <li>Berichtigung</li>
        <li>Löschung</li>
        <li>Einschränkung der Verarbeitung</li>
        <li>Datenübertragbarkeit</li>
        <li>Widerspruch</li>
        <li>Widerruf einer erteilten Einwilligung</li>
      </ul>
      <p>
        Anfragen können Sie an <a href={`mailto:${MAIL}`}>{MAIL}</a> richten. Da wir nicht wissen, wer Sie sind, können wir
        Ihre Zusage nur über die Kennung auf Ihrem Gerät finden. Am schnellsten löschen Sie sie selbst über „Zusage
        zurückziehen“.
      </p>
      <p>Sie haben außerdem das Recht, sich bei einer zuständigen Datenschutzaufsichtsbehörde zu beschweren.</p>
    </LegalPage>
  );
}

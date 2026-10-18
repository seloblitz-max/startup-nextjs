import Reveal from "@/components/Reveal";

const QA = [
  {
    q: "Muss ich mich anmelden?",
    a: "Nein. Du tippst einfach auf deine Stadt. Kein Konto, keine E-Mail, keine Telefonnummer.",
  },
  {
    q: "Was speichert ihr?",
    a: "Nur, welche Stadt dein Gerät gewählt hat, unter einer zufälligen Kennung. Gegen Missbrauch zählen wir kurz, wie oft aus einem Netz abgestimmt wird, ohne die IP-Adresse zu speichern. Zwei Wochen nach dem Protest wird alles gelöscht.",
  },
  {
    q: "Kann ich meine Stadt ändern?",
    a: "Ja, jederzeit. Tipp auf eine andere Stadt, dann zieht deine Zusage mit um. Gezählt wirst du immer nur einmal. Über dein Ticket kannst du die Zusage auch ganz zurückziehen.",
  },
  {
    q: "Darf ich auch mit 15 oder 16 mit?",
    a: "Ja. Für Demos gibt es kein Mindestalter. Sag deinen Eltern Bescheid, wo du bist, und geh am besten mit Freund*innen hin.",
  },
  {
    q: "Wie genau ist die Zahl?",
    a: "Jedes Gerät zählt einmal. Wer einen anderen Browser nimmt oder alle Daten löscht, zählt noch einmal. Die Zahl zeigt also, wie viele Geräte zugesagt haben, nicht exakt, wie viele Menschen kommen.",
  },
  {
    q: "Wer organisiert das?",
    a: "Der Aufruf kommt von jungen Menschen aus ganz Deutschland. Die Versammlungen vor Ort melden Leute aus der jeweiligen Stadt an. Wer diese Seite betreibt, steht im Impressum.",
  },
];

export default function Faq() {
  return (
    <section aria-labelledby="faq-h" className="border-t border-line">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-28">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow">Kurz erklärt</p>
            <h2 id="faq-h" className="section-title is-narrow mt-4">
              Fragen <span className="text-signal">und Antworten.</span>
            </h2>
          </div>
        </Reveal>
        <dl className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
          {QA.map((item, i) => (
            <Reveal key={item.q} delay={(i % 2) * 0.06} className="border-t border-line py-7">
              <dt className="text-[1.15rem] font-bold leading-snug text-paper">{item.q}</dt>
              <dd className="mt-2 leading-relaxed text-paper-2">{item.a}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

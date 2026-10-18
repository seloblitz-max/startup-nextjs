import {
  ArrowSquareOut,
  FacebookLogo,
  FilePdf,
  Handshake,
  InstagramLogo,
  TelegramLogo,
  ThreadsLogo,
  TiktokLogo,
  XLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/ssr";
import Image from "next/image";
import ContactForm from "@/components/contact/ContactForm";
import megafon from "@/img/megafon.svg";
import { LEAD_CITIES, shortName } from "@/lib/cities";
import { CONTACT_EMAIL } from "@/lib/contact";
import { CALL, DOCUMENTS, SOCIAL } from "@/lib/content";

const NETWORKS = {
  instagram: { label: "Instagram", Icon: InstagramLogo },
  tiktok: { label: "TikTok", Icon: TiktokLogo },
  youtube: { label: "YouTube", Icon: YoutubeLogo },
  x: { label: "X", Icon: XLogo },
  threads: { label: "Threads", Icon: ThreadsLogo },
  facebook: { label: "Facebook", Icon: FacebookLogo },
  telegram: { label: "Telegram", Icon: TelegramLogo },
};

export default function Contact() {
  const social = SOCIAL.filter((s) => s.url);
  return (
    <section id="kontakt" aria-labelledby="kontakt-h" className="section">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Kontakt und Community</p>
              <h2 id="kontakt-h" className="t-h2 mt-3">
                Schreib uns. <span className="text-orange">Mach mit.</span>
              </h2>
            </div>
            {/* Megafon aus dem Kampagnen-Set, unverändert (src/img/megafon.svg) */}
            <Image src={megafon} alt="" width={298} height={322} unoptimized className="h-auto w-14 shrink-0 sm:w-20" />
          </div>
          <p className="mt-4 max-w-[38rem]">
            Du willst mitmachen, deine Stadt fehlt auf der Karte, oder ihr wollt uns als Organisation unterstützen? Schreib
            uns hier oder direkt an{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="link">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <ContactForm />
        </div>

        <div className="grid content-start gap-5 lg:col-span-5">
          <div className="card p-6">
            <h3 className="t-h4 flex items-center gap-2.5">
              <TelegramLogo weight="fill" className="size-6 text-orange" aria-hidden="true" />
              Telegram-Gruppen
            </h3>
            <p className="mt-2">Absprachen, Treffpunkte und kurzfristige Infos für unsere {LEAD_CITIES.length} Städte.</p>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {LEAD_CITIES.map((city) => (
                <li key={city.id}>
                  {city.telegram ? (
                    <a
                      href={city.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-quiet w-full justify-between px-4"
                      aria-label={`Telegram-Gruppe ${city.name} beitreten`}
                    >
                      {shortName(city)}
                      <ArrowSquareOut weight="bold" className="size-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="btn btn-quiet w-full cursor-default justify-between px-4 opacity-60" aria-disabled="true">
                      {shortName(city)}
                      <span className="t-label">folgt</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {social.length ? (
            <div className="card p-6">
              <h3 className="t-h4">Folg uns</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {social.map(({ network, url }) => {
                  const { label, Icon } = NETWORKS[network];
                  return (
                    <li key={network}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
                        <Icon weight="bold" className="size-5" aria-hidden="true" />
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="card p-6">
            <h3 className="t-h4 flex items-center gap-2.5">
              <Handshake weight="bold" className="size-6 text-orange" aria-hidden="true" />
              {CALL.title}
            </h3>
            <p className="mt-2">{CALL.text}</p>
            <p className="mt-3 font-bold">Gemeinsam zeigen wir: Ohne uns läuft die Zukunft nicht!</p>
          </div>

          <div className="card p-6">
            <h3 className="t-h4">Zum Herunterladen</h3>
            <ul className="mt-3">
              {DOCUMENTS.map((doc) => (
                <li key={doc.file} className="border-t border-mark-2 first:border-t-0">
                  <a href={doc.file} target="_blank" rel="noopener" className="group flex items-start gap-3 py-3">
                    <FilePdf weight="bold" className="mt-0.5 size-6 shrink-0 text-orange" aria-hidden="true" />
                    <span>
                      <span className="block font-bold group-hover:underline group-hover:decoration-orange group-hover:underline-offset-4">
                        {doc.title}
                      </span>
                      <span className="block text-soft">
                        {doc.text} PDF, {doc.pages}.
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

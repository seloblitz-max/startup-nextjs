import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { eventsJsonLd } from "@/lib/json-ld";
import { safeSnapshot } from "@/lib/store";

// Die Seite wird höchstens alle 30 Sekunden neu gebaut, die Zahlen kommen danach live im Browser.
export const revalidate = 30;

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Im Datei-Paket setzt scripts/hostinger-paket.mjs die Events in den <head>. Dort enthalten sie die Adresse der Seite,
// die erst beim Ausliefern feststeht, und die darf nicht in den React-Daten der Seite stehen.
const JSON_LD_INLINE = process.env.STATIC_EXPORT !== "1";

export default async function Page() {
  const snapshot = await safeSnapshot();
  return (
    <>
      {JSON_LD_INLINE ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: eventsJsonLd() }} /> : null}
      <HomePage snapshot={snapshot} />
    </>
  );
}

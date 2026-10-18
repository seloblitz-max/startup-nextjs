import Header from "@/components/Header";
import Toasts from "@/components/Toasts";
import Contact from "@/components/sections/Contact";
import DateBand from "@/components/sections/DateBand";
import Demo from "@/components/sections/Demo";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Topics from "@/components/sections/Topics";
import Values from "@/components/sections/Values";
import Board from "@/components/vote/Board";
import TicketSheet from "@/components/vote/TicketSheet";
import { VoteProvider } from "@/components/vote/VoteProvider";
import type { Snapshot } from "@/lib/store";

export default function HomePage({ snapshot, invite = null }: { snapshot: Snapshot | null; invite?: string | null }) {
  return (
    <VoteProvider snapshot={snapshot} invite={invite}>
      <Header />
      <main id="inhalt">
        <Hero />
        <DateBand />
        <Board />
        <Topics />
        <Values />
        <Demo />
        <Contact />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <TicketSheet />
      <Toasts />
    </VoteProvider>
  );
}

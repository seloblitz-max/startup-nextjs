import Header from "@/components/Header";
import Toasts from "@/components/Toasts";
import DateSection from "@/components/sections/DateSection";
import Faq from "@/components/sections/Faq";
import FinalCta from "@/components/sections/FinalCta";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Marquee from "@/components/sections/Marquee";
import Tips from "@/components/sections/Tips";
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
        <Marquee />
        <DateSection />
        <Board />
        <Manifesto />
        <Tips />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <TicketSheet />
      <Toasts />
    </VoteProvider>
  );
}

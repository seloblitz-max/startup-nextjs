import VelocityMarquee from "@/components/bits/VelocityMarquee";
import SquirrelMark from "@/components/SquirrelMark";

const ITEMS = ["Nein zur Wehrpflicht", "Unsere Zukunft ist kein Nebensatz", "31. Oktober, 14 Uhr", "21 Städte, ein Tag", "#GENZregelt"];

export default function Marquee() {
  return (
    <div className="relative z-20 -mx-[4vw] -rotate-[1.6deg] border-y-2 border-ink bg-signal py-3 text-ink shadow-[0_18px_40px_-18px_rgba(255,116,5,0.5)] sm:py-4">
      <VelocityMarquee baseVelocity={55}>
        {ITEMS.map((t) => (
          <span key={t} className="flex items-center">
            <span className="px-5 font-display text-[1.85rem] font-extrabold uppercase leading-none tracking-[0.02em] sm:px-7 sm:text-[2.4rem]">{t}</span>
            <SquirrelMark className="size-7 shrink-0 sm:size-9" />
          </span>
        ))}
      </VelocityMarquee>
    </div>
  );
}

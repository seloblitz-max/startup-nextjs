import HalftonePhoto from "@/components/bits/HalftonePhoto";
import CircularBadge from "@/components/bits/CircularBadge";
import SquirrelMark from "@/components/SquirrelMark";
import HeroActions from "./HeroActions";
import tor from "../../../public/img/tor.jpg";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-h">
      <div className="hero-photo absolute inset-x-0 top-0 h-[66svh] lg:inset-y-0 lg:left-auto lg:h-auto lg:w-[62%]">
        <HalftonePhoto
          src={tor}
          alt="Symbolbild: Menschenmenge vor dem Brandenburger Tor bei Sonnenuntergang"
          sizes="(min-width: 1024px) 62vw, 100vw"
          priority
          focus={[0.56, 0.3]}
          focusDesktop={[0.55, 0.42]}
          fade={{ bottom: 0.55, top: 0.14 }}
          fadeDesktop={{ left: 0.45, bottom: 0.34, top: 0.1 }}
          cell={6}
        />
        <span className="photo-credit">Symbolbild</span>
      </div>

      <div className="pointer-events-none absolute right-4 top-20 z-10 w-[5.5rem] text-paper sm:right-8 sm:w-28 lg:right-[6%] lg:top-28 lg:w-36">
        <CircularBadge text="Nein zur Wehrpflicht × 31.10. × 21 Städte × " className="pointer-events-auto">
          <SquirrelMark className="size-8 text-signal sm:size-10 lg:size-12" />
        </CircularBadge>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1320px] flex-col justify-end px-4 pb-10 pt-28 sm:px-6 sm:pb-14 lg:justify-center lg:px-10 lg:pb-20 lg:pt-24">
        <div className="max-w-[36rem] lg:max-w-[44rem]">
          <p className="kicker rise" style={{ animationDelay: "60ms" }}>
            <span>Samstag, 31. Oktober, 14 Uhr</span>
          </p>
          <h1 id="hero-h" className="hero-title mt-5 font-display font-black uppercase">
            <span className="rise block" style={{ animationDelay: "140ms" }}>
              Nein zur
            </span>
            <span className="rise block text-signal" style={{ animationDelay: "230ms" }}>
              Wehrpflicht.
            </span>
          </h1>
          <p className="rise mt-6 max-w-[30rem] text-[1.075rem] leading-relaxed text-paper-2 sm:text-lg" style={{ animationDelay: "340ms" }}>
            In 21 Städten gehen wir gleichzeitig auf die Straße. Für unsere Zukunft, gemeinsam für Deutschland.
          </p>
          <div className="rise mt-8" style={{ animationDelay: "440ms" }}>
            <HeroActions />
          </div>
        </div>
      </div>
    </section>
  );
}

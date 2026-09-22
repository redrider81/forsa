import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import SiteNavigation from "@/components/site-navigation";
import HeroReveal from "@/components/animations/HeroReveal";
import HeroVideoBackground from "@/components/hero-video-background";
import ParallaxController from "@/components/animations/ParallaxController";
import ScrollReveal from "@/components/animations/ScrollReveal";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import CoachingServicesGrid from "@/components/coaching-services-grid";
import EngagementSection from "@/components/engagement-section";
import KineticTeamHybrid from "@/components/ui/kinetic-team-hybrid";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";

export const metadata: Metadata = {
  title: "CVB Coaching – individuell coaching och business coaching i Göteborg",
  description:
    "CVB Coaching i Göteborg. Individuell coaching för dig som står inför ett vägval, och business coaching för medarbetare och ledare i arbetslivet.",
};

const t = svDictionary;

const relevancePoints = [
  "Du står inför ett vägval och behöver förstå vad som faktiskt är viktigt för dig.",
  "Du har fått ett nytt ansvar eller befinner dig i en förändring i arbetslivet.",
  "Du vet att något behöver förändras, men ser ännu inte hur du vill gå vidare.",
  "Du behöver fatta ett beslut utan att ha alla svar ännu.",
  "Du vill prata fritt, i förtroende och utanför din egen krets.",
];

const passarNär = [
  "Frågan angår dig på riktigt, inte bara på pappret.",
  "Du vill tänka färdigt själv, inte få ett färdigt svar.",
  "Det behöver ske utanför den egna kretsen, i förtroende.",
  "Något ska förändras, inte bara diskuteras.",
];

const mindreRelevant = [
  "Du söker en expert som bedömer läget och talar om vad du ska göra.",
  "Frågan handlar om ohälsa eller behöver behandlas. Då är terapi rätt väg, inte coaching.",
  "Riktningen är redan bestämd och det som återstår är att verkställa.",
];


export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f4f3ef] text-zinc-900">
      <ParallaxController>
        <section
          data-hero-sticky
          className="relative z-0 h-[100svh] min-h-[100svh] w-full overflow-hidden md:sticky md:top-0"
        >
          <HeroVideoBackground />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" aria-hidden="true" />
          <SiteNavigation />
          <div className="pointer-events-none absolute inset-0 z-[2]">
            <div className="pointer-events-auto flex min-h-full flex-col items-center px-6 pb-[max(clamp(2.5rem,8svh,4.5rem),env(safe-area-inset-bottom,0px))] md:absolute md:left-[5.5vw] md:top-[66%] md:min-h-0 md:max-w-md md:-translate-y-1/2 md:items-start md:justify-start md:px-0 md:pb-0 md:pt-0 lg:max-w-lg">
              <div
                className="w-full shrink-0 min-h-[min(38svh,22rem)] md:hidden"
                aria-hidden="true"
              />
              <HeroReveal className="relative flex w-full max-w-[22rem] shrink-0 flex-col items-center text-center sm:max-w-[24rem] md:max-w-lg md:items-start md:text-left lg:max-w-xl">
                <div className="relative w-full md:max-w-lg lg:max-w-xl">
                  <h1
                    data-hero-headline
                    className="relative mx-auto max-w-[18ch] text-4xl font-medium leading-[1.1] tracking-tight text-balance text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-5xl md:mx-0 md:max-w-none md:text-6xl md:leading-[1.08] lg:text-7xl"
                  >
                    Det finns frågor man inte tänker färdigt ensam.
                  </h1>
                </div>
                <p
                  data-hero-body
                  className="mt-6 max-w-[34ch] text-[1.0625rem] font-[450] leading-[1.6] text-balance text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)] md:mt-7 md:max-w-[46ch] md:text-lg"
                >
                  Professionell coaching med Carolina von Braun för dig som står inför ett vägval,
                  en förändring eller en fråga där nästa steg ännu inte är självklart.
                </p>
                <div className="mt-9 flex w-full flex-col items-center gap-4 md:mt-10 md:w-fit md:flex-row md:flex-wrap md:items-start md:justify-start md:gap-3.5">
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/kontakt" variant="primary" translucent>
                      Boka ett inledande samtal
                    </CtaLink>
                  </span>
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/#coaching" variant="secondary" translucent>
                      {t.cta.secondary}
                    </CtaLink>
                  </span>
                </div>
                <p
                  data-hero-cta
                  className="mt-5 text-[0.8125rem] leading-[1.6] text-white/75 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]"
                >
                  Kort och kostnadsfritt första telefonsamtal.
                </p>
              </HeroReveal>
            </div>
          </div>
        </section>

        <div className="relative z-10 isolate bg-[#f4f3ef]">
          <section id="coaching" data-parallax-section className="bg-white py-24 md:py-32 lg:py-40">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
              <ScrollReveal variant="splitColumn" className="grid gap-8 md:grid-cols-12 md:items-end md:gap-x-8">
                <p data-col-left className="text-xs font-medium tabular-nums tracking-[0.32em] text-[#967844] md:col-span-2">
                  01
                </p>
                <div data-col-right className="md:col-span-7 md:col-start-5">
                  <h2 className="font-serif text-[clamp(3rem,7vw,7rem)] font-medium leading-[0.92] tracking-[-0.045em] text-zinc-900">
                    Två vägar in
                  </h2>
                  <p className="mt-8 max-w-xl text-[1.0625rem] font-[450] leading-[1.7] text-zinc-600 md:mt-10">
                    Samma arbetssätt, två sammanhang: för dig själv eller i arbetslivet.
                  </p>
                </div>
              </ScrollReveal>
              <div className="mt-20 md:mt-28">
                <CoachingServicesGrid locale="sv" />
              </div>
              <p className="ml-auto mt-16 max-w-xl border-l border-[#967844]/60 pl-6 text-[0.9375rem] leading-[1.7] text-zinc-600 md:pl-8">
                Är du osäker på vilken väg som passar? Det avgör vi tillsammans i det första samtalet.
              </p>
            </div>
          </section>

          <section data-parallax-section className="bg-[#f4f3ef] py-24 md:py-32 lg:py-40">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-8">
                <div data-col-left className="md:col-span-5">
                  <p className="text-xs font-medium tabular-nums tracking-[0.32em] text-[#967844]">02</p>
                  <h2 className="mt-10 max-w-md font-serif text-[clamp(3rem,6vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.045em] text-zinc-900 md:mt-16">
                    När coaching kan vara rätt
                  </h2>
                </div>
                <div data-col-right className="md:col-span-6 md:col-start-7 md:pt-28 lg:pt-40">
                  <ScrollReveal variant="staggerList">
                    <ul className="divide-y divide-zinc-300 border-y border-zinc-300 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                      {relevancePoints.map((point) => (
                        <li key={point} data-list-item className="grid grid-cols-[1rem_1fr] gap-5 py-6 md:py-7">
                          <span className="mt-[0.72rem] h-1 w-1 bg-[#967844]" aria-hidden />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollReveal>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="splitColumn" className="mt-32 grid gap-12 border-t border-zinc-300 pt-16 md:mt-44 md:grid-cols-12 md:gap-x-8 md:pt-20">
                <h2 data-col-left className="max-w-md font-serif text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-zinc-900 md:col-span-4 md:text-5xl">
                  Så vet du om det här är rätt
                </h2>
                <div data-col-right className="grid gap-14 md:col-span-7 md:col-start-6 md:grid-cols-2 md:gap-10">
                  <ScrollReveal variant="staggerList">
                    <h3 className="text-lg font-medium text-zinc-900">Passar när</h3>
                    <ul className="mt-6 space-y-5 text-[1rem] leading-[1.7] text-zinc-700">
                      {passarNär.map((item) => (
                        <li key={item} data-list-item className="border-t border-zinc-300 pt-5">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </ScrollReveal>
                  <ScrollReveal variant="staggerList">
                    <h3 className="text-lg font-medium text-zinc-900">Mindre rätt när</h3>
                    <ul className="mt-6 space-y-5 text-[1rem] leading-[1.7] text-zinc-600">
                      {mindreRelevant.map((item) => (
                        <li key={item} data-list-item className="border-t border-zinc-300 pt-5">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </ScrollReveal>
                </div>
              </ScrollReveal>
            </div>
          </section>

          <section data-parallax-section className="bg-white py-24 md:py-32 lg:py-40">
            <EditorialRowsReveal className="mx-auto max-w-7xl px-6 md:px-10">
              <h2
                data-section-heading
                className="max-w-3xl font-serif text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.96] tracking-[-0.04em] text-zinc-900"
              >
                Vad arbetet består av
              </h2>
              <div className="mt-20 border-t border-zinc-300 md:mt-28">
                <article data-editorial-row className="border-b border-zinc-300 py-12 md:py-16">
                  <div className="grid gap-6 md:grid-cols-12 md:items-start md:gap-x-8">
                    <p data-row-index className="font-serif text-[clamp(4.5rem,9vw,8rem)] leading-[0.72] tracking-[-0.065em] text-zinc-200 md:col-span-3">01</p>
                    <h3 data-row-title className="text-2xl font-medium leading-tight tracking-tight text-zinc-900 md:col-span-3 md:text-3xl">Klarhet</h3>
                    <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-5 md:col-start-8">
                      Jag lyssnar och ställer frågor som hjälper dig att sortera vad frågan faktiskt
                      handlar om och vad som är viktigast för dig.
                    </p>
                  </div>
                </article>
                <article data-editorial-row className="border-b border-zinc-300 py-12 md:py-16 lg:pl-[8.333%]">
                  <div className="grid gap-6 md:grid-cols-12 md:items-start md:gap-x-8">
                    <p data-row-index className="font-serif text-[clamp(4.5rem,9vw,8rem)] leading-[0.72] tracking-[-0.065em] text-zinc-200 md:col-span-3">02</p>
                    <h3 data-row-title className="text-2xl font-medium leading-tight tracking-tight text-zinc-900 md:col-span-3 md:text-3xl">Beslut</h3>
                    <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-5 md:col-start-8">
                      Jag hjälper dig att pröva dina alternativ och de antaganden de vilar på, så att
                      du ser vad du väljer, vad du väljer bort och varför.
                    </p>
                  </div>
                </article>
                <article data-editorial-row className="border-b border-zinc-300 py-12 md:py-16">
                  <div className="grid gap-6 md:grid-cols-12 md:items-start md:gap-x-8">
                    <p data-row-index className="font-serif text-[clamp(4.5rem,9vw,8rem)] leading-[0.72] tracking-[-0.065em] text-zinc-200 md:col-span-3">03</p>
                    <h3 data-row-title className="text-2xl font-medium leading-tight tracking-tight text-zinc-900 md:col-span-3 md:text-3xl">Riktning</h3>
                    <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600 md:col-span-5 md:col-start-8">
                      Du omsätter det du kommit fram till i nästa steg som fungerar i din vardag.
                    </p>
                  </div>
                </article>
              </div>
            </EditorialRowsReveal>
          </section>

          <KineticTeamHybrid />

          <EngagementSection locale="sv" />

          <section data-parallax-section className="bg-white py-24 md:py-32">
            <ScrollReveal variant="fadeUp" className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-12 md:gap-x-8 md:px-10">
              <h2 className="max-w-2xl font-serif text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-zinc-900 md:col-span-6 md:text-6xl">
                Du behöver inte veta allt från början
              </h2>
              <div className="md:col-span-5 md:col-start-8 md:pt-24">
                <p className="max-w-xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600">
                  Du behöver inte veta i förväg hur många samtal som behövs eller ha formulerat frågan
                  helt. Det klarnar i det första samtalet.
                </p>
                <div className="mt-10">
                  <CtaLink href="/kontakt" variant="primary">Boka ett inledande samtal</CtaLink>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Sidan har två sifferspråk: små guldsiffror = kapitel, stora seriffsiffror =
              poster inne i en scen. Den jättelika skuggsiffran upprepade kapitelnumret i
              postformat och suddade ut skillnaden, därför är den borttagen. */}
          <section data-parallax-section className="relative overflow-hidden bg-zinc-950 py-28 text-zinc-100 md:py-40 lg:py-48">
            <ScrollReveal variant="splitColumn" className="relative mx-auto grid max-w-7xl gap-14 px-6 md:grid-cols-12 md:gap-x-8 md:px-10">
              <div data-col-left className="md:col-span-7">
                <p className="text-xs font-medium tabular-nums tracking-[0.32em] text-[#b89a60]">05</p>
                {/* Rubriken får en bredare spalt än övriga scener: meningen är lång, och
                    den ska läsas som tre–fyra rader snarare än en vägg av display-text. */}
                <h2 className="mt-12 max-w-3xl font-serif text-[clamp(3rem,4.4vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.04em] text-white md:mt-16">
                  Samtalet står i centrum. CVB Base hjälper dig att behålla sammanhanget mellan
                  samtalen.
                </h2>
              </div>
              <div data-col-right className="space-y-8 border-t border-[#967844]/60 pt-10 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-8 md:mt-40 md:pt-12">
                <p data-col-paragraph>
                  När det är relevant använder du CVB Base för att förbereda frågor, samla
                  reflektioner och återvända till sådant du vill följa över tid. Det ersätter inte
                  coachingen, utan ger dig en plats för det som händer mellan samtalen.
                </p>
              </div>
            </ScrollReveal>
          </section>

          <section data-parallax-section className="bg-[#f4f3ef] py-24 md:py-32 lg:py-40">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
              <p className="text-xs font-medium tabular-nums tracking-[0.32em] text-[#967844]">06</p>
              <ScrollReveal variant="splitColumn" className="mt-12 grid gap-12 md:mt-16 md:grid-cols-12 md:gap-x-8">
                <h2 data-col-left className="max-w-xl font-serif text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.94] tracking-[-0.045em] text-zinc-900 md:col-span-6">
                  När företaget tar första kontakten
                </h2>
                <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:col-span-5 md:col-start-8 md:pt-28">
                  <p data-col-paragraph>
                    CVB Coaching arbetar med enskilda medarbetare och ledare i arbetslivet. Företaget kan
                    ta den första kontakten och finansiera coachingen.
                  </p>
                  <p data-col-paragraph>
                    Därefter sker coachingen i en personlig och konfidentiell relation mellan Carolina
                    och klienten. I den första dialogen pratar jag med företaget om behovet, ramarna
                    för samarbetet och hur kontakten fungerar.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="splitColumn" className="mt-28 grid gap-12 border-t border-zinc-300 pt-16 md:mt-40 md:grid-cols-12 md:gap-x-8 md:pt-20">
                <h2 data-col-left className="max-w-lg font-serif text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-zinc-900 md:col-span-5 md:text-5xl">
                  I Göteborg eller digitalt
                </h2>
                <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:col-span-5 md:col-start-8">
                  <p data-col-paragraph>
                    CVB Coaching finns i Göteborg. Samtalen hålls på plats eller digitalt, beroende på
                    vad som passar bäst.
                  </p>
                  <p data-col-paragraph>Vad som sägs i samtalet stannar i samtalet.</p>
                </div>
              </ScrollReveal>
            </div>
          </section>

          <section data-parallax-section id="kontakt" className="bg-zinc-950 py-24 text-zinc-100 md:py-32 lg:py-40">
            <ScrollReveal variant="ctaStack" className="mx-auto max-w-7xl px-6 md:px-10">
              <h2 data-cta-heading className="max-w-5xl font-serif text-[clamp(3.2rem,8vw,8rem)] font-medium leading-[0.9] tracking-[-0.05em] text-white">
                Boka ett inledande samtal
              </h2>
              <div className="mt-14 grid gap-10 border-t border-white/20 pt-10 md:mt-20 md:grid-cols-12 md:gap-x-8 md:pt-12">
                <p data-cta-body className="max-w-xl text-[1.125rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-7">
                  Berätta kort vad du vill prata om och välj en tid. Du behöver inte ha formulerat allt.
                  Samtalet är konfidentiellt.
                </p>
                <div data-cta-actions className="md:col-span-5 md:col-start-7">
                  <CtaLink href="/kontakt" variant="secondary" translucent>Boka ett inledande samtal</CtaLink>
                  <p className="mt-6 text-[0.875rem] leading-[1.6] text-zinc-400">
                    Personlig coaching · Konfidentiella samtal · Göteborg eller digitalt
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </section>
        </div>
      </ParallaxController>
    </main>
  );
}

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
  "Du vet att något behöver förändras men kommer inte vidare i hur.",
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
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
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
                Personlig coaching med Carolina von Braun — för dig som står i ett vägval, en
                förändring eller en fråga i arbetslivet.
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
                Ett första samtal är konfidentiellt. Du behöver inte ha formulerat allt.
              </p>
            </HeroReveal>
          </div>
        </div>
      </section>

      <div className="relative z-10 isolate bg-zinc-100">
      <div className="mx-auto max-w-6xl px-6 pb-24 md:px-10">

        <section
          id="coaching"
          data-parallax-section
          className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white py-20 md:py-24"
        >
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <h2 className="max-w-3xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Två vägar in
            </h2>
            <p className="mt-6 max-w-2xl text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
              Samma arbetssätt, två sammanhang: för dig själv eller i arbetslivet.
            </p>
            <div className="mt-14">
              <CoachingServicesGrid locale="sv" />
            </div>
            <p className="mt-10 max-w-2xl text-[0.9375rem] leading-[1.7] text-zinc-600">
              Är du osäker på vilken väg som passar? Det avgör vi tillsammans i det första samtalet.
            </p>
          </div>
        </section>

        <KineticTeamHybrid />

        <section data-parallax-section className="relative z-10 bg-zinc-100 py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              När coaching kan vara rätt
            </h2>
            <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
              <ScrollReveal variant="staggerList" className="mt-0">
                <ul className="space-y-5 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800">
                  {relevancePoints.map((point) => (
                    <li key={point} data-list-item className="flex items-start gap-4">
                      <span className="mt-[0.7rem] h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-section className="py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Så vet du om det här är rätt
            </h2>
            <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
              <ScrollReveal variant="staggerList">
                <h3 className="text-lg font-medium text-zinc-900">Passar när</h3>
                <ul className="mt-4 space-y-3 text-[1.0625rem] leading-[1.7] text-zinc-800">
                  {passarNär.map((item) => (
                    <li key={item} data-list-item className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <h3 className="mt-8 text-lg font-medium text-zinc-900">Mindre rätt när</h3>
                <ul className="mt-4 space-y-3 text-[1.0625rem] leading-[1.7] text-zinc-700">
                  {mindreRelevant.map((item) => (
                    <li key={item} data-list-item className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-400" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </section>

        <section
          data-parallax-section
          className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white py-20 md:py-24"
        >
          <EditorialRowsReveal className="mx-auto max-w-6xl px-6 md:px-10">
          <h2
            data-section-heading
            className="max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]"
          >
            Vad arbetet består av
          </h2>
          <div className="mt-16 border-y border-line-accent/30">
            <article data-editorial-row className="border-b border-line-accent/30 py-12 md:py-14">
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p data-row-index className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400">01</p>
                <h3 data-row-title className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]">Klarhet</h3>
                <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl">
                  Vi sorterar vad frågan faktiskt handlar om och vad som är viktigast för dig.
                </p>
              </div>
            </article>
            <article data-editorial-row className="border-b border-line-accent/30 py-12 md:py-14">
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p data-row-index className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400">02</p>
                <h3 data-row-title className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]">Beslut</h3>
                <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl">
                  Vi prövar dina alternativ och ser vad du väljer, vad du väljer bort och varför.
                </p>
              </div>
            </article>
            <article data-editorial-row className="py-12 md:py-14">
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p data-row-index className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400">03</p>
                <h3 data-row-title className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]">Riktning</h3>
                <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl">
                  Du omsätter det du kommit fram till i nästa steg som fungerar i din vardag.
                </p>
              </div>
            </article>
          </div>
          </EditorialRowsReveal>
        </section>

        <EngagementSection locale="sv" />

        <section data-parallax-section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Du behöver inte veta allt från början
            </h2>
            <p className="mt-6 max-w-2xl text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800">
              Du behöver inte veta i förväg hur många samtal som behövs eller exakt vad frågan ska
              heta. Det klarnar i det första samtalet.
            </p>
            <div className="mt-9">
              <CtaLink href="/kontakt" variant="primary">Boka ett inledande samtal</CtaLink>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-section className="border-t border-line-accent/30 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Stöd mellan samtalen
            </h2>
            <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
              <p>
                Coaching handlar inte bara om vad som sägs i rummet. När det är relevant används CVB
                Base som ett personligt stöd för förberedelse, reflektion och material mellan samtal.
              </p>
              <p>
                Det hjälper dig att behålla sammanhanget i det du arbetar med — utan att ersätta det
                personliga samtalet.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-section className="py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              När företaget tar första kontakten
            </h2>
            <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
              <p>
                CVB Coaching arbetar med enskilda medarbetare och ledare i arbetslivet. Företaget kan
                ta den första kontakten och finansiera coachingen.
              </p>
              <p>
                Därefter sker coachingen i en personlig och konfidentiell relation mellan Carolina
                och klienten. I det första samtalet tydliggör vi behov, ramar och kontaktvägar.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-section className="py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              I Göteborg eller digitalt
            </h2>
            <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
              <p>
                CVB Coaching finns i Göteborg. Samtalen hålls på plats eller digitalt, beroende på
                vad som passar bäst.
              </p>
              <p>Vad som sägs i samtalet stannar i samtalet.</p>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-section id="kontakt" className="py-20 md:py-24">
          <ScrollReveal variant="ctaStack">
            <h2 data-cta-heading className="max-w-4xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.65rem]">
              Boka ett inledande samtal
            </h2>
            <p data-cta-body className="mt-8 max-w-3xl text-[1.125rem] font-[450] leading-[1.7] text-zinc-800">
              Skriv kort om det du vill prata om och välj en tid. Du behöver inte ha formulerat allt.
              Samtalet är konfidentiellt.
            </p>
            <div data-cta-actions className="mt-12 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">Boka ett inledande samtal</CtaLink>
            </div>
            <p data-cta-actions className="mt-5 text-[0.875rem] leading-[1.6] text-zinc-500">
              Personlig coaching · Konfidentiella samtal · Göteborg eller digitalt
            </p>
          </ScrollReveal>
        </section>

      </div>
      </div>
      </ParallaxController>
    </main>
  );
}

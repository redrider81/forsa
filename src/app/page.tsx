import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import SiteNavigation from "@/components/site-navigation";
import HeroReveal from "@/components/animations/HeroReveal";
import HeroVideoBackground from "@/components/hero-video-background";
import ParallaxController from "@/components/animations/ParallaxController";
import ScrollReveal from "@/components/animations/ScrollReveal";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import EditorialImageTransition from "@/components/animations/EditorialImageTransition";
import CoachingServicesGrid from "@/components/coaching-services-grid";
import EngagementSection from "@/components/engagement-section";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";

export const metadata: Metadata = {
  title: "CVB Coaching – individuell coaching och business coaching i Göteborg",
  description:
    "CVB Coaching i Göteborg. Individuell coaching för dig som står inför ett vägval, och business coaching för ledare, medarbetare, team och ledningsgrupper.",
};

const t = svDictionary;

const relevancePoints = [
  "Ett vägval ska avgöras innan du vet tillräckligt.",
  "Du gör allt du brukar göra och kommer ändå inte vidare.",
  "Rollen har vuxit fortare än mandatet.",
  "En fas är slut — ett jobb, ett uppdrag, ett sätt att arbeta — och nästa har inte tagit form.",
  "Prioriteringarna skiftar oftare än verksamheten hinner ställa om.",
  "Beslut fattas i rummet men tappar kraft i vardagen.",
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
            <HeroReveal className="relative flex w-full max-w-[20rem] shrink-0 flex-col items-center text-center sm:max-w-[21rem] md:max-w-md md:items-start md:text-left lg:max-w-lg">
              <div className="relative w-full md:max-w-md lg:max-w-lg">
                <h1
                  data-hero-headline
                  className="relative mx-auto inline-block max-w-[18ch] rounded-2xl bg-black/18 px-4 py-3 text-[2rem] font-medium leading-[1.12] tracking-tight text-balance text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-[8px] drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-4xl md:mx-0 md:max-w-none md:px-5 md:py-4 md:text-5xl md:leading-tight"
                >
                  Det finns frågor man inte tänker färdigt ensam.
                </h1>
              </div>
              <div className="mt-9 flex w-full flex-col items-center gap-4 md:mt-10 md:w-fit md:flex-row md:flex-wrap md:items-start md:justify-start md:gap-3.5">
                <span data-hero-cta className="inline-flex justify-center">
                  <CtaLink href="/kontakt" variant="primary" translucent>
                    {t.cta.primary}
                  </CtaLink>
                </span>
                <span data-hero-cta className="inline-flex justify-center">
                  <CtaLink href="/#coaching" variant="secondary" translucent>
                    {t.cta.secondary}
                  </CtaLink>
                </span>
              </div>
            </HeroReveal>
          </div>
        </div>
      </section>

      <div className="relative z-10 isolate bg-zinc-100">
      <div className="mx-auto max-w-6xl px-6 pb-24 md:px-10">

        <section
          data-hero-reveal-first
          className="relative bg-gradient-to-b from-[#f8f7f4] via-zinc-100 to-[#f3f2ee] py-20 md:py-24"
        >
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16 md:gap-y-10">
            <h2
              data-col-left
              className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:pr-4 md:text-[2.1rem]"
            >
              Det är mig du träffar.
            </h2>
            <div
              data-col-right
              className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end"
            >
              <p data-col-paragraph>
                Jag heter Carolina von Braun och driver CVB Coaching i Göteborg. Innan jag blev coach
                arbetade jag på kapitalmarknaden och i styrelser. Det gör att jag känner igen lägen
                där besluten får verkliga konsekvenser.
              </p>
              <p data-col-paragraph>
                Som coach är uppgiften en annan: att göra tänkandet klarare, inte att ta över dina
                slutsatser.{" "}
                <Link
                  href="/om-oss"
                  className="underline underline-offset-4 decoration-zinc-400 transition-colors hover:text-zinc-950 hover:decoration-zinc-700"
                >
                  Mer om mig
                </Link>
                .
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section
          id="coaching"
          data-parallax-section
          className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white pt-20 pb-0 md:pt-24"
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
          </div>
          <EditorialImageTransition
            src="/supertable.png"
            alt="Förberedelse inför ett coachingsamtal"
            className="mt-20 md:mt-24"
          />
        </section>

        <section data-parallax-section className="relative z-10 bg-zinc-100 py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Sex lägen där coaching hör hemma
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
          <div className="mt-16 border-y border-zinc-200/80">
            <article data-editorial-row className="border-b border-zinc-200/80 py-12 md:py-14">
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p data-row-index className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400">01</p>
                <h3 data-row-title className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]">Klarhet</h3>
                <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl">
                  Frågan du kommer med är sällan den som avgör. Arbetet börjar med att skilja dem åt.
                </p>
              </div>
            </article>
            <article data-editorial-row className="border-b border-zinc-200/80 py-12 md:py-14">
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p data-row-index className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400">02</p>
                <h3 data-row-title className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]">Beslut</h3>
                <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl">
                  Ett beslut prövas innan det fattas. Vad du väger mot vad, vad du faktiskt vet och
                  vad du väljer bort.
                </p>
              </div>
            </article>
            <article data-editorial-row className="py-12 md:py-14">
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p data-row-index className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400">03</p>
                <h3 data-row-title className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]">Riktning</h3>
                <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl">
                  Det avgörande händer mellan samtalen. Vi stämmer av vad du faktiskt gjorde, inte vad
                  du tänkte göra.
                </p>
              </div>
            </article>
          </div>
          </EditorialRowsReveal>
        </section>

        <EngagementSection locale="sv" />

        <section data-parallax-image-only className="relative left-1/2 z-[1] w-screen max-w-[100vw] -translate-x-1/2 bg-white">
          <EditorialImageTransition
            src="/superoffice.png"
            alt="Individuell coaching hos CVB Coaching"
            breakout={false}
          />
        </section>

        <section data-parallax-section className="py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Göteborg, eller digitalt när det passar bättre
            </h2>
            <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
              <p>CVB Coaching finns i Göteborg. Samtalen hålls på plats eller digitalt.</p>
              <p>Vad som sägs i samtalet stannar i samtalet.</p>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-image-only>
          <EditorialImageTransition
            src="/supermeeting.png"
            alt="Business coaching i konfidentiellt samtal"
            className="mt-20 md:mt-24"
          />
        </section>

        <section data-parallax-section id="kontakt" className="py-20 md:py-24">
          <ScrollReveal variant="ctaStack">
            <h2 data-cta-heading className="max-w-4xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.65rem]">
              Nästa steg
            </h2>
            <p data-cta-body className="mt-8 max-w-3xl text-[1.125rem] font-[450] leading-[1.7] text-zinc-800">
              Skriv några rader om vad det gäller, och välj en tid. Samtalet är konfidentiellt.
            </p>
            <div data-cta-actions className="mt-12 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">{t.cta.primary}</CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
      </div>
      </ParallaxController>
    </main>
  );
}

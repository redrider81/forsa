import CtaLink from "@/components/cta-link";
import Image from "next/image";
import SiteNavigation from "@/components/site-navigation";
import HeroReveal from "@/components/animations/HeroReveal";
import HeroImageReveal from "@/components/animations/HeroImageReveal";
import ParallaxController from "@/components/animations/ParallaxController";
import ScrollReveal from "@/components/animations/ScrollReveal";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import EditorialImageTransition from "@/components/animations/EditorialImageTransition";
import StaggerCards from "@/components/animations/StaggerCards";
import Link from "next/link";

const relevancePoints = [
  "Ni står inför ett strategiskt vägval.",
  "Prioriteringar är oklara eller skiftar för ofta.",
  "Friktion i ledningsgruppen bromsar viktiga beslut.",
  "Bolaget är i tillväxt, omställning eller ny fas.",
  "Trycket från ägare eller styrelse ökar.",
  "Beslut fattas i rummet men tappar kraft i verkligheten.",
];

const engagementScale = [
  {
    index: "01",
    title: "En ledare",
    body: "Individuell executive coaching för en vd, grundare eller senior ledare med ett eget utvecklingsmål. Sex till åtta samtal över ett halvår.",
  },
  {
    index: "02",
    title: "En ledningsgrupp",
    body: "Flera ledare i samma organisation, med separata coachingrelationer och ett gemensamt mål för ansvar och beslut.",
  },
  {
    index: "03",
    title: "En hel organisation",
    body: "Ledarskapsprogram över flera affärsområden, med milstolpar, uppföljning och överenskommen rapportering till uppdragsgivaren.",
  },
];

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <ParallaxController>
      {/* Hero — sticky on desktop; first section scrolls over */}
      <section
        data-hero-sticky
        className="relative z-0 min-h-[100svh] w-full overflow-hidden md:sticky md:top-0 md:aspect-[16/9] md:max-h-[92svh] md:min-h-0"
      >
        <HeroImageReveal className="absolute inset-0 overflow-hidden">
          <Image
            src="/superhero1.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            data-hero-image
            quality={90}
            priority
            aria-hidden="true"
          />
        </HeroImageReveal>
        <SiteNavigation />
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="pointer-events-auto flex min-h-full flex-col items-center px-6 pb-[clamp(2.5rem,8svh,4.5rem)] md:absolute md:left-[5.5vw] md:top-[66%] md:min-h-0 md:max-w-md md:-translate-y-1/2 md:items-start md:justify-start md:px-0 md:pb-0 md:pt-0 lg:max-w-lg">
            <div
              className="w-full shrink-0 min-h-[min(50svh,28rem)] md:hidden"
              aria-hidden="true"
            />
            <HeroReveal className="relative flex w-full max-w-[20rem] shrink-0 flex-col items-center text-center sm:max-w-[21rem] md:max-w-md md:items-start md:text-left lg:max-w-lg">
              <div className="relative w-full md:max-w-md lg:max-w-lg">
                <h1
                  data-hero-headline
                  className="relative mx-auto inline-block max-w-[18ch] rounded-2xl bg-black/18 px-4 py-3 text-[2rem] font-medium leading-[1.12] tracking-tight text-balance text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-[8px] drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-4xl md:mx-0 md:max-w-none md:px-5 md:py-4 md:text-5xl md:leading-tight"
                >
                  När ledningen behöver tänka med skärpa.
                </h1>
              </div>
              <div className="mt-9 flex w-full flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center md:mt-10 md:w-fit md:items-start md:justify-start md:gap-3.5">
                <span data-hero-cta className="inline-flex justify-center">
                  <CtaLink href="/kontakt" variant="primary" translucent>
                    Boka ett första samtal
                  </CtaLink>
                </span>
                <span data-hero-cta className="inline-flex justify-center">
                  <CtaLink href="/executive-coaching" variant="secondary" translucent>
                    Se executive coaching
                  </CtaLink>
                </span>
              </div>
            </HeroReveal>
          </div>
        </div>
      </section>

      <div className="relative z-10 isolate bg-zinc-100">
      <div className="mx-auto max-w-6xl px-6 pb-24 md:px-10">

        {/* Two-col: Kompetens — slides over hero */}
        <section
          data-hero-reveal-first
          className="relative bg-gradient-to-b from-[#f8f7f4] via-zinc-100 to-[#f3f2ee] py-20 md:py-24"
        >
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16 md:gap-y-10">
            <h2
              data-col-left
              className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:pr-4 md:text-[2.1rem]"
            >
              Kompetens finns ofta redan. Klarheten gör inte alltid det.
            </h2>
            <div
              data-col-right
              className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end"
            >
              <p data-col-paragraph>
                Ledningsgrupper har sällan brist på erfarenhet. Det som oftare saknas är gemensam
                skärpa i vad som är viktigast nu.
              </p>
              <p data-col-paragraph>
                När trycket ökar blir friktionen tydlig. Prioriteringar glider. Beslut tas, men får
                inte fullt fäste i genomförandet.
              </p>
              <p data-col-paragraph>
                CVB Coaching arbetar där det blir avgörande att tänka klart tillsammans.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Editorial: Vad CVB Coaching hjälper med */}
        <section
          data-parallax-section
          className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white pt-20 pb-0 md:pt-24"
        >
          <EditorialRowsReveal className="mx-auto max-w-6xl px-6 md:px-10">
          <h2
            data-section-heading
            className="max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]"
          >
            Vad CVB Coaching hjälper med
          </h2>
          <div className="mt-16 border-y border-zinc-200/80">
            <article
              data-editorial-row
              className="border-b border-zinc-200/80 py-12 md:py-14"
            >
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p
                  data-row-index
                  className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400"
                >
                  01
                </p>
                <h3
                  data-row-title
                  className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]"
                >
                  Klarhet
                </h3>
                <p
                  data-row-body
                  className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                >
                  Kärnfrågan ringas in snabbt, och bruset hålls utanför. Fokus hamnar där det gör
                  verklig skillnad.
                </p>
              </div>
            </article>
            <article
              data-editorial-row
              className="border-b border-zinc-200/80 py-12 md:py-14"
            >
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p
                  data-row-index
                  className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400"
                >
                  02
                </p>
                <h3
                  data-row-title
                  className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]"
                >
                  Beslut
                </h3>
                <p
                  data-row-body
                  className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                >
                  Underlag, avvägningar och ansvar görs tydliga. Det ger beslut som håller även efter
                  mötet.
                </p>
              </div>
            </article>
            <article data-editorial-row className="py-12 md:py-14">
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p
                  data-row-index
                  className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400"
                >
                  03
                </p>
                <h3
                  data-row-title
                  className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]"
                >
                  Riktning
                </h3>
                <p
                  data-row-body
                  className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                >
                  Ledningen håller kurs i komplexa lägen, utan att tappa tempo eller kvalitet i
                  genomförandet.
                </p>
              </div>
            </article>
          </div>
          </EditorialRowsReveal>
          <EditorialImageTransition
            src="/supertable.png"
            alt="Professionellt mötesrum med anteckningar, laptop och ledare vid konferensbordet"
            className="mt-20 md:mt-24"
          />
        </section>

        {/* Two-col: När CVB Coaching är relevant */}
        <section data-parallax-section className="relative z-10 bg-zinc-100 py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              När CVB Coaching är relevant
            </h2>
            <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
              <h3 className="text-[1.65rem] font-medium leading-tight tracking-tight text-zinc-900">
                När mycket står på spel
              </h3>
              <ScrollReveal variant="staggerList" className="mt-8">
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

        {/* Cards: Tjänster */}
        <section
          data-parallax-section
          className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white py-20 md:py-24"
        >
          <div className="mx-auto max-w-6xl px-6 md:px-10">
          <h2 className="max-w-3xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
            Coaching för ledare, team och organisationer
          </h2>
          <StaggerCards className="mt-14 grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            <Link data-card href="/executive-coaching" className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_20px_50px_-28px_rgba(24,24,27,0.30)] motion-reduce:transition-none cursor-pointer md:p-9">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.4em] text-zinc-500">01</span>
                <span data-card-accent aria-hidden="true" className="block h-px w-12 origin-left">
                  <span className="block h-px w-full origin-left bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-x-[1.85] motion-reduce:transition-none" />
                </span>
              </div>
              <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">Executive coaching</h3>
              <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                För vd:ar, grundare och seniora ledare i komplexa beslut, ansvar och rollklarhet.
              </p>
              <div className="mt-8 border-t border-zinc-200 pt-5 transition-colors duration-300 group-hover:border-zinc-300">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                  <span className="relative">
                    Läs mer
                    <span aria-hidden="true" className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-zinc-900 transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                  </span>
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>
            <Link data-card href="/ledningsgruppscoaching" className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_20px_50px_-28px_rgba(24,24,27,0.30)] motion-reduce:transition-none cursor-pointer md:p-9">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.4em] text-zinc-500">02</span>
                <span data-card-accent aria-hidden="true" className="block h-px w-12 origin-left">
                  <span className="block h-px w-full origin-left bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-x-[1.85] motion-reduce:transition-none" />
                </span>
              </div>
              <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">Ledningsgruppscoaching</h3>
              <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                För ledningsgrupper som behöver tydligare beslut, ansvar och gemensam riktning.
              </p>
              <div className="mt-8 border-t border-zinc-200 pt-5 transition-colors duration-300 group-hover:border-zinc-300">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                  <span className="relative">
                    Läs mer
                    <span aria-hidden="true" className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-zinc-900 transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                  </span>
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>
            <Link data-card href="/individuell-coaching" className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_20px_50px_-28px_rgba(24,24,27,0.30)] motion-reduce:transition-none cursor-pointer md:p-9">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.4em] text-zinc-500">03</span>
                <span data-card-accent aria-hidden="true" className="block h-px w-12 origin-left">
                  <span className="block h-px w-full origin-left bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-x-[1.85] motion-reduce:transition-none" />
                </span>
              </div>
              <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">Individuell coaching</h3>
              <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                För ledare och nyckelpersoner som behöver klarhet i roll, prioritering och påverkan.
              </p>
              <div className="mt-8 border-t border-zinc-200 pt-5 transition-colors duration-300 group-hover:border-zinc-300">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                  <span className="relative">
                    Läs mer
                    <span aria-hidden="true" className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-zinc-900 transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                  </span>
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>
            <Link data-card href="/team-coaching" className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_20px_50px_-28px_rgba(24,24,27,0.30)] motion-reduce:transition-none cursor-pointer md:p-9">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.4em] text-zinc-500">04</span>
                <span data-card-accent aria-hidden="true" className="block h-px w-12 origin-left">
                  <span className="block h-px w-full origin-left bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-x-[1.85] motion-reduce:transition-none" />
                </span>
              </div>
              <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">Team coaching</h3>
              <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                För team som behöver stärka samspel, ansvar och gemensamt lärande i arbetet.
              </p>
              <div className="mt-8 border-t border-zinc-200 pt-5 transition-colors duration-300 group-hover:border-zinc-300">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                  <span className="relative">
                    Läs mer
                    <span aria-hidden="true" className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-zinc-900 transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                  </span>
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>
            <Link data-card href="/coachande-ledarskap" className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_20px_50px_-28px_rgba(24,24,27,0.30)] motion-reduce:transition-none cursor-pointer md:col-span-2 md:p-9 lg:col-span-1">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.4em] text-zinc-500">05</span>
                <span data-card-accent aria-hidden="true" className="block h-px w-12 origin-left">
                  <span className="block h-px w-full origin-left bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-x-[1.85] motion-reduce:transition-none" />
                </span>
              </div>
              <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">Coachande ledarskap</h3>
              <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                För organisationer som vill utveckla chefers förmåga att leda genom samtal, frågor och ansvar.
              </p>
              <div className="mt-8 border-t border-zinc-200 pt-5 transition-colors duration-300 group-hover:border-zinc-300">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                  <span className="relative">
                    Läs mer
                    <span aria-hidden="true" className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-zinc-900 transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                  </span>
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </Link>
          </StaggerCards>
          </div>
        </section>

        {/* Skala: individ → organisation */}
        <section data-parallax-section className="py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Från en ledare till ett helt program
            </h2>
            <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
              <ScrollReveal variant="staggerList">
                <ul className="divide-y divide-zinc-200/80 border-y border-zinc-200/80">
                  {engagementScale.map((item) => (
                    <li key={item.title} data-list-item className="py-7">
                      <p className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400">
                        {item.index}
                      </p>
                      <h3 className="mt-3 text-xl font-medium leading-tight tracking-tight text-zinc-900">
                        {item.title}
                      </h3>
                      <p className="mt-2.5 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
              <p className="mt-8 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800">
                Metod, struktur och uppföljning är densamma. Det som skiljer är omfattningen.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section
          data-parallax-image-only
          className="relative left-1/2 z-[1] w-screen max-w-[100vw] -translate-x-1/2 bg-white"
        >
          <EditorialImageTransition
            src="/superoffice.png"
            alt="Professionellt kontor med arbetsyta, laptop och fokuserat arbete"
            breakout={false}
          />
        </section>

        {/* Two-col: Så arbetar CVB Coaching */}
        <section data-parallax-section className="py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Så arbetar CVB Coaching
            </h2>
            <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
              <h3 className="text-[1.65rem] font-medium leading-tight tracking-tight text-zinc-900">
                Konfidentiellt. Affärsnära. Precist.
              </h3>
              <p>
                Arbetet sker i strukturerade samtal med tydlig koppling till ert faktiska läge. Vi
                börjar i det som är svårt på riktigt: var det skaver, vad som står still och vad som
                måste avgöras.
              </p>
              <p>
                Därifrån skärps prioritering, ansvar och beslut, med uppföljning tills riktningen syns
                i handling.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Two-col: Förtroende */}
        <section data-parallax-section className="py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Förtroende
            </h2>
            <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
              <h3 className="text-[1.65rem] font-medium leading-tight tracking-tight text-zinc-900">
                Göteborgsbaserat stöd för svenska företagsledningar
              </h3>
              <p>
                CVB Coaching är baserat i Göteborg och arbetar med svenska företagsledningar. Uppdragen
                präglas av diskretion, senioritet och affärsförståelse.
              </p>
              <p>
                Vi arbetar nära ledningen i frågor som påverkar bolagets riktning, tempo och resultat.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-image-only>
          <EditorialImageTransition
            src="/supermeeting.png"
            alt="Ledningsgrupp i samtal runt konferensbord i modernt mötesrum"
            className="mt-20 md:mt-24"
          />
        </section>

        {/* CTA */}
        <section data-parallax-section id="kontakt" className="py-20 md:py-24">
          <ScrollReveal variant="ctaStack">
            <h2 data-cta-heading className="max-w-4xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.65rem]">
              När nästa beslut behöver bära längre än till nästa möte
            </h2>
            <p data-cta-body className="mt-8 max-w-3xl text-[1.125rem] font-[450] leading-[1.7] text-zinc-800">
              Om ni vill ha större skärpa i ledningens prioriteringar, ansvar och beslut, börjar vi med
              ett konfidentiellt första samtal.
            </p>
            <div data-cta-actions className="mt-12 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">Boka ett första samtal</CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
      </div>
      </ParallaxController>
    </main>
  );
}

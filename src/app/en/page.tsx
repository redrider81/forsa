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
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forsa | Executive coaching and leadership support",
  description:
    "Forsa supports CEOs, founders, and leadership teams when decisions, accountability, and direction need sharper focus.",
};

const relevancePoints = [
  "You are facing a strategic turning point.",
  "Priorities are unclear or shift too often.",
  "Friction in the leadership team is slowing key decisions.",
  "The company is in growth, transition, or a new phase.",
  "Pressure from owners or the board is increasing.",
  "Decisions are made in meetings but lose momentum in execution.",
];

export default function HomePageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <ParallaxController>
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
                    When leadership needs sharper thinking.
                  </h1>
                </div>
                <div className="mt-9 flex w-full flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center md:mt-10 md:w-fit md:items-start md:justify-start md:gap-3.5">
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/en/kontakt" variant="primary" translucent>
                      Book an initial conversation
                    </CtaLink>
                  </span>
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/en/executive-coaching" variant="secondary" translucent>
                      Explore executive coaching
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
                  Capability is often already there. Clarity is not always.
                </h2>
                <div
                  data-col-right
                  className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end"
                >
                  <p data-col-paragraph>
                    Leadership teams rarely lack experience. What is often missing is shared sharpness
                    on what matters most right now.
                  </p>
                  <p data-col-paragraph>
                    As pressure rises, friction becomes visible. Priorities drift. Decisions get made
                    but do not fully translate into execution.
                  </p>
                  <p data-col-paragraph>Forsa works where it is critical to think clearly together.</p>
                </div>
              </ScrollReveal>
            </section>

            <section
              data-parallax-section
              className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white pt-20 pb-0 md:pt-24"
            >
              <EditorialRowsReveal className="mx-auto max-w-6xl px-6 md:px-10">
                <h2
                  data-section-heading
                  className="max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]"
                >
                  What Forsa helps with
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
                        Clarity
                      </h3>
                      <p
                        data-row-body
                        className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                      >
                        The core question is identified quickly, and noise is kept outside. Focus
                        stays where it makes a real difference.
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
                        Decisions
                      </h3>
                      <p
                        data-row-body
                        className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                      >
                        Input, trade-offs, and ownership become explicit. That creates decisions that
                        hold beyond the meeting.
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
                        Direction
                      </h3>
                      <p
                        data-row-body
                        className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                      >
                        Leadership stays on course in complex situations without losing pace or quality
                        in execution.
                      </p>
                    </div>
                  </article>
                </div>
              </EditorialRowsReveal>
              <EditorialImageTransition
                src="/supertable.png"
                alt="Professional meeting room with notes, laptop, and leaders at a conference table"
                className="mt-20 md:mt-24"
                unoptimized
              />
            </section>

            <section data-parallax-section className="relative z-10 bg-zinc-100 py-20 md:py-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  When Forsa is relevant
                </h2>
                <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
                  <h3 className="text-[1.65rem] font-medium leading-tight tracking-tight text-zinc-900">
                    When the stakes are high
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

            <section
              data-parallax-section
              className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white py-20 md:py-24"
            >
              <div className="mx-auto max-w-6xl px-6 md:px-10">
                <h2 className="max-w-3xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Coaching for leaders, teams, and organizations
                </h2>
                <StaggerCards className="mt-14 grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                  <Link data-card href="/en/executive-coaching" className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_20px_50px_-28px_rgba(24,24,27,0.30)] motion-reduce:transition-none cursor-pointer md:p-9">
                    <div className="flex items-center gap-4">
                      <span aria-hidden="true" className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.4em] text-zinc-500">01</span>
                      <span data-card-accent aria-hidden="true" className="block h-px w-12 origin-left">
                        <span className="block h-px w-full origin-left bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-x-[1.85] motion-reduce:transition-none" />
                      </span>
                    </div>
                    <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">Executive coaching</h3>
                    <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                      For CEOs, founders, and senior leaders facing complex decisions, accountability,
                      and role clarity.
                    </p>
                    <div className="mt-8 border-t border-zinc-200 pt-5 transition-colors duration-300 group-hover:border-zinc-300">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                        <span className="relative">
                          Learn more
                          <span aria-hidden="true" className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-zinc-900 transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                        </span>
                        <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </Link>
                  <Link data-card href="/en/ledningsgruppscoaching" className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_20px_50px_-28px_rgba(24,24,27,0.30)] motion-reduce:transition-none cursor-pointer md:p-9">
                    <div className="flex items-center gap-4">
                      <span aria-hidden="true" className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.4em] text-zinc-500">02</span>
                      <span data-card-accent aria-hidden="true" className="block h-px w-12 origin-left">
                        <span className="block h-px w-full origin-left bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-x-[1.85] motion-reduce:transition-none" />
                      </span>
                    </div>
                    <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">Leadership Team Coaching</h3>
                    <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                      For leadership teams that need clearer decisions, stronger accountability, and
                      shared direction.
                    </p>
                    <div className="mt-8 border-t border-zinc-200 pt-5 transition-colors duration-300 group-hover:border-zinc-300">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                        <span className="relative">
                          Learn more
                          <span aria-hidden="true" className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-zinc-900 transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                        </span>
                        <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </Link>
                  <Link data-card href="/en/individuell-coaching" className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_20px_50px_-28px_rgba(24,24,27,0.30)] motion-reduce:transition-none cursor-pointer md:p-9">
                    <div className="flex items-center gap-4">
                      <span aria-hidden="true" className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.4em] text-zinc-500">03</span>
                      <span data-card-accent aria-hidden="true" className="block h-px w-12 origin-left">
                        <span className="block h-px w-full origin-left bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-x-[1.85] motion-reduce:transition-none" />
                      </span>
                    </div>
                    <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">Individual Coaching</h3>
                    <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                      For leaders and key professionals who need sharper role clarity, prioritization,
                      and impact.
                    </p>
                    <div className="mt-8 border-t border-zinc-200 pt-5 transition-colors duration-300 group-hover:border-zinc-300">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                        <span className="relative">
                          Learn more
                          <span aria-hidden="true" className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-zinc-900 transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                        </span>
                        <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </Link>
                  <Link data-card href="/en/team-coaching" className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_20px_50px_-28px_rgba(24,24,27,0.30)] motion-reduce:transition-none cursor-pointer md:p-9">
                    <div className="flex items-center gap-4">
                      <span aria-hidden="true" className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.4em] text-zinc-500">04</span>
                      <span data-card-accent aria-hidden="true" className="block h-px w-12 origin-left">
                        <span className="block h-px w-full origin-left bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-x-[1.85] motion-reduce:transition-none" />
                      </span>
                    </div>
                    <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">Team Coaching</h3>
                    <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                      For teams that need to strengthen collaboration, accountability, and shared
                      learning in daily work.
                    </p>
                    <div className="mt-8 border-t border-zinc-200 pt-5 transition-colors duration-300 group-hover:border-zinc-300">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                        <span className="relative">
                          Learn more
                          <span aria-hidden="true" className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-zinc-900 transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
                        </span>
                        <svg className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                          <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </Link>
                  <Link data-card href="/en/coachande-ledarskap" className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_20px_50px_-28px_rgba(24,24,27,0.30)] motion-reduce:transition-none cursor-pointer md:col-span-2 md:p-9 lg:col-span-1">
                    <div className="flex items-center gap-4">
                      <span aria-hidden="true" className="text-[0.6875rem] font-semibold tabular-nums tracking-[0.4em] text-zinc-500">05</span>
                      <span data-card-accent aria-hidden="true" className="block h-px w-12 origin-left">
                        <span className="block h-px w-full origin-left bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-x-[1.85] motion-reduce:transition-none" />
                      </span>
                    </div>
                    <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">Coaching Leadership</h3>
                    <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                      For organizations developing managers who lead through dialogue, questions, and
                      clear accountability.
                    </p>
                    <div className="mt-8 border-t border-zinc-200 pt-5 transition-colors duration-300 group-hover:border-zinc-300">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
                        <span className="relative">
                          Learn more
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

            <section
              data-parallax-image-only
              className="relative left-1/2 z-[1] w-screen max-w-[100vw] -translate-x-1/2 bg-white"
            >
              <EditorialImageTransition
                src="/superoffice.png"
                alt="Professional office workspace with laptop and focused work"
                breakout={false}
                unoptimized
              />
            </section>

            <section data-parallax-section className="py-20 md:py-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  How Forsa works
                </h2>
                <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
                  <h3 className="text-[1.65rem] font-medium leading-tight tracking-tight text-zinc-900">
                    Confidential. Business-near. Precise.
                  </h3>
                  <p>
                    The work happens through structured conversations closely linked to your real
                    situation. We start where it is genuinely difficult: where friction appears, what
                    has stalled, and what needs to be decided.
                  </p>
                  <p>
                    From there, priorities, ownership, and decisions become sharper, with follow-up
                    until direction is visible in action.
                  </p>
                </div>
              </ScrollReveal>
            </section>

            <section data-parallax-section className="py-20 md:py-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Trust
                </h2>
                <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
                  <h3 className="text-[1.65rem] font-medium leading-tight tracking-tight text-zinc-900">
                    Gothenburg-based support for Swedish leadership teams
                  </h3>
                  <p>
                    Forsa is based in Gothenburg and works with Swedish leadership teams. Engagements
                    are defined by discretion, seniority, and business understanding.
                  </p>
                  <p>
                    We work close to leadership on issues that shape company direction, pace, and
                    results.
                  </p>
                </div>
              </ScrollReveal>
            </section>

            <section data-parallax-image-only>
              <EditorialImageTransition
                src="/supermeeting.png"
                alt="Leadership team in discussion around a conference table in a modern meeting room"
                className="mt-20 md:mt-24"
                unoptimized
              />
            </section>

            <section data-parallax-section id="kontakt" className="py-20 md:py-24">
              <ScrollReveal variant="ctaStack">
                <h2 data-cta-heading className="max-w-4xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.65rem]">
                  When the next decision needs to last beyond the next meeting
                </h2>
                <p data-cta-body className="mt-8 max-w-3xl text-[1.125rem] font-[450] leading-[1.7] text-zinc-800">
                  If you want sharper priorities, ownership, and decisions in your leadership team, we
                  start with a confidential first conversation.
                </p>
                <div data-cta-actions className="mt-12 flex flex-wrap gap-4">
                  <CtaLink href="/en/kontakt" variant="primary">
                    Book an initial conversation
                  </CtaLink>
                </div>
              </ScrollReveal>
            </section>
          </div>
        </div>
      </ParallaxController>
    </main>
  );
}

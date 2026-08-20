import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "About CVB Coaching – Carolina von Braun | CVB Coaching",
  description:
    "CVB Coaching was founded by Carolina von Braun in Gothenburg. Commercial background from capital markets and board work, qualified coach.",
};

const principles = [
  "Confidentiality in all work.",
  "Business-near perspective in every session.",
  "Precision before generic advice.",
  "Follow-up until decisions are visible in action.",
];

const audiences = [
  "CEOs and founders under high decision pressure.",
  "Executive teams in growth, transition or a new ownership phase.",
  "Senior leaders accountable for direction and execution.",
  "Organisations developing several managers within one programme.",
];

export default function AboutPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <JsonLd data={carolinaPersonSchema} />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              About CVB Coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              An external decision forum for Swedish executive teams.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              CVB Coaching works with CEOs, founders and executive teams when decisions,
              accountability and direction need sharper focus.
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Why CVB Coaching exists
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                In many leadership environments, the capability is there, but the explicit decision
                forum is not. CVB Coaching exists to provide it in concrete business situations.
              </p>
              <p>
                The goal is not more words about leadership, but better decisions and clearer
                execution in real business situations.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <div data-col-left className="md:col-span-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#92753a]">Founder</p>
              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight">
                Carolina von Braun
              </h2>
              <p className="mt-3 text-lg leading-8 text-zinc-600">Founder and coach</p>
            </div>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Carolina von Braun founded CVB Coaching in Gothenburg. She works with CEOs,
                founders and executive teams when decisions, accountability and direction need to
                become clearer.
              </p>
              <p>
                Her background is commercial. It includes securities trading at Nordea and four board
                assignments in property management and investment. It is also the starting point in
                sessions: decisions are tested in business terms.
              </p>
              <p>
                She studied marketing at the School of Business, Economics and Law, University of
                Gothenburg, from 1996 to 2002. In 2025 she completed coaching diplomas at Gothia
                Akademi, levels 1 and 2, and serves as a teaching assistant on the academy&apos;s
                leadership programmes.
              </p>
              <p>
                The approach is coaching: the client owns their objectives, their insights and their
                decisions. The coach&apos;s task is to make thinking clearer, not to deliver answers.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Principles
            </h2>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-2">
              {principles.map((item, index) => (
                <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                  {item}
                </div>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Confidentiality
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>What is said in the session stays in the session.</p>
              <p>
                When the engagement is commissioned by someone other than the participant, exactly
                what is reported back is agreed in writing in advance: normally objective fulfilment
                and attendance, never session content.
              </p>
              <p>
                Notes are stored separately from the sponsor&apos;s systems and deleted no later than
                twelve months after the engagement closes. Personal data is processed in accordance
                with the General Data Protection Regulation.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Who CVB Coaching is right for</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {audiences.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Gothenburg, with engagements across Sweden
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                CVB Coaching is based in Gothenburg and works with Swedish executive teams.
                Sessions take place on site or digitally.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Next step
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Briefly describe the leadership situation that is current.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/en/kontakt" variant="primary">
                Book an initial conversation
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}

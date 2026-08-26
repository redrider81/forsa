import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Carolina von Braun – coach in Gothenburg | CVB Coaching",
  description:
    "Carolina von Braun runs CVB Coaching in Gothenburg. A commercial background from capital markets and board work, and a coaching qualification from Gothia Akademi.",
};

const principles = [
  "Confidentiality, without exception.",
  "Questions before advice. The conclusions stay yours.",
  "Precision rather than encouragement.",
  "Follow-up until something has actually happened.",
];

const audiences = [
  "Private clients facing a choice, a change or a decision that carries weight.",
  "Leaders and employees who need to think clearly with someone outside the organisation.",
  "Teams and executive teams where accountability, priorities and decisions need sharpening.",
  "Organisations developing several managers together.",
];

export default function AboutPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <JsonLd data={carolinaPersonSchema} />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              About Carolina
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Who you choose to think out loud with matters.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Here is what you need to know to decide whether I am the right coach for you.
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
                Most of us have people around us who mean well. Fewer have someone whose only job is
                to help us finish the thinking, without holding a view on how it ends.
              </p>
              <p>
                CVB Coaching exists to make that available — to people who come on their own, and to
                people who come through their work.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <div data-col-left className="md:col-span-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#92753a]">Coach</p>
              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight">
                Carolina von Braun
              </h2>
              <p className="mt-3 text-lg leading-8 text-zinc-600">CVB Coaching, Gothenburg</p>
            </div>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                I am a qualified coach and I run CVB Coaching in Gothenburg. I work with private
                clients facing something that has to be settled, and with leaders, teams and
                executive teams through their employers.
              </p>
              <p>
                Before that I worked in capital markets, in securities trading at Nordea, and held
                four board assignments in property management and investment. That left me used to
                rooms where the consequences are real and the decision cannot be deferred — and it
                shows in the sessions, whoever is sitting across from me.
              </p>
              <p>
                I studied marketing at the School of Business, Economics and Law, University of
                Gothenburg, from 1996 to 2002. In 2025 I completed coaching diplomas at Gothia
                Akademi, levels 1 and 2, and I teach as an assistant on the academy&apos;s leadership
                programmes.
              </p>
              <p>
                Coaching is a role with clear edges: you own your objectives, your insights and your
                decisions. My job is to make the thinking clearer, not to supply the answer.
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
              <p>What is said in the session is treated in confidence.</p>
              <p>
                When the sessions are commissioned by someone other than the participant, we agree
                what is shared back before the work begins.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Who I work with</h2>
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
              Gothenburg, or online where that suits better
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                CVB Coaching is based in Gothenburg. Sessions take place in person or online.
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
              Write a few lines about what you would like to bring, and pick a time that suits you.
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

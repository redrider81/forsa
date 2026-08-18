import type { Metadata } from "next";
import ContactIntakeForm from "@/components/contact-intake-form";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Contact | CVB Coaching",
  description:
    "Start with the right conversation. CVB Coaching works with CEOs, founders, and leadership teams when decisions, accountability, and direction need stronger clarity.",
};

const relevantWhen = [
  "The matter concerns leadership, accountability, or direction.",
  "The decision affects the organization's next step.",
  "There is a need for confidential external support.",
  "You want to move from discussion to clearer prioritization.",
];

const lessRelevant = [
  "General inspiration without a concrete leadership question.",
  "Short motivational efforts without follow-up.",
  "Situations where direction and decisions are already settled.",
];

export default function ContactPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f6f6f4] text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300/80 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-zinc-400" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Contact
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Start with the right conversation.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              CVB Coaching works with CEOs, founders, and leadership teams when decisions, accountability, and
              direction need stronger clarity. To make the first conversation truly relevant, briefly
              describe your situation and what needs to become clearer.
            </p>
          </HeroReveal>
        </section>

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <div className="grid gap-16 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
                <p className="mb-10 max-w-xl text-[0.9375rem] leading-[1.7] text-zinc-600">
                  Briefly outline your situation. The clearer the context, the more valuable the first
                  conversation can be.
                </p>
                <ContactIntakeForm />
              </div>

              <aside className="border-t border-zinc-300/35 pt-12 lg:col-span-5 lg:border-t-0 lg:border-l lg:border-zinc-300/25 lg:pl-14 lg:pt-2">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Advisory framework
                </p>
                <h2 className="mt-4 text-2xl font-medium leading-tight tracking-tight md:text-[1.75rem]">
                  Relevant when
                </h2>

                <ul className="mt-10 divide-y divide-zinc-300/40 border-y border-zinc-300/35">
                  {relevantWhen.map((item) => (
                    <li
                      key={item}
                      className="py-5 text-[1.0625rem] leading-[1.65] text-zinc-800 first:pt-5 last:pb-5"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-12 border-t border-zinc-300/30 pt-10">
                  <h3 className="text-sm font-normal tracking-wide text-zinc-500/90">
                    Less relevant when
                  </h3>
                  <ul className="mt-5 space-y-3 text-sm leading-[1.65] text-zinc-500/85">
                    {lessRelevant.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}

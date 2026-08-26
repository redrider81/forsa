import type { Metadata } from "next";
import ContactIntakeForm from "@/components/contact-intake-form";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Book an initial conversation | CVB Coaching",
  description:
    "Pick a time and write a few lines about what you would like to bring. The conversation is confidential, whether you come on your own or through your employer.",
};

const relevantWhen = [
  "The question genuinely matters to you, not just on paper.",
  "You want to finish the thinking yourself, not be handed an answer.",
  "It needs to happen outside your own circle, in confidence.",
  "Something is meant to change, not only be discussed.",
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
              Start with a conversation.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Pick a time that suits you and write a few lines about what you would like to bring.
              We use the first conversation to work out whether the question belongs here and
              whether we are a good fit.
            </p>
          </HeroReveal>
        </section>

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <div className="space-y-16 md:space-y-20">
              <div className="max-w-5xl">
                <ContactIntakeForm />
              </div>

              <aside className="max-w-2xl border-t border-zinc-300/35 pt-12 md:pt-16">
                <h2 className="text-2xl font-medium leading-tight tracking-tight md:text-[1.75rem]">
                  How to tell whether this is right
                </h2>

                <h3 className="mt-10 text-lg font-medium text-zinc-900">Right fit when</h3>
                <ul className="mt-4 divide-y divide-zinc-300/40 border-y border-zinc-300/35">
                  {relevantWhen.map((item) => (
                    <li key={item} className="py-5 text-[1.0625rem] leading-[1.65] text-zinc-800">
                      {item}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import ContactIntakeForm from "@/components/contact-intake-form";
import ContactPageScrollReset from "@/components/contact-page-scroll-reset";
import ProcessFaq, { type ProcessFaqItem } from "@/components/process-faq";
import HeroReveal from "@/components/animations/HeroReveal";

export const metadata: Metadata = {
  title: "Book an initial conversation | CVB Coaching",
  description:
    "Book a short, free phone call to work out whether coaching is the right support. The conversation is confidential, whether you come on your own or through your employer.",
};

const processFaq: ProcessFaqItem[] = [
  {
    question: "What is the first conversation?",
    answer:
      "The first conversation is a short, complimentary phone call. You tell me a little about what you are looking for, and we get a sense of whether coaching is the right path and whether it feels right to work together. It is not a coaching session, and you are not committing to anything.",
  },
  {
    question: "What happens if we want to go ahead?",
    answer:
      "If we both want to continue, we talk through what you would like to work on and what our coaching collaboration could look like. We agree on the scope, practical setup and price before we begin.",
  },
  {
    question: "How does the coaching collaboration start?",
    answer:
      "Once we have agreed on how we want to work together, you receive a personal confirmation from me and we plan our first coaching conversation. You will also get access to CVB Base, where we keep together what belongs to our work together.",
  },
  {
    question: "What is CVB Base?",
    answer:
      "CVB Base is part of how I work with my clients. There you can collect reflections, prepare what you want to bring to the next conversation and return to things we have worked on before. This helps keep the context connected between our conversations.",
  },
  {
    question: "What if a company is paying for the coaching?",
    answer:
      "You are still my client, and our conversations are about what you want to work on. Before we begin, we agree on who is paying and what, if anything, may be shared back with the purchaser.",
  },
  {
    question: "Do I have to decide after the first conversation?",
    answer:
      "No. The first conversation is there so we can both get a sense of whether this is right. We only move forward if it feels good and relevant for both of us.",
  },
];

export default function ContactPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f6f6f4] text-zinc-900">
      <ContactPageScrollReset />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300/80 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Contact
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Start with a conversation.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Pick a time that suits you and write a few lines about what you would like to bring.
              The first conversation is a short, free phone call where we work out whether coaching
              is the right support and whether we want to go ahead together.
            </p>
          </HeroReveal>
        </section>

        <section className="py-16 md:py-20">
          <div className="space-y-16 md:space-y-20">
            <div className="max-w-5xl">
              <ContactIntakeForm />
            </div>

            <aside className="max-w-2xl border-t border-line-accent/30 pt-12 md:pt-16">
              <ProcessFaq heading="What happens after you book?" items={processFaq} />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

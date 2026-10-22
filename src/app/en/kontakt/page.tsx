import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import ContactIntakeForm from "@/components/contact-intake-form";
import ContactPageScrollReset from "@/components/contact-page-scroll-reset";
import ProcessFaq, { type ProcessFaqItem } from "@/components/process-faq";
import HeroReveal from "@/components/animations/HeroReveal";

export const metadata: Metadata = {
  alternates: pageAlternates("/kontakt", "en"),
  title: "Book a first call | CVB Coaching",
  description:
    "Book a short, free phone call to work out whether coaching is the right support. The conversation is confidential, whether you come on your own or through your employer.",
};

const processFaq: ProcessFaqItem[] = [
  {
    question: "What happens after I send a booking request?",
    answer:
      "I go through your request and call you during the time window you have chosen.",
  },
  {
    question: "What is the first call?",
    answer:
      "It is a short, free phone call where we talk about your situation, what you want to get out of coaching and whether coaching with me feels right for you.",
  },
  {
    question: "Do I have to decide after the first call?",
    answer:
      "No. The call is there so we can get a picture of what you are looking for and see whether coaching with me suits you. You are not committing to anything.",
  },
  {
    question: "What happens if we want to go ahead?",
    answer:
      "We talk about what you want to work on, agree on a format and set a shared direction for the coaching.",
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
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-[1.25] tracking-tight md:text-6xl">
              Book a free introductory call
            </h1>
            <div data-hero-body className="mt-8 max-w-3xl space-y-6 text-lg leading-8 text-zinc-700">
              <p>
                Curious about coaching and want to know whether it could be right for you or your
                organisation?
              </p>
              <p>
                Book a first, free call where we talk about your situation, your needs and what you want
                to develop. The call usually takes 15–30 minutes, and I will call you during the time
                window you choose.
              </p>
              <p>
                After the call, we decide together whether and how to move forward.
              </p>
            </div>
          </HeroReveal>
        </section>

        <section className="py-16 md:py-20">
          <div className="space-y-16 md:space-y-20">
            <div className="max-w-5xl">
              <ContactIntakeForm />
            </div>

            <aside className="max-w-2xl border-t border-line-accent/30 pt-12 md:pt-16">
              <ProcessFaq heading="Frequently asked questions" items={processFaq} />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

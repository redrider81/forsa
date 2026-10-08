"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  homeTravel,
  motion,
  prefersReducedMotion,
  refreshScrollTriggers,
  revealScrollTrigger,
  showTargets,
} from "@/lib/motion";
import type { Locale } from "@/lib/i18n/config";
import { HOME_DISPLAY_SM } from "@/lib/homepage-typography";

const copy: Record<
  Locale,
  {
    quote: string;
    quoteOpen: string;
    quoteClose: string;
    expand: string;
    collapse: string;
    story: string[];
  }
> = {
  sv: {
    quote:
      "Det som stannade kvar mest är modet jag fick med mig – modet att stanna upp, tänka efter, och göra annorlunda i praktiken",
    quoteOpen: "”",
    quoteClose: "”",
    expand: "Läs hela berättelsen",
    collapse: "Stäng berättelsen",
    story: [
      "Jag befann mig i en period där jobbet successivt tog allt mer plats, samtidigt som annat i livet krävde min uppmärksamhet. Trots att mycket gick bra insåg jag att det inte längre speglade det jag egentligen värderar högst eller ville göra – jag kände att jag inte riktigt styrde över mina egna prioriteringar eller val.",
      "Genom coachningen med Carolina fick jag utrymme att stanna upp och reflektera på riktigt. Samtalen och reflektionsövningarna hjälpte mig att se tydligare vad jag faktiskt prioriterar, och att omsätta det i konkreta val – inte några stora, dramatiska förändringar, utan små justeringar i vardagen som gjorde skillnad. Steg för steg blev det enklare att göra de professionella val som faktiskt var rätt för mig, snarare än att bara följa strömmen.",
      "Det som stannade kvar mest är modet jag fick med mig – modet att stanna upp, tänka efter, och göra annorlunda i praktiken",
    ],
  },
  en: {
    quote:
      "What has stayed with me most is the courage I took away with me – the courage to pause, to think things through, and to do things differently in practice",
    quoteOpen: "“",
    quoteClose: "”",
    expand: "Read the full story",
    collapse: "Close the story",
    story: [
      "I was in a period where work was gradually taking up more and more space, while other things in life also demanded my attention. Even though a lot was going well, I realised that it no longer reflected what I actually value most or wanted to do – I felt that I wasn't really in charge of my own priorities or choices.",
      "Through the coaching with Carolina, I was given the space to pause and truly reflect. The conversations and reflection exercises helped me see more clearly what I actually prioritise, and to turn that into concrete choices – not big, dramatic changes, but small adjustments in everyday life that made a difference. Step by step, it became easier to make the professional choices that were actually right for me, rather than simply going with the flow.",
      "What has stayed with me most is the courage I took away with me – the courage to pause, to think things through, and to do things differently in practice",
    ],
  },
};

const triggerFocusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-dark";

type Props = {
  locale?: Locale;
};

/**
 * En klients röst efter Carolinas presentation. Ligger kvar på samma mörka yta
 * som akten om Carolina — citatet är en rörelse i den akten, inte en ny akt —
 * och följer dess kolumner: citatet från vänsterkanten, hela berättelsen i
 * samma högerspalt som Carolinas text.
 */
export default function ClientTestimonial({ locale = "sv" }: Props) {
  const c = copy[locale];
  const baseId = useId().replace(/:/g, "");
  const triggerId = `${baseId}-testimonial-trigger`;
  const panelId = `${baseId}-testimonial-panel`;
  const [open, setOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const divider = section.querySelector<HTMLElement>("[data-testimonial-divider]");
    const lead = [...section.querySelectorAll<HTMLElement>("[data-testimonial-lead]")];
    const follow = [...section.querySelectorAll<HTMLElement>("[data-testimonial-follow]")];
    const quote = section.querySelector<HTMLElement>("[data-testimonial-quote]");

    const targets = [divider, ...lead, ...follow].filter(Boolean) as HTMLElement[];

    if (prefersReducedMotion()) {
      showTargets(targets);
      return;
    }

    // Samma grammatik som Carolinas akt: linjen dras ut, citatet kommer som
    // rubrik och kontrollen följer som brödtext.
    // Accordionens öppning ligger helt utanför denna entré.
    gsap.registerPlugin(ScrollTrigger);
    const travel = homeTravel();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(quote ?? section) });

      if (divider) {
        gsap.set(divider, { scaleX: 0, transformOrigin: "left center", force3D: true });
        tl.to(
          divider,
          {
            scaleX: 1,
            duration: motion.home.duration.media,
            ease: motion.ease.editorial,
            force3D: true,
          },
          0,
        );
      }

      if (lead.length) {
        gsap.set(lead, { autoAlpha: 0, y: travel.y, force3D: true });
        tl.to(
          lead,
          {
            autoAlpha: 1,
            y: 0,
            duration: motion.home.duration.heading,
            ease: motion.home.ease.heading,
            stagger: motion.home.stagger.text,
            force3D: true,
          },
          divider ? 0.15 : 0,
        );
      }

      if (follow.length) {
        gsap.set(follow, { autoAlpha: 0, y: travel.yText, force3D: true });
        tl.to(
          follow,
          {
            autoAlpha: 1,
            y: 0,
            duration: motion.home.duration.text,
            ease: motion.home.ease.text,
            stagger: 0.16,
            force3D: true,
          },
          0.55,
        );
      }

      refreshScrollTriggers();
    }, section);

    return () => {
      ctx.revert();
      showTargets(targets);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-testimonial
      data-parallax-section
      className="relative bg-surface-dark text-zinc-100"
    >
      <div className="mx-auto max-w-7xl px-6 pb-24 md:px-10 md:pb-32 lg:pb-40">
        <span
          data-testimonial-divider
          aria-hidden="true"
          className="block h-px w-full origin-left bg-zinc-500/70"
        />

        <figure className="mt-10 md:mt-14">
          <blockquote data-testimonial-quote className="max-w-4xl">
            <p data-testimonial-lead className={`${HOME_DISPLAY_SM} text-white`}>
              <span aria-hidden="true">{c.quoteOpen}</span>
              {c.quote}
              <span aria-hidden="true">{c.quoteClose}</span>
            </p>
          </blockquote>
        </figure>

        <div className="md:grid md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">
            <div data-testimonial-follow className="mt-10 md:mt-14">
              <button
                type="button"
                id={triggerId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((current) => !current)}
                className={`-mx-1 inline-flex min-h-11 items-center gap-3 px-1 py-2 text-left text-[1.0625rem] font-medium text-white md:text-lg transition-colors duration-200 hover:text-zinc-300 ${triggerFocusClass}`}
              >
                <span>{open ? c.collapse : c.expand}</span>
                <span
                  className="font-sans text-[1.25rem] font-light leading-none tabular-nums text-zinc-400 md:text-[1.375rem]"
                  aria-hidden="true"
                >
                  {open ? "−" : "+"}
                </span>
              </button>
            </div>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!open}
              inert={!open}
              className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="space-y-6 pt-6 pb-1 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300 md:pt-8">
                  {c.story.map((paragraph) => (
                    <p key={paragraph} className="max-w-xl">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  homeMediaReveal,
  homeTravel,
  motion,
  prefersReducedMotion,
  refreshScrollTriggers,
  revealScrollTrigger,
  scheduleScrollRevealRefresh,
  showTargets,
} from "@/lib/motion";

type Variant = "fadeUp" | "splitColumn" | "staggerList" | "ctaStack" | "mediaSplit";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: Variant;
  /** Startsidan: tydligare förflyttning och längre, men lugna, entréer. */
  emphasis?: boolean;
};

const childSelectors =
  "[data-list-item], [data-cta-label], [data-cta-heading], [data-cta-body], [data-cta-actions], [data-col-left], [data-col-right], [data-col-paragraph]";

/**
 * mediaSplit: varje elementbarn i [data-reveal-group] (utom nästlade grupper),
 * varje figure / [data-reveal-media] och varje [data-list-item] är en egen del. Delarna
 * avtäcks när de själva når vyn; delar som når vyn samtidigt sekvenseras i
 * dokumentordning. Samma koreografi följer därmed både spalter bredvid
 * varandra (desktop) och staplat innehåll (mobil) utan brytpunktslogik.
 */
const mediaSplitParts =
  "[data-reveal-group] > :not([data-reveal-group]), figure, [data-reveal-media], [data-list-item]";

/** Listradens linjer hör till li och står kvar; bara innehållet rör sig. */
function itemContent(item: HTMLElement): HTMLElement[] {
  const children = Array.from(item.children) as HTMLElement[];
  return children.length ? children : [item];
}

function isMediaPart(part: HTMLElement) {
  return part.tagName === "FIGURE" || part.hasAttribute("data-reveal-media");
}

function buildMediaSplit(el: HTMLElement) {
  const parts = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(mediaSplitParts));
  if (!parts.length) return;
  const travel = homeTravel();

  parts.forEach((part) => {
    if (isMediaPart(part)) {
      gsap.set(part, { clipPath: "inset(100% 0% 0% 0%)" });
    } else if (part.hasAttribute("data-list-item")) {
      gsap.set(itemContent(part), { autoAlpha: 0, x: travel.x * 0.7, y: travel.x ? 0 : travel.yText, force3D: true });
    } else {
      gsap.set(part, { autoAlpha: 0, y: travel.y, force3D: true });
    }
  });

  ScrollTrigger.batch(parts, {
    start: motion.reveal.start,
    once: true,
    interval: 0.1,
    onEnter: (batch) => {
      const ordered = (batch as HTMLElement[]).sort((a, b) => parts.indexOf(a) - parts.indexOf(b));
      const tl = gsap.timeline();
      let at = 0;
      ordered.forEach((part) => {
        if (isMediaPart(part)) {
          tl.add(homeMediaReveal(part), at);
          at += 0.22;
        } else if (part.hasAttribute("data-list-item")) {
          tl.to(
            itemContent(part),
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: motion.home.duration.item,
              ease: motion.home.ease.text,
              force3D: true,
            },
            at,
          );
          at += motion.home.stagger.item;
        } else {
          tl.to(
            part,
            {
              autoAlpha: 1,
              y: 0,
              duration: motion.home.duration.heading,
              ease: motion.home.ease.heading,
              force3D: true,
            },
            at,
          );
          at += motion.home.stagger.text;
        }
      });
    },
  });
}

export default function ScrollReveal({
  children,
  variant = "fadeUp",
  emphasis = false,
  className,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const childrenTargets = [
      ...el.querySelectorAll(childSelectors),
      ...(variant === "mediaSplit"
        ? el.querySelectorAll(`${mediaSplitParts}, [data-list-item] > *`)
        : []),
    ];

    if (prefersReducedMotion()) {
      showTargets([el, ...childrenTargets]);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const travel = homeTravel();
    const ctx = gsap.context(() => {
      if (variant === "mediaSplit") {
        buildMediaSplit(el);
      }

      if (variant === "fadeUp") {
        gsap.set(el, {
          autoAlpha: 0,
          y: motion.reveal.y,
          scale: motion.reveal.scaleFrom,
          force3D: true,
        });
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: motion.duration.long,
          ease: motion.ease.reveal,
          force3D: true,
          scrollTrigger: revealScrollTrigger(el),
        });
      }

      // Grundvärdena är oförändrade för övriga sidor; emphasis används på startsidan.
      const v = emphasis
        ? {
            leftX: -travel.x,
            leftY: travel.x ? 0 : travel.y,
            headingY: travel.y,
            textY: travel.yText,
            scaleFrom: 1,
            long: motion.home.duration.heading,
            medium: motion.home.duration.text,
            short: motion.home.duration.item,
            ease: motion.home.ease.heading,
            easeSoft: motion.home.ease.text,
            stagger: motion.home.stagger.text + 0.02,
            overlap: "-=0.72",
            overlapBody: "-=0.78",
            overlapActions: "-=0.6",
            actionsY: travel.yText,
          }
        : {
            leftX: -motion.reveal.x,
            leftY: motion.reveal.ySoft * 0.5,
            headingY: motion.reveal.y,
            textY: motion.reveal.ySoft,
            scaleFrom: motion.reveal.scaleFrom,
            long: motion.duration.long,
            medium: motion.duration.medium,
            short: motion.duration.short,
            ease: motion.ease.reveal,
            easeSoft: motion.ease.revealSoft,
            stagger: 0.12,
            overlap: "-=0.52",
            overlapBody: "-=0.5",
            overlapActions: "-=0.38",
            actionsY: 8,
          };

      if (variant === "splitColumn") {
        const left = el.querySelector<HTMLElement>("[data-col-left]");
        const right = el.querySelector<HTMLElement>("[data-col-right]");
        const paragraphs = right?.querySelectorAll<HTMLElement>("[data-col-paragraph]");
        const rightHasCards = Boolean(right?.querySelector("[data-card]"));
        const rightHasListItems = Boolean(right?.querySelector("[data-list-item]"));

        const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(el) });

        if (left) {
          gsap.set(left, {
            autoAlpha: 0,
            x: v.leftX,
            y: v.leftY,
            force3D: true,
          });
          tl.to(left, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            duration: v.long,
            ease: v.ease,
            force3D: true,
          });
        }

        if (right && !rightHasCards && !rightHasListItems) {
          if (paragraphs?.length) {
            gsap.set(paragraphs, {
              autoAlpha: 0,
              y: v.textY,
              scale: v.scaleFrom,
              force3D: true,
            });
            tl.to(
              paragraphs,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: v.medium,
                ease: v.ease,
                stagger: v.stagger,
                force3D: true,
              },
              left ? v.overlap : 0,
            );
          } else {
            gsap.set(right, {
              autoAlpha: 0,
              y: v.textY + 2,
              scale: v.scaleFrom,
              force3D: true,
            });
            tl.to(
              right,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: v.medium,
                ease: v.ease,
                force3D: true,
              },
              left ? v.overlap : 0,
            );
          }
        }
      }

      if (variant === "staggerList") {
        const items = el.querySelectorAll<HTMLElement>("[data-list-item]");
        if (items.length) {
          gsap.set(items, {
            autoAlpha: 0,
            y: motion.reveal.ySoft,
            scale: motion.reveal.scaleFrom,
            force3D: true,
          });
          gsap.to(items, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: motion.duration.medium,
            ease: motion.ease.reveal,
            stagger: 0.07,
            force3D: true,
            scrollTrigger: revealScrollTrigger(el),
          });
        }
      }

      if (variant === "ctaStack") {
        const label = el.querySelector<HTMLElement>("[data-cta-label]");
        const heading = el.querySelector<HTMLElement>("[data-cta-heading]");
        const body = el.querySelector<HTMLElement>("[data-cta-body]");
        const actions = el.querySelector<HTMLElement>("[data-cta-actions]");

        const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(el) });

        if (label) {
          gsap.set(label, { autoAlpha: 0, y: v.textY, force3D: true });
          tl.to(label, { autoAlpha: 1, y: 0, duration: v.medium, ease: v.easeSoft, force3D: true }, 0);
        }
        if (heading) {
          gsap.set(heading, {
            autoAlpha: 0,
            y: v.headingY,
            scale: v.scaleFrom,
            force3D: true,
          });
          tl.to(
            heading,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: v.long,
              ease: v.ease,
              force3D: true,
            },
            label ? 0.1 : 0,
          );
        }
        if (body) {
          gsap.set(body, { autoAlpha: 0, y: v.textY, force3D: true });
          tl.to(
            body,
            {
              autoAlpha: 1,
              y: 0,
              duration: v.medium,
              ease: v.ease,
              force3D: true,
            },
            v.overlapBody,
          );
        }
        if (actions) {
          gsap.set(actions, { autoAlpha: 0, y: v.actionsY, scale: v.scaleFrom, force3D: true });
          tl.to(
            actions,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: v.short,
              ease: v.easeSoft,
              force3D: true,
            },
            v.overlapActions,
          );
        }
      }

      refreshScrollTriggers();
    }, ref);

    scheduleScrollRevealRefresh();

    return () => {
      ctx?.revert();
      showTargets([el, ...childrenTargets]);
      if (childrenTargets.length) gsap.set(childrenTargets, { clearProps: "clipPath" });
    };
  }, [variant, emphasis]);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}

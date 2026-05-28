"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** When false, skip viewport breakout (use inside an already full-bleed section). */
  breakout?: boolean;
  /** Skip Next optimizer — use for large local PNGs in /public. */
  unoptimized?: boolean;
};

export default function EditorialImageTransition({
  src,
  alt,
  className,
  breakout = true,
  unoptimized = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const figure = el.querySelector<HTMLElement>("[data-editorial-image-figure]");
    const image = el.querySelector<HTMLElement>("[data-editorial-image]");
    if (!figure || !image) return;

    let ctx: gsap.Context | undefined;

    const id = setTimeout(() => {
      ctx = gsap.context(() => {
        gsap.set(figure, { opacity: 1, y: 0, scale: 1 });

        gsap.fromTo(
          figure,
          { y: 34, scale: 0.988 },
          {
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
              invalidateOnRefresh: true,
            },
          },
        );

        gsap.fromTo(
          image,
          { yPercent: -3 },
          {
            yPercent: 3,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          },
        );
      }, ref);

      ScrollTrigger.refresh();
    }, 32);

    return () => {
      clearTimeout(id);
      ctx?.revert();
    };
  }, []);

  const layoutClass = breakout
    ? "relative left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2"
    : "relative z-0 w-full";

  return (
    <div
      ref={ref}
      data-editorial-image-transition
      className={`${layoutClass} ${className ?? ""}`.trim()}
    >
      <figure
        data-editorial-image-figure
        className="relative aspect-[16/10] w-full overflow-hidden opacity-100 md:aspect-auto md:h-[min(72vh,720px)]"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover object-[center_42%]"
          data-editorial-image
          quality={75}
          unoptimized={unoptimized}
        />
      </figure>
    </div>
  );
}

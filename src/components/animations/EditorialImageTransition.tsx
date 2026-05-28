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
};

export default function EditorialImageTransition({ src, alt, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const figure = el.querySelector<HTMLElement>("[data-editorial-image-figure]");
    const image = el.querySelector<HTMLElement>("[data-editorial-image]");
    if (!figure || !image) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        figure,
        { opacity: 0, y: 34, scale: 0.988 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 84%", once: true },
        },
      );

      gsap.fromTo(
        image,
        { yPercent: -3 },
        {
          yPercent: 3,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      data-editorial-image-transition
      className={`relative left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2 ${className ?? ""}`.trim()}
    >
      <figure
        data-editorial-image-figure
        className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:h-[min(72vh,720px)]"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover object-[center_42%]"
          data-editorial-image
          quality={85}
        />
      </figure>
    </div>
  );
}

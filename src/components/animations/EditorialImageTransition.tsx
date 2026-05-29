"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  isMobile,
  motion,
  prefersReducedMotion,
  refreshScrollTriggers,
  revealScrollTrigger,
  showTargets,
} from "@/lib/motion";

type Props = {
  src: string;
  alt: string;
  className?: string;
  children?: ReactNode;
  breakout?: boolean;
  unoptimized?: boolean;
};

export default function EditorialImageTransition({
  src,
  alt,
  className,
  children,
  breakout = true,
  unoptimized = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const figure = el.querySelector<HTMLElement>("[data-editorial-image-figure]");
    const image = el.querySelector<HTMLElement>("[data-editorial-image]");
    const content = el.querySelectorAll<HTMLElement>("[data-image-reveal-content]");
    if (!figure || !image) return;

    if (prefersReducedMotion()) {
      showTargets([figure, ...content]);
      gsap.set(image, { yPercent: 0, clearProps: "transform" });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const mobile = isMobile();
    const fromOpacity = mobile ? motion.opacity.imageFromMobile : motion.opacity.imageFrom;
    const fromY = mobile ? motion.reveal.yImageMobile : motion.reveal.yImage;
    const start = mobile ? motion.reveal.startImageMobile : motion.reveal.startImage;

    const ctx = gsap.context(() => {
      gsap.set(figure, {
        autoAlpha: fromOpacity,
        y: fromY,
        scale: motion.scale.imageFrom,
        transformOrigin: "center center",
        force3D: true,
      });
      if (content.length) gsap.set(content, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });

      const revealTl = gsap.timeline({
        scrollTrigger: revealScrollTrigger(el, { start }),
      });

      revealTl.to(figure, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: motion.duration.image,
        ease: motion.ease.image,
        force3D: true,
      });

      if (content.length) {
        revealTl.to(
          content,
          {
            autoAlpha: 1,
            y: 0,
            duration: motion.duration.medium,
            ease: motion.ease.reveal,
            stagger: 0.08,
            force3D: true,
          },
          "-=0.55",
        );
      }

      refreshScrollTriggers();
    }, ref);

    return () => {
      ctx?.revert();
      showTargets([figure, ...content]);
    };
  }, []);

  const layoutClass = breakout
    ? "relative left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2"
    : "relative z-0 w-full";

  return (
    <div
      ref={ref}
      data-editorial-image-transition
      data-parallax-image
      className={`${layoutClass} ${className ?? ""}`.trim()}
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
          quality={75}
          unoptimized={unoptimized}
        />
      </figure>
      {children}
    </div>
  );
}

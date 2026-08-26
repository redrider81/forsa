"use client";

import { useEffect, useRef } from "react";
import HeroImageReveal from "@/components/animations/HeroImageReveal";
import { prefersReducedMotion } from "@/lib/motion";

export const HERO_VIDEO_SRC = "/cvb1.mp4";

export default function HeroVideoBackground({
  className = "absolute inset-0 overflow-hidden",
}: {
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion()) {
      video.pause();
      return;
    }

    void video.play().catch(() => undefined);
  }, []);

  return (
    <HeroImageReveal className={className}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden="true"
      >
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      </video>
    </HeroImageReveal>
  );
}

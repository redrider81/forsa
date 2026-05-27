"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReducedMotion, isMobile } from "@/lib/motion";

export default function HeroAccent() {
  const arcRef = useRef<SVGSVGElement>(null);
  const dot1Ref = useRef<SVGSVGElement>(null);
  const dot2Ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isMobile()) return;

    const ctx = gsap.context(() => {
      if (arcRef.current) {
        gsap.to(arcRef.current, {
          rotation: 360,
          duration: 90,
          repeat: -1,
          ease: "none",
          transformOrigin: "50% 50%",
        });
      }
      if (dot1Ref.current) {
        gsap.to(dot1Ref.current, {
          y: -18,
          duration: 5.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (dot2Ref.current) {
        gsap.to(dot2Ref.current, {
          y: -12,
          duration: 7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 2.2,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        ref={arcRef}
        className="absolute -right-20 -top-20 h-[380px] w-[380px] opacity-[0.15]"
        viewBox="0 0 380 380"
        fill="none"
      >
        <circle
          cx="190"
          cy="190"
          r="150"
          stroke="#71717a"
          strokeWidth="1"
          strokeDasharray="70 22"
        />
        <circle
          cx="190"
          cy="190"
          r="95"
          stroke="#71717a"
          strokeWidth="0.5"
          strokeDasharray="35 28"
        />
      </svg>
      <svg
        ref={dot1Ref}
        className="absolute right-[18%] top-[45%] opacity-25"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
      >
        <circle cx="5" cy="5" r="3" fill="#71717a" />
      </svg>
      <svg
        ref={dot2Ref}
        className="absolute right-[32%] top-[22%] opacity-20"
        width="7"
        height="7"
        viewBox="0 0 7 7"
        fill="none"
      >
        <circle cx="3.5" cy="3.5" r="2" fill="#71717a" />
      </svg>
    </div>
  );
}

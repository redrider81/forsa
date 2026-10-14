"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Flytande bokningsknapp på startsidan, endast mobil. Visas när besökaren har
 * scrollat förbi heroknappen och döljs igen från den avslutande
 * bokningssektionen (#kontakt) och nedåt, så att två likadana knappar aldrig
 * syns samtidigt och sidfoten inte täcks. Ligger under navigeringen och
 * mobilmenyns överlägg (z-[100]/z-[110]).
 */
export default function MobileStickyCta({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heroCta = document.querySelector("[data-hero-cta]");
    const closing = document.getElementById("kontakt");
    if (!heroCta || !closing) return;

    // Läget räknas om vid varje scroll i stället för med IntersectionObserver:
    // ett hopp eller ett snabbt svep förbi den låga heroknappen korsar aldrig
    // viewporten och skulle annars inte märkas. Hero är bara sticky från md och
    // uppåt; på mobil scrollar den normalt, så heroknappens läge går att lita på.
    let frame = 0;
    const update = () => {
      frame = 0;
      const pastHero = heroCta.getBoundingClientRect().bottom < 0;
      const closingReached = closing.getBoundingClientRect().top < window.innerHeight;
      setVisible(pastHero && !closingReached);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      data-mobile-sticky-cta
      inert={!visible}
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center px-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none md:hidden ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className={visible ? "pointer-events-auto" : undefined}>{children}</div>
    </div>
  );
}

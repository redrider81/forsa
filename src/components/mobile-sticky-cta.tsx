"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";

/**
 * Flytande bokningsknapp på startsidan. På mobil: en enda bokningsknapp i
 * bild — när heroknappens intoning är klar läggs den flytande knappen exakt
 * där heroknappen står och heroknappen döljs. På desktop: samma knapp i
 * nedre högra hörnet under scroll. Den viker undan medan knappen i
 * avslutande bokningssektionen (#kontakt) syns. Ligger under navigeringen
 * och mobilmenyns överlägg (z-[100]/z-[110]).
 */

const DESKTOP_QUERY = "(min-width: 768px)";

const desktopDockStyle: CSSProperties = {
  top: "auto",
  left: "auto",
  right: "max(1.25rem, env(safe-area-inset-right, 0px))",
  bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
};

function shouldShowDesktopDock() {
  return window.scrollY > 120;
}

/** Läge i dokumentet utan transformer, så att heroanimationen inte påverkar. */
function layoutOffset(element: HTMLElement) {
  let top = 0;
  let left = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
    top += node.offsetTop;
    left += node.offsetLeft;
  }
  return { top, left };
}

export default function MobileStickyCta({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<CSSProperties | null>(null);
  const [otherOpacity, setOtherOpacity] = useState(0);
  const measureRef = useRef<() => number>(() => 0);

  useEffect(() => {
    const heroWrapper = document.querySelector<HTMLElement>("[data-hero-cta]");
    const heroLink = heroWrapper?.querySelector<HTMLElement>("a");
    const closingCta = document.getElementById("kontakt")?.querySelector<HTMLElement>("a");
    if (!heroWrapper || !heroLink || !closingCta) return;

    const desktop = window.matchMedia(DESKTOP_QUERY);
    let revealed = desktop.matches;
    let frame = 0;

    const place = () => {
      if (!revealed) {
        heroLink.style.visibility = "";
        setPosition(null);
        return;
      }

      if (desktop.matches) {
        heroLink.style.visibility = "";
        setPosition(shouldShowDesktopDock() ? { ...desktopDockStyle, transform: "none" } : null);
        return;
      }

      const { top } = layoutOffset(heroLink);
      const docked = `calc(100dvh - env(safe-area-inset-bottom, 0px) - 1rem - ${heroLink.offsetHeight}px)`;
      heroLink.style.visibility = "hidden";
      setPosition({
        top: `min(${top}px, ${docked})`,
        left: "50%",
        transform: "translateX(-50%)",
      });
    };

    const otherCtas = [closingCta];
    const shownOpacity = (element: HTMLElement) => {
      let opacity = 1;
      for (let node: HTMLElement | null = element; node && node !== document.body; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.visibility === "hidden") return 0;
        opacity *= Number(style.opacity);
      }
      return opacity;
    };
    let revealFrame = 0;
    measureRef.current = () => {
      let strongest = 0;
      let revealing = false;
      for (const cta of otherCtas) {
        const rect = cta.getBoundingClientRect();
        const middle = rect.top + rect.height / 2;
        if (middle < 0 || middle > window.innerHeight) continue;
        const opacity = shownOpacity(cta);
        if (opacity < 1) revealing = true;
        strongest = Math.max(strongest, opacity);
      }
      if (revealing && !revealFrame) {
        revealFrame = requestAnimationFrame(() => {
          revealFrame = 0;
          setOtherOpacity(measureRef.current());
        });
      }
      return strongest;
    };

    const waitForReveal = () => {
      if (desktop.matches || getComputedStyle(heroWrapper).opacity === "1" || window.scrollY > 0) {
        revealed = true;
        place();
        return;
      }
      frame = requestAnimationFrame(waitForReveal);
    };

    const onScroll = () => {
      if (!revealed) {
        cancelAnimationFrame(frame);
        waitForReveal();
      }
      if (desktop.matches) {
        place();
      }
      const next = measureRef.current();
      flushSync(() => setOtherOpacity(next));
    };

    if (desktop.matches) {
      place();
    } else {
      frame = requestAnimationFrame(waitForReveal);
    }
    const onDesktopChange = () => {
      revealed = desktop.matches || revealed;
      place();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", place);
    desktop.addEventListener("change", onDesktopChange);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(revealFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", place);
      desktop.removeEventListener("change", onDesktopChange);
      heroLink.style.visibility = "";
    };
  }, []);

  useLayoutEffect(() => {
    if (position) setOtherOpacity(measureRef.current());
  }, [position]);

  const opacity = position === null ? 0 : 1 - otherOpacity;
  const visible = opacity > 0.5;

  return (
    <div
      data-mobile-sticky-cta
      inert={!visible}
      style={{ ...position, opacity }}
      className="pointer-events-none fixed z-[80] max-md:w-max max-md:max-w-[min(100vw-2rem,22rem)] max-md:[&_a]:max-w-[min(100vw-2rem,22rem)] md:[&_a]:max-w-[min(100vw-3rem,20rem)] md:[&_a]:text-[0.8125rem] md:[&_a]:leading-snug lg:[&_a]:max-w-[22rem] lg:[&_a]:text-sm"
    >
      <div className={`flex max-md:justify-center ${visible ? "pointer-events-auto" : ""}`}>{children}</div>
    </div>
  );
}

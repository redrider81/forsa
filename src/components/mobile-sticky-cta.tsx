"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";

/**
 * Flytande bokningsknapp på startsidan, endast mobil. Det syns hela tiden en
 * enda bokningsknapp: när heroknappens intoning är klar läggs den flytande
 * knappen exakt där heroknappen står och heroknappen döljs. Därefter ligger
 * knappen kvar på samma plats på skärmen medan sidan scrollar. Den viker undan
 * medan en annan bokningsknapp på sidan syns: knappen mitt på sidan
 * ([data-booking-cta]) och knappen i den avslutande bokningssektionen
 * (#kontakt). Ligger under navigeringen och mobilmenyns överlägg
 * (z-[100]/z-[110]).
 */

const DESKTOP_QUERY = "(min-width: 768px)";

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
    const pageCtas = [...document.querySelectorAll<HTMLElement>("[data-booking-cta] a")];
    if (!heroWrapper || !heroLink || !closingCta) return;

    const desktop = window.matchMedia(DESKTOP_QUERY);
    let revealed = false;
    let frame = 0;

    // Hero är bara sticky från md och uppåt; på mobil scrollar den normalt, så
    // heroknappens läge i dokumentet är samma som dess läge på skärmen vid
    // scrolltopp. På korta skärmar där den hamnar under vikningen dockas den
    // flytande knappen i stället vid nederkanten.
    const place = () => {
      if (desktop.matches || !revealed) {
        heroLink.style.visibility = "";
        setPosition(null);
        return;
      }
      const { top, left } = layoutOffset(heroLink);
      const docked = `calc(100dvh - env(safe-area-inset-bottom, 0px) - 1rem - ${heroLink.offsetHeight}px)`;
      heroLink.style.visibility = "hidden";
      setPosition({ top: `min(${top}px, ${docked})`, left: `${left}px` });
    };

    // Den flytande knappen viker undan för en annan bokningsknapp på sidan som
    // är i bild, så att det aldrig syns två knappar. Knapparna tonas in av
    // ScrollReveal när de når skärmen; under intoningen tonas den flytande
    // knappen ut i samma takt (en övertoning) och läget följs bildruta för
    // bildruta, så att det varken blir två fullt synliga knappar eller ingen.
    const otherCtas = [...pageCtas, closingCta];
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
        // Minst halva knappen i bild, annars kan en remsa i skärmkanten bli den
        // enda knappen som syns.
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

    // Bytet sker när heroknappens intoning är klar, så att knappen tonas in som
    // tidigare och sedan blir kvar. Scrollar besökaren innan dess tar den
    // flytande knappen över direkt.
    const waitForReveal = () => {
      if (getComputedStyle(heroWrapper).opacity === "1" || window.scrollY > 0) {
        revealed = true;
        place();
        return;
      }
      frame = requestAnimationFrame(waitForReveal);
    };

    // flushSync gör att ändringen når DOM:en innan nästa bildruta målas, så att
    // ett byte aldrig visar en bildruta med två knappar eller ingen.
    const onScroll = () => {
      if (!revealed) {
        cancelAnimationFrame(frame);
        waitForReveal();
      }
      const next = measureRef.current();
      flushSync(() => setOtherOpacity(next));
    };

    frame = requestAnimationFrame(waitForReveal);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", place);
    desktop.addEventListener("change", place);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(revealFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", place);
      desktop.removeEventListener("change", place);
      heroLink.style.visibility = "";
    };
  }, []);

  // När knappen har fått sin plats mäts läget om innan något målas.
  useLayoutEffect(() => {
    if (position) setOtherOpacity(measureRef.current());
  }, [position]);

  const opacity = position === null ? 0 : 1 - otherOpacity;
  const visible = opacity > 0.5;

  return (
    <div
      data-mobile-sticky-cta
      inert={!visible}
      // Ingen egen övergång: opaciteten följer den andra knappens intoning, och
      // övriga byten sker där knapparna sammanfaller.
      style={{ ...position, opacity }}
      className="pointer-events-none fixed z-[80] md:hidden"
    >
      <div className={`flex ${visible ? "pointer-events-auto" : ""}`}>{children}</div>
    </div>
  );
}

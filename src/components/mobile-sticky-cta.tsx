"use client";

import { useEffect, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

/**
 * Flytande bokningsknapp på startsidan, endast mobil. Tar över när heroknappen
 * inte syns och döljs från den avslutande bokningssektionen (#kontakt) och
 * nedåt, så att sidfoten inte täcks. Ligger under navigeringen och
 * mobilmenyns överlägg (z-[100]/z-[110]).
 */
export default function MobileStickyCta({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heroCta = document.querySelector("[data-hero-cta]");
    const closing = document.getElementById("kontakt");
    if (!heroCta || !closing) return;

    // Läget räknas om direkt vid varje scroll i stället för med
    // IntersectionObserver: ett hopp eller ett snabbt svep förbi den låga
    // heroknappen korsar aldrig viewporten och skulle annars inte märkas. Hero
    // är bara sticky från md och uppåt; på mobil scrollar den normalt, så
    // heroknappens läge går att lita på.
    //
    // Den flytande knappen syns så fort heroknappen inte ligger helt inom den
    // användbara delen av viewporten: under nederkanten (korta skärmar där den
    // hamnar under vikningen) eller ovanför översta fjärdedelen. Viewportens
    // överkant är på telefon täckt av statusfält och webbläsarens adressfält, så
    // att vänta tills knappen lämnat viewporten helt ger ett glapp där ingen
    // knapp syns.
    //
    // flushSync gör att ändringen når DOM:en innan nästa bildruta målas. Annars
    // ritar React om först i en senare uppgift och ett hopp (ankarlänk, Page
    // Down) visar en bildruta utan någon knapp.
    const update = () => {
      const hero = heroCta.getBoundingClientRect();
      const heroInView = hero.bottom <= window.innerHeight && hero.bottom >= window.innerHeight * 0.25;
      const closingReached = closing.getBoundingClientRect().top < window.innerHeight;
      flushSync(() => setVisible(!heroInView && !closingReached));
    };

    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      data-mobile-sticky-cta
      inert={!visible}
      // Knappen visas direkt (ingen intoning som skapar ett glapp) och tonas
      // bara ut när den döljs.
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center px-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none"
      }`}
    >
      <div className={visible ? "pointer-events-auto" : undefined}>{children}</div>
    </div>
  );
}

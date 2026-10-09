import Link from "next/link";
import { toLocalePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const copy: Record<
  Locale,
  {
    ariaLabel: string;
    individual: { label: string; href: string };
    business: { label: string; href: string };
  }
> = {
  sv: {
    ariaLabel: "Välj coachingväg",
    individual: { label: "Individuell coaching", href: "/individuell-coaching" },
    business: { label: "Företagscoaching", href: "/business-coaching" },
  },
  en: {
    ariaLabel: "Choose a coaching path",
    individual: { label: "Individual coaching", href: "/individuell-coaching" },
    business: { label: "Business coaching", href: "/business-coaching" },
  },
};

/** Absolut placering längst ner i hero — centrerad på hela viewporten (md+). */
export const heroPathLinksPlacementClass =
  "pointer-events-auto absolute left-1/2 z-[3] w-max max-w-[min(100%,calc(100vw-3rem))] -translate-x-1/2 justify-center bottom-[max(clamp(1.25rem,4.5svh,2.75rem),env(safe-area-inset-bottom,0px))] md:bottom-[max(1rem,3svh)] lg:bottom-[max(1.75rem,4.5svh)] xl:bottom-[max(2.25rem,5.25svh)]";

const linkClass =
  "inline-flex min-h-10 shrink-0 items-center whitespace-nowrap px-1 py-1.5 text-[0.8125rem] font-medium leading-none tracking-[0.06em] text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.55)] underline-offset-[0.22em] transition-[color,text-decoration-color] duration-200 hover:text-white hover:underline decoration-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 focus-visible:ring-offset-2 focus-visible:ring-offset-black/35 active:text-white sm:min-h-11 sm:px-1.5 sm:py-2 sm:text-[0.875rem] md:px-2 md:text-[1.0625rem] md:tracking-[0.08em]";

export default function HeroCoachingPathLinks({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const c = copy[locale];

  return (
    <nav
      data-hero-path-links
      aria-label={c.ariaLabel}
      className={cn(
        "flex w-full max-w-full flex-nowrap items-center justify-center text-center",
        className,
      )}
    >
      <Link href={toLocalePath(c.individual.href, locale)} className={linkClass}>
        {c.individual.label}
      </Link>
      <span
        aria-hidden="true"
        className="mx-2 h-3.5 w-px shrink-0 bg-white sm:mx-2.5 sm:h-4 md:mx-3.5 md:h-[1.125rem]"
      />
      <Link href={toLocalePath(c.business.href, locale)} className={linkClass}>
        {c.business.label}
      </Link>
    </nav>
  );
}

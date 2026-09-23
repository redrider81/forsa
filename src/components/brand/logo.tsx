import Image from "next/image";

/**
 * CVB Coachings logotyp.
 *
 * `LogoMark` är monogrammet och används där höjden är begränsad — headers och
 * navigation. Valfri descriptor `coaching` (standard) eller `base` för delmärke.
 * `LogoLockup` är hela märket med ordbild och används där det finns
 * vertikalt utrymme, exempelvis inloggningsvyer och sidfot.
 */

export function LogoMark({
  className = "h-9 w-auto",
  priority = false,
  withCoaching = true,
  descriptor,
  align = "center",
}: {
  className?: string;
  priority?: boolean;
  /** @deprecated Prefer `descriptor`. When false and no descriptor, hides the wordmark line. */
  withCoaching?: boolean;
  descriptor?: "coaching" | "base";
  align?: "center" | "start";
}) {
  const wordmark = descriptor ?? (withCoaching !== false ? "coaching" : undefined);
  const alt = wordmark === "base" ? "CVB Base" : "CVB Coaching";

  return (
    <span
      className={`inline-flex flex-col leading-none ${
        align === "start" ? "items-start" : "items-center"
      } gap-3.5`}
    >
      <Image
        src="/cvb-monogram.png"
        alt={alt}
        width={512}
        height={511}
        className={className}
        priority={priority}
      />
      {wordmark ? (
        <span
          className={`font-serif text-[0.8125rem] font-normal uppercase tracking-[0.24em] sm:text-[0.875rem] md:text-[0.9375rem] lg:text-[1rem] ${
            wordmark === "base" ? "text-white" : "text-[#92753a]"
          }`}
          aria-hidden="true"
        >
          {wordmark}
        </span>
      ) : null}
    </span>
  );
}

export function LogoLockup({
  className = "h-24 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/cvb-logo.png"
      alt="CVB Coaching"
      width={900}
      height={1067}
      className={className}
      priority={priority}
    />
  );
}

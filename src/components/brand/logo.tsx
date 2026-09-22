import Image from "next/image";

/**
 * CVB Coachings logotyp.
 *
 * `LogoMark` är monogrammet och används där höjden är begränsad — headers och
 * navigation. `LogoLockup` är hela märket med ordbild och används där det finns
 * vertikalt utrymme, exempelvis inloggningsvyer och sidfot.
 */

export function LogoMark({
  className = "h-9 w-auto",
  priority = false,
  withCoaching = true,
}: {
  className?: string;
  priority?: boolean;
  withCoaching?: boolean;
}) {
  return (
    <span className="inline-flex flex-col items-center gap-3.5 leading-none">
      <Image
        src="/cvb-monogram.png"
        alt="CVB Coaching"
        width={512}
        height={511}
        className={className}
        priority={priority}
      />
      {withCoaching ? (
        <span
          className="font-serif text-[0.8125rem] font-normal uppercase tracking-[0.24em] text-[#92753a] sm:text-[0.875rem] md:text-[0.9375rem] lg:text-[1rem]"
          aria-hidden="true"
        >
          coaching
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

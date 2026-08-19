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
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/cvb-monogram.png"
      alt="CVB Coaching"
      width={512}
      height={511}
      className={className}
      priority={priority}
    />
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

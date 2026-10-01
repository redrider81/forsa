import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { legalHref } from "@/lib/legal/links";

/**
 * Information at the point of collection (GDPR art. 13). Deliberately not a
 * checkbox: the booking is handled to take steps at the visitor's request,
 * not on the basis of consent.
 */
export default function BookingPrivacyNotice({
  locale,
  t,
  className = "",
}: {
  locale: Locale;
  t: Dictionary;
  className?: string;
}) {
  return (
    <p className={`text-[0.8125rem] leading-relaxed text-zinc-500 ${className}`}>
      {t.form.privacyNotice.before}
      <Link
        href={legalHref("privacy", locale)}
        className="underline decoration-zinc-400 underline-offset-2 transition-colors hover:text-zinc-800 hover:decoration-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
      >
        {t.form.privacyNotice.link}
      </Link>
      {t.form.privacyNotice.after}
    </p>
  );
}

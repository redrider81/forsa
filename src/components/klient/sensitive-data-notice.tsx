import Link from "next/link";
import type { SpecialCategoryConsentState } from "@/lib/portal/special-category-consent-rules";

/**
 * Shown above the client's free-text fields (reflections, preparation,
 * commitment notes) whenever there is no active article 9 consent. Without
 * consent, sensitive personal data should not be entered at all.
 */
export default function SensitiveDataNotice({ state }: { state: SpecialCategoryConsentState }) {
  if (state === "active") return null;
  return (
    <p
      role="note"
      className="rounded-xl border border-[#ece7dc] bg-[var(--klient-text-block-bg)] px-4 py-3 text-[0.8125rem] leading-relaxed text-zinc-600"
    >
      {state === "withdrawn"
        ? "Du har återkallat ditt samtycke till behandling av känsliga personuppgifter. "
        : "Du har inte lämnat samtycke till behandling av känsliga personuppgifter. "}
      Utan aktivt samtycke hålls det du skriver här privat för dig och används inte av Carolina eller AI-stödet —
      inte heller om du lämnar samtycke senare. Skriv inte uppgifter om till exempel hälsa.{" "}
      <Link href="/klient/profil" className="underline underline-offset-2 hover:text-zinc-900">
        Samtycke under Profil
      </Link>
    </p>
  );
}

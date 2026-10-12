import type { Metadata } from "next";
import Link from "next/link";
import "@/components/klient/klient-tokens.css";
import { LogoMark } from "@/components/brand/logo";
import ActivationForm from "@/components/portal/activation-form";
import PortalLegalLinks from "@/components/portal/portal-legal-links";

export const metadata: Metadata = {
  title: "Nytt lösenord | CVB Base",
  description: "Välj ett nytt lösenord för CVB Base.",
  robots: { index: false, follow: false },
  // The activation token lives in the URL fragment; never leak the page URL.
  referrer: "no-referrer",
};

/**
 * Landing page for the "Glömt lösenord?" link. Renders only the form: nothing is
 * verified on GET, so link scanners and prefetching cannot spend the token.
 */
export default function ClientPasswordResetPage() {
  return (
    <main id="main-content" data-klient-portal className="portal-login-bg flex min-h-[100svh] flex-col text-zinc-900">
      <div className="flex flex-1 items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full max-w-[26rem]">
          <Link
            href="/"
            className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
          >
            <LogoMark className="h-16 w-auto" priority />
          </Link>

          <h1 className="mt-9 text-[1.9rem] font-medium leading-[1.2] tracking-tight text-zinc-900">
            Välj ett nytt lösenord
          </h1>
          <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-600">
            Välj ett nytt lösenord för CVB Base. Därefter loggas du in direkt, och andra inloggade enheter loggas ut.
          </p>

          <p className="mt-8 font-serif text-[1.375rem] font-medium leading-[1.15] tracking-tight text-zinc-900">
            CVB BASE
          </p>

          <div className="portal-login-glass mt-6 rounded-2xl border p-6 md:p-7">
            <ActivationForm mode="reset" />
          </div>

          <PortalLegalLinks className="mt-6" />
        </div>
      </div>
    </main>
  );
}

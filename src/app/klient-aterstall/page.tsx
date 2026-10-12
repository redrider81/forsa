import type { Metadata } from "next";
import Link from "next/link";
import "@/components/klient/klient-tokens.css";
import { LogoMark } from "@/components/brand/logo";
import PasswordResetRequestForm from "@/components/portal/password-reset-request-form";
import PortalLegalLinks from "@/components/portal/portal-legal-links";
import { portalOutlineButtonClass } from "@/components/portal/ui";

export const metadata: Metadata = {
  title: "Glömt lösenord | CVB Base",
  description: "Begär en länk för att välja nytt lösenord till CVB Base.",
  robots: { index: false, follow: false },
};

export default function ClientPasswordResetRequestPage() {
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

          <h1 className="mt-9 text-[1.9rem] font-medium leading-[1.2] tracking-tight text-zinc-900">Glömt lösenord?</h1>
          <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-600">
            Ange e-postadressen du loggar in med. Om den hör till ett konto i CVB Base skickar vi en länk där du väljer
            ett nytt lösenord.
          </p>

          <p className="mt-8 font-serif text-[1.375rem] font-medium leading-[1.15] tracking-tight text-zinc-900">
            CVB BASE
          </p>

          <div className="portal-login-glass mt-6 rounded-2xl border p-6 md:p-7">
            <PasswordResetRequestForm />
          </div>

          <Link href="/klient-login" className={`mt-8 w-full ${portalOutlineButtonClass}`}>
            Tillbaka till inloggningen
          </Link>

          <PortalLegalLinks className="mt-6" />
        </div>
      </div>
    </main>
  );
}

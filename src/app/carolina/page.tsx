import type { Metadata } from "next";
import Link from "next/link";
import "@/components/klient/klient-tokens.css";
import { LogoMark } from "@/components/brand/logo";
import { redirect } from "next/navigation";
import LoginForm from "@/components/portal/login-form";
import { portalOutlineButtonClass } from "@/components/portal/ui";
import { readSession } from "@/lib/portal/session";
import { demoHint } from "@/lib/portal/users";

/**
 * Carolina's operator entry to CVB Base.
 *
 * Unlisted rather than secret: it is absent from navigation, the footer and
 * the sitemap, and it is noindex/nofollow — but knowing the URL grants
 * nothing. Authorisation is the existing coach session and role check,
 * exactly as before; this page only reuses that form.
 */
export const metadata: Metadata = {
  title: "CVB Base | CVB Coaching",
  description: "Logga in i CVB Base.",
  robots: { index: false, follow: false },
};

export default async function CarolinaLoginPage() {
  const session = await readSession();
  if (session?.role === "coach") redirect("/cvb-base");

  return (
    <main id="main-content" data-portal className="portal-login-bg flex min-h-[100svh] flex-col text-zinc-900">
      <div className="flex flex-1 items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full max-w-[26rem]">
          <Link
            href="/"
            className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
          >
            <LogoMark className="h-16 w-auto" priority />
          </Link>

          <h1 className="mt-9 text-[1.9rem] font-medium leading-[1.15] tracking-tight text-zinc-900">
            CVB Base
          </h1>
          <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-600">
            Logga in för att fortsätta.
          </p>

          <div className="portal-login-glass mt-8 rounded-2xl border p-6 md:p-7">
            <LoginForm demo={demoHint("coach")} role="coach" redirectTo="/cvb-base" />
          </div>

          <Link href="/" className={`mt-8 w-full ${portalOutlineButtonClass}`}>
            Tillbaka
          </Link>
        </div>
      </div>
    </main>
  );
}

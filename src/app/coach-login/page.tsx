import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { redirect } from "next/navigation";
import LoginForm from "@/components/portal/login-form";
import { readSession } from "@/lib/portal/session";
import { demoHint } from "@/lib/portal/users";

export const metadata: Metadata = {
  title: "Coachinloggning | CVB Coaching",
  description: "Inloggning för coacher i CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function CoachLoginPage() {
  const session = await readSession();
  if (session?.role === "coach") redirect("/portal");

  return (
    <main id="main-content" className="flex min-h-[100svh] flex-col bg-[#f6f6f4] text-zinc-900">
      <div className="flex flex-1 items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full max-w-[26rem]">
          <Link
            href="/"
            className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
          >
            <LogoMark className="h-16 w-auto" priority />
          </Link>

          <h1 className="mt-9 text-[1.9rem] font-medium leading-[1.15] tracking-tight text-zinc-900">
            Coachportal
          </h1>
          <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-600">
            Tillgång till klienter, uppdrag, sessioner och förberedelser.
          </p>

          <div className="mt-8 rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)] md:p-7">
            <LoginForm demo={demoHint("coach")} role="coach" redirectTo="/portal" />
          </div>

          <p className="mt-6 text-[0.8125rem] leading-relaxed text-zinc-500">
            <Link href="/klient-login" className="text-zinc-700 underline underline-offset-4 hover:text-zinc-950">
              Klientportal
            </Link>
          </p>

          <p className="mt-8 text-[0.8125rem] text-zinc-400">
            <Link href="/" className="transition-colors hover:text-zinc-700">
              cvbcoaching.se
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "@/components/klient/klient-tokens.css";
import { KlientBottomNav, KlientDesktopNav } from "@/components/klient/klient-nav";
import { LogoMark } from "@/components/brand/logo";
import { formatWeekdayDate, todayIso } from "@/lib/portal/format";
import { readClientSession } from "@/lib/portal/session";

export const metadata: Metadata = {
  title: "CVB Base – Klient | CVB Coaching",
  description: "CVB Base — din coaching hos CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function KlientLayout({ children }: { children: React.ReactNode }) {
  const session = await readClientSession();
  if (!session) redirect("/klient-login");

  const today = todayIso();

  return (
    <div
      data-klient-portal
      className="relative flex min-h-[100svh] flex-col bg-[var(--klient-page-bg)] text-zinc-900"
    >
      <div aria-hidden className="klient-atmosphere" />

      <div className="klient-canvas flex min-h-[100svh] flex-col">
        <header
          className="klient-topbar sticky top-0 z-30"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {/* Ett enda nav-element. Det ligger på egen rad från md och glider
              in i toppraden från lg — inga dubbla landmärken. */}
          <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-10">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 py-3.5 md:py-4">
              <LogoMark className="order-1 h-10 w-auto shrink-0 md:h-11" priority />

              <time
                dateTime={today}
                className="order-2 ml-auto shrink-0 text-right text-[0.6875rem] font-normal leading-snug text-stone-600 lg:order-3 lg:text-[0.75rem]"
              >
                {formatWeekdayDate(today)}
              </time>

              <div className="order-3 hidden w-full pb-1 md:block lg:order-2 lg:flex lg:w-auto lg:min-w-0 lg:flex-1 lg:justify-center lg:pb-0">
                <KlientDesktopNav />
              </div>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1280px] flex-1 px-5 pb-36 pt-6 md:px-8 md:pb-20 md:pt-10 lg:px-10"
        >
          {children}
        </main>
      </div>

      <KlientBottomNav />
    </div>
  );
}

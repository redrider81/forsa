import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import "@/components/klient/klient-tokens.css";
import { PortalDesktopNav, PortalMobileNav } from "@/components/portal/portal-nav";
import { LogoMark } from "@/components/brand/logo";
import { formatWeekdayDate, todayIso } from "@/lib/portal/format";
import { readCoachSession } from "@/lib/portal/session";

export const metadata: Metadata = {
  title: "CVB Base | CVB Coaching",
  description: "CVB Base för coacher i CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await readCoachSession();
  if (!session) {
    redirect("/coach-login");
  }

  const today = todayIso();

  return (
    <div data-portal className="flex min-h-[100svh] flex-col bg-[var(--klient-page-bg)] text-zinc-900">
      <header
        className="sticky top-0 z-30 border-b border-[var(--klient-border-muted)] bg-[var(--klient-page-bg)]/98 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto w-full max-w-4xl px-5 md:px-6 xl:max-w-5xl">
          <div className="flex items-center justify-between gap-3 pb-3.5 pt-6 md:pt-7">
            <Link
              href="/cvb-base"
              className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
            >
              <LogoMark className="h-12 w-auto md:h-14" priority />
            </Link>

            <div className="flex items-center gap-3">
              <time
                dateTime={today}
                className="shrink-0 text-right text-[0.6875rem] font-normal leading-snug text-zinc-500 md:hidden"
              >
                {formatWeekdayDate(today)}
              </time>
              <PortalMobileNav />
            </div>
          </div>

          <div className="hidden border-t border-[var(--klient-border-muted)] pb-3 pt-3 md:block">
            <PortalDesktopNav />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full min-w-0 max-w-4xl flex-1 overflow-x-clip px-5 pb-16 pt-6 md:px-6 md:pt-10 xl:max-w-5xl"
      >
        {children}
      </main>
    </div>
  );
}

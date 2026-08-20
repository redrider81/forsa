import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import "@/components/klient/klient-tokens.css";
import { PortalBottomNav, PortalDesktopNav } from "@/components/portal/portal-nav";
import { Avatar } from "@/components/portal/ui";
import { LogoMark } from "@/components/brand/logo";
import { formatWeekdayDate, todayIso } from "@/lib/portal/format";
import { readCoachSession } from "@/lib/portal/session";

export const metadata: Metadata = {
  title: "CVB Coaching Portal",
  description: "Inloggad portal för coacher i CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await readCoachSession();
  if (!session) {
    redirect("/coach-login");
  }

  const today = todayIso();
  const initials = session.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3);

  return (
    <div data-portal className="flex min-h-[100svh] flex-col bg-[var(--klient-page-bg)] text-zinc-900">
      <header
        className="sticky top-0 z-30 border-b border-[var(--klient-border-muted)] bg-[var(--klient-page-bg)]/98 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto w-full max-w-4xl px-5 md:px-6 xl:max-w-5xl">
          <div className="flex items-center justify-between gap-3 py-3.5">
            <Link
              href="/portal"
              className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
            >
              <LogoMark className="h-10 w-auto" priority />
            </Link>

            <div className="flex items-center gap-3">
              <time
                dateTime={today}
                className="shrink-0 text-right text-[0.6875rem] font-normal leading-snug text-zinc-500 md:hidden"
              >
                {formatWeekdayDate(today)}
              </time>
              <Link
                href="/portal/profil"
                aria-label="Profil"
                className="hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)] md:inline-flex"
              >
                <Avatar initials={initials} size="sm" />
              </Link>
            </div>
          </div>

          <div className="hidden border-t border-[var(--klient-border-muted)] pb-3 pt-3 md:block">
            <PortalDesktopNav />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full min-w-0 max-w-4xl flex-1 overflow-x-clip px-5 pb-36 pt-6 md:px-6 md:pb-16 md:pt-10 xl:max-w-5xl"
      >
        {children}
      </main>

      <PortalBottomNav />
    </div>
  );
}

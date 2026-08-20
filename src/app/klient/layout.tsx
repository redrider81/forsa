import type { Metadata } from "next";
import { redirect } from "next/navigation";
import "@/components/klient/klient-tokens.css";
import { KlientBottomNav, KlientDesktopNav } from "@/components/klient/klient-nav";
import { LogoMark } from "@/components/brand/logo";
import { formatWeekdayDate, todayIso } from "@/lib/portal/format";
import { readClientSession } from "@/lib/portal/session";

export const metadata: Metadata = {
  title: "Min utveckling | CVB Coaching",
  description: "Din klientportal hos CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function KlientLayout({ children }: { children: React.ReactNode }) {
  const session = await readClientSession();
  if (!session) redirect("/klient-login");

  const today = todayIso();

  return (
    <div data-klient-portal className="flex min-h-[100svh] flex-col bg-[var(--klient-page-bg)] text-zinc-900">
      <header
        className="sticky top-0 z-30 border-b border-[var(--klient-border-muted)] bg-[var(--klient-page-bg)]/98 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto w-full max-w-3xl px-5 md:px-6 xl:max-w-4xl">
          <div className="flex items-center justify-between gap-3 py-3.5">
            <LogoMark className="h-10 w-auto" priority />
            <time
              dateTime={today}
              className="shrink-0 text-right text-[0.6875rem] font-normal leading-snug text-zinc-500 md:hidden"
            >
              {formatWeekdayDate(today)}
            </time>
          </div>

          <div className="hidden border-t border-[#ece7dc] pb-3 pt-3 md:block">
            <KlientDesktopNav />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl flex-1 px-5 pb-36 pt-6 md:px-6 md:pb-16 md:pt-10 xl:max-w-4xl"
      >
        {children}
      </main>

      <KlientBottomNav />
    </div>
  );
}

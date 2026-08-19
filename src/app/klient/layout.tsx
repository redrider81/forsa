import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { KlientBottomNav, KlientDesktopNav } from "@/components/klient/klient-nav";
import { LogoMark } from "@/components/brand/logo";
import { readClientSession } from "@/lib/portal/session";

export const metadata: Metadata = {
  title: "Min utveckling | CVB Coaching",
  description: "Din klientportal hos CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function KlientLayout({ children }: { children: React.ReactNode }) {
  const session = await readClientSession();
  if (!session) redirect("/klient-login");

  return (
    <div className="flex min-h-[100svh] flex-col bg-[#faf8f4] text-zinc-900">
      <header
        className="sticky top-0 z-30 border-b border-[#ece7dc] bg-[#fbfaf7]/95 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-5 py-3.5 md:px-6 lg:max-w-3xl">
          <LogoMark className="h-8 w-auto" priority />
          <span aria-hidden="true" className="h-4 w-px bg-zinc-900/12" />
          <span className="text-[0.75rem] tracking-[0.08em] text-zinc-500">Min utveckling</span>

          <div className="ml-auto">
            <KlientDesktopNav />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-2xl flex-1 px-5 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10 lg:max-w-3xl"
      >
        {children}
      </main>

      <KlientBottomNav />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalBottomNav, PortalDesktopNav } from "@/components/portal/portal-nav";
import { Avatar } from "@/components/portal/ui";
import { readSession } from "@/lib/portal/session";

export const metadata: Metadata = {
  title: "CVB Coaching Portal",
  description: "Inloggad portal för coacher i CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  if (!session) {
    redirect("/logga-in");
  }

  const initials = session.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3);

  return (
    <div className="flex min-h-[100svh] flex-col bg-[#f6f6f4] text-zinc-900">
      <header
        className="sticky top-0 z-30 border-b border-zinc-200/80 bg-[#faf9f7]/95 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-3.5 md:px-6">
          <Link
            href="/portal"
            className="text-[0.75rem] font-semibold tracking-[0.24em] text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7] md:text-[0.8125rem]"
          >
            CVB COACHING
          </Link>
          <span aria-hidden="true" className="h-4 w-px bg-zinc-900/12" />
          <span className="text-[0.75rem] tracking-[0.08em] text-zinc-500">Portal</span>

          <div className="ml-auto flex items-center gap-3">
            <PortalDesktopNav />
            <Link
              href="/portal/profil"
              aria-label="Profil"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7]"
            >
              <Avatar initials={initials} size="sm" />
            </Link>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl flex-1 px-5 pb-28 pt-6 md:px-6 md:pb-16 md:pt-10"
      >
        {children}
      </main>

      <PortalBottomNav />
    </div>
  );
}

# 06 — Public pre-authentication surfaces and CVB Base boundary

Repository: redrider81/forsa
Branch: main
Commit: 088ffd03c531b59dc2772714249af8fa87a50654

Login pages reachable without authentication, and the CVB Base layer that is publicly reachable only as a redirect. No authenticated portal content is included.

Generated read-only from the current local HEAD. No secrets, environment values, credentials, tokens, private URLs or client data are included.

---

## File: src/app/klient-login/page.tsx

### Affected route(s)
/klient-login

### Current source

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import "@/components/klient/klient-tokens.css";
import { LogoMark } from "@/components/brand/logo";
import { redirect } from "next/navigation";
import LoginForm from "@/components/portal/login-form";
import { portalOutlineButtonClass } from "@/components/portal/ui";
import { readSession } from "@/lib/portal/session";
import { demoHint } from "@/lib/portal/users";

export const metadata: Metadata = {
  title: "CVB Base | CVB Coaching",
  description: "Logga in i CVB Base hos CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function ClientLoginPage() {
  const session = await readSession();
  if (session?.role === "klient") redirect("/klient");

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
            Din coaching, samlad på ett ställe.
          </h1>
          <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-600">
            Följ dina sessioner, förberedelser, reflektioner och åtaganden genom hela coachingprocessen.
            CVB Base ger dig kontinuitet, överblick och tillgång till ditt delade material mellan samtalen.
          </p>

          <p className="mt-8 font-serif text-[1.375rem] font-medium leading-[1.15] tracking-tight text-zinc-900">
            CVB BASE
          </p>

          <div className="portal-login-glass mt-6 rounded-2xl border p-6 md:p-7">
            <LoginForm demo={demoHint("klient")} role="klient" redirectTo="/klient" />
          </div>

          <Link href="/" className={`mt-8 w-full ${portalOutlineButtonClass}`}>
            Tillbaka
          </Link>
        </div>
      </div>
    </main>
  );
}
```

---

## File: src/app/coach-login/page.tsx

### Affected route(s)
/coach-login

### Current source

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import "@/components/klient/klient-tokens.css";
import { LogoMark } from "@/components/brand/logo";
import { redirect } from "next/navigation";
import LoginForm from "@/components/portal/login-form";
import { portalOutlineButtonClass } from "@/components/portal/ui";
import { readSession } from "@/lib/portal/session";
import { demoHint } from "@/lib/portal/users";

export const metadata: Metadata = {
  title: "CVB Base – Coach | CVB Coaching",
  description: "Logga in i CVB Base som coach hos CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function CoachLoginPage() {
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
            Tillgång till klienter, uppdrag, sessioner och förberedelser.
          </p>

          <div className="portal-login-glass mt-8 rounded-2xl border p-6 md:p-7">
            <LoginForm demo={demoHint("coach")} role="coach" redirectTo="/cvb-base" />
          </div>

          <p className="mt-6 text-[0.8125rem] leading-relaxed text-zinc-500">
            <Link href="/klient-login" className="text-zinc-700 underline underline-offset-4 hover:text-zinc-950">
              Logga in som klient
            </Link>
          </p>

          <Link href="/" className={`mt-8 w-full ${portalOutlineButtonClass}`}>
            Tillbaka
          </Link>
        </div>
      </div>
    </main>
  );
}
```

---

## File: src/app/logga-in/page.tsx

### Affected route(s)
/logga-in

### Current source

```tsx
import { redirect } from "next/navigation";

/** Gammal inloggningsväg. Behålls så att bokmärken fortsätter fungera. */
export default function LegacyLoginPage() {
  redirect("/coach-login");
}
```

---

## File: src/app/cvb-base/layout.tsx

### Affected route(s)
/cvb-base/* — pre-authentication only

This layout is the entire publicly reachable surface of CVB Base: an unauthenticated visitor is redirected to `/coach-login` before any content renders. Its metadata sets `robots: { index: false, follow: false }`. Everything below it is authenticated and is deliberately excluded from this export.

### Current source

```tsx
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
```

---

## Pre-authentication image alt text

No photographic imagery appears on any pre-authentication route. The only images are the
brand logo and monogram, both with alt text `CVB Coaching`, rendered via
`src/components/brand/logo.tsx` (source in 01).

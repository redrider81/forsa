"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

const navItems = [
  { href: "/", label: "Start" },
  { href: "/executive-coaching", label: "Executive coaching" },
  { href: "/ledningsgruppscoaching", label: "Ledningsgruppscoaching" },
  { href: "/individuell-coaching", label: "Individuell coaching" },
  { href: "/team-coaching", label: "Team coaching" },
  { href: "/coachande-ledarskap", label: "Coachande ledarskap" },
  { href: "/om-forsa", label: "Om Forsa" },
  { href: "/kontakt", label: "Kontakt" },
];

function linkClass(isActive: boolean) {
  return isActive
    ? "text-zinc-900 after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:bg-zinc-700"
    : "text-zinc-600 transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100";
}

export default function SiteNavigation() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || prefersReducedMotion()) return;

    let ctx: gsap.Context | undefined;

    const id = setTimeout(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { y: -14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: "power3.out" }
        );
      });
    }, 32);

    return () => {
      clearTimeout(id);
      ctx?.revert();
    };
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-zinc-300 bg-zinc-50/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.18em] text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100"
        >
          FORSA
        </Link>
        <nav aria-label="Huvudnavigation" className="hidden items-center gap-4 text-xs md:flex lg:text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative pb-1 ${linkClass(isActive)}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <nav aria-label="Mobil navigation" className="border-t border-zinc-300 px-6 py-4 md:hidden">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex rounded-full px-3 py-1.5 ${
                    isActive ? "bg-zinc-200 text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

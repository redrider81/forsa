"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { prefersReducedMotion, resetRouteScroll } from "@/lib/motion";

type CtaLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "gold";
  external?: boolean;
  translucent?: boolean;
  onClick?: () => void;
};

const baseClass =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100";

const heroBaseClass =
  "min-h-[2.875rem] w-auto max-w-[min(100%,20rem)] shrink-0 px-6 py-3 text-sm font-medium leading-tight tracking-[0.01em] sm:min-h-12 sm:px-7";

const variants = {
  primary:
    "bg-zinc-700 !text-zinc-50 hover:bg-zinc-600 active:bg-zinc-800",
  primaryTranslucent:
    "border border-black/12 bg-[#f2f1ed] !text-[#18181b] shadow-[0_2px_14px_rgba(0,0,0,0.35)] hover:bg-[#e8e7e2] active:bg-[#deddd8] focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40",
  secondary:
    "border border-zinc-400 !text-zinc-700 hover:border-zinc-600 hover:bg-zinc-100 active:border-zinc-700",
  secondaryTranslucent:
    "border border-black/12 bg-[#f2f1ed] !text-[#18181b] shadow-[0_2px_14px_rgba(0,0,0,0.35)] hover:bg-[#e8e7e2] active:bg-[#deddd8] focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40",
  tertiary:
    "border border-[#dcdcdc] bg-[#f0f0f0] !text-zinc-800 hover:border-zinc-400 hover:bg-[#e8e8e8] active:border-zinc-500 active:bg-[#e0e0e0]",
  tertiaryTranslucent:
    "border border-white/35 bg-white/10 !text-white backdrop-blur-[6px] hover:border-white/50 hover:bg-white/15 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/25",
  gold:
    "border border-transparent bg-[#92753a] !text-zinc-50 hover:bg-[#7d6432] active:bg-[#6f5829]",
  goldTranslucent:
    "border border-transparent bg-[#92753a]/45 !text-zinc-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)] backdrop-blur-md hover:bg-[#92753a]/60 active:bg-[#92753a]/70 focus-visible:ring-offset-white/40",
};

function variantClass(variant: NonNullable<CtaLinkProps["variant"]>, translucent: boolean) {
  if (translucent) {
    if (variant === "primary") return variants.primaryTranslucent;
    if (variant === "secondary") return variants.secondaryTranslucent;
    if (variant === "tertiary") return variants.tertiaryTranslucent;
    if (variant === "gold") return variants.goldTranslucent;
  }
  return variants[variant];
}

function isContactHref(href: string): boolean {
  return href === "/kontakt" || href === "/en/kontakt" || href.endsWith("/kontakt");
}

/** "/#coaching" or "#coaching" när vi redan står på samma sida. */
function samePageHash(href: string): string | null {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return null;
  const path = href.slice(0, hashIndex);
  if (path && path !== "/" && path !== window.location.pathname) return null;
  const hash = href.slice(hashIndex);
  return hash.length > 1 ? hash : null;
}

function handleNavigate(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  onClick?: () => void,
) {
  onClick?.();
  if (isContactHref(href)) {
    resetRouteScroll();
    return;
  }

  // Ankarlänkar på samma sida rullar vi själva. Router-navigeringen landar inte
  // alltid på målet när sidan har en sticky hero. Beteendet sätts explicit
  // eftersom ScrollTrigger nollställer CSS scroll-behavior på html.
  const hash = samePageHash(href);
  if (!hash) return;
  const target = document.querySelector(hash);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  window.history.pushState(null, "", href);
}

export default function CtaLink({
  href,
  children,
  variant = "primary",
  external = false,
  translucent = false,
  onClick,
}: CtaLinkProps) {
  const className = `${baseClass}${translucent ? ` ${heroBaseClass}` : ""} ${variantClass(variant, translucent)}`;

  if (external) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      scroll
      onClick={(event) => handleNavigate(event, href, onClick)}
    >
      {children}
    </Link>
  );
}

"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { resetRouteScroll } from "@/lib/motion";

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
    "border border-white/22 bg-zinc-700/92 !text-white shadow-[0_6px_28px_-10px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.14)] hover:border-white/32 hover:bg-zinc-600/95 active:bg-zinc-800/95 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30",
  secondary:
    "border border-zinc-400 !text-zinc-700 hover:border-zinc-600 hover:bg-zinc-100 active:border-zinc-700",
  secondaryTranslucent:
    "border border-white/48 bg-zinc-950/58 !text-white shadow-[0_4px_22px_-12px_rgba(0,0,0,0.42),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-[6px] hover:border-white/58 hover:bg-zinc-950/68 active:bg-zinc-950/74 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/25",
  tertiary:
    "border border-zinc-300 !text-zinc-700 hover:border-zinc-500 hover:bg-zinc-50 active:border-zinc-600",
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

function handleNavigate(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  onClick?: () => void,
) {
  onClick?.();
  if (isContactHref(href)) {
    resetRouteScroll();
  }
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

import Link from "next/link";
import type { ReactNode } from "react";

type CtaLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "gold";
  external?: boolean;
  translucent?: boolean;
};

const baseClass =
  "inline-flex items-center rounded-full px-6 py-3 text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100";

const variants = {
  primary:
    "bg-zinc-900 !text-zinc-50 hover:bg-zinc-700 active:bg-zinc-800",
  primaryTranslucent:
    "border border-white/28 bg-zinc-950/62 !text-zinc-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-md hover:border-white/38 hover:bg-zinc-950/74 active:bg-zinc-950/82 focus-visible:ring-offset-white/40",
  secondary:
    "border border-zinc-400 !text-zinc-700 hover:border-zinc-600 hover:bg-zinc-100 active:border-zinc-700",
  secondaryTranslucent:
    "border border-white/46 bg-black/24 !text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-md hover:border-white/60 hover:bg-black/32 active:bg-black/40 focus-visible:ring-offset-white/40",
  gold:
    "border border-transparent bg-[#92753a] !text-zinc-50 hover:bg-[#7d6432] active:bg-[#6f5829]",
  goldTranslucent:
    "border border-transparent bg-[#92753a]/45 !text-zinc-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)] backdrop-blur-md hover:bg-[#92753a]/60 active:bg-[#92753a]/70 focus-visible:ring-offset-white/40",
};

function variantClass(variant: NonNullable<CtaLinkProps["variant"]>, translucent: boolean) {
  if (translucent) {
    if (variant === "primary") return variants.primaryTranslucent;
    if (variant === "secondary") return variants.secondaryTranslucent;
    if (variant === "gold") return variants.goldTranslucent;
  }
  return variants[variant];
}

export default function CtaLink({
  href,
  children,
  variant = "primary",
  external = false,
  translucent = false,
}: CtaLinkProps) {
  const className = `${baseClass} ${variantClass(variant, translucent)}`;

  if (external) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

type CtaLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
};

const baseClass =
  "inline-flex items-center rounded-full px-6 py-3 text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100";
const variants = {
  primary:
    "bg-zinc-900 !text-zinc-50 hover:bg-zinc-700 active:bg-zinc-800",
  secondary:
    "border border-zinc-400 !text-zinc-700 hover:border-zinc-600 hover:bg-zinc-100 active:border-zinc-700",
};

export default function CtaLink({
  href,
  children,
  variant = "primary",
  external = false,
}: CtaLinkProps) {
  const className = `${baseClass} ${variants[variant]}`;

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

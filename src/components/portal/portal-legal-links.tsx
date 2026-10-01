import Link from "next/link";
import { legalLinks, type LegalPageKey } from "@/lib/legal/links";

/** Quiet text links to the Swedish legal pages, for the login and profile views. */
export default function PortalLegalLinks({
  keys = ["privacy", "baseTerms"],
  className = "",
}: {
  keys?: readonly LegalPageKey[];
  className?: string;
}) {
  return (
    <nav aria-label="Villkor och integritet" className={`text-[0.8125rem] text-zinc-500 ${className}`}>
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {legalLinks("sv", keys).map((link) => (
          <li key={link.key}>
            <Link
              href={link.href}
              className="underline-offset-2 transition-colors hover:text-zinc-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

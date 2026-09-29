import type { Metadata } from "next";
import Link from "next/link";
import RootDocument, { siteUrl } from "@/components/root-document";

/**
 * 404 för URL:er som inte matchar någon route. Sajten har två rotlayouter,
 * (sv) och (en), och därför ingen gemensam layout att bygga en vanlig
 * not-found.tsx på. Sidan får samma dokumentskal som resten av sajten och
 * visas på båda språken, eftersom den inte vet vilket språk besökaren kom från.
 */
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Sidan hittades inte | CVB Coaching",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <RootDocument lang="sv">
      <main
        id="main-content"
        className="flex min-h-[70vh] flex-1 items-center bg-[#f4f3ef] px-6 pb-24 pt-40 text-zinc-900 md:px-10"
      >
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-medium tabular-nums tracking-[0.32em] text-zinc-900">404</p>
          <h1 className="mt-8 font-serif text-[clamp(2.125rem,4.2vw,3.5rem)] font-medium leading-[1.18] tracking-[-0.035em]">
            Sidan hittades inte.
          </h1>
          <p className="mt-6 max-w-xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600">
            Adressen finns inte, eller så har sidan flyttats.
          </p>
          <p lang="en" className="mt-2 max-w-xl text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600">
            This page could not be found.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium">
            <Link href="/" className="underline underline-offset-4 decoration-zinc-400 hover:decoration-zinc-900">
              Till startsidan
            </Link>
            <Link
              href="/en"
              lang="en"
              className="underline underline-offset-4 decoration-zinc-400 hover:decoration-zinc-900"
            >
              Go to the English site
            </Link>
          </div>
        </div>
      </main>
    </RootDocument>
  );
}

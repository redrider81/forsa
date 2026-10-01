import Link from "next/link";
import HeroReveal from "@/components/animations/HeroReveal";
import type { LegalBlock, LegalDocument, LegalInline } from "@/lib/legal/document";

/**
 * Server-rendered legal page. Same container, header rhythm and body type
 * as the contact page — no separate legal look.
 */

const linkClass =
  "text-zinc-900 underline decoration-line-accent/60 underline-offset-[3px] transition-colors hover:decoration-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]";

function Inline({ parts }: { parts: LegalInline[] }) {
  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === "string") return <span key={index}>{part}</span>;
        const external = /^(https?:|mailto:)/.test(part.href);
        return external ? (
          <a key={index} href={part.href} className={linkClass}>
            {part.label}
          </a>
        ) : (
          <Link key={index} href={part.href} className={linkClass}>
            {part.label}
          </Link>
        );
      })}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (block.kind === "p") {
    return (
      <p className="text-[1.0625rem] leading-[1.75] text-zinc-700">
        <Inline parts={block.content} />
      </p>
    );
  }
  if (block.kind === "list") {
    return (
      <ul className="space-y-2.5 text-[1.0625rem] leading-[1.7] text-zinc-700">
        {block.items.map((item, index) => (
          <li key={index} className="grid grid-cols-[1rem_1fr] gap-3">
            <span className="mt-[0.72rem] h-1 w-1 shrink-0 bg-zinc-900" aria-hidden />
            <span>
              <Inline parts={item} />
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <dl className="divide-y divide-line-accent/25 border-y border-line-accent/30">
      {block.items.map((item) => (
        <div key={item.term} className="grid gap-1 py-3.5 sm:grid-cols-[12rem_1fr] sm:gap-6">
          <dt className="text-sm font-medium tracking-[0.03em] text-zinc-500">{item.term}</dt>
          <dd className="min-w-0 break-words text-[1.0625rem] leading-[1.6] text-zinc-800">
            <Inline parts={item.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function LegalDocumentPage({ document }: { document: LegalDocument }) {
  return (
    <main id="main-content" className="min-h-screen bg-[#f6f6f4] text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="border-b border-zinc-300/80 pb-12 md:pb-16">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              {document.label}
            </p>
            <h1
              data-hero-headline
              className="mt-6 max-w-3xl text-4xl font-medium leading-[1.25] tracking-tight md:text-6xl"
            >
              {document.title}
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              {document.lead}
            </p>
            <p className="mt-6 text-sm text-zinc-500">{document.updatedLabel}</p>
          </HeroReveal>
        </section>

        <div className="grid gap-12 pt-12 md:grid-cols-12 md:gap-x-8 md:pt-16">
          <nav aria-label={document.tocLabel} className="hidden md:col-span-4 md:block lg:col-span-3">
            <div className="sticky top-28">
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-zinc-500">
                {document.tocLabel}
              </p>
              <ol className="mt-4 space-y-2 text-sm leading-snug text-zinc-600">
                {document.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="min-w-0 max-w-2xl space-y-14 md:col-span-8 lg:col-span-8 lg:col-start-5">
            {document.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-2xl font-medium leading-[1.28] tracking-tight md:text-[1.75rem]">
                  {section.heading}
                </h2>
                <div className="mt-6 space-y-5">
                  {section.blocks.map((block, index) => (
                    <Block key={index} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

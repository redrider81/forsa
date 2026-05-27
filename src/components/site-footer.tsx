export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-300 bg-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-zinc-600 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="space-y-1">
          <p className="tracking-[0.1em] text-zinc-900">FORSA</p>
          <p className="text-zinc-600">Executive coaching och ledningsstöd</p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <span className="text-zinc-600">Göteborg</span>
          <a
            href="mailto:kontakt@forsa.se"
            className="text-zinc-700 transition hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100"
          >
            kontakt@forsa.se
          </a>
        </div>
      </div>
    </footer>
  );
}

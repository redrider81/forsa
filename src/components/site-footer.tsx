import Link from "next/link";

const services = [
  { href: "/executive-coaching", label: "Executive coaching" },
  { href: "/ledningsgruppscoaching", label: "Ledningsgruppscoaching" },
  { href: "/individuell-coaching", label: "Individuell coaching" },
  { href: "/team-coaching", label: "Team coaching" },
  { href: "/coachande-ledarskap", label: "Coachande ledarskap" },
];

const about = [
  { href: "/om-forsa", label: "Om Forsa" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-300 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">

          <div className="md:col-span-5">
            <p className="text-sm font-semibold tracking-[0.18em] text-zinc-900">FORSA</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-600">
              Executive coaching och ledningsstöd för vd:ar, grundare och ledningsgrupper när
              beslut, ansvar och riktning behöver skärpas.
            </p>
            <div className="mt-5 space-y-1.5">
              <p className="text-sm text-zinc-500">Göteborg, Sverige</p>
              <a
                href="mailto:kontakt@forsa.se"
                className="inline-block text-sm text-zinc-700 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50"
              >
                kontakt@forsa.se
              </a>
            </div>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Tjänster
            </p>
            <ul className="mt-4 space-y-2.5">
              {services.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Om Forsa
            </p>
            <ul className="mt-4 space-y-2.5">
              {about.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-zinc-200 pt-6">
          <p className="text-xs text-zinc-400">© 2026 Forsa. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
}

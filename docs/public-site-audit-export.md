# CVB Coaching — Public Site Content Audit Export

Repository: redrider81/forsa
Branch: main
Commit: 5aed66bfb12c40c82db8e80b5c83c1fb59e6cef8

Generated from the current local HEAD. Read-only export for external review of the
public-facing customer surfaces against the approved Swedish homepage positioning.

No environment values, secrets, credentials, tokens, private keys, Supabase URLs or
client data are included. Authenticated CVB Base and client-portal content is excluded;
only the pre-authentication redirect layer is shown.

## Public route map

| Route | Language | Source |
| --- | --- | --- |
| `/` | Swedish | `src/app/page.tsx` |
| `/individuell-coaching` | Swedish | `src/app/individuell-coaching/page.tsx` |
| `/business-coaching` | Swedish | `src/app/business-coaching/page.tsx` |
| `/om-oss` | Swedish | `src/app/om-oss/page.tsx` |
| `/kontakt` | Swedish | `src/app/kontakt/page.tsx` |
| `/en` | English | `src/app/en/page.tsx` |
| `/en/individuell-coaching` | English | `src/app/en/individuell-coaching/page.tsx` |
| `/en/business-coaching` | English | `src/app/en/business-coaching/page.tsx` |
| `/en/om-oss` | English | `src/app/en/om-oss/page.tsx` |
| `/en/kontakt` | English | `src/app/en/kontakt/page.tsx` |
| `/klient-login` | Swedish | `src/app/klient-login/page.tsx` |
| `/coach-login` | Swedish | `src/app/coach-login/page.tsx` |
| `/logga-in` | Swedish | `src/app/logga-in/page.tsx` |

Retired public routes return permanent 308 redirects to `/business-coaching` (and
`/en/business-coaching`): `executive-coaching`, `ledningsgruppscoaching`,
`team-coaching`, `coachande-ledarskap`. See `next.config.ts` below.

## SEO and structured data present

- Page metadata: exported per route via Next.js `export const metadata` — included in each file below.
- Structured data: `src/components/json-ld.tsx` (ProfessionalService, Person), mounted in `src/app/layout.tsx` and `src/app/om-oss/page.tsx`.
- `robots`: set to `index: false, follow: false` on `/klient-login`, `/coach-login`, `/cvb-base/*` and `/klient/*` only.
- **No `sitemap.ts`, `robots.ts`, `manifest`, `opengraph-image` or `twitter-image` files exist at HEAD.**
- **No `openGraph` or `twitter` metadata keys exist anywhere in the source at HEAD.**
- Only static asset in `src/app`: `favicon.ico`.

## Public image references and alt text at HEAD

Image and video files referenced from public surfaces:

| Asset | Referenced from | Alt text |
| --- | --- | --- |
| `/cvb-monogram.png` | `src/components/brand/logo.tsx` | `CVB Coaching` |
| `/cvb-logo.png` | `src/components/brand/logo.tsx` | `CVB Coaching` |
| `/cvb1.mp4` | `src/components/hero-video-background.tsx` | decorative background video |
| `/carolina-von-braun.png` | `src/components/ui/kinetic-team-hybrid.tsx` | `Carolina von Braun, coach och grundare av CVB Coaching` |
| `/supertable.png` | `src/app/en/page.tsx` **(English homepage only)** | `Preparing for a coaching session` |
| `/superoffice.png` | `src/app/en/page.tsx` **(English homepage only)** | `Individual coaching at CVB Coaching` |
| `/supermeeting.png` | `src/app/en/page.tsx` **(English homepage only)** | `Business coaching in a confidential session` |

The Swedish homepage references no photographic imagery; the English homepage still
references the three assets above. The two coaching path cards carry no image in either
locale.

Files present in `public/` whose filenames may communicate workshop, team, executive or
corporate positioning, regardless of whether they are currently referenced:

- `business-coaching-workshop.jpg` — not referenced at HEAD
- `business-coaching.jpg` — not referenced at HEAD (byte-identical to `business-coaching-workshop.jpg`)
- `supermeeting.png` — referenced by `/en` only
- `superoffice.png` — referenced by `/en` only
- `supertable.png` — referenced by `/en` only
- `section-vad-forsa-hjalper-med.png` — not referenced at HEAD (retains the former "Forsa" brand name)
- `section-cta-prelude.png` — not referenced at HEAD
- `superhero.png`, `superhero1.png` — not referenced at HEAD
- `individuell-coaching.jpg` — not referenced at HEAD


---

## File: src/app/layout.tsx

### Affected route(s)
shared — all routes

### Public-facing purpose
Root layout: site-wide metadata (title, description), fonts, JSON-LD injection, global navigation and footer mount.

### Current source

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import SiteFooter from "@/components/site-footer";
import SiteShell from "@/components/site-shell";
import JsonLd, { professionalServiceSchema } from "@/components/json-ld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CVB Coaching – individuell coaching och business coaching i Göteborg",
  description:
    "CVB Coaching i Göteborg. Individuell coaching för dig som står inför ett vägval, och business coaching för medarbetare, ledare och team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-100 text-zinc-900">
        <JsonLd data={professionalServiceSchema} />
        <SiteShell>{children}</SiteShell>
        <SiteFooter />
      </body>
    </html>
  );
}
```

---

## File: next.config.ts

### Affected route(s)
shared — /executive-coaching, /ledningsgruppscoaching, /team-coaching, /coachande-ledarskap and their /en equivalents, /om-forsa, /portal/*

### Public-facing purpose
Permanent 308 redirects mapping retired public service routes onto the two remaining coaching paths.

### Current source

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Varumärkesbytet Forsa → CVB Coaching: bevara gamla länkar.
      { source: "/om-forsa", destination: "/om-oss", permanent: true },
      { source: "/en/om-forsa", destination: "/en/om-oss", permanent: true },
      // Produktnamnet CVB Base: /portal är inte längre en renderad route,
      // men gamla bokmärken ska fortsätta fungera.
      { source: "/portal", destination: "/cvb-base", permanent: true },
      { source: "/portal/:path*", destination: "/cvb-base/:path*", permanent: true },
      // Det publika erbjudandet är två ingångar: individuell coaching och
      // business coaching. De tidigare specialistsidorna är sammanslagna
      // under business coaching, men gamla länkar ska fortsätta fungera.
      { source: "/executive-coaching", destination: "/business-coaching", permanent: true },
      { source: "/ledningsgruppscoaching", destination: "/business-coaching", permanent: true },
      { source: "/team-coaching", destination: "/business-coaching", permanent: true },
      { source: "/coachande-ledarskap", destination: "/business-coaching", permanent: true },
      { source: "/en/executive-coaching", destination: "/en/business-coaching", permanent: true },
      { source: "/en/ledningsgruppscoaching", destination: "/en/business-coaching", permanent: true },
      { source: "/en/team-coaching", destination: "/en/business-coaching", permanent: true },
      { source: "/en/coachande-ledarskap", destination: "/en/business-coaching", permanent: true },
    ];
  },
};

export default nextConfig;
```

---

## File: src/app/page.tsx

### Affected route(s)
/

### Public-facing purpose
Swedish homepage: hero, two coaching paths, Carolina, when coaching fits, fit/not-fit, what the work consists of, process, post-process booking CTA, CVB Base support, company buyer, practical, final booking.

### Current source

```tsx
import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import SiteNavigation from "@/components/site-navigation";
import HeroReveal from "@/components/animations/HeroReveal";
import HeroVideoBackground from "@/components/hero-video-background";
import ParallaxController from "@/components/animations/ParallaxController";
import ScrollReveal from "@/components/animations/ScrollReveal";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import CoachingServicesGrid from "@/components/coaching-services-grid";
import EngagementSection from "@/components/engagement-section";
import KineticTeamHybrid from "@/components/ui/kinetic-team-hybrid";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";

export const metadata: Metadata = {
  title: "CVB Coaching – individuell coaching och business coaching i Göteborg",
  description:
    "CVB Coaching i Göteborg. Individuell coaching för dig som står inför ett vägval, och business coaching för medarbetare och ledare i arbetslivet.",
};

const t = svDictionary;

const relevancePoints = [
  "Du står inför ett vägval och behöver förstå vad som faktiskt är viktigt för dig.",
  "Du har fått ett nytt ansvar eller befinner dig i en förändring i arbetslivet.",
  "Du vet att något behöver förändras, men ser ännu inte hur du vill gå vidare.",
  "Du behöver fatta ett beslut utan att ha alla svar ännu.",
  "Du vill prata fritt, i förtroende och utanför din egen krets.",
];

const passarNär = [
  "Frågan angår dig på riktigt, inte bara på pappret.",
  "Du vill tänka färdigt själv, inte få ett färdigt svar.",
  "Det behöver ske utanför den egna kretsen, i förtroende.",
  "Något ska förändras, inte bara diskuteras.",
];

const mindreRelevant = [
  "Du söker en expert som bedömer läget och talar om vad du ska göra.",
  "Frågan handlar om ohälsa eller behöver behandlas. Då är terapi rätt väg, inte coaching.",
  "Riktningen är redan bestämd och det som återstår är att verkställa.",
];


export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <ParallaxController>
      <section
        data-hero-sticky
        className="relative z-0 h-[100svh] min-h-[100svh] w-full overflow-hidden md:sticky md:top-0"
      >
        <HeroVideoBackground />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" aria-hidden="true" />
        <SiteNavigation />
        <div className="pointer-events-none absolute inset-0 z-[2]">
          <div className="pointer-events-auto flex min-h-full flex-col items-center px-6 pb-[max(clamp(2.5rem,8svh,4.5rem),env(safe-area-inset-bottom,0px))] md:absolute md:left-[5.5vw] md:top-[66%] md:min-h-0 md:max-w-md md:-translate-y-1/2 md:items-start md:justify-start md:px-0 md:pb-0 md:pt-0 lg:max-w-lg">
            <div
              className="w-full shrink-0 min-h-[min(38svh,22rem)] md:hidden"
              aria-hidden="true"
            />
            <HeroReveal className="relative flex w-full max-w-[22rem] shrink-0 flex-col items-center text-center sm:max-w-[24rem] md:max-w-lg md:items-start md:text-left lg:max-w-xl">
              <div className="relative w-full md:max-w-lg lg:max-w-xl">
                <h1
                  data-hero-headline
                  className="relative mx-auto max-w-[18ch] text-4xl font-medium leading-[1.1] tracking-tight text-balance text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-5xl md:mx-0 md:max-w-none md:text-6xl md:leading-[1.08] lg:text-7xl"
                >
                  Det finns frågor man inte tänker färdigt ensam.
                </h1>
              </div>
              <p
                data-hero-body
                className="mt-6 max-w-[34ch] text-[1.0625rem] font-[450] leading-[1.6] text-balance text-white/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)] md:mt-7 md:max-w-[46ch] md:text-lg"
              >
                Personlig coaching med Carolina von Braun — för dig som står i ett vägval, en
                förändring eller en fråga i arbetslivet.
              </p>
              <div className="mt-9 flex w-full flex-col items-center gap-4 md:mt-10 md:w-fit md:flex-row md:flex-wrap md:items-start md:justify-start md:gap-3.5">
                <span data-hero-cta className="inline-flex justify-center">
                  <CtaLink href="/kontakt" variant="primary" translucent>
                    Boka ett inledande samtal
                  </CtaLink>
                </span>
                <span data-hero-cta className="inline-flex justify-center">
                  <CtaLink href="/#coaching" variant="secondary" translucent>
                    {t.cta.secondary}
                  </CtaLink>
                </span>
              </div>
              <p
                data-hero-cta
                className="mt-5 text-[0.8125rem] leading-[1.6] text-white/75 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]"
              >
                Ett första samtal är konfidentiellt. Du behöver inte ha formulerat allt.
              </p>
            </HeroReveal>
          </div>
        </div>
      </section>

      <div className="relative z-10 isolate bg-zinc-100">
      <div className="mx-auto max-w-6xl px-6 pb-24 md:px-10">

        <section
          id="coaching"
          data-parallax-section
          className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white py-20 md:py-24"
        >
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <h2 className="max-w-3xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Två vägar in
            </h2>
            <p className="mt-6 max-w-2xl text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
              Samma arbetssätt, två sammanhang: för dig själv eller i arbetslivet.
            </p>
            <div className="mt-14">
              <CoachingServicesGrid locale="sv" />
            </div>
            <p className="mt-10 max-w-2xl text-[0.9375rem] leading-[1.7] text-zinc-600">
              Är du osäker på vilken väg som passar? Det avgör vi tillsammans i det första samtalet.
            </p>
          </div>
        </section>

        <KineticTeamHybrid />

        <section data-parallax-section className="relative z-10 bg-zinc-100 py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              När coaching kan vara rätt
            </h2>
            <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
              <ScrollReveal variant="staggerList" className="mt-0">
                <ul className="space-y-5 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800">
                  {relevancePoints.map((point) => (
                    <li key={point} data-list-item className="flex items-start gap-4">
                      <span className="mt-[0.7rem] h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-section className="py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Så vet du om det här är rätt
            </h2>
            <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
              <ScrollReveal variant="staggerList">
                <h3 className="text-lg font-medium text-zinc-900">Passar när</h3>
                <ul className="mt-4 space-y-3 text-[1.0625rem] leading-[1.7] text-zinc-800">
                  {passarNär.map((item) => (
                    <li key={item} data-list-item className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <h3 className="mt-8 text-lg font-medium text-zinc-900">Mindre rätt när</h3>
                <ul className="mt-4 space-y-3 text-[1.0625rem] leading-[1.7] text-zinc-700">
                  {mindreRelevant.map((item) => (
                    <li key={item} data-list-item className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-400" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </section>

        <section
          data-parallax-section
          className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white py-20 md:py-24"
        >
          <EditorialRowsReveal className="mx-auto max-w-6xl px-6 md:px-10">
          <h2
            data-section-heading
            className="max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]"
          >
            Vad arbetet består av
          </h2>
          <div className="mt-16 border-y border-line-accent/30">
            <article data-editorial-row className="border-b border-line-accent/30 py-12 md:py-14">
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p data-row-index className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400">01</p>
                <h3 data-row-title className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]">Klarhet</h3>
                <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl">
                  Jag hjälper dig att sortera vad frågan faktiskt handlar om och vad som är
                  viktigast för dig.
                </p>
              </div>
            </article>
            <article data-editorial-row className="border-b border-line-accent/30 py-12 md:py-14">
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p data-row-index className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400">02</p>
                <h3 data-row-title className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]">Beslut</h3>
                <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl">
                  Jag hjälper dig att pröva dina alternativ och se vad du väljer, vad du väljer
                  bort och varför.
                </p>
              </div>
            </article>
            <article data-editorial-row className="py-12 md:py-14">
              <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                <p data-row-index className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400">03</p>
                <h3 data-row-title className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]">Riktning</h3>
                <p data-row-body className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl">
                  Du omsätter det du kommit fram till i nästa steg som fungerar i din vardag.
                </p>
              </div>
            </article>
          </div>
          </EditorialRowsReveal>
        </section>

        <EngagementSection locale="sv" />

        <section data-parallax-section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Du behöver inte veta allt från början
            </h2>
            <p className="mt-6 max-w-2xl text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800">
              Du behöver inte veta i förväg hur många samtal som behövs eller ha formulerat frågan
              helt. Det klarnar i det första samtalet.
            </p>
            <div className="mt-9">
              <CtaLink href="/kontakt" variant="primary">Boka ett inledande samtal</CtaLink>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-section className="border-t border-line-accent/30 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              Stöd mellan samtalen
            </h2>
            <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
              <p>
                Mellan samtalen kan det vara hjälpsamt att samla tankar och förbereda nästa steg.
                När det passar används CVB Base som ett enkelt stöd för reflektion och relevant
                material.
              </p>
              <p>
                Det gör det lättare att behålla sammanhanget i det du arbetar med — utan att ersätta
                det personliga samtalet.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-section className="py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              När företaget tar första kontakten
            </h2>
            <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
              <p>
                CVB Coaching arbetar med enskilda medarbetare och ledare i arbetslivet. Företaget kan
                ta den första kontakten och finansiera coachingen.
              </p>
              <p>
                Därefter sker coachingen i en personlig och konfidentiell relation mellan Carolina
                och klienten. I den första dialogen pratar jag med företaget om behovet, ramarna
                för samarbetet och hur kontakten fungerar.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-section className="py-20 md:py-24">
          <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
            <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
              I Göteborg eller digitalt
            </h2>
            <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
              <p>
                CVB Coaching finns i Göteborg. Samtalen hålls på plats eller digitalt, beroende på
                vad som passar bäst.
              </p>
              <p>Vad som sägs i samtalet stannar i samtalet.</p>
            </div>
          </ScrollReveal>
        </section>

        <section data-parallax-section id="kontakt" className="py-20 md:py-24">
          <ScrollReveal variant="ctaStack">
            <h2 data-cta-heading className="max-w-4xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.65rem]">
              Boka ett inledande samtal
            </h2>
            <p data-cta-body className="mt-8 max-w-3xl text-[1.125rem] font-[450] leading-[1.7] text-zinc-800">
              Berätta kort vad du vill prata om och välj en tid. Du behöver inte ha formulerat allt.
              Samtalet är konfidentiellt.
            </p>
            <div data-cta-actions className="mt-12 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">Boka ett inledande samtal</CtaLink>
            </div>
            <p data-cta-actions className="mt-5 text-[0.875rem] leading-[1.6] text-zinc-500">
              Personlig coaching · Konfidentiella samtal · Göteborg eller digitalt
            </p>
          </ScrollReveal>
        </section>

      </div>
      </div>
      </ParallaxController>
    </main>
  );
}
```

---

## File: src/app/individuell-coaching/page.tsx

### Affected route(s)
/individuell-coaching

### Public-facing purpose
Swedish Individual coaching service page including its page metadata.

### Current source

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Individuell coaching i Göteborg | CVB Coaching",
  description:
    "Individuell coaching hos CVB Coaching i Göteborg. För dig som står inför ett vägval, en förändring eller ett beslut som inte låter sig skjutas upp.",
};

const relevanceList = [
  "Du står inför ett val och kommer inte fram på egen hand.",
  "Något har tagit slut och nästa sak har inte tagit form.",
  "Du gör allt du brukar göra och rör dig ändå inte framåt.",
  "Rollen eller livet har växt fortare än sättet du hanterar det på.",
  "Du vet vad du borde göra, men gör det inte.",
];

const focusList = [
  "Vägval och beslut som får konsekvenser en tid framåt.",
  "Övergångar: ny roll, ny fas, nytt sammanhang.",
  "Riktning när flera alternativ ser rimliga ut.",
  "Vanor och mönster som kostar mer än de ger.",
  "Arbete, karriär och rollens gränser.",
  "Nya perspektiv på något du redan vänt på länge.",
];

const nonGoals = [
  "Inte terapi eller behandling. Handlar frågan om ohälsa är terapi rätt väg, och det säger jag då.",
  "Inte rådgivning. Jag tar inte över dina beslut och ger dig inte min uppfattning som facit.",
  "Inte peppning. Du får motstånd när det behövs, inte tillrop.",
];

const valueList = [
  "Du vet vad frågan faktiskt gäller, inte bara hur den känns.",
  "Du fattar beslutet i stället för att bära det.",
  "Du har ett sätt att tänka som håller även nästa gång.",
];

export default function IndividuellCoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Individuell coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Frågan är din. Strukturen är min.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Individuell coaching är ett samtal du bokar för egen räkning. Du tar med dig det som
              faktiskt upptar dig — ett vägval, en förändring, en fråga som inte släpper — och kommer
              längre med den än du gör på egen hand.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
              Betalas samtalen av en arbetsgivare, eller gäller frågan ett team, se{" "}
              <Link href="/business-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Business coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        {/* Two-col: premise */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Du har oftast redan svaret. Sällan i ordning.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Det som saknas är sällan information. Det är någon som ställer frågorna i rätt
                ordning och inte nöjer sig med det första svaret.
              </p>
              <p>
                Vänner vill ditt bästa. Kollegor är parter i frågan. Ett coachingsamtal har ingen
                åsikt om vad du väljer, bara intresse av att du väljer med öppna ögon.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List: relevance */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Lägen där det brukar låsa sig
          </h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {relevanceList.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        {/* Cards: focus */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Vad frågorna kan handla om
            </h2>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-2">
              {focusList.map((item) => (
                <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  {item}
                </div>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        {/* Two-col: how */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Så arbetar jag
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Samtalen är konfidentiella. Du sätter frågan, jag ställer den vidare tills den blir
                skarp. Vi arbetar med det du kan påverka och lämnar resten.
              </p>
              <p>
                Varje samtal avslutas med något konkret du tar med dig. Nästa gång börjar vi där —
                med vad som faktiskt hände, inte med vad som var tänkt.
              </p>
              <p>
                Hur många samtal det blir avgörs av frågan. Ibland räcker ett. Ibland behövs en
                följeslagare över en längre period.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List: non-goals */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vad det inte är</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {nonGoals.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        {/* Cards: value */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vad du tar med dig</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {valueList.map((item, index) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        {/* Two-col: engagement */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Ett coachingsamarbete över tid
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                När frågan behöver följas över tid gör vi coachingen till ett samarbete med en
                överenskommen ram. Du och jag kommer överens om vad arbetet ska handla om, och över
                hur lång period vi arbetar, innan vi börjar.
              </p>
              <p>
                Samtalen planerar vi tillsammans och fördelar över perioden. De följer inget fast
                schema — vi lägger dem där de gör mest nytta, och flyttar dem när det du arbetar med
                kräver något annat.
              </p>
              <p>
                Under perioden stämmer vi av om fokus fortfarande stämmer eller om frågan har flyttat
                sig. Och samarbetet får ett medvetet avslut, ett sista samtal där vi går igenom vad
                perioden gav och vad du tar vidare på egen hand.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Nästa steg
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Skriv några rader om vad du vill ta upp, och välj en tid som passar.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">
                Boka ett första samtal
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
```

---

## File: src/app/business-coaching/page.tsx

### Affected route(s)
/business-coaching

### Public-facing purpose
Swedish Business coaching service page including its page metadata.

### Current source

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Business coaching i Göteborg | CVB Coaching",
  description:
    "Business coaching hos CVB Coaching i Göteborg. Coaching i arbetslivet, enskilt med en medarbetare eller ledare, eller tillsammans med ett team.",
};

const relevanceList = [
  "Ett vägval ska avgöras innan informationen är komplett.",
  "Ansvaret i en roll har vuxit fortare än mandatet.",
  "Prioriteringarna skiftar oftare än verksamheten hinner ställa om.",
  "Beslut fattas i rummet men tappar kraft i vardagen.",
  "Friktion finns men benämns inte, och sänker tempot utan adressat.",
  "En nyckelperson ska bära mer och behöver någon att tänka med.",
];

const nonGoals = [
  "Inte managementkonsultation. Inga färdiga rekommendationer, och besluten förblir era.",
  "Inte teambuilding eller övningar utan koppling till verkligt arbete.",
  "Inte en engångsinsats som lämnas utan uppföljning.",
];

const processList = [
  "Ett första samtal, konfidentiellt. Vi avgör tillsammans om frågan hör hemma här.",
  "Mål, omfattning och sekretess är överenskomna innan arbetet börjar.",
  "Vad som återkopplas till beställaren bestäms i förväg.",
  "Avstämning mot målen under uppdragets gång.",
  "Avslut mot de mål som sattes vid start, och beslut om fortsättning eller avslut.",
];

const valueList = [
  "Kortare väg från diskussion till fattat beslut.",
  "Ansvar som är uttalat i stället för underförstått.",
  "Beslut som håller hela vägen ut i vardagen.",
];

export default function BusinessCoachingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Business coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Beslut som bär längre än till nästa möte.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Business coaching är coaching i ett sammanhang där någon annan än deltagaren betalar,
              och där besluten också ska hålla i organisationen. Det gäller enskilda medarbetare och
              ledare lika väl som team.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
              Söker du coaching för egen räkning, se{" "}
              <Link href="/individuell-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Individuell coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        {/* Two-col: premise */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Kompetensen finns. Utrymmet att tänka gör det inte alltid.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                I en organisation är varje intern samtalspartner också part i frågan. Det gör det
                svårt att pröva ett resonemang innan det blir ett besked.
              </p>
              <p>
                Det är den funktionen CVB Coaching fyller: en utomstående som inte har något att
                vinna på vilket beslut ni landar i, bara på att det är genomtänkt.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* List: relevance */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Sex lägen där det gör störst skillnad
          </h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {relevanceList.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        {/* List: process */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Så ser ett uppdrag ut
            </h2>
            <div data-col-right className="md:col-span-7">
              <ScrollReveal variant="staggerList">
                <ul className="space-y-3 text-lg leading-8 text-zinc-700">
                  {processList.map((item) => (
                    <li key={item} data-list-item className="flex items-start gap-3">
                      <span className="mt-3.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </section>

        {/* List: non-goals */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vad det inte är</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {nonGoals.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        {/* Cards: value */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Förväntat utfall</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {valueList.map((item, index) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        {/* Two-col: engagement */}
        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Ett coachingsamarbete över tid
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Ett uppdrag löper över en överenskommen period, och upplägget är detsamma oavsett om
                jag arbetar med en medarbetare, en ledare eller ett team. Det är sammanhanget som
                skiljer, inte arbetssättet.
              </p>
              <p>
                Samtalen planerar vi tillsammans och fördelar över perioden. De följer inget fast
                schema — vi lägger dem där de gör mest nytta, och flyttar dem när verksamheten kräver
                det. Ramen är överenskommen, innehållet är ert.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Nästa steg
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Beskriv kort vilken fråga som ligger på bordet. Samtalet är konfidentiellt.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">
                Boka ett första samtal
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
```

---

## File: src/app/om-oss/page.tsx

### Affected route(s)
/om-oss

### Public-facing purpose
Swedish About Carolina page: biography, principles, confidentiality, audiences, Person JSON-LD mount.

### Current source

```tsx
import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";

export const metadata: Metadata = {
  title: "Carolina von Braun – coach i Göteborg | CVB Coaching",
  description:
    "Carolina von Braun driver CVB Coaching i Göteborg. Kommersiell bakgrund från kapitalmarknad och styrelsearbete, diplomerad coach vid Gothia Akademi.",
};

const t = svDictionary;

const principles = [
  "Konfidentialitet.",
  "Frågor före råd. Du äger dina slutsatser.",
  "Precision framför uppmuntran.",
  "Uppföljning tills något faktiskt har hänt.",
];

const audiences = [
  "Privatpersoner som står inför ett vägval, en förändring eller ett beslut som väger.",
  "Ledare och medarbetare som behöver tänka klart med någon utanför organisationen.",
  "Team där ansvar, prioritering och beslut behöver skärpas.",
];

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <JsonLd data={carolinaPersonSchema} />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Om Carolina
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Personen du ska ha samtalen med.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Att välja coach är att välja vem man tänker högt inför. Här är vad du behöver veta om
              mig för att avgöra om det ska vara jag.
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Varför CVB Coaching finns
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                De flesta av oss har människor omkring oss som vill väl. Färre har någon vars enda
                uppgift är att hjälpa oss tänka färdigt, utan att ha en åsikt om utgången.
              </p>
              <p>
                CVB Coaching finns för att göra den platsen tillgänglig — för den som kommer på egen
                hand och för den som kommer genom sitt arbete.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <div data-col-left className="md:col-span-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#92753a]">
                Coach
              </p>
              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight">
                Carolina von Braun
              </h2>
              <p className="mt-3 text-lg leading-8 text-zinc-600">CVB Coaching, Göteborg</p>
            </div>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Carolina von Braun heter jag som driver CVB Coaching i Göteborg och är utbildad och
                diplomerad coach vid Gothia Akademi genom ICF-ackrediterad coachutbildning på Level 1
                och Level 2.
              </p>
              <p>
                Bakgrunden omfattar värdepappershandel på Nordea, styrelseuppdrag inom
                fastighetsförvaltning och investeringar samt studier i marknadsföring vid
                Handelshögskolan vid Göteborgs universitet. Erfarenheten ger en affärsmässig
                förståelse för situationer där ansvar, vägval och konsekvenser behöver vägas mot
                varandra.
              </p>
              <p>
                I coachingen är rollerna tydliga: klienten äger sina mål, insikter och beslut. CVB
                Coachings uppgift är att skapa skärpa i tänkandet, utmana perspektiv och föra
                samtalet framåt utan att ta över slutsatserna.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Principer
            </h2>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-2">
              {principles.map((item, index) => (
                <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                  {item}
                </div>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Konfidentialitet
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>Vad som sägs i samtalet behandlas konfidentiellt.</p>
              <p>
                När samtalen beställs av någon annan än deltagaren kommer vi överens om vad som
                återkopplas, innan arbetet börjar.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vilka jag arbetar med</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {audiences.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Göteborg, eller digitalt när det passar bättre
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                CVB Coaching finns i Göteborg. Samtalen hålls på plats eller digitalt, och var du
                befinner dig avgör inte om det fungerar.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Nästa steg
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Skriv några rader om vad du vill ta upp, och välj en tid som passar.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">{t.cta.primary}</CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
```

---

## File: src/app/kontakt/page.tsx

### Affected route(s)
/kontakt

### Public-facing purpose
Swedish contact and booking page: hero, intake form mount, process FAQ content.

### Current source

```tsx
import type { Metadata } from "next";
import ContactIntakeForm from "@/components/contact-intake-form";
import ContactPageScrollReset from "@/components/contact-page-scroll-reset";
import ProcessFaq, { type ProcessFaqItem } from "@/components/process-faq";
import HeroReveal from "@/components/animations/HeroReveal";

export const metadata: Metadata = {
  title: "Boka ett första samtal | CVB Coaching",
  description:
    "Boka ett kort och kostnadsfritt telefonsamtal där vi stämmer av om coaching är rätt stöd. Samtalet är konfidentiellt, oavsett om du kommer på egen hand eller genom din arbetsgivare.",
};

const processFaq: ProcessFaqItem[] = [
  {
    question: "Vad är det första samtalet?",
    answer:
      "Det första samtalet är ett kort och kostnadsfritt telefonsamtal. Du berättar lite om vad du söker, och vi känner efter om coaching är rätt väg och om det känns rätt att arbeta tillsammans. Det är inte en coachingsession och du förbinder dig inte till något.",
  },
  {
    question: "Vad händer om vi vill gå vidare?",
    answer:
      "Om vi båda vill gå vidare pratar vi igenom vad du vill arbeta med och hur vårt coachingsamarbete kan se ut. Vi kommer överens om omfattning, praktiskt upplägg och pris innan vi börjar.",
  },
  {
    question: "Hur börjar coachingsamarbetet?",
    answer:
      "När vi har kommit överens om hur vi vill arbeta tillsammans får du en personlig bekräftelse från mig och vi planerar vårt första coachingsamtal. Du får också tillgång till CVB Base, där vi samlar det som hör till vårt arbete tillsammans.",
  },
  {
    question: "Vad är CVB Base?",
    answer:
      "CVB Base är en del av hur jag arbetar med mina klienter. Där kan du samla reflektioner, förbereda sådant du vill ta med till nästa samtal och återvända till sådant vi tidigare har arbetat med. På så sätt finns sammanhanget kvar även mellan våra samtal.",
  },
  {
    question: "Hur arbetar du med företag?",
    answer:
      "Jag arbetar med företag genom individuella coachingsamarbeten med personer i verksamheten. Det kan börja med en person och vid behov utökas med fler. Varje samarbete är separat, och innan vi börjar är vi tydliga med vem som betalar och vad som, om något, ska återkopplas till beställaren.",
  },
  {
    question: "Måste jag bestämma mig efter det första samtalet?",
    answer:
      "Nej. Det första samtalet är till för att vi båda ska kunna känna efter om det här är rätt. Vi går bara vidare om det känns bra och relevant för oss båda.",
  },
];

export default function KontaktPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f6f6f4] text-zinc-900">
      <ContactPageScrollReset />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        <section className="relative overflow-hidden border-b border-zinc-300/80 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Kontakt
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Börja med ett samtal.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Välj en tid som passar och skriv några rader om vad du vill ta upp. Det första samtalet
              är ett kort, kostnadsfritt telefonsamtal där vi stämmer av om coaching är rätt stöd och
              om vi vill gå vidare tillsammans.
            </p>
          </HeroReveal>
        </section>

        <section className="py-16 md:py-20">
          <div className="space-y-16 md:space-y-20">
            <div className="max-w-5xl">
              <ContactIntakeForm />
            </div>

            <aside className="max-w-2xl border-t border-line-accent/30 pt-12 md:pt-16">
              <ProcessFaq heading="Vad händer efter att du bokat?" items={processFaq} />
            </aside>
          </div>
        </section>

      </div>
    </main>
  );
}
```

---

## File: src/app/en/page.tsx

### Affected route(s)
/en

### Public-facing purpose
English homepage.

### Current source

```tsx
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import SiteNavigation from "@/components/site-navigation";
import HeroReveal from "@/components/animations/HeroReveal";
import HeroVideoBackground from "@/components/hero-video-background";
import ParallaxController from "@/components/animations/ParallaxController";
import ScrollReveal from "@/components/animations/ScrollReveal";
import EditorialRowsReveal from "@/components/animations/EditorialRowsReveal";
import EditorialImageTransition from "@/components/animations/EditorialImageTransition";
import CoachingServicesGrid from "@/components/coaching-services-grid";
import EngagementSection from "@/components/engagement-section";
import type { Metadata } from "next";

import { enDictionary } from "@/lib/i18n/dictionaries/en";

export const metadata: Metadata = {
  title: "CVB Coaching – individual and business coaching in Gothenburg",
  description:
    "CVB Coaching in Gothenburg. Individual coaching for anyone facing a choice or a change, and business coaching for employees, leaders and teams.",
};

const relevancePoints = [
  "A choice has to be made before you know enough.",
  "You are doing everything you normally do and still are not moving.",
  "The role has grown faster than the mandate.",
  "Something has ended — a job, a project, a way of working — and the next thing has not taken shape.",
  "Priorities shift more often than the organisation can adjust.",
  "Decisions are made in the room but lose force in day-to-day work.",
];

const rightFitWhen = [
  "The question genuinely matters to you, not just on paper.",
  "You want to finish the thinking yourself, not be handed an answer.",
  "It needs to happen outside your own circle, in confidence.",
  "Something is meant to change, not only be discussed.",
];

const lessSuitedWhen = [
  "You want an expert to assess the situation and tell you what to do.",
  "The question concerns ill health or needs treatment. Therapy is the right route then, not coaching.",
  "The direction is already set and what remains is carrying it out.",
];

const t = enDictionary;

export default function HomePageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <ParallaxController>
        <section
          data-hero-sticky
          className="relative z-0 h-[100svh] min-h-[100svh] w-full overflow-hidden md:sticky md:top-0"
        >
          <HeroVideoBackground />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" aria-hidden="true" />
          <SiteNavigation />
          <div className="pointer-events-none absolute inset-0 z-[2]">
            <div className="pointer-events-auto flex min-h-full flex-col items-center px-6 pb-[max(clamp(2.5rem,8svh,4.5rem),env(safe-area-inset-bottom,0px))] md:absolute md:left-[5.5vw] md:top-[66%] md:min-h-0 md:max-w-md md:-translate-y-1/2 md:items-start md:justify-start md:px-0 md:pb-0 md:pt-0 lg:max-w-lg">
              <div
                className="w-full shrink-0 min-h-[min(38svh,22rem)] md:hidden"
                aria-hidden="true"
              />
              <HeroReveal className="relative flex w-full max-w-[22rem] shrink-0 flex-col items-center text-center sm:max-w-[24rem] md:max-w-lg md:items-start md:text-left lg:max-w-xl">
                <div className="relative w-full md:max-w-lg lg:max-w-xl">
                  <h1
                    data-hero-headline
                    className="relative mx-auto max-w-[18ch] text-4xl font-medium leading-[1.1] tracking-tight text-balance text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-5xl md:mx-0 md:max-w-none md:text-6xl md:leading-[1.08] lg:text-7xl"
                  >
                    Some questions are difficult to think through alone.
                  </h1>
                </div>
                <div className="mt-9 flex w-full flex-col items-center gap-4 md:mt-10 md:w-fit md:flex-row md:flex-wrap md:items-start md:justify-start md:gap-3.5">
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/en/kontakt" variant="primary" translucent>
                      {t.cta.primary}
                    </CtaLink>
                  </span>
                  <span data-hero-cta className="inline-flex justify-center">
                    <CtaLink href="/en#coaching" variant="secondary" translucent>
                      {t.cta.secondary}
                    </CtaLink>
                  </span>
                </div>
              </HeroReveal>
            </div>
          </div>
        </section>

        <div className="relative z-10 isolate bg-zinc-100">
          <div className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
            <section
              data-hero-reveal-first
              className="relative bg-gradient-to-b from-[#f8f7f4] via-zinc-100 to-[#f3f2ee] py-20 md:py-24"
            >
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16 md:gap-y-10">
                <h2
                  data-col-left
                  className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:pr-4 md:text-[2.1rem]"
                >
                  You will be working with me.
                </h2>
                <div
                  data-col-right
                  className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end"
                >
                  <p data-col-paragraph>
                    I am Carolina von Braun, and I run CVB Coaching in Gothenburg. Before becoming a
                    coach, I worked in capital markets and served on company boards. That experience
                    means I recognise situations where decisions carry real consequences.
                  </p>
                  <p data-col-paragraph>
                    As a coach the job is a different one: to make the thinking clearer, not to take
                    over your conclusions.{" "}
                    <Link
                      href="/en/om-oss"
                      className="underline underline-offset-4 decoration-zinc-400 transition-colors hover:text-zinc-950 hover:decoration-zinc-700"
                    >
                      More about me
                    </Link>
                    .
                  </p>
                </div>
              </ScrollReveal>
            </section>

            <section
              id="coaching"
              data-parallax-section
              className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white pt-20 pb-0 md:pt-24"
            >
              <div className="mx-auto max-w-6xl px-6 md:px-10">
                <h2 className="max-w-3xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Two ways in
                </h2>
                <p className="mt-6 max-w-2xl text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                  The same approach, in two settings: personal or professional.
                </p>
                <div className="mt-14">
                  <CoachingServicesGrid locale="en" />
                </div>
              </div>
              <EditorialImageTransition
                src="/supertable.png"
                alt="Preparing for a coaching session"
                className="mt-20 md:mt-24"
              />
            </section>

            <section data-parallax-section className="relative z-10 bg-zinc-100 py-20 md:py-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Six situations where coaching belongs
                </h2>
                <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
                  <ScrollReveal variant="staggerList" className="mt-0">
                    <ul className="space-y-5 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800">
                      {relevancePoints.map((point) => (
                        <li key={point} data-list-item className="flex items-start gap-4">
                          <span className="mt-[0.7rem] h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollReveal>
                </div>
              </ScrollReveal>
            </section>

            <section data-parallax-section className="py-20 md:py-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  How to tell whether this is right
                </h2>
                <div data-col-right className="md:col-span-7 md:max-w-xl md:justify-self-end">
                  <ScrollReveal variant="staggerList">
                    <h3 className="text-lg font-medium text-zinc-900">Right fit when</h3>
                    <ul className="mt-4 space-y-3 text-[1.0625rem] leading-[1.7] text-zinc-800">
                      {rightFitWhen.map((point) => (
                        <li key={point} data-list-item className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <h3 className="mt-8 text-lg font-medium text-zinc-900">Less suited when</h3>
                    <ul className="mt-4 space-y-3 text-[1.0625rem] leading-[1.7] text-zinc-700">
                      {lessSuitedWhen.map((point) => (
                        <li key={point} data-list-item className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-400" aria-hidden />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollReveal>
                </div>
              </ScrollReveal>
            </section>

            <section
              data-parallax-section
              className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white py-20 md:py-24"
            >
              <EditorialRowsReveal className="mx-auto max-w-6xl px-6 md:px-10">
                <h2
                  data-section-heading
                  className="max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]"
                >
                  What the work involves
                </h2>
                <div className="mt-16 border-y border-line-accent/30">
                  <article
                    data-editorial-row
                    className="border-b border-line-accent/30 py-12 md:py-14"
                  >
                    <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                      <p
                        data-row-index
                        className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400"
                      >
                        01
                      </p>
                      <h3
                        data-row-title
                        className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]"
                      >
                        Clarity
                      </h3>
                      <p
                        data-row-body
                        className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                      >
                        The question you arrive with is rarely the one that decides anything. The
                        work begins by telling them apart.
                      </p>
                    </div>
                  </article>
                  <article
                    data-editorial-row
                    className="border-b border-line-accent/30 py-12 md:py-14"
                  >
                    <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                      <p
                        data-row-index
                        className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400"
                      >
                        02
                      </p>
                      <h3
                        data-row-title
                        className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]"
                      >
                        Decisions
                      </h3>
                      <p
                        data-row-body
                        className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                      >
                        A decision is tested before it is made. What you are weighing against what,
                        what you actually know, and what you are giving up.
                      </p>
                    </div>
                  </article>
                  <article data-editorial-row className="py-12 md:py-14">
                    <div className="grid gap-5 md:grid-cols-[3.25rem_minmax(0,11rem)_1fr] md:items-start md:gap-x-12 lg:gap-x-16">
                      <p
                        data-row-index
                        className="text-[0.6875rem] font-medium tabular-nums tracking-[0.32em] text-zinc-400"
                      >
                        03
                      </p>
                      <h3
                        data-row-title
                        className="text-xl font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.3125rem]"
                      >
                        Direction
                      </h3>
                      <p
                        data-row-body
                        className="text-[1.0625rem] font-[450] leading-[1.75] text-zinc-700 md:max-w-xl md:justify-self-end lg:max-w-2xl"
                      >
                        What matters happens between the sessions. We look at what you actually did,
                        not what you meant to do.
                      </p>
                    </div>
                  </article>
                </div>
              </EditorialRowsReveal>

            </section>

            <EngagementSection locale="en" />

            <section
              data-parallax-image-only
              className="relative left-1/2 z-[1] w-screen max-w-[100vw] -translate-x-1/2 bg-white"
            >
              <EditorialImageTransition
                src="/superoffice.png"
                alt="Individual coaching at CVB Coaching"
                breakout={false}
              />
            </section>

            <section data-parallax-section className="py-20 md:py-24">
              <ScrollReveal variant="splitColumn" className="grid gap-12 md:grid-cols-12 md:gap-x-16">
                <h2 data-col-left className="md:col-span-5 text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.1rem]">
                  Gothenburg, or online where that suits better
                </h2>
                <div data-col-right className="space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:max-w-xl md:justify-self-end">
                  <p>
                    CVB Coaching is based in Gothenburg. Sessions take place in person or online.
                  </p>
                  <p>What is said in the session is treated in confidence.</p>
                </div>
              </ScrollReveal>
            </section>

            <section data-parallax-image-only>
              <EditorialImageTransition
                src="/supermeeting.png"
                alt="Business coaching in a confidential session"
                className="mt-20 md:mt-24"
              />
            </section>

            <section data-parallax-section id="kontakt" className="py-20 md:py-24">
              <ScrollReveal variant="ctaStack">
                <h2 data-cta-heading className="max-w-4xl text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2.65rem]">
                  Next step
                </h2>
                <p data-cta-body className="mt-8 max-w-3xl text-[1.125rem] font-[450] leading-[1.7] text-zinc-800">
                  Write a few lines about what it concerns, and pick a time. The conversation is
                  confidential.
                </p>
                <div data-cta-actions className="mt-12 flex flex-wrap gap-4">
                  <CtaLink href="/en/kontakt" variant="primary">
                    {t.cta.primary}
                  </CtaLink>
                </div>
              </ScrollReveal>
            </section>
          </div>
        </div>
      </ParallaxController>
    </main>
  );
}
```

---

## File: src/app/en/individuell-coaching/page.tsx

### Affected route(s)
/en/individuell-coaching

### Public-facing purpose
English Individual coaching service page.

### Current source

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Individual coaching in Gothenburg | CVB Coaching",
  description:
    "Individual coaching at CVB Coaching in Gothenburg. For anyone facing a choice, a change or a decision that will not wait any longer.",
};

const relevanceList = [
  "You are facing a choice and cannot get to the end of it on your own.",
  "Something has ended and the next thing has not taken shape.",
  "You are doing everything you normally do and still are not moving.",
  "The role, or life, has grown faster than the way you are handling it.",
  "You know what you should do, and you are not doing it.",
];

const focusList = [
  "Choices and decisions that will shape the next stretch.",
  "Transitions: a new role, a new phase, a new setting.",
  "Direction when several options all look reasonable.",
  "Habits and patterns that cost more than they give.",
  "Work, career and the edges of a role.",
  "A different angle on something you have already turned over many times.",
];

const nonGoals = [
  "Not therapy or treatment. If the question is about ill health, therapy is the right route, and I will say so.",
  "Not advice. I will not take over your decisions or hand you my view as the answer.",
];

const outcomes = [
  "You know what the question is actually about, not only how it feels.",
  "You make the decision instead of carrying it.",
  "You have a way of thinking that holds up the next time too.",
];

export default function IndividualCoachingPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Individual coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              The question is yours. The structure is mine.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Individual coaching is a conversation you book for yourself. You bring whatever is
              actually taking up room — a choice, a change, a question that will not let go — and
              get further with it than you do alone.
            </p>
            <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600">
              If your employer is paying, or the question belongs to a team, see{" "}
              <Link href="/en/business-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Business coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              You usually have the answer. Rarely in order.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                What is missing is seldom information. It is someone who asks the questions in the
                right order and does not settle for the first answer.
              </p>
              <p>
                Friends want the best for you. Colleagues have a stake in the outcome. A coaching
                conversation has no view on what you choose, only an interest in you choosing with
                your eyes open.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Where things tend to get stuck
          </h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {relevanceList.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              What the questions can be about
            </h2>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-2">
              {focusList.map((item) => (
                <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  {item}
                </div>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              How I work
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Sessions are confidential. You set the question, I keep asking it until it gets
                sharp. We work with what you can affect and leave the rest.
              </p>
              <p>
                Every session ends with something concrete you take away. The next one starts there
                — with what actually happened, not with what was intended.
              </p>
              <p>
                How many sessions it takes depends on the question. Sometimes one is enough.
                Sometimes it is worth having someone alongside for a longer stretch.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">What it is not</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {nonGoals.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">What you take away</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {outcomes.map((item, index) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              A coaching collaboration over time
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                When a question needs following over time, we turn the coaching into a collaboration
                with an agreed frame. You and I settle what the work should focus on, and over what
                period we work, before we start.
              </p>
              <p>
                We plan the sessions together and spread them across the period. They follow no fixed
                schedule — we place them where they do the most good, and move them when what you are
                working on calls for something else.
              </p>
              <p>
                During the period we check whether the focus still holds or the question has moved.
                And the collaboration ends deliberately, with a final conversation about what the
                period gave you and what you carry on with on your own.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Next step
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Write a few lines about what you would like to bring, and pick a time that suits you.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/en/kontakt" variant="primary">
                Book an initial conversation
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}
```

---

## File: src/app/en/business-coaching/page.tsx

### Affected route(s)
/en/business-coaching

### Public-facing purpose
English Business coaching service page.

### Current source

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";

export const metadata: Metadata = {
  title: "Business coaching in Gothenburg | CVB Coaching",
  description:
    "Business coaching at CVB Coaching in Gothenburg. Coaching in working life, one to one with an employee or a leader, or together with a team.",
};

const relevanceList = [
  "A choice has to be settled before the information is complete.",
  "Accountability in a role has grown faster than the mandate.",
  "Priorities shift more often than the organisation can adjust.",
  "Decisions are made in the room but lose force in day-to-day work.",
  "Tension is there but never gets named, and it slows everything down.",
  "A key person is being asked to carry more and needs someone to think with.",
];

const nonGoals = [
  "Not management consulting. No ready-made recommendations, and the decisions stay yours.",
  "Not team-building or exercises detached from real work.",
];

const processList = [
  "A first conversation, in confidence. We work out together whether the question belongs here.",
  "Objectives, scope and confidentiality are agreed before the work begins.",
  "What is shared back with whoever commissioned the work is settled up front.",
  "Progress is reviewed against the objectives as the work goes on.",
  "The work closes against what was set out at the start, and you decide whether it continues.",
];

const outcomes = [
  "A shorter path from discussion to a decision made.",
  "Accountability that is spoken rather than assumed.",
  "Decisions that hold all the way into day-to-day work.",
];

export default function BusinessCoachingPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Business coaching
            </p>
            <h1 data-hero-headline className="mt-6 max-w-4xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Decisions that outlast the meeting.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Business coaching is coaching in a setting where someone other than the participant is
              paying, and where the decisions also have to hold in the organisation. That covers
              individual employees and leaders as much as teams.
            </p>
            <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-600">
              If you are booking for yourself, see{" "}
              <Link href="/en/individuell-coaching" className="underline underline-offset-2 hover:text-zinc-900">
                Individual coaching
              </Link>
              .
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              The experience is there. The space to think is not always.
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Inside an organisation, every conversation partner also has a stake in the question.
                That makes it hard to test an argument before it becomes an announcement.
              </p>
              <p>
                That is what CVB Coaching provides: an outside perspective with no stake in which
                decision you make — only in whether it has been properly thought through.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">
            Six situations where it makes the greatest difference
          </h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {relevanceList.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              How an engagement works
            </h2>
            <div data-col-right className="md:col-span-7">
              <ScrollReveal variant="staggerList">
                <ul className="space-y-3 text-lg leading-8 text-zinc-700">
                  {processList.map((item) => (
                    <li key={item} data-list-item className="flex items-start gap-3">
                      <span className="mt-3.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">What it is not</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {nonGoals.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Expected outcome</h2>
          <StaggerCards className="mt-8 grid gap-4 md:grid-cols-3">
            {outcomes.map((item, index) => (
              <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                {item}
              </div>
            ))}
          </StaggerCards>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              A coaching collaboration over time
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                An engagement runs over an agreed period, and the shape of it is the same whether I
                work with an employee, a leader or a team. What differs is the setting, not the way
                of working.
              </p>
              <p>
                We plan the sessions together and spread them across the period. They follow no fixed
                schedule — we place them where they do the most good, and move them when the business
                calls for it. The frame is agreed; the content is yours.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Next step
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Briefly describe the question on the table. The conversation is confidential.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/en/kontakt" variant="primary">
                Book an initial conversation
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}
```

---

## File: src/app/en/om-oss/page.tsx

### Affected route(s)
/en/om-oss

### Public-facing purpose
English About Carolina page.

### Current source

```tsx
import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Carolina von Braun – coach in Gothenburg | CVB Coaching",
  description:
    "Carolina von Braun runs CVB Coaching in Gothenburg. A commercial background from capital markets and board work, and a coaching qualification from Gothia Akademi.",
};

const principles = [
  "Confidentiality, without exception.",
  "Questions before advice. The conclusions stay yours.",
  "Precision rather than encouragement.",
  "Follow-up until something has actually happened.",
];

const audiences = [
  "Private clients facing a choice, a change or a decision that carries weight.",
  "Leaders and employees who need to think clearly with someone outside the organisation.",
  "Teams where accountability, priorities and decisions need sharpening.",
];

export default function AboutPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <JsonLd data={carolinaPersonSchema} />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              About Carolina
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Who you choose to think out loud with matters.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Here is what you need to know to decide whether I am the right coach for you.
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Why CVB Coaching exists
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Most of us have people around us who mean well. Fewer have someone whose only job is
                to help us finish the thinking, without holding a view on how it ends.
              </p>
              <p>
                CVB Coaching exists to make that available — to people who come on their own, and to
                people who come through their work.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <div data-col-left className="md:col-span-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#92753a]">Coach</p>
              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight">
                Carolina von Braun
              </h2>
              <p className="mt-3 text-lg leading-8 text-zinc-600">CVB Coaching, Gothenburg</p>
            </div>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                My name is Carolina von Braun. I run CVB Coaching in Gothenburg and am a trained,
                qualified coach at Gothia Akademi through ICF-accredited coach training at Level 1 and
                Level 2.
              </p>
              <p>
                My background includes securities trading at Nordea, board assignments in property
                management and investments, and studies in marketing at the School of Business,
                Economics and Law, University of Gothenburg. That experience gives a commercially
                grounded understanding of situations where responsibility, choices and consequences
                need to be weighed against each other.
              </p>
              <p>
                In coaching the roles are clear: the client owns their goals, insights and decisions.
                CVB Coaching&apos;s task is to sharpen the thinking, challenge perspectives and move
                the conversation forward without taking over the conclusions.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Principles
            </h2>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-2">
              {principles.map((item, index) => (
                <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                  {item}
                </div>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Confidentiality
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>What is said in the session is treated in confidence.</p>
              <p>
                When the sessions are commissioned by someone other than the participant, we agree
                what is shared back before the work begins.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Who I work with</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {audiences.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Gothenburg, or online where that suits better
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                CVB Coaching is based in Gothenburg. Sessions take place in person or online.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Next step
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Write a few lines about what you would like to bring, and pick a time that suits you.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/en/kontakt" variant="primary">
                Book an initial conversation
              </CtaLink>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}
```

---

## File: src/app/en/kontakt/page.tsx

### Affected route(s)
/en/kontakt

### Public-facing purpose
English contact and booking page.

### Current source

```tsx
import type { Metadata } from "next";
import ContactIntakeForm from "@/components/contact-intake-form";
import ContactPageScrollReset from "@/components/contact-page-scroll-reset";
import ProcessFaq, { type ProcessFaqItem } from "@/components/process-faq";
import HeroReveal from "@/components/animations/HeroReveal";

export const metadata: Metadata = {
  title: "Book an initial conversation | CVB Coaching",
  description:
    "Book a short, free phone call to work out whether coaching is the right support. The conversation is confidential, whether you come on your own or through your employer.",
};

const processFaq: ProcessFaqItem[] = [
  {
    question: "What is the first conversation?",
    answer:
      "The first conversation is a short, free phone call. You tell me a little about what you are looking for, and we get a sense of whether coaching is the right path and whether it feels right to work together. It is not a coaching session, and you are not committing to anything.",
  },
  {
    question: "What happens if we want to go ahead?",
    answer:
      "If we both want to continue, we talk through what you would like to work on and what our coaching collaboration could look like. We agree on the scope, practical setup and price before we begin.",
  },
  {
    question: "How does the coaching collaboration start?",
    answer:
      "Once we have agreed on how we want to work together, you receive a personal confirmation from me and we plan our first coaching conversation. You will also get access to CVB Base, where we keep together what belongs to our work together.",
  },
  {
    question: "What is CVB Base?",
    answer:
      "CVB Base is part of how I work with my clients. There you can collect reflections, prepare what you want to bring to the next conversation and return to things we have worked on before. This helps keep the context connected between our conversations.",
  },
  {
    question: "What if a company is paying for the coaching?",
    answer:
      "You are still my client, and our conversations are about what you want to work on. Before we begin, we agree on who is paying and what, if anything, may be shared back with the purchaser.",
  },
  {
    question: "Do I have to decide after the first conversation?",
    answer:
      "No. The first conversation is there so we can both get a sense of whether this is right. We only move forward if it feels good and relevant for both of us.",
  },
];

export default function ContactPageEn() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f6f6f4] text-zinc-900">
      <ContactPageScrollReset />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <section className="relative overflow-hidden border-b border-zinc-300/80 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Contact
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Start with a conversation.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Pick a time that suits you and write a few lines about what you would like to bring.
              The first conversation is a short, free phone call where we work out whether coaching
              is the right support and whether we want to go ahead together.
            </p>
          </HeroReveal>
        </section>

        <section className="py-16 md:py-20">
          <div className="space-y-16 md:space-y-20">
            <div className="max-w-5xl">
              <ContactIntakeForm />
            </div>

            <aside className="max-w-2xl border-t border-line-accent/30 pt-12 md:pt-16">
              <ProcessFaq heading="What happens after you book?" items={processFaq} />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
```

---

## File: src/components/site-navigation.tsx

### Affected route(s)
shared — all public routes

### Public-facing purpose
Public header: primary nav labels, coaching mega menu, language switcher and client login entry point.

### Current source

```tsx
"use client";

import CtaLink from "@/components/cta-link";
import { LogoMark } from "@/components/brand/logo";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { motion, prefersReducedMotion, showTargets } from "@/lib/motion";
import { localeFromPathname, stripLocaleFromPath, toLocalePath, type Locale } from "@/lib/i18n/config";
import { getDictionaryForOptionalLocale } from "@/lib/i18n";

const coachingPaths = [
  "/individuell-coaching",
  "/business-coaching",
] as const;

type CursorPosition = { left: number; width: number; opacity: number };

const navCursorClass =
  "pointer-events-none absolute top-1 z-0 h-[calc(100%-0.5rem)] rounded-full bg-zinc-300/95 backdrop-blur-sm motion-reduce:transition-none transition-[left,width,opacity] duration-200 ease-out";

function navTabClass(isActive: boolean, overlay = false) {
  const ringOffset = overlay
    ? "focus-visible:ring-offset-2 focus-visible:ring-offset-white/40"
    : "focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100";
  const tone = isActive
    ? "text-zinc-950"
    : overlay
      ? "text-zinc-800 hover:text-zinc-950"
      : "text-zinc-700 hover:text-zinc-900";
  return `relative z-10 inline-flex cursor-pointer items-center rounded-full px-4 py-2 text-sm font-medium ${tone} ${ringOffset} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900`;
}

function syncCursorFromElement(
  el: HTMLElement | null,
  listEl: HTMLUListElement | null,
  setPosition: (position: CursorPosition) => void
) {
  if (!el || !listEl) return;
  setPosition({
    left: el.offsetLeft,
    width: el.offsetWidth,
    opacity: 1,
  });
}

function DesktopNavTabs({
  pathname,
  coachingActive,
  children,
}: {
  pathname: string;
  coachingActive: boolean;
  children: (api: {
    listRef: React.RefObject<HTMLUListElement | null>;
    setPosition: (position: CursorPosition) => void;
  }) => ReactNode;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState<CursorPosition>({ left: 0, width: 0, opacity: 0 });

  const restToActive = useCallback(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const active = listEl.querySelector<HTMLElement>('[data-nav-active="true"]');
    if (active) {
      syncCursorFromElement(active, listEl, setPosition);
      return;
    }
    setPosition((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  useEffect(() => {
    restToActive();
  }, [pathname, coachingActive, restToActive]);

  return (
    <ul
      ref={listRef}
      className="relative flex w-fit items-center gap-2 rounded-full p-1"
      onMouseLeave={restToActive}
    >
      {children({ listRef, setPosition })}
      <li
        aria-hidden="true"
        className={navCursorClass}
        style={{
          left: position.left,
          width: position.width,
          opacity: position.opacity,
        }}
      />
    </ul>
  );
}

function NavHoverTarget({
  listRef,
  setPosition,
  className,
  dataNavActive,
  children,
  ...props
}: {
  listRef: React.RefObject<HTMLUListElement | null>;
  setPosition: (position: CursorPosition) => void;
  className: string;
  dataNavActive?: boolean;
  children: ReactNode;
} & (
  | { as: "link"; href: string; "aria-current"?: "page" | undefined }
  | { as: "button"; type: "button"; "aria-expanded"?: boolean; "aria-controls"?: string }
)) {
  const itemRef = useRef<HTMLLIElement>(null);

  const handleEnter = () => {
    if (!itemRef.current) return;
    syncCursorFromElement(itemRef.current, listRef.current, setPosition);
  };

  return (
    <li
      ref={itemRef}
      data-nav-active={dataNavActive ? "true" : undefined}
      className="relative list-none"
      onMouseEnter={handleEnter}
      onFocus={handleEnter}
    >
      {props.as === "link" ? (
        <Link
          href={props.href}
          aria-current={props["aria-current"]}
          className={className}
          onFocus={handleEnter}
        >
          {children}
        </Link>
      ) : (
        <button
          type={props.type}
          aria-expanded={props["aria-expanded"]}
          aria-controls={props["aria-controls"]}
          className={className}
          onFocus={handleEnter}
        >
          {children}
        </button>
      )}
    </li>
  );
}

function NavChevron({ open }: { open?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={`h-2.5 w-2.5 shrink-0 opacity-75 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2.5 4.5 6 8 9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const mobileHeaderControlCluster =
  "flex shrink-0 items-center gap-0 rounded-full border border-zinc-900/10 bg-white/50 p-0.5 shadow-[0_1px_3px_rgba(24,24,27,0.08)] backdrop-blur-md";

const mobileHeaderIconButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-full text-zinc-800 transition-[color,background-color] duration-200 hover:bg-white/70 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/75 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

function LoginIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0 text-current"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" strokeLinecap="round" />
      <path d="M10 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12H3" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[1.125rem] w-[1.125rem] text-current"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
    >
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

const mobileHeaderLangTrigger =
  "inline-flex h-11 items-center gap-1 rounded-full px-3 text-[0.6875rem] font-medium tracking-[0.18em] text-zinc-800/90 transition-[color,background-color] duration-200 hover:bg-white/70 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/75 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

function MobileHeaderLanguageDropdown({
  locale,
  pathname,
}: {
  locale: Locale;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const t = getDictionaryForOptionalLocale(locale);

  const languageOptions: { code: Locale; shortLabel: string; ariaLabel: string }[] = [
    { code: "sv", shortLabel: "SV", ariaLabel: t.languageSwitcher.swedish },
    { code: "en", shortLabel: "EN", ariaLabel: t.languageSwitcher.english },
  ];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative px-0.5">
      <button
        type="button"
        aria-label={t.languageSwitcher.ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
        className={mobileHeaderLangTrigger}
      >
        {locale === "sv" ? "SV" : "EN"}
        <NavChevron open={open} />
      </button>
      <div
        id={menuId}
        role="listbox"
        aria-label={t.languageSwitcher.ariaLabel}
        className={`absolute right-0 top-[calc(100%+0.375rem)] z-[130] min-w-[4.5rem] overflow-hidden rounded-xl border border-zinc-900/10 bg-white/95 py-1 shadow-[0_8px_28px_-14px_rgba(24,24,27,0.28)] backdrop-blur-md ${
          open ? "block" : "hidden"
        }`}
      >
        {languageOptions.map((option) => {
          const isActive = locale === option.code;
          const optionClass =
            "block px-3 py-2 text-center text-[0.6875rem] font-medium tracking-[0.18em]";

          if (isActive) {
            return (
              <span
                key={option.code}
                role="option"
                aria-selected="true"
                aria-label={option.ariaLabel}
                className={`${optionClass} text-zinc-950`}
              >
                {option.shortLabel}
              </span>
            );
          }

          return (
            <Link
              key={option.code}
              href={toLocalePath(pathname, option.code)}
              role="option"
              aria-selected="false"
              aria-label={option.ariaLabel}
              onClick={() => setOpen(false)}
              className={`${optionClass} text-zinc-600 transition-colors hover:bg-zinc-100/80 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-900/40`}
            >
              {option.shortLabel}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const mobileNavLinkClass =
  "block rounded-md px-0.5 py-4 text-[1.0625rem] font-medium leading-[1.35] tracking-[-0.01em] text-zinc-900 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3]";

const mobileAudienceLinkClass =
  "block rounded-md py-3.5 pl-3 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3] aria-[current=page]:text-[#92753a]";

const mobileAudienceTitleClass =
  "block text-[0.9375rem] font-medium leading-[1.45] text-zinc-900 aria-[current=page]:text-[#92753a]";

const mobileAudienceDescClass = "mt-1 block text-sm leading-6 text-zinc-600";

function LanguageMenu({
  locale,
  onSelect,
  ariaLabel,
  align = "right",
}: {
  locale: Locale;
  onSelect: (nextLocale: Locale) => void;
  ariaLabel: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const alignClass = align === "left" ? "left-0" : "right-0";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/90 bg-zinc-700/90 px-3 py-1.5 text-xs font-medium tracking-wide text-white transition-colors hover:bg-zinc-600 hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100"
      >
        {locale === "en" ? "EN" : "SV"}
        <NavChevron open={open} />
      </button>
      <div
        id={menuId}
        role="menu"
        aria-label={ariaLabel}
        className={`absolute ${alignClass} z-[120] mt-2 min-w-[5rem] rounded-xl border border-zinc-900/20 bg-zinc-950/95 p-1.5 shadow-lg backdrop-blur ${
          open ? "block" : "hidden"
        }`}
      >
        <button
          type="button"
          role="menuitemradio"
          aria-checked={locale === "en"}
          onClick={() => {
            onSelect("en");
            setOpen(false);
          }}
          className={`block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium tracking-wide transition-colors ${
            locale === "en" ? "bg-zinc-800 text-white" : "text-zinc-200 hover:bg-zinc-800/70"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          role="menuitemradio"
          aria-checked={locale === "sv"}
          onClick={() => {
            onSelect("sv");
            setOpen(false);
          }}
          className={`block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium tracking-wide transition-colors ${
            locale === "sv" ? "bg-zinc-800 text-white" : "text-zinc-200 hover:bg-zinc-800/70"
          }`}
        >
          SV
        </button>
      </div>
    </div>
  );
}

function isCoachingActive(pathname: string) {
  return coachingPaths.some((path) => pathname === path);
}

function sectionLabelClass() {
  return "text-xs font-medium uppercase tracking-[0.16em] text-[#92753a]";
}

const megaItemFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50";

const megaBlockLink = `group -mx-2 block rounded-sm px-2 py-1.5 transition-[color,transform] duration-200 ease-out ${megaItemFocus}`;

const megaBlockTitle =
  "block text-sm font-medium text-zinc-900 transition-colors duration-200 group-hover:text-[#92753a]";

const megaBlockDesc =
  "mt-1 block text-sm leading-6 text-zinc-600 transition-colors duration-200 group-hover:text-zinc-700";

export default function SiteNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = localeFromPathname(pathname);
  const barePathname = stripLocaleFromPath(pathname);
  const t = getDictionaryForOptionalLocale(locale);
  const localizedHref = (path: string) => toLocalePath(path, locale);
  const coachingAudiences =
    locale === "sv"
      ? [
          {
            href: "/individuell-coaching",
            label: "Individuell coaching",
            text: "För dig som står inför ett vägval, en förändring eller ett beslut som väger.",
          },
          {
            href: "/business-coaching",
            label: "Business coaching",
            text: "För medarbetare och ledare i arbetslivet.",
          },
        ]
      : [
          {
            href: "/individuell-coaching",
            label: "Individual coaching",
            text: "For anyone facing a choice, a change or a decision that carries weight.",
          },
          {
            href: "/business-coaching",
            label: "Business coaching",
            text: "For employees and leaders in working life.",
          },
        ];
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCoachingOpen, setMobileCoachingOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaPanelRef = useRef<HTMLDivElement>(null);
  const coachingTabRef = useRef<HTMLLIElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coachingMenuId = useId();
  const [megaOpen, setMegaOpen] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const coachingActive = isCoachingActive(barePathname);
  const isHome = barePathname === "/";

  const updatePanelTop = useCallback(() => {
    if (headerRef.current) {
      setPanelTop(headerRef.current.getBoundingClientRect().bottom);
    }
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      showTargets(el);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: -8, force3D: true },
        {
          autoAlpha: 1,
          y: 0,
          duration: motion.duration.medium,
          ease: motion.ease.reveal,
          force3D: true,
        },
      );
    });

    return () => {
      ctx?.revert();
      showTargets(el);
    };
  }, []);

  useEffect(() => {
    if (!megaOpen) return;

    updatePanelTop();
    window.addEventListener("resize", updatePanelTop);
    window.addEventListener("scroll", updatePanelTop, true);

    return () => {
      window.removeEventListener("resize", updatePanelTop);
      window.removeEventListener("scroll", updatePanelTop, true);
    };
  }, [megaOpen, updatePanelTop]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const panel = megaPanelRef.current;
    if (!panel) return;

    let ctx: gsap.Context | undefined;

    if (megaOpen) {
      ctx = gsap.context(() => {
        gsap.killTweensOf(panel);
        gsap.set(panel, { visibility: "visible", pointerEvents: "auto" });

        if (prefersReducedMotion()) {
          gsap.set(panel, { opacity: 1, y: 0 });
          return;
        }

        gsap.fromTo(
          panel,
          { opacity: 0, y: -8 },
          {
            opacity: 1,
            y: 0,
            duration: motion.duration.short,
            ease: motion.ease.revealSoft,
            overwrite: "auto",
          },
        );
      });
    } else {
      ctx = gsap.context(() => {
        gsap.killTweensOf(panel);

        if (prefersReducedMotion()) {
          gsap.set(panel, { opacity: 0, y: 0, visibility: "hidden", pointerEvents: "none" });
          return;
        }

        gsap.to(panel, {
          opacity: 0,
          y: -6,
          duration: 0.26,
          ease: motion.ease.exit,
          overwrite: "auto",
          onComplete: () => {
            gsap.set(panel, { visibility: "hidden", pointerEvents: "none" });
          },
        });
      });
    }

    return () => {
      ctx?.revert();
    };
  }, [megaOpen]);

  const openMega = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updatePanelTop();
    setMegaOpen(true);
  };

  const closeMega = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    setMegaOpen(false);
  };

  const scheduleCloseMega = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setMegaOpen(false);
      closeTimerRef.current = null;
    }, 120);
  };

  const handleMegaBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && megaMenuRef.current?.contains(next)) return;
    closeMega();
  };

  const handleLanguageChange = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    router.push(toLocalePath(pathname, nextLocale));
    setMobileOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileOpen((prev) => {
      if (!prev) {
        setMobileCoachingOpen(coachingActive);
      }
      return !prev;
    });
  };

  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    const handlePopState = () => {
      setMobileOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [mobileOpen]);

  const headerSurface = isHome
    ? megaOpen || mobileOpen
      ? "border-zinc-900/10 bg-white/40"
      : "border-transparent bg-transparent"
    : "border-zinc-200/80 bg-zinc-50/90";

  const mobileHeaderSurface = isHome
    ? mobileOpen
      ? "border-zinc-900/10 bg-white/90 backdrop-blur-md"
      : "border-transparent bg-transparent"
    : "border-b border-zinc-200/80 bg-zinc-50/95 backdrop-blur-sm";

  const logoRingOffset = isHome
    ? "focus-visible:ring-offset-white/40"
    : "focus-visible:ring-offset-zinc-100";

  return (
    <>
    <header
      ref={headerRef}
      className={`isolate z-[100] w-full backdrop-blur-[2px] transition-[background-color,border-color] duration-150 ${
        isHome ? `absolute left-0 right-0 top-0 ${headerSurface}` : `sticky top-0 border-b ${headerSurface}`
      }`}
    >
      <div className="hidden w-full items-center justify-between px-6 py-5 md:flex md:px-10 lg:px-14 lg:py-6">
        <Link
          href={localizedHref("/")}
          className={`shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${logoRingOffset}`}
        >
          <LogoMark className="block h-[4.25rem] w-auto translate-y-1 lg:h-20" priority />
        </Link>

        <nav aria-label={t.nav.mainAria} className="ml-auto">
          <DesktopNavTabs pathname={pathname} coachingActive={coachingActive}>
            {({ listRef, setPosition }) => (
              <>
                <NavHoverTarget
                  as="link"
                  href={localizedHref("/")}
                  aria-current={barePathname === "/" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={barePathname === "/"}
                  className={navTabClass(barePathname === "/", isHome)}
                >
                  {t.nav.home}
                </NavHoverTarget>

                <li
                  ref={coachingTabRef}
                  data-nav-active={coachingActive ? "true" : undefined}
                  className="relative list-none"
                  onMouseEnter={() => {
                    if (coachingTabRef.current) {
                      syncCursorFromElement(coachingTabRef.current, listRef.current, setPosition);
                    }
                  }}
                >
                  <div
                    ref={megaMenuRef}
                    className="relative"
                    onMouseEnter={() => {
                      openMega();
                      if (coachingTabRef.current) {
                        syncCursorFromElement(coachingTabRef.current, listRef.current, setPosition);
                      }
                    }}
                    onMouseLeave={scheduleCloseMega}
                    onFocus={openMega}
                    onBlur={handleMegaBlur}
                  >
                    <button
                      type="button"
                      aria-expanded={megaOpen}
                      aria-controls={coachingMenuId}
                      className={`gap-1.5 ${navTabClass(coachingActive, isHome)}`}
                      onFocus={() => {
                        if (coachingTabRef.current) {
                          syncCursorFromElement(coachingTabRef.current, listRef.current, setPosition);
                        }
                      }}
                    >
                      {t.nav.coaching}
                      <NavChevron open={megaOpen} />
                    </button>

                    <div
                      ref={megaPanelRef}
                      id={coachingMenuId}
                      role="region"
                      aria-label="Coaching"
                      aria-hidden={!megaOpen}
                      style={{ top: Math.max(0, panelTop - 10) }}
                      className="pointer-events-none fixed inset-x-0 z-[100] hidden pt-2.5 opacity-0 md:block"
                    >
              <div className="border-t border-zinc-900/10 bg-zinc-50/95 shadow-[0_12px_40px_-28px_rgba(24,24,27,0.28)] backdrop-blur-md">
              <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-9">
                <div className="grid gap-8 md:grid-cols-[1fr_0.7fr] md:gap-10">
                  <div>
                    <p className={sectionLabelClass()}>{t.nav.leadershipLabel}</p>
                    <ul className="mt-4 space-y-5">
                      {coachingAudiences.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={localizedHref(item.href)}
                            aria-current={barePathname === item.href ? "page" : undefined}
                            className={megaBlockLink}
                          >
                            <span
                              className={`${megaBlockTitle} ${
                                barePathname === item.href ? "text-[#92753a]" : ""
                              }`}
                            >
                              {item.label}
                            </span>
                            <span className={megaBlockDesc}>{item.text}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex max-w-[16rem] flex-col md:max-w-none">
                    <p className={sectionLabelClass()}>{t.nav.startHereLabel}</p>
                    <p className="mt-4 text-sm font-medium leading-snug tracking-tight text-zinc-900">
                      {t.nav.unsureTitle}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {t.nav.unsureBody}
                    </p>
                    <div className="mt-6">
                      <CtaLink href={localizedHref("/kontakt")} variant="primary">
                        {t.nav.bookFirstCall}
                      </CtaLink>
                    </div>
                  </div>
                </div>
              </div>
              </div>
                    </div>
                  </div>
                </li>

                <NavHoverTarget
                  as="link"
                  href={localizedHref("/om-oss")}
                  aria-current={barePathname === "/om-oss" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={barePathname === "/om-oss"}
                  className={navTabClass(barePathname === "/om-oss", isHome)}
                >
                  {t.nav.about}
                </NavHoverTarget>

                <NavHoverTarget
                  as="link"
                  href={localizedHref("/kontakt")}
                  aria-current={barePathname === "/kontakt" ? "page" : undefined}
                  listRef={listRef}
                  setPosition={setPosition}
                  dataNavActive={barePathname === "/kontakt"}
                  className={navTabClass(barePathname === "/kontakt", isHome)}
                >
                  {t.nav.contact}
                </NavHoverTarget>
                <li className="list-none">
                  <Link
                    href="/klient-login"
                    className={`inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-700 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white transition-colors duration-200 hover:bg-zinc-600 hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 ${
                      isHome
                        ? "focus-visible:ring-offset-white/40"
                        : "focus-visible:ring-offset-zinc-100"
                    }`}
                  >
                    <LoginIcon />
                    {t.nav.login}
                  </Link>
                </li>
                <li className="list-none">
                  <LanguageMenu
                    locale={locale}
                    onSelect={handleLanguageChange}
                    ariaLabel={t.languageSwitcher.ariaLabel}
                    align="right"
                  />
                </li>
              </>
            )}
          </DesktopNavTabs>
        </nav>
      </div>

      <div
        className={`relative z-[120] flex w-full items-center gap-3 px-5 py-4 md:hidden md:px-10 ${mobileHeaderSurface}`}
      >
        <Link
          href={localizedHref("/")}
          className={`min-w-0 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${logoRingOffset}`}
        >
          <LogoMark className="mt-1 block h-14 w-auto" priority />
        </Link>
        <div className={mobileHeaderControlCluster + " ml-auto"}>
          <MobileHeaderLanguageDropdown locale={locale} pathname={pathname} />
          <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-zinc-900/12" />
          <button
            type="button"
            aria-label={mobileOpen ? t.nav.menuClose : t.nav.menuOpen}
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            onClick={toggleMobileMenu}
            className={mobileHeaderIconButton}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>
    </header>

    <div
      className={`fixed inset-0 z-[110] overflow-hidden md:hidden motion-reduce:transition-none transition-[visibility,opacity] duration-200 ease-out ${
        mobileOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
      }`}
      aria-hidden={!mobileOpen}
    >
      <button
        type="button"
        tabIndex={mobileOpen ? 0 : -1}
        aria-label={t.nav.menuClose}
        className="absolute inset-0 bg-zinc-950/35 backdrop-blur-[2px]"
        onClick={closeMobileMenu}
      />
      <nav
        id={mobileMenuId}
        aria-label={t.nav.mobileAria}
        role="dialog"
        aria-modal="true"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[min(100%,22.5rem)] flex-col border-l border-zinc-900/8 bg-[#f7f6f3]/98 shadow-[-16px_0_48px_-28px_rgba(24,24,27,0.28)] motion-reduce:transition-none transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-900/6 px-6 py-5">
          <LogoMark className="h-8 w-auto" />
          <button
            type="button"
            aria-label={t.nav.menuClose}
            onClick={closeMobileMenu}
            className={`${mobileHeaderIconButton} border border-zinc-900/10 bg-white/60`}
          >
            <MenuIcon open />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-7">
          <ul className="divide-y divide-zinc-900/6">
            <li>
              <Link
                href={localizedHref("/")}
                aria-current={barePathname === "/" ? "page" : undefined}
                onClick={closeMobileMenu}
                className={`${mobileNavLinkClass} ${barePathname === "/" ? "text-[#92753a]" : ""}`}
              >
                {t.nav.home}
              </Link>
            </li>
            <li className="py-1">
              <button
                type="button"
                aria-expanded={mobileCoachingOpen}
                onClick={() => setMobileCoachingOpen((prev) => !prev)}
                className={`flex w-full items-center justify-between rounded-lg px-1 py-3 text-left text-[1.0625rem] font-medium leading-snug text-zinc-900 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 ${
                  coachingActive ? "text-[#92753a]" : ""
                }`}
              >
                {t.nav.coaching}
                <NavChevron open={mobileCoachingOpen} />
              </button>
              <div
                className={`overflow-hidden motion-reduce:transition-none transition-[max-height,opacity] duration-200 ease-out ${
                  mobileCoachingOpen ? "max-h-[48rem] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pb-4 pl-1">
                  <p className={`${sectionLabelClass()} pt-2`}>{t.nav.leadershipLabel}</p>
                  <ul className="mt-2 space-y-1">
                    {coachingAudiences.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={localizedHref(item.href)}
                          aria-current={barePathname === item.href ? "page" : undefined}
                          onClick={closeMobileMenu}
                          className={mobileAudienceLinkClass}
                        >
                          <span className={mobileAudienceTitleClass}>{item.label}</span>
                          <span className={mobileAudienceDescClass}>{item.text}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 border-t border-zinc-900/6 pt-6">
                    <p className={sectionLabelClass()}>{t.nav.startHereLabel}</p>
                    <p className="mt-4 text-sm font-medium leading-snug tracking-tight text-zinc-900">
                      {t.nav.unsureTitle}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{t.nav.unsureBody}</p>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <Link
                href={localizedHref("/om-oss")}
                aria-current={barePathname === "/om-oss" ? "page" : undefined}
                onClick={closeMobileMenu}
                className={`${mobileNavLinkClass} ${barePathname === "/om-oss" ? "text-[#92753a]" : ""}`}
              >
                {t.nav.about}
              </Link>
            </li>
            <li>
              <Link
                href={localizedHref("/kontakt")}
                aria-current={barePathname === "/kontakt" ? "page" : undefined}
                onClick={closeMobileMenu}
                className={`${mobileNavLinkClass} ${barePathname === "/kontakt" ? "text-[#92753a]" : ""}`}
              >
                {t.nav.contact}
              </Link>
            </li>
          </ul>

          <div className="mt-10 flex flex-col gap-3 border-t border-zinc-900/6 pt-8 pb-2">
            <span className="block [&>a]:flex [&>a]:w-full [&>a]:min-h-11">
              <CtaLink href={localizedHref("/kontakt")} variant="primary" onClick={closeMobileMenu}>
                {t.nav.bookFirstCall}
              </CtaLink>
            </span>
            <Link
              href="/klient-login"
              onClick={closeMobileMenu}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:border-zinc-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f3]"
            >
              <LoginIcon />
              {t.nav.login}
            </Link>
          </div>
        </div>
      </nav>
    </div>
    </>
  );
}
```

---

## File: src/components/site-footer.tsx

### Affected route(s)
shared — all public routes

### Public-facing purpose
Public footer: coaching links, about and contact links, coach login, copyright.

### Current source

```tsx
"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { localeFromPathname, toLocalePath } from "@/lib/i18n/config";
import { getDictionaryForOptionalLocale } from "@/lib/i18n";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const t = getDictionaryForOptionalLocale(locale);
  const isPortal =
    pathname.startsWith("/cvb-base") ||
    pathname.startsWith("/klient") ||
    pathname.startsWith("/logga-in") ||
    pathname.startsWith("/coach-login") ||
    pathname.startsWith("/klient-login");
  const href = (path: string) => toLocalePath(path, locale);
  // Två primära ingångar: individuell coaching och business coaching.
  const services =
    locale === "sv"
      ? [
          { href: "/individuell-coaching", label: "Individuell coaching" },
          { href: "/business-coaching", label: "Business coaching" },
        ]
      : [
          { href: "/individuell-coaching", label: "Individual coaching" },
          { href: "/business-coaching", label: "Business coaching" },
        ];
  const about =
    locale === "sv"
      ? [
          { href: "/om-oss", label: "Om CVB Coaching" },
          { href: "/kontakt", label: "Kontakt" },
        ]
      : [
          { href: "/om-oss", label: "About Carolina" },
          { href: "/kontakt", label: "Contact" },
        ];

  if (isPortal) return null;

  return (
    <footer className="mt-auto border-t border-zinc-300 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">

          <div className="md:col-span-5">
            <LogoMark className="h-14 w-auto" />
            <p className="mt-7 max-w-xs text-sm leading-relaxed text-zinc-600">
              {t.footer.description}
            </p>
            <div className="mt-5">
              <a
                href="mailto:kontakt@cvbcoaching.se"
                className="inline-block text-sm text-zinc-700 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50"
              >
                kontakt@cvbcoaching.se
              </a>
            </div>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">
              {t.footer.services}
            </p>
            <ul className="mt-4 space-y-2.5">
              {services.map((item) => (
                <li key={item.href}>
                  <Link
                    href={href(item.href)}
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
              {t.footer.about}
            </p>
            <ul className="mt-4 space-y-2.5">
              {about.map((item) => (
                <li key={item.href}>
                  <Link
                    href={href(item.href)}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6">
          <p className="text-xs text-zinc-400">{t.footer.copyright}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/coach-login"
              className="text-xs text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
            >
              {t.footer.coachLogin}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## File: src/components/cta-link.tsx

### Affected route(s)
shared — all public routes

### Public-facing purpose
Shared CTA/button component; controls booking destination and same-page anchor scrolling.

### Current source

```tsx
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
```

---

## File: src/components/json-ld.tsx

### Affected route(s)
shared — /, /om-oss

### Public-facing purpose
Structured data: ProfessionalService schema and Carolina Person schema.

### Current source

```tsx
type JsonLdProps = {
  data: Record<string, unknown>;
};

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "CVB Coaching",
  url: "https://www.cvbcoaching.se",
  email: "kontakt@cvbcoaching.se",
  areaServed: ["Göteborg", "Sverige"],
  availableLanguage: ["sv", "en"],
  serviceType: ["Individuell coaching", "Business coaching"],
  founder: {
    "@type": "Person",
    name: "Carolina von Braun",
  },
};

export const carolinaPersonSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Carolina von Braun",
  jobTitle: "Coach",
  worksFor: {
    "@type": "Organization",
    name: "CVB Coaching",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Handelshögskolan vid Göteborgs universitet",
  },
};
```

---

## File: src/components/brand/logo.tsx

### Affected route(s)
shared — all public routes

### Public-facing purpose
Logo mark and wordmark components, including their image alt text.

### Current source

```tsx
import Image from "next/image";

/**
 * CVB Coachings logotyp.
 *
 * `LogoMark` är monogrammet och används där höjden är begränsad — headers och
 * navigation. `LogoLockup` är hela märket med ordbild och används där det finns
 * vertikalt utrymme, exempelvis inloggningsvyer och sidfot.
 */

export function LogoMark({
  className = "h-9 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/cvb-monogram.png"
      alt="CVB Coaching"
      width={512}
      height={511}
      className={className}
      priority={priority}
    />
  );
}

export function LogoLockup({
  className = "h-24 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/cvb-logo.png"
      alt="CVB Coaching"
      width={900}
      height={1067}
      className={className}
      priority={priority}
    />
  );
}
```

---

## File: src/components/hero-video-background.tsx

### Affected route(s)
shared — /, /en

### Public-facing purpose
Hero background video element and its accessibility attributes.

### Current source

```tsx
"use client";

import { useEffect, useRef } from "react";
import HeroImageReveal from "@/components/animations/HeroImageReveal";
import { prefersReducedMotion } from "@/lib/motion";

export const HERO_VIDEO_SRC = "/cvb1.mp4";

export default function HeroVideoBackground({
  className = "absolute inset-0 overflow-hidden",
}: {
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion()) {
      video.pause();
      return;
    }

    void video.play().catch(() => undefined);
  }, []);

  return (
    <HeroImageReveal className={className}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden="true"
      >
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      </video>
    </HeroImageReveal>
  );
}
```

---

## File: src/components/contact-page-scroll-reset.tsx

### Affected route(s)
shared — /kontakt, /en/kontakt

### Public-facing purpose
Scroll reset behaviour on entering the contact route.

No public-facing copy in this file.

### Current source

```tsx
"use client";

import { useLayoutEffect } from "react";
import { resetRouteScroll } from "@/lib/motion";

export default function ContactPageScrollReset() {
  useLayoutEffect(() => {
    resetRouteScroll();

    const frame = requestAnimationFrame(() => {
      resetRouteScroll();
    });
    const timeout = window.setTimeout(resetRouteScroll, 0);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}
```

---

## File: src/components/coaching-services-grid.tsx

### Affected route(s)
shared — /, /en

### Public-facing purpose
The two coaching path cards (Individuell coaching / Business coaching) for both locales, including titles, descriptions and CTA labels.

### Current source

```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CtaLink from "@/components/cta-link";
import type { Locale } from "@/lib/i18n/config";
import { isMobile, motion, prefersReducedMotion, refreshScrollTriggers, revealScrollTrigger, showTargets } from "@/lib/motion";

type Service = {
  index: string;
  href: string;
  title: string;
  description: string;
  ctaLabel: string;
  spanClass?: string;
};

const servicesSv: Service[] = [
  {
    index: "01",
    href: "/individuell-coaching",
    title: "Individuell coaching",
    description:
      "För dig som står inför ett vägval, en förändring eller ett beslut som du vill tänka färdigt.",
    ctaLabel: "Läs om individuell coaching",
  },
  {
    index: "02",
    href: "/business-coaching",
    title: "Business coaching",
    description:
      "För medarbetare och ledare som behöver klarhet, riktning eller stöd i en arbetsrelaterad situation.",
    ctaLabel: "Läs om business coaching",
  },
];

const servicesEn: Service[] = [
  {
    index: "01",
    href: "/en/individuell-coaching",
    title: "Individual coaching",
    description:
      "For you who are facing a choice, a change or a decision that needs room to be thought through.",
    ctaLabel: "Read about individual coaching",
  },
  {
    index: "02",
    href: "/en/business-coaching",
    title: "Business coaching",
    description:
      "For employees and leaders who need clarity, direction or support in a work-related situation.",
    ctaLabel: "Read about business coaching",
  },
];

const cardClass =
  "group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(24,24,27,0.05)] md:p-9";

type Props = {
  locale: Locale;
};

function buildMobileReveal(
  panel: HTMLElement,
  cards: NodeListOf<HTMLElement>,
  steps: NodeListOf<HTMLElement>,
  lines: NodeListOf<HTMLElement>,
  accents: NodeListOf<HTMLElement>,
  arrows: NodeListOf<HTMLElement>,
) {
  gsap.set(steps, { autoAlpha: 1, opacity: 0.35, force3D: true });
  gsap.set(lines, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(steps[0], { opacity: 1 });
  gsap.set(cards, { autoAlpha: 0, y: 14, force3D: true });
  gsap.set(accents, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(accents[0], { scaleX: 1 });
  gsap.set(arrows, { autoAlpha: 0, force3D: true });
  gsap.set(arrows[0], { autoAlpha: 0.55 });

  const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(panel) });

  tl.to(
    cards,
    {
      autoAlpha: 1,
      y: 0,
      duration: motion.duration.medium,
      ease: motion.ease.reveal,
      stagger: 0.07,
      force3D: true,
      onComplete: () => {
        cards.forEach((card) => {
          card.style.pointerEvents = "auto";
        });
      },
    },
    0,
  );
  tl.to(
    lines,
    { scaleX: 1, duration: motion.duration.long, ease: motion.ease.reveal, stagger: 0.08, force3D: true },
    0.05,
  );
  tl.to(steps, { opacity: 1, duration: 0.12, stagger: 0.04, ease: "none" }, 0.08);
  tl.to(
    accents,
    { scaleX: 1, duration: motion.duration.medium, ease: motion.ease.reveal, stagger: 0.08, force3D: true },
    0.1,
  );
  tl.to(
    arrows,
    { autoAlpha: 0.55, x: 0, duration: motion.duration.short, ease: motion.ease.revealSoft, stagger: 0.05, force3D: true },
    0.12,
  );
}

function buildProgressTimeline(
  panel: HTMLElement,
  cards: NodeListOf<HTMLElement>,
  steps: NodeListOf<HTMLElement>,
  lines: NodeListOf<HTMLElement>,
  accents: NodeListOf<HTMLElement>,
  arrows: NodeListOf<HTMLElement>,
) {
  gsap.set(steps, { autoAlpha: 1, y: 0, opacity: 0.35, force3D: true });
  gsap.set(lines, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(steps[0], { opacity: 1 });

  cards.forEach((card, index) => {
    if (index === 0) {
      gsap.set(card, { autoAlpha: 1, x: 0, y: 0, force3D: true });
      card.style.pointerEvents = "auto";
      return;
    }
    gsap.set(card, { autoAlpha: 0, x: -12, y: 16, force3D: true });
    card.style.pointerEvents = "none";
  });

  gsap.set(accents, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(accents[0], { scaleX: 1 });
  gsap.set(arrows, { autoAlpha: 0, x: -4, force3D: true });
  gsap.set(arrows[0], { autoAlpha: 0.55, x: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: panel,
      start: "top 72%",
      end: "bottom 18%",
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  cards.forEach((card, index) => {
    if (index === 0) return;

    const segmentStart = (index - 1) * 0.3 + 0.05;

    const line = lines[index - 1];
    if (line) {
      tl.to(
        line,
        { scaleX: 1, duration: 0.38, ease: motion.ease.reveal },
        segmentStart,
      );
    }

    tl.to(
      steps[index],
      { opacity: 1, duration: 0.1, ease: "none" },
      segmentStart + 0.1,
    );

    tl.to(
      card,
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.26,
        ease: motion.ease.reveal,
        onStart: () => {
          card.style.pointerEvents = "auto";
        },
      },
      segmentStart + 0.04,
    );

    const accent = accents[index];
    if (accent) {
      tl.to(
        accent,
        { scaleX: 1, duration: 0.32, ease: motion.ease.reveal },
        segmentStart + 0.1,
      );
    }

    const arrow = arrows[index];
    if (arrow) {
      tl.to(
        arrow,
        { autoAlpha: 0.55, x: 0, duration: 0.14, ease: motion.ease.revealSoft },
        segmentStart + 0.14,
      );
    }
  });

  tl.to({}, { duration: 0.12 });
}

export default function CoachingServicesGrid({ locale }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const services = locale === "en" ? servicesEn : servicesSv;

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    const steps = panel.querySelectorAll<HTMLElement>("[data-progress-step]");
    const lines = panel.querySelectorAll<HTMLElement>("[data-progress-line]");
    const cards = panel.querySelectorAll<HTMLElement>("[data-card]");
    const accents = panel.querySelectorAll<HTMLElement>("[data-card-accent]");
    const arrows = panel.querySelectorAll<HTMLElement>("[data-card-arrow]");

    const targets = [
      ...steps,
      ...lines,
      ...cards,
      ...accents,
      ...arrows,
    ].filter(Boolean) as HTMLElement[];

    if (prefersReducedMotion()) {
      showTargets(targets);
      cards.forEach((card) => {
        card.style.pointerEvents = "auto";
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (isMobile()) {
        buildMobileReveal(panel, cards, steps, lines, accents, arrows);
      } else {
        buildProgressTimeline(panel, cards, steps, lines, accents, arrows);
      }
      refreshScrollTriggers();
    }, root);

    return () => {
      ctx.revert();
      showTargets(targets);
      cards.forEach((card) => {
        card.style.pointerEvents = "auto";
      });
    };
  }, []);

  return (
    <div ref={rootRef} data-coaching-scroll-root className="pb-8 md:pb-12">
      <div ref={panelRef} data-coaching-scroll-panel className="bg-white">
        <ol
          data-progress-rail
          aria-hidden="true"
          className="mb-12 hidden w-full items-center md:flex"
        >
          {services.map((service, index) => (
            <li
              key={service.index}
              className={`flex items-center ${
                index < services.length - 1 ? "min-w-0 flex-1" : "shrink-0"
              }`}
            >
              <span
                data-progress-step
                className="shrink-0 text-sm font-semibold tabular-nums tracking-[0.35em] text-zinc-900 transition-opacity duration-200 md:text-[0.9375rem]"
              >
                {service.index}
              </span>
              {index < services.length - 1 ? (
                <span data-progress-track className="mx-4 h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-line-track">
                  <span data-progress-line className="block h-full w-full rounded-full" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <div
          className={`grid gap-5 md:grid-cols-2 md:gap-6 ${
            services.length > 2 ? "lg:grid-cols-3" : ""
          }`}
        >
          {services.map((service) => (
            <article
              key={service.href}
              data-card
              className={`${cardClass} ${service.spanClass ?? ""}`}
            >
                <div className="flex items-center gap-3 md:gap-4">
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-sm font-semibold tabular-nums tracking-[0.35em] text-zinc-900 md:text-[0.9375rem]"
                  >
                    {service.index}
                  </span>
                  <span
                    data-card-accent
                    aria-hidden="true"
                    className="block h-px min-w-0 max-w-[5rem] flex-1 origin-left md:max-w-[6rem]"
                  >
                    <span className="block h-px w-full" />
                  </span>
                  <span
                    data-card-arrow
                    aria-hidden="true"
                    className="shrink-0 text-sm text-zinc-400"
                  >
                    →
                  </span>
                </div>
                <h3 className="mt-7 text-[1.4rem] font-medium leading-[1.2] tracking-tight text-zinc-900">
                  {service.title}
                </h3>
                <p className="mt-3.5 grow text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                  {service.description}
                </p>
                <div className="mt-8">
                  <CtaLink href={service.href} variant="primary">
                    {service.ctaLabel}
                  </CtaLink>
                </div>
              </article>
            ))}
        </div>
      </div>
    </div>
  );
}
```

---

## File: src/components/ui/kinetic-team-hybrid.tsx

### Affected route(s)
shared — /

### Public-facing purpose
'Coaching med Carolina' section: heading, biography copy, portrait alt text and CTA.

### Current source

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CtaLink from "@/components/cta-link";
import {
  motion,
  prefersReducedMotion,
  refreshScrollTriggers,
  revealScrollTrigger,
  showTargets,
} from "@/lib/motion";

const CAROLINA_IMAGE = "/carolina-von-braun.png";

export default function KineticTeamHybrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const heading = section.querySelector<HTMLElement>("[data-team-heading]");
    const portrait = section.querySelector<HTMLElement>("[data-team-portrait]");
    const divider = section.querySelector<HTMLElement>("[data-team-divider]");
    const paragraphs = section.querySelectorAll<HTMLElement>("[data-col-paragraph]");

    const targets = [heading, portrait, divider, ...paragraphs].filter(Boolean) as HTMLElement[];

    if (prefersReducedMotion()) {
      showTargets(targets);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(section) });

      if (heading) {
        gsap.set(heading, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });
        tl.to(heading, {
          autoAlpha: 1,
          y: 0,
          duration: motion.duration.medium,
          ease: motion.ease.reveal,
          force3D: true,
        });
      }

      if (portrait) {
        gsap.set(portrait, { autoAlpha: 0, y: motion.reveal.y, scale: 1.04, force3D: true });
        tl.to(
          portrait,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: motion.duration.long,
            ease: motion.ease.reveal,
            force3D: true,
          },
          heading ? "-=0.52" : 0,
        );
      }

      if (divider) {
        gsap.set(divider, { scaleY: 0, transformOrigin: "top center", force3D: true });
        tl.to(
          divider,
          {
            scaleY: 1,
            duration: motion.duration.medium,
            ease: motion.ease.editorial,
            force3D: true,
          },
          portrait ? "-=0.62" : 0,
        );
      }

      if (paragraphs.length) {
        gsap.set(paragraphs, { autoAlpha: 0, x: 14, y: motion.reveal.ySoft, force3D: true });
        tl.to(
          paragraphs,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            duration: motion.duration.medium,
            ease: motion.ease.reveal,
            stagger: 0.14,
            force3D: true,
          },
          divider || portrait ? "-=0.42" : 0,
        );
      }

      refreshScrollTriggers();
    }, section);

    return () => {
      ctx.revert();
      showTargets(targets);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-hero-reveal-first
      className="group/section relative border-t border-line-accent/35 bg-gradient-to-b from-[#f8f7f4] via-zinc-100 to-[#f3f2ee] py-20 md:py-24"
    >
      <div className="grid gap-10 md:grid-cols-12 md:items-stretch md:gap-x-0 md:gap-y-0">
        <div data-col-left className="md:col-span-5 md:pr-10 lg:pr-14">
          <h2
            data-team-heading
            className="font-serif text-3xl font-medium leading-[1.12] tracking-tight text-zinc-900 md:text-[2.35rem]"
          >
            Coaching med Carolina
          </h2>
          <div
            data-team-portrait
            className="relative mt-8 aspect-[4/5] w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-200/40 shadow-[0_10px_40px_-16px_rgb(24_24_27_/_0.18)] transition-[transform,box-shadow] duration-500 motion-reduce:transition-none md:group-hover/section:-translate-y-1 md:group-hover/section:shadow-[0_18px_48px_-14px_rgb(24_24_27_/_0.22)]"
          >
            <Image
              src={CAROLINA_IMAGE}
              alt="Carolina von Braun, coach och grundare av CVB Coaching"
              fill
              sizes="(min-width: 768px) 38vw, 100vw"
              className="object-cover object-[center_22%] transition-transform duration-700 motion-reduce:transition-none md:group-hover/section:scale-[1.03]"
              quality={85}
              priority
            />
          </div>
        </div>

        <div
          data-col-right
          className="relative space-y-7 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-800 md:col-span-7 md:flex md:max-w-xl md:flex-col md:justify-center md:pl-10 md:justify-self-end lg:pl-14"
        >
          <span
            data-team-divider
            aria-hidden="true"
            className="absolute left-0 top-0 hidden h-full w-px origin-top bg-line-accent/25 md:block"
          />
          <p data-col-paragraph>
            Jag heter Carolina von Braun. CVB Coaching är min personliga coachingpraktik. Jag
            arbetar med människor som behöver få syn på sin situation klarare — privat eller i
            arbetslivet.
          </p>
          <p data-col-paragraph>
            Med erfarenhet från arbetsliv där beslut får konkreta konsekvenser erbjuder jag ett
            lugnt, professionellt och konfidentiellt samtalsrum. Min uppgift är inte att tala om vad
            du ska göra, utan att hjälpa dig tänka, välja och gå vidare på ett sätt som håller för
            dig.
          </p>
          <div data-col-paragraph className="mt-12">
            <CtaLink href="/om-oss" variant="primary">
              Läs om Carolina och hennes arbetssätt
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## File: src/components/engagement-section.tsx

### Affected route(s)
shared — /, /en

### Public-facing purpose
'Så går det till' / 'How it works' section wrapper and heading.

### Current source

```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import EngagementBentoGrid from "@/components/engagement-bento-grid";
import type { Locale } from "@/lib/i18n/config";
import {
  motion,
  prefersReducedMotion,
  refreshScrollTriggers,
  revealScrollTrigger,
  showTargets,
} from "@/lib/motion";

const titles: Record<Locale, string> = {
  sv: "Så går det till",
  en: "How it works",
};

type Props = {
  locale: Locale;
};

export default function EngagementSection({ locale }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      showTargets(el);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.set(el, { autoAlpha: 0, y: motion.reveal.ySoft, force3D: true });
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: motion.duration.long,
        ease: motion.ease.reveal,
        force3D: true,
        scrollTrigger: revealScrollTrigger(el, { start: "top 84%" }),
      });
      refreshScrollTriggers();
    }, ref);

    return () => {
      ctx.revert();
      showTargets(el);
    };
  }, []);

  return (
    <section id="uppdrag" data-parallax-section className="pt-16 pb-8 md:pt-20 md:pb-10">
      <div
        ref={ref}
        className="grid gap-10 md:grid-cols-12 md:items-start md:gap-x-16"
      >
        <h2 className="text-3xl font-medium leading-[1.15] tracking-tight text-zinc-900 md:col-span-4 md:text-[2.1rem]">
          {titles[locale]}
        </h2>
        <div className="md:col-span-8">
          <EngagementBentoGrid locale={locale} />
        </div>
      </div>
    </section>
  );
}
```

---

## File: src/components/engagement-bento-grid.tsx

### Affected route(s)
shared — /, /en

### Public-facing purpose
The four process step cards for both locales, plus the footnote line.

### Current source

```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "@/lib/i18n/config";
import { motion, prefersReducedMotion, refreshScrollTriggers, revealScrollTrigger, showTargets } from "@/lib/motion";

type Step = {
  index: string;
  title: string;
  body: string;
  layout: string;
};

const stepsSv: Step[] = [
  {
    index: "01",
    title: "Första samtalet",
    body: "Konfidentiellt. Du berättar om din situation, och tillsammans ser vi om coaching är rätt stöd och om vi fungerar bra ihop.",
    layout: "md:col-span-6 lg:col-span-7",
  },
  {
    index: "02",
    title: "Vad du vill bli klarare i",
    body: "Jag hjälper dig att sätta ord på vad du vill bli klarare i och vad du vill kunna göra annorlunda.",
    layout: "md:col-span-6 lg:col-span-5",
  },
  {
    index: "03",
    title: "Samtalen",
    body: "Du och jag bestämmer rytmen tillsammans. Varje samtal avslutas med något du tar med dig vidare.",
    layout: "md:col-span-6 lg:col-span-5",
  },
  {
    index: "04",
    title: "Avslut",
    body: "Du och jag stämmer av mot det du ville uppnå och ser tillsammans om arbetet är klart eller ska fortsätta.",
    layout: "md:col-span-6 lg:col-span-7",
  },
];

const stepsEn: Step[] = [
  {
    index: "01",
    title: "The first conversation",
    body: "Confidential. We talk about your situation and work out together whether coaching is the right support and whether we are a good fit.",
    layout: "md:col-span-6 lg:col-span-7",
  },
  {
    index: "02",
    title: "What you want to get clearer about",
    body: "We put into words what needs to be different for the conversations to make a real difference.",
    layout: "md:col-span-6 lg:col-span-5",
  },
  {
    index: "03",
    title: "The sessions",
    body: "We set the rhythm together. Every conversation ends with something you take further.",
    layout: "md:col-span-6 lg:col-span-5",
  },
  {
    index: "04",
    title: "Closing",
    body: "We look back at what you set out to do, and decide whether the work is finished or continues.",
    layout: "md:col-span-6 lg:col-span-7",
  },
];

const footnotes: Record<Locale, string> = {
  sv: "Upplägget följer frågan och vad du vill få ut av samtalen.",
  en: "The shape of the work follows the question and what you want to get out of the sessions.",
};

const tileClass =
  "group relative flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_16px_40px_-28px_rgba(24,24,27,0.28)] motion-reduce:transition-none md:p-7";

type Props = {
  locale: Locale;
};

/**
 * Alla fyra stegen tonas in en gång när sektionen kommer in i vyn och blir
 * sedan kvar. Tidigare låg korten 2–4 bakom en scrub-styrd tidslinje på
 * desktop, vilket gjorde att de kunde stå kvar dolda — innehållet får inte
 * vara beroende av hur långt besökaren har hunnit rulla.
 */
function buildStepsReveal(
  panel: HTMLElement,
  cards: NodeListOf<HTMLElement>,
  steps: NodeListOf<HTMLElement>,
  lines: NodeListOf<HTMLElement>,
  accents: NodeListOf<HTMLElement>,
  footnote: HTMLElement | null,
) {
  // Korten hålls synliga hela tiden och animeras bara i position. Innehållet får
  // aldrig vara beroende av att en scroll-animation hinner köra.
  gsap.set(steps, { autoAlpha: 1, opacity: 0.35, force3D: true });
  gsap.set(lines, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(steps[0], { opacity: 1 });
  gsap.set(cards, { autoAlpha: 1, y: 14, force3D: true });
  gsap.set(accents, { scaleX: 0, transformOrigin: "left center", force3D: true });
  gsap.set(accents[0], { scaleX: 1 });
  if (footnote) {
    gsap.set(footnote, { autoAlpha: 0, y: 10, force3D: true });
  }

  const tl = gsap.timeline({ scrollTrigger: revealScrollTrigger(panel) });

  tl.to(
    cards,
    {
      y: 0,
      duration: motion.duration.medium,
      ease: motion.ease.reveal,
      stagger: 0.07,
      force3D: true,
    },
    0,
  );
  tl.to(
    lines,
    { scaleX: 1, duration: motion.duration.medium, ease: motion.ease.reveal, stagger: 0.05, force3D: true },
    0.05,
  );
  tl.to(steps, { opacity: 1, duration: 0.12, stagger: 0.04, ease: "none" }, 0.08);
  tl.to(
    accents,
    { scaleX: 1, duration: motion.duration.short, ease: motion.ease.reveal, stagger: 0.05, force3D: true },
    0.1,
  );
  if (footnote) {
    tl.to(
      footnote,
      { autoAlpha: 1, y: 0, duration: motion.duration.medium, ease: motion.ease.reveal },
      0.15,
    );
  }
}

export default function EngagementBentoGrid({ locale }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const steps = locale === "en" ? stepsEn : stepsSv;

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    const progressSteps = panel.querySelectorAll<HTMLElement>("[data-progress-step]");
    const progressLines = panel.querySelectorAll<HTMLElement>("[data-progress-line]");
    const cards = panel.querySelectorAll<HTMLElement>("[data-bento-card]");
    const accents = panel.querySelectorAll<HTMLElement>("[data-bento-accent]");
    const footnote = panel.querySelector<HTMLElement>("[data-bento-footnote]");

    const targets = [
      ...progressSteps,
      ...progressLines,
      ...cards,
      ...accents,
      footnote,
    ].filter(Boolean) as HTMLElement[];

    if (prefersReducedMotion()) {
      showTargets(targets);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      buildStepsReveal(panel, cards, progressSteps, progressLines, accents, footnote);
      refreshScrollTriggers();
    }, root);

    return () => {
      ctx.revert();
      showTargets(targets);
    };
  }, []);

  return (
    <div ref={rootRef}>
      <div ref={panelRef}>
        <ol
          aria-hidden="true"
          className="mb-8 hidden max-w-2xl items-center md:flex"
        >
          {steps.map((step, index) => (
            <li key={step.index} className="flex flex-1 items-center last:flex-none">
              <span
                data-progress-step
                className="text-sm font-semibold tabular-nums tracking-[0.35em] text-zinc-900 transition-opacity duration-200 md:text-[0.9375rem]"
              >
                {step.index}
              </span>
              {index < steps.length - 1 ? (
                <span data-progress-track className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-line-track">
                  <span data-progress-line className="block h-full w-full rounded-full" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12 md:gap-4">
            {steps.map((step) => (
              <article
                key={step.index}
                data-bento-card
                className={`${tileClass} ${step.layout}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums tracking-[0.35em] text-zinc-900 md:text-[0.9375rem]">
                    {step.index}
                  </span>
                  <span data-bento-accent aria-hidden="true" className="block h-0.5 w-10 origin-left overflow-hidden rounded-full md:w-14">
                    <span className="block h-full w-full rounded-full" />
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-medium leading-tight tracking-tight text-zinc-900 md:text-[1.2rem]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[0.98rem] font-[450] leading-[1.65] text-zinc-700 md:text-[1.02rem]">
                  {step.body}
                </p>
              </article>
            ))}

            <p
              data-bento-footnote
              className="rounded-2xl border border-zinc-200/70 bg-zinc-900/[0.025] px-6 py-5 text-[0.98rem] font-[450] leading-[1.65] text-zinc-800 md:col-span-12 md:px-7 md:py-6 md:text-[1.02rem]"
            >
              {footnotes[locale]}
            </p>
        </div>
      </div>
    </div>
  );
}
```

---

## File: src/components/process-faq.tsx

### Affected route(s)
shared — /kontakt, /en/kontakt

### Public-facing purpose
Accessible disclosure component that renders the contact process FAQ items.

### Current source

```tsx
"use client";

import { useId, useState } from "react";

export type ProcessFaqItem = {
  question: string;
  answer: string;
};

type Props = {
  heading: string;
  items: ProcessFaqItem[];
};

function FaqChevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={`h-2.5 w-2.5 shrink-0 opacity-75 motion-reduce:transition-none transition-transform duration-150 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2.5 4.5 6 8 9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Vad som händer efter bokningen. Enkel disclosure — varje fråga är en egen
 * knapp som styr sitt eget svar, flera kan vara öppna samtidigt.
 */
export default function ProcessFaq({ heading, items }: Props) {
  const baseId = useId();
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggle = (index: number) =>
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );

  return (
    <div>
      <h2 className="text-2xl font-medium leading-tight tracking-tight md:text-[1.75rem]">
        {heading}
      </h2>
      <ul className="mt-10 divide-y divide-line-accent/25 border-y border-line-accent/30">
        {items.map((item, index) => {
          const open = openIndexes.includes(index);
          const panelId = `${baseId}-panel-${index}`;
          const buttonId = `${baseId}-button-${index}`;
          return (
            <li key={item.question}>
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className="flex w-full items-start justify-between gap-6 py-5 text-left text-[1.0625rem] leading-[1.65] text-zinc-900 transition-colors hover:text-[#92753a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
                >
                  <span>{item.question}</span>
                  <span className="mt-[0.45rem]">
                    <FaqChevron open={open} />
                  </span>
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open}>
                <p className="max-w-prose pb-6 text-[1.0625rem] leading-[1.75] text-zinc-700">
                  {item.answer}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

---

## File: src/components/contact-intake-form.tsx

### Affected route(s)
shared — /kontakt, /en/kontakt

### Public-facing purpose
Public booking intake form: section labels, field labels, select options, validation and confirmation messages.

### Current source

```tsx
"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import ContactSchedulingPicker from "@/components/contact-scheduling-picker";
import { localeFromPathname, type Locale } from "@/lib/i18n/config";
import { getDictionaryForOptionalLocale } from "@/lib/i18n";
import { buildContactConfirmationEmail } from "@/lib/contact/confirmation-email";
import { PUBLIC_BOOKING_SLUG, type ContactIntakePayload } from "@/lib/contact/intake-types";
import { usePathname } from "next/navigation";

const selectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2352525b' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

export type { ContactIntakePayload } from "@/lib/contact/intake-types";

const BOOKING_FIELDS = ["namn", "epost", "telefon", "onskatDatum", "onskadTid"] as const;
const FULL_FIELDS = [
  "namn",
  "organisation",
  "roll",
  "epost",
  "telefon",
  "fragan",
  "lage",
  "situation",
  "tydligare",
  "tidpunkt",
  "onskatDatum",
  "onskadTid",
] as const;

type FieldName = (typeof FULL_FIELDS)[number];

const fieldFocus =
  "transition-[border-color,box-shadow] duration-200 focus:border-zinc-900 focus-visible:outline-none focus-visible:shadow-[0_1px_0_0_#18181b]";

const fieldClassBase = `w-full border-0 border-b bg-transparent px-0 py-4 text-[1.0625rem] leading-snug text-zinc-900 placeholder:text-zinc-400/90 ${fieldFocus}`;

const selectClassBase = `w-full cursor-pointer appearance-none border-0 border-b bg-transparent bg-[length:0.7rem] bg-[position:right_0.15rem_center] bg-no-repeat px-0 py-4 pr-7 text-[1.0625rem] leading-snug text-zinc-900 ${fieldFocus}`;

const textareaClassBase = `min-h-[6.25rem] w-full resize-y border bg-zinc-900/[0.012] px-4 py-3.5 text-[1.0625rem] leading-relaxed text-zinc-900 placeholder:text-zinc-400/90 ${fieldFocus} focus:shadow-none focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900/10`;

const labelClass =
  "block text-[0.8125rem] font-medium tracking-[0.03em] text-zinc-800";

const sectionLabelClass =
  "block text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-zinc-500";

const schedulingSectionLabelClass =
  "block text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-zinc-900";

const errorTextClass = "text-sm leading-relaxed text-zinc-600";

function withFieldState(base: string, hasError: boolean, isTextarea = false) {
  const border = hasError
    ? "border-zinc-600"
    : isTextarea
      ? "border-zinc-400/65"
      : "border-zinc-400/80";
  return `${base} ${border}`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function buildPayload(data: FormData): ContactIntakePayload {
  return {
    namn: String(data.get("namn") ?? "").trim(),
    organisation: String(data.get("organisation") ?? "").trim(),
    roll: String(data.get("roll") ?? "").trim(),
    epost: String(data.get("epost") ?? "").trim(),
    telefon: String(data.get("telefon") ?? "").trim(),
    ort: String(data.get("ort") ?? "").trim(),
    fragan: String(data.get("fragan") ?? "").trim(),
    lage: String(data.get("lage") ?? "").trim(),
    situation: String(data.get("situation") ?? "").trim(),
    tydligare: String(data.get("tydligare") ?? "").trim(),
    tidpunkt: String(data.get("tidpunkt") ?? "").trim(),
    onskatDatum: String(data.get("onskatDatum") ?? "").trim(),
    onskadTid: String(data.get("onskadTid") ?? "").trim(),
    onskadTidSlut: String(data.get("onskadTidSlut") ?? "").trim(),
  };
}

function validateForm(
  data: FormData,
  messages: { emailError: string; fieldRequired: string; selectRequired: string },
  fields: readonly FieldName[] = FULL_FIELDS,
): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  for (const name of fields) {
    if (name === "epost") continue;
    const value = String(data.get(name) ?? "").trim();
    if (!value) {
      errors[name] =
        name === "fragan" || name === "lage" || name === "tidpunkt" || name === "onskadTid"
          ? messages.selectRequired
          : messages.fieldRequired;
    }
  }

  if (fields.includes("epost")) {
    const epost = String(data.get("epost") ?? "").trim();
    if (!epost) {
      errors.epost = messages.fieldRequired;
    } else if (!isValidEmail(epost)) {
      errors.epost = messages.emailError;
    }
  }

  if (fields.includes("onskatDatum")) {
    const raw = String(data.get("onskatDatum") ?? "").trim();
    if (raw) {
      const parsed = new Date(`${raw}T12:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(parsed.getTime()) || parsed < today || !isWeekday(parsed)) {
        errors.onskatDatum = messages.fieldRequired;
      }
    }
  }

  return errors;
}

function validationSummary(
  errors: Partial<Record<FieldName, string>>,
  messages: { emailError: string; generalError: string },
): string {
  const keys = Object.keys(errors) as FieldName[];
  if (keys.length === 1 && errors.epost === messages.emailError) {
    return messages.emailError;
  }
  return messages.generalError;
}

class SlotConflictError extends Error {}

function buildRequestMessage(payload: ContactIntakePayload): string {
  const lines = [
    payload.organisation ? `Organisation: ${payload.organisation}` : "",
    payload.roll ? `Roll: ${payload.roll}` : "",
    payload.fragan ? `Typ av stöd: ${payload.fragan}` : "",
    payload.lage ? `Läge: ${payload.lage}` : "",
    payload.tidpunkt ? `Tidshorisont: ${payload.tidpunkt}` : "",
    payload.situation ? `Situation: ${payload.situation}` : "",
    payload.tydligare ? `Vad behöver bli tydligare: ${payload.tydligare}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

async function submitContactIntake(payload: ContactIntakePayload, locale: Locale): Promise<void> {
  void buildContactConfirmationEmail(payload, locale);

  const response = await fetch("/api/public/tillganglighet/boka", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug: PUBLIC_BOOKING_SLUG,
      name: payload.namn,
      email: payload.epost,
      phone: payload.telefon,
      message: buildRequestMessage(payload),
      startAt: payload.onskadTid,
      endAt: payload.onskadTidSlut,
    }),
  });

  const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!response.ok || !result.ok) {
    if (response.status === 409) {
      throw new SlotConflictError(result.error || "Tiden hann precis bli bokad. Välj gärna en annan tid.");
    }
    throw new Error(result.error || "Förfrågan kunde inte skickas just nu. Försök igen om en stund.");
  }
}

function FormSection({
  title,
  children,
  headingClassName,
  className,
}: {
  title: string;
  children: ReactNode;
  headingClassName?: string;
  className?: string;
}) {
  return (
    <section className={className}>
      <p className={headingClassName ?? sectionLabelClass}>{title}</p>
      <div className="mt-7 space-y-7">{children}</div>
    </section>
  );
}

function FieldGroup({
  label,
  htmlFor,
  optional,
  optionalLabel,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  optionalLabel?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-zinc-500">({optionalLabel ?? "valfritt"})</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className={errorTextClass} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const selectStyle = { backgroundImage: selectChevron };

type Step1Data = {
  organisation: string;
  namn: string;
  epost: string;
  telefon: string;
  situation: string;
  onskatDatum: string;
  onskadTid: string;
  onskadTidSlut: string;
};

export default function ContactIntakeForm() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const t = getDictionaryForOptionalLocale(locale);
  const questionOptions =
    locale === "sv"
      ? [
          { value: "Individuell coaching", label: "Individuell coaching" },
          { value: "Business coaching", label: "Business coaching" },
          {
            value: "Jag är osäker – vill börja med ett samtal",
            label: "Jag är osäker – vill börja med ett samtal",
          },
        ]
      : [
          { value: "Individual Coaching", label: "Individual Coaching" },
          { value: "Business Coaching", label: "Business Coaching" },
          {
            value: "Not sure — I would like to start with a conversation",
            label: "Not sure — I would like to start with a conversation",
          },
        ];
  const phaseOptions =
    locale === "sv"
      ? [
          { value: "Strategiskt vägval", label: "Strategiskt vägval" },
          { value: "Oklara prioriteringar", label: "Oklara prioriteringar" },
          { value: "Friktion i ledningen", label: "Friktion i ledningen" },
          { value: "Tillväxt eller omställning", label: "Tillväxt eller omställning" },
          { value: "Tryck från ägare eller styrelse", label: "Tryck från ägare eller styrelse" },
          { value: "Annat", label: "Annat" },
        ]
      : [
          { value: "Strategic crossroads", label: "Strategic crossroads" },
          { value: "Unclear priorities", label: "Unclear priorities" },
          { value: "Leadership team friction", label: "Leadership team friction" },
          { value: "Growth or transition", label: "Growth or transition" },
          { value: "Pressure from owners or board", label: "Pressure from owners or board" },
          { value: "Other", label: "Other" },
        ];
  const timingOptions =
    locale === "sv"
      ? [
          { value: "Så snart som möjligt", label: "Så snart som möjligt" },
          { value: "Inom 1–3 månader", label: "Inom 1–3 månader" },
          { value: "Längre fram", label: "Längre fram" },
        ]
      : [
          { value: "As soon as possible", label: "As soon as possible" },
          { value: "Within 1–3 months", label: "Within 1–3 months" },
          { value: "Later on", label: "Later on" },
        ];

  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success">("idle");
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<Step1Data>({
    organisation: "",
    namn: "",
    epost: "",
    telefon: "",
    situation: "",
    onskatDatum: "",
    onskadTid: "",
    onskadTidSlut: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [summaryError, setSummaryError] = useState("");

  const messages = {
    emailError: t.form.emailError,
    fieldRequired: t.form.fieldRequired,
    selectRequired: t.form.selectRequired,
    generalError: t.form.generalError,
  };

  async function submitPayload(data: FormData) {
    setFieldErrors({});
    setSummaryError("");
    setSubmitState("submitting");
    try {
      await submitContactIntake(buildPayload(data), locale);
      setSubmitState("success");
    } catch (err) {
      if (err instanceof SlotConflictError) {
        setStep1Data((prev) => ({ ...prev, onskadTid: "", onskadTidSlut: "" }));
        setStep(1);
        setSummaryError(err.message);
      } else {
        setSummaryError(t.form.submitError);
      }
      setSubmitState("idle");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>, bookingOnly = false) {
    event.preventDefault();
    if (submitState === "submitting") return;
    const data = new FormData(event.currentTarget);
    if (!bookingOnly) {
      data.set("organisation", step1Data.organisation);
      data.set("namn", step1Data.namn);
      data.set("epost", step1Data.epost);
      data.set("telefon", step1Data.telefon);
      data.set("situation", step1Data.situation);
      data.set("onskatDatum", step1Data.onskatDatum);
      data.set("onskadTid", step1Data.onskadTid);
      data.set("onskadTidSlut", step1Data.onskadTidSlut);
    }
    const errors = validateForm(data, messages, bookingOnly ? BOOKING_FIELDS : FULL_FIELDS);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSummaryError(validationSummary(errors, messages));
      return;
    }
    if (bookingOnly) {
      setStep1Data({
        organisation: String(data.get("organisation") ?? "").trim(),
        namn: String(data.get("namn") ?? "").trim(),
        epost: String(data.get("epost") ?? "").trim(),
        telefon: String(data.get("telefon") ?? "").trim(),
        situation: String(data.get("situation") ?? "").trim(),
        onskatDatum: String(data.get("onskatDatum") ?? "").trim(),
        onskadTid: String(data.get("onskadTid") ?? "").trim(),
        onskadTidSlut: String(data.get("onskadTidSlut") ?? "").trim(),
      });
    }
    setFieldErrors({});
    setSummaryError("");
    await submitPayload(data);
  }

  if (submitState === "success") {
    return (
      <div
        className="max-w-2xl rounded-2xl border border-zinc-200/90 bg-white px-6 py-10 text-center shadow-sm shadow-zinc-900/[0.04] md:px-10 md:py-12"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-medium leading-relaxed text-zinc-900 md:text-xl">
          {t.form.bookingSuccessMessage}
        </p>
      </div>
    );
  }

  const err = (name: FieldName) => fieldErrors[name];

  const canSubmitBooking =
    Boolean(step1Data.namn.trim()) &&
    Boolean(step1Data.telefon.trim()) &&
    Boolean(step1Data.epost.trim()) &&
    isValidEmail(step1Data.epost.trim()) &&
    Boolean(step1Data.onskadTid) &&
    Boolean(step1Data.onskadTidSlut);

  return (
    <form
      onSubmit={(event) => handleSubmit(event, step === 1)}
      className="space-y-14"
      noValidate
      aria-label={t.form.ariaLabel}
    >
      {step === 1 ? (
        <>
          <FormSection
            title={t.form.sections.scheduling}
            headingClassName={schedulingSectionLabelClass}
          >
            <ContactSchedulingPicker
              locale={locale}
              t={t}
              selectedDate={step1Data.onskatDatum}
              selectedSlotStart={step1Data.onskadTid}
              selectedSlotEnd={step1Data.onskadTidSlut}
              organisation={step1Data.organisation}
              namn={step1Data.namn}
              telefon={step1Data.telefon}
              epost={step1Data.epost}
              situation={step1Data.situation}
              onOrganisationChange={(value) => setStep1Data((prev) => ({ ...prev, organisation: value }))}
              onNamnChange={(value) => setStep1Data((prev) => ({ ...prev, namn: value }))}
              onTelefonChange={(value) => setStep1Data((prev) => ({ ...prev, telefon: value }))}
              onEpostChange={(value) => setStep1Data((prev) => ({ ...prev, epost: value }))}
              onSituationChange={(value) => setStep1Data((prev) => ({ ...prev, situation: value }))}
              onSelectDate={(value) =>
                setStep1Data((prev) =>
                  // Changing the date invalidates any slot picked for the old
                  // date — the visitor must choose again. Re-picking the same
                  // date keeps the selection.
                  prev.onskatDatum === value
                    ? prev
                    : { ...prev, onskatDatum: value, onskadTid: "", onskadTidSlut: "" },
                )
              }
              onSelectSlot={(startAt, endAt) =>
                setStep1Data((prev) => ({ ...prev, onskadTid: startAt, onskadTidSlut: endAt }))
              }
              organisationError={err("organisation")}
              namnError={err("namn")}
              telefonError={err("telefon")}
              epostError={err("epost")}
              situationError={err("situation")}
              dateError={err("onskatDatum")}
              windowError={err("onskadTid")}
              isSubmitting={submitState === "submitting"}
              canSubmit={canSubmitBooking}
              dateLabelClass={labelClass}
              errorTextClass={errorTextClass}
            />
          </FormSection>
        </>
      ) : (
        <>
          <input type="hidden" name="namn" value={step1Data.namn} />
          <input type="hidden" name="epost" value={step1Data.epost} />
          <input type="hidden" name="telefon" value={step1Data.telefon} />
          <input type="hidden" name="situation" value={step1Data.situation} />
          <input type="hidden" name="onskatDatum" value={step1Data.onskatDatum} />
          <input type="hidden" name="onskadTid" value={step1Data.onskadTid} />
          <input type="hidden" name="onskadTidSlut" value={step1Data.onskadTidSlut} />

          <FormSection title={t.form.sections.contact}>
            <div className="grid gap-7 md:grid-cols-2 md:gap-x-10">
              <FieldGroup label={t.form.fields.organization} htmlFor="organisation" error={err("organisation")}>
                <input id="organisation" name="organisation" type="text" autoComplete="organization" defaultValue={step1Data.organisation} className={withFieldState(fieldClassBase, Boolean(err("organisation")))} />
              </FieldGroup>
              <FieldGroup label={t.form.fields.role} htmlFor="roll" error={err("roll")}>
                <input id="roll" name="roll" type="text" autoComplete="organization-title" className={withFieldState(fieldClassBase, Boolean(err("roll")))} />
              </FieldGroup>
            </div>
            <FieldGroup label={t.form.fields.city} htmlFor="ort" optional optionalLabel={t.form.optional}>
              <input id="ort" name="ort" type="text" autoComplete="address-level2" className={withFieldState(fieldClassBase, false)} />
            </FieldGroup>
          </FormSection>

          <FormSection title={t.form.sections.situation}>
            <div className="grid gap-7 md:grid-cols-2 md:gap-x-10">
              <FieldGroup label={t.form.fields.question} htmlFor="fragan" error={err("fragan")}>
                <select id="fragan" name="fragan" defaultValue="" className={withFieldState(selectClassBase, Boolean(err("fragan")))} style={selectStyle}>
                  <option value="" disabled>{locale === "sv" ? "Välj typ av stöd" : "Select type of support"}</option>
                  {questionOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label={t.form.fields.phase} htmlFor="lage" error={err("lage")}>
                <select id="lage" name="lage" defaultValue="" className={withFieldState(selectClassBase, Boolean(err("lage")))} style={selectStyle}>
                  <option value="" disabled>{locale === "sv" ? "Välj läge" : "Select situation"}</option>
                  {phaseOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FieldGroup>
            </div>
            <FieldGroup label={t.form.fields.clarity} htmlFor="tydligare" error={err("tydligare")}>
              <textarea id="tydligare" name="tydligare" className={withFieldState(textareaClassBase, Boolean(err("tydligare")), true)} />
            </FieldGroup>
          </FormSection>

          <FormSection title={t.form.sections.nextStep}>
            <div className="md:max-w-md">
              <FieldGroup label={t.form.fields.timing} htmlFor="tidpunkt" error={err("tidpunkt")}>
                <select id="tidpunkt" name="tidpunkt" defaultValue="" className={withFieldState(selectClassBase, Boolean(err("tidpunkt")))} style={selectStyle}>
                  <option value="" disabled>{locale === "sv" ? "Välj tidshorisont" : "Select timeframe"}</option>
                  {timingOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FieldGroup>
            </div>
          </FormSection>
        </>
      )}

      <div className="border-t border-zinc-300/45 pt-10">
        <div className="max-w-md space-y-5">
          {step === 2 && (
            <p className="text-sm leading-[1.7] text-zinc-600">{t.form.confidentialityNote}</p>
          )}
          {summaryError ? <p className={errorTextClass} role="alert" aria-live="polite">{summaryError}</p> : null}
          {step === 2 ? (
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={submitState === "submitting"} className="inline-flex items-center justify-center rounded-full bg-zinc-700 px-7 py-3.5 text-sm font-medium tracking-wide text-zinc-50 transition duration-150 hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-60">
                {submitState === "submitting" ? t.form.submit.submitting : t.form.submit.idle}
              </button>
              <button
                type="button"
                disabled={submitState === "submitting"}
                onClick={(event) => {
                  const form = event.currentTarget.form;
                  if (form) void handleSubmit({ preventDefault: () => {}, currentTarget: form } as FormEvent<HTMLFormElement>, true);
                }}
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-7 py-3.5 text-sm font-medium tracking-wide text-zinc-700 transition duration-150 hover:border-zinc-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t.form.submitAnyway}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );
}
```

---

## File: src/components/contact-scheduling-picker.tsx

### Affected route(s)
shared — /kontakt, /en/kontakt

### Public-facing purpose
Public availability calendar and slot picker: availability legend, date and time labels, accessible day labels, booking hints.

### Current source

```tsx
"use client";

import * as React from "react";
import { enGB, sv } from "react-day-picker/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { PUBLIC_BOOKING_SLUG } from "@/lib/contact/intake-types";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type PublicSlot = { date: string; startAt: string; endAt: string };

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const parsed = new Date(`${iso}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function formatSlotTime(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
  }).format(new Date(iso));
}

function formatSlotInterval(startAt: string, endAt: string): string {
  return `${formatSlotTime(startAt)}–${formatSlotTime(endAt)}`;
}

function formatSelectedDateLabel(iso: string, locale: Locale): string {
  const formatted = new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Stockholm",
  }).format(new Date(iso));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

const weekdayLabels: Record<Locale, string[]> = {
  sv: ["M", "T", "O", "T", "F", "L", "S"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
};

// Calendar.tsx's default disabled-date color (zinc-300) is close to
// invisible; override to a readable-but-clearly-muted tone here instead of
// touching the shared component. Kept in the same neutral zinc family as
// the rest of this monochrome public site.
const calendarClassNameOverrides = {
  months: "relative flex flex-col gap-6 sm:flex-col md:flex-col",
  month: "w-full max-w-full",
  day_button: "group-data-[disabled]:text-zinc-500",
  month_caption: "mb-4",
  caption_label: "text-[0.9375rem] font-medium tracking-tight text-zinc-900",
  weekday: "text-[0.6875rem] font-medium tracking-[0.12em] text-zinc-400",
  button_previous: "size-10 rounded-full hover:bg-zinc-100",
  button_next: "size-10 rounded-full hover:bg-zinc-100",
};

// Dagar med lediga tider bar tidigare bara en 3 px prick under siffran, vilket
// var för svagt för att uppfattas. Nu fylls siffran med en mjuk grön platta,
// och vald dag fylls helt i samma gröna skala — samma tokens som resten av
// bokningsytan, så hierarkin blir ledig < vald utan att bli skrikig.
const AVAILABLE_DAY_CLASS = cn(
  "[&:not([data-selected])>button]:bg-[#DFF0EC] [&:not([data-selected])>button]:font-medium [&:not([data-selected])>button]:text-[#3F7569]",
  "[&:not([data-selected])>button]:hover:bg-[#D0EDE6] [&:not([data-selected])>button]:hover:text-[#3F7569]",
);

// Vald dag fylls helt, så att den inte kan förväxlas med en dag som bara är
// ledig. Fyllningen sätts som inline-stil via en egen DayButton i stället för
// med en utility-klass: Calendar.tsx:s egna group-data-[selected]-klasser
// genererar ingen CSS under Tailwind v4, och den valda dagen blev därför aldrig
// markerad alls. Inline-stilen är den enda varianten som är oberoende av hur
// klasserna genereras.
const SELECTED_DAY_STYLE: React.CSSProperties = {
  backgroundColor: "#3F7569",
  color: "#ffffff",
  fontWeight: 500,
};

const SELECTED_SLOT_CLASS =
  "border-[#6BB5A8] bg-[#DFF0EC] text-[#3F7569] shadow-[inset_0_0_0_1px_rgba(107,181,168,0.35)] ring-2 ring-[#6BB5A8]/25 hover:bg-[#D0EDE6]";

const compactLabelClass = "block text-[0.75rem] font-medium tracking-[0.02em] text-zinc-700";

const compactFieldClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[0.875rem] leading-snug text-zinc-900 placeholder:text-zinc-400 transition-colors duration-150 focus:border-[#6BB5A8] focus:outline-none focus:ring-2 focus:ring-[#6BB5A8]/20";

const compactSelectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2352525b' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

const compactSelectClass =
  "w-full cursor-pointer appearance-none rounded-xl border border-zinc-200 bg-white bg-[length:0.7rem] bg-[position:right_0.75rem_center] bg-no-repeat px-3 py-2.5 pr-9 text-[0.875rem] leading-snug text-zinc-900 transition-colors duration-150 focus:border-[#6BB5A8] focus:outline-none focus:ring-2 focus:ring-[#6BB5A8]/20";

const compactTextareaClass =
  "min-h-[5.5rem] w-full resize-y rounded-xl border border-zinc-200 bg-zinc-900/[0.02] px-3 py-2.5 text-[0.875rem] leading-relaxed text-zinc-900 placeholder:text-zinc-400 transition-colors duration-150 focus:border-[#6BB5A8] focus:outline-none focus:ring-2 focus:ring-[#6BB5A8]/20";

type ContactSchedulingPickerProps = {
  locale: Locale;
  t: Dictionary;
  selectedDate: string;
  selectedSlotStart: string;
  selectedSlotEnd?: string;
  organisation: string;
  namn: string;
  telefon: string;
  epost: string;
  situation: string;
  onOrganisationChange: (value: string) => void;
  onNamnChange: (value: string) => void;
  onTelefonChange: (value: string) => void;
  onEpostChange: (value: string) => void;
  onSituationChange: (value: string) => void;
  onSelectDate: (value: string) => void;
  onSelectSlot: (startAt: string, endAt: string) => void;
  organisationError?: string;
  namnError?: string;
  telefonError?: string;
  epostError?: string;
  situationError?: string;
  dateError?: string;
  windowError?: string;
  isSubmitting?: boolean;
  canSubmit?: boolean;
  dateLabelClass: string;
  errorTextClass: string;
};

export default function ContactSchedulingPicker({
  locale,
  t,
  selectedDate,
  selectedSlotStart,
  selectedSlotEnd = "",
  organisation,
  namn,
  telefon,
  epost,
  situation,
  onOrganisationChange,
  onNamnChange,
  onTelefonChange,
  onEpostChange,
  onSituationChange,
  onSelectDate,
  onSelectSlot,
  organisationError,
  namnError,
  telefonError,
  epostError,
  situationError,
  dateError,
  windowError,
  isSubmitting = false,
  canSubmit = false,
  dateLabelClass,
  errorTextClass,
}: ContactSchedulingPickerProps) {
  const selected = parseIsoDate(selectedDate);
  const dayPickerLocale = locale === "sv" ? sv : enGB;

  const [slots, setSlots] = React.useState<PublicSlot[] | null>(null);
  const [bookingEnabled, setBookingEnabled] = React.useState(true);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState<Date>(selected ?? new Date());
  const [calendarMonths, setCalendarMonths] = React.useState(1);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setCalendarMonths(media.matches ? 3 : 1);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const today = new Date();
    const start = toIsoDate(today);
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + 90);
    const end = toIsoDate(horizon);

    let cancelled = false;
    fetch(`/api/public/tillganglighet/slots?slug=${PUBLIC_BOOKING_SLUG}&start=${start}&end=${end}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((payload: { ok: boolean; bookingEnabled: boolean; slots: PublicSlot[] }) => {
        if (cancelled) return;
        setBookingEnabled(payload.bookingEnabled ?? true);
        setSlots(payload.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const datesWithSlots = React.useMemo(() => {
    const set = new Set<string>();
    (slots ?? []).forEach((slot) => set.add(slot.date));
    return set;
  }, [slots]);

  // Auto-select the first available date once slots have loaded, so the
  // picker is useful without an extra click. This synchronizes local state
  // with data that only exists after an async fetch resolves, which is a
  // legitimate effect use case (React docs: "fetching data").
  React.useEffect(() => {
    if (!slots || slots.length === 0) return;
    if (selectedDate && datesWithSlots.has(selectedDate)) return;
    const firstDate = [...datesWithSlots].sort()[0];
    if (firstDate) {
      onSelectDate(firstDate);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing calendar view to freshly-fetched async data, not derived render state
      setVisibleMonth(parseIsoDate(firstDate) ?? visibleMonth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  const slotsForSelectedDate = React.useMemo(
    () => (slots ?? []).filter((slot) => slot.date === selectedDate),
    [slots, selectedDate],
  );

  const visibleMonthKeys = React.useMemo(() => {
    const keys: string[] = [];
    for (let offset = 0; offset < calendarMonths; offset += 1) {
      const monthDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
      keys.push(`${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`);
    }
    return keys;
  }, [visibleMonth, calendarMonths]);

  const monthHasSlots = React.useMemo(
    () => [...datesWithSlots].some((date) => visibleMonthKeys.includes(monthKey(date))),
    [datesWithSlots, visibleMonthKeys],
  );

  function isDateDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    if (candidate < today) return true;
    if (!slots) return false;
    return !datesWithSlots.has(toIsoDate(candidate));
  }

  const isPaused = slots !== null && !bookingEnabled;

  return (
    <div className="space-y-10">
      <p className="max-w-prose text-[0.9375rem] leading-[1.75] text-zinc-600">{t.form.schedulingHint}</p>

      {(loadFailed || isPaused) && (
        <p className="text-[0.9375rem] leading-[1.75] text-zinc-600">
          {locale === "sv"
            ? "Bokning är tillfälligt pausad. Kontakta oss gärna så återkommer vi."
            : "Booking is temporarily paused. Feel free to contact us and we will get back to you."}
        </p>
      )}

      <div className="space-y-4">
        <p className={dateLabelClass}>{t.form.fields.preferredDate}</p>
        <Card className="w-full max-w-5xl gap-0 rounded-2xl border-zinc-200/90 bg-white p-0 shadow-sm shadow-zinc-900/[0.04]">
          <CardContent className="p-0 md:grid md:grid-cols-[auto_minmax(26rem,1fr)] md:items-start">
            <div className="w-fit max-w-full shrink-0 self-start p-5 sm:p-7 md:p-8">
              <p className="mb-5 flex items-start gap-2.5 text-[0.8125rem] leading-[1.6] text-zinc-600">
                <span
                  aria-hidden="true"
                  className="mt-[0.15rem] inline-block size-4 shrink-0 rounded-full bg-[#DFF0EC] ring-1 ring-inset ring-[#3F7569]/25"
                />
                <span>
                  {locale === "sv"
                    ? "Grön markering visar dagar med lediga tider. Välj en dag för att se tiderna."
                    : "The green marking shows days with available times. Pick a day to see the times."}
                </span>
              </p>
              <Calendar
                mode="single"
                locale={dayPickerLocale}
                weekStartsOn={1}
                numberOfMonths={calendarMonths}
                pagedNavigation={false}
                reverseMonths={false}
                selected={selected}
                onSelect={(date) => {
                  if (date) onSelectDate(toIsoDate(date));
                }}
                month={visibleMonth}
                onMonthChange={setVisibleMonth}
                disabled={isDateDisabled}
                modifiers={{ available: (date) => datesWithSlots.has(toIsoDate(date)) }}
                modifiersClassNames={{ available: AVAILABLE_DAY_CLASS }}
                components={{
                  DayButton: ({ day, modifiers, style, ...buttonProps }) => {
                    // day och modifiers är react-day-pickers egna props och ska
                    // inte hamna på DOM-elementet — de plockas ut här.
                    void day;
                    return (
                      <button
                        {...buttonProps}
                        style={modifiers.selected ? { ...style, ...SELECTED_DAY_STYLE } : style}
                      />
                    );
                  },
                }}
                labels={{
                  labelDayButton: (date, modifiers) => {
                    const formatted = new Intl.DateTimeFormat(
                      locale === "sv" ? "sv-SE" : "en-GB",
                      { weekday: "long", day: "numeric", month: "long" },
                    ).format(date);
                    const parts: string[] = [
                      modifiers.today
                        ? `${locale === "sv" ? "Idag" : "Today"}, ${formatted}`
                        : formatted,
                    ];
                    if (modifiers.selected) parts.push(locale === "sv" ? "vald dag" : "selected");
                    if (modifiers.available) {
                      parts.push(locale === "sv" ? "lediga tider finns" : "times available");
                    } else if (modifiers.disabled) {
                      parts.push(locale === "sv" ? "inga lediga tider" : "no times available");
                    }
                    return parts.join(" — ");
                  },
                }}
                showOutsideDays={false}
                className="bg-transparent p-0 [--cell-size:2.5rem] sm:[--cell-size:2.625rem] md:[--cell-size:2.875rem]"
                classNames={calendarClassNameOverrides}
                formatters={{
                  formatWeekdayName: (date) => {
                    const index = (date.getDay() + 6) % 7;
                    return weekdayLabels[locale][index] ?? date.toLocaleDateString();
                  },
                }}
              />
            </div>
            <div className="flex flex-col border-t border-zinc-200/90 p-5 sm:p-7 md:sticky md:top-8 md:self-start md:border-t-0 md:border-l md:px-8 md:py-8">
              <p className={cn(dateLabelClass, "mb-5")}>{t.form.fields.preferredTime}</p>
              <div
                className="no-scrollbar grid max-h-72 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 md:max-h-none md:grid-cols-1"
                role="listbox"
                aria-label={t.form.timeSlotAria}
              >
                {isPaused ? null : !selectedDate ? (
                  <p className="col-span-1 text-[0.875rem] leading-relaxed text-zinc-500 sm:col-span-2 md:col-span-1">
                    {locale === "sv" ? "Välj ett tillgängligt datum i kalendern." : "Choose an available date in the calendar."}
                  </p>
                ) : slotsForSelectedDate.length > 0 ? (
                  slotsForSelectedDate.map((slot) => (
                    <Button
                      key={slot.startAt}
                      type="button"
                      role="option"
                      aria-selected={selectedSlotStart === slot.startAt}
                      variant="outline"
                      onClick={() => onSelectSlot(slot.startAt, slot.endAt)}
                      className={cn(
                        "h-auto min-h-11 w-full rounded-full px-4 py-3 text-[0.875rem] font-medium shadow-none tabular-nums transition-colors duration-150",
                        selectedSlotStart === slot.startAt
                          ? SELECTED_SLOT_CLASS
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
                      )}
                    >
                      {formatSlotInterval(slot.startAt, slot.endAt)}
                    </Button>
                  ))
                ) : !monthHasSlots ? (
                  <p className="col-span-1 text-[0.875rem] leading-relaxed text-zinc-500 sm:col-span-2 md:col-span-1">
                    {locale === "sv" ? (
                      <>
                        Inga lediga tider denna månad.
                        <br />
                        Bläddra gärna framåt i kalendern.
                      </>
                    ) : (
                      <>
                        No available times this month.
                        <br />
                        Feel free to browse forward.
                      </>
                    )}
                  </p>
                ) : (
                  <p className="col-span-1 text-[0.875rem] leading-relaxed text-zinc-500 sm:col-span-2 md:col-span-1">
                    {locale === "sv" ? "Inga lediga tider för valt datum." : "No available times for the selected date."}
                  </p>
                )}
              </div>

              <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-5">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-zinc-500">
                  {locale === "sv" ? "Vald tid" : "Selected time"}
                </p>
                <p
                  className={cn(
                    "mt-3 text-base leading-snug",
                    selectedSlotStart && selectedSlotEnd
                      ? "font-medium text-zinc-900"
                      : "text-zinc-500",
                  )}
                >
                  {selectedSlotStart && selectedSlotEnd
                    ? `${formatSelectedDateLabel(selectedSlotStart, locale)} · ${formatSlotInterval(selectedSlotStart, selectedSlotEnd)}`
                    : locale === "sv"
                      ? "Välj en tid ovan"
                      : "Choose a time above"}
                </p>

                <div className="mt-6 space-y-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="picker-fragan" className={compactLabelClass}>
                      {t.form.fields.question}
                    </label>
                    <select
                      id="picker-fragan"
                      name="fragan"
                      defaultValue=""
                      className={compactSelectClass}
                      style={{ backgroundImage: compactSelectChevron }}
                    >
                      <option value="">
                        {locale === "sv" ? "Välj alternativ" : "Select an option"}
                      </option>
                      {(locale === "sv"
                        ? [
                            "Individuell coaching",
                            "Business coaching",
                            "Jag är osäker – vill börja med ett samtal",
                          ]
                        : [
                            "Individual coaching",
                            "Business coaching",
                            "Not sure — I would like to start with a conversation",
                          ]
                      ).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="picker-namn" className={compactLabelClass}>
                      {t.form.fields.name}
                    </label>
                    <input
                      id="picker-namn"
                      name="namn"
                      type="text"
                      autoComplete="name"
                      required
                      aria-required="true"
                      value={namn}
                      onChange={(event) => onNamnChange(event.target.value)}
                      className={cn(compactFieldClass, namnError && "border-zinc-600")}
                    />
                    {namnError ? (
                      <p className={errorTextClass} role="alert">
                        {namnError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="picker-epost" className={compactLabelClass}>
                      {t.form.fields.email}
                    </label>
                    <input
                      id="picker-epost"
                      name="epost"
                      type="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      value={epost}
                      onChange={(event) => onEpostChange(event.target.value)}
                      className={cn(compactFieldClass, epostError && "border-zinc-600")}
                    />
                    {epostError ? (
                      <p className={errorTextClass} role="alert">
                        {epostError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="picker-telefon" className={compactLabelClass}>
                      {t.form.fields.phone}
                    </label>
                    <input
                      id="picker-telefon"
                      name="telefon"
                      type="tel"
                      autoComplete="tel"
                      required
                      aria-required="true"
                      value={telefon}
                      onChange={(event) => onTelefonChange(event.target.value)}
                      className={cn(compactFieldClass, telefonError && "border-zinc-600")}
                    />
                    {telefonError ? (
                      <p className={errorTextClass} role="alert">
                        {telefonError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="picker-organisation" className={compactLabelClass}>
                      {locale === "sv" ? "Företag (valfritt)" : "Company (optional)"}
                    </label>
                    <input
                      id="picker-organisation"
                      name="organisation"
                      type="text"
                      autoComplete="organization"
                      value={organisation}
                      onChange={(event) => onOrganisationChange(event.target.value)}
                      className={cn(compactFieldClass, organisationError && "border-zinc-600")}
                    />
                    {organisationError ? (
                      <p className={errorTextClass} role="alert">
                        {organisationError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="picker-situation" className={compactLabelClass}>
                      {t.form.fields.situation}
                    </label>
                    <textarea
                      id="picker-situation"
                      name="situation"
                      value={situation}
                      onChange={(event) => onSituationChange(event.target.value)}
                      className={cn(compactTextareaClass, situationError && "border-zinc-600")}
                    />
                    {situationError ? (
                      <p className={errorTextClass} role="alert">
                        {situationError}
                      </p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#3F7569] px-7 py-3.5 text-sm font-medium leading-snug tracking-wide text-white transition duration-150 hover:bg-[#35685D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F7569] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-600 disabled:hover:bg-zinc-200"
                >
                  {isSubmitting
                    ? t.form.submit.submitting
                    : locale === "sv"
                      ? "Skicka bokningsförfrågan"
                      : "Send booking request"}
                </button>
                <p className="mt-4 text-center text-[0.8125rem] leading-relaxed text-zinc-500">
                  {t.form.confidentialityNote}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <input type="hidden" name="onskatDatum" value={selectedDate} />
        {dateError ? (
          <p className={errorTextClass} role="alert">
            {dateError}
          </p>
        ) : null}
      </div>

      <input type="hidden" name="onskadTid" value={selectedSlotStart} />
      <input type="hidden" name="onskadTidSlut" value={selectedSlotEnd} />
      {windowError ? (
        <p className={errorTextClass} role="alert">
          {windowError}
        </p>
      ) : null}
    </div>
  );
}
```

---

## File: src/components/ui/calendar.tsx

### Affected route(s)
shared — /kontakt, /en/kontakt

### Public-facing purpose
Calendar primitive used by the scheduling picker.

No public-facing copy in this file.

### Current source

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: CalendarProps) {
  const defaultClassNames = {
    months: "relative flex flex-col sm:flex-row gap-4",
    month: "w-full",
    month_caption: "relative mx-10 mb-1 flex h-9 items-center justify-center z-20",
    caption_label: "text-sm font-medium capitalize text-zinc-900",
    nav: "absolute top-0 flex w-full justify-between z-10",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "size-9 text-zinc-500 hover:text-zinc-900 p-0",
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "size-9 text-zinc-500 hover:text-zinc-900 p-0",
    ),
    weekday: "size-9 p-0 text-[0.6875rem] font-medium tracking-[0.08em] text-zinc-500",
    day_button:
      "relative flex size-9 items-center justify-center whitespace-nowrap rounded-full p-0 text-sm text-zinc-800 outline-offset-2 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 focus:outline-none group-data-[disabled]:pointer-events-none focus-visible:z-10 hover:bg-zinc-100 group-data-[selected]:bg-zinc-900 hover:text-zinc-900 group-data-[selected]:text-white group-data-[disabled]:text-zinc-300 group-data-[outside]:text-zinc-300 group-data-[outside]:group-data-[selected]:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900/70",
    day: "group size-9 px-0 text-sm",
    range_start: "range-start",
    range_end: "range-end",
    range_middle: "range-middle",
    today:
      "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-zinc-900 [&[data-selected]:not(.range-middle)>*]:after:bg-white [&[data-disabled]>*]:after:bg-zinc-300 *:after:transition-colors",
    outside: "text-zinc-300 data-selected:bg-zinc-100 data-selected:text-zinc-800",
    hidden: "invisible",
    week_number: "size-9 p-0 text-xs font-medium text-zinc-500",
  };

  const mergedClassNames: typeof defaultClassNames = Object.keys(defaultClassNames).reduce(
    (acc, key) => ({
      ...acc,
      [key]: classNames?.[key as keyof typeof classNames]
        ? cn(
            defaultClassNames[key as keyof typeof defaultClassNames],
            classNames[key as keyof typeof classNames],
          )
        : defaultClassNames[key as keyof typeof defaultClassNames],
    }),
    {} as typeof defaultClassNames,
  );

  const defaultComponents = {
    Chevron: (chevronProps: { orientation?: "left" | "right" | "up" | "down" }) => {
      if (chevronProps.orientation === "left") {
        return <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />;
      }
      return <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />;
    },
  };

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
```

---

## File: src/lib/i18n/dictionaries/sv.ts

### Affected route(s)
shared — all Swedish routes

### Public-facing purpose
Swedish message dictionary: navigation, footer, CTA and form strings.

### Current source

```ts
export const svDictionary = {
  localeLabel: "Svenska",
  languageSwitcher: {
    ariaLabel: "Välj språk",
    english: "English",
    swedish: "Svenska",
    switchToEnglish: "Byt språk till engelska",
    switchToSwedish: "Byt språk till svenska",
  },
  nav: {
    mainAria: "Huvudnavigation",
    mobileAria: "Mobil navigation",
    menuOpen: "Öppna meny",
    menuClose: "Stäng meny",
    home: "Start",
    coaching: "Coaching",
    about: "Om CVB Coaching",
    contact: "Kontakt",
    login: "Klientinloggning",
    leadershipLabel: "Två vägar in",
    startHereLabel: "Osäker?",
    unsureTitle: "Vet du inte vilken väg som är din?",
    unsureBody:
      "Börja med ett samtal. Vi avgör tillsammans var frågan hör hemma.",
    bookFirstCall: "Boka ett inledande samtal →",
  },
  footer: {
    description:
      "Individuell coaching och business coaching, från Göteborg.",
    services: "Coaching",
    about: "Om",
    portal: "Portal",
    login: "Logga in",
    clientPortal: "Logga in – klient",
    coachLogin: "Logga in – coach",
    copyright: "© 2026 CVB Coaching",
  },
  cta: {
    primary: "Boka ett första samtal",
    secondary: "Se de två sätten att arbeta",
    tertiary: "Omfattning och investering",
    engagementLink: "Så går det till →",
  },
  form: {
    generalError: "Fyll i de obligatoriska fälten innan du skickar förfrågan.",
    emailError: "Ange en giltig e-postadress.",
    fieldRequired: "Detta fält är obligatoriskt.",
    selectRequired: "Välj ett alternativ.",
    successMessage: "Tack. Din förfrågan är mottagen.",
    bookingSuccessMessage:
      "Tack för din förfrågan. CVB Coaching återkommer med en bekräftelse.",
    submitError: "Förfrågan kunde inte skickas just nu. Försök igen om en stund.",
    ariaLabel: "Kontaktformulär",
    optional: "valfritt",
    continue: "Fortsätt",
    submitAnyway: "Skicka ändå",
    confidentialityNote: "All kontakt hanteras konfidentiellt.",
    sections: {
      contact: "Kontaktuppgifter",
      scheduling: "Boka ett inledande telefonsamtal",
      situation: "Situation",
      nextStep: "Nästa steg",
    },
    fields: {
      name: "Namn",
      organization: "Organisation",
      role: "Roll",
      email: "E-post",
      phone: "Telefon",
      city: "Ort",
      question: "Vad gäller det?",
      phase: "Vilket läge står ni i?",
      situation: "Vad vill du ta upp?",
      clarity: "Vad behöver bli tydligare?",
      timing: "När vill du komma vidare?",
      preferredDate: "Datum",
      preferredTime: "Tid på dagen",
    },
    schedulingHint: "Välj en tid som passar dig. CVB Coaching bekräftar bokningen.",
    timeSlotAria: "Välj tid på dagen",
    timeWindows: {
      "08_10": "08:00–10:00",
      "10_12": "10:00–12:00",
      "12_14": "12:00–14:00",
      "14_16": "14:00–16:00",
      "16_17": "16:00–17:00",
    },
    submit: {
      idle: "Skicka förfrågan",
      submitting: "Skickar…",
    },
  },
} as const;
```

---

## File: src/lib/i18n/dictionaries/en.ts

### Affected route(s)
shared — all English routes

### Public-facing purpose
English message dictionary: navigation, footer, CTA and form strings.

### Current source

```ts
export const enDictionary = {
  localeLabel: "English",
  languageSwitcher: {
    ariaLabel: "Select language",
    english: "English",
    swedish: "Svenska",
    switchToEnglish: "Switch language to English",
    switchToSwedish: "Switch language to Swedish",
  },
  nav: {
    mainAria: "Main navigation",
    mobileAria: "Mobile navigation",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    home: "Home",
    coaching: "Coaching",
    about: "About Carolina",
    contact: "Contact",
    login: "Client login",
    leadershipLabel: "Two ways in",
    startHereLabel: "Not sure?",
    unsureTitle: "Not sure which way is yours?",
    unsureBody:
      "Start with a conversation. We work out together where the question belongs.",
    bookFirstCall: "Book an initial conversation →",
  },
  footer: {
    description: "Individual coaching and business coaching, from Gothenburg.",
    services: "Coaching",
    about: "About",
    portal: "Portal",
    login: "Log in",
    clientPortal: "Log in – client",
    coachLogin: "Log in – coach",
    copyright: "© 2026 CVB Coaching",
  },
  cta: {
    primary: "Book an initial conversation",
    secondary: "Two ways in",
    tertiary: "Scope",
    engagementLink: "How it works →",
  },
  form: {
    generalError: "Please complete all required fields before submitting your request.",
    emailError: "Enter a valid email address.",
    fieldRequired: "This field is required.",
    selectRequired: "Please choose an option.",
    successMessage: "Thank you. Your request has been received.",
    bookingSuccessMessage:
      "Thank you for your request. CVB Coaching will follow up with a confirmation.",
    submitError: "Your request could not be sent right now. Please try again shortly.",
    ariaLabel: "Contact form",
    optional: "optional",
    continue: "Continue",
    submitAnyway: "Send anyway",
    confidentialityNote: "All contact is handled confidentially.",
    sections: {
      contact: "Contact details",
      scheduling: "Book an initial phone call",
      situation: "Current situation",
      nextStep: "Next step",
    },
    fields: {
      name: "Name",
      organization: "Organisation",
      role: "Role",
      email: "Email",
      phone: "Phone",
      city: "Location",
      question: "What is this about?",
      phase: "What situation are you in?",
      situation: "What would you like to bring?",
      clarity: "What needs to become clearer?",
      timing: "When do you want to move forward?",
      preferredDate: "Date",
      preferredTime: "Time of day",
    },
    schedulingHint: "Choose a time that suits you. CVB Coaching will confirm the booking.",
    timeSlotAria: "Select time of day",
    timeWindows: {
      "08_10": "08:00–10:00",
      "10_12": "10:00–12:00",
      "12_14": "12:00–14:00",
      "14_16": "14:00–16:00",
      "16_17": "16:00–17:00",
    },
    submit: {
      idle: "Send request",
      submitting: "Sending…",
    },
  },
} as const;
```

---

## File: src/lib/i18n/index.ts

### Affected route(s)
shared — all routes

### Public-facing purpose
Dictionary type contract and locale resolution helpers.

No public-facing copy in this file.

### Current source

```ts
import { enDictionary } from "@/lib/i18n/dictionaries/en";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

export type Dictionary = {
  localeLabel: string;
  languageSwitcher: {
    ariaLabel: string;
    english: string;
    swedish: string;
    switchToEnglish: string;
    switchToSwedish: string;
  };
  nav: {
    mainAria: string;
    mobileAria: string;
    menuOpen: string;
    menuClose: string;
    home: string;
    coaching: string;
    about: string;
    contact: string;
    leadershipLabel: string;
    startHereLabel: string;
    unsureTitle: string;
    unsureBody: string;
    bookFirstCall: string;
    login: string;
  };
  footer: {
    description: string;
    services: string;
    about: string;
    portal: string;
    login: string;
    clientPortal: string;
    coachLogin: string;
    copyright: string;
  };
  cta: {
    primary: string;
    secondary: string;
    tertiary: string;
    engagementLink: string;
  };
  form: {
    generalError: string;
    emailError: string;
    fieldRequired: string;
    selectRequired: string;
    successMessage: string;
    bookingSuccessMessage: string;
    submitError: string;
    ariaLabel: string;
    optional: string;
    continue: string;
    submitAnyway: string;
    confidentialityNote: string;
    schedulingHint: string;
    timeSlotAria: string;
    timeWindows: {
      "08_10": string;
      "10_12": string;
      "12_14": string;
      "14_16": string;
      "16_17": string;
    };
    sections: {
      contact: string;
      scheduling: string;
      situation: string;
      nextStep: string;
    };
    fields: {
      name: string;
      organization: string;
      role: string;
      email: string;
      phone: string;
      city: string;
      question: string;
      phase: string;
      situation: string;
      clarity: string;
      timing: string;
      preferredDate: string;
      preferredTime: string;
    };
    submit: {
      idle: string;
      submitting: string;
    };
  };
};

export function getDictionary(locale: Locale): Dictionary {
  if (locale === "en") {
    return enDictionary;
  }

  return svDictionary;
}

export function getDictionaryForOptionalLocale(locale?: Locale): Dictionary {
  return getDictionary(locale ?? defaultLocale);
}
```

---

## File: src/lib/i18n/config.ts

### Affected route(s)
shared — all routes

### Public-facing purpose
Locale configuration and locale-aware path helpers used by the language switcher.

No public-facing copy in this file.

### Current source

```ts
export const locales = ["sv", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "sv";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function stripLocaleFromPath(pathname: string): string {
  if (!pathname.startsWith("/")) {
    return "/";
  }

  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (isLocale(maybeLocale)) {
    const rest = `/${segments.slice(2).join("/")}`;
    return rest === "/" ? "/" : rest.replace(/\/+$/, "") || "/";
  }

  return pathname === "" ? "/" : pathname;
}

export function toLocalePath(pathname: string, locale: Locale): string {
  const barePath = stripLocaleFromPath(pathname);

  if (locale === defaultLocale) {
    return barePath;
  }

  return barePath === "/" ? `/${locale}` : `/${locale}${barePath}`;
}

export function localeFromPathname(pathname: string): Locale {
  const maybeLocale = pathname.split("/")[1];
  return isLocale(maybeLocale) ? maybeLocale : defaultLocale;
}
```

---

## File: src/app/klient-login/page.tsx

### Affected route(s)
/klient-login

### Public-facing purpose
Pre-authentication client login page and its metadata.

### Current source

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import "@/components/klient/klient-tokens.css";
import { LogoMark } from "@/components/brand/logo";
import { redirect } from "next/navigation";
import LoginForm from "@/components/portal/login-form";
import { portalOutlineButtonClass } from "@/components/portal/ui";
import { readSession } from "@/lib/portal/session";
import { demoHint } from "@/lib/portal/users";

export const metadata: Metadata = {
  title: "CVB Base | CVB Coaching",
  description: "Logga in i CVB Base hos CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function ClientLoginPage() {
  const session = await readSession();
  if (session?.role === "klient") redirect("/klient");

  return (
    <main id="main-content" data-klient-portal className="portal-login-bg flex min-h-[100svh] flex-col text-zinc-900">
      <div className="flex flex-1 items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full max-w-[26rem]">
          <Link
            href="/"
            className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
          >
            <LogoMark className="h-16 w-auto" priority />
          </Link>

          <h1 className="mt-9 text-[1.9rem] font-medium leading-[1.2] tracking-tight text-zinc-900">
            Din coaching, samlad på ett ställe.
          </h1>
          <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-600">
            Följ dina sessioner, förberedelser, reflektioner och åtaganden genom hela coachingprocessen.
            CVB Base ger dig kontinuitet, överblick och tillgång till ditt delade material mellan samtalen.
          </p>

          <p className="mt-8 font-serif text-[1.375rem] font-medium leading-[1.15] tracking-tight text-zinc-900">
            CVB BASE
          </p>

          <div className="portal-login-glass mt-6 rounded-2xl border p-6 md:p-7">
            <LoginForm demo={demoHint("klient")} role="klient" redirectTo="/klient" />
          </div>

          <Link href="/" className={`mt-8 w-full ${portalOutlineButtonClass}`}>
            Tillbaka
          </Link>
        </div>
      </div>
    </main>
  );
}
```

---

## File: src/app/coach-login/page.tsx

### Affected route(s)
/coach-login

### Public-facing purpose
Pre-authentication coach login page and its metadata.

### Current source

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import "@/components/klient/klient-tokens.css";
import { LogoMark } from "@/components/brand/logo";
import { redirect } from "next/navigation";
import LoginForm from "@/components/portal/login-form";
import { portalOutlineButtonClass } from "@/components/portal/ui";
import { readSession } from "@/lib/portal/session";
import { demoHint } from "@/lib/portal/users";

export const metadata: Metadata = {
  title: "CVB Base – Coach | CVB Coaching",
  description: "Logga in i CVB Base som coach hos CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function CoachLoginPage() {
  const session = await readSession();
  if (session?.role === "coach") redirect("/cvb-base");

  return (
    <main id="main-content" data-portal className="portal-login-bg flex min-h-[100svh] flex-col text-zinc-900">
      <div className="flex flex-1 items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full max-w-[26rem]">
          <Link
            href="/"
            className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
          >
            <LogoMark className="h-16 w-auto" priority />
          </Link>

          <h1 className="mt-9 text-[1.9rem] font-medium leading-[1.15] tracking-tight text-zinc-900">
            CVB Base
          </h1>
          <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-600">
            Tillgång till klienter, uppdrag, sessioner och förberedelser.
          </p>

          <div className="portal-login-glass mt-8 rounded-2xl border p-6 md:p-7">
            <LoginForm demo={demoHint("coach")} role="coach" redirectTo="/cvb-base" />
          </div>

          <p className="mt-6 text-[0.8125rem] leading-relaxed text-zinc-500">
            <Link href="/klient-login" className="text-zinc-700 underline underline-offset-4 hover:text-zinc-950">
              Logga in som klient
            </Link>
          </p>

          <Link href="/" className={`mt-8 w-full ${portalOutlineButtonClass}`}>
            Tillbaka
          </Link>
        </div>
      </div>
    </main>
  );
}
```

---

## File: src/app/logga-in/page.tsx

### Affected route(s)
/logga-in

### Public-facing purpose
Pre-authentication login entry route.

### Current source

```tsx
import { redirect } from "next/navigation";

/** Gammal inloggningsväg. Behålls så att bokmärken fortsätter fungera. */
export default function LegacyLoginPage() {
  redirect("/coach-login");
}
```

---

## File: src/app/cvb-base/layout.tsx

### Affected route(s)
/cvb-base/* (pre-authentication only)

### Public-facing purpose
CVB Base layout. Publicly reachable only insofar as it redirects unauthenticated visitors to /coach-login and declares noindex metadata; all content below it is authenticated.

### Current source

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import "@/components/klient/klient-tokens.css";
import { PortalDesktopNav, PortalMobileNav } from "@/components/portal/portal-nav";
import { LogoMark } from "@/components/brand/logo";
import { formatWeekdayDate, todayIso } from "@/lib/portal/format";
import { readCoachSession } from "@/lib/portal/session";

export const metadata: Metadata = {
  title: "CVB Base | CVB Coaching",
  description: "CVB Base för coacher i CVB Coaching.",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await readCoachSession();
  if (!session) {
    redirect("/coach-login");
  }

  const today = todayIso();

  return (
    <div data-portal className="flex min-h-[100svh] flex-col bg-[var(--klient-page-bg)] text-zinc-900">
      <header
        className="sticky top-0 z-30 border-b border-[var(--klient-border-muted)] bg-[var(--klient-page-bg)]/98 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto w-full max-w-4xl px-5 md:px-6 xl:max-w-5xl">
          <div className="flex items-center justify-between gap-3 pb-3.5 pt-6 md:pt-7">
            <Link
              href="/cvb-base"
              className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--klient-page-bg)]"
            >
              <LogoMark className="h-12 w-auto md:h-14" priority />
            </Link>

            <div className="flex items-center gap-3">
              <time
                dateTime={today}
                className="shrink-0 text-right text-[0.6875rem] font-normal leading-snug text-zinc-500 md:hidden"
              >
                {formatWeekdayDate(today)}
              </time>
              <PortalMobileNav />
            </div>
          </div>

          <div className="hidden border-t border-[var(--klient-border-muted)] pb-3 pt-3 md:block">
            <PortalDesktopNav />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full min-w-0 max-w-4xl flex-1 overflow-x-clip px-5 pb-16 pt-6 md:px-6 md:pt-10 xl:max-w-5xl"
      >
        {children}
      </main>
    </div>
  );
}
```

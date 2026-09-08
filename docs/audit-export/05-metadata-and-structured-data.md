# 05 — Metadata and structured data

Repository: redrider81/forsa
Branch: main
Commit: 088ffd03c531b59dc2772714249af8fa87a50654

Page metadata exports, structured data, robots configuration and locale routing.

Generated read-only from the current local HEAD. No secrets, environment values, credentials, tokens, private URLs or client data are included.

---

## Page title inventory

Full `metadata` exports (title + description) appear inline in each page's source in
files 01–04a and 06. Titles at HEAD:

| Route | Source | `metadata.title` |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | CVB Coaching – individuell coaching och business coaching i Göteborg |
| `/individuell-coaching` | `src/app/individuell-coaching/page.tsx` | Individuell coaching i Göteborg | CVB Coaching |
| `/business-coaching` | `src/app/business-coaching/page.tsx` | Business coaching i Göteborg | CVB Coaching |
| `/om-oss` | `src/app/om-oss/page.tsx` | Carolina von Braun – coach i Göteborg | CVB Coaching |
| `/kontakt` | `src/app/kontakt/page.tsx` | Boka ett första samtal | CVB Coaching |
| `/en` | `src/app/en/page.tsx` | CVB Coaching – individual and business coaching in Gothenburg |
| `/en/individuell-coaching` | `src/app/en/individuell-coaching/page.tsx` | Individual coaching in Gothenburg | CVB Coaching |
| `/en/business-coaching` | `src/app/en/business-coaching/page.tsx` | Business coaching in Gothenburg | CVB Coaching |
| `/en/om-oss` | `src/app/en/om-oss/page.tsx` | Carolina von Braun – coach in Gothenburg | CVB Coaching |
| `/en/kontakt` | `src/app/en/kontakt/page.tsx` | Book an initial conversation | CVB Coaching |
| `/klient-login` | `src/app/klient-login/page.tsx` | Logga in – klient | CVB Coaching |
| `/coach-login` | `src/app/coach-login/page.tsx` | Logga in – coach | CVB Coaching |

## OpenGraph, Twitter, sitemap, robots, canonical, hreflang

Verified against HEAD:

- **No `openGraph` metadata key exists anywhere in `src/`.**
- **No `twitter` metadata key exists anywhere in `src/`.**
- **No `sitemap.ts` / `sitemap.xml` exists.**
- **No `robots.ts` / `robots.txt` exists.**
- **No `metadataBase` and no `alternates.canonical` are configured**, so no canonical URLs are emitted.
- **No `alternates.languages` / hreflang configuration exists.** Locale switching is
  routing-only, via the helpers in `src/lib/i18n/config.ts` below.
- The only `robots` usage is `robots: { index: false, follow: false }` on
  `/klient-login`, `/coach-login`, `/cvb-base/*` and `/klient/*`.
- The only static asset under `src/app` is `favicon.ico`.

---

## File: src/components/json-ld.tsx

### Affected route(s)
shared — mounted in src/app/layout.tsx (ProfessionalService) and src/app/om-oss/page.tsx (Person)

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

## File: src/lib/i18n/config.ts

### Affected route(s)
shared — all routes

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

## File: src/lib/i18n/index.ts

### Affected route(s)
shared — all routes

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

## File: next.config.ts

### Affected route(s)
shared — retired public routes and legacy paths

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

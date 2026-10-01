import { existsSync, readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

/**
 * Public legal surfaces: the four legal pages in both locales, the footer
 * links, and the privacy information at the booking form's submit point.
 *
 * Pages and components are rendered to HTML with react-dom/server. The
 * animation wrapper, next/link and the pathname hook are replaced with
 * plain stand-ins so the markup can be asserted without a browser.
 */

let pathname = "/";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ refresh: () => {}, push: () => {}, replace: () => {} }),
}));
vi.mock("@/components/animations/HeroReveal", () => ({
  default: ({ children }: { children: ReactNode }) => createElement("div", null, children),
}));

import SiteFooter from "@/components/site-footer";
import BookingPrivacyNotice from "@/components/booking-privacy-notice";
import { getDictionary } from "@/lib/i18n";
import { LEGAL_PATHS, legalHref, legalLinks } from "@/lib/legal/links";
import { LEGAL_ENTITY } from "@/lib/legal/company";
import { companyFacts, type LegalDocument, type LegalInline } from "@/lib/legal/document";
import { privacyDocument } from "@/lib/legal/content/privacy";
import { termsDocument } from "@/lib/legal/content/terms";
import { baseTermsDocument } from "@/lib/legal/content/base-terms";
import { cookiesDocument } from "@/lib/legal/content/cookies";

import SvPrivacy, { metadata as svPrivacyMeta } from "@/app/integritet/page";
import SvTerms, { metadata as svTermsMeta } from "@/app/villkor/page";
import SvBaseTerms, { metadata as svBaseTermsMeta } from "@/app/cvb-base-villkor/page";
import SvCookies, { metadata as svCookiesMeta } from "@/app/cookies/page";
import EnPrivacy, { metadata as enPrivacyMeta } from "@/app/en/integritet/page";
import EnTerms, { metadata as enTermsMeta } from "@/app/en/villkor/page";
import EnBaseTerms, { metadata as enBaseTermsMeta } from "@/app/en/cvb-base-villkor/page";
import EnCookies, { metadata as enCookiesMeta } from "@/app/en/cookies/page";

const render = (node: ReturnType<typeof createElement>) => renderToStaticMarkup(node);
const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf-8");

const ROUTES = [
  { path: "/integritet", Page: SvPrivacy, meta: svPrivacyMeta, doc: privacyDocument("sv") },
  { path: "/villkor", Page: SvTerms, meta: svTermsMeta, doc: termsDocument("sv") },
  { path: "/cvb-base-villkor", Page: SvBaseTerms, meta: svBaseTermsMeta, doc: baseTermsDocument("sv") },
  { path: "/cookies", Page: SvCookies, meta: svCookiesMeta, doc: cookiesDocument("sv") },
  { path: "/en/integritet", Page: EnPrivacy, meta: enPrivacyMeta, doc: privacyDocument("en") },
  { path: "/en/villkor", Page: EnTerms, meta: enTermsMeta, doc: termsDocument("en") },
  { path: "/en/cvb-base-villkor", Page: EnBaseTerms, meta: enBaseTermsMeta, doc: baseTermsDocument("en") },
  { path: "/en/cookies", Page: EnCookies, meta: enCookiesMeta, doc: cookiesDocument("en") },
] as const;

function allText(doc: LegalDocument): string {
  const inline = (parts: LegalInline[]) => parts.map((part) => (typeof part === "string" ? part : part.label)).join("");
  return [
    doc.title,
    doc.lead,
    ...doc.sections.flatMap((section) => [
      section.heading,
      ...section.blocks.map((block) =>
        block.kind === "p"
          ? inline(block.content)
          : block.kind === "list"
            ? block.items.map(inline).join("\n")
            : block.items.map((item) => `${item.term} ${inline(item.value)}`).join("\n"),
      ),
    ]),
  ].join("\n");
}

function allLinks(doc: LegalDocument): string[] {
  const hrefs: string[] = [];
  const collect = (parts: LegalInline[]) =>
    parts.forEach((part) => typeof part !== "string" && hrefs.push(part.href));
  for (const section of doc.sections) {
    for (const block of section.blocks) {
      if (block.kind === "p") collect(block.content);
      else if (block.kind === "list") block.items.forEach(collect);
      else block.items.forEach((item) => collect(item.value));
    }
  }
  return hrefs;
}

// ------------------------------------------------------------------ routes

describe("legal routes", () => {
  it.each(ROUTES)("$path has a page file, metadata and renders its document", ({ path, Page, meta, doc }) => {
    const file = path.startsWith("/en/") ? `src/app${path}/page.tsx` : `src/app${path}/page.tsx`;
    expect(existsSync(new URL(`../${file}`, import.meta.url))).toBe(true);
    expect(meta.title).toBe(doc.metaTitle);
    expect(meta.description).toBe(doc.metaDescription);
    // Indexable: no robots override, unlike the portal pages.
    expect(meta).not.toHaveProperty("robots");

    const html = render(createElement(Page));
    expect(html).toContain('id="main-content"');
    expect(html).toContain(`>${doc.title}</h1>`);
    for (const section of doc.sections) {
      expect(html).toContain(`id="${section.id}"`);
    }
  });

  it("English pages render the English document and Swedish pages the Swedish one", () => {
    expect(render(createElement(SvPrivacy))).toContain("Integritetspolicy");
    expect(render(createElement(EnPrivacy))).toContain("Privacy policy");
    expect(render(createElement(EnPrivacy))).not.toContain("Integritetspolicy</h1>");
  });

  it("every internal link on a legal page points to an existing legal route in the same locale", () => {
    for (const { path, doc } of ROUTES) {
      const locale = path.startsWith("/en/") ? "en" : "sv";
      for (const href of allLinks(doc)) {
        if (/^(https?:|mailto:)/.test(href)) continue;
        const allowed = Object.keys(LEGAL_PATHS).map((key) => legalHref(key as keyof typeof LEGAL_PATHS, locale));
        expect(allowed).toContain(href);
      }
    }
  });

  it("section ids are unique within each page", () => {
    for (const { doc } of ROUTES) {
      const ids = doc.sections.map((section) => section.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

// ------------------------------------------------------------------ content integrity

describe("legal content", () => {
  const texts = ROUTES.map(({ path, doc }) => ({ path, text: allText(doc) }));

  it("makes no unverifiable compliance or security claims", () => {
    const forbidden = [
      /GDPR[- ]compliant/i,
      /GDPR-säker/i,
      /100\s?%/,
      // "Inget system kan vara helt säkert" is the disclaimer, not a claim.
      /(?<!kan vara )helt säker/i,
      /(?<!can be )completely secure/i,
      /fullt krypterad/i,
      /fully encrypted/i,
      /ser aldrig personuppgifter/i,
      /never sees personal data/i,
      /stannar i Sverige/i,
      /stays in Sweden/i,
      /lämnar (inte|aldrig) EU/i,
      /never leaves? the EU/i,
    ];
    for (const { path, text } of texts) {
      for (const pattern of forbidden) {
        expect(text, `${path} matched ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("does not name transient AI model versions", () => {
    for (const { text } of texts) {
      expect(text).not.toMatch(/gpt-?\d/i);
    }
  });

  it("publishes no placeholders or invented identifiers", () => {
    for (const { text } of texts) {
      expect(text).not.toMatch(/XXX|TODO|lorem|\[.*?\]/i);
      // No personnummer or organisationsnummer-shaped numbers at all.
      expect(text).not.toMatch(/\b\d{6}(\d{2})?[-+]\d{4}\b/);
    }
  });

  it("does not claim a business form or registration that does not exist", () => {
    expect(LEGAL_ENTITY.registration).toBeNull();
    for (const { path, text } of texts) {
      expect(text, path).not.toMatch(
        /organisationsnummer|företagsform|registrerat (bolag|företag|företagsnamn|namn)|aktiebolag|enskild (firma|näringsidkare)|\bAB\b|registration number|business form|registered (company|business|name)|limited company|sole trader/i,
      );
    }
    expect(LEGAL_ENTITY.phone).toBeNull();
    expect(texts.map((t) => t.text).join("\n")).not.toMatch(/Telefon|Phone/);
  });

  it("names Carolina von Braun as controller and contracting party, with the verified address", () => {
    const sv = allText(privacyDocument("sv"));
    expect(sv).toContain(
      "Personuppgiftsansvarig för den behandling som beskrivs här är Carolina von Braun, som driver CVB Coaching.",
    );
    expect(allText(privacyDocument("en"))).toContain("The controller for the processing described here is Carolina von Braun, who runs CVB Coaching.");
    expect(allText(termsDocument("sv"))).toContain("Avtalspart för CVB Coachings tjänster är Carolina von Braun.");
    for (const doc of [privacyDocument("sv"), privacyDocument("en"), termsDocument("sv"), termsDocument("en")]) {
      expect(allText(doc)).toContain("Skårsgatan 53, 412 69 Göteborg");
    }
    expect(allText(termsDocument("sv"))).toContain(
      "Till: Carolina von Braun (CVB Coaching), Skårsgatan 53, 412 69 Göteborg, carolina@cvbcoaching.se",
    );
  });

  it("uses carolina@cvbcoaching.se as the legal contact — never another address", () => {
    for (const { path, text } of texts) {
      expect(text, path).toContain(LEGAL_ENTITY.legalEmail);
      expect(text, path).not.toMatch(/info@cvbcoaching|gmail|kontakt@cvbcoaching/i);
    }
    expect(LEGAL_ENTITY.legalEmail).toBe("carolina@cvbcoaching.se");
  });

  it("shows business form and organisation number once a registration is recorded, without text changes", () => {
    const entity = LEGAL_ENTITY as { registration: unknown };
    entity.registration = {
      registeredName: "Testnamn",
      businessFormSv: "Testform",
      businessFormEn: "Test form",
      organisationNumber: "000000-0000",
    };
    try {
      const block = companyFacts("sv");
      const terms = block.kind === "facts" ? block.items.map((item) => item.term) : [];
      expect(terms).toEqual(expect.arrayContaining(["Registrerat namn", "Företagsform", "Organisationsnummer"]));
      expect(allText(privacyDocument("sv"))).toContain("Personuppgiftsansvarig för den behandling som beskrivs här är Testnamn");
    } finally {
      entity.registration = null;
    }
  });

  it("privacy policy covers the required GDPR information", () => {
    const sv = allText(privacyDocument("sv"));
    for (const needle of [
      "Personuppgiftsansvarig",
      "Rättslig grund",
      "artikel 6.1 b",
      "artikel 6.1 f",
      "Supabase",
      "Vercel",
      "OpenAI",
      "Resend",
      "USA",
      "Hur länge uppgifterna sparas",
      "rättade",
      "raderade",
      "begränsas",
      "invända",
      "dataportabilitet",
      "Integritetsskyddsmyndigheten",
      "inte ska spara svaren",
      "automatiserade beslut",
      "privat",
    ]) {
      expect(sv, needle).toContain(needle);
    }
  });

  it("privacy policy states what the AI does not receive", () => {
    const sv = allText(privacyDocument("sv"));
    expect(sv).toContain("Material och filer — varken privata eller delade — ingår inte i underlaget.");
    expect(sv).toContain("Carolinas egna arbetsanteckningar");
    const en = allText(privacyDocument("en"));
    expect(en).toContain("Material and files — neither private nor shared — are not part of the input.");
  });

  it("terms cover the statutory consumer points without contracting out of them", () => {
    const sv = allText(termsDocument("sv"));
    for (const needle of [
      "inte medicinsk behandling, psykoterapi",
      "Uppdragsgivare",
      "14 dagar",
      "Ångra avtalet här",
      "Standardformulär för utövande av ångerrätt",
      "begränsar aldrig de rättigheter du har som konsument",
      "Allmänna reklamationsnämnden",
      "Svensk lag gäller",
    ]) {
      expect(sv, needle).toContain(needle);
    }
    expect(sv).toContain("Att en session har ägt rum betyder inte i sig att ångerrätten har upphört.");
  });

  it("cookie policy matches the implementation: only the auth cookie, no banner, no tracking", () => {
    const sv = allText(cookiesDocument("sv"));
    expect(sv).toContain("inga cookies för statistik, marknadsföring eller spårning");
    expect(sv).toContain("sb-…-auth-token");
    expect(sv).toContain("ingen cookiebanner");
  });

  it("the codebase contains no analytics or tracking that the cookie policy would have to disclose", () => {
    const pkg = source("package.json");
    for (const tracker of ["@vercel/analytics", "@vercel/speed-insights", "gtag", "posthog", "mixpanel", "hotjar", "clarity", "plausible", "segment"]) {
      expect(pkg).not.toContain(tracker);
    }
    const layout = source("src/app/layout.tsx");
    expect(layout).not.toMatch(/googletagmanager|gtag|fbq|clarity/i);
  });

  it("English texts carry the same material rights as the Swedish ones", () => {
    const enTerms = allText(termsDocument("en"));
    expect(enTerms).toContain("14 days");
    expect(enTerms).toContain("Model withdrawal form");
    const enPrivacy = allText(privacyDocument("en"));
    expect(enPrivacy).toContain("Swedish Authority for Privacy Protection");
    for (const locale of ["sv", "en"] as const) {
      expect(privacyDocument(locale).sections.length).toBe(privacyDocument("sv").sections.length);
      expect(termsDocument(locale).sections.length).toBe(termsDocument("sv").sections.length);
      expect(baseTermsDocument(locale).sections.length).toBe(baseTermsDocument("sv").sections.length);
      expect(cookiesDocument(locale).sections.length).toBe(cookiesDocument("sv").sections.length);
    }
  });
});

// ------------------------------------------------------------------ footer

describe("footer legal links", () => {
  it("legalLinks resolve per locale", () => {
    expect(legalLinks("sv").map((l) => [l.title, l.href])).toEqual([
      ["Integritet", "/integritet"],
      ["Villkor", "/villkor"],
      ["CVB Base-villkor", "/cvb-base-villkor"],
      ["Cookies", "/cookies"],
    ]);
    expect(legalLinks("en").map((l) => l.href)).toEqual([
      "/en/integritet",
      "/en/villkor",
      "/en/cvb-base-villkor",
      "/en/cookies",
    ]);
  });

  it("the Swedish footer links to the Swedish legal pages", () => {
    pathname = "/";
    const html = render(createElement(SiteFooter));
    for (const [title, href] of [
      ["Integritet", "/integritet"],
      ["Villkor", "/villkor"],
      ["CVB Base-villkor", "/cvb-base-villkor"],
      ["Cookies", "/cookies"],
    ]) {
      expect(html).toContain(`href="${href}"`);
      expect(html).toContain(`>${title}</a>`);
    }
    expect(html).not.toContain('href="/en/integritet"');
  });

  it("the English footer links to the English legal pages", () => {
    pathname = "/en/kontakt";
    const html = render(createElement(SiteFooter));
    for (const href of ["/en/integritet", "/en/villkor", "/en/cvb-base-villkor", "/en/cookies"]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).toContain(">Privacy</a>");
    expect(html).not.toContain('href="/integritet"');
  });

  it("keeps the four-column footer grid", () => {
    pathname = "/";
    const html = render(createElement(SiteFooter));
    expect(html.match(/<h3 /g)?.length).toBe(4);
  });
});

// ------------------------------------------------------------------ booking form

describe("booking form privacy information", () => {
  it("renders the Swedish notice with a link to the privacy policy", () => {
    const html = render(createElement(BookingPrivacyNotice, { locale: "sv", t: getDictionary("sv") }));
    expect(html).toContain(
      "När du skickar förfrågan behandlar CVB Coaching dina uppgifter för att hantera din bokning och kontakt med dig.",
    );
    expect(html).toContain('href="/integritet"');
    expect(html).toContain(">integritetspolicyn</a>");
  });

  it("renders the English notice with a link to the English privacy policy", () => {
    const html = render(createElement(BookingPrivacyNotice, { locale: "en", t: getDictionary("en") }));
    expect(html).toContain("When you send the request, CVB Coaching processes your details");
    expect(html).toContain('href="/en/integritet"');
  });

  it("is information, not a consent checkbox", () => {
    const html = render(createElement(BookingPrivacyNotice, { locale: "sv", t: getDictionary("sv") }));
    expect(html).not.toContain("<input");
  });

  it("is shown at both submit points of the booking form", () => {
    const picker = source("src/components/contact-scheduling-picker.tsx");
    const intake = source("src/components/contact-intake-form.tsx");
    expect(picker).toContain("<BookingPrivacyNotice locale={locale} t={t}");
    expect(intake).toContain("<BookingPrivacyNotice locale={locale} t={t} />");
    // No consent checkbox was introduced into the booking flow.
    expect(picker).not.toMatch(/type="checkbox"/);
    expect(intake).not.toMatch(/type="checkbox"/);
  });
});

// ------------------------------------------------------------------ portal entry points

describe("login and profile links", () => {
  it("client login links to privacy and CVB Base terms", () => {
    const page = source("src/app/klient-login/page.tsx");
    expect(page).toContain("<PortalLegalLinks");
    const links = source("src/components/portal/portal-legal-links.tsx");
    expect(links).toContain('keys = ["privacy", "baseTerms"]');
  });

  it("client profile links to privacy and CVB Base terms", () => {
    expect(source("src/app/klient/profil/page.tsx")).toContain(
      '<PortalLegalLinks keys={["privacy", "baseTerms", "terms"]}',
    );
  });

  it("coach login links to privacy only", () => {
    expect(source("src/app/carolina/page.tsx")).toContain('<PortalLegalLinks keys={["privacy"]}');
  });
});

import type { Locale } from "@/lib/i18n/config";
import { LEGAL_ENTITY, LEGAL_UPDATED_AT } from "@/lib/legal/company";
import { facts, formatUpdated, link, list, p, type LegalDocument } from "@/lib/legal/document";
import { legalHref } from "@/lib/legal/links";

/**
 * Cookie policy — audited against the code on 2026-09-30:
 *
 *   * @supabase/ssr sets the Supabase Auth session cookie(s)
 *     `sb-<project>-auth-token` (split into .0/.1 when large), default
 *     max-age 400 days, cleared on logout. Only set when logging in.
 *   * `cvb_demo_state` / `cvb_demo_materials` are legacy demo cookies that
 *     are no longer written anywhere (only read, and deleted on demo reset).
 *   * No localStorage/sessionStorage/IndexedDB, no analytics, no pixels, no
 *     third-party embeds. Fonts are self-hosted by next/font.
 *
 * Only strictly necessary technology is used, so no consent banner is shown
 * (lagen (2022:482) om elektronisk kommunikation, 9 kap. 28 §).
 */

const mail = link(LEGAL_ENTITY.legalEmail, `mailto:${LEGAL_ENTITY.legalEmail}`);

function sv(): LegalDocument {
  return {
    metaTitle: "Cookies | CVB Coaching",
    metaDescription: "Vilka cookies CVB Coachings webbplats och CVB Base använder — endast tekniskt nödvändiga.",
    label: "Cookies",
    title: "Cookiepolicy",
    lead: "Webbplatsen använder inga cookies för statistik, marknadsföring eller spårning. Den enda cookie som används är den som behövs för att hålla dig inloggad i CVB Base.",
    updatedLabel: `Senast uppdaterad ${formatUpdated(LEGAL_UPDATED_AT, "sv")}`,
    tocLabel: "Innehåll",
    sections: [
      {
        id: "vad-ar-cookies",
        heading: "Vad cookies är",
        blocks: [
          p(
            "En cookie är en liten textfil som en webbplats sparar i din webbläsare. Liknande tekniker är till exempel lokal lagring i webbläsaren (localStorage). Enligt lagen om elektronisk kommunikation ska du informeras om sådan teknik, och samtycke krävs om tekniken inte är nödvändig för att leverera den tjänst du har bett om.",
          ),
        ],
      },
      {
        id: "publika-webbplatsen",
        heading: "Den publika webbplatsen",
        blocks: [
          p(
            "När du läser på webbplatsen eller bokar ett första samtal sätts inga cookies och ingen annan information sparas i din webbläsare. Vi använder inga analysverktyg, annonspixlar eller inbäddat innehåll från tredje part, och typsnitten levereras från vår egen server.",
          ),
        ],
      },
      {
        id: "cvb-base",
        heading: "Inloggning i CVB Base",
        blocks: [
          p("När du loggar in i CVB Base används en tekniskt nödvändig cookie:"),
          facts(
            ["Namn", "sb-…-auth-token (kan delas upp i flera delar, …-auth-token.0, .1)"],
            ["Ändamål", "Håller dig inloggad och gör att tjänsten kan kontrollera vem du är och vad du har behörighet till."],
            ["Typ", "Tekniskt nödvändig, förstapartscookie. Sätts i samband med inloggning i CVB Base."],
            ["Lagringstid", "Tas bort när du loggar ut. Annars finns den kvar i webbläsaren i som längst cirka 400 dagar."],
          ),
          p(
            "Tidigare versioner av CVB Base kunde spara inställningar för demoläge i cookies (cvb_demo_state, cvb_demo_materials). De sätts inte längre, och en sådan äldre cookie försvinner av sig själv inom 30 dagar.",
          ),
          p("CVB Base använder inte lokal lagring (localStorage eller sessionStorage) i webbläsaren."),
        ],
      },
      {
        id: "samtycke",
        heading: "Därför visas ingen cookiebanner",
        blocks: [
          p(
            "Cookien för inloggning är nödvändig för att leverera den tjänst du själv har bett om — att vara inloggad i CVB Base. Sådan teknik kräver inte samtycke, och eftersom inga andra cookies används visar vi ingen cookiebanner.",
          ),
          list(
            "Du kan när som helst ta bort cookies i din webbläsares inställningar. Tar du bort inloggningscookien loggas du ut.",
            "Om vi i framtiden skulle vilja använda cookies som inte är nödvändiga, frågar vi först om ditt samtycke.",
          ),
        ],
      },
      {
        id: "mer",
        heading: "Mer information",
        blocks: [
          p(
            "Hur personuppgifter behandlas beskrivs i ",
            link("integritetspolicyn", legalHref("privacy", "sv")),
            ". Frågor skickar du till ",
            mail,
            ". Post- och telestyrelsen (PTS) har tillsyn över reglerna om cookies, ",
            link("pts.se", "https://www.pts.se"),
            ".",
          ),
        ],
      },
    ],
  };
}

function en(): LegalDocument {
  return {
    metaTitle: "Cookies | CVB Coaching",
    metaDescription: "Which cookies CVB Coaching's website and CVB Base use — only strictly necessary ones.",
    label: "Cookies",
    title: "Cookie policy",
    lead: "The website uses no cookies for statistics, marketing or tracking. The only cookie used is the one needed to keep you logged in to CVB Base.",
    updatedLabel: `Last updated ${formatUpdated(LEGAL_UPDATED_AT, "en")}`,
    tocLabel: "Contents",
    sections: [
      {
        id: "what-are-cookies",
        heading: "What cookies are",
        blocks: [
          p(
            "A cookie is a small text file that a website stores in your browser. Similar technologies include, for example, local storage in the browser (localStorage). Under the Swedish Electronic Communications Act you must be informed about such technology, and consent is required if the technology is not necessary to deliver the service you have asked for.",
          ),
        ],
      },
      {
        id: "public-website",
        heading: "The public website",
        blocks: [
          p(
            "When you read the website or book a first conversation, no cookies are set and no other information is stored in your browser. We use no analytics tools, advertising pixels or embedded third-party content, and the fonts are served from our own server.",
          ),
        ],
      },
      {
        id: "cvb-base",
        heading: "Logging in to CVB Base",
        blocks: [
          p("When you log in to CVB Base, one strictly necessary cookie is used:"),
          facts(
            ["Name", "sb-…-auth-token (may be split into several parts, …-auth-token.0, .1)"],
            ["Purpose", "Keeps you logged in and lets the service check who you are and what you have access to."],
            ["Type", "Strictly necessary, first-party cookie. Set when logging in to CVB Base."],
            ["Retention", "Removed when you log out. Otherwise it remains in the browser for at most about 400 days."],
          ),
          p(
            "Earlier versions of CVB Base could store demo-mode settings in cookies (cvb_demo_state, cvb_demo_materials). They are no longer set, and such an older cookie disappears by itself within 30 days.",
          ),
          p("CVB Base does not use local storage (localStorage or sessionStorage) in the browser."),
        ],
      },
      {
        id: "consent",
        heading: "Why no cookie banner is shown",
        blocks: [
          p(
            "The login cookie is necessary to deliver the service you have asked for — being logged in to CVB Base. Such technology does not require consent, and since no other cookies are used, we show no cookie banner.",
          ),
          list(
            "You can delete cookies at any time in your browser settings. Deleting the login cookie logs you out.",
            "If we ever want to use cookies that are not necessary, we will ask for your consent first.",
          ),
        ],
      },
      {
        id: "more",
        heading: "More information",
        blocks: [
          p(
            "How personal data is processed is described in the ",
            link("privacy policy", legalHref("privacy", "en")),
            ". Send questions to ",
            mail,
            ". The Swedish Post and Telecom Authority (PTS) supervises the rules on cookies, ",
            link("pts.se", "https://www.pts.se"),
            ". If the Swedish and English versions differ, the Swedish version applies.",
          ),
        ],
      },
    ],
  };
}

export function cookiesDocument(locale: Locale): LegalDocument {
  return locale === "en" ? en() : sv();
}

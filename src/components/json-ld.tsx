import { SITE_URL } from "@/lib/seo";

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

const BUSINESS_ID = `${SITE_URL}/#business`;
const FOUNDER_ID = `${SITE_URL}/om-oss#carolina`;

/**
 * Lägg till URL:en till Google-företagsprofilen (Maps-länken "Dela") och
 * LinkedIn-sidan här när de finns. sameAs är det som låter Google koppla ihop
 * sajten med företagsprofilen och skilja CVB Coaching från namnlika aktörer.
 */
const SAME_AS: string[] = [];

/**
 * Servicearea-företag: ingen gatuadress publiceras. Ort, område och språk ska
 * stämma exakt med Google-företagsprofilen.
 */
export const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": BUSINESS_ID,
  name: "CVB Coaching",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/cvb-logo.png`,
  image: `${SITE_URL}/carolina-om-oss.jpg`,
  email: "info@cvbcoaching.se",
  description:
    "Individuell coaching och företagscoaching i Göteborg. Fysiska möten i Göteborgsregionen kombinerat med digitalt arbete mellan mötena.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Göteborg",
    addressRegion: "Västra Götalands län",
    addressCountry: "SE",
  },
  areaServed: [
    { "@type": "City", name: "Göteborg" },
    { "@type": "City", name: "Mölndal" },
    { "@type": "City", name: "Kungsbacka" },
    { "@type": "AdministrativeArea", name: "Västra Götalands län" },
    { "@type": "Country", name: "Sverige" },
  ],
  availableLanguage: ["sv", "en"],
  serviceType: ["Individuell coaching", "Företagscoaching", "Ledarskapscoaching"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Coachingtjänster",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Individuell coaching", url: `${SITE_URL}/individuell-coaching` },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Företagscoaching", url: `${SITE_URL}/business-coaching` },
      },
    ],
  },
  founder: { "@type": "Person", "@id": FOUNDER_ID, name: "Carolina von Braun" },
  ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
};

export const carolinaPersonSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": FOUNDER_ID,
  name: "Carolina von Braun",
  jobTitle: "Coach",
  worksFor: { "@id": BUSINESS_ID },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Handelshögskolan vid Göteborgs universitet",
  },
};

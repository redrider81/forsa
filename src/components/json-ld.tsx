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
  serviceType: [
    "Individuell coaching",
    "Business coaching",
    "Executive coaching",
    "Ledningsgruppscoaching",
    "Teamcoaching",
    "Coachande ledarskap",
  ],
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

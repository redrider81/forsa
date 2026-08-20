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
    "Executive coaching",
    "Ledningsgruppscoaching",
    "Individuell coaching",
    "Teamcoaching",
    "Coachande ledarskap",
  ],
};

export const carolinaPersonSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Carolina von Braun",
  jobTitle: "Grundare och coach",
  worksFor: {
    "@type": "Organization",
    name: "CVB Coaching",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Handelshögskolan vid Göteborgs universitet",
  },
};

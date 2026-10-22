import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import LegalDocumentPage from "@/components/legal/legal-document-page";
import { privacyDocument } from "@/lib/legal/content/privacy";

const legalDocument = privacyDocument("sv");

export const metadata: Metadata = {
  alternates: pageAlternates("/integritet", "sv"),
  title: legalDocument.metaTitle,
  description: legalDocument.metaDescription,
};

export default function IntegritetPage() {
  return <LegalDocumentPage document={legalDocument} />;
}

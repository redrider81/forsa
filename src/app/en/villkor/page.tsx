import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import LegalDocumentPage from "@/components/legal/legal-document-page";
import { termsDocument } from "@/lib/legal/content/terms";

const legalDocument = termsDocument("en");

export const metadata: Metadata = {
  alternates: pageAlternates("/villkor", "en"),
  title: legalDocument.metaTitle,
  description: legalDocument.metaDescription,
};

export default function TermsPage() {
  return <LegalDocumentPage document={legalDocument} />;
}

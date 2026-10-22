import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import LegalDocumentPage from "@/components/legal/legal-document-page";
import { baseTermsDocument } from "@/lib/legal/content/base-terms";

const legalDocument = baseTermsDocument("en");

export const metadata: Metadata = {
  alternates: pageAlternates("/cvb-base-villkor", "en"),
  title: legalDocument.metaTitle,
  description: legalDocument.metaDescription,
};

export default function CvbBaseTermsPage() {
  return <LegalDocumentPage document={legalDocument} />;
}

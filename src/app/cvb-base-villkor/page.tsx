import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import LegalDocumentPage from "@/components/legal/legal-document-page";
import { baseTermsDocument } from "@/lib/legal/content/base-terms";

const legalDocument = baseTermsDocument("sv");

export const metadata: Metadata = {
  alternates: pageAlternates("/cvb-base-villkor", "sv"),
  title: legalDocument.metaTitle,
  description: legalDocument.metaDescription,
};

export default function CvbBaseVillkorPage() {
  return <LegalDocumentPage document={legalDocument} />;
}

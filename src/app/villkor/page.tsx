import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import LegalDocumentPage from "@/components/legal/legal-document-page";
import { termsDocument } from "@/lib/legal/content/terms";

const legalDocument = termsDocument("sv");

export const metadata: Metadata = {
  alternates: pageAlternates("/villkor", "sv"),
  title: legalDocument.metaTitle,
  description: legalDocument.metaDescription,
};

export default function VillkorPage() {
  return <LegalDocumentPage document={legalDocument} />;
}

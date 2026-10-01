import type { Metadata } from "next";
import LegalDocumentPage from "@/components/legal/legal-document-page";
import { baseTermsDocument } from "@/lib/legal/content/base-terms";

const legalDocument = baseTermsDocument("en");

export const metadata: Metadata = {
  title: legalDocument.metaTitle,
  description: legalDocument.metaDescription,
};

export default function CvbBaseTermsPage() {
  return <LegalDocumentPage document={legalDocument} />;
}

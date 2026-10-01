import type { Metadata } from "next";
import LegalDocumentPage from "@/components/legal/legal-document-page";
import { privacyDocument } from "@/lib/legal/content/privacy";

const legalDocument = privacyDocument("sv");

export const metadata: Metadata = {
  title: legalDocument.metaTitle,
  description: legalDocument.metaDescription,
};

export default function IntegritetPage() {
  return <LegalDocumentPage document={legalDocument} />;
}

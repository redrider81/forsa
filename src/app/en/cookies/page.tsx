import type { Metadata } from "next";
import LegalDocumentPage from "@/components/legal/legal-document-page";
import { cookiesDocument } from "@/lib/legal/content/cookies";

const legalDocument = cookiesDocument("en");

export const metadata: Metadata = {
  title: legalDocument.metaTitle,
  description: legalDocument.metaDescription,
};

export default function EnCookiesPage() {
  return <LegalDocumentPage document={legalDocument} />;
}

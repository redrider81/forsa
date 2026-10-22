import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import LegalDocumentPage from "@/components/legal/legal-document-page";
import { cookiesDocument } from "@/lib/legal/content/cookies";

const legalDocument = cookiesDocument("sv");

export const metadata: Metadata = {
  alternates: pageAlternates("/cookies", "sv"),
  title: legalDocument.metaTitle,
  description: legalDocument.metaDescription,
};

export default function CookiesPage() {
  return <LegalDocumentPage document={legalDocument} />;
}

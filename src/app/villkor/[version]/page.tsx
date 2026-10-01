import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalDocumentPage from "@/components/legal/legal-document-page";
import { generalTermsDocument } from "@/lib/legal/content/terms";
import { GENERAL_TERMS_VERSIONS } from "@/lib/legal/terms-versions";

/**
 * A specific, pinned version of the general terms — the version a contract
 * refers to. Only known versions exist; /villkor remains the canonical,
 * indexable current version.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return GENERAL_TERMS_VERSIONS.map((version) => ({ version }));
}

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const { version } = await params;
  return {
    title: `Allmänna villkor, version ${version} | CVB Coaching`,
    robots: { index: false, follow: true },
    alternates: { canonical: "/villkor" },
  };
}

export default async function VersionedTermsPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const document = generalTermsDocument(version, "sv");
  if (!document) notFound();
  return <LegalDocumentPage document={{ ...document, updatedLabel: `Version ${version}` }} />;
}

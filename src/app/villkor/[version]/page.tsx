import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalDocumentPage from "@/components/legal/legal-document-page";
import { generalTermsDocument } from "@/lib/legal/content/terms";
import { canReadGeneralTermsVersion, isPublicGeneralTermsVersion } from "@/lib/legal/general-terms-access";
import { CURRENT_GENERAL_TERMS_VERSION, GENERAL_TERMS_VERSIONS } from "@/lib/legal/terms-versions";

/**
 * A specific, pinned version of the general terms — the version a contract
 * refers to. The current version is public; older versions require a portal
 * session tied to a contract pinned to that version. Confirmation emails
 * retain the full accepted text independently of this page.
 */
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ version: CURRENT_GENERAL_TERMS_VERSION }];
}

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const { version } = await params;
  if (!GENERAL_TERMS_VERSIONS.includes(version as (typeof GENERAL_TERMS_VERSIONS)[number])) {
    return { title: "Allmänna villkor | CVB Coaching", robots: { index: false, follow: false } };
  }
  return {
    title: `Allmänna villkor, version ${version} | CVB Coaching`,
    robots: { index: false, follow: false },
    alternates: isPublicGeneralTermsVersion(version) ? { canonical: "/villkor" } : undefined,
  };
}

export default async function VersionedTermsPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const document = generalTermsDocument(version, "sv");
  if (!document) notFound();

  if (!(await canReadGeneralTermsVersion(version))) notFound();

  return <LegalDocumentPage document={{ ...document, updatedLabel: `Version ${version}` }} />;
}

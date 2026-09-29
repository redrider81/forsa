import type { Metadata } from "next";
import RootDocument, { siteUrl } from "@/components/root-document";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "CVB Coaching – individual and business coaching in Gothenburg",
  description:
    "CVB Coaching in Gothenburg. Individual coaching for anyone facing a choice or a change, and business coaching for employees and leaders in working life.",
};

export default function EnglishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootDocument lang="en">{children}</RootDocument>;
}

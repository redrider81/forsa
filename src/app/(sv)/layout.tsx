import type { Metadata } from "next";
import RootDocument, { siteUrl } from "@/components/root-document";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "CVB Coaching – individuell coaching och business coaching i Göteborg",
  description:
    "CVB Coaching i Göteborg. Individuell coaching för dig som står inför ett vägval, och business coaching för medarbetare, ledare och team.",
};

export default function SwedishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootDocument lang="sv">{children}</RootDocument>;
}

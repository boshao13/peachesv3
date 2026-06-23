import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/content/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HashRedirect } from "@/components/layout/HashRedirect";
import { JsonLd, localBusinessSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: "Peaches Fitness Club | Women-Focused Gym in Albuquerque, NM",
    template: "%s | Peaches Fitness Club",
  },
  description:
    "Peaches Fitness Club is Albuquerque's women-focused gym — weights, cardio, group classes, sauna, cold plunge, kids care, and a safe, supportive community.",
  applicationName: site.name,
  keywords: [
    "women's gym Albuquerque",
    "women-focused fitness club Albuquerque NM",
    "gym for women near me",
    "Albuquerque ladies gym",
    "sauna cold plunge Albuquerque",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: site.siteUrl,
    title: "Peaches Fitness Club | Women-Focused Gym in Albuquerque, NM",
    description:
      "Albuquerque's women-focused gym — weights, cardio, classes, sauna, cold plunge, kids care, and a supportive community.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Peaches Fitness Club" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Peaches Fitness Club | Women-Focused Gym in Albuquerque",
    description: "Albuquerque's women-focused gym — strong, safe, and community-driven.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-screen flex flex-col antialiased">
        <JsonLd data={localBusinessSchema()} />
        <HashRedirect />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

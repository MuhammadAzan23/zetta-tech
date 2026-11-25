import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBar from "@/components/MobileBar";
import { EnquiryProvider } from "@/components/enquiry/EnquiryProvider";
import EnquiryDrawer from "@/components/enquiry/EnquiryDrawer";
import EnquiryBinder from "@/components/enquiry/EnquiryBinder";
import RevealObserver from "@/components/motion/RevealObserver";
import { site } from "@/lib/site";
import { cities } from "@/lib/data";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Zetta Tech | ZKTeco main supplier in Karachi",
    template: "%s | Zetta Tech",
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_PK",
    title: "Zetta Tech | ZKTeco attendance, access control and CCTV in Karachi",
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#F4F6F9", width: "device-width", initialScale: 1 };

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.phone,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.line,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  },
  areaServed: cities.map((c) => ({ "@type": "City", name: c.name })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Tiny, blocking-safe: enables animation-only hiding and lets no-JS visitors see everything. */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js')` }} />
        {/* The two faces above the fold are preloaded: the H1 face and the body face
            used by the hero paragraph (the LCP element). Nothing else competes. */}
        <link rel="preload" href="/fonts/bricolage-grotesque-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/ibm-plex-sans-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
        <EnquiryProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MobileBar />
          <EnquiryDrawer />
          <EnquiryBinder />
          <RevealObserver />
        </EnquiryProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      </body>
    </html>
  );
}

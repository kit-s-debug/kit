import type { Metadata, Viewport } from "next";
import "./globals.css";
import { business } from "@/lib/business";

const title = `${business.fullName} | Taxis, Minibuses & Airport Transfers`;
const description =
  "Local taxis, minibuses, airport transfers and railway station pickups from Haverfordwest across Pembrokeshire, including Milford Haven, Pembroke, Pembroke Dock, Tenby, Fishguard and St Davids. Call " +
  business.phones.primary.display +
  " or request a journey online.";

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title,
  description,
  applicationName: business.name,
  keywords: [
    "taxi Haverfordwest",
    "minibus Haverfordwest",
    "Pembrokeshire taxi",
    "airport transfer Pembrokeshire",
    "Haverfordwest station taxi",
    "Speedy Cabs",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: business.fullName,
    title,
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: business.fullName }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
  icons: { icon: "/icon.svg" },
  formatDetection: { telephone: false },
  // A demo should not be indexed until the owner approves it.
  robots: business.demoMode ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a1222",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function structuredData() {
  const a = business.address;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    name: business.fullName,
    url: business.siteUrl,
    telephone: business.phones.primary.e164,
    image: `${business.siteUrl}/og.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.town,
      addressRegion: a.county,
      postalCode: a.postcode,
      addressCountry: a.country,
    },
    areaServed: business.areas.map((t) => ({ "@type": "City", name: t.name })),
    sameAs: [business.links.googleProfile],
    contactPoint: [
      { "@type": "ContactPoint", telephone: business.phones.primary.e164, contactType: "reservations" },
      { "@type": "ContactPoint", telephone: business.phones.alternative.e164, contactType: "reservations" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: business.services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.short },
      })),
    },
  };
  // Only publish facts the owner has confirmed.
  if (business.openingHours.confirmed) data.openingHours = business.openingHours.schema;
  if (business.claims.cardPayments.confirmed) data.paymentAccepted = "Cash, Credit Card, Debit Card";
  if (business.rating.verified) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: business.rating.value,
      reviewCount: business.rating.count,
    };
  }
  return data;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

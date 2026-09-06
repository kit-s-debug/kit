import { about, areas, credentials, fees, practice, formats } from "@/content/site";

/**
 * LocalBusiness / ProfessionalService for the practice, with Person markup for
 * Lyndsay's credentials. Emitted once, on the home page.
 */
export function StructuredData({ siteUrl }: { siteUrl: string }) {
  const person = {
    "@type": "Person",
    "@id": `${siteUrl}/#lyndsay`,
    name: practice.therapist,
    jobTitle: practice.role,
    description: about.description,
    telephone: practice.phone,
    knowsAbout: areas.map((area) => area.name),
    hasCredential: credentials.rows.map((row) => ({
      "@type": "EducationalOccupationalCredential",
      name: row.fact,
      ...(row.note ? { description: row.note } : {}),
    })),
    memberOf: [
      {
        "@type": "Organization",
        name: "British Association for Counselling and Psychotherapy",
        alternateName: "BACP",
      },
      {
        "@type": "Organization",
        name: "Professional Standards Authority Accredited Register",
      },
    ],
  };

  const business = {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "MedicalBusiness"],
    "@id": `${siteUrl}/#practice`,
    name: practice.name,
    url: siteUrl,
    telephone: practice.phone,
    image: `${siteUrl}/og.jpg`,
    priceRange: `${fees.amount} per ${fees.duration} session`,
    currenciesAccepted: "GBP",
    paymentAccepted: "Cash, Bank transfer, Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: practice.street.value,
      addressLocality: practice.locality,
      addressRegion: practice.county,
      postalCode: practice.fullPostcode.value,
      addressCountry: practice.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: practice.geo.lat,
      longitude: practice.geo.lng,
    },
    areaServed: practice.coverage.map((place) => ({
      "@type": "City",
      name: place,
      containedInPlace: { "@type": "AdministrativeArea", name: practice.county },
    })),
    availableLanguage: ["en-GB"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    makesOffer: formats.map((format) => ({
      "@type": "Offer",
      name: `${format.name} counselling session`,
      priceSpecification: {
        "@type": "PriceSpecification",
        price: "45.00",
        priceCurrency: "GBP",
      },
    })),
    founder: person,
    employee: person,
  };

  return (
    <script
      type="application/ld+json"
      // Not user input — a constant built from content/site.ts at build time.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }}
    />
  );
}

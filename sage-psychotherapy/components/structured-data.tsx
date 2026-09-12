import { isPlaceholder } from "./placeholder";
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
    /* Opening hours are published only once Lyndsay has confirmed them. The
       page itself shows them with a "to confirm" marker; telling a search
       engine she is open Monday to Thursday until 8pm, with no such caveat
       available in structured data, would state it as settled fact — and it
       is what a search result would show somebody deciding whether to ring. */
    ...(isPlaceholder(practice.hoursNote.status)
      ? {}
      : {
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
        }),
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
    /* The same node, referenced rather than repeated: this object is ~2KB and
       it was being written into every page's HTML twice over. */
    employee: { "@id": person["@id"] },
  };

  return (
    <script
      type="application/ld+json"
      // Not user input — a constant built from content/site.ts at build time.
      /* JSON.stringify does not escape "</script>", which is the one sequence
         that can break out of this tag. Nothing here comes from a visitor, but
         escaping it costs a replace and removes the question. */
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(business).replace(/</g, "\\u003c"),
      }}
    />
  );
}

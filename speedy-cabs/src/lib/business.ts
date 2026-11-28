/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SPEEDY CABS & MINIBUS — CENTRAL BUSINESS CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every phone number, address, service, town and claim on the website comes
 *  from this one file. Edit it and rebuild; nothing else needs to change.
 *
 *  `confirmed: false` marks a claim the owner has not yet confirmed.
 *   - While `demoMode` is true, unconfirmed claims are shown with a † marker
 *     and a note, so the owner can review them.
 *   - When `demoMode` is false, unconfirmed claims are hidden automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Claim = { label: string; detail: string; confirmed: boolean };

export type ServiceId = "local" | "minibus" | "airport" | "station";

export type Service = {
  id: ServiceId;
  title: string;
  short: string;
  description: string;
  points: string[];
  /** Vehicle preselected in the booking form when this service is chosen. */
  vehicle: "taxi" | "minibus";
  /** Hint shown in the booking form's notes field for this service. */
  notesHint: string;
};

export type Review = {
  author: string;
  text: string;
  /** Where the review was copied from, e.g. "Google". Required. */
  source: string;
  date?: string;
};

export const business = {
  /** Shows the demo banner and † markers. Set to false before launch. */
  demoMode: true,

  name: "Speedy Cabs & Minibus",
  fullName: "Speedy Cabs & Minibus Haverfordwest",
  /** Public URL once launched. Used for SEO metadata and structured data. */
  siteUrl: "https://www.haverfordwesttaxi.co.uk",

  phones: {
    primary: { display: "07587 549017", e164: "+447587549017" },
    alternative: { display: "07472 666661", e164: "+447472666661" },
  },

  /**
   * WhatsApp enquiries. `number` is digits only with country code, no "+".
   * If the business does not use WhatsApp on this number, set `enabled: false`
   * and the booking form will offer text message and phone instead.
   */
  whatsapp: {
    enabled: true,
    number: "447587549017",
    confirmed: false,
  },

  /** Text-message enquiries (works on every mobile, no app needed). */
  sms: { enabled: true, number: "+447587549017" },

  address: {
    street: "48 Portfield",
    town: "Haverfordwest",
    county: "Pembrokeshire",
    postcode: "SA61 1BW",
    country: "GB",
  },

  links: {
    googleProfile: "https://share.google/z4Wpmw7WSjoD9GD75",
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=48+Portfield%2C+Haverfordwest+SA61+1BW",
  },

  /**
   * Rating shown only when `verified` is true. The Google profile and the old
   * website currently show different figures, so this stays hidden until the
   * owner confirms the current numbers.
   */
  rating: { verified: false, value: 0, count: 0, source: "Google" },

  /**
   * Customer reviews. Only add reviews copied word-for-word from a real source,
   * with the reviewer's permission where required. Leave empty to show a
   * "Read our reviews on Google" card instead.
   */
  reviews: [] as Review[],

  claims: {
    open247: {
      label: "Open 24/7",
      detail: "Day and night, every day of the year",
      confirmed: false,
    },
    cardPayments: {
      label: "Card payments accepted",
      detail: "Pay by card or cash",
      confirmed: false,
    },
  } satisfies Record<string, Claim>,

  /** Opening hours for structured data. Only published when confirmed. */
  openingHours: { confirmed: false, schema: ["Mo-Su 00:00-23:59"] },

  services: [
    {
      id: "local",
      title: "Local taxis",
      short: "Everyday journeys around Haverfordwest.",
      description:
        "Shopping, appointments, work, school runs and nights out. A local car for getting around town and the villages nearby.",
      points: ["Around town and nearby villages", "Short hops and regular trips", "Evening travel"],
      vehicle: "taxi",
      notesHint: "Anything we should know? e.g. wheelchair folded in boot, child seat needed",
    },
    {
      id: "minibus",
      title: "Minibus travel",
      short: "Group journeys and extra luggage.",
      description:
        "One vehicle for the whole group. Parties, weddings, sports teams, family days out and trips with plenty of luggage.",
      points: ["Groups travel together", "Room for extra luggage", "Ideal for events and days out"],
      vehicle: "minibus",
      notesHint: "Tell us about the group: occasion, luggage, return journey",
    },
    {
      id: "airport",
      title: "Airport transfers",
      short: "Pre-booked airport journeys.",
      description:
        "Start and end your trip without the stress. Book ahead, share your flight details and travel straight from your door.",
      points: ["Pre-booked in advance", "Door to terminal", "Taxi or minibus for families"],
      vehicle: "taxi",
      notesHint: "Airport, flight number and landing/departure time",
    },
    {
      id: "station",
      title: "Station pickups",
      short: "Collections from Haverfordwest railway station.",
      description:
        "Arriving by train? Book a pickup from Haverfordwest station and carry on to your door, anywhere in Pembrokeshire.",
      points: ["Haverfordwest railway station", "Onward to anywhere in the county", "Book your arrival time"],
      vehicle: "taxi",
      notesHint: "Train arrival time and where it's coming from",
    },
  ] satisfies Service[],

  /** Additional services mentioned in the booking form. */
  extraServices: ["Evening travel", "Long-distance journeys (pre-booked)"],

  /**
   * Towns shown on the illustrated route map. Positions are approximate
   * latitude/longitude used only to place labels on a stylised map.
   */
  areas: [
    { name: "Haverfordwest", lat: 51.8015, lon: -4.9693, hub: true },
    { name: "Milford Haven", lat: 51.7142, lon: -5.0427 },
    { name: "Pembroke Dock", lat: 51.6937, lon: -4.9459 },
    { name: "Pembroke", lat: 51.6763, lon: -4.9158 },
    { name: "Tenby", lat: 51.6727, lon: -4.7036 },
    { name: "Fishguard", lat: 51.9939, lon: -4.9760 },
    { name: "St Davids", lat: 51.8812, lon: -5.2660 },
  ],
} as const;

export type Business = typeof business;

/** Claims to display: confirmed ones always, unconfirmed only in demo mode. */
export function visibleClaim(claim: Claim): { show: boolean; pending: boolean } {
  if (claim.confirmed) return { show: true, pending: false };
  return { show: business.demoMode, pending: true };
}

export const telHref = (e164: string) => `tel:${e164}`;

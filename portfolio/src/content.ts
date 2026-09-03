/* ---------------------------------------------------------------------------
   Everything writable on the site lives here. Edit this file, not the
   components. Placeholders you will want to change are marked EDIT.
--------------------------------------------------------------------------- */

export const SITE = {
  name: "Kit Ryder",
  role: "Web designer & developer",
  place: "Pembrokeshire, Wales",
  email: "hello@kitryder.co.uk", // EDIT
  /* Where the contact form posts. Leave empty and the form falls back to
     opening a pre-filled email instead, so it always works. Formspree, Basin,
     Netlify Forms and Web3Forms all accept a plain POST like this. */
  formEndpoint: import.meta.env.VITE_FORM_ENDPOINT ?? "",
  availability: "Taking on two new projects this autumn", // EDIT
  socials: [
    // EDIT: swap in your real profile links. Anything left empty is not rendered.
    { label: "Instagram", href: "https://instagram.com/kitryder" },
    { label: "LinkedIn", href: "https://linkedin.com/in/kitryder" },
    { label: "GitHub", href: "https://github.com/kitryder" },
  ],
};

export const NAV = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export const HERO = {
  headline: "I build websites that make businesses impossible to ignore.",
  sub: "Web designer & developer based in Pembrokeshire, Wales. I build high-converting websites for businesses that want to stand out.",
  primary: { label: "View my work", href: "#work" },
  secondary: { label: "Start a project", href: "#contact" },
};

/* The band directly under the hero. Three plain facts, no logo wall, because
   inventing client logos would be the fastest way to lose a local's trust. */
export const STATEMENT = {
  line: "Most small business websites were built once, years ago, by someone who has since stopped answering the phone.",
  emphasis: "I build the other kind.",
  facts: [
    { k: "Built, not templated", v: "Designed for one business, from a blank page." },
    { k: "Mobile first", v: "Your customers arrive on a phone. That is where I start." },
    { k: "Based here", v: "Pembrokeshire. You can meet me, and I answer my own messages." },
  ],
};

export type Project = {
  slug: string;
  name: string;
  sector: string;
  town: string;
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
  tech: string[];
  image: string;
  /* Aspect ratio of the preview image. Match whatever you export and the
     layout follows it, in the grid and in the case study. Defaults to 16:9. */
  aspect?: string;
  liveUrl?: string; // EDIT: add a real URL and a "Visit live site" link appears
};

/* EDIT: placeholder projects. Replace the copy and drop a real screenshot into
   /public/work using the same file name. Images are 3:2, 1600x1067 or larger. */
export const PROJECTS: Project[] = [
  {
    slug: "ninth-wave",
    name: "Ninth Wave",
    sector: "Bar and late lounge",
    town: "Tenby",
    summary:
      "A late bar whose whole identity lived in Instagram stories that vanished after 24 hours.",
    challenge:
      "Everything the room had going for it, the line-up, the private hire, the Friday crowd, was invisible by Sunday. People searching for somewhere to go on a Saturday afternoon found a Facebook page and a phone number.",
    approach:
      "A full-bleed dark site built around the room itself. The line-up and opening hours come from a small CMS the manager updates on his phone, and table enquiries land in one inbox with the date, the size of the group and the occasion already attached.",
    outcome: "Table enquiries arrive as a form instead of a direct message at 1am.",
    tech: ["React", "TypeScript", "Sanity CMS", "Vercel"],
    image: "/work/ninth-wave.jpg",
  },
  {
    slug: "penrhos",
    name: "Penrhos",
    sector: "Restaurant",
    town: "St Davids",
    summary: "A coastal kitchen with a menu that changes weekly and no way to show it.",
    challenge:
      "The printed menu changed every Tuesday. The website menu was a PDF from two summers ago, and the kitchen had to ring someone to get it swapped.",
    approach:
      "A quiet, type-led site that puts the food first and the booking button within reach on every screen. The menu is editable in about a minute, with no developer in the loop.",
    outcome: "The kitchen updates its own menu. No email, no wait, no PDF.",
    tech: ["Astro", "Tailwind", "Sanity CMS", "Netlify"],
    image: "/work/penrhos.jpg",
  },
  {
    slug: "ivor-and-sons",
    name: "Ivor & Sons",
    sector: "Barbershop",
    town: "Haverfordwest",
    summary: "Two chairs, a walk-in queue, and no way to see how busy the shop was.",
    challenge:
      "Bookings ran through a phone that nobody could answer mid-cut, and the shop was losing the customers who would not leave a voicemail.",
    approach:
      "A compact site built around one action. Pick a barber, pick a slot, done, in under thirty seconds on a phone. The rest of the page earns trust: the work, the price list, the door.",
    outcome: "Chairs get filled before the shop opens, without anyone answering a call.",
    tech: ["Next.js", "Tailwind", "Booking API", "Cloudflare"],
    image: "/work/ivor-and-sons.jpg",
  },
  {
    slug: "carreg",
    name: "Carreg Construction",
    sector: "Construction and groundworks",
    town: "Narberth",
    summary: "Twenty years of finished work that only existed on a phone camera roll.",
    challenge:
      "Word of mouth was carrying the whole business. Anyone who searched first found competitors with worse work and better websites.",
    approach:
      "A project archive that makes the standard of the work obvious in three seconds, plus a quote form that asks the questions the team would ask anyway, so the first call is already useful.",
    outcome: "Quote requests come in with photos, a postcode and a start date attached.",
    tech: ["React", "TypeScript", "Cloudinary", "Netlify"],
    image: "/work/carreg.jpg",
  },
  {
    slug: "elin-vaughan",
    name: "Elin Vaughan",
    sector: "Photography",
    town: "Newport",
    summary: "A photographer whose portfolio was living on someone else’s platform.",
    challenge:
      "The work was strong and the presentation was not hers. Compressed images, a feed that reordered itself, and no way for a client to see a full series.",
    approach:
      "A gallery that treats the photographs as the interface. Full-resolution images served at the right size for the screen they land on, with series that hold their order.",
    outcome: "One site she owns, that shows the work at full quality without the wait.",
    tech: ["React", "Motion", "Cloudflare Images"],
    image: "/work/elin-vaughan.jpg",
  },
];

export const ABOUT = {
  /* EDIT: drop a photo at /public/kit.jpg and set portrait to "/kit.jpg".
     Left empty, the section runs as a wider type-led layout instead. */
  portrait: "",
  heading: "I am Kit Ryder, and I build websites in Pembrokeshire.",
  body: [
    "I build websites for businesses that look better in person than they do online. That gap is the website, and it is fixable.",
    "I care about how a site feels in the first three seconds, how fast it loads on a phone with two bars of signal, and whether it brings you more of the customers you want. I work with AI and automation too, so I can take the admin off your hands as well.",
  ],
  /* EDIT: your own progression. Kept deliberately free of dates so it stays
     true as you add to it. */
  progression: [
    { title: "Design", note: "Why some pages feel expensive and most do not." },
    { title: "Code", note: "React and TypeScript, so the design survives contact with the browser." },
    { title: "Performance", note: "Load times measured on real phones and rural signal, not a fast laptop." },
    { title: "AI and automation", note: "Used where it removes work, left out where it would flatten the craft." },
    { title: "Businesses", note: "Working with owners directly, turning what they do into something people can act on." },
  ],
};

export const SERVICES = [
  {
    title: "Website Design",
    lead: "Modern responsive websites designed around the business.",
    detail:
      "I start with what your business actually needs to say, then design the page around that. No stock template stretched to fit.",
    points: ["Design built from a blank page", "Layouts that hold on any screen", "A visual identity you can reuse"],
  },
  {
    title: "Website Development",
    lead: "Fast, polished websites with excellent mobile performance.",
    detail:
      "Hand-built front ends in React and TypeScript. Fast on a phone, accessible by default, and easy to change later.",
    points: ["Sub-second loads on mobile", "Accessible and search friendly", "Content you can edit yourself"],
  },
  {
    title: "AI & Automation",
    lead: "Helping businesses use AI to save time and improve their workflows.",
    detail:
      "The quiet win. Enquiry handling, follow ups, quotes, content. The repetitive parts of the week, done without you.",
    points: ["Enquiry and follow up flows", "Content and admin automation", "Practical tools, not gimmicks"],
  },
  {
    title: "Digital Presence",
    lead: "Helping local businesses improve how they appear online.",
    detail:
      "The website is one piece. Search listings, maps, photography and copy all decide whether someone chooses you.",
    points: ["Local search and map listings", "Copy that sounds like you", "One consistent look everywhere"],
  },
];

export const REASONS = [
  { title: "You deal with me", body: "No account manager, no ticket queue. The person you brief is the person who builds it." },
  { title: "Design that earns trust", body: "A modern site tells a customer you take the business seriously before they read a word." },
  { title: "Fast replies", body: "Messages answered in hours, not next week. During a build and long after it." },
  { title: "Built around you", body: "A butcher, a barber and a builder need different things. I build for the business in front of me." },
  { title: "Mobile first", body: "Designed on a phone screen first, because that is where nearly all of your customers are." },
  { title: "Agency work, local price", body: "The same standard the big studios charge five figures for, without the overheads." },
  { title: "Still here afterwards", body: "Hosting, updates and changes handled. The site keeps working once the invoice is paid." },
];

export const MAP_SECTION = {
  heading: "Built for businesses on this coast.",
  body: "From St Davids to Tenby, and remotely with everyone else. Being nearby means you can show me the place and get an answer the same day.",
};

export const CONTACT = {
  heading: "Have a business that deserves a better website?",
  sub: "Let’s build something that makes people remember your business.",
  projectTypes: ["New website", "Redesign", "AI & automation", "Something else"],
};

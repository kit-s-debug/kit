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
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const CTA = { label: "Start a project", href: "#contact" };

export const HERO = {
  eyebrow: "Web design and build, Pembrokeshire",
  headline: ["Websites that", "make a business", "impossible to ignore."],
  sub: "I design and build them myself, for businesses in Pembrokeshire and across West Wales.",
  primary: { label: "See the work", href: "#work" },
  secondary: CTA,
  /* The little proof line under the hero. Nothing invented: this is what the
     featured build below actually is. */
  proof: "Featured: Eddie Rocks, a three floor nightclub rendered in the browser",
};

export const STRIP = {
  line: "Most small business websites were built once, years ago, by someone who has stopped answering the phone.",
  emphasis: "I build the other kind.",
  facts: [
    { k: "Built, not templated", v: "Designed for one business, from a blank page." },
    { k: "Mobile first", v: "Your customers arrive on a phone. That is where I start." },
    { k: "You deal with me", v: "The person you brief is the person who builds it." },
  ],
};

export type Project = {
  slug: string;
  name: string;
  sector: string;
  town: string;
  role: string;
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
  tech: string[];
  image: string;
  aspect?: string;
  liveUrl?: string;
};

/* The flagship. Real work, real venue, and the case study links to the site
   itself, which is served from /eddie-rocks/ alongside this one. */
export const FEATURED = {
  slug: "eddie-rocks",
  name: "Eddie Rocks",
  sector: "Nightclub",
  town: "Haverfordwest",
  role: "Design and build",
  year: "Quay Street",
  kicker: "Featured build",
  headline: "Three floors, drawn in the browser.",
  summary:
    "West Wales' biggest nightclub, three rooms under one roof, and a site that had to make you feel the place before you got to the door.",
  body: [
    "A night out sells on atmosphere, and atmosphere does not survive a list of opening times. The site had to carry the feeling of the room, explain a building most people only half know, and take private hire without a phone call.",
    "So the venue is not photographed, it is modelled. The building and all three floors are drawn live in WebGL and lit the way the rooms are actually lit. Around that sit the things a Saturday night needs: door times, a countdown to opening, the line up, and an enquiry form.",
  ],
  facts: [
    { k: "Role", v: "Design and build" },
    { k: "Built with", v: "WebGL, Three.js, vanilla JS" },
    { k: "Pages", v: "Main site and Labrinth" },
    { k: "Framework", v: "None" },
  ],
  outcome: "Three floors that used to need explaining now explain themselves.",
  video: "/work/eddies-scroll.webm",
  poster: "/work/eddies-poster.jpg",
  liveUrl: "/eddie-rocks/",
  cta: { label: "Get one like this", href: "#contact" },
};

/* EDIT: placeholder projects. Replace the copy and drop a real screenshot into
   /public/work using the same file name. Images are 16:9. */
export const PROJECTS: Project[] = [
  {
    slug: "ninth-wave",
    name: "Ninth Wave",
    sector: "Bar and late lounge",
    town: "Tenby",
    role: "Design and build",
    summary: "A late bar whose whole identity lived in Instagram stories that vanished after 24 hours.",
    challenge:
      "Everything the room had going for it, the line-up, the private hire, the Friday crowd, was invisible by Sunday. People searching for somewhere to go found a Facebook page and a phone number.",
    approach:
      "A full-bleed dark site built around the room itself. The line-up and hours come from a small CMS the manager updates on his phone, and table enquiries land in one inbox with the date, the size of the group and the occasion attached.",
    outcome: "Table enquiries arrive as a form instead of a direct message at 1am.",
    tech: ["React", "TypeScript", "Sanity CMS", "Vercel"],
    image: "/work/ninth-wave.jpg",
  },
  {
    slug: "penrhos",
    name: "Penrhos",
    sector: "Restaurant",
    town: "St Davids",
    role: "Design and build",
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
    role: "Design and build",
    summary: "Two chairs, a walk-in queue, and no way to see how busy the shop was.",
    challenge:
      "Bookings ran through a phone nobody could answer mid-cut, and the shop was losing the customers who would not leave a voicemail.",
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
    role: "Design and build",
    summary: "Twenty years of finished work that only existed on a phone camera roll.",
    challenge:
      "Word of mouth was carrying the whole business. Anyone who searched first found competitors with worse work and better websites.",
    approach:
      "A project archive that makes the standard of the work obvious in three seconds, plus a quote form that asks the questions the team would ask anyway.",
    outcome: "Quote requests come in with photos, a postcode and a start date attached.",
    tech: ["React", "TypeScript", "Cloudinary", "Netlify"],
    image: "/work/carreg.jpg",
  },
  {
    slug: "elin-vaughan",
    name: "Elin Vaughan",
    sector: "Photography",
    town: "Newport",
    role: "Design and build",
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

export const SERVICES = [
  {
    title: "Website design",
    lead: "Designed around your business, from a blank page.",
    detail:
      "I start with what your business actually needs to say, then design the page around that. Nothing stretched to fit.",
    points: ["A design built for you alone", "Layouts that hold on any screen", "A look you can reuse everywhere"],
  },
  {
    title: "Website development",
    lead: "Hand-built, fast on a phone, easy to change later.",
    detail:
      "Front ends written by hand in React and TypeScript, or in plain HTML where that is the better tool. Accessible by default.",
    points: ["Sub-second loads on mobile", "Accessible and search friendly", "Content you can edit yourself"],
  },
  {
    title: "AI & automation",
    lead: "The repetitive part of your week, handled.",
    detail:
      "Enquiry handling, follow ups, quotes, content. The admin that eats an evening, done without you sitting there.",
    points: ["Enquiry and follow up flows", "Content and admin automation", "Practical tools, not gimmicks"],
  },
  {
    title: "Digital presence",
    lead: "How you look everywhere else people find you.",
    detail:
      "The website is one piece. Search listings, maps, photography and copy all decide whether someone picks you.",
    points: ["Local search and map listings", "Copy that sounds like you", "One consistent look everywhere"],
  },
];

export const PROCESS = {
  heading: "Four steps, and you are never guessing where it is.",
  steps: [
    {
      k: "Discover",
      v: "A conversation, usually in person. What the business does, who you want more of, and what the site has to make happen.",
      note: "Free, no commitment",
    },
    {
      k: "Design",
      v: "I design the real pages, not a wireframe. You see it in a browser, on your own phone, before a line of it is built.",
      note: "Two rounds of changes",
    },
    {
      k: "Build",
      v: "Hand-built and tested on real devices. Fast on rural signal, accessible, and set up so you can edit the words yourself.",
      note: "Usually two to three weeks",
    },
    {
      k: "Launch",
      v: "Domain, hosting, search listings and analytics, all handled. Then I stay reachable, because things always come up.",
      note: "Support after launch",
    },
  ],
  why: [
    "You brief the person who builds it",
    "Messages answered in hours, not next week",
    "Agency standard without the agency overheads",
    "Still here after the invoice is paid",
  ],
};

export const ABOUT = {
  /* EDIT: drop a photo at /public/kit.jpg and set portrait to "/kit.jpg". */
  portrait: "",
  heading: "I am Kit Ryder, and I build websites in Pembrokeshire.",
  body: [
    "I build for businesses that look better in person than they do online. That gap is the website, and it is fixable.",
    "I care about how a site feels in the first three seconds, how fast it loads on a phone with two bars of signal, and whether it brings you more of the customers you want.",
  ],
  progression: [
    { title: "Design", note: "Why some pages feel expensive and most do not." },
    { title: "Code", note: "React, TypeScript and WebGL, so the design survives contact with the browser." },
    { title: "Performance", note: "Load times measured on real phones and rural signal, not a fast laptop." },
    { title: "AI and automation", note: "Used where it removes work, left out where it would flatten the craft." },
  ],
};

export const WHERE = {
  heading: "Built for businesses on this coast.",
  body: "From St Davids to Tenby, and remotely with everyone else. Being nearby means you can show me the place and get an answer the same day.",
};

export const CONTACT = {
  heading: "Have a business that deserves a better website?",
  sub: "Tell me what you do and where it is falling short. I reply the same day.",
  projectTypes: ["New website", "Redesign", "AI & automation", "Something else"],
};

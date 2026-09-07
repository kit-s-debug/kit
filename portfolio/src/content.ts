/* ---------------------------------------------------------------------------
   Everything writable on the site lives here. Edit this file, not the
   components. Placeholders you will want to change are marked EDIT.
--------------------------------------------------------------------------- */

export const SITE = {
  name: "Ryder Design",
  role: "Web design and development",
  place: "Haverfordwest, Pembrokeshire",
  email: "hello@ryderdesign.co.uk", // EDIT
  /* Where the contact form posts. Leave empty and the form falls back to
     opening a pre-filled email instead, so it always works. Formspree, Basin,
     Netlify Forms and Web3Forms all accept a plain POST like this. */
  formEndpoint: import.meta.env.VITE_FORM_ENDPOINT ?? "",
  availability: "Taking on two new projects this autumn", // EDIT
  socials: [
    // EDIT: swap in your real profile links. Anything left empty is not rendered.
    { label: "Instagram", href: "https://instagram.com/ryderdesign" },
    { label: "LinkedIn", href: "https://linkedin.com/company/ryderdesign" },
    { label: "GitHub", href: "https://github.com/ryderdesign" },
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
  eyebrow: "Web design and build",
  headline: ["Websites that", "make a business", "impossible to ignore."],
  sub: "Pubs, restaurants, trades, shops and salons across West Wales.",
  primary: { label: "See the work", href: "#work" },
  secondary: CTA,
  /* A caption for the frame beside it, not a second headline. */
  proof: "On screen: Eddie Rocks, a site I designed and built",
};

export const STRIP = {
  line: "Most small business websites were built once, years ago, by someone who has stopped answering the phone.",
  emphasis: "I build the other kind.",
  facts: [
    { k: "Built, not templated", v: "Designed for one business, from a blank page." },
    { k: "Yours to keep", v: "You own the site, the domain and the words in it." },
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
  /* Marks a piece that is not a client engagement. Eddie Rocks has no status
     because it is live; anything with one is labelled on the card and in the
     case study, so nothing here can be mistaken for work that shipped. */
  status?: string;
};

/* The flagship. Real work, real venue, and the case study links to the site
   itself, which is served from /eddie-rocks/ alongside this one. */
export const FEATURED = {
  slug: "eddie-rocks",
  name: "Eddie Rocks",
  sector: "Nightclub",
  town: "Haverfordwest",
  role: "Design and build",
  headline: "Three floors, drawn in the browser.",
  summary:
    "A nightclub on Quay Street, and a site that had to make you feel the room before you reached the door.",
  body: [
    "A night out sells on atmosphere, and atmosphere does not survive a list of opening times. The site had to carry the feeling of the room, explain a building most people only half know, and take private hire without a phone call.",
    "So the venue is not photographed, it is modelled. The building and every room inside it are drawn live in WebGL, lit the way they are actually lit. Around that sit the things a Saturday night needs: door times, a countdown to opening, the line up, and an enquiry form.",
  ],
  facts: [
    { k: "Role", v: "Design and build" },
    { k: "Built with", v: "WebGL, Three.js, vanilla JS" },
    { k: "Pages", v: "Main site and Labrinth" },
    { k: "Framework", v: "None" },
  ],
  outcome: "A building that used to need explaining now explains itself.",
  video: "/work/eddies-scroll.webm",
  poster: "/work/eddies-poster.jpg",
  liveUrl: "/eddie-rocks/",
  cta: { label: "Get one like this", href: "#contact" },
};

/* EDIT: concept builds. Replace the copy and drop a real screenshot into
   /public/work using the same file name. Images are 16:9. When one of these
   becomes a real client, delete its `status` line and it stops being labelled
   as a concept. */
export const PROJECTS: Project[] = [
  {
    slug: "ninth-wave",
    name: "Ninth Wave",
    sector: "Bar and late lounge",
    town: "Tenby",
    role: "Design and build",
    summary: "A late bar everybody in town knew, and nobody could find online.",
    challenge:
      "Search for somewhere open past eleven in Tenby and it did not come up at all. What did was a review site carrying the wrong closing time and a photograph from 2016.",
    approach:
      "One page that answers the question people are actually asking at half ten at night. Open or not, what is on, where the door is. Built light on purpose, because it has to work on one bar of signal outside.",
    outcome: "Someone standing outside at half ten can tell it is open, without ringing.",
    tech: ["React", "TypeScript", "Sanity CMS", "Vercel"],
    image: "/work/ninth-wave.jpg",
    status: "Concept",
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
    status: "Concept",
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
    status: "Concept",
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
    status: "Concept",
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
    status: "Concept",
  },
];

export const SERVICES = [
  {
    title: "Website design",
    lead: "Built around what your business actually needs to say.",
    detail:
      "We start with the one thing a visitor has to understand, and the page gets built outward from that.",
    points: ["Designed on your real words and photographs", "Layouts that hold on any screen", "A look you can reuse everywhere"],
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
      v: "Built and tested on real devices, not just a fast laptop. You watch it come together instead of waiting in silence.",
      note: "Usually two to three weeks",
    },
    {
      k: "Launch",
      v: "Domain, hosting, search listings and analytics, all handled. Then I stay reachable, because things always come up.",
      note: "Live within a day of sign off",
    },
  ],
  note: "Every step ends with something you can actually look at, so you are never taking my word for how it is going.",
};

export const ABOUT = {
  /* EDIT: drop a photo at /public/kit.jpg and set portrait to "/kit.jpg". */
  portrait: "",
  heading: "Ryder Design is one person, in Haverfordwest.",
  /* EDIT: this is the one section that should sound like you and nobody else.
     Saying your age outright is a deliberate call: stated plainly it reads as
     confidence, and the third paragraph turns it into a reason to hire you.
     If you would rather it were not on the page, delete the first sentence of
     the first paragraph and the rest still stands on its own. */
  body: [
    "I am eighteen. I have been making things on a screen since well before I was any good at it, and design is the part I kept chasing: why one page feels expensive and the next one does not, why people stop scrolling at one thing and slide past another.",
    "The nightclub at the top of this page is in the same town as my desk. That is roughly the point. I would rather build for somewhere I can walk into and stand in than for a brief that arrives in an inbox.",
    "The advantage of hiring someone at the start of this is simple enough. I am not juggling twelve other jobs, I have not learned to cut corners, and I do not intend to.",
  ],
  /* EDIT: say these in your own words. They exist to be the things a business
     owner cannot read on every other web designer's site. */
  straight: [
    { title: "I will tell you if you do not need one", note: "Sometimes the photographs, or the Google listing, are the thing that is actually costing you." },
    { title: "You will get a price, not a range", note: "Quoted on the work, before it starts, and it does not move unless you change the job." },
    { title: "No retainer unless you want one", note: "Hosting and small changes are handled either way. You are not signed into anything." },
  ],
};

export const WHERE = {
  heading: "Built for businesses on this coast.",
  body: "From St Davids to Tenby, and remotely with everyone else. Close enough that meeting on a Tuesday morning is not an event, it is just a Tuesday.",
};

export const CONTACT = {
  heading: "Have a business that deserves a better website?",
  sub: "Tell me what you do and where it is falling short. I reply the same day.",
  projectTypes: ["New website", "Redesign", "AI & automation", "Something else"],
};

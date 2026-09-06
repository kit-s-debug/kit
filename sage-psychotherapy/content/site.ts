/**
 * Everything Lyndsay might want to change is in this file.
 *
 * Edit the words here and the site follows. No component contains copy.
 * Anything marked `TO CONFIRM` renders with a visible marker on the page so it
 * cannot be shipped by accident — see `Placeholder` in components/placeholder.tsx
 * and the checklist at the top of the README.
 */

export type Confirm = "confirmed" | "TO CONFIRM";

export const practice = {
  name: "Sage Psychotherapy & Counselling",
  shortName: "Sage",
  therapist: "Lyndsay Gent",
  formerName: "née Sage",
  role: "Adlerian psychotherapist and counsellor",
  phone: "07864 011 852",
  phoneHref: "tel:+447864011852",
  town: "Milford Haven",
  county: "Pembrokeshire",
  countyWelsh: "Sir Benfro",
  postcode: "SA73",
  region: "Wales",
  country: "GB",
  /** Her home practice. She has agreed to the address being public — confirm once more before launch. */
  street: { value: "Street address to be supplied", status: "TO CONFIRM" as Confirm },
  fullPostcode: { value: "SA73 — full postcode to be supplied", status: "TO CONFIRM" as Confirm },
  /** Approximate, for the structured data only. Milford Haven town centre. */
  geo: { lat: 51.7128, lng: -5.0417 },
  hours: [
    { days: "Monday to Thursday", time: "9am – 8pm" },
    { days: "Friday", time: "9am – 5pm" },
    { days: "Saturday and Sunday", time: "Closed" },
  ],
  hoursNote: { value: "Hours to be confirmed", status: "TO CONFIRM" as Confirm },
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/", status: "TO CONFIRM" as Confirm },
    { label: "Instagram", href: "https://www.instagram.com/", status: "TO CONFIRM" as Confirm },
  ],
  /** Set once the Cal.com event type exists. See README. */
  cal: {
    link: process.env.NEXT_PUBLIC_CAL_LINK ?? "",
    namespace: "free-call",
  },
  coverage: [
    "Milford Haven",
    "Haverfordwest",
    "Neyland",
    "Pembroke Dock",
    "Pembroke",
    "Johnston",
    "Narberth",
    "Tenby",
  ],
} as const;

export const cta = {
  primary: "Book a free 15\u2011minute call",
  short: "Book a free call",
  phoneLabel: "Or ring her",
} as const;

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

export const hero = {
  welcomeWelsh: "Croeso",
  kicker: "Counselling and psychotherapy in Milford Haven",
  headline: "Therapy in a front room in Milford Haven, in person or online.",
  credit: "Lyndsay Gent — Adlerian psychotherapist and counsellor. BACP member.",
  imageAlt:
    "The therapy room: a Victorian front room with a deep navy-teal wall, tan leather sofas, a mustard-yellow armchair, a honey parquet floor and a tall sash window with a lace café curtain, lit by a warm lamp.",
  /** The three lines that change over the held image. Keep them under eight words. */
  beats: [
    "It is not a clinic — it's her front room.",
    "You can ring first, and decide after.",
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Welcome                                                                    */
/* -------------------------------------------------------------------------- */

export const welcome = {
  pull: {
    before: "Almost everyone tells me the same thing afterwards: the hardest part was ",
    em: "making contact",
    after: ".",
  },
  lines: [
    "I'm Lyndsay. I see people in my front room here in Milford Haven, or online if that suits you better.",
    "Almost everyone tells me the same thing afterwards: the hardest part was making contact.",
    "So we start with fifteen minutes on the phone. Free, and you owe me nothing after it.",
  ],
  /* The one line shown beneath the pull — deliberately not a repeat of the hero
     or the fees panel. */
  note: "There is no wrong reason to get in touch, and no need to have the words ready.",
  portraitAlt:
    "Lyndsay Gent in natural light, wearing a blue scarf, looking towards the camera.",
} as const;

/* -------------------------------------------------------------------------- */
/* Finding the words                                                          */
/* -------------------------------------------------------------------------- */

export const finder = {
  heading: "What's going on, in your own words?",
  help: "Nothing is sent anywhere. This runs in your browser and is never saved.",
  label: "Describe how you feel, in your own words",
  submit: "Show me",
  examples: [
    "I can't sleep",
    "I keep snapping at my kids",
    "I don't know who I am any more",
    "I drink more than I should",
    "I'm on edge all the time",
    "I can't stop checking things",
  ],
  resultHeading: "That often sits with",
  worksWith: "Lyndsay works with all of these.",
  noMatch: {
    heading: "Nothing matched — which is not a problem.",
    body: "You don't have to name it. Ring her and describe it the way you just did.",
  },
  listHeading: "Or read the whole list",
  listHelp: "Everything she works with, grouped. Open whichever looks closest.",
  noscript:
    "This works best with JavaScript on. The full list of areas is open below.",
} as const;

/** One warm line per cluster, shown under whatever the finder matched. */
export const clusters = [
  {
    id: "anxiety",
    name: "Anxiety and panic",
    line: "Bodies do this. It is exhausting and it is common, and it responds well to being talked about.",
  },
  {
    id: "mood",
    name: "Low mood and self-worth",
    line: "Flat, heavy, or quietly unkind to yourself. None of that means anything is wrong with you.",
  },
  {
    id: "trauma",
    name: "Trauma and abuse",
    line: "You set the pace here. Nothing has to be described before you are ready to describe it.",
  },
  {
    id: "addiction",
    name: "Addiction and compulsion",
    line: "No lecture, and no requirement to have stopped first. Just somewhere honest to think about it.",
  },
  {
    id: "relationships",
    name: "Relationships and family",
    line: "Most of what we struggle with happens between people. That is Adlerian therapy's home ground.",
  },
  {
    id: "neurodiversity",
    name: "Neurodiversity",
    line: "Sessions get adjusted to suit you — lighting, pace, cameras off, breaks. Just say.",
  },
  {
    id: "loss",
    name: "Loss and life change",
    line: "Endings take longer than people expect. There is no schedule you are behind on.",
  },
] as const;

export type ClusterId = (typeof clusters)[number]["id"];

/**
 * The 37 areas, each with the everyday phrasing people actually type.
 * `cues` is what the matcher reads; `name` is the clinical term, kept exactly
 * as written for search engines. Add cues freely — more is better.
 */
export const areas: {
  name: string;
  cluster: ClusterId;
  cues: string[];
}[] = [
  /* --- anxiety and panic ------------------------------------------------ */
  {
    name: "Anxiety",
    cluster: "anxiety",
    cues: [
      "anxious", "anxiety", "on edge", "worried all the time", "cant relax",
      "cant switch off", "nervous", "constant worry", "tense", "dread",
      "cant sleep", "awake at night", "insomnia", "racing thoughts",
      "overthinking", "wound up", "knot in my stomach", "butterflies",
      "stressed", "restless",
    ],
  },
  {
    name: "Generalised anxiety disorder (GAD)",
    cluster: "anxiety",
    cues: [
      "gad", "generalised anxiety", "generalized anxiety", "worry about everything",
      "always worrying", "worry about nothing", "anxious about everything",
    ],
  },
  {
    name: "Panic attacks",
    cluster: "anxiety",
    cues: [
      "panic", "panic attack", "heart racing", "cant breathe", "chest tight",
      "hyperventilating", "thought i was dying", "shaking", "dizzy",
      "came out of nowhere", "pins and needles",
    ],
  },
  {
    name: "Health anxiety",
    cluster: "anxiety",
    cues: [
      "health anxiety", "convinced im ill", "googling symptoms", "hypochondriac",
      "scared im dying", "worried about my health", "cancer worry", "doctor again",
    ],
  },
  {
    name: "Perfectionism",
    cluster: "anxiety",
    cues: [
      "perfectionist", "perfectionism", "never good enough", "cant make mistakes",
      "everything has to be right", "high standards", "procrastinating",
      "cant start things", "cant stop checking", "checking things",
    ],
  },
  {
    name: "Burnout",
    cluster: "anxiety",
    cues: [
      "burnt out", "burned out", "burnout", "exhausted", "no energy",
      "running on empty", "cant cope with work", "dreading work", "overwhelmed",
      "too much on", "nothing left", "cant keep going",
    ],
  },

  /* --- low mood and self-worth ------------------------------------------ */
  {
    name: "Depression",
    cluster: "mood",
    cues: [
      "depressed", "depression", "low", "flat", "empty", "numb", "no point",
      "cant get out of bed", "no motivation", "dont enjoy anything",
      "nothing feels good", "heavy", "grey", "cant sleep", "sleeping all day",
    ],
  },
  {
    name: "Feeling sad",
    cluster: "mood",
    cues: [
      "sad", "crying", "tearful", "cry all the time", "upset", "miserable",
      "unhappy", "down",
    ],
  },
  {
    name: "Low self-confidence",
    cluster: "mood",
    cues: [
      "no confidence", "low confidence", "shy", "cant speak up",
      "scared of people", "avoid people", "cant say no", "imposter",
      "second guess myself",
    ],
  },
  {
    name: "Low self-esteem",
    cluster: "mood",
    cues: [
      "hate myself", "self esteem", "worthless", "not good enough", "useless",
      "dont like myself", "dont know who i am", "lost myself", "no idea who i am",
      "ashamed", "failure",
    ],
  },
  {
    name: "Mental health",
    cluster: "mood",
    cues: [
      "mental health", "struggling", "not coping", "falling apart",
      "something is wrong", "need help", "breakdown", "not myself",
    ],
  },
  {
    name: "Self-harm",
    cluster: "mood",
    cues: [
      "self harm", "cutting", "hurting myself", "hurt myself", "burning myself",
    ],
  },
  {
    name: "Suicidal thoughts",
    cluster: "mood",
    cues: [
      "suicidal", "want to die", "end it", "kill myself", "better off without me",
      "dont want to be here", "no point being here",
    ],
  },

  /* --- trauma and abuse -------------------------------------------------- */
  {
    name: "Trauma",
    cluster: "trauma",
    cues: [
      "trauma", "traumatised", "ptsd", "flashbacks", "nightmares", "cant forget",
      "something happened", "accident", "jumpy", "triggered", "cptsd",
    ],
  },
  {
    name: "Domestic abuse",
    cluster: "trauma",
    cues: [
      "domestic abuse", "domestic violence", "scared of my partner", "he hits me",
      "she hits me", "frightened at home", "not safe at home", "controlling partner",
      "wont let me", "checks my phone", "cant leave",
    ],
  },
  {
    name: "Emotional abuse",
    cluster: "trauma",
    cues: [
      "emotional abuse", "puts me down", "walking on eggshells",
      "makes me feel small", "gaslighting", "gaslit", "never my fault",
      "always my fault", "silent treatment",
    ],
  },
  {
    name: "Narcissistic abuse",
    cluster: "trauma",
    cues: [
      "narcissist", "narcissistic", "narc", "everything is about them",
      "no empathy", "twists everything",
    ],
  },
  {
    name: "Bullying",
    cluster: "trauma",
    cues: [
      "bullied", "bullying", "picked on", "dread going to work",
      "singled out", "harassed at work", "targeted",
    ],
  },
  {
    name: "Dissociation",
    cluster: "trauma",
    cues: [
      "dissociate", "dissociation", "not really here", "watching myself",
      "zone out", "lose time", "detached", "unreal", "foggy",
    ],
  },
  {
    name: "Attachment disorder",
    cluster: "trauma",
    cues: [
      "attachment", "abandonment", "scared theyll leave", "clingy", "push people away",
      "cant get close", "trust issues", "cant trust anyone",
    ],
  },

  /* --- addiction and compulsion ------------------------------------------ */
  {
    name: "Addiction",
    cluster: "addiction",
    cues: [
      "addicted", "addiction", "cant stop", "hooked", "using again", "relapse",
      "habit i cant break", "compulsion",
    ],
  },
  {
    name: "Alcoholism",
    cluster: "addiction",
    cues: [
      "drink too much", "drinking", "alcohol", "alcoholic", "wine every night",
      "hungover", "drink more than i should", "cant stop drinking", "booze",
      "hiding bottles",
    ],
  },
  {
    name: "Drug addiction",
    cluster: "addiction",
    cues: [
      "drugs", "cocaine", "weed", "cannabis", "heroin", "pills", "using",
      "substance", "smoking too much",
    ],
  },
  {
    name: "Gambling",
    cluster: "addiction",
    cues: [
      "gambling", "betting", "bets", "casino", "slots", "lost money",
      "cant stop betting", "debt from gambling",
    ],
  },

  /* --- relationships and family ------------------------------------------ */
  {
    name: "Relationship problems",
    cluster: "relationships",
    cues: [
      "relationship", "marriage", "my partner", "we argue", "arguing",
      "we dont talk", "drifting apart", "couples", "husband", "wife", "girlfriend",
      "boyfriend", "same fight", "unhappy together",
    ],
  },
  {
    name: "Family issues",
    cluster: "relationships",
    cues: [
      "family", "my mum", "my dad", "my mother", "my father", "my kids",
      "my children", "my son", "my daughter", "my sister", "my brother",
      "snapping at my kids", "shouting at the kids", "in laws", "estranged",
    ],
  },
  {
    name: "Affairs and betrayals",
    cluster: "relationships",
    cues: [
      "affair", "cheated", "cheating", "unfaithful", "betrayed", "lied to me",
      "found messages", "cant trust them again",
    ],
  },
  {
    name: "Behaviour problems",
    cluster: "relationships",
    cues: [
      "behaviour", "acting out", "my child wont", "tantrums", "school called",
      "getting in trouble", "defiant",
    ],
  },
  {
    name: "Anger management",
    cluster: "relationships",
    cues: [
      "angry", "anger", "rage", "lose my temper", "snapping", "snap at people",
      "shouting", "short fuse", "lash out", "irritable", "wind up quickly",
      "snapping at my kids",
    ],
  },

  /* --- neurodiversity ----------------------------------------------------- */
  {
    name: "ADHD",
    cluster: "neurodiversity",
    cues: [
      "adhd", "add", "cant focus", "cant concentrate", "distracted",
      "never finish anything", "always late", "brain wont stop", "impulsive",
      "executive function",
    ],
  },
  {
    name: "Autism",
    cluster: "neurodiversity",
    cues: [
      "autistic", "autism", "asd", "aspergers", "masking", "sensory",
      "too loud", "meltdown", "shutdown", "social stuff is hard",
    ],
  },
  {
    name: "Neurodiversity",
    cluster: "neurodiversity",
    cues: [
      "neurodivergent", "neurodiverse", "neurodiversity", "wired differently",
      "late diagnosis", "waiting for assessment", "dyslexia", "dyspraxia",
    ],
  },
  {
    name: "High sensitivity",
    cluster: "neurodiversity",
    cues: [
      "too sensitive", "highly sensitive", "hsp", "take everything to heart",
      "overwhelmed by noise", "pick up on everything", "cry easily",
    ],
  },

  /* --- loss and life change ------------------------------------------------ */
  {
    name: "Bereavement",
    cluster: "loss",
    cues: [
      "bereaved", "bereavement", "grief", "grieving", "died", "death",
      "lost my mum", "lost my dad", "lost someone", "funeral", "miss them",
      "passed away",
    ],
  },
  {
    name: "Separation and divorce",
    cluster: "loss",
    cues: [
      "divorce", "divorced", "separated", "split up", "breakup", "broke up",
      "left me", "ended", "custody",
    ],
  },
  {
    name: "Blended family",
    cluster: "loss",
    cues: [
      "step family", "stepchildren", "stepdad", "stepmum", "blended family",
      "his kids", "her kids", "new partners children",
    ],
  },
  {
    name: "Spirituality",
    cluster: "loss",
    cues: [
      "spiritual", "spirituality", "faith", "meaning", "whats it all for",
      "lost my faith", "purpose", "meaningless",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* How sessions work                                                          */
/* -------------------------------------------------------------------------- */

export const formats = [
  {
    id: "in-person",
    name: "In person",
    where: "Her front room, Milford Haven",
    suits: "Most people, most of the time. Being in the same room is still the thing that works best.",
    happens: "Fifty minutes, same chair, same time each week. Tea if you want it.",
    needed: "A way to get to SA73. Parking is on the street outside.",
  },
  {
    id: "online",
    name: "Online",
    where: "Doxy or WhatsApp video",
    suits: "Anyone a long drive away, working shifts, or who finds a screen easier than a room.",
    happens: "Same fifty minutes. Doxy opens in a browser — no account, nothing to install.",
    needed: "A phone or laptop, and a room where you won't be overheard.",
  },
  {
    id: "phone",
    name: "Phone",
    where: "A call, at a set time",
    suits: "People with poor broadband, or anyone who thinks better without a camera on them.",
    happens: "She rings you at the agreed time. You can walk about while you talk.",
    needed: "A signal and fifty minutes. Withheld numbers are fine.",
  },
  {
    id: "home-visit",
    name: "Home visit",
    where: "She comes to you, across Pembrokeshire",
    suits: "People who can't travel — health, mobility, no car, no bus, or small children at home.",
    happens: "She drives to you. Same session, in your kitchen or front room.",
    needed: "An address within reach of Milford Haven, and a door you can answer.",
  },
] as const;

export const sessionsSection = {
  heading: "Four ways to do this",
  intro:
    "Pembrokeshire is rural and buses are not what they were. Phone sessions and home visits are ordinary here, not an afterthought.",
  suitsLabel: "Who it suits",
  happensLabel: "What happens",
  neededLabel: "What you need",
} as const;

/* -------------------------------------------------------------------------- */
/* Her approach                                                               */
/* -------------------------------------------------------------------------- */

export const approach = {
  heading: "Adlerian therapy, in plain words",
  body: [
    "In practice that means less time spent on why last week was hard, and more on what a slightly different next week could actually look like — small, real changes you leave with.",
  ],
  moreLabel: "The other approaches she draws on",
  moreHelp: "Chosen to fit you, not the other way round.",
  modalities: [
    {
      name: "Cognitive and behavioural therapies",
      line: "Noticing the loop between what you think, what you do and how you feel — then changing one part of it.",
    },
    {
      name: "Cognitive processing therapy (CPT)",
      line: "Structured work for trauma, going at the pace you set.",
    },
    {
      name: "Cognitive therapy",
      line: "Testing the thoughts that arrive automatically, rather than believing them by default.",
    },
    {
      name: "Couples therapy",
      line: "Both of you in the room, working on the pattern rather than on each other.",
    },
    {
      name: "Humanistic therapies",
      line: "You are the expert on your own life. She is not there to correct you.",
    },
    {
      name: "Integrative counselling",
      line: "Drawing on several models at once because people don't fit one.",
    },
    {
      name: "Transactional analysis",
      line: "Looking at the roles we slip into with other people, and how to step out of them.",
    },
  ],
  cpdNote:
    "She keeps training. What she uses with you depends on you, and it changes as the work goes on.",
} as const;

/* -------------------------------------------------------------------------- */
/* Who she works with                                                         */
/* -------------------------------------------------------------------------- */

export const clients = [
  "Young adults 18–24",
  "Adults 25–64",
  "Older adults 65+",
  "Couples",
  "Organisations",
  "Employee Assistance Programmes",
] as const;

/* -------------------------------------------------------------------------- */
/* Fees                                                                       */
/* -------------------------------------------------------------------------- */

export const fees = {
  heading: "Fees",
  amount: "£45",
  unit: "a session",
  duration: "50 minutes",
  freeHeading: "The first call is free.",
  freeBody: "Fifteen minutes, no charge, nothing to prepare and no obligation after it.",
  concessionHeading: "If £45 is the thing stopping you",
  concessionBody:
    "She holds a few places at a lower rate and decides them case by case. Tick the box in the form and she'll sort it with you privately. You won't have to explain yourself.",
  payment: "Cash, bank transfer or card, after each session.",
  cancellation: "Twenty-four hours' notice and there's no charge.",
} as const;

/* -------------------------------------------------------------------------- */
/* Credentials                                                                */
/* -------------------------------------------------------------------------- */

export const credentials = {
  heading: "Qualifications and registration",
  rows: [
    { fact: "Diploma in Adlerian Counselling & Psychotherapy", note: "Her core training" },
    { fact: "Certificate in Adlerian Counselling & Psychotherapy", note: "" },
    { fact: "Registered member, BACP", note: "British Association for Counselling and Psychotherapy" },
    { fact: "Professional Standards Authority", note: "Accredited Register" },
    { fact: "Enhanced DBS check", note: "" },
    { fact: "One year counselling with MIND", note: "The national mental health charity" },
    { fact: "Four years and counting with clients", note: "In an office setting, now in private practice" },
  ],
  noTestimonialsHeading: "There are no client reviews on this site",
  noTestimonialsBody:
    "She is BACP-registered. What clients say in that room stays in it, and that includes saying nice things about her in public.",
} as const;

/* -------------------------------------------------------------------------- */
/* Chapter index — the page read as a sequence of rooms                       */
/* -------------------------------------------------------------------------- */

export const chapters = {
  welcome: { n: "i", label: "First, hello" },
  words: { n: "ii", label: "What she works with" },
  sessions: { n: "iii", label: "How sessions work" },
  approach: { n: "iv", label: "How she works" },
  fees: { n: "v", label: "What it costs" },
  credentials: { n: "vi", label: "Background" },
  arriving: { n: "vii", label: "Coming here" },
  booking: { n: "viii", label: "The first step" },
} as const;

/* -------------------------------------------------------------------------- */
/* Arriving                                                                   */
/* -------------------------------------------------------------------------- */

export const arriving = {
  heading: "What arriving is actually like",
  intro: "The bit nobody tells you. Read it now so it's boring by the time you do it.",
  steps: [
    { at: "Parking", text: { value: "Park on the street outside. Details to be supplied.", status: "TO CONFIRM" as Confirm } },
    { at: "The door", text: { value: "Description of the front door to be supplied.", status: "TO CONFIRM" as Confirm } },
    { at: "Knocking", text: { value: "Knock or ring — you don't need to arrive early. She'll come to the door herself.", status: "confirmed" as Confirm } },
    { at: "Inside", text: { value: "Straight into the front room. Coats stay on if you'd rather.", status: "confirmed" as Confirm } },
    { at: "Sitting down", text: { value: "Take whichever chair you want. Tea, water, or neither.", status: "confirmed" as Confirm } },
    { at: "Leaving", text: { value: "Fifty minutes later she'll say so. You don't have to book another one there and then.", status: "confirmed" as Confirm } },
  ],
  addressHeading: "Where",
  directionsLabel: "Open in maps",
  coverageHeading: "She also travels",
  coverageBody: "Not sure you're in reach? Ring and ask.",
} as const;

/* -------------------------------------------------------------------------- */
/* Booking                                                                    */
/* -------------------------------------------------------------------------- */

export const booking = {
  heading: "Book a free 15\u2011minute call",
  intro:
    "Four short steps. Nothing here asks what's wrong — she'd rather hear it from you than read it.",
  steps: [
    { id: "format", name: "Kind of session", short: "Session" },
    { id: "time", name: "Pick a time", short: "Time" },
    { id: "contact", name: "How to reach you", short: "Contact" },
    { id: "note", name: "Anything she should know", short: "Note" },
  ],
  formatQuestion: "Which are you thinking of?",
  formatHelp: "You can change your mind later. The first call is on the phone either way.",
  timeHeading: "Pick a time that suits you",
  timeHelp:
    "Fifteen minutes, free. Times are shown in your own timezone. You'll get a reminder and can move it whenever you like.",
  timeMissing:
    "The calendar isn't connected yet. Ring 07864 011 852 and Lyndsay will find you a time.",
  contactHeading: "How should she reach you?",
  contactHelp: "One way is enough. She only uses it to arrange the call.",
  nameLabel: "What should she call you?",
  namePlaceholder: "First name is fine",
  methodLabel: "Best way to reach you",
  methodPhone: "Phone",
  methodEmail: "Email",
  phoneLabel: "Phone number",
  emailLabel: "Email address",
  discreetLabel: "Anything she should know about contacting you",
  discreetHelp:
    "Optional. If a call at the wrong moment would cause a problem, say so here. For example: don't leave a voicemail, or text first.",
  safeTimesLabel: "Safe times to ring",
  safeTimesPlaceholder: "Weekdays before 3pm, for example",
  noteHeading: "Anything you'd like her to know?",
  noteHelp:
    "Completely optional. There's no need to explain anything yet — that's what the call is for. Plenty of people leave this empty.",
  notePlaceholder: "Or leave this blank",
  concessionLabel: "I'd like to ask about a lower rate",
  concessionHelp: "She'll raise it on the call. Nobody has to say it out loud first.",
  consentHeading: "What happens to what you've typed",
  consentBody:
    "Your name and contact details are emailed to Lyndsay and nowhere else. Nothing is stored on this website, there's no database and no analytics can read this form. She deletes the email once you've spoken, or within 30 days if you don't.",
  submit: "Send this to Lyndsay",
  submitting: "Sending…",
  back: "Back",
  next: "Next",
  errorHeading: "That didn't send",
  errorBody: "Try once more, or ring 07864 011 852 instead.",
  confirmation: {
    welsh: "Diolch",
    heading: "That's with her.",
    lines: [
      "She'll reply within one working day, usually sooner, using the way you asked her to.",
      "The call is fifteen minutes. She'll ask what's brought you, and answer anything you want to ask about how she works.",
      "You don't have to prepare. You don't have to book anything at the end of it.",
    ],
    ring: "If you'd rather not wait, ring her on",
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Crisis                                                                     */
/* -------------------------------------------------------------------------- */

export const crisis = {
  heading: "If you need someone now",
  body: "This is a private practice, not an emergency service. Lyndsay can't respond urgently and does not monitor messages out of hours.",
  lines: [
    { name: "Samaritans", detail: "116 123 — free, 24 hours", href: "tel:116123" },
    { name: "NHS 111, option 2", detail: "Urgent mental health support", href: "tel:111" },
    { name: "999", detail: "If life is at risk", href: "tel:999" },
    { name: "Text SHOUT to 85258", detail: "Free 24-hour text support", href: "sms:85258&body=SHOUT" },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Quick exit and calm mode                                                   */
/* -------------------------------------------------------------------------- */

export const safety = {
  exitLabel: "Leave this site quickly",
  exitShort: "Leave",
  exitFooter:
    "The leave button sends this browser straight to a weather forecast and removes this page from your back button. Pressing Escape twice does the same. It cannot clear your history — for that, use a private window.",
  exitTarget: "https://www.bbc.co.uk/weather",
  calmLabel: "Calm mode",
  calmOn: "Calm mode on",
  calmOff: "Calm mode off",
  calmHelp: "Stops all movement, opens up the spacing and puts everything in one column.",
  modeLabel: "Lighting",
  modeDay: "Day",
  modeEvening: "Evening",
  modeAuto: "Auto",
} as const;

/* -------------------------------------------------------------------------- */
/* Navigation, footer, meta                                                   */
/* -------------------------------------------------------------------------- */

export const nav = [
  { href: "#words", label: "What she works with" },
  { href: "#sessions", label: "Sessions" },
  { href: "#approach", label: "Approach" },
  { href: "#fees", label: "Fees" },
  { href: "#arriving", label: "Arriving" },
] as const;

export const footer = {
  blurb: "Adlerian psychotherapy and counselling in Milford Haven, and across Pembrokeshire.",
  contactHeading: "Contact",
  followHeading: "Follow",
  legalHeading: "Legal",
  links: [
    { href: "/about", label: "About Lyndsay" },
    { href: "/privacy", label: "Privacy" },
  ],
  copyright: (year: number) => `© ${year} Sage Psychotherapy & Counselling`,
  builtNote: "This site sets no cookies and does not track you.",
} as const;

export const meta = {
  title:
    "Counselling and psychotherapy in Milford Haven — Sage Psychotherapy & Counselling",
  description:
    "Adlerian psychotherapy and counselling in Milford Haven, Pembrokeshire. In person, online, by phone or at your home. £45 a session and a free 15-minute call first.",
  ogAlt:
    "The therapy room in Milford Haven: navy-teal wall, tan leather sofas and a mustard armchair, lit by a lamp.",
} as const;

/* -------------------------------------------------------------------------- */
/* About page                                                                 */
/* -------------------------------------------------------------------------- */

export const about = {
  title: "About Lyndsay Gent",
  description:
    "Lyndsay Gent is an Adlerian psychotherapist and counsellor in Milford Haven, Pembrokeshire. BACP member, PSA Accredited Register, enhanced DBS.",
  heading: "About Lyndsay",
  sections: [
    {
      heading: "How she got here",
      body: [
        "She trained as an Adlerian counsellor and psychotherapist, took the certificate and then the diploma, and spent a year counselling for MIND.",
        "Four years of client work in an office followed. She now practises from her own home in Milford Haven, which suits the work better than any office did.",
      ],
    },
    {
      heading: "How she works",
      body: [
        "Adlerian therapy is the base. Everything else she has trained in gets used when it fits the person in front of her, which is why she keeps training.",
        "She is not a blank screen. You will get a real conversation, and she will say what she thinks if you ask her.",
      ],
    },
    {
      heading: "What she will not do",
      body: [
        "She won't diagnose you, and she won't promise you an outcome — nobody honest can.",
        "She won't ask you to describe anything before you're ready, and she won't be shocked by whatever you do describe.",
      ],
    },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* Privacy page                                                               */
/* -------------------------------------------------------------------------- */

export const privacy = {
  title: "Privacy",
  description:
    "What Sage Psychotherapy & Counselling collects through this website, why, how long it is kept and who sees it.",
  heading: "Privacy",
  updated: "Last updated 3 September 2026",
  intro:
    "The short version: this website has no database, sets no cookies and tracks nobody. The only information that leaves your browser is what you type into the enquiry form.",
  sections: [
    {
      heading: "The enquiry form",
      body: [
        "It collects your name, one way to reach you, optional notes about contacting you safely, and anything you choose to write in the free-text box.",
        "It is emailed to Lyndsay and nowhere else. It is not written to any database, and the contents are never written to a server log.",
        "She deletes the email once you have spoken, or within 30 days if you don't reply.",
      ],
    },
    {
      heading: "What it deliberately does not ask",
      body: [
        "No diagnoses, no medical history, no symptoms, no date of birth, no address. None of that is needed to ring you back, so none of it is collected.",
      ],
    },
    {
      heading: "Finding the words",
      body: [
        "The box where you describe how you feel runs entirely in your browser. What you type is never transmitted, never stored and never seen by anyone but you.",
      ],
    },
    {
      heading: "Booking",
      body: [
        "Times are booked through Cal.com, which is a separate company and holds your name, email and the appointment itself under its own privacy policy.",
      ],
    },
    {
      heading: "Cookies and analytics",
      body: [
        "None. There is no cookie banner because there is nothing to consent to. Your calm-mode and lighting preferences are stored in your own browser and never sent anywhere.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You can ask what she holds about you, ask for it to be corrected, or ask her to delete it. Ring 07864 011 852. You can also complain to the Information Commissioner's Office at ico.org.uk.",
      ],
    },
    {
      heading: "Once you are a client",
      body: [
        "Clinical notes are a separate matter from this website, kept under BACP requirements. She will go through that with you before you start.",
      ],
    },
  ],
} as const;

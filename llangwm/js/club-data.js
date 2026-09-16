/* ==========================================================================
   LLANGWM RFC — CLUB CONTENT
   --------------------------------------------------------------------------
   This is the only file the club needs to edit to keep the website current.
   Everything below feeds the pages directly: fixtures, news, people, photos,
   partners and contact details. No build step, no CMS — edit, save, upload.

   Two rules:
     1. Keep the punctuation exactly as it is (commas, quotes, brackets).
     2. If you don't have something yet, leave it as "" or [] and the site
        will show a tidy placeholder instead of a broken one.

   Every value that has NOT been verified against an official club source is
   marked  // CHECK  so it can be confirmed before the site goes live.
   ========================================================================== */

window.LLANGWM = {

  /* ----------------------------------------------------------------------
     1. THE CLUB — names, address, contact, links
     ---------------------------------------------------------------------- */
  club: {
    name: "Llangwm Rugby Football Club",
    shortName: "Llangwm RFC",
    nickname: "The Wasps",
    founded: 1885,

    // Clubhouse address, as supplied by the club.
    address: [
      "Llangwm Rugby Football Club",
      "The Green",
      "Llangwm",
      "Haverfordwest",
      "SA62 4HJ"
    ],

    // CHECK — supplied by the club from its Google listing.
    phone: "01437 890462",

    // Leave "" to hide the email row entirely.
    email: "",

    // The club's official WRU site carries the live fixture list, results
    // and league tables. Every "official site" link on the website uses this.
    officialSite: "https://llangwm.rfc.wales/",
    officialFixtures: "https://llangwm.rfc.wales/fixtures",
    officialNews: "https://llangwm.rfc.wales/news/",

    // CHECK — the club's official site lists the playing ground separately
    // from the clubhouse. Confirm which address supporters should be given
    // for matchdays, then update the mapQuery below to match.
    groundNote: "Pill Parks Way, Llangwm, Haverfordwest",

    // Used to build the Google Maps and directions buttons.
    mapQuery: "Llangwm Rugby Football Club, Llangwm, Haverfordwest"
  },

  /* ----------------------------------------------------------------------
     2. SOCIAL — only accounts confirmed as the club's own
     ---------------------------------------------------------------------- */
  social: {
    instagramHandle: "@llangwm_official_rfc",
    instagram: "https://www.instagram.com/llangwm_official_rfc/",

    // CHECK — listed publicly as "Llangwm Rugby Club | Official Page".
    // Confirm with the club, or set to "" to remove the Facebook links.
    facebook: "https://www.facebook.com/p/Llangwm-Rugby-Club-100046941897028/"
  },

  /* ----------------------------------------------------------------------
     3. FIXTURES
     --------------------------------------------------------------------------
     Add fixtures here and they appear on the site automatically, newest
     first. While a list is empty the site shows a short panel pointing
     supporters at the official fixture list instead — so nothing ever looks
     broken or out of date.

     Copy this block for each new fixture:

       {
         date: "2026-10-03",        // always YYYY-MM-DD
         opponent: "Narberth RFC Athletic",
         venue: "home",             // "home" or "away"
         kickOff: "14:30",
         ground: "The Green, Llangwm",
         competition: "League",     // optional
         result: ""                 // "" until played, then e.g. "W 24-17"
       },
     ---------------------------------------------------------------------- */
  fixtures: {
    firstXV: [],
    juniors: []
  },

  /* ----------------------------------------------------------------------
     4. NEWS / WHAT'S ON
     --------------------------------------------------------------------------
     The two entries below are real, dated reports published on the club's
     own official site. Add new ones at the TOP of the list.
     Set image to "" if there is no photo — a designed plate is used instead.
     ---------------------------------------------------------------------- */
  news: [
    {
      date: "2024-11-02",
      title: "Wasps sting second-placed Quins",
      kicker: "First XV",
      summary: "A first-team report from the club's official site.",
      image: "",
      url: "https://llangwm.rfc.wales/news/5de9cc42-17fd-4f30-82f9-0c2f910d4e53/wasps-sting-second-placed-quins----2-11-2024"
    },
    {
      date: "2024-10-12",
      title: "Under 12s v St Clears / Whitland",
      kicker: "Mini & Junior",
      summary: "A junior section match report from the club's official site.",
      image: "",
      url: "https://llangwm.rfc.wales/news/6633e469-160c-48d6-80d4-416a2268ecd6/u12s-v-st-clears-whitland--12th-oct-2024"
    }
  ],

  /* ----------------------------------------------------------------------
     5. MEET THE TEAM
     --------------------------------------------------------------------------
     Names and roles exactly as supplied by the club. Add a photo by dropping
     a file into assets/photos/ and putting its filename in `photo`, e.g.
     photo: "assets/photos/jordan-evans.jpg". Leave "" for a monogram card.
     ---------------------------------------------------------------------- */
  team: [
    { name: "Jordan Evans",  role: "Head of Rugby",  photo: "" },
    { name: "Dan Richards",  role: "Backs Coach",    photo: "" },
    { name: "Gethin Thomas", role: "Forwards Coach", photo: "" },
    { name: "James Lewis",   role: "Team Manager",   photo: "" },
    { name: "Leanne Clarke", role: "Club Physio",    photo: "" },
    { name: "Dan Chesmer",   role: "Chairman",       photo: "" }
  ],

  /* ----------------------------------------------------------------------
     6. HISTORY & ARCHIVE SOURCE
     --------------------------------------------------------------------------
     The history timeline and the archive index cards are written directly
     into index.html (look for  id="history"  and  id="archive" ) because
     they are historical and rarely change. The credit block below is what
     appears beneath the archive.

     Everything in both sections is drawn from the Llangwm Local History
     Society's pages on Llangwm RFC, which reproduce Richard Howells'
     centenary book "Llangwm RFC: A Hundred Years of Rugby 1885-1985".
     Please do not add an entry unless it can be checked against a source.
     ---------------------------------------------------------------------- */
  archiveSource: {
    credit: "Llangwm Local History Society",
    author: "Richard Howells",
    book: "Llangwm RFC: A Hundred Years of Rugby 1885–1985",
    pages: [
      { label: "A Hundred Years of Rugby — part one", url: "https://llangwmlocalhistorysociety.org.uk/llangwmrfc100years1.html" },
      { label: "A Hundred Years of Rugby — part two", url: "https://llangwmlocalhistorysociety.org.uk/llangwmrfc100years2.html" },
      { label: "Llangwm Rugby Club",                  url: "https://llangwmlocalhistorysociety.org.uk/llangwmrugbyclub.html" }
    ]
  },

  /* ----------------------------------------------------------------------
     7. GALLERY
     --------------------------------------------------------------------------
     Drop photographs into assets/photos/ and list them here. Categories are
     free text — whatever you use becomes a filter button automatically.
     Suggested: Matchday, The Club, The Wasps, Community, Juniors.

       { src: "assets/photos/matchday-01.jpg", alt: "Llangwm RFC First XV
         pack drives for the line at The Green", category: "Matchday" },
     ---------------------------------------------------------------------- */
  gallery: [],

  /* ----------------------------------------------------------------------
     8. MINI & JUNIOR
     --------------------------------------------------------------------------
     The age groups below appear on the club's official site. Add training
     times and a contact only once they are confirmed — leave "" otherwise
     and the site will point people to the club's social media instead.
     ---------------------------------------------------------------------- */
  juniors: {
    ageGroups: ["Under 8s", "Under 9s", "Under 10s", "Under 11s", "Under 12s", "Under 14s", "Under 16s"], // CHECK
    trainingTimes: "",   // e.g. "Sunday mornings, 10:00–11:30 at The Green"
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  },

  /* ----------------------------------------------------------------------
     9. CLUB SHOP
     --------------------------------------------------------------------------
     Paste the real shop URLs in when they are confirmed. While a url is ""
     the button becomes an "ask the club" link rather than a dead link.
     ---------------------------------------------------------------------- */
  shop: [
    { name: "RCS",       blurb: "Official playing kit and training wear.", url: "" }, // CHECK
    { name: "KJ Prints", blurb: "Clubwear and supporter clothing.",        url: "" }  // CHECK
  ],

  /* ----------------------------------------------------------------------
     10. PARTNERS & SPONSORS
     --------------------------------------------------------------------------
       { name: "Business name", logo: "assets/sponsors/name.svg",
         url: "https://example.co.uk" },
     Leave logo as "" and the partner's name is set in type instead.
     ---------------------------------------------------------------------- */
  sponsors: [],

  /* ----------------------------------------------------------------------
     11. ACCREDITATION
     --------------------------------------------------------------------------
     CHECK — set `show` to true only once the club's current WRU accreditation
     level is confirmed. Nothing is displayed while this is false.
     The official WRU accreditation badge artwork is not included here; add it
     as assets/brand/wru-accreditation.svg and set `badge` to that path once
     the club has the approved file.
     ---------------------------------------------------------------------- */
  accreditation: {
    show: true,
    level: "Gold",
    body: "Welsh Rugby Union",
    badge: ""
  }
};

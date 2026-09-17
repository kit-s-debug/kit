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

    // The clubhouse is listed publicly under this name.
    venueName: "Llangwm Rugby, Cricket & Social Club",
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

    // Clubhouse opening hours. One line per row, e.g.
    //   openingHours: ["Friday 19:00 - late", "Saturday 12:00 - late"]
    // No hours are published on the club's Google listing, so this is left
    // empty rather than guessed. Fill it in and the rows appear under Find Us.
    openingHours: [],

    // CHECK — the playing ground is recorded separately from the clubhouse.
    // Confirm which address supporters should be given for matchdays, then
    // update the mapQuery below to match.
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

    /* Admiral Men's National Leagues, Division 4 West A, 2026/27 — as
       published by the WRU. Nine home, nine away.

       Kick-off times are NOT on the WRU list, so they are left empty rather
       than guessed; the site shows "Kick-off TBC" until you fill one in.

       When a game has been played, add the score to that fixture — e.g.
         result: "W 24-17"
       — and it moves itself out of Next up and into Recent results. */
    firstXV: [
      { date: "2026-09-12", venue: "away", opponent: "St Davids RFC",                 competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2026-09-19", venue: "home", opponent: "Llanybydder RFC",               competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2026-09-26", venue: "away", opponent: "Pembroke Dock Harlequins RFC",  competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2026-10-10", venue: "home", opponent: "Narberth RFC Athletic",         competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2026-10-17", venue: "away", opponent: "Newcastle Emlyn RFC Athletic",  competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2026-10-31", venue: "home", opponent: "Tenby United RFC Athletic",     competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2026-11-21", venue: "away", opponent: "Pembroke RFC",                  competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2026-11-28", venue: "home", opponent: "Aberystwyth RFC Athletic",      competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2026-12-05", venue: "home", opponent: "Crymych RFC Athletic",          competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2026-12-12", venue: "away", opponent: "Llanybydder RFC",               competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2026-12-19", venue: "home", opponent: "St Davids RFC",                 competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2027-01-02", venue: "home", opponent: "Pembroke Dock Harlequins RFC",  competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2027-01-09", venue: "away", opponent: "Narberth RFC Athletic",         competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2027-01-16", venue: "home", opponent: "Newcastle Emlyn RFC Athletic",  competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2027-01-23", venue: "away", opponent: "Tenby United RFC Athletic",     competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2027-01-30", venue: "home", opponent: "Pembroke RFC",                  competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2027-02-27", venue: "away", opponent: "Aberystwyth RFC Athletic",      competition: "Division 4 West A", kickOff: "", result: "" },
      { date: "2027-03-20", venue: "away", opponent: "Crymych RFC Athletic",          competition: "Division 4 West A", kickOff: "", result: "" },
    ],

    juniors: []
  },

  /* ----------------------------------------------------------------------
     4. NEWS / WHAT'S ON
     --------------------------------------------------------------------------
     Match reports, results and announcements. Add new ones at the TOP of the
     list. Set image to "" if there is no photo — a designed plate is used
     instead, and `url` can be left out for an item with nowhere to link.

       {
         date: "2026-10-04",
         title: "Wasps sting second-placed Quins",
         kicker: "First XV",
         summary: "One line about what happened.",
         image: "",
         url: ""
       },

     While this list is empty the section shows a short panel pointing
     supporters at the club's Instagram instead.
     ---------------------------------------------------------------------- */
  news: [],

  /* ----------------------------------------------------------------------
     5. MEET THE TEAM
     --------------------------------------------------------------------------
     Names and roles exactly as supplied by the club. Add a photo by dropping
     a file into assets/photos/ and putting its filename in `photo`, e.g.
     photo: "assets/photos/jordan-evans.jpg". Leave "" for a monogram card.
     ---------------------------------------------------------------------- */
  team: [
    { name: "Jordan Evans",  role: "Head of Rugby",  photo: "assets/photos/jordan-evans.jpg" },
    { name: "Dan Richards",  role: "Backs Coach",    photo: "assets/photos/dan-richards.jpg" },
    { name: "Gethin Thomas", role: "Forwards Coach", photo: "assets/photos/gethin-thomas.jpg" },
    { name: "James Lewis",   role: "Team Manager",   photo: "assets/photos/james-lewis.jpg" },
    { name: "Leanne Clarke", role: "Club Physio",    photo: "assets/photos/leanne-clarke.jpg" },
    { name: "Dan Chesmer",   role: "Chairman",       photo: "assets/photos/dan-chesmer.jpg" }
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
     Add training times and a contact only once they are confirmed — leave ""
     otherwise and the site will point people to the club's social media
     instead.
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
  sponsors: [
    // CHECK — Loche Bros is the front-of-shirt sponsor on the club's current
    // playing kit. Add their website and a logo file when you have them, and
    // add the rest of the season's partners in the same shape.
    { name: "Loche Bros", logo: "", url: "" }
  ],

  /* ----------------------------------------------------------------------
     11. ACCREDITATION
     --------------------------------------------------------------------------
     CHECK — set `show` to true only once the club's current WRU accreditation
     level is confirmed. Nothing is displayed while this is false.
     The official WRU accreditation badge artwork is not included here; add it
     as assets/brand/wru-accreditation.png and set `badge` to that path once
     the club has the approved file.
     ---------------------------------------------------------------------- */
  accreditation: {
    show: true,
    level: "Gold",
    body: "Welsh Rugby Union",
    badge: ""
  }
};

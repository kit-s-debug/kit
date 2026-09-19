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

       Kick-off is 14:30, confirmed by the club. Change a single fixture by
       editing its kickOff; clear it to "" and that fixture reads
       "Kick-off TBC" instead.

       When a game has been played, add the score to that fixture — e.g.
         result: "W 24-17"
       — and it moves itself out of Next up and into Recent results. */
    firstXV: [
      { date: "2026-09-12", venue: "away", opponent: "St Davids RFC",                 competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2026-09-19", venue: "home", opponent: "Llanybydder RFC",               competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2026-09-26", venue: "away", opponent: "Pembroke Dock Harlequins RFC",  competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2026-10-10", venue: "home", opponent: "Narberth RFC Athletic",         competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2026-10-17", venue: "away", opponent: "Newcastle Emlyn RFC Athletic",  competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2026-10-31", venue: "home", opponent: "Tenby United RFC Athletic",     competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2026-11-21", venue: "away", opponent: "Pembroke RFC",                  competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2026-11-28", venue: "home", opponent: "Aberystwyth RFC Athletic",      competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2026-12-05", venue: "home", opponent: "Crymych RFC Athletic",          competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2026-12-12", venue: "away", opponent: "Llanybydder RFC",               competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2026-12-19", venue: "home", opponent: "St Davids RFC",                 competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2027-01-02", venue: "home", opponent: "Pembroke Dock Harlequins RFC",  competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2027-01-09", venue: "away", opponent: "Narberth RFC Athletic",         competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2027-01-16", venue: "home", opponent: "Newcastle Emlyn RFC Athletic",  competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2027-01-23", venue: "away", opponent: "Tenby United RFC Athletic",     competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2027-01-30", venue: "home", opponent: "Pembroke RFC",                  competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2027-02-27", venue: "away", opponent: "Aberystwyth RFC Athletic",      competition: "Division 4 West A", kickOff: "14:30", result: "" },
      { date: "2027-03-20", venue: "away", opponent: "Crymych RFC Athletic",          competition: "Division 4 West A", kickOff: "14:30", result: "" },
    ],

    /* Llangwm Minis and Junior Fixtures 2026-2027, as issued by the club.
       Sundays. Each date has two entries because the two age bands often
       play different venues on the same day — the band is shown under the
       opponent's name.

       Byes, winter breaks, Remembrance Day, Mother's Day and Easter Sunday
       are not listed: there is no fixture to show. The club's sheet also
       notes that fixtures are subject to change, and that not all clubs
       have teams in every age group.

       Dates from the same sheet, not listed here as they are not Llangwm
       fixtures: Minis End of Season County Festivals 25 April, Junior Plate
       Finals 30 April, Junior Cup Finals Day 2 May. */
    juniors: [
      { date: "2026-09-13", venue: "home", opponent: "Aberystwyth",         competition: "U7–U11", kickOff: "", result: "" },
      { date: "2026-09-13", venue: "away", opponent: "Aberystwyth",         competition: "U12–U15", kickOff: "", result: "" },
      { date: "2026-09-20", venue: "away", opponent: "Tenby",               competition: "U7–U11", kickOff: "", result: "" },
      { date: "2026-09-20", venue: "home", opponent: "Tenby",               competition: "U12–U15", kickOff: "", result: "" },
      { date: "2026-09-27", venue: "away", opponent: "Minis Festivals",     competition: "U7–U11", kickOff: "", result: "" },
      { date: "2026-09-27", venue: "away", opponent: "Whitland",            competition: "U12–U15", kickOff: "", result: "" },
      { date: "2026-10-04", venue: "home", opponent: "Neyland",             competition: "U7–U11", kickOff: "", result: "" },
      { date: "2026-10-04", venue: "away", opponent: "Neyland",             competition: "U12–U15", kickOff: "", result: "" },
      { date: "2026-10-11", venue: "away", opponent: "Crymych",             competition: "U7–U11", kickOff: "", result: "" },
      { date: "2026-10-11", venue: "home", opponent: "Crymych",             competition: "U12–U15", kickOff: "", result: "" },
      { date: "2026-10-18", venue: "away", opponent: "Minis Festivals",     competition: "U7–U11", kickOff: "", result: "" },
      { date: "2026-10-18", venue: "away", opponent: "Pem Dock Quins",      competition: "U12–U15", kickOff: "", result: "" },
      { date: "2026-10-25", venue: "away", opponent: "Aberaeron",           competition: "U7–U11", kickOff: "", result: "" },
      { date: "2026-10-25", venue: "home", opponent: "Aberaeron",           competition: "U12–U15", kickOff: "", result: "" },
      { date: "2026-11-01", venue: "home", opponent: "Cardigan",            competition: "U7–U11", kickOff: "", result: "" },
      { date: "2026-11-01", venue: "away", opponent: "Cardigan",            competition: "U12–U15", kickOff: "", result: "" },
      { date: "2026-11-15", venue: "away", opponent: "Haverfordwest",       competition: "U7–U11 · Cup prelims", kickOff: "", result: "" },
      { date: "2026-11-15", venue: "home", opponent: "Haverfordwest",       competition: "U12–U15 · Cup prelims", kickOff: "", result: "" },
      { date: "2026-11-22", venue: "away", opponent: "Minis Festivals",     competition: "U7–U11", kickOff: "", result: "" },
      { date: "2026-11-22", venue: "away", opponent: "Milford Haven",       competition: "U12–U15", kickOff: "", result: "" },
      { date: "2026-11-29", venue: "away", opponent: "Fishguard",           competition: "U7–U11", kickOff: "", result: "" },

      /* Cup quarter finals, 29 November, from the knockout draw. These
         replace the blanket U12-U15 line on the club's fixture sheet: the
         draw gives Llangwm a different opponent in each age group. Llangwm
         are not in the U16 quarter finals.

         The U15 opponent is whoever wins the Haverfordwest v Crymych
         preliminary tie, so it is named as both until that is played. */
      { date: "2026-11-29", venue: "home", opponent: "Pembroke",             competition: "U12 · Cup quarter final", kickOff: "", result: "" },
      { date: "2026-11-29", venue: "away", opponent: "St Davids",            competition: "U13 · Cup quarter final", kickOff: "", result: "" },
      { date: "2026-11-29", venue: "away", opponent: "Crymych",              competition: "U14 · Cup quarter final", kickOff: "", result: "" },
      { date: "2026-11-29", venue: "home", opponent: "Haverfordwest or Crymych", competition: "U15 · Cup quarter final", kickOff: "", result: "" },
      { date: "2026-12-06", venue: "home", opponent: "Pembroke",            competition: "U7–U11", kickOff: "", result: "" },
      { date: "2026-12-06", venue: "away", opponent: "Pembroke",            competition: "U12–U15", kickOff: "", result: "" },
      { date: "2026-12-13", venue: "away", opponent: "St Davids",           competition: "U7–U11", kickOff: "", result: "" },
      { date: "2026-12-13", venue: "home", opponent: "St Davids",           competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-01-10", venue: "home", opponent: "Narberth",            competition: "U7–U11", kickOff: "", result: "" },
      { date: "2027-01-10", venue: "away", opponent: "Narberth",            competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-01-24", venue: "away", opponent: "Aberystwyth",         competition: "U7–U11", kickOff: "", result: "" },
      { date: "2027-01-24", venue: "home", opponent: "Aberystwyth",         competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-01-31", venue: "home", opponent: "Tenby",               competition: "U7–U11 · Cup and Plate semi finals", kickOff: "", result: "" },
      { date: "2027-01-31", venue: "away", opponent: "Tenby",               competition: "U12–U15 · Cup and Plate semi finals", kickOff: "", result: "" },
      { date: "2027-02-07", venue: "away", opponent: "Whitland",            competition: "U7–U11", kickOff: "", result: "" },
      { date: "2027-02-07", venue: "home", opponent: "Whitland",            competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-02-14", venue: "away", opponent: "Neyland",             competition: "U7–U11", kickOff: "", result: "" },
      { date: "2027-02-14", venue: "home", opponent: "Neyland",             competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-02-21", venue: "home", opponent: "Crymych",             competition: "U7–U11", kickOff: "", result: "" },
      { date: "2027-02-21", venue: "away", opponent: "Crymych",             competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-02-28", venue: "away", opponent: "Pem Dock Quins",      competition: "U7–U11", kickOff: "", result: "" },
      { date: "2027-02-28", venue: "home", opponent: "Pem Dock Quins",      competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-03-14", venue: "away", opponent: "Minis Festivals",     competition: "U7–U11", kickOff: "", result: "" },
      { date: "2027-03-14", venue: "away", opponent: "Aberaeron",           competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-03-21", venue: "away", opponent: "Cardigan",            competition: "U7–U11", kickOff: "", result: "" },
      { date: "2027-03-21", venue: "home", opponent: "Cardigan",            competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-04-04", venue: "home", opponent: "Haverfordwest",       competition: "U7–U11", kickOff: "", result: "" },
      { date: "2027-04-04", venue: "away", opponent: "Haverfordwest",       competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-04-11", venue: "away", opponent: "Milford Haven",       competition: "U7–U11", kickOff: "", result: "" },
      { date: "2027-04-11", venue: "home", opponent: "Milford Haven",       competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-04-18", venue: "home", opponent: "Fishguard",           competition: "U7–U11", kickOff: "", result: "" },
      { date: "2027-04-18", venue: "away", opponent: "Fishguard",           competition: "U12–U15", kickOff: "", result: "" },
      { date: "2027-04-25", venue: "away", opponent: "Minis Festivals",     competition: "U7–U11 · End of season county festivals", kickOff: "", result: "" },
      { date: "2027-04-25", venue: "home", opponent: "Pembroke",            competition: "U12–U15", kickOff: "", result: "" },
    ]
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
    // Club shop supplied by the club.
    { name: "RCS",       blurb: "Official playing kit and training wear.",
      url: "https://rcs-teamwear.com/llangwm-rfc/" },

    // CHECK — no shop link yet, so this one shows an "Ask the club" button
    // that goes to the contact section. Add a url here and it becomes a
    // "Visit shop" link like the one above.
    { name: "KJ Prints", blurb: "Clubwear and supporter clothing.", url: "" }
  ],

  /* ----------------------------------------------------------------------
     10. PARTNERS & SPONSORS
     --------------------------------------------------------------------------
       { name: "Business name", logo: "assets/sponsors/name.svg",
         url: "https://example.co.uk" },
     Leave logo as "" and the partner's name is set in type instead.
     ---------------------------------------------------------------------- */
  /* `group` puts a heading above a set of partners. Leave it off and the
     partner sits in an unlabelled row at the top.

     No logo files were supplied, so each name is set in type instead. To use
     a logo, drop the file into assets/sponsors/ and put its path in `logo`.
     Only add a `url` you have actually been given — a wrong address is worse
     than none, and the button becomes plain text when `url` is "". */
  sponsors: [
    // CHECK — Loche Bros is the front-of-shirt sponsor on the club's current
    // playing kit, read from the shirt itself. Confirm the wording.
    { group: "Front of shirt", name: "Loche Bros", logo: "", url: "" },

    // Player sponsors, from the club's own sponsor board on Instagram.
    // Website addresses were not given for these, apart from Laser Shot,
    // whose logo carries one. Add the others as you get them.
    { group: "Player sponsors", name: "Allpipes Civils Ltd",                            logo: "", url: "" },
    { group: "Player sponsors", name: "Pembrokeshire Building & Plumbing Supplies Ltd", logo: "", url: "" },
    { group: "Player sponsors", name: "Rachel's Florist",                               logo: "", url: "" },
    { group: "Player sponsors", name: "Lashed by Leah",                                 logo: "", url: "" },
    { group: "Player sponsors", name: "Poyston West Farm",                              logo: "", url: "" },
    { group: "Player sponsors", name: "VIP Barber & Co.",                               logo: "", url: "" },
    { group: "Player sponsors", name: "Hardwood Drinks Co",                             logo: "", url: "" },
    { group: "Player sponsors", name: "Phoenix Bowl",                                   logo: "", url: "" },
    { group: "Player sponsors", name: "The Bearded Chefs",                              logo: "", url: "" },
    { group: "Player sponsors", name: "K.O.",                                           logo: "", url: "" },
    { group: "Player sponsors", name: "J14 Coaching & Fitness",                         logo: "", url: "" },
    { group: "Player sponsors", name: "Laser Shot Ltd",                                 logo: "", url: "https://lasershotltd.co.uk" },
    { group: "Player sponsors", name: "Jeff Clout Inflatables",                         logo: "", url: "" },
    { group: "Player sponsors", name: "King David Tyres Ltd",                           logo: "", url: "" },
    { group: "Player sponsors", name: "DJM Services Pembs Ltd",                         logo: "", url: "" },
    { group: "Player sponsors", name: "Jim Chimney Sweep",                              logo: "", url: "" },
    { group: "Player sponsors", name: "Cleddau Electrical Services",                    logo: "", url: "" },
  ],

  /* ----------------------------------------------------------------------
     11. ACCREDITATION
     --------------------------------------------------------------------------
     Gold, confirmed by the club. Set `show` to false to hide the section.
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

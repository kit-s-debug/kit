/* ==========================================================================
   The drinks list, kept apart from anything that draws it.

   Editing the menu should never mean touching layout code, so this file is
   plain data and nothing else. Add, remove or reorder freely.

   layout: "cards" — image-led, for the drinks worth looking at
           "list"  — compact rows, for the ones you just want to find
   tone:   the colour a card is keyed to. Only cards use it.
   price:  ONLY where the venue has actually given one. No invented prices.
   photo:  drop a real photograph in here and the card uses it instead of
           the generated tile — see assets/images/drinks/.
   ========================================================================== */

export var DRINKS = [
  {
    id: "spirits",
    name: "Spirits",
    layout: "list",
    /* The bottles the venue has photographs of come out of the list and go
       up top. As more shots arrive they move up here too and the list below
       shrinks — nothing else has to change. */
    strip: {
      name: "Behind the bar",
      items: [
        { name: "Eristoff Vodka", tone: "ice" },
        { name: "Grey Goose", tone: "ice" },
        { name: "Gin", tone: "lime" },
        { name: "Pink Gin", tone: "rose" },
        // photographed both as a bottle and as a shot, so the strip gets
        // the bottle and the Shooters card gets the glass
        { name: "Malibu", tone: "straw",
          photo: "assets/images/drinks/malibu-bottle.jpg" },
        { name: "Spiced Rum", tone: "sunrise" },
        { name: "Dark Rum", tone: "espresso" },
        { name: "Baileys", tone: "espresso" },
        { name: "Pimm's", tone: "claret" },
        { name: "Courvoisier", tone: "amber" },
        { name: "Archers", tone: "straw" },
        { name: "Disaronno", tone: "amber" },
        { name: "Taboo", tone: "straw" },
        { name: "Passoa", tone: "passion" },
        // on the menu as a spirit and again as a shooter, so this one points
        // at its own file and the shooter keeps its colour tile
        { name: "Sambuca", tone: "ice", photo: "assets/images/drinks/sambuca-bottle.jpg" },
        { name: "Jägermeister", tone: "lime" },
        { name: "Port", tone: "claret", note: "50ml" },
        { name: "Martini", tone: "claret", note: "50ml" },
        /* Whiskey wasn't on the menu the venue supplied at all — this is
           here because the bottle turned up. Worth checking what else the
           list is missing. */
        { name: "Jack Daniel's", tone: "amber",
          photo: "assets/images/drinks/jack-daniels.jpg" },
        // also missing from the supplied menu — that is three now, counting
        // both Southern Comforts as the separate lines they are
        { name: "Southern Comfort", tone: "sunrise" },
        { name: "Southern Comfort Black", tone: "espresso" },
        // "Tequila" is a shooter as well, so the bottle has its own file and
        // the shooter card keeps its glass
        { name: "Tequila", tone: "ice",
          photo: "assets/images/drinks/tequila-bottle.jpg" },
        /* The bottle the bar pours for this is Lustre Strawberry Cream, not
           Tequila Rose the brand. The menu name stays, as it does for "Gin"
           and "Spiced Rum". Also a shooter, so the bottle has its own file. */
        { name: "Tequila Rose", tone: "rose",
          photo: "assets/images/drinks/tequila-rose-bottle.jpg" },
      ],
    },
    groups: [
      /* Grey Goose was the whole of a "Vodka" group of one until it was
         photographed; it stands in the strip with the other bottles now. */
      {
        name: "Liqueurs",
        items: [
          { name: "Tequila & Mixer" },
        ],
      },
    ],
  },
  {
    id: "bottles",
    name: "Bottles",
    tabName: "Bottles",
    layout: "list",
    /* The VKs get pictures because people pick them by colour, and because
       the venue had real bottle shots for them. Everything else in here
       stays as type — see the note on DrinkList. */
    strip: {
      name: "In the fridge",
      items: [
        { name: "VK Blue", tone: "azure" },
        { name: "VK Apple & Mango", tone: "lime" },
        { name: "VK Orange & Passion Fruit", tone: "amber" },
        { name: "VK Ice", tone: "ice" },
        { name: "VK Black Cherry", tone: "claret" },
        { name: "Asahi", tone: "amber" },
        { name: "Budweiser", tone: "amber" },
        { name: "Corona", tone: "straw" },
        { name: "Hooch", tone: "lime", note: "Can" },
        { name: "Reef", tone: "sunrise" },
        // also on draught, so the bottle keeps its own file
        { name: "Rekorderlig", tone: "berry", note: "Bottle",
          photo: "assets/images/drinks/rekorderlig-bottle.jpg" },
      ],
    },
    // every bottle in here is photographed, so there is no list left
    groups: [],
  },
  {
    id: "draught",
    name: "Draught",
    layout: "list",
    strip: {
      name: "On tap",
      items: [
        { name: "Alpaca Lypse", tone: "straw" },
        { name: "Aspall", tone: "amber" },
        { name: "Guinness", tone: "espresso" },
        { name: "Pravha", tone: "lime" },
        { name: "Madri", tone: "claret" },
        // the same bottle as the one in the fridge
        { name: "Rekorderlig", tone: "berry",
          photo: "assets/images/drinks/rekorderlig-bottle.jpg" },
      ],
    },
    // every line is photographed, so there is no list under the strip
    groups: [],
  },
  {
    id: "cocktails",
    name: "Cocktails",
    /* Nine of these had a generated colour tile standing in for a
       photograph, which is filler at the size the cards run. They are set
       as type until the venue shoots them, the same way the soft drinks
       are. The Buzz Balls are already photographed, so they keep a strip:
       they are also the only ones that come in a tin rather than a glass. */
    layout: "list",
    strip: {
      name: "Ready to drink",
      items: [
        { name: "Red Buzz Ball", tone: "cranberry" },
        { name: "Blue Buzz Ball", tone: "azure" },
        { name: "Green Buzz Ball", tone: "lime" },
      ],
    },
    groups: [
      {
        name: "Mixed",
        items: [
          { name: "Blue Lagoon" }, { name: "Cheeky Vimto" }, { name: "Pornstar" },
          { name: "Sex on the Beach" }, { name: "Slush" }, { name: "Tequila Sunrise" },
          { name: "Woo Woo" },
        ],
      },
      {
        name: "To share",
        items: [{ name: "Jug" }, { name: "Fishbowl" }],
      },
    ],
  },
  {
    id: "shooters",
    name: "Shooters",
    layout: "cards",
    items: [
      { name: "Jägerbomb", tone: "amber" },
      { name: "Baby Guinness", tone: "espresso" },
      // the shot is clear, whatever the bottle looks like, so it takes
      // the same cold accent as the Sambuca beside it
      { name: "Tequila", tone: "ice" },
      { name: "Tequila Rose", tone: "rose" },
      { name: "Sambuca", tone: "ice" },
      { name: "Malibu", tone: "straw" },
      { name: "Flatliner", tone: "espresso" },
      { name: "Refresher Bomb", tone: "rose" },
    ],
  },
  {
    id: "soft",
    name: "Soft Drinks",
    layout: "list",
    groups: [
      {
        name: "Soft Drinks & Mixers",
        items: [
          { name: "Cranberry Juice" }, { name: "Lemonade" }, { name: "Orange Juice" },
          { name: "Pineapple Juice" }, { name: "Pepsi Max" }, { name: "Red Bull" },
          { name: "Tonic", note: "Half pint" }, { name: "Tonic", note: "Pint" },
          { name: "Water Bottle" },
        ],
      },
    ],
  },
  {
    id: "wines",
    name: "Wines",
    layout: "cards",
    items: [
      { name: "Red", tone: "claret", serves: ["175ml", "Large bottle"] },
      { name: "Rosé", tone: "rose", serves: ["175ml", "Large bottle"] },
      { name: "White", tone: "straw", serves: ["175ml", "Large bottle"] },
    ],
  },
  {
    id: "champagne",
    name: "Champagne",
    layout: "cards",
    items: [
      { name: "Bollinger", tone: "gold", note: "Bottle" },
      { name: "Moët", tone: "gold", note: "Bottle" },
      { name: "Prosecco", tone: "straw", note: "Bottle" },
    ],
  },
];

/* Both venues pour the same menu. What differs is the offer, and the nights
   it runs on, so the promo category is kept out of DRINKS and chosen at
   mount instead of the whole menu being duplicated for a single tab. */
export var PROMOS = {
  eddies: {
    id: "promos",
    name: "Promos",
    tabName: "Wed & Fri",
    layout: "promo",
    eyebrow: "Wednesday & Friday",
    items: [
      { name: "3 VKs", price: "£10", tone: "azure" },
      { name: "4 Corkeys", price: "£10", tone: "lime" },
      { name: "Doubles", price: "£5.70", tone: "copper" },
      { name: "Pints", price: "£4", tone: "amber" },
      { name: "4 × Jäger Bombs", price: "£10", tone: "espresso" },
      { name: "4 × Refresher Bombs", price: "£10", tone: "rose" },
    ],
  },
  /* Labyrinth runs one offer rather than a list of them, and it is the
     whole menu at one price. Nothing else is invented to pad the tab out. */
  labyrinth: {
    id: "promos",
    name: "Promos",
    tabName: "Before 10pm",
    layout: "promo",
    eyebrow: "Friday & Saturday",
    items: [
      { name: "Every drink, until 10pm", price: "£3", tone: "mint",
        photo: "assets/images/drinks/lab-every-drink.jpg" },
      { name: "Entry, all night", price: "Free", tone: "ice",
        photo: "assets/images/drinks/lab-entry.jpg" },
    ],
  },
};

/* The menu one venue shows: the shared categories, then its own offer. */
export function menuFor(venue) {
  return DRINKS.concat([PROMOS[venue] || PROMOS.eddies]);
}

/* The colour each tile is keyed to. Kept here so the generated artwork and
   the card glow can never drift apart. */
export var TONES = {
  azure:     "#2f7fd6",
  berry:     "#8e3f7a",
  passion:   "#e8a13c",
  sunset:    "#e4664a",
  ice:       "#8fb6c9",
  sunrise:   "#e2803a",
  cranberry: "#b3324e",
  lime:      "#6fae3f",
  amber:     "#d99a2b",
  espresso:  "#5b3a2e",
  rose:      "#d8698c",
  claret:    "#8c2740",
  straw:     "#c8b06a",
  gold:      "#c9a24b",
  copper:    "#e2895e",
  /* Labyrinth's own accent, for the cards that only appear on that page */
  mint:      "#3fbfa4",
};

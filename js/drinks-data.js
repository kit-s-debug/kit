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
        { name: "Gin", tone: "lime" },
        { name: "Pink Gin", tone: "rose" },
        { name: "Malibu", tone: "straw" },
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
      ],
    },
    groups: [
      { name: "Vodka", items: [{ name: "Grey Goose" }] },
      {
        name: "Liqueurs",
        items: [
          { name: "Tequila Rose" }, { name: "Tequila" }, { name: "Tequila & Mixer" },
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
      ],
    },
    groups: [
      {
        name: "Bottles & Cans",
        items: [
          { name: "Budweiser" }, { name: "Corona" },
          { name: "Hooch", note: "Can" }, { name: "Reef" },
          { name: "Rekorderlig", note: "Bottle" },
        ],
      },
    ],
  },
  {
    id: "draught",
    name: "Draught",
    layout: "list",
    groups: [
      {
        name: "On tap",
        items: [
          { name: "Alpaca Lypse" }, { name: "Aspall" }, { name: "Guinness" },
          { name: "Madri" }, { name: "Pravha" }, { name: "Rekorderlig" },
        ],
      },
    ],
  },
  {
    id: "cocktails",
    name: "Cocktails",
    layout: "cards",
    items: [
      { name: "Blue Lagoon", tone: "azure" },
      { name: "Cheeky Vimto", tone: "berry" },
      { name: "Pornstar", tone: "passion" },
      { name: "Sex on the Beach", tone: "sunset" },
      { name: "Slush", tone: "ice" },
      { name: "Tequila Sunrise", tone: "sunrise" },
      { name: "Woo Woo", tone: "cranberry" },
      { name: "Jug", tone: "copper", note: "To share" },
      { name: "Fishbowl", tone: "azure", note: "To share" },
      { name: "Red Buzz Ball", tone: "cranberry" },
      { name: "Blue Buzz Ball", tone: "azure" },
      { name: "Green Buzz Ball", tone: "lime" },
    ],
  },
  {
    id: "shooters",
    name: "Shooters",
    layout: "cards",
    items: [
      { name: "Jägerbomb", tone: "amber" },
      { name: "Baby Guinness", tone: "espresso" },
      { name: "Tequila", tone: "sunrise" },
      { name: "Tequila Rose", tone: "rose" },
      { name: "Sambuca", tone: "ice" },
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
  {
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
];

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
};

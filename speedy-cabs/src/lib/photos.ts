/**
 * Photography used on the site. Every image is from Wikimedia Commons under the
 * licence shown, credited in the footer. Generated from the selection file; edit
 * captions and alt text here, or swap in the owner's own photos (same ids).
 */

export type PhotoMeta = {
  alt: string;
  caption: string;
  width: number;
  height: number;
  widths: number[];
  focus?: string;
  credit: { author: string; license: string; licenseUrl: string; source: string; title: string; modified: boolean };
};

export const photos = {
  "whitesands": {
    alt: "Sunset over the sea at Whitesands Bay, with a headland on the horizon",
    caption: "Whitesands Bay, near St Davids",
    width: 1920,
    height: 1277,
    widths: [960, 1600, 1920],
    focus: "50% 45%",
    credit: {
      author: "Garethrees",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Whitesands_Bay_Sunset.JPG",
      title: "File:Whitesands Bay Sunset.JPG",
      modified: true,
    },
  },
  "pembroke-castle": {
    alt: "Pembroke Castle lit by evening sun, reflected in the still water below",
    caption: "Pembroke Castle at golden hour",
    width: 1920,
    height: 1197,
    widths: [640, 960, 1600, 1920],
    focus: "60% 50%",
    credit: {
      author: "JKMMX",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Pembroke_Castle_-_June_2011.jpg",
      title: "File:Pembroke Castle - June 2011.jpg",
      modified: true,
    },
  },
  "tenby": {
    alt: "Colourful Georgian houses above Tenby harbour",
    caption: "Tenby, from the harbour",
    width: 1920,
    height: 1275,
    widths: [960, 1600, 1920],
    focus: "55% 40%",
    credit: {
      author: "Nilfanion",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Tenby_from_the_Harbour_(6371).jpg",
      title: "File:Tenby from the Harbour (6371).jpg",
      modified: true,
    },
  },
  "castle-square": {
    alt: "Painted buildings on Castle Square in Haverfordwest, with the castle on the hill behind",
    caption: "Castle Square, Haverfordwest",
    width: 1280,
    height: 960,
    widths: [640, 1280],
    focus: "55% 40%",
    credit: {
      author: "Richard Kelly",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Castle_Square,_Haverfordwest.jpg",
      title: "File:Castle Square, Haverfordwest.jpg",
      modified: true,
    },
  },
  "newgale": {
    alt: "The sun setting over the beach at Newgale",
    caption: "Newgale, St Brides Bay",
    width: 1280,
    height: 768,
    widths: [640, 1280],
    credit: {
      author: "Alan Hughes",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source: "https://commons.wikimedia.org/wiki/File:Newgale_sunset_-_geograph.org.uk_-_8005939.jpg",
      title: "File:Newgale sunset - geograph.org.uk - 8005939.jpg",
      modified: true,
    },
  },
  "airport": {
    alt: "The terminal and apron at Cardiff Airport under a bright sky",
    caption: "Cardiff Airport",
    width: 1280,
    height: 739,
    widths: [640, 1280],
    credit: {
      author: "DaHuzyBru",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Cardiff_Airport_apron_and_terminal_airside.jpg",
      title: "File:Cardiff Airport apron and terminal airside.jpg",
      modified: true,
    },
  },
  "station": {
    alt: "A train arriving at the platform at Haverfordwest station",
    caption: "Haverfordwest railway station",
    width: 1280,
    height: 844,
    widths: [640, 1280],
    focus: "40% 50%",
    credit: {
      author: "Jaggery",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source: "https://commons.wikimedia.org/wiki/File:Manchester_Piccadilly_train_arrives_at_Haverfordwest_station_(geograph_6065897).jpg",
      title: "File:Manchester Piccadilly train arrives at Haverfordwest station (geograph 6065897).jpg",
      modified: true,
    },
  },
  "milford-haven": {
    alt: "A fishing boat at the dock entrance in Milford Haven, with the town behind",
    caption: "Milford Haven docks",
    width: 1280,
    height: 960,
    widths: [640, 1280],
    credit: {
      author: "Gareth James",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source: "https://commons.wikimedia.org/wiki/File:Fishing_boat,_Milford_Haven_dock_entrance_-_geograph.org.uk_-_3123197.jpg",
      title: "File:Fishing boat, Milford Haven dock entrance - geograph.org.uk - 3123197.jpg",
      modified: true,
    },
  },
  "cleddau-bridge": {
    alt: "The Cleddau Bridge crossing the estuary between Neyland and Pembroke Dock",
    caption: "The Cleddau Bridge towards Pembroke Dock",
    width: 1280,
    height: 960,
    widths: [640, 1280],
    focus: "50% 30%",
    credit: {
      author: "Agathoclea",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Cleddau_Bridge_from_Neyland.jpg",
      title: "File:Cleddau Bridge from Neyland.jpg",
      modified: true,
    },
  },
  "tenby-dusk": {
    alt: "Tenby harbour at low tide in the evening light",
    caption: "Tenby harbour at dusk",
    width: 1280,
    height: 960,
    widths: [640, 1280],
    credit: {
      author: "Mac Edmunds",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Tenby_Harbour_sunset-ish.jpg",
      title: "File:Tenby Harbour sunset-ish.jpg",
      modified: true,
    },
  },
  "fishguard": {
    alt: "Boats in Fishguard's harbour at low tide",
    caption: "Fishguard harbour",
    width: 1280,
    height: 960,
    widths: [640, 1280],
    credit: {
      author: "Colin Smith",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source: "https://commons.wikimedia.org/wiki/File:Fishguard_-_Harbour_Mouth_-_geograph.org.uk_-_7003901.jpg",
      title: "File:Fishguard - Harbour Mouth - geograph.org.uk - 7003901.jpg",
      modified: true,
    },
  },
  "st-davids": {
    alt: "St Davids Cathedral and its tower on a sunny day",
    caption: "St Davids Cathedral",
    width: 1280,
    height: 850,
    widths: [640, 1280],
    focus: "40% 50%",
    credit: {
      author: "Ввласенко",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0",
      source: "https://commons.wikimedia.org/wiki/File:St._David%27s_Cathedral,_Wales,_GB.jpg",
      title: "File:St. David's Cathedral, Wales, GB.jpg",
      modified: true,
    },
  },
  "haverfordwest": {
    alt: "The River Cleddau flowing through the centre of Haverfordwest",
    caption: "Haverfordwest, on the Western Cleddau",
    width: 1920,
    height: 1238,
    widths: [640, 960, 1280, 1600, 1920],
    credit: {
      author: "Pam Goodey",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      source: "https://commons.wikimedia.org/wiki/File:The_River_Cleddau_flowing_through_Haverfordwest_-_geograph.org.uk_-_3146778.jpg",
      title: "File:The River Cleddau flowing through Haverfordwest - geograph.org.uk - 3146778.jpg",
      modified: true,
    },
  },
} satisfies Record<string, PhotoMeta>;

export type PhotoId = keyof typeof photos;

export const heroSlides: PhotoId[] = ["haverfordwest", "pembroke-castle", "tenby", "whitesands"];
export const servicePhotos: Record<"local" | "minibus" | "airport" | "station", PhotoId> = {"local": "castle-square", "minibus": "newgale", "airport": "airport", "station": "station"};
export const townPhotos: Record<string, PhotoId> = {"Milford Haven": "milford-haven", "Pembroke Dock": "cleddau-bridge", "Pembroke": "pembroke-castle", "Tenby": "tenby-dusk", "Fishguard": "fishguard", "St Davids": "st-davids"};
export const localPhoto: PhotoId = "haverfordwest";

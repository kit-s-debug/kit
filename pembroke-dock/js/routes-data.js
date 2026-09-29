/*
 * The 15 Pembroke Dock routes.
 *
 * Every route starts empty ("awaiting"). Nothing here is made up: a route
 * gets steps only from the maps, screenshots or written directions supplied
 * for it. None of these routes have been checked against an official source,
 * so `verified` stays false unless that changes.
 *
 * Route shape (the route editor exports exactly this):
 * {
 *   id: 1,
 *   title: "Route 1",
 *   status: "awaiting" | "provided",
 *   verified: false,
 *   source: "Where the directions came from, e.g. 'Written directions, sent 29 Sep 2026'",
 *   estimatedMinutes: null,       // from the source, if it gives one
 *   steps: [
 *     {
 *       lat: 51.69, lng: -4.94,    // where the manoeuvre happens
 *       type: "start" | "junction" | "roundabout" | "traffic-lights" | "feature" | "via" | "end",
 *       instruction: "At the roundabout take the 2nd exit",
 *       road: "Road name, as the source gives it",
 *       lane: "Optional lane advice from the source",
 *       note: "Optional extra detail from the source"
 *     }
 *   ],
 *   // Road-following line, [[lat, lng], ...]. Filled by "Snap to roads" or a
 *   // GPX import. `pathSource` records which, so the page can say so.
 *   path: [],
 *   pathSource: null,              // "osrm" | "gpx" | null
 *   osrmMinutes: null              // OSRM's no-traffic estimate, if snapped
 * }
 *
 * "via" steps are shape points only: they keep the line on the right road but
 * aren't shown as directions.
 */
// Routes entered so far, keyed by number.
const PD_ENTERED = {
  // Route 1: typed in exactly as sent. Each step is "on this road, do this",
  // and `onto` is simply the next road in the table. Map positions are
  // still to be placed (lat/lng null).
  1: {
    "id": 1,
    "title": "Route 1",
    "status": "provided",
    "verified": false,
    "source": "Road-and-direction table for Car Test Route 01, sent 29 Sep 2026",
    "estimatedMinutes": null,
    "steps": [
      {
        "lat": null,
        "lng": null,
        "type": "start",
        "instruction": "Right",
        "road": "DTC",
        "onto": "Pier Rd",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "roundabout",
        "instruction": "Roundabout left",
        "road": "Pier Rd",
        "onto": "London Rd",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "roundabout",
        "instruction": "Roundabout ahead, right",
        "road": "London Rd",
        "onto": "Ferry Lane",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "Left",
        "road": "Ferry Lane",
        "onto": "Buttermilk Lane / Myletts Hill",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "EOR right",
        "road": "Buttermilk Lane / Myletts Hill",
        "onto": "London Rd",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "Right",
        "road": "London Rd",
        "onto": "A4705 Holyland Rd",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "roundabout",
        "instruction": "Mini roundabout ahead",
        "road": "A4705 Holyland Rd",
        "onto": "Well Hill / Orange Way / Commons Rd / Westgate Hill / Northgate St / The Green / Bush Hill",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "Left",
        "road": "Well Hill / Orange Way / Commons Rd / Westgate Hill / Northgate St / The Green / Bush Hill",
        "onto": "Pembroke Rd",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "Left",
        "road": "Pembroke Rd",
        "onto": "Imble Lane",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "2nd right",
        "road": "Imble Lane",
        "onto": "Eleventh Close",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "EOR right",
        "road": "Eleventh Close",
        "onto": "Arthur Morris Drive",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "EOR right",
        "road": "Arthur Morris Drive",
        "onto": "Brittania Rd",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "Left",
        "road": "Brittania Rd",
        "onto": "North St / Bufferland Terrace",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "EOR left",
        "road": "North St / Bufferland Terrace",
        "onto": "High St",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "EOR right",
        "road": "High St",
        "onto": "Bellevue Terrace / Pembroke St",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "roundabout",
        "instruction": "Mini roundabout right",
        "road": "Bellevue Terrace / Pembroke St",
        "onto": "Market St",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "EOR right",
        "road": "Market St",
        "onto": "Commercial Row",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "junction",
        "instruction": "2nd right",
        "road": "Commercial Row",
        "onto": "Albion Square / Bush St",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "roundabout",
        "instruction": "Mini roundabout left",
        "road": "Albion Square / Bush St",
        "onto": "Law St / Water St",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "roundabout",
        "instruction": "Roundabout 2nd exit",
        "road": "Law St / Water St",
        "onto": "Pier Rd",
        "lane": "",
        "note": "",
        "placement": null
      },
      {
        "lat": null,
        "lng": null,
        "type": "end",
        "instruction": "Finish on Pier Rd",
        "road": "Pier Rd",
        "onto": "",
        "lane": "",
        "note": "",
        "placement": null
      }
    ],
    "path": [],
    "pathSource": null,
    "osrmMinutes": null
  },
};

window.PD_ROUTES = Array.from({ length: 15 }, (_, i) => PD_ENTERED[i + 1] || ({
  id: i + 1,
  title: "Route " + (i + 1),
  status: "awaiting",
  verified: false,
  source: null,
  estimatedMinutes: null,
  steps: [],
  path: [],
  pathSource: null,
  osrmMinutes: null,
}));

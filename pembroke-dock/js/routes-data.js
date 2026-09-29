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
window.PD_ROUTES = Array.from({ length: 15 }, (_, i) => ({
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

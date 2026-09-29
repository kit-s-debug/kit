/*
 * Site configuration.
 *
 * Nothing here is required. The map (OpenStreetMap) and "Open in Street View"
 * links (Google Maps URLs) work with no key at all.
 *
 * GOOGLE_MAPS_EMBED_KEY: optional. With a key, Street View shows inside the
 * page instead of opening Google Maps in a new tab. It uses the Maps Embed API,
 * which Google does not charge for, but the key still needs a Google Cloud
 * project with billing enabled. Restrict the key to your site's address
 * (HTTP referrer) in Google Cloud Console; anything in this file is public.
 *
 * The key can also be pasted on the Setup page instead, which saves it only
 * in that browser.
 */
window.PD_CONFIG = {
  GOOGLE_MAPS_EMBED_KEY: "",

  // Centre of Pembroke Dock, used when a route has no points yet.
  DEFAULT_CENTER: [51.6935, -4.942],
  DEFAULT_ZOOM: 14,

  TILE_URL: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  TILE_ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

  // Public OSRM demo server. It snaps your points to real OpenStreetMap roads.
  // It's rate limited and meant for light use, which is fine for one learner.
  OSRM_URL: "https://router.project-osrm.org/route/v1/driving/",

  // Nominatim (OpenStreetMap search), used by the route editor's place search.
  NOMINATIM_URL: "https://nominatim.openstreetmap.org/search",
  // Search is limited to this box around Pembroke Dock: west, north, east, south.
  SEARCH_VIEWBOX: [-5.05, 51.75, -4.8, 51.63],

  // Overpass (OpenStreetMap data), used by the editor's "Find junctions".
  OVERPASS_URL: "https://overpass-api.de/api/interpreter",
  // Junction search area covering Pembroke Dock and Pembroke: south, west, north, east.
  JUNCTION_BBOX: [51.64, -5.0, 51.72, -4.86],

  ROUTE_COUNT: 15,
};

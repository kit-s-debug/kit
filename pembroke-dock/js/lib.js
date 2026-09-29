/* Storage, geometry and data helpers shared by every view. */
(function () {
  const C = window.PD_CONFIG;

  // ---------- storage (this browser only) ----------
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem("pd." + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem("pd." + key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem("pd." + key);
      } catch (e) {}
    },
  };

  // ---------- routes: bundled data, overlaid by a local draft ----------
  function bundled(id) {
    return window.PD_ROUTES.find((r) => r.id === id);
  }
  function getRoute(id) {
    const draft = store.get("draft." + id, null);
    const base = bundled(id);
    if (!base) return null;
    if (draft) return Object.assign({}, base, draft, { id, isDraft: true });
    return Object.assign({}, base, { isDraft: false });
  }
  function allRoutes() {
    const out = [];
    for (let i = 1; i <= C.ROUTE_COUNT; i++) out.push(getRoute(i));
    return out;
  }
  function saveDraft(route) {
    const copy = JSON.parse(JSON.stringify(route));
    delete copy.isDraft;
    return store.set("draft." + route.id, copy);
  }
  function discardDraft(id) {
    store.remove("draft." + id);
  }
  function hasData(route) {
    return route.steps.length > 0 || route.path.length > 0;
  }
  // A step can be written down before anyone has put it on the map.
  function isPlaced(s) {
    return s.lat != null && s.lng != null && isFinite(s.lat) && isFinite(s.lng);
  }
  function hasMap(route) {
    return route.path.length > 1 || route.steps.some(isPlaced);
  }
  // Notes key: position in the route plus the road, so a note survives the
  // step being placed or nudged on the map.
  function noteKey(s) {
    return s.index + "|" + (s.road || "");
  }
  function directionSteps(route) {
    // Steps that are real directions (not line-shaping "via" points), with
    // their index in route.steps kept for linking back.
    return route.steps
      .map((s, i) => Object.assign({ index: i }, s))
      .filter((s) => s.type !== "via");
  }

  // ---------- geometry ----------
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  function distanceM(a, b) {
    const R = 6371000;
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function bearing(a, b) {
    const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]));
    const x =
      Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) -
      Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }
  function pathLengthM(path) {
    let d = 0;
    for (let i = 1; i < path.length; i++) d += distanceM(path[i - 1], path[i]);
    return d;
  }
  // Index of the path vertex nearest to a point.
  function nearestIndex(path, pt) {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < path.length; i++) {
      const d = distanceM(path[i], pt);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }
  // Direction of travel at a step, so Street View faces the way you'd drive
  // up to it. Uses the road line when there is one, else the next step.
  function approachHeading(route, stepIndex) {
    const s = route.steps[stepIndex];
    if (!isPlaced(s)) return 0;
    const here = [s.lat, s.lng];
    if (route.path.length > 1) {
      const i = nearestIndex(route.path, here);
      // Look back ~30 m along the line to get the approach direction.
      let j = i;
      while (j > 0 && distanceM(route.path[j], route.path[i]) < 30) j--;
      if (j < i) return bearing(route.path[j], route.path[i]);
      if (i + 1 < route.path.length) return bearing(route.path[i], route.path[i + 1]);
    }
    const prev = route.steps[stepIndex - 1];
    if (prev && isPlaced(prev)) return bearing([prev.lat, prev.lng], here);
    const next = route.steps[stepIndex + 1];
    if (next && isPlaced(next)) return bearing(here, [next.lat, next.lng]);
    return 0;
  }

  // ---------- Street View ----------
  function embedKey() {
    return store.get("googleKey", "") || C.GOOGLE_MAPS_EMBED_KEY || "";
  }
  function streetViewLink(lat, lng, heading) {
    const h = Math.round(heading || 0);
    return (
      "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" +
      lat.toFixed(6) + "," + lng.toFixed(6) + "&heading=" + h + "&pitch=0&fov=90"
    );
  }
  function streetViewEmbed(lat, lng, heading) {
    const key = embedKey();
    if (!key) return null;
    return (
      "https://www.google.com/maps/embed/v1/streetview?key=" + encodeURIComponent(key) +
      "&location=" + lat.toFixed(6) + "," + lng.toFixed(6) +
      "&heading=" + Math.round(heading || 0) + "&pitch=0&fov=90"
    );
  }

  // ---------- OSRM: snap the route's points to real roads ----------
  async function snapToRoads(allSteps) {
    const steps = allSteps.filter(isPlaced);
    if (steps.length < 2) throw new Error("Put at least two directions on the map first.");
    if (steps.length > 90) throw new Error("OSRM takes up to 90 points; this route has " + steps.length + ".");
    const coords = steps.map((s) => s.lng.toFixed(6) + "," + s.lat.toFixed(6)).join(";");
    const url = C.OSRM_URL + coords + "?overview=full&geometries=geojson&continue_straight=true";
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      throw new Error("Couldn't reach the OSRM road-snapping server. Check your connection and try again.");
    }
    if (!res.ok) throw new Error("OSRM answered " + res.status + ". Try again in a minute.");
    const json = await res.json();
    if (json.code !== "Ok" || !json.routes || !json.routes.length) {
      throw new Error("OSRM couldn't find a road route through these points (" + (json.message || json.code) + ").");
    }
    const r = json.routes[0];
    return {
      path: r.geometry.coordinates.map((c) => [c[1], c[0]]),
      minutes: Math.round(r.duration / 60),
    };
  }

  // ---------- find where two named roads meet (OpenStreetMap Overpass) ----------
  const ABBR = { rd: "Road", st: "Street", ln: "Lane", dr: "Drive", ave: "Avenue", tce: "Terrace", cl: "Close", sq: "Square", hl: "Hill" };
  // "A4075 Holyland Rd" -> "Holyland Road". "North St / Bufferland Terrace" -> both names.
  function roadNames(text) {
    return String(text || "")
      .split("/")
      .map((n) =>
        n
          .replace(/\b[ABM]\d{1,4}\b/gi, "")
          .trim()
          .split(/\s+/)
          .map((w) => ABBR[w.toLowerCase().replace(/\.$/, "")] || w)
          .join(" ")
          .trim()
      )
      .filter(Boolean);
  }
  // Loose pattern: ignores case and doubled letters, so a spelling slip
  // ("Brittania") still matches the map's name ("Britannia").
  function namePattern(name) {
    const esc = (c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const letters = name.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/(.)\1+/g, "$1");
    return "^" + letters.split("").map((c) => (c === " " ? " +" : esc(c) + "+")).join("") + "$";
  }
  async function overpass(query) {
    let res;
    try {
      res = await fetch(C.OVERPASS_URL, { method: "POST", body: "data=" + encodeURIComponent(query) });
    } catch (e) {
      throw new Error("Couldn't reach the OpenStreetMap junction finder. Check your connection.");
    }
    if (!res.ok) throw new Error("The junction finder is busy (" + res.status + "). Try again in a minute.");
    return res.json();
  }
  // Candidate points where a road from `fromText` meets a road from `toText`.
  // Returns clusters of nodes, each as { lat, lng, spread } (spread in metres).
  async function findJunctions(fromText, toText) {
    const a = roadNames(fromText);
    const b = roadNames(toText);
    if (!a.length || !b.length) return [];
    // The turn happens at the end of the last-named stretch, onto the first-named one.
    const from = a[a.length - 1];
    const to = b[0];
    const bb = C.JUNCTION_BBOX.join(",");
    const q =
      "[out:json][timeout:25];" +
      'way["highway"]["name"~"' + namePattern(from) + '",i](' + bb + ")->.a;" +
      'way["highway"]["name"~"' + namePattern(to) + '",i](' + bb + ")->.b;" +
      "node(w.a)->.na;node(w.b)->.nb;node.na.nb;out;";
    const json = await overpass(q);
    const nodes = (json.elements || []).map((n) => [n.lat, n.lon]);
    // Group nodes within 80 m (a roundabout is several shared nodes).
    const clusters = [];
    nodes.forEach((p) => {
      const c = clusters.find((cl) => distanceM(cl.pts[0], p) < 80);
      if (c) c.pts.push(p);
      else clusters.push({ pts: [p] });
    });
    return clusters.map((c) => {
      const lat = c.pts.reduce((t, p) => t + p[0], 0) / c.pts.length;
      const lng = c.pts.reduce((t, p) => t + p[1], 0) / c.pts.length;
      return { lat, lng, count: c.pts.length, from, to };
    });
  }

  // ---------- GPX import ----------
  function parseGpx(text) {
    const doc = new DOMParser().parseFromString(text, "application/xml");
    if (doc.querySelector("parsererror")) throw new Error("That file isn't valid GPX.");
    const pick = (sel) =>
      Array.from(doc.getElementsByTagName(sel)).map((n) => [
        parseFloat(n.getAttribute("lat")),
        parseFloat(n.getAttribute("lon")),
      ]);
    let path = pick("trkpt");
    if (!path.length) path = pick("rtept");
    path = path.filter((p) => isFinite(p[0]) && isFinite(p[1]));
    if (path.length < 2) throw new Error("No track or route points found in that GPX file.");
    return path;
  }

  // ---------- validation for imported route JSON ----------
  const TYPES = ["start", "junction", "roundabout", "traffic-lights", "feature", "via", "end"];
  function cleanRoute(id, raw) {
    if (!raw || typeof raw !== "object") throw new Error("That isn't a route file.");
    const steps = Array.isArray(raw.steps) ? raw.steps : [];
    const clean = steps.map((s) => {
      const placed = s.lat != null && s.lng != null && isFinite(Number(s.lat)) && isFinite(Number(s.lng));
      return {
        lat: placed ? Number(s.lat) : null,
        lng: placed ? Number(s.lng) : null,
        type: TYPES.includes(s.type) ? s.type : "junction",
        instruction: String(s.instruction || ""),
        road: String(s.road || ""),
        onto: String(s.onto || ""),
        lane: String(s.lane || ""),
        note: String(s.note || ""),
        placement: placed && ["auto", "manual"].includes(s.placement) ? s.placement : placed ? "manual" : null,
      };
    });
    const path = Array.isArray(raw.path)
      ? raw.path.filter((p) => Array.isArray(p) && isFinite(p[0]) && isFinite(p[1])).map((p) => [Number(p[0]), Number(p[1])])
      : [];
    return {
      id,
      title: String(raw.title || "Route " + id),
      status: clean.length || path.length ? "provided" : "awaiting",
      verified: false,
      source: raw.source ? String(raw.source) : null,
      estimatedMinutes: isFinite(Number(raw.estimatedMinutes)) && raw.estimatedMinutes !== null && raw.estimatedMinutes !== "" ? Number(raw.estimatedMinutes) : null,
      steps: clean,
      path,
      pathSource: ["osrm", "gpx"].includes(raw.pathSource) ? raw.pathSource : null,
      osrmMinutes: isFinite(Number(raw.osrmMinutes)) && raw.osrmMinutes !== null ? Number(raw.osrmMinutes) : null,
    };
  }

  // ---------- small DOM helpers ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function download(filename, text, type) {
    const blob = new Blob([text], { type: type || "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
  }
  let toastTimer;
  function toast(msg, isError) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.className = "toast show" + (isError ? " error" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.className = "toast"), isError ? 5000 : 2600);
  }

  window.PD = {
    store, getRoute, allRoutes, saveDraft, discardDraft, hasData, hasMap, isPlaced, noteKey, directionSteps,
    roadNames, findJunctions,
    distanceM, bearing, pathLengthM, nearestIndex, approachHeading,
    embedKey, streetViewLink, streetViewEmbed, snapToRoads, parseGpx, cleanRoute,
    TYPES, esc, download, toast,
  };
})();

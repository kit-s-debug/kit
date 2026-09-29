/* Leaflet helpers: base map, route line and numbered step markers. */
(function () {
  const C = window.PD_CONFIG;

  const TYPE_INFO = {
    start: { label: "Start", color: "#1a7f45" },
    junction: { label: "Junction", color: "#1d5fbf" },
    roundabout: { label: "Roundabout", color: "#c77700" },
    "traffic-lights": { label: "Traffic lights", color: "#c62828" },
    feature: { label: "Road feature", color: "#6a3fb5" },
    via: { label: "Shape point (hidden)", color: "#7a8591" },
    end: { label: "Finish", color: "#1b1f24" },
  };

  // Every live map, so a view change can tear them all down.
  const live = [];

  function makeMap(el, opts) {
    opts = opts || {};
    const map = L.map(el, {
      zoomControl: opts.interactive !== false,
      dragging: opts.interactive !== false,
      scrollWheelZoom: opts.interactive !== false && opts.scrollWheelZoom !== false,
      doubleClickZoom: opts.interactive !== false,
      boxZoom: false,
      keyboard: opts.interactive !== false,
      touchZoom: opts.interactive !== false,
      tap: opts.interactive !== false,
      attributionControl: true,
    }).setView(C.DEFAULT_CENTER, C.DEFAULT_ZOOM);
    L.tileLayer(C.TILE_URL, { maxZoom: 19, attribution: C.TILE_ATTRIBUTION }).addTo(map);
    live.push(map);
    return map;
  }

  function destroyAll() {
    while (live.length) {
      const map = live.pop();
      try {
        // Stop pan/zoom animations first: removing a map mid-animation makes
        // Leaflet's pending callbacks throw.
        map.stop();
        if (map._animatingZoom) map._onZoomTransitionEnd();
        map.remove();
      } catch (e) {}
    }
  }

  function stepIcon(step, label, opts) {
    const info = TYPE_INFO[step.type] || TYPE_INFO.junction;
    const small = step.type === "via";
    const cls = "step-pin" + (small ? " via" : "") + (opts && opts.selected ? " selected" : "") + (opts && opts.flagged ? " flagged" : "");
    const size = small ? 14 : 28;
    return L.divIcon({
      className: "",
      html: '<div class="' + cls + '" style="--pin:' + info.color + '">' + (small ? "" : label) + "</div>",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  // Draws the route. Returns { line, markers[], bounds }.
  // opts: onStepClick(index), popup(step, index) -> html, showVia, selected, flagged(index)
  function drawRoute(map, route, opts) {
    opts = opts || {};
    const layers = { markers: [], line: null, bounds: null };
    let pts = [];
    if (route.path.length > 1) {
      // Casing plus fill, like a highlighted road.
      L.polyline(route.path, { color: "#0f2a47", weight: 9, opacity: 0.35, interactive: false }).addTo(map);
      layers.line = L.polyline(route.path, { color: "#2f7df6", weight: 5, opacity: 0.95, interactive: false }).addTo(map);
      pts = route.path.slice();
    } else if (route.steps.length > 1) {
      // No road line yet: say so by drawing a dashed straight connector.
      layers.line = L.polyline(route.steps.map((s) => [s.lat, s.lng]), {
        color: "#7a8591", weight: 3, dashArray: "6 8", interactive: false,
      }).addTo(map);
    }
    let n = 0;
    route.steps.forEach((s, i) => {
      if (s.type === "via" && !opts.showVia) return;
      const label = s.type === "via" ? "" : s.type === "start" ? "S" : s.type === "end" ? "F" : String(++n);
      const m = L.marker([s.lat, s.lng], {
        icon: stepIcon(s, label, { selected: opts.selected === i, flagged: opts.flagged && opts.flagged(i) }),
        draggable: !!opts.draggable,
        keyboard: false,
        zIndexOffset: s.type === "via" ? 0 : 500,
      }).addTo(map);
      m.stepIndex = i;
      m.stepLabel = label;
      if (opts.popup) m.bindPopup(() => opts.popup(s, i, label), { maxWidth: 260 });
      if (opts.onStepClick) m.on("click", () => opts.onStepClick(i));
      if (opts.onDragEnd) m.on("dragend", (e) => opts.onDragEnd(i, e.target.getLatLng()));
      layers.markers.push(m);
      pts.push([s.lat, s.lng]);
    });
    if (pts.length) layers.bounds = L.latLngBounds(pts);
    return layers;
  }

  function fitRoute(map, layers, pad) {
    if (layers.bounds && layers.bounds.isValid()) {
      map.fitBounds(layers.bounds, { padding: [pad || 24, pad || 24], maxZoom: 17 });
    }
  }

  // Step labels as shown on the map (S, 1, 2, ..., F), keyed by step index.
  function stepLabels(route) {
    const out = {};
    let n = 0;
    route.steps.forEach((s, i) => {
      if (s.type === "via") out[i] = "·";
      else if (s.type === "start") out[i] = "S";
      else if (s.type === "end") out[i] = "F";
      else out[i] = String(++n);
    });
    return out;
  }

  window.PDMaps = { TYPE_INFO, makeMap, destroyAll, drawRoute, fitRoute, stepIcon, stepLabels };
})();

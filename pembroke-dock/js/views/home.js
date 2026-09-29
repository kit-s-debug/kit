/* Home: all 15 routes. */
(function () {
  window.PDViews = window.PDViews || {};
  const esc = PD.esc;

  function statusChip(r) {
    if (r.isDraft && PD.hasData(r)) return '<span class="chip chip-draft">Your draft</span>';
    if (r.status === "provided") return '<span class="chip chip-provided">Added</span>';
    return '<span class="chip chip-awaiting">Awaiting route</span>';
  }

  function timeText(r) {
    if (r.estimatedMinutes) return "about " + r.estimatedMinutes + " min (from source)";
    if (r.osrmMinutes) return "about " + r.osrmMinutes + " min (OSRM, no traffic)";
    return "Time not given";
  }

  function counts(r) {
    const c = { roundabout: 0, junction: 0, "traffic-lights": 0 };
    r.steps.forEach((s) => {
      if (c[s.type] !== undefined) c[s.type]++;
    });
    return c;
  }

  PDViews.home = function (root) {
    const routes = PD.allRoutes();
    const ready = routes.filter(PD.hasData).length;

    root.innerHTML =
      '<section class="hero">' +
      '<h1>Know the roads before test day</h1>' +
      "<p>Fifteen practice routes around Pembroke Dock on a real OpenStreetMap map, with Google Street View at each junction and roundabout.</p>" +
      '<p class="hero-meta"><b>' + ready + " of 15</b> routes have directions so far.</p>" +
      "</section>" +
      '<aside class="notice">' +
      "<b>These are not official DVSA routes.</b> Each one is built only from the maps, screenshots or directions supplied for it, and none has been checked against an official source. Roads change, so always follow signs, markings and your examiner on the day." +
      "</aside>" +
      '<section class="route-grid" aria-label="Routes">' +
      routes.map(card).join("") +
      "</section>";

    routes.forEach((r) => {
      if (!PD.hasMap(r)) return;
      const el = root.querySelector('[data-preview="' + r.id + '"]');
      const map = PDMaps.makeMap(el, { interactive: false });
      const layers = PDMaps.drawRoute(map, r);
      PDMaps.fitRoute(map, layers, 14);
    });
  };

  function card(r) {
    const has = PD.hasData(r);
    const c = counts(r);
    const href = has ? "#/route/" + r.id : "#/edit/" + r.id;
    const n = PD.directionSteps(r).length;
    return (
      '<article class="route-card' + (has ? "" : " empty") + '">' +
      '<a class="card-link" href="' + href + '" aria-label="' + esc(r.title) + (has ? "" : ", no directions yet, add them") + '"></a>' +
      '<div class="card-top"><span class="route-num">' + r.id + "</span>" + statusChip(r) + "</div>" +
      (PD.hasMap(r)
        ? '<div class="preview" data-preview="' + r.id + '"></div>'
        : has
        ? '<div class="preview placeholder"><span>Directions added</span><span class="muted">Not on the map yet</span></div>'
        : '<div class="preview placeholder"><span>No directions yet</span><span class="btn btn-small">Add route</span></div>') +
      '<div class="card-body">' +
      "<h2>" + esc(r.title) + "</h2>" +
      '<p class="meta">' + esc(timeText(r)) + "</p>" +
      (has
        ? '<p class="meta">' + n + " directions · " + c.roundabout + " roundabouts · " + c.junction + " junctions" + (c["traffic-lights"] ? " · " + c["traffic-lights"] + " lights" : "") + "</p>"
        : "") +
      "</div></article>"
    );
  }
})();

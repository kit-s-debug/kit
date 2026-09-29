/*
 * Route editor: turn a map, screenshot or written directions into route data.
 * Tap the map to place each direction where it happens, type the wording from
 * the source, then snap the points to real roads. Saves as a draft in this
 * browser; Export gives a file that can be added to the site permanently.
 */
(function () {
  window.PDViews = window.PDViews || {};
  const esc = PD.esc;

  PDViews.editor = function (root, id) {
    const route = JSON.parse(JSON.stringify(PD.getRoute(id)));
    let selected = route.steps.length ? 0 : null;
    let adding = route.steps.length === 0;
    let map, layers, searchMarker;

    root.innerHTML =
      '<div class="route-head">' +
      '<a class="back" href="' + (PD.hasData(route) ? "#/route/" + id : "#/") + '">&larr; Back</a>' +
      '<div class="route-title"><span class="route-num">' + id + "</span><h1>Edit " + esc(route.title) + "</h1></div>" +
      "</div>" +
      '<p class="provenance">Enter only what your map, screenshot or directions show. Changes save as a draft in this browser. Export the file to send it for adding to the site.</p>' +
      '<div class="editor">' +
      '<div class="editor-map-col">' +
      '<form class="search" id="ed-search"><input type="search" id="ed-q" placeholder="Find a road or place in Pembroke Dock" aria-label="Search for a place"><button class="btn btn-small" type="submit">Find</button></form>' +
      '<div class="search-results" id="ed-results"></div>' +
      '<div class="map editor-map" id="ed-map"></div>' +
      '<div class="map-tools">' +
      '<button class="btn" id="ed-add" aria-pressed="false"></button>' +
      '<button class="btn btn-ghost" id="ed-snap">Snap to roads</button>' +
      "</div>" +
      '<p class="fineprint" id="ed-line-note"></p>' +
      "</div>" +
      '<div class="editor-side">' +
      '<details class="panel" open><summary>Route details</summary>' +
      '<label class="field"><span>Name</span><input id="ed-title" type="text" value="' + esc(route.title) + '"></label>' +
      '<label class="field"><span>Source</span><input id="ed-source" type="text" placeholder="e.g. Screenshot of route map, received 29 Sep 2026" value="' + esc(route.source || "") + '"></label>' +
      '<label class="field"><span>Estimated time from the source (minutes)</span><input id="ed-mins" type="number" inputmode="numeric" min="1" max="180" placeholder="Leave blank if not given" value="' + esc(route.estimatedMinutes == null ? "" : route.estimatedMinutes) + '"></label>' +
      "</details>" +
      '<div class="panel"><h2>Directions <span class="muted" id="ed-count"></span></h2>' +
      '<ol class="ed-steps" id="ed-steps"></ol></div>' +
      '<details class="panel"><summary>Import and export</summary>' +
      '<div class="row-btns">' +
      '<label class="btn btn-ghost file-btn">Import GPX track<input type="file" id="ed-gpx" accept=".gpx,application/gpx+xml,application/xml,text/xml"></label>' +
      '<label class="btn btn-ghost file-btn">Import route file<input type="file" id="ed-json" accept=".json,application/json"></label>' +
      '<button class="btn" id="ed-export">Export route file</button>' +
      '<button class="btn btn-ghost" id="ed-copy">Copy as text</button>' +
      "</div>" +
      '<p class="fineprint">A GPX track (from a route app or sat nav) is drawn exactly as recorded. You still add the directions on top.</p>' +
      '<div class="row-btns"><button class="btn btn-danger" id="ed-discard">Discard draft</button>' +
      '<button class="btn btn-danger btn-ghost" id="ed-clearline">Remove road line</button></div>' +
      "</details>" +
      '<a class="btn btn-wide" id="ed-view" href="#/route/' + id + '">View route</a>' +
      "</div></div>";

    const $ = (s) => root.querySelector(s);

    function save() {
      route.status = PD.hasData(route) ? "provided" : "awaiting";
      if (!PD.saveDraft(route)) PD.toast("Couldn't save in this browser (private mode?). Export the file instead.", true);
      route.isDraft = true;
    }
    function geometryChanged() {
      if (route.pathSource === "osrm" && route.path.length) {
        route.path = [];
        route.osrmMinutes = null;
        route.pathSource = null;
        PD.toast("Points changed, so the road line was cleared. Snap to roads again.");
      }
    }

    // ---------- map ----------
    map = PDMaps.makeMap($("#ed-map"));
    let fitted = false;
    function redrawMap() {
      map.eachLayer((l) => {
        if (!(l instanceof L.TileLayer) && l !== searchMarker) map.removeLayer(l);
      });
      layers = PDMaps.drawRoute(map, route, {
        showVia: true,
        draggable: true,
        selected,
        onStepClick: (i) => select(i, true),
        onDragEnd: (i, ll) => {
          route.steps[i].lat = ll.lat;
          route.steps[i].lng = ll.lng;
          geometryChanged();
          save();
          renderAll();
        },
      });
      if (!fitted && layers.bounds) {
        PDMaps.fitRoute(map, layers);
        fitted = true;
      }
      const note = $("#ed-line-note");
      if (route.pathSource === "gpx") note.textContent = "Blue line: imported GPX track, drawn as recorded.";
      else if (route.pathSource === "osrm") note.textContent = "Blue line: your points joined along OpenStreetMap roads by OSRM" + (route.osrmMinutes ? " (about " + route.osrmMinutes + " min without traffic)" : "") + ". If it takes a wrong road, add a Shape point on the right road and snap again.";
      else note.textContent = route.steps.length > 1 ? "Grey dashes are straight lines between points, not roads. Press Snap to roads to follow the real roads." : "";
    }
    map.on("click", (e) => {
      if (!adding) return;
      const at = selected == null ? route.steps.length : selected + 1;
      const type = route.steps.length === 0 ? "start" : "junction";
      route.steps.splice(at, 0, { lat: e.latlng.lat, lng: e.latlng.lng, type, instruction: "", road: "", lane: "", note: "" });
      geometryChanged();
      selected = at;
      save();
      renderAll();
      const input = root.querySelector('[data-i="' + at + '"] [data-f="instruction"]');
      if (input && window.matchMedia("(min-width: 900px)").matches) input.focus();
    });

    // ---------- step list ----------
    function select(i, scroll) {
      selected = i;
      renderAll();
      if (scroll) {
        const li = root.querySelector('[data-i="' + i + '"]');
        if (li) li.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
    function renderSteps() {
      const labels = PDMaps.stepLabels(route);
      $("#ed-count").textContent = "(" + PD.directionSteps(route).length + ")";
      const list = $("#ed-steps");
      if (!route.steps.length) {
        list.innerHTML = '<li class="ed-empty">Press <b>Add points</b>, then tap the map where the route starts. Keep tapping, in order, at each junction, roundabout or feature in your directions.</li>';
        return;
      }
      list.innerHTML = route.steps
        .map((s, i) => {
          const info = PDMaps.TYPE_INFO[s.type];
          const open = i === selected;
          return (
            '<li class="ed-step' + (open ? " open" : "") + '" data-i="' + i + '">' +
            '<button class="ed-step-head" data-sel="' + i + '"><span class="step-pin' + (s.type === "via" ? " via" : "") + '" style="--pin:' + info.color + '">' + (s.type === "via" ? "" : esc(labels[i])) + "</span>" +
            "<span>" + (s.instruction ? esc(s.instruction) : '<i class="muted">' + esc(info.label) + (s.type === "via" ? "" : " · no wording yet") + "</i>") + "</span></button>" +
            (open
              ? '<div class="ed-step-body">' +
                '<label class="field"><span>Type</span><select data-f="type">' +
                PD.TYPES.map((t) => '<option value="' + t + '"' + (t === s.type ? " selected" : "") + ">" + esc(PDMaps.TYPE_INFO[t].label) + "</option>").join("") +
                "</select></label>" +
                (s.type === "via"
                  ? '<p class="fineprint">Shape points only steer the road line onto the right road. They are not shown as directions.</p>'
                  : '<label class="field"><span>Direction (as your source words it)</span><input type="text" data-f="instruction" value="' + esc(s.instruction) + '" placeholder="e.g. At the roundabout take the 2nd exit"></label>' +
                    '<label class="field"><span>Road</span><input type="text" data-f="road" value="' + esc(s.road) + '" placeholder="Road name from the source"></label>' +
                    '<label class="field"><span>Lane (optional)</span><input type="text" data-f="lane" value="' + esc(s.lane) + '" placeholder="e.g. Right-hand lane"></label>' +
                    '<label class="field"><span>Extra detail (optional)</span><input type="text" data-f="note" value="' + esc(s.note) + '"></label>') +
                '<div class="row-btns">' +
                '<button class="btn btn-small btn-ghost" data-act="up"' + (i === 0 ? " disabled" : "") + ">Move up</button>" +
                '<button class="btn btn-small btn-ghost" data-act="down"' + (i === route.steps.length - 1 ? " disabled" : "") + ">Move down</button>" +
                '<a class="btn btn-small btn-ghost" target="_blank" rel="noopener" href="' + PD.streetViewLink(s.lat, s.lng, PD.approachHeading(route, i)) + '">Check in Street View &#8599;</a>' +
                '<button class="btn btn-small btn-danger" data-act="delete">Delete</button>' +
                "</div>" +
                '<p class="fineprint">Drag the pin on the map to adjust its position.</p>' +
                "</div>"
              : "") +
            "</li>"
          );
        })
        .join("");

      list.querySelectorAll("[data-sel]").forEach((b) =>
        b.addEventListener("click", () => {
          const i = Number(b.dataset.sel);
          const s = route.steps[i];
          select(i === selected ? null : i);
          map.panTo([s.lat, s.lng]);
        })
      );
      const li = list.querySelector(".ed-step.open");
      if (!li) return;
      const i = Number(li.dataset.i);
      li.querySelectorAll("[data-f]").forEach((el) => {
        el.addEventListener(el.tagName === "SELECT" ? "change" : "input", () => {
          route.steps[i][el.dataset.f] = el.value;
          save();
          if (el.tagName === "SELECT") renderAll();
          else {
            // Keep focus while typing; refresh just the heading text.
            const head = li.querySelector(".ed-step-head span:last-child");
            if (el.dataset.f === "instruction") head.innerHTML = el.value ? esc(el.value) : '<i class="muted">no wording yet</i>';
          }
        });
      });
      li.querySelectorAll("[data-act]").forEach((b) =>
        b.addEventListener("click", () => {
          const act = b.dataset.act;
          if (act === "delete") {
            route.steps.splice(i, 1);
            selected = route.steps.length ? Math.min(i, route.steps.length - 1) : null;
          } else {
            const j = act === "up" ? i - 1 : i + 1;
            [route.steps[i], route.steps[j]] = [route.steps[j], route.steps[i]];
            selected = j;
          }
          geometryChanged();
          save();
          renderAll();
        })
      );
    }

    function renderAddBtn() {
      const b = $("#ed-add");
      b.textContent = adding ? "Adding: tap the map" : "Add points";
      b.setAttribute("aria-pressed", String(adding));
      b.classList.toggle("btn-on", adding);
      $("#ed-map").classList.toggle("adding", adding);
      // Quick taps shouldn't zoom the map while placing points.
      if (adding) map.doubleClickZoom.disable();
      else map.doubleClickZoom.enable();
    }

    function renderAll() {
      renderSteps();
      redrawMap();
      renderAddBtn();
    }

    // ---------- controls ----------
    $("#ed-add").addEventListener("click", () => {
      adding = !adding;
      renderAddBtn();
      if (adding) PD.toast(selected == null ? "Tap the map to add a point at the end" : "Tap the map to add a point after the selected one");
    });

    $("#ed-snap").addEventListener("click", async () => {
      const b = $("#ed-snap");
      if (route.pathSource === "gpx" && !confirm("Replace the imported GPX track with a line snapped from your points?")) return;
      b.disabled = true;
      b.textContent = "Snapping…";
      try {
        const res = await PD.snapToRoads(route.steps);
        route.path = res.path;
        route.osrmMinutes = res.minutes;
        route.pathSource = "osrm";
        save();
        fitted = false;
        renderAll();
        PD.toast("Snapped to roads. Check the line follows your source.");
      } catch (e) {
        PD.toast(e.message, true);
      } finally {
        b.disabled = false;
        b.textContent = "Snap to roads";
      }
    });

    $("#ed-title").addEventListener("input", (e) => {
      route.title = e.target.value.trim() || "Route " + id;
      save();
    });
    $("#ed-source").addEventListener("input", (e) => {
      route.source = e.target.value.trim() || null;
      save();
    });
    $("#ed-mins").addEventListener("input", (e) => {
      const v = parseInt(e.target.value, 10);
      route.estimatedMinutes = v > 0 ? v : null;
      save();
    });

    $("#ed-gpx").addEventListener("change", async (e) => {
      const f = e.target.files[0];
      e.target.value = "";
      if (!f) return;
      try {
        route.path = PD.parseGpx(await f.text());
        route.pathSource = "gpx";
        route.osrmMinutes = null;
        save();
        fitted = false;
        renderAll();
        PD.toast("GPX track imported (" + route.path.length + " points).");
      } catch (err) {
        PD.toast(err.message, true);
      }
    });

    $("#ed-json").addEventListener("change", async (e) => {
      const f = e.target.files[0];
      e.target.value = "";
      if (!f) return;
      try {
        let data = JSON.parse(await f.text());
        if (Array.isArray(data)) data = data.find((r) => Number(r.id) === id) || data[0];
        if (route.steps.length && !confirm("Replace this route's current points with the file?")) return;
        const clean = PD.cleanRoute(id, data);
        Object.assign(route, clean);
        selected = route.steps.length ? 0 : null;
        save();
        PDMaps.destroyAll();
        PDViews.editor(root, id);
        PD.toast("Route file imported.");
      } catch (err) {
        PD.toast(err instanceof SyntaxError ? "That file isn't valid JSON." : err.message, true);
      }
    });

    function exportText() {
      const out = PD.cleanRoute(id, route);
      return JSON.stringify(out, null, 2);
    }
    $("#ed-export").addEventListener("click", () => PD.download("pembroke-dock-route-" + id + ".json", exportText()));
    $("#ed-copy").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(exportText());
        PD.toast("Copied. Paste it into a message to send it.");
      } catch (e) {
        PD.toast("Couldn't copy here. Use Export route file instead.", true);
      }
    });
    $("#ed-discard").addEventListener("click", () => {
      if (!confirm("Discard your draft of " + route.title + "? This can't be undone.")) return;
      PD.discardDraft(id);
      PD.toast("Draft discarded.");
      PDMaps.destroyAll();
      root.innerHTML = "";
      PDViews.editor(root, id);
    });
    $("#ed-clearline").addEventListener("click", () => {
      if (!route.path.length) return PD.toast("There's no road line to remove.");
      route.path = [];
      route.pathSource = null;
      route.osrmMinutes = null;
      save();
      renderAll();
    });

    // ---------- search (OpenStreetMap Nominatim) ----------
    $("#ed-search").addEventListener("submit", async (e) => {
      e.preventDefault();
      const q = $("#ed-q").value.trim();
      const out = $("#ed-results");
      if (!q) return;
      out.innerHTML = '<p class="muted">Searching…</p>';
      const vb = PD_CONFIG.SEARCH_VIEWBOX.join(",");
      try {
        const res = await fetch(PD_CONFIG.NOMINATIM_URL + "?format=json&limit=6&countrycodes=gb&bounded=1&viewbox=" + vb + "&q=" + encodeURIComponent(q));
        const hits = await res.json();
        if (!hits.length) {
          out.innerHTML = '<p class="muted">Nothing found near Pembroke Dock.</p>';
          return;
        }
        out.innerHTML = hits.map((h, k) => '<button class="result" data-k="' + k + '">' + esc(h.display_name) + "</button>").join("");
        out.querySelectorAll("[data-k]").forEach((b) =>
          b.addEventListener("click", () => {
            const h = hits[Number(b.dataset.k)];
            const ll = [Number(h.lat), Number(h.lon)];
            if (searchMarker) map.removeLayer(searchMarker);
            searchMarker = L.circleMarker(ll, { radius: 9, color: "#d4212a", weight: 3, fillOpacity: 0.1 }).addTo(map);
            map.setView(ll, 17);
            out.innerHTML = "";
          })
        );
      } catch (err) {
        out.innerHTML = '<p class="muted">Search is unavailable right now.</p>';
      }
    });

    renderAll();
  };
})();

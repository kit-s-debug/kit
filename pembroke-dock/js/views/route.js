/* One route: Map, Overview, Street View and Notes tabs. */
(function () {
  window.PDViews = window.PDViews || {};
  const esc = PD.esc;
  const TABS = [
    ["map", "Map"],
    ["overview", "Overview"],
    ["street", "Street View"],
    ["notes", "Notes"],
  ];

  // Notes are keyed by position, so they stay with a junction even if steps
  // are inserted or reordered in the editor.
  const stepKey = (s) => s.lat.toFixed(5) + "," + s.lng.toFixed(5);
  function loadNotes(id) {
    return PD.store.get("notes." + id, { general: "", steps: {} });
  }
  function saveNotes(id, notes) {
    if (!PD.store.set("notes." + id, notes)) PD.toast("Couldn't save notes in this browser (private mode?)", true);
  }

  PDViews.route = function (root, id, tab) {
    const route = PD.getRoute(id);
    if (!TABS.some((t) => t[0] === tab)) tab = "map";
    const labels = PDMaps.stepLabels(route);
    const dirs = PD.directionSteps(route);
    const notes = loadNotes(id);
    const flagged = (i) => {
      const n = notes.steps[stepKey(route.steps[i])];
      return !!(n && n.difficult);
    };

    root.innerHTML =
      '<div class="route-head">' +
      '<a class="back" href="#/">&larr; All routes</a>' +
      '<div class="route-title"><span class="route-num">' + id + "</span><h1>" + esc(route.title) + "</h1></div>" +
      '<div class="route-actions"><a class="btn btn-ghost" href="#/edit/' + id + '">Edit route</a></div>' +
      "</div>" +
      provenance(route) +
      '<nav class="tabs" role="tablist">' +
      TABS.map((t) => '<button role="tab" data-tab="' + t[0] + '">' + t[1] + "</button>").join("") +
      "</nav>" +
      '<div class="tab-body"></div>';

    const body = root.querySelector(".tab-body");

    if (!PD.hasData(route)) {
      body.innerHTML =
        '<div class="empty-state"><h2>No directions for this route yet</h2>' +
        "<p>Send the map, screenshots or written directions for " + esc(route.title) + ", or enter them yourself in the route editor.</p>" +
        '<a class="btn" href="#/edit/' + id + '">Open route editor</a></div>';
      root.querySelector(".tabs").remove();
      return;
    }

    let focusStep = null;
    function show(name) {
      tab = name;
      history.replaceState(null, "", "#/route/" + id + (name === "map" ? "" : "/" + name));
      root.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
      PDMaps.destroyAll();
      body.innerHTML = "";
      if (name !== "map" && !dirs.length) {
        body.innerHTML =
          '<div class="empty-state"><h2>No directions yet</h2><p>This route has a line on the map but no junction-by-junction directions. Add them in the route editor.</p>' +
          '<a class="btn" href="#/edit/' + id + '">Open route editor</a></div>';
        return;
      }
      ({ map: mapTab, overview: overviewTab, street: streetTab, notes: notesTab })[name]();
    }
    root.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));

    function stepPopup(s, i, label) {
      const h = PD.approachHeading(route, i);
      return (
        '<div class="pop"><b>' + esc(label) + ". " + esc(PDMaps.TYPE_INFO[s.type].label) + "</b>" +
        (s.instruction ? "<p>" + esc(s.instruction) + "</p>" : "") +
        (s.road ? '<p class="muted">' + esc(s.road) + "</p>" : "") +
        '<a class="btn btn-small" target="_blank" rel="noopener" href="' + PD.streetViewLink(s.lat, s.lng, h) + '">Street View &#8599;</a></div>'
      );
    }

    // ---------- Map ----------
    function mapTab() {
      body.innerHTML =
        '<div class="map-wrap"><div class="map" id="route-map"></div>' +
        '<div class="map-legend">' + legend() + "</div></div>" +
        '<p class="fineprint">' + lineNote(route) + " Tap a numbered pin for its direction, or tap any road to open Street View there.</p>";
      const map = PDMaps.makeMap(document.getElementById("route-map"));
      const layers = PDMaps.drawRoute(map, route, { popup: stepPopup, flagged });
      PDMaps.fitRoute(map, layers);
      map.on("click", (e) => {
        L.popup()
          .setLatLng(e.latlng)
          .setContent('<div class="pop"><a class="btn btn-small" target="_blank" rel="noopener" href="' + PD.streetViewLink(e.latlng.lat, e.latlng.lng, 0) + '">Street View here &#8599;</a></div>')
          .openOn(map);
      });
      if (focusStep != null) {
        const m = layers.markers.find((mk) => mk.stepIndex === focusStep);
        if (m) {
          map.setView(m.getLatLng(), 18);
          m.openPopup();
        }
        focusStep = null;
      }
    }

    // ---------- Overview ----------
    function overviewTab() {
      const c = {};
      dirs.forEach((s) => (c[s.type] = (c[s.type] || 0) + 1));
      const km = route.path.length > 1 ? (PD.pathLengthM(route.path) / 1000).toFixed(1) : null;
      const stats = [
        [dirs.length, "directions"],
        [c.roundabout || 0, "roundabouts"],
        [c.junction || 0, "junctions"],
        [c["traffic-lights"] || 0, "traffic lights"],
        [c.feature || 0, "road features"],
      ];
      if (km) stats.push([km + " km", route.pathSource === "gpx" ? "track length" : "road distance"]);
      if (route.estimatedMinutes) stats.push([route.estimatedMinutes + " min", "from source"]);
      else if (route.osrmMinutes) stats.push([route.osrmMinutes + " min", "OSRM, no traffic"]);

      body.innerHTML =
        '<div class="overview">' +
        '<div class="stats">' + stats.map((s) => '<div class="stat"><b>' + esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></div>").join("") + "</div>" +
        '<div class="overview-map map" id="ov-map"></div>' +
        '<ol class="steps">' + dirs.map(stepRow).join("") + "</ol></div>";

      const map = PDMaps.makeMap(document.getElementById("ov-map"), { scrollWheelZoom: false });
      PDMaps.fitRoute(map, PDMaps.drawRoute(map, route, { popup: stepPopup, flagged }));

      body.querySelectorAll("[data-show]").forEach((b) =>
        b.addEventListener("click", () => {
          focusStep = Number(b.dataset.show);
          show("map");
        })
      );
    }

    function stepRow(s) {
      const i = s.index;
      const info = PDMaps.TYPE_INFO[s.type];
      const h = PD.approachHeading(route, i);
      const n = notes.steps[stepKey(s)];
      return (
        '<li class="step' + (n && n.difficult ? " is-flagged" : "") + '">' +
        '<span class="step-pin" style="--pin:' + info.color + '">' + esc(labels[i]) + "</span>" +
        '<div class="step-text">' +
        '<span class="type">' + esc(info.label) + (n && n.difficult ? ' · <b class="flag">Marked difficult</b>' : "") + "</span>" +
        "<p>" + (s.instruction ? esc(s.instruction) : '<i class="muted">No instruction given</i>') + "</p>" +
        (s.road ? '<p class="muted">' + esc(s.road) + "</p>" : "") +
        (s.lane ? '<p class="lane">Lane: ' + esc(s.lane) + "</p>" : "") +
        (s.note ? '<p class="muted">' + esc(s.note) + "</p>" : "") +
        (n && n.note ? '<p class="my-note">Your note: ' + esc(n.note) + "</p>" : "") +
        '<div class="step-btns">' +
        '<button class="btn btn-small btn-ghost" data-show="' + i + '">Show on map</button>' +
        '<a class="btn btn-small btn-ghost" target="_blank" rel="noopener" href="' + PD.streetViewLink(s.lat, s.lng, h) + '">Street View &#8599;</a>' +
        "</div></div></li>"
      );
    }

    // ---------- Street View ----------
    let svIndex = 0;
    function streetTab() {
      const s = dirs[svIndex];
      const h = PD.approachHeading(route, s.index);
      const embed = PD.streetViewEmbed(s.lat, s.lng, h);
      const info = PDMaps.TYPE_INFO[s.type];
      body.innerHTML =
        '<div class="street">' +
        '<div class="sv-bar">' +
        '<button class="btn btn-ghost" data-sv="-1" ' + (svIndex === 0 ? "disabled" : "") + ' aria-label="Previous direction">&larr;</button>' +
        '<select id="sv-pick" aria-label="Choose a direction">' +
        dirs.map((d, k) => '<option value="' + k + '"' + (k === svIndex ? " selected" : "") + ">" + esc(labels[d.index] + ". " + (d.instruction || PDMaps.TYPE_INFO[d.type].label)) + "</option>").join("") +
        "</select>" +
        '<button class="btn btn-ghost" data-sv="1" ' + (svIndex === dirs.length - 1 ? "disabled" : "") + ' aria-label="Next direction">&rarr;</button>' +
        "</div>" +
        '<div class="sv-label real">Real imagery · Google Street View. Check the capture date in the viewer; the road may have changed since it was taken.</div>' +
        (embed
          ? '<div class="sv-frame"><iframe title="Street View at this direction" src="' + esc(embed) + '" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></div>'
          : '<div class="sv-frame sv-nokey"><p>Street View opens in Google Maps. To see it inside this page, add a free Maps Embed API key on the <a href="#/setup">Setup</a> page.</p>' +
            '<a class="btn" target="_blank" rel="noopener" href="' + PD.streetViewLink(s.lat, s.lng, h) + '">Open Street View here &#8599;</a></div>') +
        '<div class="sv-detail"><span class="step-pin" style="--pin:' + info.color + '">' + esc(labels[s.index]) + "</span><div>" +
        '<span class="type">' + esc(info.label) + "</span>" +
        "<p>" + esc(s.instruction || "") + "</p>" +
        (s.road ? '<p class="muted">' + esc(s.road) + "</p>" : "") +
        (s.lane ? '<p class="lane">Lane: ' + esc(s.lane) + "</p>" : "") +
        (embed ? '<p><a target="_blank" rel="noopener" href="' + PD.streetViewLink(s.lat, s.lng, h) + '">Open in Google Maps &#8599;</a></p>' : "") +
        "</div></div>" +
        '<div class="map sv-map" id="sv-map"></div>' +
        "</div>";
      body.querySelectorAll("[data-sv]").forEach((b) =>
        b.addEventListener("click", () => {
          svIndex = Math.max(0, Math.min(dirs.length - 1, svIndex + Number(b.dataset.sv)));
          streetTab();
        })
      );
      body.querySelector("#sv-pick").addEventListener("change", (e) => {
        svIndex = Number(e.target.value);
        streetTab();
      });
      PDMaps.destroyAll();
      const map = PDMaps.makeMap(document.getElementById("sv-map"), { scrollWheelZoom: false });
      PDMaps.drawRoute(map, route, {
        selected: s.index,
        flagged,
        onStepClick: (i) => {
          const k = dirs.findIndex((d) => d.index === i);
          if (k >= 0) {
            svIndex = k;
            streetTab();
          }
        },
      });
      map.setView([s.lat, s.lng], 17);
    }

    // ---------- Notes ----------
    function notesTab() {
      body.innerHTML =
        '<div class="notes">' +
        '<p class="fineprint">Notes save automatically, in this browser on this device only. Use Export to keep a copy.</p>' +
        '<label class="field"><span>General notes for ' + esc(route.title) + "</span>" +
        '<textarea id="note-general" rows="5" placeholder="e.g. Hard to spot the turning after the petrol station">' + esc(notes.general) + "</textarea></label>" +
        "<h2>Directions</h2>" +
        '<ol class="note-steps">' +
        dirs
          .map((s) => {
            const n = notes.steps[stepKey(s)] || {};
            return (
              '<li data-key="' + stepKey(s) + '">' +
              '<div class="note-step-head"><span class="step-pin" style="--pin:' + PDMaps.TYPE_INFO[s.type].color + '">' + esc(labels[s.index]) + "</span>" +
              "<p>" + esc(s.instruction || PDMaps.TYPE_INFO[s.type].label) + "</p></div>" +
              '<label class="check"><input type="checkbox" data-difficult ' + (n.difficult ? "checked" : "") + "> Difficult</label>" +
              '<input type="text" data-note placeholder="Lane choice, mistake, what to watch for" value="' + esc(n.note || "") + '">' +
              "</li>"
            );
          })
          .join("") +
        "</ol>" +
        '<div class="row-btns"><button class="btn" id="notes-export">Export notes</button>' +
        '<button class="btn btn-danger" id="notes-clear">Clear notes</button></div></div>';

      let timer;
      const persist = () => {
        clearTimeout(timer);
        timer = setTimeout(() => saveNotes(id, notes), 300);
      };
      body.querySelector("#note-general").addEventListener("input", (e) => {
        notes.general = e.target.value;
        persist();
      });
      body.querySelectorAll(".note-steps li").forEach((li) => {
        const key = li.dataset.key;
        const get = () => (notes.steps[key] = notes.steps[key] || { difficult: false, note: "" });
        li.querySelector("[data-difficult]").addEventListener("change", (e) => {
          get().difficult = e.target.checked;
          saveNotes(id, notes);
        });
        li.querySelector("[data-note]").addEventListener("input", (e) => {
          get().note = e.target.value;
          persist();
        });
      });
      body.querySelector("#notes-export").addEventListener("click", () => {
        const lines = [route.title + " notes", "", notes.general || "(no general notes)", ""];
        dirs.forEach((s) => {
          const n = notes.steps[stepKey(s)];
          if (n && (n.difficult || n.note)) {
            lines.push(labels[s.index] + ". " + (s.instruction || PDMaps.TYPE_INFO[s.type].label) + (n.difficult ? "  [DIFFICULT]" : ""));
            if (n.note) lines.push("   " + n.note);
          }
        });
        PD.download("route-" + id + "-notes.txt", lines.join("\n"), "text/plain");
      });
      body.querySelector("#notes-clear").addEventListener("click", () => {
        if (!confirm("Clear all notes for " + route.title + "?")) return;
        notes.general = "";
        notes.steps = {};
        saveNotes(id, notes);
        notesTab();
      });
      window.PDViews.cleanup = () => {
        clearTimeout(timer);
        saveNotes(id, notes);
      };
    }

    show(tab);
  };

  function legend() {
    return ["start", "junction", "roundabout", "traffic-lights", "feature", "end"]
      .map((t) => '<span><i style="--pin:' + PDMaps.TYPE_INFO[t].color + '"></i>' + PDMaps.TYPE_INFO[t].label + "</span>")
      .join("");
  }

  function lineNote(route) {
    if (route.pathSource === "gpx") return "Blue line: the imported GPX track.";
    if (route.pathSource === "osrm") return "Blue line: the route's points joined along OpenStreetMap roads by OSRM. Check it against your source.";
    return "Grey dashes: straight lines between points, not the actual road. Snap to roads in the editor.";
  }

  function provenance(route) {
    const bits = [];
    if (route.isDraft) bits.push("<b>Your draft</b>, saved in this browser.");
    bits.push(route.source ? "Source: " + esc(route.source) + "." : "No source recorded.");
    bits.push(route.verified ? "Verified." : "Not verified against an official source.");
    return '<p class="provenance">' + bits.join(" ") + "</p>";
  }
})();

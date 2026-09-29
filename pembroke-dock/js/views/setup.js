/* Setup: what each service is, which need keys, and local data tools. */
(function () {
  window.PDViews = window.PDViews || {};
  const esc = PD.esc;

  PDViews.setup = function (root) {
    const key = PD.store.get("googleKey", "");
    const drafts = PD.allRoutes().filter((r) => r.isDraft);

    root.innerHTML =
      '<div class="page">' +
      "<h1>Setup</h1>" +
      "<h2>What you need</h2>" +
      '<table class="svc"><thead><tr><th>Service</th><th>Used for</th><th>Key or account</th></tr></thead><tbody>' +
      "<tr><td>OpenStreetMap tiles</td><td>The interactive map</td><td>None</td></tr>" +
      "<tr><td>OSRM demo server</td><td>Snapping your points to real roads in the editor</td><td>None (light use only)</td></tr>" +
      "<tr><td>Nominatim</td><td>Place search in the editor</td><td>None (light use only)</td></tr>" +
      "<tr><td>Google Maps links</td><td>Opening Street View at a junction</td><td>None</td></tr>" +
      "<tr><td>Google Maps Embed API</td><td>Showing Street View inside this page</td><td>Optional free API key. Needs a Google Cloud account with billing turned on, but Embed requests aren't charged.</td></tr>" +
      "</tbody></table>" +

      '<h2 id="key">Google Street View inside the page (optional)</h2>' +
      "<ol class=\"howto\">" +
      '<li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener">Google Cloud Console</a>, create a project and add a billing account.</li>' +
      "<li>Under APIs &amp; Services, enable <b>Maps Embed API</b>.</li>" +
      "<li>Create an API key. Under key restrictions, limit it to the Maps Embed API and to this site's web address.</li>" +
      "<li>Paste it below. It's stored in this browser only; to use it on every device, put it in <code>js/config.js</code> instead.</li>" +
      "</ol>" +
      '<form class="key-form" id="key-form"><input type="text" id="key-in" autocomplete="off" spellcheck="false" placeholder="Paste Maps Embed API key" value="' + esc(key) + '">' +
      '<button class="btn" type="submit">Save key</button>' +
      (key ? '<button class="btn btn-ghost" type="button" id="key-clear">Remove</button>' : "") +
      "</form>" +
      '<p class="fineprint">' + (PD.embedKey() ? "Street View will show inside the page." : "No key set: Street View opens in Google Maps instead, which works just as well on an iPhone.") + "</p>" +

      "<h2>Where the pictures come from</h2>" +
      '<ul class="plain">' +
      '<li><span class="sv-label real inline">Real imagery</span> Street View photos are Google\'s real photos of that spot. They can be years old; the capture date shows in the viewer.</li>' +
      "<li><b>Map:</b> OpenStreetMap, drawn from real survey data.</li>" +
      "<li><b>Route lines:</b> either a GPX track you imported, or your own points joined along OpenStreetMap roads. Each map says which.</li>" +
      "<li><b>Directions:</b> the wording from your source, typed in the editor. Nothing is generated.</li>" +
      "</ul>" +

      "<h2>Your saved data</h2>" +
      "<p>Drafts and notes are kept in this browser only. " + drafts.length + " route draft" + (drafts.length === 1 ? "" : "s") + " saved here.</p>" +
      '<div class="row-btns">' +
      '<button class="btn" id="exp-drafts"' + (drafts.length ? "" : " disabled") + ">Export all drafts</button>" +
      '<button class="btn btn-ghost" id="exp-notes">Export all notes</button>' +
      "</div>" +

      "<h2>Build stages</h2>" +
      '<ol class="howto">' +
      "<li><b>Stage 1 (this version):</b> real map, route list, route overview, Street View at every direction, notes, and the route editor for entering the 15 routes.</li>" +
      "<li><b>Stage 2:</b> guided drive mode that follows the route in order with upcoming directions, pause, restart, jump to a junction and repeat a section.</li>" +
      "<li><b>Stage 3:</b> practice mode that holds back directions until you ask.</li>" +
      "</ol>" +
      "</div>";

    root.querySelector("#key-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = root.querySelector("#key-in").value.trim();
      if (v) PD.store.set("googleKey", v);
      else PD.store.remove("googleKey");
      PD.toast(v ? "Key saved in this browser." : "Key removed.");
      PDViews.setup(root);
    });
    const clr = root.querySelector("#key-clear");
    if (clr)
      clr.addEventListener("click", () => {
        PD.store.remove("googleKey");
        PD.toast("Key removed.");
        PDViews.setup(root);
      });
    root.querySelector("#exp-drafts").addEventListener("click", () => {
      const all = PD.allRoutes().filter((r) => r.isDraft).map((r) => PD.cleanRoute(r.id, r));
      PD.download("pembroke-dock-route-drafts.json", JSON.stringify(all, null, 2));
    });
    root.querySelector("#exp-notes").addEventListener("click", () => {
      const all = {};
      for (let i = 1; i <= PD_CONFIG.ROUTE_COUNT; i++) {
        const n = PD.store.get("notes." + i, null);
        if (n) all[i] = n;
      }
      PD.download("pembroke-dock-notes.json", JSON.stringify(all, null, 2));
    });
  };
})();

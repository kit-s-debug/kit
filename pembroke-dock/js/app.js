/* Hash router: #/, #/route/3[/tab], #/edit/3, #/setup */
(function () {
  const view = document.getElementById("view");

  function parse() {
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").filter(Boolean);
    return parts;
  }

  function render() {
    PDMaps.destroyAll();
    if (window.PDViews.cleanup) {
      try {
        window.PDViews.cleanup();
      } catch (e) {}
      window.PDViews.cleanup = null;
    }
    const [page, a, b] = parse();
    const id = parseInt(a, 10);
    let nav = "home";
    view.innerHTML = "";
    if (page === "route" && id >= 1 && id <= PD_CONFIG.ROUTE_COUNT) {
      PDViews.route(view, id, b || "map");
    } else if (page === "edit" && id >= 1 && id <= PD_CONFIG.ROUTE_COUNT) {
      PDViews.editor(view, id);
    } else if (page === "setup") {
      nav = "setup";
      PDViews.setup(view);
    } else {
      PDViews.home(view);
    }
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.classList.toggle("active", el.dataset.nav === nav && (page === undefined || page === "setup"));
    });
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", render);
  render();
})();

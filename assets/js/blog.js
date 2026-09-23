/* blog.js — load the posts.json manifest and render the index.
   posts.json is the permanent record: title, series, timestamps, tags. */
(function () {
  "use strict";

  var listEl   = document.getElementById("post-list");
  var emptyEl  = document.getElementById("empty-state");
  var errorEl  = document.getElementById("error-state");
  var filterEl = document.getElementById("filter-group");
  var searchEl = document.getElementById("search");
  var countEl  = document.getElementById("series-count");
  var blurbEl  = document.getElementById("series-blurb");

  var SERIES = (window.SITE && SITE.series) || {};
  var posts = [];
  var state = { filter: "all", query: "" };

  /* ---- helpers ---- */
  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return iso || "";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  function seriesLabel(key) { return (SERIES[key] && (SERIES[key].short || SERIES[key].title)) || key; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---- render one post row ---- */
  function rowHTML(p) {
    var url = "post.html?slug=" + encodeURIComponent(p.slug);
    var seriesTag = p.series
      ? '<span class="post-row__series">' + esc(seriesLabel(p.series)) +
        (p.seriesNumber ? " · No. " + pad(p.seriesNumber) : "") + "</span>"
      : "";
    var tags = (p.tags || []).map(function (t) { return '<span class="pill">' + esc(t) + "</span>"; }).join("");
    var reads = p.readingTime ? '<span>' + esc(p.readingTime) + " read</span>" : "";
    return '' +
      '<li class="post-row" data-series="' + esc(p.series || "") + '" data-search="' +
        esc(((p.title || "") + " " + (p.excerpt || "") + " " + (p.tags || []).join(" ")).toLowerCase()) + '">' +
        '<div class="post-row__aside"><div class="post-row__meta">' +
          '<time class="post-row__date" datetime="' + esc(p.created) + '">' + esc(fmtDate(p.created)) + "</time>" +
          seriesTag + reads +
        "</div></div>" +
        '<div><a class="post-row__link" href="' + url + '">' +
          '<h2 class="post-row__title">' + esc(p.title) + "</h2>" +
          '<p class="post-row__excerpt">' + esc(p.excerpt || "") + "</p>" +
        "</a>" +
        (tags ? '<div class="post-row__tags">' + tags + "</div>" : "") +
        "</div>" +
      "</li>";
  }

  /* ---- render the whole list under current filter/query ---- */
  function render() {
    var visible = posts.filter(function (p) {
      var okSeries = state.filter === "all" || p.series === state.filter;
      var okQuery = !state.query ||
        (((p.title || "") + " " + (p.excerpt || "") + " " + (p.tags || []).join(" "))
          .toLowerCase().indexOf(state.query) !== -1);
      return okSeries && okQuery;
    });
    listEl.innerHTML = visible.map(rowHTML).join("");
    emptyEl.classList.toggle("is-hidden", visible.length !== 0);
  }

  /* ---- build filter buttons from the series present in the data ---- */
  function buildFilters() {
    var present = [];
    posts.forEach(function (p) { if (p.series && present.indexOf(p.series) === -1) present.push(p.series); });
    present.forEach(function (key) {
      var b = document.createElement("button");
      b.className = "filter-btn";
      b.setAttribute("data-filter", key);
      b.setAttribute("aria-pressed", "false");
      b.textContent = seriesLabel(key);
      filterEl.appendChild(b);
    });
    filterEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      state.filter = btn.getAttribute("data-filter");
      filterEl.querySelectorAll(".filter-btn").forEach(function (x) {
        x.setAttribute("aria-pressed", String(x === btn));
      });
      render();
    });
  }

  /* ---- flagship series summary ---- */
  function summariseSeries() {
    var key = "robotics-one-page";
    if (SERIES[key] && SERIES[key].blurb && blurbEl) blurbEl.textContent = SERIES[key].blurb;
    var n = posts.filter(function (p) { return p.series === key; }).length;
    if (countEl) countEl.textContent = n === 0 ? "First sheet coming soon"
      : n + (n === 1 ? " sheet published" : " sheets published");
  }

  /* ---- load ---- */
  fetch("content/posts.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      posts = (data.posts || []).slice().sort(function (a, b) {
        return new Date(b.created) - new Date(a.created);   // newest first
      });
      buildFilters();
      summariseSeries();
      render();
    })
    .catch(function (err) {
      console.error("posts.json load failed:", err);
      errorEl.classList.remove("is-hidden");
      if (countEl) countEl.textContent = "—";
    });

  /* ---- search ---- */
  if (searchEl) {
    searchEl.addEventListener("input", function () {
      state.query = searchEl.value.trim().toLowerCase();
      render();
    });
  }
})();

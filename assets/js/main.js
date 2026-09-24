/* main.js — nav, theme toggle, footer year, active link.
   Progressive enhancement: the site content works without JS;
   this adds the mobile menu, dark/light toggle, and small niceties. */
(function () {
  "use strict";

  /* ---- Theme toggle (system default, choice persisted) ---- */
  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");

  function currentTheme() {
    return root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      toggle.setAttribute("aria-label", "Switch to " + (next === "dark" ? "light" : "dark") + " theme");
    });
  }

  /* ---- Mobile nav ---- */
  var navToggle = document.querySelector(".nav__toggle");
  var navLinks = document.querySelector(".nav__links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { navLinks.classList.remove("open"); navToggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---- Active nav link by pathname ---- */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__links a").forEach(function (a) {
    var target = a.getAttribute("href");
    if (target === here || (here === "" && target === "index.html") ||
        (here === "post.html" && target === "blog.html")) {
      a.setAttribute("aria-current", "page");
    }
  });

  /* ---- Footer year ---- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Fill any [data-site] slots from config (e.g. footer links) ---- */
  if (window.SITE) {
    document.querySelectorAll("[data-link]").forEach(function (el) {
      var key = el.getAttribute("data-link");
      if (SITE.links[key]) el.setAttribute("href", SITE.links[key]);
    });
    document.querySelectorAll("[data-text]").forEach(function (el) {
      var path = el.getAttribute("data-text").split(".");
      var v = SITE; for (var i = 0; i < path.length && v; i++) v = v[path[i]];
      if (v) el.textContent = v;
    });
  }
})();

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

  /* ---- Work tabs: Projects (default) / Competitions ---- */
  var tabList = document.querySelector(".work-tabs");
  if (tabList) {
    var tabs = Array.prototype.slice.call(tabList.querySelectorAll('[role="tab"]'));
    var select = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    };
    var switchTo = function (tab) {
      tabs.forEach(function (t) {
        document.getElementById(t.getAttribute("aria-controls")).classList.add("is-switched");
      });
      select(tab);
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { switchTo(t); });
      t.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        var next = tabs[(i + step + tabs.length) % tabs.length];
        switchTo(next); next.focus();
      });
    });
    tabList.hidden = false;
    select(tabs[0]);
  }
})();

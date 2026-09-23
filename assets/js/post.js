/* post.js — render a single post.
   Pipeline: fetch manifest + markdown → parse frontmatter →
   protect math → markdown → extract sheets → assemble → MathJax → scale.

   Two-part post structure:
   Part 1 — Standard web text: title, metadata, introductory paragraphs
            rendered as native HTML from markdown.
   Part 2 — Technical sheet: embedded as JPEG images with a download button.
            Declared via sheetImages in posts.json or frontmatter.

   Legacy support: posts with <!-- sheet --> markers but no sheetImages
   will still render the live MathJax sheet as before. */
(function () {
  "use strict";

  var SERIES = (window.SITE && SITE.series) || {};
  var AUTHOR = (window.SITE && SITE.author) || { name: "", handle: "" };
  var LINKS  = (window.SITE && SITE.links) || {};

  var headerEl = document.getElementById("post-header");
  var proseEl  = document.getElementById("post-prose");
  var footEl   = document.getElementById("post-footer-nav");
  var errEl    = document.getElementById("error-state");
  var errDetail= document.getElementById("error-detail");

  /* ---------- utils ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function escMath(s) { return String(s).replace(/[&<>]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function padNo(no) { var n = parseInt(no, 10); return isNaN(n) ? String(no) : pad(n); }
  function fmtDate(iso) { var d = new Date(iso); return isNaN(d) ? (iso || "")
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }); }
  function fmtDateTime(iso) { var d = new Date(iso); return isNaN(d) ? (iso || "")
    : d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  function seriesLabel(key) { return (SERIES[key] && (SERIES[key].short || SERIES[key].title)) || key || ""; }
  function getParam(n) { return new URLSearchParams(location.search).get(n); }

  function showError(detail) {
    headerEl.innerHTML = "";
    proseEl.innerHTML = "";
    if (errDetail && detail) errDetail.textContent = detail;
    errEl.classList.remove("is-hidden");
  }

  /* ---------- frontmatter (key: value, and [list]) ---------- */
  function parseFrontmatter(text) {
    var meta = {}, body = text;
    var m = /^﻿?---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(text);
    if (m) {
      body = text.slice(m[0].length);
      m[1].split(/\r?\n/).forEach(function (line) {
        var mm = /^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
        if (!mm) return;
        var k = mm[1], v = mm[2].trim();
        if (/^\[.*\]$/.test(v)) {
          v = v.slice(1, -1).split(",").map(function (x) { return x.trim().replace(/^["']|["']$/g, ""); }).filter(Boolean);
        } else { v = v.replace(/^["']|["']$/g, ""); }
        meta[k] = v;
      });
    }
    return { meta: meta, body: body };
  }

  /* ---------- markdown + math protection ---------- */
  function renderMarkdown(md) {
    if (typeof marked === "undefined") return esc(md);
    var math = [];
    function stash(raw) { math.push(raw); return "\0MJX" + (math.length - 1) + "MJX\0"; }
    md = md.replace(/\$\$([\s\S]+?)\$\$/g, function (_, x) { return stash("$$" + x + "$$"); });
    md = md.replace(/\\\[([\s\S]+?)\\\]/g, function (_, x) { return stash("\\[" + x + "\\]"); });
    md = md.replace(/\\\(([\s\S]+?)\\\)/g, function (_, x) { return stash("\\(" + x + "\\)"); });
    md = md.replace(/\$(?!\s)((?:\\.|[^\$\\\n])+?)\$/g, function (m, x) {
      return /\s$/.test(x) ? m : stash("$" + x + "$");   // skip "$ x $" and currency-ish
    });
    var html = marked.parse(md);
    html = html.replace(/\0MJX(\d+)MJX\0/g, function (_, i) { return escMath(math[+i]); });
    return html;
  }

  /* ---------- extract <!-- sheet --> … <!-- /sheet --> regions ---------- */
  function extractSheets(body) {
    var sheets = [];
    var re = /<!-- *sheet\b([\s\S]*?)-->([\s\S]*?)<!-- *\/sheet *-->/gi;
    var out = body.replace(re, function (_, attrStr, inner) {
      var attrs = {}, am, ar = /(\w+)\s*=\s*"([^"]*)"/g;
      while ((am = ar.exec(attrStr))) attrs[am[1].toLowerCase()] = am[2];
      if (!attrs.title) {
        var leftover = attrStr.replace(/(\w+)\s*=\s*"[^"]*"/g, "").replace(/^\s*[|:]\s*/, "").trim();
        if (leftover) attrs.title = leftover;
      }
      var idx = sheets.length;
      sheets.push({ attrs: attrs, inner: inner });
      return "\n\n%%SHEET" + idx + "%%\n\n";
    });
    return { body: out, sheets: sheets };
  }

  /* ---------- build the paper-sheet markup (legacy live-render) ---------- */
  function sheetHTML(sheet, idx, meta) {
    var a = sheet.attrs;
    var seriesTitle = seriesLabel(meta.series);
    var no = a.no || a.number || meta.seriesNumber || (idx + 1);
    var title = a.title || meta.title || "";
    var subtitle = a.subtitle || "";
    var dateStr = fmtDate(meta.created);
    var innerHTML = renderMarkdown(sheet.inner.trim());
    var printIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>';
    return '' +
      '<div class="sheet-stage">' +
        '<div class="sheet-stage__label">' +
          '<span>210 × 290 mm · print-ready sheet</span><span class="line"></span>' +
          '<button class="btn-print" type="button" title="Print or save this sheet as PDF">' + printIcon + 'Save as PDF</button>' +
        '</div>' +
        '<div class="sheet" aria-label="Printable sheet: ' + esc(title) + '">' +
          '<div class="sheet__head">' +
            '<span class="sheet__series">' + esc(seriesTitle) + ' · No. ' + esc(padNo(no)) + '</span>' +
            '<span class="sheet__no">' + esc(dateStr) + '</span>' +
          '</div>' +
          '<div class="sheet__title">' + esc(title) + '</div>' +
          (subtitle ? '<div class="sheet__subtitle">' + esc(subtitle) + '</div>' : '') +
          '<div class="sheet__body">' + innerHTML + '</div>' +
          '<div class="sheet__foot">' +
            '<span class="brand">' + esc(AUTHOR.name) + (AUTHOR.handle ? ' · ' + esc(AUTHOR.handle) : '') + '</span>' +
            '<span>' + esc(seriesTitle) + ' — ' + esc(padNo(no)) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------- build sheet-image markup (new two-part structure) ---------- */
  function sheetImageHTML(imgPath, idx, total, meta) {
    var fileName = imgPath.split("/").pop();
    var seriesTitle = seriesLabel(meta.series);
    var no = meta.seriesNumber || 1;
    var pageLabel = total > 1
      ? "Page " + (idx + 1) + " of " + total
      : "";
    var dlIcon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

    return '' +
      '<div class="sheet-image-block" id="sheet-image-' + idx + '">' +
        '<div class="sheet-image-block__header">' +
          '<div class="sheet-image-block__info">' +
            '<span class="sheet-image-block__series">' + esc(seriesTitle) + ' · No. ' + esc(padNo(no)) + '</span>' +
            (pageLabel ? '<span class="sheet-image-block__page">' + esc(pageLabel) + '</span>' : '') +
          '</div>' +
          '<a class="sheet-download-btn" href="' + esc(imgPath) + '" download="' + esc(fileName) + '" title="Download this sheet as JPEG">' +
            dlIcon +
            '<span>Download Sheet' + (total > 1 ? ' (Page ' + (idx + 1) + ')' : '') + '</span>' +
          '</a>' +
        '</div>' +
        '<div class="sheet-image-block__frame">' +
          '<img class="sheet-image-block__img" src="' + esc(imgPath) + '" alt="' + esc(meta.title || "Technical sheet") + (pageLabel ? " — " + esc(pageLabel) : "") + '" loading="lazy" />' +
        '</div>' +
      '</div>';
  }

  /* ---------- render header + body ---------- */
  function renderHeader(meta) {
    document.title = (meta.title || "Post") + " — Mahmud Lawal";
    var parts = [];
    if (meta.series) parts.push('<span class="post-row__series">' + esc(seriesLabel(meta.series)) +
      (meta.seriesNumber ? " · No. " + padNo(meta.seriesNumber) : "") + "</span>");
    if (meta.created) parts.push('<time datetime="' + esc(meta.created) + '">' + esc(fmtDate(meta.created)) + "</time>");
    if (meta.readingTime) parts.push("<span>" + esc(meta.readingTime) + " read</span>");
    var metaLine = parts.join('<span class="dot-sep">•</span>');

    var showUpdated = meta.updated && meta.updated !== meta.created;
    var times = '<div class="post-header__times">' +
      (meta.created ? "<span><b>PUBLISHED</b> " + esc(fmtDateTime(meta.created)) + "</span>" : "") +
      (showUpdated ? "<span><b>UPDATED</b> " + esc(fmtDateTime(meta.updated)) + "</span>" : "") +
      "</div>";

    headerEl.innerHTML =
      '<div class="post-header__meta">' + metaLine + "</div>" +
      "<h1>" + esc(meta.title || "Untitled") + "</h1>" +
      (meta.standfirst ? '<p class="post-header__standfirst">' + esc(meta.standfirst) + "</p>" : "") +
      (meta.created ? times : "");
  }

  function renderBody(meta, body) {
    var sheetImages = meta.sheetImages;
    var hasImageSheets = Array.isArray(sheetImages) && sheetImages.length > 0;

    if (hasImageSheets) {
      /* ── New two-part structure ──
         Part 1: Render the intro prose as normal HTML (strip any <!-- sheet --> blocks) */
      var ex = extractSheets(body);
      var proseBody = ex.body;
      // Remove any %%SHEET%% placeholders that remain after stripping sheet blocks
      proseBody = proseBody.replace(/%%SHEET\d+%%/g, "").trim();
      var html = renderMarkdown(proseBody);

      /* Part 2: Append the JPEG sheet images with download buttons */
      var sheetsHTML = '<div class="sheet-images-section">';
      sheetsHTML += '<div class="sheet-images-section__divider">';
      sheetsHTML += '<span class="sheet-images-section__label">Technical Sheet</span>';
      sheetsHTML += '<span class="sheet-images-section__line"></span>';
      sheetsHTML += '</div>';
      sheetImages.forEach(function (imgPath, i) {
        sheetsHTML += sheetImageHTML(imgPath, i, sheetImages.length, meta);
      });
      sheetsHTML += '</div>';

      proseEl.innerHTML = html + sheetsHTML;
      document.body.classList.remove("has-sheets");

      // Still typeset any inline math in the prose (e.g. $ symbols in the intro)
      typeset(proseEl);
    } else {
      /* ── Legacy: live-rendered MathJax sheets ── */
      var ex2 = extractSheets(body);
      var html2 = renderMarkdown(ex2.body);
      ex2.sheets.forEach(function (s, i) {
        var sh = sheetHTML(s, i, meta);
        html2 = html2.replace("<p>%%SHEET" + i + "%%</p>", sh).replace("%%SHEET" + i + "%%", sh);
      });
      proseEl.innerHTML = html2;
      document.body.classList.toggle("has-sheets", ex2.sheets.length > 0);
      proseEl.querySelectorAll(".btn-print").forEach(function (b) {
        b.addEventListener("click", function () { window.print(); });
      });
      scaleSheets();      // first pass (pre-math)
      typeset(proseEl);   // then math + rescale
    }
  }

  function renderFooterNav() {
    footEl.innerHTML =
      '<a class="btn btn--ghost" href="blog.html">← All writing</a>' +
      '<a class="btn btn--primary" href="' + (LINKS.email || "#") + '">Get in touch</a>';
  }

  /* ---------- responsive sheet scaling (legacy live sheets) ---------- */
  function scaleSheets() {
    document.querySelectorAll(".sheet-stage").forEach(function (stage) {
      var sheet = stage.querySelector(".sheet");
      if (!sheet) return;
      sheet.style.transform = "none";
      var natW = sheet.offsetWidth || 1;
      var scale = Math.min(1, stage.clientWidth / natW);
      sheet.style.transform = "scale(" + scale + ")";
      stage.style.height = (sheet.offsetHeight * scale) + "px";
    });
  }
  function typeset(el) {
    function run() {
      return window.MathJax.typesetPromise([el]).then(scaleSheets)
        .catch(function (e) { console.warn("MathJax:", e); scaleSheets(); });
    }
    if (window.MathJax && window.MathJax.typesetPromise) { run(); return; }
    var tries = 0, iv = setInterval(function () {
      if (window.MathJax && window.MathJax.typesetPromise) { clearInterval(iv); run(); }
      else if (++tries > 200) { clearInterval(iv); scaleSheets(); }
    }, 50);
  }
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(scaleSheets, 120); });
  window.addEventListener("load", scaleSheets);

  /* ---------- load ---------- */
  var slug = getParam("slug");
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) { showError("No valid post was specified in the URL."); return; }

  Promise.all([
    fetch("content/posts.json", { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error("manifest " + r.status); return r.json(); }),
    fetch("content/posts/" + slug + ".md", { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error("post " + r.status); return r.text(); })
  ]).then(function (res) {
    var manifest = res[0], raw = res[1];
    var record = (manifest.posts || []).filter(function (p) { return p.slug === slug; })[0] || {};
    var fm = parseFrontmatter(raw);
    var meta = Object.assign({ slug: slug }, record, fm.meta);
    if (meta.number && !meta.seriesNumber) meta.seriesNumber = meta.number;
    if (meta.seriesNumber) meta.seriesNumber = parseInt(meta.seriesNumber, 10);
    renderHeader(meta);
    renderBody(meta, fm.body);
    renderFooterNav();
  }).catch(function (err) {
    console.error(err);
    var msg = /post 404/.test(String(err)) ? "That post doesn't exist (no matching .md file)."
            : "The post may not exist, or you opened this file directly instead of via a local server.";
    showError(msg);
  });
})();

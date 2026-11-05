(function () {
  "use strict";

  var menuToggle = document.getElementById("menuToggle");
  var sidebar = document.getElementById("sidebar");
  var backdrop = document.getElementById("sidebarBackdrop");
  var input = document.getElementById("searchInput");
  var results = document.getElementById("searchResults");
  var mobileNav = window.matchMedia("(max-width: 900px)");

  function syncSidebarA11y() {
    if (!sidebar) return;
    var open = document.body.classList.contains("nav-open");
    if (mobileNav.matches) {
      if (open) {
        sidebar.removeAttribute("inert");
        sidebar.setAttribute("aria-hidden", "false");
      } else {
        sidebar.setAttribute("inert", "");
        sidebar.setAttribute("aria-hidden", "true");
      }
    } else {
      sidebar.removeAttribute("inert");
      sidebar.removeAttribute("aria-hidden");
    }
  }

  function setSearchExpanded(open) {
    if (input) input.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function initSearchA11y() {
    if (!input) return;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-haspopup", "listbox");
    if (results) {
      if (!results.id) results.id = "searchResults";
      input.setAttribute("aria-controls", results.id);
      results.setAttribute("role", "listbox");
    }
    setSearchExpanded(false);
  }

  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    if (menuToggle) menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (backdrop) backdrop.hidden = !open;
    syncSidebarA11y();
  }

  initSearchA11y();
  syncSidebarA11y();
  if (typeof mobileNav.addEventListener === "function") {
    mobileNav.addEventListener("change", syncSidebarA11y);
  } else if (typeof mobileNav.addListener === "function") {
    mobileNav.addListener(syncSidebarA11y);
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setNav(!document.body.classList.contains("nav-open"));
    });
  }
  if (backdrop) {
    backdrop.addEventListener("click", function () { setNav(false); });
  }

  // Close nav on link click (mobile)
  document.querySelectorAll(".nav-link").forEach(function (a) {
    a.addEventListener("click", function () { setNav(false); });
  });

  function normalize(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pathPrefix() {
    // index.html at root vs pages/*
    var path = location.pathname.replace(/\\/g, "/");
    if (path.endsWith("/") || /\/index\.html$/i.test(path) || !/\/pages\//i.test(path)) {
      return "";
    }
    return "../";
  }

  function resolveHref(entry) {
    var prefix = pathPrefix();
    var page = entry.page || "";
    // from pages/*.html, index is ../index.html; same-folder pages keep name
    if (prefix === "../") {
      if (page === "index.html") return "../index.html" + (entry.anchor ? "#" + entry.anchor : "");
      // pages/foo.html -> foo.html
      page = page.replace(/^pages\//, "");
      return page + (entry.anchor ? "#" + entry.anchor : "");
    }
    return page + (entry.anchor ? "#" + entry.anchor : "");
  }

  function snippetAround(text, query, radius) {
    var nText = normalize(text);
    var nQ = normalize(query);
    var i = nText.indexOf(nQ);
    if (i < 0) return text.slice(0, radius * 2);
    var start = Math.max(0, i - radius);
    var end = Math.min(text.length, i + query.length + radius);
    var snip = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
    return snip;
  }

  function highlightText(text, query) {
    if (!query) return escapeHtml(text);
    try {
      var re = new RegExp("(" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      return escapeHtml(text).replace(re, "<mark>$1</mark>");
    } catch (e) {
      return escapeHtml(text);
    }
  }

  function search(q) {
    var index = window.SEARCH_INDEX || [];
    q = (q || "").trim();
    if (!q) return [];
    var nq = normalize(q);
    var scored = [];
    for (var i = 0; i < index.length; i++) {
      var e = index[i];
      var hay = normalize(e.title + " " + e.text);
      var pos = hay.indexOf(nq);
      if (pos < 0) continue;
      var score = (normalize(e.title).indexOf(nq) >= 0 ? 1000 : 0) - pos;
      scored.push({ entry: e, score: score });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 40).map(function (x) { return x.entry; });
  }

  function renderResults(q) {
    if (!results) return;
    var hits = search(q);
    if (!q.trim()) {
      results.hidden = true;
      results.innerHTML = "";
      setSearchExpanded(false);
      return;
    }
    if (!hits.length) {
      results.hidden = false;
      setSearchExpanded(true);
      results.innerHTML = '<div class="search-empty" role="status">没有匹配「' + escapeHtml(q) + '」</div>';
      return;
    }
    results.hidden = false;
    setSearchExpanded(true);
    results.innerHTML = hits.map(function (e) {
      var href = resolveHref(e);
      var snip = snippetAround(e.text, q, 42);
      return (
        '<button type="button" class="search-hit" role="option" data-href="' + escapeHtml(href) + '">' +
          '<span class="hit-title">' + highlightText(e.title, q) + "</span>" +
          '<span class="hit-snip">' + highlightText(snip, q) + "</span>" +
        "</button>"
      );
    }).join("");
  }

  function clearTempMarks(root) {
    (root || document).querySelectorAll("mark.temp-hl").forEach(function (m) {
      var t = document.createTextNode(m.textContent);
      m.parentNode.replaceChild(t, m);
    });
  }

  function highlightInElement(el, query) {
    if (!el || !query) return;
    clearTempMarks(el);
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    var re;
    try {
      re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    } catch (err) {
      return;
    }
    nodes.forEach(function (node) {
      if (!node.parentNode || /^(SCRIPT|STYLE|MARK)$/i.test(node.parentNode.tagName)) return;
      var text = node.nodeValue;
      if (!re.test(text)) return;
      re.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var last = 0;
      var m;
      while ((m = re.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var mark = document.createElement("mark");
        mark.className = "temp-hl search-mark";
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function jumpTo(href, query) {
    results.hidden = true;
    setSearchExpanded(false);
    var hash = "";
    var path = href;
    var hi = href.indexOf("#");
    if (hi >= 0) {
      path = href.slice(0, hi);
      hash = href.slice(hi + 1);
    }
    var here = location.pathname.replace(/\\/g, "/");
    var hereFile = here.split("/").pop() || "index.html";
    if (!hereFile || hereFile === "") hereFile = "index.html";
    var targetFile = path.split("/").pop() || path;

    function afterArrive() {
      var target = hash ? document.getElementById(hash) : document.getElementById("main");
      if (target) {
        target.classList.add("flash-target");
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(function () { target.classList.remove("flash-target"); }, 1700);
        highlightInElement(target, query);
      } else if (query) {
        highlightInElement(document.getElementById("main"), query);
      }
    }

    // same page
    var same =
      !path ||
      path === hereFile ||
      path === "./" + hereFile ||
      (hereFile === "index.html" && (path === "index.html" || path === "" || path === "./"));

    // compare basename
    var pathBase = (path || "").replace(/^\.\.\//, "").replace(/^pages\//, "");
    var curBase = here.includes("/pages/") ? hereFile : "index.html";
    if (path.startsWith("../")) {
      // from pages to index
      same = !here.includes("/pages/") && (pathBase === "index.html" || pathBase === "");
    } else if (!path.includes("/") && here.includes("/pages/")) {
      same = path === hereFile || pathBase === hereFile;
    } else if (path.startsWith("pages/")) {
      same = here.includes("/pages/") && path.replace(/^pages\//, "") === hereFile;
    }

    if (same && hash) {
      history.replaceState(null, "", "#" + hash);
      afterArrive();
      return;
    }
    if (same && !hash) {
      afterArrive();
      return;
    }

    // navigate away — stash query for highlight
    try {
      sessionStorage.setItem("ruNotesSearchQ", query || "");
      sessionStorage.setItem("ruNotesSearchHash", hash || "");
    } catch (e) {}
    location.href = href;
  }

  // On load: apply pending search highlight
  (function applyPending() {
    var q = "";
    var hash = location.hash.replace(/^#/, "");
    try {
      q = sessionStorage.getItem("ruNotesSearchQ") || "";
      var sh = sessionStorage.getItem("ruNotesSearchHash") || "";
      if (sh && !hash) hash = sh;
      sessionStorage.removeItem("ruNotesSearchQ");
      sessionStorage.removeItem("ruNotesSearchHash");
    } catch (e) {}
    if (hash) {
      var el = document.getElementById(hash);
      if (el) {
        setTimeout(function () {
          el.classList.add("flash-target");
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          if (q) highlightInElement(el, q);
          setTimeout(function () { el.classList.remove("flash-target"); }, 1700);
        }, 50);
      }
    } else if (q) {
      highlightInElement(document.getElementById("main"), q);
    }
  })();

  if (input) {
    var timer = null;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { renderResults(input.value); }, 120);
    });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        results.hidden = true;
        setSearchExpanded(false);
        input.blur();
      }
      if (ev.key === "Enter") {
        var first = results && results.querySelector(".search-hit");
        if (first) {
          ev.preventDefault();
          jumpTo(first.getAttribute("data-href"), input.value.trim());
        }
      }
    });
  }

  if (results) {
    results.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".search-hit");
      if (!btn) return;
      jumpTo(btn.getAttribute("data-href"), (input && input.value.trim()) || "");
    });
  }

  document.addEventListener("click", function (ev) {
    if (!results || results.hidden) return;
    if (ev.target.closest(".search-wrap")) return;
    results.hidden = true;
    setSearchExpanded(false);
  });
})();

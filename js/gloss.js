(function () {
  "use strict";

  var DICT_VERSION = "2026-11-07a";

  var dict = null;
  var popover = null;
  var openBtn = null;

  var WORD_RE = /(?:[А-Яа-яЁё]\u0301?)+(?:-[А-Яа-яЁё]\u0301?)*/g;

  var SKIP_ANCESTOR =
    ".search-wrap, .sidebar, .topbar, .skip-link, .site-footer, " +
    ".grid, .hero-actions, .crumbs, .gloss-popover, code, button.search-hit, a.tile";

  function pathPrefix() {
    var path = location.pathname.replace(/\\/g, "/");
    if (path.endsWith("/") || /\/index\.html$/i.test(path) || !/\/pages\//i.test(path)) {
      return "";
    }
    return "../";
  }

  function normKey(word) {
    return word
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ё/g, "е")
      // 词典里的 -ый/-ий 词条统一写成 -ыи/-ии，这里把 й 归一成 и 才能命中
      .replace(/й/g, "и");
  }

  function lookup(word) {
    if (!dict) return { gloss: null, lemma: normKey(word) };
    var key = normKey(word);
    if (dict[key]) return { gloss: dict[key], lemma: key, matched: key };

    var tries = [];
    if (/[ь]?ся$/.test(key)) {
      tries.push(key.replace(/ться$/, "ть"));
      tries.push(key.replace(/ться$/, ""));
      tries.push(key.replace(/сь$/, ""));
    }
    if (key.endsWith("й") && key.length > 3) tries.push(key.slice(0, -1) + "ить");
    if (key.endsWith("ит") && key.length > 4) tries.push(key.slice(0, -2) + "еть");
    if (key.endsWith("ит") && key.length > 4) tries.push(key.slice(0, -2) + "ать");
    if (key.endsWith("ю")) {
      var stemU = key.slice(0, -1);
      tries.push(stemU + "ть");
      tries.push(stemU + "ти");
      if (stemU.endsWith("а")) tries.push(stemU.slice(0, -1) + "ать");
      if (stemU.endsWith("ш")) tries.push(stemU.slice(0, -1) + "сать");
      if (stemU.endsWith("ж")) tries.push(stemU.slice(0, -1) + "зать");
    }
    if (key.endsWith("л") && key.length > 4) {
      tries.push(key.slice(0, -1) + "ть");
      tries.push(key.slice(0, -1) + "ти");
    }

    var suffixes = [
      "ами", "ями", "ах", "ях", "ов", "ев", "ей", "ам", "ям",
      "ом", "ем", "ём", "ой", "ей", "ую", "юю", "ые", "ие", "ий", "ый", "ая",
      "ое", "ии", "ью", "и", "ы", "у", "ю", "е", "а", "я", "о",
    ];
    for (var s = 0; s < suffixes.length; s++) {
      var suf = suffixes[s];
      if (key.length > suf.length + 2 && key.endsWith(suf)) {
        tries.push(key.slice(0, -suf.length));
      }
    }

    // 剥掉词尾后，把可能的原形词尾补回去再查一次：
    // 名词/形容词补 а/о/ь/я/й/ы；动词补 ть/ти/чь；-лю/-плю 类补 -ить
    var nounTails = ["а", "о", "ь", "я", "й", "ы"];
    var verbTails = ["ть", "ти", "чь"];

    function hit(t) {
      if (dict[t]) return t;
      for (var a = 0; a < nounTails.length; a++) {
        if (dict[t + nounTails[a]]) return t + nounTails[a];
      }
      for (var b = 0; b < verbTails.length; b++) {
        if (dict[t + verbTails[b]]) return t + verbTails[b];
      }
      // куплю → купить、готовлю → готовить、люблю → любить
      if (t.length > 2 && /л$/.test(t)) {
        var stem = t.slice(0, -1);
        if (dict[stem + "ить"]) return stem + "ить";
        if (dict[stem + "еть"]) return stem + "еть";
        if (dict[stem + "ать"]) return stem + "ать";
      }
      return null;
    }

    for (var i = 0; i < tries.length; i++) {
      var found = hit(tries[i]);
      if (found) return { gloss: dict[found], lemma: found, matched: found };
    }
    return { gloss: null, lemma: key, matched: null };
  }

  function shouldSkipNode(node) {
    var el = node.parentElement;
    while (el) {
      if (el.matches && el.matches(SKIP_ANCESTOR)) return true;
      if (el.classList && el.classList.contains("ru-gloss")) return true;
      var tag = el.tagName;
      if (/^(SCRIPT|STYLE|MARK|CODE|BUTTON|A)$/i.test(tag)) return true;
      if (el.id === "searchResults") return true;
      el = el.parentElement;
    }
    return false;
  }

  function wrapTextNode(node) {
    if (shouldSkipNode(node)) return;
    var text = node.nodeValue;
    if (!text || !/[А-Яа-яЁё]/.test(text)) return;

    WORD_RE.lastIndex = 0;
    if (!WORD_RE.test(text)) return;
    WORD_RE.lastIndex = 0;

    var frag = document.createDocumentFragment();
    var last = 0;
    var m;
    var changed = false;
    while ((m = WORD_RE.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var word = m[0];
      var hit = lookup(word);
      if (hit.gloss) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ru-gloss";
        btn.textContent = word;
        btn.setAttribute("lang", "ru");
        btn.setAttribute("aria-label", "显示释义：" + hit.gloss.slice(0, 24));
        frag.appendChild(btn);
        changed = true;
      } else {
        frag.appendChild(document.createTextNode(word));
      }
      last = m.index + word.length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    if (changed) node.parentNode.replaceChild(frag, node);
  }

  function walkMain() {
    if (!dict || !Object.keys(dict).length) return;
    var main = document.getElementById("main");
    if (!main) return;
    var walk = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(wrapTextNode);
  }

  function ensurePopover() {
    if (popover) return popover;
    popover = document.createElement("div");
    popover.className = "gloss-popover";
    popover.hidden = true;
    popover.setAttribute("role", "tooltip");
    popover.innerHTML =
      '<p class="gloss-ru"></p>' +
      '<p class="gloss-zh"></p>' +
      '<p class="gloss-meta"></p>' +
      '<button type="button" class="gloss-copy">复制词</button>';
    document.body.appendChild(popover);
    return popover;
  }

  function closePopover() {
    if (!popover) return;
    popover.hidden = true;
    if (openBtn) {
      openBtn.classList.remove("is-open");
      openBtn = null;
    }
  }

  function placePopover(btn) {
    var pop = ensurePopover();
    pop.hidden = false;
    var rect = btn.getBoundingClientRect();
    var margin = 8;
    pop.style.left = "0px";
    pop.style.top = "0px";
    var pw = pop.offsetWidth;
    var ph = pop.offsetHeight;
    var left = rect.left + rect.width / 2 - pw / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - pw - margin));
    var top = rect.bottom + margin;
    if (top + ph > window.innerHeight - margin) {
      top = rect.top - ph - margin;
    }
    pop.style.left = left + window.scrollX + "px";
    pop.style.top = top + window.scrollY + "px";
  }

  function showGloss(btn) {
    var word = btn.textContent || "";
    var hit = lookup(word);
    if (!hit.gloss) {
      closePopover();
      return;
    }
    var pop = ensurePopover();
    pop.querySelector(".gloss-ru").textContent = word;
    pop.querySelector(".gloss-zh").textContent = hit.gloss;
    var meta = pop.querySelector(".gloss-meta");
    var keyNow = normKey(word);
    if (hit.matched && hit.matched !== keyNow) {
      meta.textContent = "原形：" + hit.matched;
      meta.hidden = false;
    } else {
      meta.textContent = "";
      meta.hidden = true;
    }
    var copyBtn = pop.querySelector(".gloss-copy");
    copyBtn.textContent = "复制词";
    copyBtn.onclick = function (e) {
      e.stopPropagation();
      var text = word;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = "已复制";
        }, function () {
          copyBtn.textContent = "复制失败";
        });
      } else {
        copyBtn.textContent = "请手动选择";
      }
    };
    if (openBtn && openBtn !== btn) openBtn.classList.remove("is-open");
    openBtn = btn;
    btn.classList.add("is-open");
    placePopover(btn);
  }

  function onDocClick(ev) {
    if (ev.target.closest(".ru-gloss")) return;
    if (ev.target.closest(".gloss-popover")) return;
    closePopover();
  }

  function initInteraction() {
    document.addEventListener("click", onDocClick);
    document.addEventListener(
      "click",
      function (ev) {
        var btn = ev.target.closest(".ru-gloss");
        if (!btn) return;
        ev.preventDefault();
        ev.stopPropagation();
        if (openBtn === btn && popover && !popover.hidden) {
          closePopover();
          return;
        }
        showGloss(btn);
      },
      true
    );
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closePopover();
    });
    window.addEventListener(
      "resize",
      function () {
        if (openBtn && popover && !popover.hidden) placePopover(openBtn);
      },
      { passive: true }
    );
  }

  function loadDict() {
    var url = pathPrefix() + "js/ru-zh.json?v=DICT_VERSION";
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("dict");
        return r.json();
      })
      .then(function (data) {
        dict = data;
      });
  }

  function boot() {
    initInteraction();
    loadDict()
      .catch(function () {
        dict = {};
      })
      .then(function () {
        walkMain();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

/* 俄语语法笔记 · 交互增强
 * 1) 键盘：/ 聚焦搜索，↑↓ 在结果间移动
 * 2) 生词表自测：隐藏中文、点词揭示，状态存 localStorage
 * 3) 走遍俄罗斯 2 路线图：每课「学完」勾选 + 页顶进度
 */
(function () {
  "use strict";

  /* ───────── 1. 键盘操作 ───────── */
  function initKeyboard() {
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");

    document.addEventListener("keydown", function (ev) {
      var tag = (ev.target.tagName || "").toUpperCase();
      var typing = tag === "INPUT" || tag === "TEXTAREA" || ev.target.isContentEditable;

      if (ev.key === "/" && !typing && input) {
        ev.preventDefault();
        input.focus();
        input.select();
        return;
      }

      if (!results || results.hidden) return;
      if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp") return;

      var hits = Array.prototype.slice.call(results.querySelectorAll(".search-hit"));
      if (!hits.length) return;
      var at = hits.indexOf(document.activeElement);
      var next;
      if (ev.key === "ArrowDown") {
        next = at < 0 || at === hits.length - 1 ? 0 : at + 1;
      } else {
        next = at <= 0 ? hits.length - 1 : at - 1;
      }
      ev.preventDefault();
      hits[next].focus();
    });
  }

  /* ───────── 2. 生词表自测 ───────── */
  function isVocabPage() {
    var nav = document.querySelector('.nav-link.active');
    return nav ? /生词表/.test(nav.textContent) : false;
  }

  function wrapZh(li) {
    for (var i = 0; i < li.childNodes.length; i++) {
      var n = li.childNodes[i];
      if (n.nodeType !== 3) continue;
      var t = n.nodeValue;
      var m = t.match(/^([\s\S]*?)(—[\s\S]*)$/);
      if (!m) continue;
      var before = document.createTextNode(m[1]);
      var span = document.createElement("span");
      span.className = "vocab-zh";
      span.textContent = m[2];
      li.insertBefore(before, n);
      li.insertBefore(span, n);
      li.removeChild(n);
      return span;
    }
    return null;
  }

  function initVocabQuiz() {
    if (!isVocabPage()) return;
    var items = document.querySelectorAll("#main li");
    if (!items.length) return;
    var wrapped = 0;
    items.forEach(function (li) {
      if (li.querySelector(".vocab-zh")) return;
      if (wrapZh(li)) wrapped++;
    });
    if (!wrapped) return;

    var KEY = "ruNotesVocabQuiz";
    var on = false;
    try { on = localStorage.getItem(KEY) === "1"; } catch (e) {}

    var main = document.getElementById("main");
    var bar = document.createElement("div");
    bar.className = "study-toolbar";
    bar.innerHTML =
      '<button type="button" class="tool-btn" id="quizToggle">自测：隐藏中文</button>' +
      '<span class="gf-divider"></span>' +
      '<button type="button" class="tool-btn g-filter is-active" data-g="all">全部</button>' +
      '<button type="button" class="tool-btn g-filter" data-g="阳">阳性</button>' +
      '<button type="button" class="tool-btn g-filter" data-g="阴">阴性</button>' +
      '<button type="button" class="tool-btn g-filter" data-g="中">中性</button>' +
      '<span class="tool-hint" id="quizHint">点任一单词显示它的中文</span>';
    main.insertBefore(bar, main.children[1] || null);

    function apply(state) {
      document.body.classList.toggle("vocab-quiz", state);
      var btn = document.getElementById("quizToggle");
      if (btn) btn.textContent = state ? "自测中：点词显示中文" : "自测：隐藏中文";
      try { localStorage.setItem(KEY, state ? "1" : "0"); } catch (e) {}
    }

    document.getElementById("quizToggle").addEventListener("click", function () {
      var now = !document.body.classList.contains("vocab-quiz");
      if (!now) {
        document.querySelectorAll("#main li.revealed").forEach(function (li) {
          li.classList.remove("revealed");
        });
      }
      apply(now);
    });

    // 按性筛选（名词性别是记变格的第一道门槛）
    var gFilter = "all";
    function applyGender() {
      document.querySelectorAll("#main li").forEach(function (li) {
        var g = li.querySelector(".vocab-g");
        if (gFilter === "all") { li.hidden = false; return; }
        li.hidden = !(g && g.textContent.trim() === gFilter);
      });
      document.querySelectorAll("#main section.card").forEach(function (sec) {
        var any = false;
        sec.querySelectorAll("li").forEach(function (li) { if (!li.hidden) any = true; });
        sec.hidden = !any;
      });
    }
    bar.querySelectorAll(".g-filter").forEach(function (b) {
      b.addEventListener("click", function () {
        gFilter = b.getAttribute("data-g");
        bar.querySelectorAll(".g-filter").forEach(function (x) {
          x.classList.toggle("is-active", x === b);
        });
        applyGender();
      });
    });

    main.addEventListener("click", function (ev) {
      if (!document.body.classList.contains("vocab-quiz")) return;
      if (ev.target.closest(".study-toolbar")) return;
      var li = ev.target.closest("li");
      if (!li || !li.querySelector(".vocab-zh")) return;
      li.classList.toggle("revealed");
    });

    apply(on);
  }

  /* ───────── 3. 课程进度 ───────── */
  function initLessonProgress() {
    var lessons = Array.prototype.slice.call(document.querySelectorAll('section[id^="dp2-l"]'));
    if (!lessons.length) return;

    var KEY = "ruNotesLessonsDone";
    var done = {};
    try { done = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { done = {}; }
    if (Array.isArray(done)) done = {};

    var main = document.getElementById("main");
    var bar = document.createElement("div");
    bar.className = "study-toolbar lesson-bar";
    bar.innerHTML =
      '<span class="tool-hint" id="lessonProgress"></span>' +
      '<button type="button" class="tool-btn" id="lessonReset">清空进度</button>';
    main.insertBefore(bar, main.children[1] || null);

    function refresh() {
      var n = 0;
      lessons.forEach(function (sec) {
        if (done[sec.id]) { sec.classList.add("lesson-done"); n++; }
        else sec.classList.remove("lesson-done");
        var b = sec.querySelector(".lesson-done-btn");
        if (b) {
          b.textContent = done[sec.id] ? "✓ 已学完" : "标记为学完";
          b.classList.toggle("is-done", !!done[sec.id]);
        }
      });
      var el = document.getElementById("lessonProgress");
      if (el) el.textContent = "进度：" + n + " / " + lessons.length + " 课";
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
    }

    lessons.forEach(function (sec) {
      var h2 = sec.querySelector("h2");
      if (!h2) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lesson-done-btn";
      b.textContent = "标记为学完";
      b.addEventListener("click", function () {
        done[sec.id] = !done[sec.id];
        refresh();
      });
      h2.appendChild(b);
    });

    var reset = document.getElementById("lessonReset");
    if (reset) {
      reset.addEventListener("click", function () {
        done = {};
        refresh();
      });
    }

    refresh();
  }

  function boot() {
    initKeyboard();
    initVocabQuiz();
    initLessonProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

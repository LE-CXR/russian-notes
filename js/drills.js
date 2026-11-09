/* 走遍俄罗斯 2 · 逐课自测题
 * 数据：js/drills.json（每次 8 题，7 课共 56 题）
 * 交互：选项即判，正确/错误即时反馈，附讲解；结果存 localStorage
 */
(function () {
  "use strict";

  var STORE = "ruNotesDrills";
  var state = {};            // "lesson-index" -> {pick:n, ok:bool}
  var data = null;

  try { state = JSON.parse(localStorage.getItem(STORE) || "{}") || {}; } catch (e) { state = {}; }

  function prefix() {
    var path = location.pathname.replace(/\\/g, "/");
    if (path.endsWith("/") || /\/index\.html$/i.test(path) || !/\/pages\//i.test(path)) return "";
    return "../";
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function blankHtml(q) {
    // 把题干里的 ___ 渲染成高亮空位
    return esc(q).replace(/_{2,}/g, '<span class="drill-blank">?</span>');
  }

  function stats() {
    var total = 0, done = 0, ok = 0;
    Object.keys(data).forEach(function (k) {
      data[k].items.forEach(function (_, i) {
        total++;
        var s = state[k + "-" + i];
        if (s) { done++; if (s.ok) ok++; }
      });
    });
    return { total: total, done: done, ok: ok };
  }

  function renderStats() {
    var s = stats();
    var el = document.getElementById("drillStats");
    if (!el) return;
    var rate = s.done ? Math.round((s.ok / s.done) * 100) : 0;
    el.innerHTML =
      '<span class="drill-stat"><b>' + s.done + "</b> / " + s.total + " 已答</span>" +
      '<span class="drill-stat">正确 <b>' + s.ok + "</b></span>" +
      '<span class="drill-stat">正确率 <b>' + rate + "%</b></span>" +
      '<button type="button" class="tool-btn" id="drillReset">清空成绩</button>';
    var btn = document.getElementById("drillReset");
    if (btn) {
      btn.addEventListener("click", function () {
        state = {};
        save();
        document.querySelectorAll(".drill-item").forEach(function (it) {
          it.classList.remove("is-right", "is-wrong");
          it.querySelectorAll(".drill-opt").forEach(function (b) {
            b.classList.remove("is-pick", "is-correct");
          });
          var tip = it.querySelector(".drill-tip");
          if (tip) tip.hidden = true;
        });
        renderStats();
      });
    }
  }

  function buildItem(lessonKey, idx, q) {
    var key = lessonKey + "-" + idx;
    var box = document.createElement("div");
    box.className = "drill-item";
    box.setAttribute("data-key", key);

    var p = document.createElement("p");
    p.className = "drill-q";
    p.innerHTML = '<span class="drill-no">' + (idx + 1) + ".</span> " + blankHtml(q.q);
    box.appendChild(p);

    var opts = document.createElement("div");
    opts.className = "drill-opts";
    q.options.forEach(function (text, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "drill-opt";
      b.setAttribute("data-i", i);
      b.innerHTML = '<span class="drill-key">' + (i + 1) + "</span>" + esc(text);
      b.addEventListener("click", function () { pick(box, q, i, text); });
      opts.appendChild(b);
    });
    box.appendChild(opts);

    var tip = document.createElement("p");
    tip.className = "drill-tip";
    tip.hidden = true;
    tip.innerHTML = '<span class="drill-tip-label">讲解</span>' + esc(q.tip);
    box.appendChild(tip);

    return box;
  }

  function pick(box, q, i, text) {
    if (box.classList.contains("is-right")) return;   // 已答对不再改
    var opts = box.querySelectorAll(".drill-opt");
    opts.forEach(function (b) { b.classList.remove("is-pick"); });
    opts[i].classList.add("is-pick");

    var ok = i === q.answer;
    box.classList.toggle("is-right", ok);
    box.classList.toggle("is-wrong", !ok);
    opts.forEach(function (b) { b.classList.remove("is-correct"); });
    if (ok) opts[i].classList.add("is-correct");
    else opts[q.answer].classList.add("is-correct");

    var tip = box.querySelector(".drill-tip");
    if (tip) {
      tip.hidden = false;
      tip.classList.toggle("tip-ok", ok);
    }

    state[box.getAttribute("data-key")] = { pick: i, ok: ok };
    save();
    renderStats();
  }

  function render() {
    var app = document.getElementById("drillApp");
    if (!app) return;
    if (!data) {
      app.innerHTML = '<p class="muted">题目加载失败，请刷新页面。</p>';
      return;
    }
    var html = "";
    Object.keys(data).forEach(function (k) {
      var lesson = data[k];
      html += '<section class="card" id="drill-' + k + '" data-searchable>' +
        '<h2>' + esc(lesson.title) + "<span class=\"drill-count\">" + lesson.items.length + " 题</span></h2>" +
        '<div class="drill-list" data-lesson="' + k + '"></div></section>';
    });
    app.innerHTML = html;

    Object.keys(data).forEach(function (k) {
      var host = app.querySelector('[data-lesson="' + k + '"]');
      data[k].items.forEach(function (q, i) {
        host.appendChild(buildItem(k, i, q));
      });
    });

    // 回填历史作答
    Object.keys(state).forEach(function (key) {
      var m = key.match(/^(.+)-(\d+)$/);
      if (!m) return;
      var box = app.querySelector('[data-key="' + key + '"]');
      if (!box) return;
      var lesson = data[m[1]];
      if (!lesson) return;
      var q = lesson.items[+m[2]];
      if (!q) return;
      var s = state[key];
      var opts = box.querySelectorAll(".drill-opt");
      if (!opts[s.pick]) return;
      pick(box, q, s.pick, q.options[s.pick]);
    });

    renderStats();
  }

  function boot() {
    fetch(prefix() + "js/drills.json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { data = d; render(); })
      .catch(function () { data = null; render(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

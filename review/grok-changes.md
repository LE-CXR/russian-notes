# Grok round 1 — content & site fixes

Branch: `grok/russian-notes-fixes` → `main` (PR open, **not merged**).

Waiting for **Codex Russian review** and **web QA** before merge.

## Summary of changes

| # | Requirement | What we did |
|---|-------------|-------------|
| 1 | `перево́дить` → `переводи́ть` | Updated imperfective infinitive in `pages/verbs.html` (体对表、原笔记体对表、格支配语境), `pages/case-endings.html`, `pages/verb-gov.html`, `pages/vocab.html`. Present forms `перево́дишь` / `перево́дят` kept on new conjugation table. |
| 2 | `пишу́ письма́` → `пишу́ пи́сьма` | Fixed example in `pages/verbs.html` (НСВ habit sentence). |
| 3 | Genitive `письмо́` → `письма́` | Fixed 二格单数 example in `pages/case-endings.html` (`письмо́ → письма́`; plural `пи́сьма` / `пи́сем` unchanged). |
| 4 | `нравиться` plural | Filled нравиться column on `pages/nravitsya.html`: «Мне нра́вятся э́ти пе́сни / фи́льмы / зда́ния.» |
| 5 | Урок 14 homework verbs (6 persons) | Added block `#conj-lesson14` on `pages/verbs.html` with full tables for **пригласи́ть**, **перевести́** (+ **переводи́ть** present), **найти́**; **поня́ть** and **смочь** already in `#conj-ponyat` / `#conj-moch`. Expanded §21.4–21.5 in same file. |
| 6 | ~390px table overflow | `css/style.css`: `@media (max-width: 430px)` clips page overflow, constrains `.table-scroll` width, keeps horizontal scroll inside cards. |
| 7 | Sidebar / search a11y | `js/main.js`: mobile sidebar gets `inert` + `aria-hidden` when closed; search input is `role=combobox` with `aria-controls`, `aria-expanded`; results `listbox`, hits `option`. |
| 8 | Regenerate search index | Added `_build.py`; ran `python3 _build.py` → `js/search-index.js` (106 entries). |
| 9 | This file | `review/grok-changes.md` |

## Files touched

- `pages/verbs.html`, `pages/case-endings.html`, `pages/verb-gov.html`, `pages/nravitsya.html`, `pages/vocab.html`
- `css/style.css`, `js/main.js`, `js/search-index.js`
- `_build.py` (new), `review/grok-changes.md` (new)

## Verification (local)

- `python3 _build.py` — completes, writes 106 index entries.
- Search index spot-check (normalized substring in title+text):
  - `ждать` — hits (e.g. vocab / gov tables)
  - `нравятся` — hit on verb gov / special-conj extras
  - `приглас` — hits (command / conjugation sections)
  - `переводи` — hits; **no** remaining `перево́дить` in index
  - `письма` — hits including genitive `письма́` in case-endings text
- `grep перево́дить` across repo (excluding this review note): **0** in HTML after edits.
- Manual code review: GitHub Pages paths unchanged (`index.html`, `pages/*.html`, anchors preserved).

## Not verified in this run

- Real device 390px layout (CSS-only review).
- Full browser pass on https://le-cxr.github.io/russian-notes/ after deploy.
- Native Russian proofreading of all stress marks and Chinese glosses.

## Russian / content uncertainties

- Whether `pages/vocab.html` should use stressed **`переводи́ть`** everywhere vs unstressed lemma in OCR-style lists (we stressed the two verb-list lines tied to grammar).
- `search-index.js` text is auto-stripped from HTML; some entries are long and may duplicate section titles (acceptable for search, not for print).
- Homework block uses `<h4>` subheads under `#conj-lesson14`; search indexes the whole `#special-conj` section (h3 anchors only in `_build.py`).

## Status

**Waiting for Codex Russian review + QA** — do not merge until those pass.

---

## Round 1b — `гото́вить` / `пригото́вить` conjugation (2026-11-02)

### Change
- Added **`#conj-gotovit`** under「特殊变位表」on `pages/verbs.html`: six-person **гото́вить** (present + past note), **пригото́вить** (СВ future), and **купи́ть** comparison row; Chinese note on **л**-insertion (like **куплю́**); examples «Я гото́влю у́жин.» / «За́втра я пригото́влю торт.»
- In-page nav (`toc-local`): link **готовить · 准备** → `#conj-gotovit`.
- 体对表 remark points to `#conj-gotovit`; §21.5 expanded **купи́ть** (full 6) + **гото́вить** line.
- `_build.py` extras + `python3 _build.py` → **107** index entries; anchor **`conj-gotovit`** indexed.

### Verification
- Search index: **готов** / **готовлю** / **准备** return hits (including `#conj-gotovit` title «гото́вить / пригото́вить — 准备、做饭»).

### Status (unchanged)
**Waiting for Codex Russian review + QA** — PR #1 still **not merged**.

---

## Round 1c — `есть` / `съесть` · `пить` / `вы́пить` (2026-11-02)

### Change
- Added **`#conj-est`** and **`#conj-pit`** under「特殊变位表」on `pages/verbs.html` (same pattern as `#conj-gotovit`): full present/future tables, past & imperative lines, Chinese notes (е-/ед-；别和「有」的 есть 混；и→ь、вы́- 写 е；四格/二格), and learner examples.
- `toc-local`: **есть · 吃** → `#conj-est`, **пить · 喝** → `#conj-pit`.
- 体对表 remarks point to the new anchors.
- `_build.py` search extras updated; `python3 _build.py` regenerates index.

### Verification
- Search index spot-check: **есть** / **ем** / **吃** and **пить** / **пью** / **喝** return hits; dedicated entries for anchors **`conj-est`**, **`conj-pit`**.

### Status (unchanged)
**Waiting for Codex Russian review + QA** — PR #1 still **not merged**.

---

## Round 1d — `боле́ть`（生病 / 疼）(2026-11-02)

### Change
- Added **`#conj-bolet`** under「特殊变位表」on `pages/verbs.html`: (1) illness/fandom **I** conjugation боле́ю…боле́ют + **творительный** / **за + 4** examples; (2) pain **II** **боли́т / боля́т** + **у + 2** examples; shared past; Chinese tip distinguishing the two.
- `toc-local`: **болеть · 生病/疼** → `#conj-bolet`.
- `_build.py` extras updated; `python3 _build.py` regenerates index.

### Verification
- Search index: **болеть** / **болит** / **生病** / **疼** return hits; anchor **`conj-bolet`** indexed.

### Cyrillic audit (follow-up)
- Scanned `pages/verbs.html` and `js/search-index.js` for tokens mixing Latin and Cyrillic (including homoglyphs in `#conj-bolet`): **no issues in repo**.
- On-disk forms are pure Cyrillic: **гри́ппом**, **боли́т**, **боля́т**, **голова́**, **зу́бы**.
- Mixed Latin/Cyrillic in an earlier **agent chat summary** was not present in committed HTML/JS. Re-ran `python3 _build.py` (110 entries, unchanged).

### Status (unchanged)
**Waiting for Codex Russian review + QA** — PR #1 still **not merged**.

---

## Round 2 — 「格的用法」专页 + 缺词 / 变位（2026-11-05）

### Change
- **New** `pages/case-usage.html`：六格何时用、方向三角（куда/где/откуда/к кому）、笔记 p-07～p-10 例句；链到 `cases-ask.html`、`case-endings.html`、`verb-gov.html`、`motion.html` 等，不重复词尾表。
- **Nav**：侧栏（全部页面 + `index.html`）与首页 tile「格的用法」。
- **`pages/verbs.html`**：`#conj-sovetovatsya`、`#conj-brat-vzyat`、`#conj-postupit`；体对表补 `поступа́ть/поступи́ть`、`брать/взять` 锚点；`toc-local` 链接。
- **`pages/vocab.html`**：`#vocab-supplement`（одевать/надевать、кровать、товарищ、нужен…、副词、не́где/не́когда 等）；Урок 13 `брать` 链变位；主题速查补词。
- **`_build.py`**：case-usage / vocab-supplement / special-conj 搜索 extras；`python3 _build.py` → **126** index entries.

### Verification
- Mixed Latin/Cyrillic scan on `*.html` `class="ru"` spans: **0** issues.
- Search spot-check：`格的用法` → `case-usage-overview`；`кем` / `нет` / `поступ` / `напрокат` — hits.
- **Not merged** to `main`.

### Status (unchanged)
**Waiting for Codex Russian review + QA** — PR #1 still **not merged**.

---

## Round 3 — 点击俄语词显示中文释义（2026-11-05）

Branch: `grok/click-gloss` → `main`.

### Change
- **`js/gloss.js`**：在 `#main` 内运行时切分西里尔词为 `button.ru-gloss`；点击弹出释义；Esc / 点外部关闭；跳过侧栏、搜索、章节目录 grid、code、链接等。
- **`js/ru-zh.json`**：离线 RU→ZH 词典（`python3 _build_dict.py` 从生词表、体对表、笔记 inline「词 中文」等抽取，约 **979** 词条）。
- **`_build_dict.py`**：词典生成脚本；重音归一化；ё→е。
- **`css/style.css`**：虚线下划线可点样式 + `.gloss-popover` 纸面风浮层。
- **全部 17 个 HTML**：在 `main.js` 前引入 `gloss.js`（保留 `search-index.js` 顺序不变）。

### Lookup
- 先查归一化 surface form，再试简单词尾 / 反身 / 现在时（-ю→-ать 等）启发式。
- 未命中：浮层显示归一化 lemma + 「暂无词条」。

### Verification
- 本地 HTTP + 浏览器：`поступи́ть` → 升学；进入；`давать` → 给；交给；Esc / 外部点击关闭。
- `python3 _build_dict.py` → 979 lemmas；`python3 _build.py` 未改（搜索索引无需重建）。
- 主内容 `#main` 外 footer `.ru` 不包裹（避免页脚误点）。

### Gaps (sample)
- 约 645 / 1611 个 distinct 归一化 token 无 direct 词条；变位/格变形式依赖启发式或显示「暂无词条」。可后续从变位表批量写入 `_build_dict.py`。

---

## Round 4 — 名词的说明专节（2026-11-05）

Branch: `grok/noun-modifiers` → `main`.

### Change
- **`pages/case-usage.html`**：`#noun-modifiers`（с/без、名词+二格、для/от/о/в/у/на、形容词、速记表）；页内 TOC「名词的说明」；五格 `с/без` 链到该节。
- **`_build.py`**：`noun-modifiers` 搜索 extra；`python3 _build.py` → **131** entries.
- **`js/search-index.js`**、**`js/ru-zh.json`**  regenerated.

### Verification
- Search：`名词的说明` / `чашка` / `с газом` — should hit `#noun-modifiers`.
- Gloss unchanged on new `.ru` spans.

---

## Round 5 — 纠正 `без` 只接二格（2026-11-05）

Branch: `grok/bez-genitive-fix` → `main`.

### Change
- **`pages/case-usage.html`**：总览五格行去掉 `с/без`；二格行标明 **без 只接二格**；`#usage-ins` 仅 `с + 5`，`без` 链二格；`#mod-s-bez` 强调 **без 永远 + 二格**；速记表「不带 → без + 二格」。
- **`pages/prepositions.html`**、**`pages/appendix.html`**：同样区分 `с` / `без`。
- **`python3 _build.py`** — search index refresh.

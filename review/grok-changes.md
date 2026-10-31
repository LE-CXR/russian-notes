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

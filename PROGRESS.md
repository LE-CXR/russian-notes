# PROGRESS — 俄语语法笔记站

## 2026-11-07 · 翻译错误修复 + 交互升级 + 新教材讲义

**结论**：词典错译与「点词无反应」两个系统性问题已修完；交互补了中文反查、错题本、
生词自测、性别筛选；按《走遍俄罗斯》第 2 册补了 7 课讲义与 70 道自测题。

**根因**（记下来免得重犯）：
- `_build_dict.py` 用「表格最后一格当中文释义」抽取，把整段例句译文配给同一行所有
  俄语词 → `автобус=票`、`армия=兵马俑`、`вы=您想要什么甜点`。已加 `looks_like_sentence()`
  质量闸门 + 覆盖保护（现有 1833 条不再被脚本覆盖，除非 `--force`）。
- `gloss.js` 只做直接匹配 + 动词词尾，**所有变格变位形式都查不到**。已加词尾回补
  （名词 а/о/ь/я/й/ы，动词 ть/ти/чь，-лю→-ить）与 `й→и` 归一。
- 词典 `fetch` 会被浏览器缓存，改完看不到效果；已加版本参数。

**涉及文件**：`js/ru-zh.json`(1049→1833)、`js/gloss.js`、`js/main.js`、`js/enhance.js`、
`js/drills.{js,json}`、`pages/lesson-1…7.html`、`pages/drills.html`、`pages/doroga-2.html`、
`pages/vocab.html`、`css/style.css`、`_build_dict.py`。

**坑**：本地 main 与远端曾无 merge base（远端由 PR 重建），推前必须 `git fetch` 比对；
本地起服务验证后记得 kill（`netstat` 看 pid，不是 wrapper 的 pid）。

**下一步（未做）**：生词表按新教材 7 课重排；讲义导 PDF；题库继续扩。

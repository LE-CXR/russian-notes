# 俄语语法笔记（可搜索静态站）

中文界面说明 + 俄语例词。纯 HTML/CSS/JS，**无 Node 构建产物依赖**，可直接用浏览器打开，也可部署到 GitHub Pages。

教材：《В добрый путь!》Часть 2 · 深北莫数理笔记整理。

## 本地打开

### 方式一：直接打开（推荐试读）

用浏览器打开本目录下的 `index.html` 即可：

- macOS：`open index.html`
- Windows：双击 `index.html`
- Linux：`xdg-open index.html`

侧边菜单、顶部搜索（中文 / 俄语）在 `file://` 下均可使用（搜索索引已内嵌在 `js/search-index.js`）。

### 方式二：本地静态服务器（可选）

```bash
cd russian-notes-site
python3 -m http.server 8080
# 浏览器打开 http://127.0.0.1:8080/
```

## 站点结构

```
russian-notes-site/
├── index.html          # 首页与目录
├── README.md
├── css/style.css       # 样式（含手机适配）
├── js/main.js          # 菜单 + 搜索跳转高亮
├── js/search-index.js  # 前端搜索索引（内嵌）
└── pages/
    ├── verbs.html      # ★ 动词专区（体对 / 变位 / 格支配）
    ├── cases-ask.html  # 格与提问词
    ├── pronouns.html   # 代词
    ├── noun-plural.html
    ├── case-endings.html
    ├── prepositions.html
    ├── adjectives.html
    ├── nravitsya.html
    ├── motion.html
    ├── time.html
    ├── imperative.html
    ├── verb-gov.html
    ├── tense.html
    ├── vocab.html
    └── appendix.html
```

## 动词专区亮点

- **НСВ / СВ**：区别、何时用、常用体对表（含 давать/дать、понимать/понять、идти/пойти、мочь/смочь 等）
- **特殊变位**：дать、давать、понять、рассказать、хотеть、мочь/смочь
- **动词→几格支配表**：动词｜几格｜提问词｜例句｜中文；突出三格 vs 四格（及 у/нет/из→二格）

## 推到 GitHub 并开启 Pages

仓库目标：`LE-CXR/russian-notes`

```bash
# 若尚未建仓：在 GitHub 上新建空仓库 LE-CXR/russian-notes（不要勾选自动加 README，或之后再合）

cd russian-notes-site
git init
git add .
git commit -m "Add searchable static Russian grammar notes site"
git branch -M main
git remote add origin git@github.com:LE-CXR/russian-notes.git
# 或 HTTPS：
# git remote add origin https://github.com/LE-CXR/russian-notes.git
git push -u origin main
```

开启 GitHub Pages：

1. 打开 https://github.com/LE-CXR/russian-notes/settings/pages  
2. **Source** 选 **Deploy from a branch**  
3. Branch 选 `main`，文件夹选 `/ (root)`  
4. 保存后等待一两分钟  
5. 访问：`https://LE-CXR.github.io/russian-notes/`（用户名/组织名以实际为准）

> 本站入口是根目录 `index.html`，Pages 选仓库根即可，无需 Actions / 构建步骤。

## 如何验证

1. 打开 `index.html`，首页可见章节磁贴与「动词专区」入口。  
2. 点侧边或磁贴进入 `pages/verbs.html`，确认有：体对说明、体对表、特殊变位、格支配表。  
3. 顶部搜索「дать」或「三格」或「куда」，应出现结果；点击后跳转并高亮相关段落。  
4. 缩小窗口宽度，点左上角 ☰，侧边菜单应滑出。  

## 内容来源

笔记原文：`../russian-study-notes/俄语语法笔记-整理版.md`  
重新生成页面时可运行同目录下的 `_build.py`（可选维护脚本，**浏览站点不需要运行它**）。

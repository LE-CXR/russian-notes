#!/usr/bin/env python3
"""Build offline js/ru-zh.json from vocab lists and grammar tables in HTML."""

from __future__ import annotations

import json
import re
import unicodedata
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "js" / "ru-zh.json"
HTML_FILES = [ROOT / "index.html", *sorted((ROOT / "pages").glob("*.html"))]

CYR_WORD = re.compile(r"^[А-Яа-яЁё][А-Яа-яЁё\u0301\-]*$", re.UNICODE)


def norm_key(word: str) -> str:
    w = unescape(word).strip().strip("«»\"'!?….")
    w = unicodedata.normalize("NFD", w.lower())
    w = re.sub(r"[\u0300-\u036f]", "", w)
    w = w.replace("ё", "е")
    return w


def add_entry(d: dict[str, str], ru: str, zh: str, *, force: bool = False) -> None:
    ru = ru.strip()
    zh = zh.strip()
    if not ru or not zh:
        return
    if not re.search(r"[А-Яа-яЁё]", ru):
        return
    if len(zh) > 80:
        return
    key = norm_key(ru)
    if not key:
        return
    if len(key) == 1 and key not in ("я", "у", "в", "к", "с", "о", "и", "а"):
        return
    if key in d and not force:
        if len(d[key]) <= 40:
            return
    d[key] = zh


def split_ru_lemmas(blob: str) -> list[str]:
    blob = re.sub(r"\([^)]*\)", " ", blob)
    blob = blob.replace("★", " ")
    parts = re.split(r"\s*[/·,;]\s*|\s+/\s+", blob)
    out: list[str] = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        p = re.sub(r"\s*\([^)]*\)\s*", " ", p).strip()
        for token in re.findall(r"[А-Яа-яЁё][А-Яа-яЁё\u0301\-]*", p):
            if CYR_WORD.match(token) or re.match(r"^[А-Яа-яЁё]", token):
                out.append(token)
    return out


def extract_vocab_lists(html: str, d: dict[str, str]) -> None:
    for m in re.finditer(
        r"<li>\s*<strong>(.*?)</strong>.*?[—–-]\s*(.*?)</li>",
        html,
        re.I | re.S,
    ):
        ru_blob = strip_tags(m.group(1))
        zh = strip_tags(m.group(2))
        zh = re.split(r"[（(]", zh)[0].strip()
        for lemma in split_ru_lemmas(ru_blob):
            add_entry(d, lemma, zh, force=True)


def extract_ru_zh_inline(html: str, d: dict[str, str]) -> None:
    chunk_pat = re.compile(r"<(?:p|td|th|span)\b[^>]*>(.*?)</(?:p|td|th|span)>", re.I | re.S)
    inline = re.compile(
        r"([А-Яа-яЁё][А-Яа-яЁё\u0301\-]{0,24})\s+([\u4e00-\u9fff][\u4e00-\u9fff·/（）()、，\s]{0,36})"
    )
    for m in chunk_pat.finditer(html):
        text = strip_tags(m.group(1))
        if len(text) > 200:
            continue
        for im in inline.finditer(text):
            zh = im.group(2).strip().strip("·")
            if len(zh) > 40 or "\n" in zh:
                continue
            add_entry(d, im.group(1), zh)


def extract_aspect_pairs(html: str, d: dict[str, str]) -> None:
    for row in re.finditer(r"<tr\b[^>]*>(.*?)</tr>", html, re.I | re.S):
        row_html = row.group(1)
        cells = re.findall(r"<td\b[^>]*>(.*?)</td>", row_html, re.I | re.S)
        if len(cells) < 3:
            continue
        zh = strip_tags(cells[2])
        if not re.search(r"[\u4e00-\u9fff]", zh):
            continue
        for i in (0, 1):
            for lemma in split_ru_lemmas(strip_tags(cells[i])):
                add_entry(d, lemma, zh, force=True)


def extract_gov_table(html: str, d: dict[str, str]) -> None:
    for row in re.finditer(r"<tr\b[^>]*>(.*?)</tr>", html, re.I | re.S):
        cells = re.findall(r"<td\b[^>]*>(.*?)</td>", row.group(1), re.I | re.S)
        if len(cells) < 2:
            continue
        left = strip_tags(cells[0])
        if re.search(r"[\u4e00-\u9fff]", left) and not re.search(r"[А-Яа-яЁё]", left):
            zh = left
            for lemma in split_ru_lemmas(strip_tags(cells[1])):
                add_entry(d, lemma, zh)


def strip_tags(html: str) -> str:
    html = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", unescape(html)).strip()


MANUAL: dict[str, str] = {
    "куда": "往哪里去（方向）",
    "где": "在哪里",
    "откуда": "从哪里",
    "кого": "谁（宾格）",
    "чего": "什么（二格）",
    "кому": "给谁（与格）",
    "кем": "和谁一起；用……（工具格）",
    "чем": "用什么",
    "когда": "什么时候",
    "зачем": "为什么（目的）",
    "почему": "为什么",
    "сколько": "多少",
    "как": "怎样",
    "какой": "什么样的",
    "какая": "什么样的（阴）",
    "какое": "什么样的（中）",
    "какие": "什么样的（复）",
    "чей": "谁的",
    "что": "什么",
    "кто": "谁",
    "несовершенный": "未完成体",
    "совершенный": "完成体",
    "вид": "体",
    "урок": "课",
    "часть": "部分",
    "путь": "路；旅途",
    "добрый": "好的",
    "буду": "我将（将来时助动词）",
    "будешь": "你将",
    "будет": "他/她将",
    "будем": "我们将",
    "будете": "你们将",
    "будут": "他们将",
    "поступить": "进入（学习）；行事",
    "поступи": "进入吧（命令式）",
    "поступаю": "我进入/行事",
    "поступаешь": "你进入",
    "поступает": "他进入",
    "поступаем": "我们进入",
    "поступаете": "你们进入",
    "поступают": "他们进入",
    "поступлю": "我将进入",
    "поступишь": "你将进入",
    "поступит": "他将进入",
    "поступим": "我们将进入",
    "поступите": "你们将进入",
    "поступят": "他们将进入",
}


def build_dict() -> dict[str, str]:
    d: dict[str, str] = dict(MANUAL)
    for html_file in HTML_FILES:
        raw = html_file.read_text(encoding="utf-8")
        extract_vocab_lists(raw, d)
        extract_ru_zh_inline(raw, d)
        if html_file.name == "verbs.html":
            extract_aspect_pairs(raw, d)
    return dict(sorted(d.items(), key=lambda x: x[0]))


def main() -> None:
    d = build_dict()
    OUT.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(d)} lemmas to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

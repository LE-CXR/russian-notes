#!/usr/bin/env python3
"""Regenerate js/search-index.js from HTML [data-searchable] sections."""

from __future__ import annotations

import json
import re
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "js" / "search-index.js"

HTML_FILES = [ROOT / "index.html", *sorted((ROOT / "pages").glob("*.html"))]

EXTRA_TEXT: dict[tuple[str, str], str] = {
    ("pages/verbs.html", "aspect"): "давать дать понимать понять",
    ("pages/verbs.html", "aspect-pairs"): (
        "давать дать понимать понять рассказывать рассказать идти пойти "
        "мочь смочь нравиться понравиться говорить сказать писать написать "
        "читать прочитать делать сделать смотреть посмотреть учить выучить "
        "переводи́ть перевести пригласить понять найти"
    ),
    ("pages/verbs.html", "special-conj"): (
        "дам дашь даст пойму хочу могu смогu приглашu переведu найdu "
        "пригласить понять перевести смочь найти conj-lesson14 Урок 14"
    ),
    ("pages/verbs.html", "case-gov"): (
        "дать помогать звонить нравиться нравятся видеть любить "
        "спросить читать ждать подождать кого у нет из переводи́ть"
    ),
    ("index.html", "how-to-use"): "搜索 菜单 动词专区",
}

EXTRA_TEXT[("pages/verbs.html", "special-conj")] = (
    EXTRA_TEXT[("pages/verbs.html", "special-conj")]
    .replace("могu", "могу")
    .replace("смогu", "смогу")
    .replace("приглашu", "приглашу")
    .replace("переведu", "переведу")
    .replace("найdu", "найду")
)


def page_path(html_file: Path) -> str:
    return html_file.relative_to(ROOT).as_posix()


def strip_tags(html: str) -> str:
    html = re.sub(r"<script\b[^>]*>.*?</script>", " ", html, flags=re.I | re.S)
    html = re.sub(r"<style\b[^>]*>.*?</style>", " ", html, flags=re.I | re.S)
    html = re.sub(r"<br\s*/?>", " ", html, flags=re.I)
    html = re.sub(r"</(p|div|li|tr|h[1-6]|td|th|section)>", " ", html, flags=re.I)
    html = re.sub(r"<[^>]+>", " ", html)
    text = unescape(html)
    return re.sub(r"\s+", " ", text).strip()


def section_main_title(section_html: str) -> str:
    for tag in ("h1", "h2", "h3"):
        m = re.search(rf"<{tag}\b[^>]*>(.*?)</{tag}>", section_html, re.I | re.S)
        if m:
            return strip_tags(m.group(1))
    return "Section"


def section_blocks(html: str) -> list[tuple[str, str]]:
    pattern = re.compile(
        r'<section\b(?=[^>]*\bdata-searchable\b)(?=[^>]*\bid="([^"]+)")[^>]*>(.*?)</section>',
        re.I | re.S,
    )
    return [(m.group(1), m.group(2)) for m in pattern.finditer(html)]


def build_index() -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    for html_file in HTML_FILES:
        raw = html_file.read_text(encoding="utf-8")
        page = page_path(html_file)
        for sec_id, sec_html in section_blocks(raw):
            main_title = section_main_title(sec_html)
            main_text = strip_tags(sec_html)
            extra = EXTRA_TEXT.get((page, sec_id), "")
            if extra:
                main_text = f"{main_text} {extra}".strip()
            entries.append(
                {
                    "page": page,
                    "anchor": sec_id,
                    "title": main_title,
                    "text": main_text[:8000],
                }
            )

            for m in re.finditer(
                r'<h3\b[^>]*\bid="([^"]+)"[^>]*>(.*?)</h3>',
                sec_html,
                re.I | re.S,
            ):
                anchor = m.group(1)
                sub_title = strip_tags(m.group(2))
                start = m.end()
                nxt = re.search(r"<h3\b", sec_html[start:], re.I)
                chunk = sec_html[start : start + nxt.start()] if nxt else sec_html[start:]
                sub_text = strip_tags(chunk)
                entries.append(
                    {
                        "page": page,
                        "anchor": anchor,
                        "title": sub_title,
                        "text": f"{sub_title} {main_title} {sub_text}".strip()[:8000],
                    }
                )
    return entries


def main() -> None:
    index = build_index()
    payload = json.dumps(index, ensure_ascii=False, indent=2)
    OUT.write_text(f"window.SEARCH_INDEX = {payload};\n", encoding="utf-8")
    print(f"Wrote {len(index)} entries to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

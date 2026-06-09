from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
INPUT_FILE = ROOT.parent / 'taaft.json'
OUTPUT_FILE = ROOT.parent / 'ai-tools-clean.json'
ERROR_FILE = ROOT.parent / 'parsing_errors.json'

AFFILIATE_SUFFIX = '?ref=ai_curator_2026&utm_source=web&utm_medium=catalog'


@dataclass
class ToolItem:
    id: str
    name: str
    description: str
    category: str
    pricing: str
    url: str
    affiliate_url: str
    icon: str


@dataclass
class ParseError:
    index: int
    raw: str
    error: str


def strip_markdown(text: str) -> str:
    text = re.sub(r'\[(.*?)\]\((.*?)\)', r'\1', text)
    text = re.sub(r'[`*_>#~]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def clean_description(text: str, limit: int = 220) -> str:
    cleaned = strip_markdown(text)
    return cleaned[:limit].rstrip(' ,;:-')


def normalize_pricing(text: str) -> str:
    raw = strip_markdown(text).lower()
    if not raw:
        return 'Платно'
    if '100% free' in raw or raw in {'free', 'бесплатно'} or 'free' == raw.strip():
        return '100% Free'
    if 'freemium' in raw or 'free +' in raw or 'from $' in raw or 'starting at $' in raw:
        money = re.search(r'\$\s*\d+(?:[.,]\d+)?(?:\s*/\s*mo|\s*/\s*month|\s*mo|\s*month)?', raw)
        if money:
            price = money.group(0).replace(' ', '')
            price = price.replace('/month', '/mo').replace('month', 'mo')
            if not price.endswith('/mo') and '/mo' not in price:
                price = price.replace('mo', '/mo') if price.endswith('mo') else price
            if price.startswith('$'):
                return f'From {price}' if 'from' in raw or 'free +' in raw else f'Freemium, From {price}'
        return 'Freemium'
    if 'trial' in raw or 'demo' in raw or 'проб' in raw:
        return 'Trial'
    money = re.search(r'\$\s*\d+(?:[.,]\d+)?(?:\s*/\s*mo|\s*/\s*month|\s*mo|\s*month)?', raw)
    if money:
        price = money.group(0).replace(' ', '')
        price = price.replace('/month', '/mo').replace('month', 'mo')
        if not price.endswith('/mo') and '/mo' not in price:
            price = price.replace('mo', '/mo') if price.endswith('mo') else price
        return f'From {price}'
    return 'Платно'


def slugify_domain(url: str) -> str:
    parsed = urlparse(url)
    host = parsed.netloc.lower().removeprefix('www.')
    return host


def unique_preserve(items: list[str]) -> list[str]:
    out: list[str] = []
    for item in items:
        if item and item not in out:
            out.append(item)
    return out


def parse_block(block: str, index: int) -> ToolItem:
    links = re.findall(r'\[(.*?)\]\((.*?)\)', block)
    if len(links) < 3:
        raise ValueError('Недостаточно ссылок в блоке')

    icon = links[0][1].strip()
    name = strip_markdown(links[0][0].strip())
    url = links[1][1].strip()
    category = strip_markdown(links[-2][0].strip())
    pricing = normalize_pricing(links[-1][0].strip())

    between = block
    first_link = between.find('](')
    last_link = between.rfind('](')
    description_source = between[first_link + 2:last_link] if first_link != -1 and last_link != -1 and last_link > first_link else block
    description = clean_description(description_source)

    if not description:
        before_category = re.split(r'\[(.*?)\]\((.*?)\)[^\[]*$', block)[0]
        description = clean_description(before_category)

    affiliate_url = f'{url}{AFFILIATE_SUFFIX}'
    tool_id = f'tool_{index}'

    return ToolItem(
        id=tool_id,
        name=name,
        description=description,
        category=category or 'Uncategorized',
        pricing=pricing,
        url=url,
        affiliate_url=affiliate_url,
        icon=icon,
    )


def extract_blocks(markdown: str) -> list[str]:
    parts = markdown.split('\n- ![')
    blocks: list[str] = []
    for i, part in enumerate(parts):
        if i == 0:
            if part.strip().startswith('- !['):
                blocks.append(part.strip())
            continue
        blocks.append('- ![' + part)
    return [block.strip() for block in blocks if block.strip()]


def load_markdown_input() -> str:
    raw = INPUT_FILE.read_text(encoding='utf-8', errors='replace')
    try:
        payload = json.loads(raw)
        if isinstance(payload, dict) and isinstance(payload.get('markdown'), str):
            return payload['markdown']
        if isinstance(payload, str):
            return payload
    except json.JSONDecodeError:
        pass
    return raw


def main() -> None:
    errors: list[ParseError] = []
    tools: list[dict[str, Any]] = []
    markdown = load_markdown_input()
    blocks = extract_blocks(markdown)
    seen_urls: set[str] = set()

    for index, block in enumerate(blocks):
        try:
            item = parse_block(block, index)
            if item.url in seen_urls:
                continue
            seen_urls.add(item.url)
            tools.append(asdict(item))
        except Exception as exc:  # noqa: BLE001
            errors.append(ParseError(index=index, raw=block[:5000], error=str(exc)))

    OUTPUT_FILE.write_text(json.dumps(tools, ensure_ascii=False, indent=2), encoding='utf-8')
    ERROR_FILE.write_text(json.dumps([asdict(err) for err in errors], ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Готово: {len(tools)} инструментов, ошибок: {len(errors)}')


if __name__ == '__main__':
    main()

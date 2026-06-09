from __future__ import annotations

import hashlib
import json
import logging
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field, ValidationError, field_validator

ROOT = Path(__file__).resolve().parent
INPUT_FILE = ROOT / "taaft.json"
OUTPUT_FILE = ROOT / "tools_clean.json"
ERROR_FILE = ROOT / "parsing_errors.json"

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(message)s")
logger = logging.getLogger("parser")

PRICING_MAP = {
    "free": "Бесплатно",
    "freemium": "Фримиум",
    "paid": "Платно",
    "trial": "Пробный период",
}

CATEGORY_ALIASES = {
    "text": "Контент",
    "writing": "Контент",
    "copywriting": "Контент",
    "image": "Изображения",
    "video": "Видео",
    "seo": "SEO",
    "analytics": "Аналитика",
    "marketing": "Маркетинг",
}


class ToolRecord(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1)
    url: AnyHttpUrl
    description: str = Field(min_length=10)
    category: str = Field(min_length=1)
    pricing: str
    domain: str = Field(min_length=1)
    tags: list[str] = Field(default_factory=list)

    @field_validator("pricing")
    @classmethod
    def validate_pricing(cls, value: str) -> str:
        normalized = normalize_pricing(value)
        if normalized not in PRICING_MAP.values():
            raise ValueError(f"Unsupported pricing: {value}")
        return normalized

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, value: str) -> str:
        parsed = urlparse(f"https://{value}" if "://" not in value else value)
        host = parsed.netloc or parsed.path
        if not host:
            raise ValueError("Invalid domain")
        return host.lower().removeprefix("www.")

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, value: list[str]) -> list[str]:
        cleaned = []
        for tag in value:
            tag = clean_text(tag)
            if tag and tag not in cleaned:
                cleaned.append(tag)
        return cleaned


@dataclass
class ParseError:
    index: int
    raw: Any
    error: str


def normalize_pricing(value: str | None) -> str:
    text = clean_text(value or "").lower()
    if any(token in text for token in ("free", "бесплат", "gratis")):
        return PRICING_MAP["free"]
    if any(token in text for token in ("freem", "фрим", "basic", "starter")):
        return PRICING_MAP["freemium"]
    if any(token in text for token in ("trial", "проб", "demo")):
        return PRICING_MAP["trial"]
    return PRICING_MAP["paid"]


def clean_text(value: Any) -> str:
    text = str(value or "")
    text = re.sub(r"`{1,3}", "", text)
    text = re.sub(r"\[(.*?)\]\((.*?)\)", r"\1", text)
    text = re.sub(r"[*_>#~-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_json_candidates(raw: str) -> list[Any]:
    candidates: list[Any] = []
    for match in re.finditer(r"\{.*?\}", raw, re.DOTALL):
        snippet = match.group(0)
        try:
            candidates.append(json.loads(snippet))
        except json.JSONDecodeError:
            continue
    return candidates


def fallback_state_machine(raw: str) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    current: dict[str, Any] = {}
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        if re.match(r"^[-*]\s+", line):
            if current:
                items.append(current)
                current = {}
            line = line[2:].strip()
        if ":" in line:
            key, value = line.split(":", 1)
            current[key.lower().strip()] = value.strip()
    if current:
        items.append(current)
    return items


def infer_domain(url: str) -> str:
    parsed = urlparse(url)
    host = parsed.netloc.lower().removeprefix("www.")
    return host


def tool_to_record(item: dict[str, Any]) -> ToolRecord:
    name = clean_text(item.get("name") or item.get("title"))
    url = clean_text(item.get("url") or item.get("website") or "")
    description = clean_text(item.get("description") or item.get("summary") or item.get("markdown") or "")
    category = clean_text(item.get("category") or item.get("topic") or "Маркетинг")
    category = CATEGORY_ALIASES.get(category.lower(), category)
    pricing = item.get("pricing") or item.get("price") or item.get("plan") or "Платно"
    tags_raw = item.get("tags") or item.get("keywords") or []
    if isinstance(tags_raw, str):
        tags = [t.strip() for t in re.split(r"[,;/|]", tags_raw) if t.strip()]
    else:
        tags = [clean_text(tag) for tag in tags_raw if clean_text(tag)]
    domain = item.get("domain") or infer_domain(url)
    return ToolRecord(
        name=name,
        url=url,
        description=description,
        category=category,
        pricing=pricing,
        domain=domain,
        tags=tags,
    )


def dedupe_by_domain(records: Iterable[ToolRecord]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    output: list[dict[str, Any]] = []
    for record in records:
        if record.domain in seen:
            continue
        seen.add(record.domain)
        output.append(record.model_dump(mode="json"))
    return output


def main() -> None:
    if not INPUT_FILE.exists():
        raise FileNotFoundError(f"Missing input file: {INPUT_FILE}")

    raw = INPUT_FILE.read_text(encoding="utf-8", errors="replace")
    objects: list[Any]
    try:
        parsed = json.loads(raw)
        objects = parsed if isinstance(parsed, list) else parsed.get("tools", []) if isinstance(parsed, dict) else []
    except json.JSONDecodeError:
        objects = extract_json_candidates(raw)

    if not objects:
        objects = fallback_state_machine(raw)

    records: list[ToolRecord] = []
    errors: list[ParseError] = []
    for index, item in enumerate(objects):
        if not isinstance(item, dict):
            errors.append(ParseError(index=index, raw=item, error="Item is not an object"))
            continue
        try:
            records.append(tool_to_record(item))
        except (ValidationError, ValueError) as exc:
            errors.append(ParseError(index=index, raw=item, error=str(exc)))

    clean = dedupe_by_domain(records)
    OUTPUT_FILE.write_text(json.dumps(clean, ensure_ascii=False, indent=2), encoding="utf-8")
    ERROR_FILE.write_text(
        json.dumps(
            [
                {
                    "index": error.index,
                    "raw": error.raw,
                    "error": error.error,
                    "hash": hashlib.sha256(json.dumps(error.raw, ensure_ascii=False, default=str).encode("utf-8")).hexdigest(),
                }
                for error in errors
            ],
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    logger.info("Parsed %s tools, %s errors", len(clean), len(errors))


if __name__ == "__main__":
    main()

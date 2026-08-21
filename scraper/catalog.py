#!/usr/bin/env python3
"""NCERT Textbook Catalog Extractor.

Extracts and normalizes the full catalog of Class 1-12 NCERT textbooks.
Supports both live fetching and offline seed fallback.
"""

import asyncio
import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Tuple

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

try:
    from playwright.async_api import async_playwright, Page
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False

logger = logging.getLogger("ncert_scraper.catalog")

NCERT_URL = "https://ncert.nic.in/textbook.php"
DEFAULT_SEED_FILE = Path(__file__).parent / "catalog_seed.json"
DEFAULT_CATALOG_FILE = Path(__file__).parent / "catalog.json"

ROMAN_TO_NUM = {
    "i": "1",
    "ii": "2",
    "iii": "3",
    "iv": "4",
    "v": "5",
    "vi": "6",
    "vii": "7",
    "viii": "8",
    "ix": "9",
    "x": "10",
    "xi": "11",
    "xii": "12",
}

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


def get_requests_session() -> requests.Session:
    """Create requests session with robust retries and headers."""
    session = requests.Session()
    retries = Retry(
        total=4,
        backoff_factor=1.5,
        status_forcelist=[500, 502, 503, 504, 429],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
    })
    return session


def normalize_class_key(raw_class: str) -> str:
    """Normalize class representations (e.g. 'Class X', 'Class 10', '10', 'X') -> '10'."""
    clean = raw_class.lower().replace("class", "").strip()
    if clean in ROMAN_TO_NUM:
        return ROMAN_TO_NUM[clean]
    if clean.isdigit():
        return str(int(clean))
    return clean


def normalize_catalog(raw_data: Any) -> Dict[str, Dict[str, List[Dict[str, str]]]]:
    """Convert different catalog JSON formats to standard {class: {subject: [books]}}."""
    result: Dict[str, Dict[str, List[Dict[str, str]]]] = {}

    # Format 1: List of class objects [{"class": "Class I", "subjects": [...]}]
    if isinstance(raw_data, list):
        for item in raw_data:
            cls_key = normalize_class_key(item.get("class", ""))
            if not cls_key:
                continue

            result.setdefault(cls_key, {})
            for subj_obj in item.get("subjects", []):
                subj_name = subj_obj.get("subject", "").strip()
                if not subj_name:
                    continue

                result[cls_key].setdefault(subj_name, [])
                for b in subj_obj.get("books", []):
                    code = b.get("book_code") or b.get("code") or ""
                    title = b.get("book_title") or b.get("title") or b.get("text") or ""
                    if code and title:
                        result[cls_key][subj_name].append({
                            "title": title.strip(),
                            "code": code.strip(),
                            "chapters": b.get("chapters", ""),
                        })

    # Format 2: Dict of dicts {"1": {"Maths": [...]}}
    elif isinstance(raw_data, dict):
        for cls_raw, subjs in raw_data.items():
            cls_key = normalize_class_key(cls_raw)
            if not cls_key:
                continue
            result.setdefault(cls_key, {})
            if isinstance(subjs, dict):
                for subj_name, books in subjs.items():
                    result[cls_key].setdefault(subj_name, [])
                    for b in books:
                        code = b.get("code") or b.get("book_code") or ""
                        title = b.get("title") or b.get("book_title") or b.get("text") or ""
                        if code and title:
                            result[cls_key][subj_name].append({
                                "title": title.strip(),
                                "code": code.strip(),
                                "chapters": b.get("chapters", ""),
                            })

    return result


def fetch_live_script(url: str = NCERT_URL, timeout: int = 15) -> str:
    """Download NCERT textbook page and return the script containing change1()."""
    session = get_requests_session()
    response = session.get(url, timeout=timeout)
    response.raise_for_status()

    blocks = re.findall(r"<script[^>]*>(.*?)</script>", response.text, re.DOTALL | re.IGNORECASE)
    for block in blocks:
        if "tclass.value" in block and "tsubject" in block:
            return block

    raise ValueError("Could not find book-data script block in NCERT textbook.php")


def parse_live_script(script: str) -> Dict[str, Dict[str, List[Dict[str, str]]]]:
    """Parse the change1() if-else chain into standard dictionary."""
    result: Dict[str, Dict[str, List[Dict[str, str]]]] = {}

    conditions = re.split(r"else\s+if|\bif\s*\(", script)
    for condition in conditions:
        class_m = re.search(r"tclass\.value\s*==\s*['\"]?(\d+)['\"]?", condition)
        subj_m = re.search(r"tsubject\.options\[sind\]\.text\s*==\s*['\"]([^'\"]+)['\"]", condition)

        if not class_m or not subj_m:
            continue

        cls = normalize_class_key(class_m.group(1))
        subj = subj_m.group(1).strip()
        if subj in ("..Select Subject..", "--Select Subject--", ""):
            continue

        result.setdefault(cls, {}).setdefault(subj, [])

        book_pattern = (
            r"tbook\.options\[(\d+)\]\.text\s*=\s*['\"]([^'\"]+)['\"];"
            r"[\s\S]*?tbook\.options\[\1\]\.value\s*=\s*['\"]([^'\"]+)['\"]"
        )
        for m_book in re.finditer(book_pattern, condition):
            _, title, full_code = m_book.groups()
            title = title.strip()
            if not title or title in ("..Select Book Title..", "--Select Book Title--"):
                continue

            code_match = re.match(r"textbook\.php\?([a-zA-Z0-9]+)=(\d+-\d+|\d+)", full_code)
            book_code = code_match.group(1) if code_match else full_code.split("=")[0].replace("textbook.php?", "")
            chapters = code_match.group(2) if code_match else ""

            if book_code:
                result[cls][subj].append({
                    "title": title,
                    "code": book_code,
                    "chapters": chapters,
                })

    return result


def fetch_catalog(cache_path: Optional[Path] = None, refresh: bool = False) -> Dict[str, Dict[str, List[Dict[str, str]]]]:
    """Load catalog from cache, seed, or live NCERT endpoint."""
    cache = cache_path or DEFAULT_CATALOG_FILE

    # 1. Try local normalized cache
    if cache.exists() and not refresh:
        try:
            with open(cache, "r", encoding="utf-8") as f:
                data = json.load(f)
                norm = normalize_catalog(data)
                if norm:
                    logger.info(f"Loaded {len(norm)} classes from cached catalog ({cache.name})")
                    return norm
        except Exception as e:
            logger.warning(f"Failed to read cache {cache}: {e}")

    # 2. Try offline seed data
    if DEFAULT_SEED_FILE.exists() and not refresh:
        try:
            with open(DEFAULT_SEED_FILE, "r", encoding="utf-8") as f:
                seed_data = json.load(f)
                norm = normalize_catalog(seed_data)
                if norm:
                    logger.info(f"Loaded {len(norm)} classes from seed catalog ({DEFAULT_SEED_FILE.name})")
                    # Save normalized cache
                    with open(cache, "w", encoding="utf-8") as out:
                        json.dump(norm, out, indent=2, ensure_ascii=False)
                    return norm
        except Exception as e:
            logger.warning(f"Failed to read seed catalog {DEFAULT_SEED_FILE}: {e}")

async def build_catalog_playwright_async(
    headless: bool = True,
    timeout_ms: int = 45_000,
) -> Dict[str, Dict[str, List[Dict[str, str]]]]:
    """Crawl NCERT dropdowns directly using Playwright with NO hardcoding."""
    if not HAS_PLAYWRIGHT:
        raise ImportError("Playwright is not installed. Install with `pip install playwright && playwright install chromium`.")

    logger.info("[Playwright] Launching browser to scrape NCERT textbook dropdowns...")
    catalog: Dict[str, Dict[str, List[Dict[str, str]]]] = {}

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=headless)
        context = await browser.new_context(user_agent=USER_AGENT)
        page = await context.new_page()
        page.set_default_timeout(timeout_ms)

        await page.goto(NCERT_URL, wait_until="domcontentloaded")
        await page.wait_for_selector('select[name="tclass"]')

        classes = await page.evaluate(
            """() => {
                const s = document.querySelector('select[name="tclass"]');
                if (!s) return [];
                return Array.from(s.options)
                    .map(o => ({value: o.value, text: (o.textContent || '').trim()}))
                    .filter(o => o.value && o.value !== '-1' && !o.text.toLowerCase().includes('select'));
            }"""
        )

        for cls_opt in classes:
            cls_key = normalize_class_key(cls_opt["text"])
            if not cls_key:
                continue
            catalog.setdefault(cls_key, {})

            await page.select_option('select[name="tclass"]', value=cls_opt["value"])
            await page.wait_for_timeout(250)

            subjects = await page.evaluate(
                """() => {
                    const s = document.querySelector('select[name="tsubject"]');
                    if (!s) return [];
                    return Array.from(s.options)
                        .map(o => ({value: o.value, text: (o.textContent || '').trim()}))
                        .filter(o => o.value && o.value !== '-1' && !o.text.toLowerCase().includes('select'));
                }"""
            )

            for subj_opt in subjects:
                subj_name = subj_opt["text"]
                if not subj_name:
                    continue
                catalog[cls_key].setdefault(subj_name, [])

                await page.select_option('select[name="tsubject"]', value=subj_opt["value"])
                await page.wait_for_timeout(250)

                books = await page.evaluate(
                    """() => {
                        const s = document.querySelector('select[name="tbook"]');
                        if (!s) return [];
                        return Array.from(s.options)
                            .map(o => ({value: o.value, text: (o.textContent || '').trim()}))
                            .filter(o => o.value && o.value !== '-1' && !o.text.toLowerCase().includes('select'));
                    }"""
                )

                for b_opt in books:
                    raw_val = b_opt["value"]
                    m = re.search(r"(?:=|\?|^)([a-z0-9]{4,8})(?:=|$)", raw_val, re.I)
                    code = m.group(1) if m else raw_val.split("=")[0]
                    title = b_opt["text"]
                    if code and title:
                        catalog[cls_key][subj_name].append({
                            "title": title,
                            "code": code,
                            "chapters": "",
                        })

        await browser.close()

    return catalog


def build_catalog_playwright(
    output_path: Optional[Path] = None,
    headless: bool = True,
) -> Dict[str, Dict[str, List[Dict[str, str]]]]:
    """Synchronous entrypoint for Playwright-based catalog building."""
    cat = asyncio.run(build_catalog_playwright_async(headless=headless))
    target_path = output_path or DEFAULT_CATALOG_FILE
    target_path.parent.mkdir(parents=True, exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(cat, f, indent=2, ensure_ascii=False)
    logger.info(f"[Playwright] Successfully wrote {len(cat)} classes to {target_path}")
    return cat


def fetch_catalog(
    catalog_path: Optional[Path] = None,
    refresh: bool = False,
    use_playwright: bool = False,
) -> Dict[str, Dict[str, List[Dict[str, str]]]]:
    """Fetch or load the textbook catalog with automatic caching."""
    cache = catalog_path or DEFAULT_CATALOG_FILE

    # 1. Check Playwright if explicitly requested or refreshing
    if use_playwright and HAS_PLAYWRIGHT:
        try:
            return build_catalog_playwright(output_path=cache)
        except Exception as e:
            logger.warning(f"Playwright crawler failed: {e}. Trying standard fallback...")

    # 2. Check local catalog.json cache
    if cache.exists() and not refresh:
        try:
            with open(cache, "r", encoding="utf-8") as f:
                data = json.load(f)
                norm = normalize_catalog(data)
                if norm:
                    logger.info(f"Loaded {len(norm)} classes from cached catalog ({cache.name})")
                    return norm
        except Exception as e:
            logger.warning(f"Failed to read cache {cache}: {e}")

    # 3. Try offline seed data
    if DEFAULT_SEED_FILE.exists() and not refresh:
        try:
            with open(DEFAULT_SEED_FILE, "r", encoding="utf-8") as f:
                seed_data = json.load(f)
                norm = normalize_catalog(seed_data)
                if norm:
                    logger.info(f"Loaded {len(norm)} classes from seed catalog ({DEFAULT_SEED_FILE.name})")
                    with open(cache, "w", encoding="utf-8") as out:
                        json.dump(norm, out, indent=2, ensure_ascii=False)
                    return norm
        except Exception as e:
            logger.warning(f"Failed to read seed catalog {DEFAULT_SEED_FILE}: {e}")

    # 4. Live fetch from NCERT (regex parser or Playwright)
    if HAS_PLAYWRIGHT:
        try:
            return build_catalog_playwright(output_path=cache)
        except Exception as e:
            logger.warning(f"Playwright extraction failed ({e}), falling back to direct JS parse...")

    try:
        logger.info("Attempting direct JS catalog extraction from NCERT...")
        script = fetch_live_script()
        live_catalog = parse_live_script(script)
        if live_catalog:
            with open(cache, "w", encoding="utf-8") as out:
                json.dump(live_catalog, out, indent=2, ensure_ascii=False)
            logger.info(f"Successfully refreshed live catalog ({len(live_catalog)} classes)")
            return live_catalog
    except Exception as e:
        logger.warning(f"Live fetch failed ({e}). Falling back to seed data...")
        if DEFAULT_SEED_FILE.exists():
            with open(DEFAULT_SEED_FILE, "r", encoding="utf-8") as f:
                seed_data = json.load(f)
                return normalize_catalog(seed_data)

    raise RuntimeError("Could not load NCERT catalog from cache, seed, or live endpoint.")


def iter_books(
    catalog: Dict[str, Any],
    class_filter: Optional[str] = None,
    subject_filter: Optional[str] = None,
) -> Iterator[Tuple[str, str, Dict[str, str]]]:
    """Yield tuples of (class_num, subject_name, book_dict) filtered as requested."""
    for cls in sorted(catalog.keys(), key=lambda k: int(k) if k.isdigit() else 999):
        if class_filter and class_filter.lower() != "all" and cls != normalize_class_key(class_filter):
            continue

        subjects = catalog[cls]
        for subj, books in subjects.items():
            if subject_filter and subject_filter.lower() != "all" and subj.lower() != subject_filter.lower():
                continue

            for book in books:
                if book.get("code"):
                    yield cls, subj, book


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    data = fetch_catalog()
    total_books = sum(len(books) for subj in data.values() for books in subj.values())
    print(f"Catalog successfully loaded: {len(data)} classes, {total_books} total books.")

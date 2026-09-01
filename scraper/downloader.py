#!/usr/bin/env python3
"""NCERT Textbook Downloader and PDF Assembler.

Downloads official chapter ZIP archives from NCERT's CDN, extracts all chapter PDFs,
and merges them into a clean, unified textbook PDF with proper page ordering.
"""

from __future__ import annotations

import logging
import os
import shutil
import time
import zipfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests
try:
    import pymupdf as fitz
except ImportError:
    import fitz

logger = logging.getLogger("ncert_scraper.downloader")

BASE_CDN_URL = "https://ncert.nic.in/textbook/pdf/"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


def get_book_zip_url(code: str) -> str:
    """Generate the official NCERT ZIP archive URL for a given book code."""
    clean_code = code.strip().lower()
    return f"{BASE_CDN_URL}{clean_code}dd.zip"


def probe_book(code: str, timeout: int = 12) -> Tuple[bool, int]:
    """Check if book archive is published on NCERT CDN.

    Returns:
        (is_available: bool, content_length_bytes: int)
    """
    url = get_book_zip_url(code)
    headers = {"User-Agent": USER_AGENT}
    try:
        r = requests.head(url, headers=headers, timeout=timeout, allow_redirects=True)
        if r.status_code == 200:
            size = int(r.headers.get("Content-Length", 0))
            return True, size
        return False, 0
    except Exception as e:
        logger.debug(f"Probe failed for {code}: {e}")
        return False, 0


def sanitize_filename(name: str) -> str:
    """Sanitize string for safe cross-platform file paths."""
    sanitized = re_sub = "".join(c for c in name if c.isalnum() or c in (" ", "-", "_", "(", ")", "."))
    return re_sub.strip() or "Untitled"


def download_zip(
    code: str,
    dest_path: Path,
    max_retries: int = 3,
    chunk_size: int = 131072,
) -> bool:
    """Download book ZIP archive with resume and retry capability."""
    url = get_book_zip_url(code)
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = dest_path.parent / f"{dest_path.name}.tmp"

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "*/*",
        "Connection": "keep-alive",
    }

    for attempt in range(1, max_retries + 1):
        try:
            resume_at = tmp_path.stat().st_size if (tmp_path.exists() and tmp_path.stat().st_size > 0) else 0
            req_headers = dict(headers)
            if resume_at > 0:
                req_headers["Range"] = f"bytes={resume_at}-"

            response = requests.get(url, headers=req_headers, stream=True, timeout=60)

            # If server ignored range header, restart clean
            is_partial = response.status_code == 206
            if response.status_code == 200:
                resume_at = 0

            if response.status_code not in (200, 206):
                logger.warning(f"[{code}] Server returned HTTP {response.status_code}")
                if response.status_code == 404:
                    return False
                time.sleep(2 * attempt)
                continue

            mode = "ab" if (is_partial and resume_at > 0) else "wb"
            with open(tmp_path, mode) as f:
                for chunk in response.iter_content(chunk_size=chunk_size):
                    if chunk:
                        f.write(chunk)

            # Validate ZIP integrity and CRC checksums
            if not zipfile.is_zipfile(tmp_path):
                logger.warning(f"[{code}] Corrupted or incomplete ZIP downloaded, retrying attempt {attempt}...")
                tmp_path.unlink(missing_ok=True)
                time.sleep(1)
                continue

            try:
                with zipfile.ZipFile(tmp_path, "r") as test_zf:
                    corrupted = test_zf.testzip()
                    if corrupted:
                        logger.warning(f"[{code}] Corrupted CRC in chapter '{corrupted}', retrying...")
                        tmp_path.unlink(missing_ok=True)
                        time.sleep(1)
                        continue
            except Exception as e:
                logger.warning(f"[{code}] Unreadable ZIP archive ({e}), retrying...")
                tmp_path.unlink(missing_ok=True)
                time.sleep(1)
                continue

            if dest_path.exists():
                dest_path.unlink()
            tmp_path.rename(dest_path)
            return True

        except Exception as e:
            logger.warning(f"[{code}] Download attempt {attempt} failed: {e}")
            time.sleep(2 * attempt)

    if tmp_path.exists():
        tmp_path.unlink(missing_ok=True)
    return False


def sort_chapter_pdfs(pdf_paths: List[Path]) -> List[Path]:
    """Sort extracted chapter PDFs in logical reading order:
    1. Prelims / cover / preface (*ps.pdf, *cc.pdf, *pr.pdf)
    2. Chapters (*01.pdf, *02.pdf, ..., *15.pdf)
    3. Answers / Glossary / Appendices (*an.pdf, *a1.pdf)
    """
    prelims: List[Path] = []
    chapters: List[Path] = []
    postlims: List[Path] = []

    for path in pdf_paths:
        stem = path.stem.lower()
        if any(stem.endswith(s) for s in ("ps", "cc", "pr", "cover", "prelim")):
            prelims.append(path)
        elif any(stem.endswith(s) for s in ("an", "a1", "a2", "ans", "glossary", "app")):
            postlims.append(path)
        else:
            chapters.append(path)

    prelims.sort(key=lambda p: p.name.lower())
    chapters.sort(key=lambda p: p.name.lower())
    postlims.sort(key=lambda p: p.name.lower())

    return prelims + chapters + postlims


def merge_zip_to_pdf(
    zip_path: Path,
    out_pdf_path: Path,
    keep_zip: bool = False,
    remove_watermarks: bool = True,
    optimize: bool = True,
    target_dpi: int = 140,
    jpeg_quality: int = 75,
) -> Optional[Path]:
    """Extract chapter PDFs from ZIP archive, merge them into a single PDF, and remove watermarks/compress."""
    if not zip_path.exists():
        return None

    out_pdf_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_extract_dir = zip_path.parent / f"_tmp_{zip_path.stem}"

    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            for member in zf.namelist():
                if member.lower().endswith(".pdf"):
                    try:
                        zf.extract(member, tmp_extract_dir)
                    except Exception as err:
                        logger.warning(f"Skipping damaged entry {member} in {zip_path.name}: {err}")

        pdf_files = list(tmp_extract_dir.rglob("*.pdf"))
        if not pdf_files:
            logger.warning(f"No PDF files found inside {zip_path}")
            return None

        sorted_pdfs = sort_chapter_pdfs(pdf_files)

        doc = fitz.open()
        for pdf_file in sorted_pdfs:
            try:
                doc.insert_file(str(pdf_file))
            except Exception as e:
                logger.warning(f"Skipping corrupted chapter PDF {pdf_file.name}: {e}")

        if doc.page_count == 0:
            doc.close()
            logger.error(f"Merged PDF has 0 pages for {zip_path.name}")
            return None

        doc.save(str(out_pdf_path), garbage=4, deflate=True)
        doc.close()

        if not keep_zip:
            zip_path.unlink(missing_ok=True)

        # Remove repeated NCERT watermark images (which automatically invokes optimizer)
        if remove_watermarks:
            try:
                try:
                    from watermark_remover import remove_watermarks_from_pdf
                except ImportError:
                    from scraper.watermark_remover import remove_watermarks_from_pdf
                remove_watermarks_from_pdf(out_pdf_path)
            except Exception as w_err:
                logger.warning(f"Watermark cleaning failed on {out_pdf_path.name}: {w_err}")
        elif optimize:
            # If watermarks are kept but optimization is enabled
            try:
                try:
                    from optimizer import optimize_pdf
                except ImportError:
                    from scraper.optimizer import optimize_pdf
                optimize_pdf(out_pdf_path, out_pdf_path, target_dpi=target_dpi, jpeg_quality=jpeg_quality)
            except Exception as opt_err:
                logger.warning(f"Optimization failed on {out_pdf_path.name}: {opt_err}")

        return out_pdf_path


    except Exception as e:
        logger.error(f"Failed to merge {zip_path.name}: {e}")
        return None
    finally:
        shutil.rmtree(tmp_extract_dir, ignore_errors=True)

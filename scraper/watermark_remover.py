#!/usr/bin/env python3
"""NCERT PDF Watermark Remover.

Removes repeated background watermark image objects from NCERT textbook PDFs
using stream fingerprinting and PyMuPDF (fitz).
"""

from __future__ import annotations

import hashlib
import logging
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    fitz = None
    HAS_PYMUPDF = False

logger = logging.getLogger("ncert_scraper.watermark")

# Target image specs (width, height, bits_per_component) common in NCERT textbooks
DEFAULT_TARGET_SPECS: Set[Tuple[int, int, int]] = {
    (2480, 3508, 1),
    (1894, 1894, 1),
    (1894, 1894, 8),
}


def read_stream_bytes(doc: fitz.Document, xref: int) -> Optional[bytes]:
    """Read raw stream bytes for an image xref."""
    if hasattr(doc, "xref_stream_raw"):
        try:
            data = doc.xref_stream_raw(xref)
            if data is not None:
                return data
        except Exception:
            pass
    try:
        data = doc.xref_stream(xref)
        if data is not None:
            return data
    except Exception:
        pass
    return None


def collect_watermark_xrefs(
    doc: fitz.Document,
    target_specs: Set[Tuple[int, int, int]],
    min_page_ratio: float = 0.3,
    spec_fallback: bool = False,
) -> Set[int]:
    """Return image xrefs to remove based on repeated watermark patterns across pages."""
    if doc.page_count == 0:
        return set()

    digest_to_pages: Dict[str, Set[int]] = defaultdict(set)
    digest_to_xrefs: Dict[str, Set[int]] = defaultdict(set)
    spec_to_pages: Dict[Tuple[int, int, int], Set[int]] = defaultdict(set)
    spec_to_xrefs: Dict[Tuple[int, int, int], Set[int]] = defaultdict(set)
    xref_to_smask: Dict[int, Set[int]] = defaultdict(set)

    for page_index in range(doc.page_count):
        page = doc[page_index]
        for img in page.get_images(full=True):
            xref, smask, width, height, bpc = img[:5]
            spec = (width, height, bpc)

            if target_specs and spec not in target_specs:
                continue

            spec_to_pages[spec].add(page_index)
            spec_to_xrefs[spec].add(xref)

            stream = read_stream_bytes(doc, xref)
            if stream:
                digest = hashlib.sha1(stream).hexdigest()
                digest_to_pages[digest].add(page_index)
                digest_to_xrefs[digest].add(xref)

            if isinstance(smask, int) and smask > 0:
                xref_to_smask[xref].add(smask)

    threshold = min_page_ratio * doc.page_count
    xrefs_to_remove: Set[int] = set()

    for digest, pages in digest_to_pages.items():
        if len(pages) >= threshold:
            xrefs_to_remove.update(digest_to_xrefs[digest])

    if spec_fallback:
        for spec, pages in spec_to_pages.items():
            if len(pages) >= threshold:
                xrefs_to_remove.update(spec_to_xrefs[spec])

    for xref in list(xrefs_to_remove):
        xrefs_to_remove.update(xref_to_smask.get(xref, set()))

    return xrefs_to_remove


def remove_xrefs_from_document(doc: fitz.Document, xrefs_to_remove: Set[int]) -> int:
    """Delete matching watermark image references from every page in the document."""
    if not xrefs_to_remove:
        return 0

    if doc.page_count and not hasattr(doc[0], "delete_image"):
        raise RuntimeError("PyMuPDF version is missing page.delete_image(). Upgrade PyMuPDF.")

    removed_occurrences = 0
    for page_index in range(doc.page_count):
        page = doc[page_index]
        page_xrefs = {img[0] for img in page.get_images(full=True)}
        for xref in page_xrefs.intersection(xrefs_to_remove):
            page.delete_image(xref)
            removed_occurrences += 1

    return removed_occurrences


def remove_watermarks_from_pdf(
    input_pdf: Path,
    output_pdf: Optional[Path] = None,
    target_specs: Optional[Set[Tuple[int, int, int]]] = None,
    min_page_ratio: float = 0.3,
    spec_fallback: bool = False,
) -> Tuple[int, int]:
    """Clean watermark images from a PDF file in-place or write to output path.

    Returns:
        (candidate_xrefs_count, removed_occurrences_count)
    """
    if not HAS_PYMUPDF:
        logger.warning("PyMuPDF (fitz) is not installed; skipping watermark removal.")
        return 0, 0

    if not input_pdf.exists():
        logger.error(f"Input PDF not found: {input_pdf}")
        return 0, 0

    out_path = output_pdf or input_pdf
    specs = target_specs if target_specs is not None else DEFAULT_TARGET_SPECS

    doc = fitz.open(input_pdf)
    try:
        xrefs_to_remove = collect_watermark_xrefs(
            doc,
            target_specs=specs,
            min_page_ratio=min_page_ratio,
            spec_fallback=spec_fallback,
        )

        if not xrefs_to_remove:
            doc.close()
            return 0, 0

        removed_occurrences = remove_xrefs_from_document(doc, xrefs_to_remove)

        out_path.parent.mkdir(parents=True, exist_ok=True)
        tmp_output = out_path.with_name(f"{out_path.name}.tmp")

        # Save with clean garbage collection & deflation
        doc.save(tmp_output, garbage=4, clean=True, deflate=True)
        doc.close()

        if out_path.exists():
            out_path.unlink()
        tmp_output.rename(out_path)

        logger.info(f"Cleaned {removed_occurrences} watermark instances from {input_pdf.name}")

        # If merged PDF exceeds 48MB (Supabase 50MB hard limit), compress it
        if out_path.exists() and out_path.stat().st_size > 48 * 1024 * 1024:
            compress_oversized_pdf(out_path, max_size_bytes=48 * 1024 * 1024)

        return len(xrefs_to_remove), removed_occurrences

    except Exception as e:
        logger.warning(f"Watermark removal error on {input_pdf.name}: {e}")
        try:
            doc.close()
        except Exception:
            pass
        return 0, 0


def compress_oversized_pdf(
    pdf_path: Path,
    max_size_bytes: int = 48 * 1024 * 1024,
    target_dpi: int = 150,
) -> bool:
    """If PDF exceeds max_size_bytes, re-encode pages to guarantee it fits under storage quotas."""
    if not HAS_PYMUPDF or not pdf_path.exists():
        return False

    current_size = pdf_path.stat().st_size
    if current_size <= max_size_bytes:
        return False

    logger.info(f"Optimizing oversized PDF {pdf_path.name} ({current_size / (1024*1024):.1f}MB > {max_size_bytes / (1024*1024):.0f}MB limit)...")

    try:
        src_doc = fitz.open(pdf_path)
        out_doc = fitz.open()

        for page in src_doc:
            pix = page.get_pixmap(dpi=target_dpi)
            jpg_bytes = pix.tobytes("jpeg", jpg_quality=78)
            new_page = out_doc.new_page(width=page.rect.width, height=page.rect.height)
            new_page.insert_image(new_page.rect, stream=jpg_bytes)

        src_doc.close()

        tmp_out = pdf_path.with_name(f"{pdf_path.name}.opt.tmp")
        out_doc.save(tmp_out, garbage=4, clean=True, deflate=True)
        out_doc.close()

        new_size = tmp_out.stat().st_size
        logger.info(f"Optimized {pdf_path.name}: {current_size / (1024*1024):.1f}MB -> {new_size / (1024*1024):.1f}MB")

        if pdf_path.exists():
            pdf_path.unlink()
        tmp_out.rename(pdf_path)
        return True

    except Exception as e:
        logger.warning(f"Failed to optimize oversized PDF {pdf_path.name}: {e}")
        return False


if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO)
    if len(sys.argv) < 2:
        print("Usage: python watermark_remover.py <input.pdf> [output.pdf]")
        sys.exit(1)

    in_f = Path(sys.argv[1])
    out_f = Path(sys.argv[2]) if len(sys.argv) > 2 else in_f
    xrefs, removed = remove_watermarks_from_pdf(in_f, out_f)
    print(f"Done: Removed {removed} watermarks across {xrefs} candidate objects.")

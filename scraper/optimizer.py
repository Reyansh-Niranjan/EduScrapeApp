#!/usr/bin/env python3
"""NovaSlate PDF Compression & Optimization Engine.

Combines in-stream image downsampling with Pillow and PyMuPDF stream deflation/garbage collection.
Preserves vector text, fonts, and searchable layers.
"""

from __future__ import annotations

import argparse
import gc
import hashlib
import io
import logging
import shutil
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

try:
    import pymupdf as fitz
    HAS_PYMUPDF = True
except ImportError:
    try:
        import fitz
        HAS_PYMUPDF = True
    except ImportError:
        fitz = None
        HAS_PYMUPDF = False

try:
    from PIL import Image
    HAS_PILLOW = True
except ImportError:
    Image = None
    HAS_PILLOW = False

logger = logging.getLogger("ncert_scraper.optimizer")


def reencode_image_bytes(
    image_bytes: bytes,
    target_dpi: int = 140,
    jpeg_quality: int = 75,
    max_dimension: int = 2400,
    ext: str = "png",
) -> Optional[bytes]:
    """Compress and downsample an individual image stream using Pillow."""
    if not HAS_PILLOW or not image_bytes:
        return None

    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            orig_format = (img.format or "").upper()
            w, h = img.size

            if w <= 64 and h <= 64:
                return None

            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                img_rgb = Image.new("RGB", img.size, (255, 255, 255))
                alpha = img.convert("RGBA").split()[-1]
                img_rgb.paste(img.convert("RGB"), mask=alpha)
                img = img_rgb
            elif img.mode != "RGB":
                img = img.convert("RGB")

            largest_side = max(w, h)
            if largest_side > max_dimension:
                scale = max_dimension / float(largest_side)
                img = img.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.Resampling.LANCZOS)

            out_buf = io.BytesIO()
            img.save(out_buf, format="JPEG", quality=jpeg_quality, optimize=True)
            compressed_bytes = out_buf.getvalue()

            if len(compressed_bytes) < len(image_bytes) or orig_format not in ("JPEG", "JPG"):
                return compressed_bytes

            return None

    except Exception as e:
        logger.debug(f"Image re-encoding error: {e}")
        return None


def compress_images_in_pdf(
    doc: fitz.Document,
    target_dpi: int = 140,
    jpeg_quality: int = 75,
    max_dimension: int = 2400,
    deduplicate: bool = True,
) -> int:
    """Inspects internal image XObjects across all pages and re-encodes them in-place."""
    if not HAS_PYMUPDF or not HAS_PILLOW:
        return 0

    processed_xrefs: Set[int] = set()
    replaced_count = 0
    digest_to_xref: Dict[str, int] = {}

    for page_index in range(doc.page_count):
        page = doc[page_index]
        for img_info in page.get_images(full=True):
            xref = img_info[0]
            if xref in processed_xrefs:
                continue
            processed_xrefs.add(xref)

            try:
                base_image = doc.extract_image(xref)
                if not base_image or not base_image.get("image"):
                    continue

                raw_bytes = base_image["image"]
                ext = base_image.get("ext", "png")

                if deduplicate:
                    stream_hash = hashlib.sha1(raw_bytes).hexdigest()
                    if stream_hash in digest_to_xref:
                        continue
                    digest_to_xref[stream_hash] = xref

                new_image_bytes = reencode_image_bytes(
                    image_bytes=raw_bytes,
                    target_dpi=target_dpi,
                    jpeg_quality=jpeg_quality,
                    max_dimension=max_dimension,
                    ext=ext,
                )

                if new_image_bytes and len(new_image_bytes) < len(raw_bytes):
                    if hasattr(page, "replace_image"):
                        page.replace_image(xref, stream=new_image_bytes)
                        replaced_count += 1

            except Exception as e:
                logger.debug(f"Failed to replace image xref {xref} on page {page_index}: {e}")

    return replaced_count


def optimize_pdf(
    input_pdf: Path,
    output_pdf: Optional[Path] = None,
    target_dpi: int = 140,
    jpeg_quality: int = 75,
    max_dimension: int = 2400,
    deduplicate: bool = True,
) -> Tuple[int, int, float, List[str]]:
    """Master in-process PDF optimization via PyMuPDF stream re-encoding and structure deflation."""
    if not input_pdf.exists():
        logger.error(f"Input file not found: {input_pdf}")
        return 0, 0, 0.0, []

    dest = output_pdf or input_pdf
    dest.parent.mkdir(parents=True, exist_ok=True)
    orig_size = input_pdf.stat().st_size

    if orig_size == 0 or not HAS_PYMUPDF:
        return orig_size, orig_size, 0.0, []

    applied_passes: List[str] = []
    tmp_working = dest.parent / f"{dest.stem}.opt_stage.tmp"

    try:
        doc = fitz.open(input_pdf)
        replaced = compress_images_in_pdf(
            doc,
            target_dpi=target_dpi,
            jpeg_quality=jpeg_quality,
            max_dimension=max_dimension,
            deduplicate=deduplicate,
        )
        if replaced > 0:
            applied_passes.append(f"Image Compression ({replaced} streams)")

        doc.save(
            tmp_working,
            garbage=4,
            clean=True,
            deflate=True,
        )
        doc.close()
        applied_passes.append("Structure Deflate & Garbage Pruning")

        if tmp_working.exists():
            final_size = tmp_working.stat().st_size
            if final_size > 0 and final_size <= orig_size:
                if dest.exists() and dest != tmp_working:
                    dest.unlink()
                tmp_working.rename(dest)
                pct_saved = ((orig_size - final_size) / orig_size) * 100.0
                return orig_size, final_size, pct_saved, applied_passes
            else:
                if dest != input_pdf:
                    shutil.copy2(input_pdf, dest)
                tmp_working.unlink(missing_ok=True)
                return orig_size, orig_size, 0.0, ["Preserved Original (Already Optimal)"]

        return orig_size, orig_size, 0.0, []

    except Exception as e:
        logger.error(f"Error during optimization of {input_pdf.name}: {e}")
        if tmp_working.exists():
            tmp_working.unlink(missing_ok=True)
        return orig_size, orig_size, 0.0, []
    finally:
        gc.collect()


def format_size(num_bytes: int) -> str:
    """Format bytes into readable string."""
    if num_bytes < 1024:
        return f"{num_bytes} B"
    elif num_bytes < 1024 * 1024:
        return f"{num_bytes / 1024:.1f} KB"
    return f"{num_bytes / (1024 * 1024):.2f} MB"


def main():
    """Standalone CLI entry point for testing and compressing individual PDFs."""
    parser = argparse.ArgumentParser(description="NovaSlate In-Process PDF Compression Engine")
    parser.add_argument("input", type=Path, help="Input PDF file path")
    parser.add_argument("output", type=Path, nargs="?", default=None, help="Output PDF file path (optional)")
    parser.add_argument("--dpi", type=int, default=140, help="Target image scan DPI (default: 140)")
    parser.add_argument("--quality", type=int, default=75, help="JPEG quality 1-95 (default: 75)")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable debug logging")

    args = parser.parse_args()
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO, format="%(message)s")

    input_file = args.input.resolve()
    if not input_file.exists():
        print(f"Error: File not found {input_file}", file=sys.stderr)
        sys.exit(1)

    output_file = args.output.resolve() if args.output else input_file
    orig, opt, saved_pct, passes = optimize_pdf(input_file, output_file, target_dpi=args.dpi, jpeg_quality=args.quality)
    print(f"Optimized: {format_size(orig)} -> {format_size(opt)} ({saved_pct:.1f}% saved). Passes: {passes}")


if __name__ == "__main__":
    main()

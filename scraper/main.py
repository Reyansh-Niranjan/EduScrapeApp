#!/usr/bin/env python3
# /// script
# dependencies = [
#   "requests>=2.31.0",
#   "pymupdf>=1.24.0",
#   "pillow>=10.0.0",
#   "rich>=13.0.0",
#   "python-dotenv>=1.0.0",
# ]
# ///
"""NCERT Textbook Scraper & Supabase Replenisher (CLI).

Automates textbook discovery, multi-threaded downloading, PDF merging,
watermark cleaning, and cloud synchronization to Supabase Storage.
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from dotenv import load_dotenv
from rich.console import Console
from rich.logging import RichHandler
from rich.progress import (
    BarColumn,
    MofNCompleteColumn,
    Progress,
    SpinnerColumn,
    TextColumn,
    TimeElapsedColumn,
    TimeRemainingColumn,
)
from rich.table import Table

# Add module to path
sys.path.insert(0, str(Path(__file__).parent))

from catalog import fetch_catalog, iter_books
from downloader import download_zip, merge_zip_to_pdf, probe_book, sanitize_filename
from optimizer import format_size, optimize_pdf
from supabase_uploader import SupabaseReplenisher

# Load local environment if present
load_dotenv()
load_dotenv(Path(__file__).parent.parent / ".env.local")
load_dotenv(Path(__file__).parent.parent / ".env")

console = Console(safe_box=True)


def setup_logger(verbose: bool = False):
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(message)s",
        datefmt="[%X]",
        handlers=[RichHandler(console=console, rich_tracebacks=True, show_path=False)],
    )


def process_book_task(
    cls: str,
    subject: str,
    book: Dict[str, str],
    out_dir: Path,
    uploader: Optional[SupabaseReplenisher],
    upload_enabled: bool,
    clean_local: bool,
    keep_zips: bool,
    remove_watermarks: bool,
    compress: bool,
    dpi: int,
    quality: int,
    force: bool,
) -> Dict[str, Any]:
    """Worker task: probes, downloads, merges, cleans watermarks, compresses, and optionally uploads a textbook."""
    code = book["code"]
    title = book["title"]
    safe_title = sanitize_filename(title)
    safe_subject = sanitize_filename(subject)

    # Standardized remote and local hierarchy
    remote_path = f"Class {cls}/{safe_subject}/{safe_title}.pdf"
    local_pdf_path = out_dir / f"Class {cls}" / safe_subject / f"{safe_title}.pdf"
    local_zip_path = out_dir / f"Class {cls}" / safe_subject / f"{safe_title}.zip"

    # Step 1: Check if already in Supabase
    if upload_enabled and uploader and not force:
        if uploader.exists(remote_path):
            return {"status": "skipped_remote", "title": title, "path": remote_path}

    # Step 2: Check if already present locally
    if local_pdf_path.exists() and local_pdf_path.stat().st_size > 0 and not force:
        if compress:
            optimize_pdf(
                local_pdf_path,
                local_pdf_path,
                target_dpi=dpi,
                jpeg_quality=quality,
            )
        if upload_enabled and uploader:
            ok = uploader.upload_file(local_pdf_path, remote_path)
            if clean_local and ok:
                local_pdf_path.unlink(missing_ok=True)
            return {"status": "uploaded" if ok else "upload_error", "title": title, "path": remote_path}
        return {"status": "skipped_local", "title": title, "path": str(local_pdf_path)}

    # Step 3: Probe availability on NCERT CDN
    available, size_bytes = probe_book(code)
    if not available:
        return {"status": "not_published", "title": title, "code": code}

    # Step 4: Download ZIP archive
    download_ok = download_zip(code, local_zip_path)
    if not download_ok or not local_zip_path.exists():
        return {"status": "download_failed", "title": title, "code": code}

    # Step 5: Extract and merge chapter PDFs into unified textbook PDF (with watermark cleaning & compression)
    merged_path = merge_zip_to_pdf(
        local_zip_path,
        local_pdf_path,
        keep_zip=keep_zips,
        remove_watermarks=remove_watermarks,
        optimize=compress,
        target_dpi=dpi,
        jpeg_quality=quality,
    )
    if not merged_path or not merged_path.exists() or merged_path.stat().st_size == 0:
        return {"status": "merge_failed", "title": title, "code": code}

    # Step 6: Deep compression pass if requested and watermark remover didn't already run
    orig_sz = merged_path.stat().st_size
    final_sz = orig_sz
    if compress and not remove_watermarks:
        _, final_sz, _, _ = optimize_pdf(
            merged_path,
            merged_path,
            target_dpi=dpi,
            jpeg_quality=quality,
        )

    # Step 7: Upload to Supabase
    if upload_enabled and uploader:
        upload_ok = uploader.upload_file(merged_path, remote_path)
        if clean_local and upload_ok:
            merged_path.unlink(missing_ok=True)
        if upload_ok:
            return {"status": "uploaded", "title": title, "path": remote_path, "size": final_sz}
        return {"status": "upload_error", "title": title, "path": remote_path}

    return {"status": "downloaded_local", "title": title, "path": str(merged_path), "size": final_sz}


def main():
    parser = argparse.ArgumentParser(description="NCERT Textbook Scraper & Supabase Replenisher")
    parser.add_argument("--class", dest="cls", default="all", help="Target class (1-12 or 'all')")
    parser.add_argument("--subject", default=None, help="Target subject (or all if omitted)")
    parser.add_argument("--out", default="downloads", help="Output directory for downloaded books")
    parser.add_argument("--concurrency", "-c", type=int, default=16, help="Parallel worker threads (default: 16)")
    parser.add_argument("--upload-to-supabase", action="store_true", help="Sync merged PDFs to Supabase bucket (used by GitHub Actions)")
    parser.add_argument("--clean-local", action="store_true", help="Delete local files after uploading (saves CI disk)")
    parser.add_argument("--force", action="store_true", help="Force re-download and re-upload existing files")
    parser.add_argument("--keep-zips", action="store_true", help="Keep source chapter ZIP files")
    parser.add_argument("--keep-watermarks", action="store_true", help="Do not remove background NCERT watermarks")
    parser.add_argument("--no-compress", action="store_true", help="Disable multi-pass PDF compression engine")
    parser.add_argument("--dpi", type=int, default=140, help="Target scan DPI for image downsampling (default: 140)")
    parser.add_argument("--quality", type=int, default=75, help="JPEG quality 1-95 for embedded images (default: 75)")
    parser.add_argument("--refresh-catalog", action="store_true", help="Re-fetch catalog from NCERT website")
    parser.add_argument("--dry-run", action="store_true", help="Inspect and list matching books without downloading")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose debug logging")

    args = parser.parse_args()
    setup_logger(args.verbose)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Always remove stale completion marker at the start of every run
    marker_file = Path("all_completed.marker")
    if marker_file.exists():
        marker_file.unlink(missing_ok=True)

    console.print("[bold cyan]==============================================================[/bold cyan]")
    console.print("[bold cyan]  EduScrapeApp -- NCERT Scraper & Optimization Pipeline       [/bold cyan]")
    console.print("[bold cyan]==============================================================[/bold cyan]\n")

    # Step 1: Catalog Extraction (Direct NCERT parser / Cache)
    catalog = fetch_catalog(refresh=args.refresh_catalog)
    target_books = list(iter_books(catalog, class_filter=args.cls, subject_filter=args.subject))

    if not target_books:
        console.print(f"[yellow]No books found matching Class '{args.cls}' and Subject '{args.subject}'.[/yellow]")
        return

    console.print(f"[*] Found [bold green]{len(target_books)}[/bold green] books for Class [bold cyan]{args.cls}[/bold cyan]")
    console.print(f"[*] Compression Engine: [bold green]{'Enabled' if not args.no_compress else 'Disabled'}[/bold green] (DPI: {args.dpi}, Quality: {args.quality}%)")

    if args.dry_run:
        table = Table(title=f"Catalog Selection (Class {args.cls})", show_header=True, header_style="bold magenta", safe_box=True)
        table.add_column("Class", justify="center")
        table.add_column("Subject")
        table.add_column("Book Title")
        table.add_column("Code", justify="center")

        for c, s, b in target_books[:40]:
            table.add_row(f"Class {c}", s, b["title"], b["code"])

        console.print(table)
        if len(target_books) > 40:
            console.print(f"[dim]... and {len(target_books) - 40} more books.[/dim]")
        return

    # Step 2: Initialize Supabase Replenisher if enabled
    uploader: Optional[SupabaseReplenisher] = None
    if args.upload_to_supabase:
        uploader = SupabaseReplenisher()
        if not uploader.is_configured():
            console.print("[bold red][!] Error: Supabase credentials missing. Check SUPABASE_URL and SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY.[/bold red]")
            sys.exit(1)
        console.print("[green][+] Connected to Supabase Storage bucket 'ncert'[/green]")
        # Sync catalog.json to bucket root
        uploader.upload_catalog_json(catalog)

    # Step 3: Run Concurrent Pipeline
    results: List[Dict[str, Any]] = []
    stats = {
        "uploaded": 0,
        "downloaded_local": 0,
        "skipped_remote": 0,
        "skipped_local": 0,
        "not_published": 0,
        "failed": 0,
    }

    start_time = time.time()

    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}[/bold blue]"),
        BarColumn(bar_width=32),
        MofNCompleteColumn(),
        TimeElapsedColumn(),
        TimeRemainingColumn(),
        console=console,
    ) as progress:
        task_id = progress.add_task("Processing NCERT Books...", total=len(target_books))

        with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
            futures = {
                executor.submit(
                    process_book_task,
                    c,
                    s,
                    b,
                    out_dir,
                    uploader,
                    args.upload_to_supabase,
                    args.clean_local,
                    args.keep_zips,
                    not args.keep_watermarks,
                    not args.no_compress,
                    args.dpi,
                    args.quality,
                    args.force,
                ): (c, s, b)
                for c, s, b in target_books
            }

            for future in as_completed(futures):
                try:
                    res = future.result()
                    results.append(res)
                    status = res.get("status", "failed")

                    if status in stats:
                        stats[status] += 1
                    else:
                        stats["failed"] += 1

                except Exception as e:
                    stats["failed"] += 1
                    logging.error(f"Task error: {e}")
                finally:
                    progress.advance(task_id)

    elapsed = time.time() - start_time

    # Step 4: Summary Table
    summary_table = Table(title="Execution Summary", show_header=True, header_style="bold cyan", safe_box=True)
    summary_table.add_column("Metric", style="bold")
    summary_table.add_column("Count / Value", justify="right")

    summary_table.add_row("Total Processed", str(len(target_books)))
    if args.upload_to_supabase:
        summary_table.add_row("Uploaded to Supabase", f"[bold green]{stats['uploaded']}[/bold green]")
        summary_table.add_row("Already in Supabase (Skipped)", f"[dim]{stats['skipped_remote']}[/dim]")
    else:
        summary_table.add_row("Downloaded & Merged", f"[bold green]{stats['downloaded_local']}[/bold green]")
        summary_table.add_row("Already Local (Skipped)", f"[dim]{stats['skipped_local']}[/dim]")

    summary_table.add_row("Not Published by NCERT", f"[yellow]{stats['not_published']}[/yellow]")
    summary_table.add_row("Failures / Errors", f"[red]{stats['failed']}[/red]")
    summary_table.add_row("Optimization Status", f"[green]Active (DPI {args.dpi}, Q{args.quality})[/green]" if not args.no_compress else "[dim]Disabled[/dim]")
    summary_table.add_row("Time Elapsed", f"{elapsed:.1f}s")

    console.print("\n", summary_table)

    # Step 5: Final Dynamic Catalog Sync
    if args.upload_to_supabase and uploader:
        console.print("[bold cyan][*] Refreshing and syncing master catalog.json & supabase_catalog.json...[/bold cyan]")
        uploader.fetch_existing_files(refresh=True)
        uploader.upload_catalog_json(catalog)
        console.print("[bold green][+] Final Master Catalog synced to Supabase Storage root successfully![/bold green]")

    # Step 6: Create Completion Marker if all books are finished
    total_target = len(target_books)
    if args.upload_to_supabase:
        completed_target = stats.get("uploaded", 0) + stats.get("skipped_remote", 0) + stats.get("not_published", 0)
    else:
        completed_target = stats.get("downloaded_local", 0) + stats.get("skipped_local", 0) + stats.get("not_published", 0)

    if completed_target >= total_target and stats.get("failed", 0) == 0:
        Path("all_completed.marker").write_text("COMPLETE", encoding="utf-8")
        console.print("[bold green][✓] 100% of target textbooks completed and synced to Supabase![/bold green]")

    console.print("\n[bold green][+] NCERT Pipeline Completed Successfully![/bold green]\n")


if __name__ == "__main__":
    main()


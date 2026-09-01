#!/usr/bin/env python3
"""Supabase Storage Replenisher.

Manages direct uploading, synchronization, and deduplication of NCERT textbook PDFs
into the Supabase `ncert` storage bucket using industrial-strength REST sessions,
connection pooling, and automatic exponential retries.
"""

from __future__ import annotations

import json
import logging
import os
import tempfile
import time
from pathlib import Path
from typing import Dict, List, Optional, Set

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger("ncert_scraper.supabase")

DEFAULT_BUCKET = "ncert"


class SupabaseReplenisher:
    """Manages uploading and synchronization with Supabase storage."""

    def __init__(
        self,
        supabase_url: Optional[str] = None,
        supabase_key: Optional[str] = None,
        bucket_name: str = DEFAULT_BUCKET,
    ):
        self.url = (
            supabase_url
            or os.getenv("SUPABASE_URL")
            or os.getenv("VITE_SUPABASE_URL")
        )
        self.key = (
            supabase_key
            or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            or os.getenv("SUPABASE_KEY")
            or os.getenv("VITE_SUPABASE_ANON_KEY")
        )
        self.bucket_name = bucket_name
        self._remote_files: Optional[Dict[str, int]] = None

        # Build resilient HTTP session with high-capacity connection pooling
        self.session = requests.Session()
        retries = Retry(
            total=4,
            backoff_factor=1.5,
            status_forcelist=[500, 502, 503, 504, 408, 429],
            raise_on_status=False,
        )
        adapter = HTTPAdapter(max_retries=retries, pool_connections=64, pool_maxsize=64)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

        if self.url and self.key:
            logger.info(f"Connected to Supabase ({self.url})")
        else:
            logger.warning("Supabase URL or Key not found in environment.")

    def is_configured(self) -> bool:
        return bool(self.url and self.key)

    def fetch_existing_files(self, refresh: bool = False) -> Dict[str, int]:
        """Recursively list all existing files in the bucket."""
        if self._remote_files is not None and not refresh:
            return self._remote_files

        if not self.is_configured():
            return {}

        collected: Dict[str, int] = {}
        api_list_url = f"{self.url.rstrip('/')}/storage/v1/object/list/{self.bucket_name}"
        headers = {
            "Authorization": f"Bearer {self.key}",
            "apikey": self.key,
            "Content-Type": "application/json",
        }

        def walk(prefix: str = "", depth: int = 0):
            if depth > 5:
                return
            try:
                payload = {
                    "prefix": prefix,
                    "limit": 1000,
                    "sortBy": {"column": "name", "order": "asc"},
                }
                resp = self.session.post(api_list_url, headers=headers, json=payload, timeout=30)
                if resp.status_code == 200:
                    items = resp.json()
                    for item in items:
                        name = item.get("name", "")
                        if not name:
                            continue
                        full_path = f"{prefix}/{name}".strip("/") if prefix else name
                        metadata = item.get("metadata")

                        # If metadata is null and no file extension, walk as folder
                        if metadata is None and "." not in name:
                            walk(full_path, depth + 1)
                        else:
                            size = metadata.get("size", 0) if isinstance(metadata, dict) else 0
                            collected[full_path] = size
            except Exception as e:
                logger.warning(f"Error listing bucket directory '{prefix}': {e}")

        logger.info(f"Scanning existing files in Supabase bucket '{self.bucket_name}'...")
        walk()
        logger.info(f"Found {len(collected)} files already in '{self.bucket_name}'")
        self._remote_files = collected
        return collected

    def exists(self, remote_path: str, local_size: Optional[int] = None) -> bool:
        """Check if file already exists in bucket, validating non-zero size."""
        remote_files = self.fetch_existing_files()
        clean_path = remote_path.replace("\\", "/").strip("/")

        if clean_path in remote_files:
            remote_size = remote_files[clean_path]
            if local_size is None or remote_size > 0:
                return True
        return False

    def upload_file(
        self,
        local_path: Path,
        remote_path: str,
        content_type: str = "application/pdf",
        upsert: bool = True,
        max_retries: int = 4,
    ) -> bool:
        """Upload a file to Supabase storage bucket with automatic retries and backoff."""
        if not self.is_configured():
            logger.error("Cannot upload: Supabase credentials missing.")
            return False

        if not local_path.exists():
            logger.error(f"Local file does not exist: {local_path}")
            return False

        clean_remote_path = remote_path.replace("\\", "/").strip("/")
        # URL encode path segments for safe HTTP transmission
        from urllib.parse import quote
        safe_encoded_path = "/".join(quote(seg, safe="()-_.!~*'()") for seg in clean_remote_path.split("/"))
        api_url = f"{self.url.rstrip('/')}/storage/v1/object/{self.bucket_name}/{safe_encoded_path}"

        headers = {
            "Authorization": f"Bearer {self.key}",
            "apikey": self.key,
            "x-upsert": "true" if upsert else "false",
            "Content-Type": content_type,
        }

        file_size = local_path.stat().st_size

        for attempt in range(1, max_retries + 1):
            try:
                with open(local_path, "rb") as f:
                    resp = self.session.post(
                        api_url,
                        headers=headers,
                        data=f,
                        timeout=180,
                    )

                if resp.status_code in (200, 201):
                    if self._remote_files is not None:
                        self._remote_files[clean_remote_path] = file_size
                    logger.info(f"Uploaded to Supabase: {clean_remote_path} ({file_size} bytes)")
                    return True

                err_text = resp.text
                err_lower = err_text.lower()

                # If Supabase reports object already exists / duplicate, treat as verified presence
                if resp.status_code in (400, 409) and any(k in err_lower for k in ("already exists", "duplicate", "keyalreadyexists")):
                    if self._remote_files is not None:
                        self._remote_files[clean_remote_path] = file_size
                    logger.info(f"Verified already in Supabase: {clean_remote_path}")
                    return True

                if resp.status_code in (413, 400) and any(k in err_lower for k in ("payload too large", "entitytoolarge", "exceeded the maximum allowed size")):
                    logger.warning(
                        f"Supabase Storage Quota: '{clean_remote_path}' ({file_size / (1024*1024):.1f}MB) exceeds Supabase single-file limit. "
                        f"Skipped to prevent retry loop."
                    )
                    return False

                if resp.status_code == 403 or "row-level security" in err_lower:
                    logger.warning(
                        f"Supabase RLS Policy: Write permission denied for '{clean_remote_path}'. "
                        f"Set SUPABASE_SERVICE_ROLE_KEY in .env or GitHub Secrets, or enable INSERT policy on bucket '{self.bucket_name}' for anon role."
                    )
                    return False

                logger.warning(f"Upload attempt {attempt} for '{clean_remote_path}' returned HTTP {resp.status_code}: {err_text[:120]}")
                time.sleep(2 * attempt)

            except Exception as e:
                logger.warning(f"Upload attempt {attempt} for '{clean_remote_path}' failed: {e}")
                time.sleep(2 * attempt)

        logger.error(f"Failed to upload '{clean_remote_path}' after {max_retries} attempts.")
        return False

    def upload_catalog_json(self, catalog_data: dict, remote_name: str = "catalog.json") -> bool:
        """Build and upload dynamic master catalog JSONs with direct Supabase public URLs and metadata."""
        if not self.is_configured():
            return False

        from datetime import datetime, timezone
        from urllib.parse import quote

        remote_files = self.fetch_existing_files()
        
        # Build enriched dynamic catalog
        enriched_classes = []
        total_books = 0
        total_uploaded = 0
        total_storage_bytes = 0

        for cls_obj in catalog_data.get("classes", []):
            cls_name = str(cls_obj.get("class", ""))
            enriched_subjects = []

            for subj_obj in cls_obj.get("subjects", []):
                subj_name = subj_obj.get("name", "")
                enriched_books = []

                for book in subj_obj.get("books", []):
                    title = book.get("title", "")
                    code = book.get("code", "")
                    total_books += 1

                    # Expected remote storage path
                    rel_path = f"Class {cls_name}/{subj_name}/{title}.pdf"
                    safe_rel_path = "/".join(quote(seg, safe="()-_.!~*'()") for seg in rel_path.split("/"))
                    public_url = f"{self.url.rstrip('/')}/storage/v1/object/public/{self.bucket_name}/{safe_rel_path}"

                    file_size = remote_files.get(rel_path, 0)
                    is_uploaded = rel_path in remote_files and file_size > 0

                    if is_uploaded:
                        total_uploaded += 1
                        total_storage_bytes += file_size

                    enriched_books.append({
                        **book,
                        "class": cls_name,
                        "subject": subj_name,
                        "storage_path": rel_path,
                        "url": public_url,
                        "is_available": is_uploaded,
                        "size_bytes": file_size,
                    })

                enriched_subjects.append({
                    "name": subj_name,
                    "books": enriched_books,
                })

            enriched_classes.append({
                "class": cls_name,
                "subjects": enriched_subjects,
            })

        unified_manifest = {
            "meta": {
                "version": "2.0.0",
                "app": "EduScrapeApp",
                "source": "NCERT Official",
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "total_classes": len(enriched_classes),
                "total_books": total_books,
                "total_uploaded_books": total_uploaded,
                "total_storage_bytes": total_storage_bytes,
                "supabase_bucket": self.bucket_name,
            },
            "classes": enriched_classes,
        }

        # Upload catalog.json and supabase_catalog.json
        success = True
        for fname in (remote_name, "supabase_catalog.json"):
            with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tmp:
                json.dump(unified_manifest, tmp, indent=2, ensure_ascii=False)
                tmp_path = Path(tmp.name)

            try:
                ok = self.upload_file(tmp_path, fname, content_type="application/json", upsert=True)
                if not ok:
                    success = False
            finally:
                tmp_path.unlink(missing_ok=True)

        return success


# Backward-compatible alias
SupabaseUploader = SupabaseReplenisher

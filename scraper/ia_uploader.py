#!/usr/bin/env python3
"""Internet Archive (IAS3) & Supabase PostgreSQL Replenisher.

Uploads and synchronizes NCERT textbook PDFs to Internet Archive (IAS3)
with zero egress fees and unlimited storage.
Synchronizes book metadata to the Supabase PostgreSQL `catalog` table via REST API.
"""

from __future__ import annotations

import json
import logging
import os
import tempfile
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import quote

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger("ncert_scraper.ia")

DEFAULT_BUCKET = "novaslate-ncert-library"

try:
    from dotenv import load_dotenv
    load_dotenv()
    load_dotenv(Path(__file__).parent.parent / ".env.local")
    load_dotenv(Path(__file__).parent.parent / ".env")
except ImportError:
    pass


class InternetArchiveReplenisher:
    """Manages uploading and synchronization with Internet Archive (IAS3) and Supabase DB."""

    def __init__(
        self,
        ia_access_key: Optional[str] = None,
        ia_secret_key: Optional[str] = None,
        bucket_name: Optional[str] = None,
        supabase_url: Optional[str] = None,
        supabase_key: Optional[str] = None,
    ):
        self.access_key = ia_access_key or os.getenv("IA_ACCESS_KEY")
        self.secret_key = ia_secret_key or os.getenv("IA_SECRET_KEY")
        self.bucket_name = (
            bucket_name
            or os.getenv("IA_BUCKET")
            or os.getenv("IA_ITEM_IDENTIFIER")
            or DEFAULT_BUCKET
        )
        self.supabase_url = (
            supabase_url
            or os.getenv("SUPABASE_URL")
            or os.getenv("VITE_SUPABASE_URL")
        )
        self.supabase_key = (
            supabase_key
            or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            or os.getenv("SUPABASE_KEY")
        )

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

        if self.is_ia_configured():
            logger.info(f"Connected to Internet Archive S3 (Item: {self.bucket_name})")
        else:
            logger.warning("Internet Archive credentials (IA_ACCESS_KEY, IA_SECRET_KEY) not found.")

        if self.is_supabase_configured():
            logger.info(f"Connected to Supabase PostgreSQL metadata ({self.supabase_url})")
        else:
            logger.warning("Supabase URL or Key not found in environment.")

    def is_ia_configured(self) -> bool:
        return bool(self.access_key and self.secret_key)

    def is_supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_key)

    def is_configured(self) -> bool:
        return self.is_ia_configured()

    def _ia_auth_header(self) -> str:
        return f"LOW {self.access_key}:{self.secret_key}"

    def get_public_url(self, remote_path: str) -> str:
        """Returns direct public download URL on Internet Archive."""
        clean_path = remote_path.replace("\\", "/").strip("/")
        safe_path = "/".join(quote(seg, safe="()-_.!~*'()") for seg in clean_path.split("/"))
        return f"https://archive.org/download/{self.bucket_name}/{safe_path}"

    def fetch_existing_files(self, refresh: bool = False) -> Dict[str, int]:
        """Fetch list of all files already present in the Internet Archive item."""
        if self._remote_files is not None and not refresh:
            return self._remote_files

        collected: Dict[str, int] = {}
        metadata_url = f"https://archive.org/metadata/{self.bucket_name}/files"

        try:
            resp = self.session.get(metadata_url, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                for f in data.get("result", []):
                    name = f.get("name", "")
                    size_val = f.get("size", 0)
                    try:
                        size = int(size_val)
                    except (ValueError, TypeError):
                        size = 0
                    if name:
                        collected[name.strip("/")] = size
        except Exception as e:
            logger.warning(f"Could not query Internet Archive metadata files: {e}")

        self._remote_files = collected
        logger.info(f"Found {len(collected)} files in Internet Archive item '{self.bucket_name}'")
        return collected

    def exists(self, remote_path: str, local_size: Optional[int] = None) -> bool:
        """Check if file exists in Internet Archive item with non-zero size."""
        clean_path = remote_path.replace("\\", "/").strip("/")
        remote_files = self.fetch_existing_files()

        if clean_path in remote_files and remote_files[clean_path] > 0:
            return True

        if not self.is_ia_configured():
            return False

        # Fallback HEAD check on S3 endpoint
        safe_path = "/".join(quote(seg, safe="()-_.!~*'()") for seg in clean_path.split("/"))
        head_url = f"https://s3.us.archive.org/{self.bucket_name}/{safe_path}"
        headers = {"Authorization": self._ia_auth_header()}
        try:
            resp = self.session.head(head_url, headers=headers, timeout=15)
            if resp.status_code == 200:
                sz = int(resp.headers.get("Content-Length", 0))
                if sz > 0:
                    if self._remote_files is not None:
                        self._remote_files[clean_path] = sz
                    return True
        except Exception:
            pass

        return False

    def upload_file(
        self,
        local_path: Path,
        remote_path: str,
        content_type: str = "application/pdf",
        max_retries: int = 4,
    ) -> bool:
        """Upload file directly to Internet Archive S3 with automatic bucket initialization."""
        if not self.is_ia_configured():
            logger.error("Cannot upload: Internet Archive credentials missing.")
            return False

        if not local_path.exists():
            logger.error(f"Local file does not exist: {local_path}")
            return False

        clean_remote_path = remote_path.replace("\\", "/").strip("/")
        safe_encoded_path = "/".join(quote(seg, safe="()-_.!~*'()") for seg in clean_remote_path.split("/"))
        api_url = f"https://s3.us.archive.org/{self.bucket_name}/{safe_encoded_path}"

        headers = {
            "Authorization": self._ia_auth_header(),
            "Content-Type": content_type,
            "x-amz-auto-make-bucket": "1",
            "x-archive-meta-mediatype": "texts",
            "x-archive-meta-collection": "opensource",
            "x-archive-meta-title": "NovaSlate NCERT Open Digital Library",
            "x-archive-ignore-preexisting-bucket": "1",
            "x-archive-queue-derive": "0",  # Disable automatic derive queuing for fast availability
        }

        file_size = local_path.stat().st_size

        for attempt in range(1, max_retries + 1):
            try:
                with open(local_path, "rb") as f:
                    resp = self.session.put(
                        api_url,
                        headers=headers,
                        data=f,
                        timeout=300,
                    )

                if resp.status_code in (200, 201):
                    if self._remote_files is not None:
                        self._remote_files[clean_remote_path] = file_size
                    logger.info(f"Uploaded to Internet Archive: {clean_remote_path} ({file_size} bytes)")
                    return True

                logger.warning(
                    f"IAS3 upload attempt {attempt} for '{clean_remote_path}' returned HTTP {resp.status_code}: {resp.text[:120]}"
                )
                time.sleep(2 * attempt)
            except Exception as e:
                logger.warning(f"IAS3 upload attempt {attempt} for '{clean_remote_path}' failed: {e}")
                time.sleep(2 * attempt)

        logger.error(f"Failed to upload '{clean_remote_path}' to Internet Archive after {max_retries} attempts.")
        return False

    def sync_catalog_record(
        self,
        cls: str,
        subject: str,
        title: str,
        code: str,
        remote_path: str,
        file_size: int,
    ) -> bool:
        """Upsert a single book metadata record into Supabase PostgreSQL catalog table."""
        if not self.is_supabase_configured():
            return False

        record = {
            "id": remote_path,
            "file_path": remote_path,
            "class": str(cls),
            "subject": subject,
            "title": title,
            "book_code": code,
            "url": self.get_public_url(remote_path),
            "size_bytes": file_size,
            "is_available": True,
            "updated_at": "now()",
        }

        endpoint = f"{self.supabase_url.rstrip('/')}/rest/v1/catalog"
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
        }

        try:
            resp = self.session.post(endpoint, headers=headers, json=[record], timeout=20)
            return resp.status_code in (200, 201)
        except Exception as e:
            logger.warning(f"Failed to upsert catalog record into Supabase: {e}")
            return False

    def upload_catalog_json(self, catalog_data: dict, remote_name: str = "catalog.json") -> bool:
        """Sync entire catalog metadata to Supabase PostgreSQL table & upload manifest to Internet Archive."""
        from datetime import datetime, timezone

        remote_files = self.fetch_existing_files()
        enriched_classes = []
        db_records: List[Dict[str, Any]] = []
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

                    rel_path = f"Class {cls_name}/{subj_name}/{title}.pdf"
                    file_size = remote_files.get(rel_path, 0)
                    is_uploaded = rel_path in remote_files and file_size > 0
                    public_url = self.get_public_url(rel_path)

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

                    db_records.append({
                        "id": rel_path,
                        "file_path": rel_path,
                        "class": cls_name,
                        "subject": subj_name,
                        "title": title,
                        "book_code": code,
                        "url": public_url,
                        "size_bytes": file_size,
                        "is_available": is_uploaded,
                    })

                enriched_subjects.append({
                    "name": subj_name,
                    "books": enriched_books,
                })

            enriched_classes.append({
                "class": cls_name,
                "subjects": enriched_subjects,
            })

        # 1. Sync metadata records to Supabase PostgreSQL catalog table in batches
        if self.is_supabase_configured() and db_records:
            endpoint = f"{self.supabase_url.rstrip('/')}/rest/v1/catalog"
            headers = {
                "apikey": self.supabase_key,
                "Authorization": f"Bearer {self.supabase_key}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates",
            }
            batch_size = 100
            synced_count = 0
            for i in range(0, len(db_records), batch_size):
                batch = db_records[i : i + batch_size]
                try:
                    resp = self.session.post(endpoint, headers=headers, json=batch, timeout=30)
                    if resp.status_code in (200, 201):
                        synced_count += len(batch)
                    else:
                        logger.warning(f"Supabase catalog batch sync failed ({resp.status_code}): {resp.text[:120]}")
                except Exception as e:
                    logger.warning(f"Supabase catalog batch sync error: {e}")
            logger.info(f"Synchronized {synced_count}/{len(db_records)} records to Supabase 'catalog' table.")

        # 2. Upload catalog.json manifest to Internet Archive item root
        unified_manifest = {
            "meta": {
                "version": "3.0.0",
                "app": "NovaSlate",
                "source": "NCERT Official",
                "storage": "Internet Archive (IAS3)",
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "total_classes": len(enriched_classes),
                "total_books": total_books,
                "total_uploaded_books": total_uploaded,
                "total_storage_bytes": total_storage_bytes,
                "ia_item": self.bucket_name,
            },
            "classes": enriched_classes,
        }

        success = True
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tmp:
            json.dump(unified_manifest, tmp, indent=2, ensure_ascii=False)
            tmp_path = Path(tmp.name)

        try:
            ok = self.upload_file(tmp_path, remote_name, content_type="application/json")
            if not ok:
                success = False
        finally:
            tmp_path.unlink(missing_ok=True)

        return success


# Alias
IAUploader = InternetArchiveReplenisher

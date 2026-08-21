#!/usr/bin/env python3
"""Supabase Storage Replenisher.

Manages direct uploading, synchronization, and deduplication of NCERT textbook PDFs
into the Supabase `ncert` storage bucket.
"""

from __future__ import annotations

import json
import logging
import os
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Set

try:
    from supabase import Client, create_client
    HAS_SUPABASE = True
except ImportError:
    Client = None
    create_client = None
    HAS_SUPABASE = False

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
        self.client: Optional[Client] = None
        self._remote_files: Optional[Dict[str, int]] = None

        if not HAS_SUPABASE:
            logger.warning("The 'supabase' Python package is not installed. To upload to Supabase, install it via: pip install supabase")
            return

        if self.url and self.key:
            try:
                self.client = create_client(self.url, self.key)
                logger.info(f"Connected to Supabase ({self.url})")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
        else:
            logger.warning("Supabase URL or Key not found in environment.")

    def is_configured(self) -> bool:
        return self.client is not None

    def fetch_existing_files(self, refresh: bool = False) -> Dict[str, int]:
        """Recursively list all existing files in the bucket.

        Returns:
            Dictionary mapping remote_path -> file_size_bytes
        """
        if self._remote_files is not None and not refresh:
            return self._remote_files

        if not self.client:
            return {}

        collected: Dict[str, int] = {}

        def walk(prefix: str = "", depth: int = 0):
            if depth > 4:
                return
            try:
                items = self.client.storage.from_(self.bucket_name).list(prefix, {"limit": 1000})
                for item in items:
                    name = item.get("name", "")
                    full_path = f"{prefix}/{name}".strip("/") if prefix else name
                    metadata = item.get("metadata")

                    # If it has no file extension and metadata is null, it is likely a folder
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
        """Check if file already exists in bucket, optionally validating non-zero size."""
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
    ) -> bool:
        """Upload a file to Supabase storage bucket."""
        if not self.client:
            logger.error("Cannot upload: Supabase client is not configured.")
            return False

        if not local_path.exists():
            logger.error(f"Local file does not exist: {local_path}")
            return False

        clean_remote_path = remote_path.replace("\\", "/").strip("/")

        try:
            with open(local_path, "rb") as f:
                file_bytes = f.read()

            file_options = {
                "content-type": content_type,
                "upsert": "true" if upsert else "false",
            }

            response = self.client.storage.from_(self.bucket_name).upload(
                path=clean_remote_path,
                file=file_bytes,
                file_options=file_options,
            )

            # Update cache
            if self._remote_files is not None:
                self._remote_files[clean_remote_path] = len(file_bytes)

            logger.info(f"Uploaded to Supabase: {clean_remote_path} ({len(file_bytes)} bytes)")
            return True

        except Exception as e:
            logger.error(f"Failed to upload {clean_remote_path}: {e}")
            return False

    def upload_catalog_json(self, catalog_data: dict, remote_name: str = "catalog.json") -> bool:
        """Upload master catalog JSON directly to bucket root."""
        if not self.client:
            return False

        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tmp:
            json.dump(catalog_data, tmp, indent=2, ensure_ascii=False)
            tmp_path = Path(tmp.name)

        try:
            return self.upload_file(tmp_path, remote_name, content_type="application/json", upsert=True)
        finally:
            tmp_path.unlink(missing_ok=True)

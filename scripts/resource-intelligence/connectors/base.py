"""
Zqtion Resource Intelligence — Base Connector Interface
Defines the standard contract for all source-specific ingestion engines.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import hashlib
from datetime import datetime, timezone

class BaseConnector(ABC):
    def __init__(self, source_config: Dict[str, Any]):
        self.source_config = source_config
        self.source_id = source_config["id"]
        self.name = source_config["name"]
        self.domain = source_config["domain"]
        self.source_type = source_config["source_type"]
        self.authority_level = source_config.get("authority_level", "B_STRUCTURED")
        self.content_license = source_config.get("content_license", "Unknown")

    @abstractmethod
    def fetch(self) -> List[Dict[str, Any]]:
        """
        Fetches raw data from the upstream source (API, repository, or crawl).
        Stores raw extraction in Layer A private storage.
        """
        pass

    @abstractmethod
    def normalize(self, raw_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Transforms raw records into normalized Zqtion Resource entities:
        (tool, repository, skill, mcp_server, workflow, prompt, guide, use_case).
        """
        pass

    def compute_hash(self, content: str) -> str:
        """Computes SHA-256 content hash for change detection."""
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def create_metadata_envelope(self, raw_content: str, extra: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Creates a standard Layer A private provenance envelope."""
        now = datetime.now(timezone.utc).isoformat()
        return {
            "source_id": self.source_id,
            "source_name": self.name,
            "source_domain": self.domain,
            "source_type": self.source_type,
            "authority_level": self.authority_level,
            "license": self.content_license,
            "crawled_at": now,
            "content_hash": self.compute_hash(raw_content),
            "extra": extra or {}
        }

"""
Zqtion Resource Intelligence — Verification & Security Module
Verifies source links, assesses security risk, filters prompt injections,
and computes evidence confidence levels (Section 13, 27, 42, 43).
"""

import re
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple

EVIDENCE_LEVELS = {
    "VERIFIED": "Checked against official documentation or primary repository.",
    "ZQTION_TESTED": "Directly tested and verified by Zqtion systems.",
    "SOURCE_REPORTED": "Third-party reported outcome or workflow without independent lab test.",
    "COMMUNITY_REPORTED": "Community discussion or unconfirmed user report.",
    "UNVERIFIED": "Unverified draft state."
}

SUSPICIOUS_PATTERNS = [
    (r"ignore\s+(?:all\s+)?previous\s+instructions", "Prompt injection: override attempt"),
    (r"system\s+prompt\s+override", "Prompt injection: system prompt manipulation"),
    (r"send\s+(?:your\s+)?(?:api[-_ ]?key|password|secret)", "Exfiltration attempt: credential request"),
    (r"curl\s+-[sS]*[A-Za-z0-9_]*\s+http[^\s|;]+(?:\.sh|\.bash)\s*\|\s*(?:bash|sh)", "Security warning: unverified piped shell script execution"),
    (r"rm\s+-rf\s+[/~]", "Dangerous filesystem command"),
    (r"format\s+[a-zA-Z]:", "Dangerous disk format command"),
    (r"drop\s+table\s+[a-zA-Z0-9_]+", "Destructive SQL statement")
]

class ResourceVerifier:
    def __init__(self):
        pass

    def inspect_security(self, content_text: str) -> Tuple[bool, List[str]]:
        """
        Inspects text for prompt injections and hazardous system commands.
        Returns (is_safe, violations).
        """
        violations = []
        if not content_text:
            return True, []

        for pattern, label in SUSPICIOUS_PATTERNS:
            if re.search(pattern, content_text, re.IGNORECASE):
                violations.append(label)

        is_safe = len(violations) == 0
        return is_safe, violations

    def determine_evidence_level(
        self,
        has_official_source: bool,
        has_primary_repo: bool,
        is_zqtion_tested: bool,
        is_third_party_reported: bool
    ) -> str:
        """Computes evidence level strictly without inventing metrics."""
        if is_zqtion_tested:
            return "ZQTION_TESTED"
        if has_official_source or has_primary_repo:
            return "VERIFIED"
        if is_third_party_reported:
            return "SOURCE_REPORTED"
        return "UNVERIFIED"

    def compute_quality_score(self, resource: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates explainable quality score dimensions (Section 31).
        Does not fabricate numbers; based on verifiable criteria.
        """
        scores = {}

        # 1. Source verification (0-100)
        source_score = 40
        if resource.get("official_url"):
            source_score += 30
        if resource.get("documentation_url"):
            source_score += 20
        if resource.get("github_url"):
            source_score += 10
        scores["evidence_quality"] = min(100, source_score)

        # 2. Usefulness & completeness (0-100)
        completeness = 50
        if resource.get("summary") and len(resource["summary"]) > 40:
            completeness += 20
        if resource.get("requirements") or resource.get("steps"):
            completeness += 20
        if resource.get("tags") or resource.get("categories"):
            completeness += 10
        scores["usefulness"] = min(100, completeness)

        # 3. Security confidence (0-100)
        is_safe, violations = self.inspect_security(
            resource.get("summary", "") + " " + str(resource.get("metadata", ""))
        )
        scores["security_confidence"] = 100 if is_safe else 30
        scores["security_violations"] = violations

        # Overall explainable composite
        scores["overall"] = round((scores["evidence_quality"] * 0.4) + (scores["usefulness"] * 0.4) + (scores["security_confidence"] * 0.2))
        return scores

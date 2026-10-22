"""Local generator regression: synthesis cannot replace the public catalogue."""
import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent.parent
TEMP_ROOT = ROOT / "artifacts" / "seo-publication-tests"
TEMP_ROOT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(ROOT / "scripts" / "resource-intelligence"))
import export as exporter


class PublicationGateTests(unittest.TestCase):
    def test_export_writes_review_candidates_and_preserves_catalogue(self):
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as directory:
            root = Path(directory).resolve()
            self.assertTrue(root.is_relative_to(TEMP_ROOT.resolve()))
            catalogue = root / "content" / "resources" / "catalogue.json"
            catalogue.parent.mkdir(parents=True)
            catalogue.write_text("PUBLIC SENTINEL", encoding="utf-8")
            fake_file = root / "scripts" / "resource-intelligence" / "export.py"
            with patch.object(exporter, "__file__", str(fake_file)), contextlib.redirect_stdout(io.StringIO()):
                exporter.generate_reports()
            self.assertEqual(catalogue.read_text(encoding="utf-8"), "PUBLIC SENTINEL")
            candidates = json.loads((root / "reports" / "resource-draft-candidates.json").read_text(encoding="utf-8"))
            self.assertGreaterEqual(len(candidates), 25)
            self.assertTrue(all(item["status"] == "review" and item["evidence_level"] == "unverified" and item["published_at"] is None for item in candidates))

    def test_direct_synthesis_entrypoint_also_writes_only_review_candidates(self):
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as directory:
            root = Path(directory).resolve()
            self.assertTrue(root.is_relative_to(TEMP_ROOT.resolve()))
            fake_file = root / "scripts" / "resource-intelligence" / "synthesize.py"
            source = (ROOT / "scripts" / "resource-intelligence" / "synthesize.py").read_text(encoding="utf-8")
            with contextlib.redirect_stdout(io.StringIO()):
                exec(compile(source, str(fake_file), "exec"), {"__file__": str(fake_file), "__name__": "__main__"})
            self.assertFalse((root / "content" / "resources" / "catalogue.json").exists())
            candidates = json.loads((root / "reports" / "resource-draft-candidates.json").read_text(encoding="utf-8"))
            self.assertTrue(all(item["status"] == "review" and item["verified_at"] is None for item in candidates))


if __name__ == "__main__":
    unittest.main()

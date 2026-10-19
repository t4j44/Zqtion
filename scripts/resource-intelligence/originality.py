"""
Zqtion Resource Intelligence — Originality Gate Module
Enforces strict anti-plagiarism and original synthesis policies (Section 3, 11, 12).
Calculates n-gram overlap, normalized token similarity, longest contiguous sequence,
and heading structural duplication against the private research corpus.
"""

import re
import unicodedata
from typing import List, Set, Dict, Any, Tuple

def words(text: str) -> List[str]:
    """Tokenizes normalized alphanumeric words."""
    normalized = unicodedata.normalize("NFKC", str(text)).lower()
    return re.findall(r'[\w]+', normalized)

def ngrams(tokens: List[str], n: int) -> Set[str]:
    """Builds a set of n-gram string tuples."""
    if len(tokens) < n:
        return set()
    return {" ".join(tokens[i:i+n]) for i in range(len(tokens) - n + 1)}

def longest_common_subsequence(tokens_a: List[str], tokens_b: List[str]) -> int:
    """Computes the length of the longest contiguous identical token sequence."""
    positions = {}
    for idx, token in enumerate(tokens_b):
        positions.setdefault(token, []).append(idx)

    previous = {}
    longest = 0
    for token in tokens_a:
        current = {}
        for j in positions.get(token, []):
            length = previous.get(j - 1, 0) + 1
            current[j] = length
            if length > longest:
                longest = length
        previous = current
    return longest

class OriginalityChecker:
    def __init__(
        self,
        max_5gram_overlap: float = 0.15,
        max_normalized_similarity: float = 0.65,
        max_contiguous_tokens: int = 18
    ):
        self.max_5gram_overlap = max_5gram_overlap
        self.max_normalized_similarity = max_normalized_similarity
        self.max_contiguous_tokens = max_contiguous_tokens

    def check_similarity(self, candidate_text: str, source_text: str) -> Dict[str, Any]:
        """
        Compares candidate text against a source text.
        Returns similarity metrics and originality pass/block flag.
        """
        toks_a = words(candidate_text)
        toks_b = words(source_text)

        if not toks_a or not toks_b:
            return {
                "overlap_5gram": 0.0,
                "normalized_similarity": 0.0,
                "longest_contiguous_sequence": 0,
                "structural_duplication": False,
                "blocked": False,
                "reason": "Empty comparison"
            }

        # 1. 5-gram overlap
        ng_a = ngrams(toks_a, 5)
        ng_b = ngrams(toks_b, 5)
        intersection_count = len(ng_a.intersection(ng_b))
        overlap_5gram = intersection_count / max(1, len(ng_a))

        # 2. Jaccard unigram similarity
        set_a = set(toks_a)
        set_b = set(toks_b)
        common_unigrams = len(set_a.intersection(set_b))
        union_unigrams = len(set_a.union(set_b))
        normalized_sim = common_unigrams / max(1, union_unigrams)

        # 3. Longest contiguous token sequence
        longest_seq = longest_common_subsequence(toks_a, toks_b)

        # 4. Heading structural duplication
        headings_a = [words(h) for h in re.findall(r'^#{1,4}\s+(.+)$', candidate_text, flags=re.MULTILINE)]
        headings_b = [words(h) for h in re.findall(r'^#{1,4}\s+(.+)$', source_text, flags=re.MULTILINE)]
        str_headings_a = [" ".join(h) for h in headings_a if h]
        str_headings_b = [" ".join(h) for h in headings_b if h]

        structural_duplication = (
            len(str_headings_a) >= 3 and
            len(str_headings_b) >= 3 and
            "|".join(str_headings_a) == "|".join(str_headings_b)
        )

        # Decision
        blocked = False
        reasons = []

        if overlap_5gram > self.max_5gram_overlap:
            blocked = True
            reasons.append(f"5-gram overlap ({overlap_5gram:.1%}) exceeds threshold ({self.max_5gram_overlap:.1%})")

        if normalized_sim > self.max_normalized_similarity:
            blocked = True
            reasons.append(f"Normalized similarity ({normalized_sim:.1%}) exceeds threshold ({self.max_normalized_similarity:.1%})")

        if longest_seq >= self.max_contiguous_tokens:
            blocked = True
            reasons.append(f"Contiguous token sequence ({longest_seq} tokens) exceeds limit ({self.max_contiguous_tokens})")

        if structural_duplication:
            blocked = True
            reasons.append("Identical section heading structure detected")

        return {
            "overlap_5gram": round(overlap_5gram, 4),
            "normalized_similarity": round(normalized_sim, 4),
            "longest_contiguous_sequence": longest_seq,
            "structural_duplication": structural_duplication,
            "blocked": blocked,
            "reasons": reasons
        }

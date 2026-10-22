import type { EvidenceLevel } from "./types";
export const evidenceLabels: Record<EvidenceLevel, string> = {
  verified: "Tested with documented method",
  zqtion_tested: "Tested with documented method",
  source_reported: "Source reported",
  community_reported: "Community experience",
  unverified: "Unverified — review pending",
};

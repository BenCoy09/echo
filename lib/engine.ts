import type { Evidence, Receipt } from "./types";
import { hashEvidence } from "./hash";
import { ENGINE_VERSION, evaluate } from "./evaluate";

// The decision logic lives in ./evaluate (pure, browser-safe). Re-exported here so existing imports keep working.
export { ENGINE_VERSION, evaluate };

export function seal(id: string, createdAt: string, evidence: Evidence): Receipt {
  return { id, createdAt, engineVersion: ENGINE_VERSION, evidence, result: evaluate(evidence), evidenceHash: hashEvidence(evidence) };
}

/** Re-run from stored evidence; compare against what was stored at seal time. */
export function verify(r: Receipt) {
  const recomputed = evaluate(r.evidence);
  const recomputedHash = hashEvidence(r.evidence);
  return {
    hashMatch: recomputedHash === r.evidenceHash,
    outputMatch: JSON.stringify(recomputed) === JSON.stringify(r.result),
    recomputedHash, recomputed,
  };
}

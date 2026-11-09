import { createHash } from "crypto";
/** Canonical JSON: sorted keys, no whitespace. Same input → same bytes → same hash. */
export function canonical(v: unknown): string {
  if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return "{" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + canonical(o[k])).join(",") + "}";
  }
  return JSON.stringify(v) ?? "null";
}
export const hashEvidence = (e: unknown) => createHash("sha256").update(canonical(e)).digest("hex");

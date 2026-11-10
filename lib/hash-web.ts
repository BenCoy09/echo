import { canonical } from "./canonical";

/** Same digest as the server's hashEvidence, computed with the browser's Web Crypto. */
export async function hashEvidenceWeb(e: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonical(e));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

"use client";
import { useEffect, useState } from "react";
import { evaluate, ENGINE_VERSION } from "@/lib/evaluate";
import { canonical } from "@/lib/canonical";
import { hashEvidenceWeb } from "@/lib/hash-web";
import type { Receipt } from "@/lib/types";

type Out = { error: string } | { hashMatch: boolean; outputMatch: boolean; recomputed: string; stored: string; sealedBy: string };

export function VerifyLocal() {
  const [text, setText] = useState("");
  const [out, setOut] = useState<Out | null>(null);

  // /verify?id=<receipt id> pre-loads that receipt's JSON.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) fetch(`/api/receipt/${encodeURIComponent(id)}`).then((r) => r.json()).then((j) => setText(JSON.stringify(j, null, 2))).catch(() => {});
  }, []);

  async function run() {
    try {
      const r = JSON.parse(text) as Receipt;
      if (!r?.evidence || !r?.result || typeof r.evidenceHash !== "string") return setOut({ error: "That does not look like an Echo receipt (needs evidence, result and evidenceHash)." });
      const recomputed = await hashEvidenceWeb(r.evidence);
      setOut({ hashMatch: recomputed === r.evidenceHash, outputMatch: canonical(evaluate(r.evidence)) === canonical(r.result), recomputed, stored: r.evidenceHash, sealedBy: r.engineVersion });
    } catch { setOut({ error: "Could not read that as a receipt. Paste the full JSON." }); }
  }
  // Demo: change one input and watch verification fail.
  function tamper() {
    try { const r = JSON.parse(text); r.evidence.voicesObserved = (r.evidence.voicesObserved ?? 0) + 1; setText(JSON.stringify(r, null, 2)); setOut(null); } catch { /* ignore */ }
  }
  const ok = out && !("error" in out) && out.hashMatch && out.outputMatch;
  return (
    <div className="mt-6 max-w-2xl">
      <label className="label" htmlFor="receipt-json">Receipt JSON</label>
      <textarea id="receipt-json" value={text} onChange={(e) => { setText(e.target.value); setOut(null); }} spellCheck={false}
        placeholder="Paste a receipt's JSON here, or open this page from a receipt to pre-load it."
        className="mt-2 h-72 w-full border border-ink-line bg-ink-2 p-3 font-mono text-xs text-bone-dim placeholder:text-bone-mute" />
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={run} className="bg-brass px-5 py-3 text-sm font-medium text-ink hover:bg-bone">Verify in this browser</button>
        <button onClick={tamper} className="border border-ink-line px-5 py-3 text-sm hover:border-bone-mute">Change one input (demo)</button>
      </div>
      <div aria-live="polite" className="mt-5 font-mono text-xs">
        {out && ("error" in out ? <p className="text-rust">{out.error}</p> : (
          <div className="space-y-1">
            <p className={ok ? "text-verdigris" : "text-rust"}>{ok ? "✓ Verified: the evidence reproduces the sealed hash and decision." : "✗ Mismatch: this receipt differs from what was sealed."}</p>
            <p className={out.hashMatch ? "text-bone-dim" : "text-rust"}>{out.hashMatch ? "✓" : "✗"} SHA-256 of the evidence {out.hashMatch ? "matches" : "does not match"} the stored hash</p>
            <p className={out.outputMatch ? "text-bone-dim" : "text-rust"}>{out.outputMatch ? "✓" : "✗"} Engine output {out.outputMatch ? "matches" : "does not match"} the stored decision</p>
            <p className="break-all text-bone-mute">recomputed {out.recomputed}</p>
            <p className="break-all text-bone-mute">stored {out.stored}</p>
            {out.sealedBy !== ENGINE_VERSION && <p className="text-brass">Sealed by {out.sealedBy}; this page runs {ENGINE_VERSION}.</p>}
          </div>))}
      </div>
    </div>
  );
}

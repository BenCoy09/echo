"use client";
import { useState } from "react";

type V = { hashMatch: boolean; outputMatch: boolean; recomputedHash: string };
export function VerifyButton({ id }: { id: string }) {
  const [v, setV] = useState<V | null>(null);
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try { setV(await (await fetch(`/api/verify/${id}`, { cache: "no-store" })).json()); } finally { setBusy(false); }
  }
  const ok = v?.hashMatch && v?.outputMatch;
  return (
    <div>
      <button onClick={run} disabled={busy} className="bg-brass px-5 py-3 text-sm font-medium text-ink hover:bg-bone disabled:opacity-50">
        {busy ? "Re-running…" : "Re-run from stored evidence"}
      </button>
      <div aria-live="polite" className="mt-4 font-mono text-xs">
        {v && (<p className={ok ? "text-verdigris" : "text-rust"}>
          {ok ? "✓ Identical output and hash reproduced" : "✗ Mismatch: evidence or output differs from the sealed receipt"}
          <span className="mt-1 block text-bone-mute">sha256 {v.recomputedHash}</span></p>)}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const field = "w-full border border-ink-line bg-ink-2 px-3 py-2 text-sm placeholder:text-bone-mute";
export function VoidButton({ id }: { id: string }) {
  const router = useRouter();
  const [reason, setReason] = useState(""), [key, setKey] = useState(""), [msg, setMsg] = useState("");
  async function run() {
    if (!window.confirm("Void this receipt? It stays visible but is excluded from the track record.")) return;
    const res = await fetch(`/api/void/${id}`, { method: "POST", headers: { "content-type": "application/json", ...(key ? { "x-echo-key": key } : {}) }, body: JSON.stringify({ reason }) });
    if (res.ok) router.refresh(); else setMsg((await res.json().catch(() => ({})))?.error ?? "Could not void");
  }
  return (
    <details className="mt-8 border border-ink-line">
      <summary className="label cursor-pointer px-4 py-3">Void this receipt (operator)</summary>
      <div className="max-w-xl space-y-3 border-t border-ink-line p-4">
        <p className="text-xs text-bone-mute">Receipts are never edited or deleted. A mistake is voided with a public reason and leaves the track record.</p>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason, e.g. wrong token entered" className={field} aria-label="Reason" />
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Ingest key" className={field} aria-label="Ingest key" />
        <button onClick={run} className="border border-rust px-4 py-2 text-sm text-rust hover:bg-rust hover:text-ink">Void receipt</button>
        {msg && <p className="text-sm text-rust">{msg}</p>}
      </div>
    </details>
  );
}

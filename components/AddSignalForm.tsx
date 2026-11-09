"use client";
import { useState } from "react";
import Link from "next/link";

type Row = { url: string; handle: string; stance: "long" | "short"; postedAt: string; excerpt: string };
type Out = { ok: boolean; id?: string; status?: string; reasons?: string[]; error?: string };

const blank = (): Row => ({ url: "", handle: "", stance: "long", postedAt: "", excerpt: "" });
const platformOf = (u: string) => (u.includes("t.me") ? "telegram" : u.includes("discord") ? "discord" : "x");
const field = "w-full border border-ink-line bg-ink-2 px-3 py-2 text-sm placeholder:text-bone-mute";

export function AddSignalForm() {
  const [token, setToken] = useState("");
  const [observed, setObserved] = useState("5");
  const [rows, setRows] = useState<Row[]>([blank(), blank(), blank()]);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<Out | null>(null);

  const set = (i: number, p: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...p } : r)));
  // Fill the handle from an x.com/<handle>/status/<id> link.
  const fromUrl = (i: number) => {
    const m = rows[i].url.match(/(?:x|twitter)\.com\/([^/?#]+)\/status/i);
    if (m && !rows[i].handle) set(i, { handle: m[1] });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rows.some((r) => Number.isNaN(Date.parse(r.postedAt)))) return setOut({ ok: false, error: "Add the time each post was made." });
    if (!window.confirm(`Seal ${rows.length} posts as $${token}? Receipts cannot be edited, only voided.`)) return;
    setBusy(true); setOut(null);
    try {
      const res = await fetch("/api/collect", {
        method: "POST",
        headers: { "content-type": "application/json", ...(key ? { "x-echo-key": key } : {}) },
        body: JSON.stringify({
          token, voicesObserved: Number(observed), windowHours: 6,
          mentions: rows.map((r) => ({ handle: r.handle.replace(/^@/, "").trim(), platform: platformOf(r.url), url: r.url.trim(), postedAt: new Date(r.postedAt).toISOString(), stance: r.stance, ...(r.excerpt ? { excerpt: r.excerpt.slice(0, 140) } : {}) })),
        }),
      });
      setOut({ ok: res.ok, ...(await res.json()) });
    } catch { setOut({ ok: false, error: "Could not reach the server." }); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mt-6 max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="label">Token</span>
          <input required value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} placeholder="SOL" className={`${field} mt-2`} /></label>
        <label className="block"><span className="label">Voices you checked</span>
          <input required type="number" min={rows.length} value={observed} onChange={(e) => setObserved(e.target.value)} className={`${field} mt-2`} /></label>
      </div>
      <p className="-mt-3 text-xs text-bone-mute">Count every curated voice you looked at, including ones who said nothing. Convergence is posts that agree divided by this number, so be honest. Use posts from the last 6 hours.</p>

      {rows.map((r, i) => (
        <fieldset key={i} className="space-y-3 border border-ink-line p-4">
          <legend className="label px-2">Post {i + 1}</legend>
          <input required type="url" value={r.url} onChange={(e) => set(i, { url: e.target.value })} onBlur={() => fromUrl(i)} placeholder="https://x.com/handle/status/123…" className={field} aria-label="Post link" />
          <div className="grid gap-3 sm:grid-cols-3">
            <input required value={r.handle} onChange={(e) => set(i, { handle: e.target.value })} placeholder="handle" className={field} aria-label="Handle" />
            <select value={r.stance} onChange={(e) => set(i, { stance: e.target.value as Row["stance"] })} className={field} aria-label="Stance"><option value="long">long (bullish)</option><option value="short">short (bearish)</option></select>
            <input required type="datetime-local" value={r.postedAt} onChange={(e) => set(i, { postedAt: e.target.value })} className={field} aria-label="Time posted" />
          </div>
          <input value={r.excerpt} onChange={(e) => set(i, { excerpt: e.target.value })} placeholder="Optional: paste the key line from the post" className={field} aria-label="Excerpt" />
          {rows.length > 3 && <button type="button" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="label hover:text-bone">Remove</button>}
        </fieldset>
      ))}
      <button type="button" onClick={() => setRows((rs) => [...rs, blank()])} className="label hover:text-bone">+ Add another post</button>

      <label className="block"><span className="label">Ingest key (only if you set ECHO_INGEST_KEY)</span>
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)} className={`${field} mt-2`} /></label>

      <button disabled={busy} className="bg-brass px-5 py-3 text-sm font-medium text-ink hover:bg-bone disabled:opacity-50">{busy ? "Sealing…" : "Seal receipt"}</button>

      <div aria-live="polite" className="text-sm">
        {out && (out.ok ? (
          <div className="border border-ink-line bg-ink-2 p-4">
            <p className={out.status === "sized" ? "text-verdigris" : "text-rust"}>Sealed: {out.status}.</p>
            {out.reasons?.map((x) => <p key={x} className="mt-1 text-bone-dim">{x}</p>)}
            <Link href={`/receipt/${out.id}`} className="mt-3 inline-block text-brass hover:text-bone">Open receipt →</Link>
          </div>
        ) : <p className="text-rust">{out.error}</p>)}
      </div>
    </form>
  );
}

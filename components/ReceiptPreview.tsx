import Link from "next/link";
import type { Receipt } from "@/lib/types";
import { fmt } from "@/lib/format";

export function ReceiptPreview({ r }: { r: Receipt }) {
  const { result: x, evidence: e } = r, ok = x.status === "sized";
  return (
    <article className="border border-ink-line bg-ink-2" aria-label="Sample receipt">
      <header className="flex items-center justify-between border-b border-ink-line px-5 py-4">
        <span className="label">Receipt · {r.id}</span>
        <span className={`font-mono text-xs ${ok ? "text-verdigris" : "text-rust"}`}>● {x.status.toUpperCase()}</span>
      </header>
      <div className="px-5 py-5">
        <h3 className="font-display text-2xl">
          <Link href={`/receipt/${r.id}`} className="hover:text-brass">${e.token} · {ok ? `${x.direction} · ${x.sizePct}% risk` : "no signal"}</Link>
        </h3>
        <p className="mt-1 text-sm text-bone-dim">{x.aligned} of {e.voicesObserved} curated voices aligned within {e.windowHours}h.</p>
        {!ok && <ul className="mt-3 border-l-2 border-rust pl-3 text-sm">{x.reasons.map((s) => <li key={s} className="py-0.5">{s}</li>)}</ul>}
        <div className="mt-4">
          {e.market.map((m) => (
            <div key={m.path} className="flex items-baseline justify-between gap-4 border-b border-ink-line py-3">
              <code className="break-all font-mono text-xs text-bone-mute">{m.path}</code>
              <span className="font-mono text-sm">{fmt(m)}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-xs text-bone-mute">sha256 {r.evidenceHash.slice(0, 16)}… · re-run reproduces hash</p>
      </div>
    </article>
  );
}

import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { VerifyButton } from "@/components/VerifyButton";
import { getReceipt, outcome } from "@/lib/store";
import { fmt, when } from "@/lib/format";

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const r = getReceipt(params.id);
  if (!r) notFound();
  const { result: x, evidence: e } = r, ok = x.status === "sized";
  const th = "label py-2 text-left font-normal";
  return (<>
    <SiteHeader />
    <main className="mx-auto max-w-page px-5 py-7">
      <p className="label">Receipt · {r.id} · sealed {when(r.createdAt)}</p>
      <h1 className="mt-3 font-display text-4xl">${e.token}: {ok ? `${x.direction}, ${x.sizePct}% risk` : "no sized signal"}</h1>
      {!ok && (
        <ul className="mt-5 max-w-xl border-l-2 border-rust pl-4 text-sm">
          {x.reasons.map((s) => <li key={s} className="py-1">{s}</li>)}
        </ul>
      )}
      <p className="mt-4 text-sm text-bone-dim">Convergence {x.confidence}: {x.aligned} of {e.voicesObserved} curated voices aligned within {e.windowHours}h.</p>

      <h2 className="mt-8 font-display text-2xl">Voices</h2>
      <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[520px] text-sm">
        <thead><tr><th className={th}>Handle</th><th className={th}>Platform</th><th className={th}>Stance</th><th className={th}>Posted</th></tr></thead>
        <tbody>{e.mentions.map((m) => (
          <tr key={m.url} className="border-t border-ink-line">
            <td className="py-2"><a href={m.url} className="hover:text-brass">@{m.handle}</a></td>
            <td className="text-bone-dim">{m.platform}</td><td>{m.stance}</td><td className="font-mono text-xs text-bone-mute">{when(m.postedAt)}</td>
          </tr>))}</tbody>
      </table></div>

      <h2 className="mt-8 font-display text-2xl">Market cross-check</h2>
      <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[520px] text-sm">
        <thead><tr><th className={th}>Source path</th><th className={th}>Fetched</th><th className={`${th} text-right`}>Value</th></tr></thead>
        <tbody>{e.market.map((m) => (
          <tr key={m.path} className="border-t border-ink-line">
            <td className="py-2 font-mono text-xs">{m.path}</td>
            <td className="font-mono text-xs text-bone-mute">{when(m.fetchedAt)}</td>
            <td className={`text-right font-mono ${m.value === null ? "text-rust" : ""}`}>{fmt(m)}</td>
          </tr>))}</tbody>
      </table></div>

      {r.grade && <p className="mt-6 text-sm text-bone-dim">Graded over {r.grade.horizonH}h: <span className="font-mono">{r.grade.returnPct > 0 ? "+" : ""}{r.grade.returnPct}%</span> · {outcome(r)}</p>}

      <h2 className="mt-8 font-display text-2xl">Verify</h2>
      <p className="mb-4 mt-2 max-w-xl text-sm text-bone-dim">Re-runs the {r.engineVersion} engine on the stored evidence and compares the output and hash with the sealed receipt.</p>
      <VerifyButton id={r.id} />
      <details className="mt-8 border border-ink-line">
        <summary className="label cursor-pointer px-4 py-3">Raw receipt JSON</summary>
        <pre className="overflow-x-auto border-t border-ink-line p-4 font-mono text-xs text-bone-dim">{JSON.stringify(r, null, 2)}</pre>
      </details>
    </main>
  </>);
}

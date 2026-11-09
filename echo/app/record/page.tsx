import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getReceipts, outcome, stats } from "@/lib/store";

export const metadata = { title: "Track record · Echo" };
export default function Record() {
  const s = stats(), rs = getReceipts(), th = "label py-2 text-left font-normal";
  const color = { hit: "text-verdigris", miss: "text-rust", "not traded": "text-bone-mute" } as const;
  return (<>
    <SiteHeader />
    <main className="mx-auto max-w-page px-5 py-7">
      <p className="label">Track record · sample data · n = {s.sized} sized</p>
      <h1 className="mt-3 font-display text-4xl">{s.hits} of {s.sized} sized calls were right.</h1>
      <p className="mt-3 max-w-xl text-sm text-bone-dim">Graded on the 24h move after sealing. Refused receipts are listed with the move they avoided, but are not counted in the hit rate. At this sample size, treat the rate as illustrative.</p>
      <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[560px] text-sm">
        <thead><tr><th className={th}>Receipt</th><th className={th}>Call</th><th className={th}>24h move</th><th className={th}>Outcome</th></tr></thead>
        <tbody>{rs.map((r) => { const o = outcome(r); return (
          <tr key={r.id} className="border-t border-ink-line">
            <td className="py-3"><Link href={`/receipt/${r.id}`} className="hover:text-brass">${r.evidence.token}</Link></td>
            <td className="text-bone-dim">{r.result.status === "sized" ? `${r.result.direction} · ${r.result.sizePct}%` : "refused"}</td>
            <td className="font-mono">{r.grade ? `${r.grade.returnPct > 0 ? "+" : ""}${r.grade.returnPct}%` : "n/a"}</td>
            <td className={color[o]}>{o}</td>
          </tr>); })}</tbody>
      </table></div>
    </main>
  </>);
}

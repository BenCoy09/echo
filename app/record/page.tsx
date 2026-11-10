import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getReceipts, outcome } from "@/lib/store";
import { runGrading } from "@/lib/grader";
import { record } from "@/lib/record";
import { when } from "@/lib/format";
import type { Receipt } from "@/lib/types";

export const metadata = { title: "Track record · Echo" };
export const dynamic = "force-dynamic";

const pct = (x: number) => `${Math.round(x * 100)}%`;
const th = "label py-2 text-left font-normal";
const color = { hit: "text-verdigris", miss: "text-rust", pending: "text-brass", "not traded": "text-bone-mute" } as const;

function Cards({ s, big }: { s: ReturnType<typeof record>; big?: boolean }) {
  const items = [
    ["Accuracy", s.n ? pct(s.accuracy) : "n/a", `${s.correct} of ${s.n} sized calls`],
    ["95% interval", s.n ? `${pct(s.interval[0])}–${pct(s.interval[1])}` : "n/a", "Wilson; wide at small n"],
    ["Avg move for the call", s.n ? `${s.avgMove > 0 ? "+" : ""}${s.avgMove.toFixed(1)}%` : "n/a", "24h, direction-adjusted"],
    ["Sample size", String(s.n), `${s.graded.length - s.n} refusals also graded`],
  ];
  return (
    <dl className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
      {items.map(([k, v, n]) => (
        <div key={k} className="border-l border-ink-line pl-4"><dt className="label">{k}</dt>
          <dd className={`mt-2 font-display ${big ? "text-4xl" : "text-2xl text-bone-dim"}`}>{v}</dd><p className="mt-1 text-xs text-bone-mute">{n}</p></div>))}
    </dl>
  );
}

function Grades({ rows }: { rows: Receipt[] }) {
  return (
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
      <thead><tr><th className={th}>Receipt</th><th className={th}>Call</th><th className={th}>Entry → exit</th><th className={th}>24h move</th><th className={th}>Outcome</th><th className={th}>Graded</th></tr></thead>
      <tbody>{rows.map((r) => { const g = r.grade!, o = outcome(r); return (
        <tr key={r.id} className="border-t border-ink-line">
          <td className="py-3"><Link href={`/receipt/${r.id}`} className="hover:text-brass">${r.evidence.token}</Link></td>
          <td className="text-bone-dim">{r.result.status === "sized" ? `${r.result.direction} · ${r.result.sizePct}%` : "refused"}</td>
          <td className="font-mono text-xs">{g.entryPrice} → {g.exitPrice}</td>
          <td className="font-mono">{g.returnPct > 0 ? "+" : ""}{g.returnPct}%</td>
          <td className={color[o]}>{o}</td>
          <td className="font-mono text-xs text-bone-mute">{when(g.gradedAt!)}</td>
        </tr>); })}</tbody>
    </table></div>
  );
}

export default async function Record() {
  const job = await runGrading(); // idempotent; also exposed at POST /api/grade
  const L = record("live"), S = record("sample"), all = getReceipts();
  const liveAll = all.filter((r) => r.origin === "ingest"), livePending = liveAll.filter((r) => !r.grade?.gradedAt).length;
  const newest = (a: Receipt, b: Receipt) => b.createdAt.localeCompare(a.createdAt);
  const refused = all.filter((r) => r.result.status === "refused").sort(newest);
  return (<>
    <SiteHeader />
    <main className="mx-auto max-w-page px-5 py-7">
      <p className="label">Track record · prices: {job.source}</p>
      {job.errors.length > 0 && <p className="mt-2 text-xs text-rust">Price lookup failed for {job.errors.length} receipt(s): {job.errors[0]}</p>}

      <section aria-labelledby="live">
        <h1 id="live" className="mt-3 font-display text-4xl">{L.n ? `Live: ${L.correct} of ${L.n} sized calls were right.` : "Live: no calls graded yet."}</h1>
        <p className="mt-3 max-w-xl text-sm text-bone-dim">Live receipts come from real posts by curated voices. Each is graded on the 24h move after sealing: a long is right if price rose, a short if it fell.{liveAll.length > 0 && ` ${liveAll.length} sealed, ${livePending} still inside their 24h window.`}</p>
        <Cards s={L} big />
        {L.graded.length ? <Grades rows={[...L.graded].sort(newest)} /> :
          <p className="mt-6 border border-ink-line p-4 text-sm text-bone-mute">Nothing to grade yet. Live receipts appear here 24 hours after they are sealed.</p>}
      </section>

      <section aria-labelledby="refusals" className="mt-9">
        <div className="rule mb-6" />
        <h2 id="refusals" className="font-display text-2xl">Where Echo declined to call it</h2>
        <p className="mt-2 max-w-xl text-sm text-bone-dim">Voices agreed, but the market data did not support a size. These are kept on the record, with the move that followed. They never count toward accuracy.</p>
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {refused.map((r) => (
            <li key={r.id} className="border border-ink-line bg-ink-2 p-4">
              <div className="flex items-baseline justify-between">
                <Link href={`/receipt/${r.id}`} className="font-display text-lg hover:text-brass">${r.evidence.token}</Link>
                <span className="label">{r.origin === "ingest" ? "live" : "sample"}</span>
              </div>
              <ul className="mt-2 border-l-2 border-rust pl-3 text-sm">{r.result.reasons.map((x) => <li key={x} className="py-0.5">{x}</li>)}</ul>
              <p className="mt-3 text-xs text-bone-mute">{r.grade?.gradedAt ? `Price moved ${r.grade.returnPct > 0 ? "+" : ""}${r.grade.returnPct}% over 24h. No position was sized.` : "Awaiting 24h grade. No position was sized."}</p>
            </li>))}
        </ul>
      </section>

      <section aria-labelledby="sample" className="mt-9">
        <div className="rule mb-6" />
        <h2 id="sample" className="font-display text-2xl">Sample receipts</h2>
        <p className="mt-2 max-w-xl text-sm text-bone-mute">Synthetic voices on real tickers, graded on real prices. They demonstrate grading and refusals and are not part of the live numbers above.</p>
        <Cards s={S} />
        <Grades rows={[...S.graded].sort(newest)} />
      </section>
    </main>
  </>);
}

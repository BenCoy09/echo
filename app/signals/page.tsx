import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getReceipts } from "@/lib/store";
import { when } from "@/lib/format";

export const metadata = { title: "Signals · Echo" };
// Receipts change at runtime, so never prerender this page at build time.
export const dynamic = "force-dynamic";
export default function Signals() {
  const rs = getReceipts();
  return (<>
    <SiteHeader />
    <main className="mx-auto max-w-page px-5 py-7">
      <p className="label">Signals feed · sample data</p>
      <h1 className="mt-3 font-display text-4xl">Every call, including the refusals.</h1>
      <ul className="mt-6 border-t border-ink-line">
        {rs.map((r) => {
          const ok = r.result.status === "sized";
          return (
            <li key={r.id} className="border-b border-ink-line">
              <Link href={`/receipt/${r.id}`} className="grid gap-2 py-5 hover:bg-ink-2 sm:grid-cols-[110px_1fr_auto] sm:items-baseline sm:px-3">
                <span className="font-display text-2xl">${r.evidence.token}{r.origin === "ingest" && <span className="label ml-2 text-verdigris">live</span>}</span>
                <span className="text-sm text-bone-dim">{ok ? `${r.result.direction} · ${r.result.sizePct}% risk · convergence ${r.result.confidence}` : r.result.reasons[0]}</span>
                <span className={`font-mono text-xs ${ok ? "text-verdigris" : "text-rust"}`}>{when(r.createdAt)} · {r.result.status.toUpperCase()}</span>
              </Link>
            </li>);
        })}
      </ul>
    </main>
  </>);
}

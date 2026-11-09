import { SiteHeader } from "@/components/SiteHeader";

export const metadata = { title: "How verification works · Echo" };
const S = [
  ["Evidence is fixed at sealing", "Every post and market reading the engine used is stored in the receipt with its URL or source path and a timestamp. Nothing is fetched at verification time."],
  ["The engine is deterministic", "Convergence is aligned voices divided by voices monitored. Sizing is a fixed function of that score. No clock, randomness or model call sits in the decision path."],
  ["The hash seals the evidence", "A SHA-256 over canonical JSON (sorted keys, no whitespace) of the evidence block is stored. Altering any input changes the hash."],
  ["Re-run compares, it doesn’t trust", "Verification recomputes the output and hash from stored evidence and compares them with what was sealed. Any difference is reported as a mismatch."],
  ["Refusal is a first-class result", "Missing data, conflicting sources, thin liquidity, crowded funding or weak convergence all produce a refusal with the reasons listed. No size is produced."],
  ["Grading is separate", "Receipts are graded afterwards against the realised 24h move. Hit rate counts sized calls only and is shown with its sample size."],
];
export default function About() {
  return (<>
    <SiteHeader />
    <main className="mx-auto max-w-page px-5 py-7">
      <p className="label">About</p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl">How verification works</h1>
      <ol className="mt-6 max-w-2xl border-t border-ink-line">
        {S.map(([t, d], i) => (
          <li key={t} className="grid gap-1 border-b border-ink-line py-5 sm:grid-cols-[48px_1fr]">
            <span className="font-mono text-xs text-brass">{String(i + 1).padStart(2, "0")}</span>
            <div><h2 className="font-medium">{t}</h2><p className="mt-1 text-sm text-bone-dim">{d}</p></div>
          </li>))}
      </ol>
      <p className="mt-6 max-w-2xl text-sm text-bone-mute">Echo does not give financial advice. Sample data is used until live collectors and the RYO-CHAN MCP connection are configured.</p>
    </main>
  </>);
}

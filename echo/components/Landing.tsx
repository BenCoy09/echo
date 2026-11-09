import { Logo } from "./Logo";
import { ReceiptPreview } from "./ReceiptPreview";
import Link from "next/link";
import { getReceipts, stats } from "@/lib/store";

const STEPS = [
  ["01", "Observe", "A curated list of voices is read across X, Telegram and Discord. Each post is stored with its URL and timestamp."],
  ["02", "Converge", "A signal exists only when independent voices align on a token inside a fixed window. The score is arithmetic, not sentiment."],
  ["03", "Cross-check", "Live RYO-CHAN market tools confirm or contradict the narrative. Conflicts and gaps produce a refusal, never a guess."],
  ["04", "Receipt & grade", "Every outcome is sealed as a JSON receipt, replayable from stored evidence, then graded against the realised price move."],
];

export function Landing() {
  const s = stats(), first = getReceipts()[0];
  return (
    <main>
      <header className="mx-auto flex max-w-page items-center justify-between px-5 py-5">
        <a href="#top" className="flex items-center gap-3 text-brass" aria-label="Echo home">
          <Logo size={22} /><span className="font-display text-lg text-bone">Echo</span>
        </a>
        <nav aria-label="Primary" className="flex gap-6 text-sm text-bone-dim">
          <Link href="/signals" className="hover:text-bone">Signals</Link>
          <Link href="/record" className="hover:text-bone">Track record</Link>
          <Link href="/about" className="hover:text-bone">About</Link>
        </nav>
      </header>

      <section id="top" className="mx-auto grid max-w-page gap-8 px-5 pb-9 pt-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="label mb-5">Verifiable social signal agent</p>
          <h1 className="font-display text-4xl lg:text-6xl">Verifiable signals,<br /><span className="text-brass">not opinions.</span></h1>
          <p className="mt-5 max-w-md text-lg text-bone-dim">
            Echo detects measurable narrative convergence among crypto voices, checks it against live market data, and seals each call as a receipt you can replay and audit.
          </p>
          <div className="mt-6 flex gap-4">
            <Link href={`/receipt/${first.id}`} className="bg-brass px-5 py-3 text-sm font-medium text-ink hover:bg-bone">View a receipt</Link>
            <a href="#how" className="border border-ink-line px-5 py-3 text-sm hover:border-bone-mute">How it works</a>
          </div>
        </div>
        <div id="receipt"><ReceiptPreview r={first} /></div>
      </section>

      <section id="how" className="mx-auto max-w-page px-5 py-8">
        <div className="rule mb-6" />
        <h2 className="font-display text-2xl">Four steps. Each one leaves evidence.</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([n, t, d]) => (
            <li key={n}>
              <span className="font-mono text-xs text-brass">{n}</span>
              <h3 className="mt-2 text-base font-medium">{t}</h3>
              <p className="mt-2 text-sm text-bone-dim">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="record" className="mx-auto max-w-page px-5 py-8">
        <div className="rule mb-6" />
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Track record</h2>
          <span className="label">Sample data · small n</span>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[["Receipts", s.total], ["Sized", s.sized], ["Refused", s.refused], ["Hit rate (sized)", `${s.hits} / ${s.sized}`]].map(([k, v]) => (
            <div key={k} className="border-l border-ink-line pl-4">
              <dt className="label">{k}</dt>
              <dd className="mt-2 font-display text-4xl">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 max-w-md text-sm text-bone-mute">Refusals are counted, not hidden. Hit rate is reported with its sample size.</p>
      </section>

      <footer className="mx-auto max-w-page px-5 py-7 text-xs text-bone-mute">Echo · RYO-CHAN Hackathon 2026 · Not financial advice.</footer>
    </main>
  );
}

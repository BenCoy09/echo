import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-page items-center justify-between px-5 py-5">
      <Link href="/" className="flex items-center gap-3 text-brass" aria-label="Echo home">
        <Logo size={22} /><span className="font-display text-lg text-bone">Echo</span>
      </Link>
      <nav aria-label="Primary" className="flex flex-wrap justify-end gap-x-5 gap-y-1 text-sm text-bone-dim">
        <Link href="/signals" className="hover:text-bone">Signals</Link>
        <Link href="/record" className="hover:text-bone">Track record</Link>
        <Link href="/add" className="hover:text-bone">Add signal</Link>
        <Link href="/verify" className="hover:text-bone">Verify</Link>
        <Link href="/about" className="hover:text-bone">About</Link>
      </nav>
    </header>
  );
}

import { SiteHeader } from "@/components/SiteHeader";
import { VerifyLocal } from "@/components/VerifyLocal";

export const metadata = { title: "Verify a receipt · Echo" };
export default function Verify() {
  return (<>
    <SiteHeader />
    <main className="mx-auto max-w-page px-5 py-7">
      <p className="label">Verify</p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl">Check a receipt without trusting this server.</h1>
      <p className="mt-3 max-w-xl text-sm text-bone-dim">The decision engine and the SHA-256 run here, in your browser. Paste a receipt and Echo recomputes its hash and decision from the stored evidence.</p>
      <p className="mt-3 max-w-xl text-xs text-bone-mute">What this proves: the receipt has not been altered since it was sealed, and its decision follows from its evidence. What it does not prove: that the posts exist or that market values are correct. Open each post link and source path to check those.</p>
      <VerifyLocal />
    </main>
  </>);
}

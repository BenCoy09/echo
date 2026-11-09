import { SiteHeader } from "@/components/SiteHeader";
import { AddSignalForm } from "@/components/AddSignalForm";

export const metadata = { title: "Add signal · Echo" };
export default function Add() {
  return (<>
    <SiteHeader />
    <main className="mx-auto max-w-page px-5 py-7">
      <p className="label">Add signal</p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl">Seal a live receipt from real posts.</h1>
      <p className="mt-3 max-w-xl text-sm text-bone-dim">Paste links to posts by curated voices about one token. Echo checks the market, decides whether to size a call or refuse, and seals the evidence. The receipt is graded 24 hours later against the real price.</p>
      <AddSignalForm />
    </main>
  </>);
}

import { Intro } from "@/components/Intro";
import { Landing } from "@/components/Landing";

// Receipts change at runtime, so never prerender this page at build time.
export const dynamic = "force-dynamic";
export default function Home() {
  return (<><Landing /><Intro /></>);
}

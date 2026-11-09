import type { MarketPoint } from "./types";
export function fmt(m: MarketPoint) {
  if (m.value === null) return "unavailable";
  if (m.key === "volumeChange24h") return `${m.value > 0 ? "+" : ""}${m.value}%`;
  if (m.key === "fundingPct") return `${m.value}%`;
  return `$${(m.value / 1e6).toFixed(1)}M`;
}
export const when = (iso: string) => iso.replace("T", " ").slice(0, 16) + " UTC";

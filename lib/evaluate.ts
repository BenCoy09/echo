import type { Direction, Evidence, Result } from "./types";

export const ENGINE_VERSION = "echo-core 0.2.0";
const val = (e: Evidence, k: string) => e.market.find((m) => m.key === k)?.value ?? null;

/** Pure and deterministic: no clock, no network, no randomness. */
export function evaluate(e: Evidence): Result {
  const longs = e.mentions.filter((m) => m.stance === "long").length;
  const shorts = e.mentions.length - longs;
  const direction: Direction | null = longs === shorts ? null : longs > shorts ? "long" : "short";
  const aligned = Math.max(longs, shorts);
  const score = e.voicesObserved ? Math.round((aligned / e.voicesObserved) * 100) / 100 : 0;
  const reasons: string[] = [];
  if (!direction) reasons.push("Voices split evenly; no direction");
  if (score < 0.5) reasons.push(`Convergence ${score.toFixed(2)} is below the 0.50 minimum`);
  for (const m of e.market) if (m.value === null) reasons.push(`Missing data: ${m.path}`);
  const vol = val(e, "volumeChange24h"), fund = val(e, "fundingPct"), liq = val(e, "liquidityUsd");
  if (direction === "long" && vol !== null && vol < 0) reasons.push(`Conflict: voices are long but 24h volume is ${vol}%`);
  if (direction === "long" && fund !== null && fund > 0.05) reasons.push(`Crowded: funding ${fund}% exceeds 0.05%`);
  if (liq !== null && liq < 500000) reasons.push("Liquidity below $0.5M threshold");
  const sized = reasons.length === 0;
  return { status: sized ? "sized" : "refused", direction, sizePct: sized ? Math.round(score * 70) / 100 : null, confidence: score, aligned, reasons };
}


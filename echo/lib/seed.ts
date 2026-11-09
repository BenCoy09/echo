import { seal } from "./engine";
import type { Evidence, Grade, Receipt } from "./types";

const H = ["alderline", "kestrelwire", "northbound", "ledgerfox", "quietmint", "hexbridge", "tidalcap", "vellum_on", "brightcurve", "ostrava"];
type S = { id: string; at: string; t: string; obs: number; long: number; short: number; vol: number | null; fund: number | null; liq: number | null; g: number };

function ev(s: S): Evidence {
  const mk = (n: number, stance: "long" | "short", off: number) =>
    Array.from({ length: n }, (_, i) => ({ handle: H[(i + off) % H.length], platform: (i % 3 === 2 ? "telegram" : "x") as "x" | "telegram", url: `https://x.com/${H[(i + off) % H.length]}/status/${s.id.length}${i}${off}`, postedAt: `${s.at.slice(0, 11)}0${5 + (i % 4)}:${10 + i * 7}:00Z`, stance }));
  const p = (k: string) => `ryo://market/${s.t}/${k}`;
  return {
    token: s.t, windowHours: 6, voicesObserved: s.obs,
    mentions: [...mk(s.long, "long", 0), ...mk(s.short, "short", 5)],
    market: [
      { key: "volumeChange24h", path: p("volume?window=24h"), fetchedAt: s.at, value: s.vol },
      { key: "fundingPct", path: p("funding"), fetchedAt: s.at, value: s.fund },
      { key: "liquidityUsd", path: p("liquidity?depth=1pct"), fetchedAt: s.at, value: s.liq },
    ],
  };
}

// Sample data. Replace with live collectors + fetchMarket() output.
const SEEDS: S[] = [
  { id: "rcpt_0412_arc", at: "2026-11-04T09:12:41Z", t: "ARC", obs: 7, long: 5, short: 0, vol: 38, fund: 0.008, liq: 1900000, g: 6.4 },
  { id: "rcpt_0411_nova", at: "2026-11-03T14:02:10Z", t: "NOVA", obs: 8, long: 5, short: 1, vol: -22, fund: 0.012, liq: 3100000, g: -9.8 },
  { id: "rcpt_0410_delta", at: "2026-11-02T08:41:55Z", t: "DELTA", obs: 6, long: 0, short: 4, vol: 12, fund: 0.01, liq: 2400000, g: -4.1 },
  { id: "rcpt_0409_kite", at: "2026-11-01T19:20:03Z", t: "KITE", obs: 9, long: 6, short: 0, vol: 61, fund: 0.02, liq: null, g: 3.3 },
  { id: "rcpt_0408_prsm", at: "2026-10-31T11:15:30Z", t: "PRSM", obs: 10, long: 7, short: 1, vol: 20, fund: 0.01, liq: 4100000, g: -2.3 },
];
export const seedReceipts = (): Receipt[] =>
  SEEDS.map((s) => ({ ...seal(s.id, s.at, ev(s)), grade: { horizonH: 24, returnPct: s.g } as Grade }));

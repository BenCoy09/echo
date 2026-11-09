import type { MarketPoint } from "./types";

const KEYS = [["volumeChange24h", (t: string) => `ryo://market/${t}/volume?window=24h`], ["fundingPct", (t: string) => `ryo://market/${t}/funding`], ["liquidityUsd", (t: string) => `ryo://market/${t}/liquidity?depth=1pct`]] as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * RYO-CHAN MCP client (JSON-RPC over HTTP). Set RYO_MCP_URL and RYO_MCP_KEY to go live;
 * otherwise a deterministic mock is returned. The tool name `market_snapshot` is an assumption: adjust to the real tool list.
 * Failure policy: 429 → backoff and retry; any other failure → null values, which the engine turns into a refusal.
 */
export async function fetchMarket(token: string): Promise<MarketPoint[]> {
  const url = process.env.RYO_MCP_URL, at = new Date().toISOString();
  const build = (d: Record<string, number | null> | null) => KEYS.map(([key, path]) => ({ key, path: path(token), fetchedAt: at, value: d?.[key] ?? null }));
  if (!url) return build({ volumeChange24h: 38, fundingPct: 0.008, liquidityUsd: 1900000 });
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        method: "POST", cache: "no-store",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RYO_MCP_KEY ?? ""}` },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "market_snapshot", arguments: { token } } }),
      });
      if (res.status === 429) { await sleep(2 ** i * 500); continue; }
      if (!res.ok) break;
      return build((await res.json())?.result?.structuredContent ?? null);
    } catch { await sleep(300); }
  }
  return build(null);
}

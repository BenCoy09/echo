import { mcp, RateLimited } from "./mcp";
import type { MarketPoint } from "./types";

const FIELDS = ["volumeChange24h", "fundingPct", "liquidityUsd"] as const;
const MOCK_PATH = { volumeChange24h: (t: string) => `ryo://market/${t}/volume?window=24h`, fundingPct: (t: string) => `ryo://market/${t}/funding`, liquidityUsd: (t: string) => `ryo://market/${t}/liquidity?depth=1pct` };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const dig = (o: unknown, p: string) => p.split(".").reduce<unknown>((a, k) => (a && typeof a === "object" ? (a as Record<string, unknown>)[k] : undefined), o);
const asJson = (t?: string) => { try { return t ? JSON.parse(t) : undefined; } catch { return undefined; } };

/**
 * RYO-CHAN market cross-check over MCP. Without RYO_MCP_URL, a labelled mock is returned.
 * Config: RYO_TOOL (tool name), RYO_ARGS (JSON args, "{token}" is replaced), RYO_FIELD_MAP (JSON: our field → dotted path in the tool's result).
 * Failure policy: 429 → backoff and retry; any other failure → null values, which the engine turns into a refusal. Never guesses.
 */
export async function fetchMarket(token: string): Promise<MarketPoint[]> {
  const url = process.env.RYO_MCP_URL, at = new Date().toISOString(), tool = process.env.RYO_TOOL ?? "market_snapshot";
  const build = (get: (k: (typeof FIELDS)[number]) => unknown): MarketPoint[] =>
    FIELDS.map((key) => ({ key, path: url ? `ryo://${tool}/${token}#${key}` : MOCK_PATH[key](token), fetchedAt: at, value: typeof get(key) === "number" ? (get(key) as number) : null }));

  if (!url) { const m = { volumeChange24h: 38, fundingPct: 0.008, liquidityUsd: 1900000 }; return build((k) => m[k]); }

  const args = JSON.parse((process.env.RYO_ARGS ?? '{"token":"{token}"}').replace(/\{token\}/g, token));
  const map = asJson(process.env.RYO_FIELD_MAP) ?? {};
  for (let i = 0; i < 3; i++) {
    try {
      const r = (await mcp("tools/call", { name: tool, arguments: args })) as { isError?: boolean; structuredContent?: unknown; content?: { type: string; text?: string }[] };
      if (r?.isError) break;
      const data = r?.structuredContent ?? asJson(r?.content?.find((c) => c.type === "text")?.text);
      return build((k) => dig(data, map[k] ?? k));
    } catch (e) {
      if (e instanceof RateLimited) { await sleep(2 ** i * 500); continue; }
      break;
    }
  }
  return build(() => null);
}

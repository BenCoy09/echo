/**
 * Minimal MCP client for servers on the Streamable HTTP transport (JSON or SSE replies).
 * Does the real handshake: initialize → notifications/initialized → request, carrying the session id the server returns.
 * Config: RYO_MCP_URL, RYO_MCP_KEY. Auth defaults to "Authorization: Bearer <key>";
 * override with RYO_AUTH_HEADER (e.g. x-api-key) and RYO_AUTH_SCHEME (empty string = send the raw key).
 */
export class RateLimited extends Error {
  constructor(public retryAfter = 2) { super("rate limited"); }
}

const headers = (key?: string, session?: string): Record<string, string> => {
  const scheme = process.env.RYO_AUTH_SCHEME ?? "Bearer";
  return {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    ...(key ? { [(process.env.RYO_AUTH_HEADER ?? "authorization").toLowerCase()]: scheme ? `${scheme} ${key}` : key } : {}),
    ...(session ? { "mcp-session-id": session } : {}),
  };
};
const post = (url: string, h: Record<string, string>, body: unknown) =>
  fetch(url, { method: "POST", headers: h, body: JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(60_000) });
const limited = (res: Response) => new RateLimited(Number(res.headers.get("retry-after")) || 2);

async function parse(res: Response): Promise<{ result?: unknown; error?: { message?: string } } | null> {
  const text = await res.text();
  if (!text) return null;
  if ((res.headers.get("content-type") ?? "").includes("text/event-stream")) {
    const last = text.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).filter(Boolean).pop();
    return last ? JSON.parse(last) : null;
  }
  return JSON.parse(text);
}

export async function mcp(method: "tools/list" | "tools/call", params?: unknown): Promise<unknown> {
  const url = process.env.RYO_MCP_URL, key = process.env.RYO_MCP_KEY;
  if (!url) throw new Error("RYO_MCP_URL is not set");
  const init = await post(url, headers(key), { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "echo", version: "0.2.0" } } });
  if (init.status === 429) throw limited(init);
  if (!init.ok) throw new Error(`MCP initialize failed (${init.status})`);
  const session = init.headers.get("mcp-session-id") ?? undefined;
  await parse(init).catch(() => null);
  await post(url, headers(key, session), { jsonrpc: "2.0", method: "notifications/initialized" }).catch(() => null);
  const res = await post(url, headers(key, session), { jsonrpc: "2.0", id: 2, method, params });
  if (res.status === 429) throw limited(res);
  if (!res.ok) throw new Error(`MCP ${method} failed (${res.status})`);
  const j = await parse(res);
  if (j?.error) throw new Error(j.error.message ?? "MCP error");
  return j?.result;
}

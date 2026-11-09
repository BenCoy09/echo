import { extractStance } from "../stance";
import { getReceipts } from "../store";
import type { Mention } from "../types";

interface Tweet { id: string; text: string; author_id: string; created_at: string }
const MIN_VOICES = 3, WINDOW_H = 6;

/**
 * Polls X recent search for curated voices posting a cashtag, keeps one clear-stance post per voice,
 * and submits to POST /api/collect. Config: X_BEARER_TOKEN, ECHO_VOICES=handle,handle, ECHO_TOKENS=SOL,ETH, ECHO_INGEST_KEY.
 * Needs an X API tier that allows recent search and the $cashtag operator.
 */
export async function pollX(origin: string) {
  const bearer = process.env.X_BEARER_TOKEN;
  const voices = (process.env.ECHO_VOICES ?? "").split(",").map((s) => s.trim().replace(/^@/, "")).filter(Boolean);
  const tokens = (process.env.ECHO_TOKENS ?? "SOL,ETH,LINK").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (!bearer || !voices.length) return { error: "Set X_BEARER_TOKEN and ECHO_VOICES", results: [] };

  const seen = new Set(getReceipts().flatMap((r) => r.evidence.mentions.map((m) => m.url)));
  const start = new Date(Date.now() - WINDOW_H * 3.6e6).toISOString();
  const results: Record<string, unknown>[] = [];

  for (const token of tokens) {
    const query = `$${token} (${voices.map((v) => `from:${v}`).join(" OR ")}) -is:retweet`;
    const qs = new URLSearchParams({ query, max_results: "100", start_time: start, "tweet.fields": "created_at,author_id", expansions: "author_id", "user.fields": "username" });
    const res = await fetch(`https://api.x.com/2/tweets/search/recent?${qs}`, { headers: { Authorization: `Bearer ${bearer}` }, cache: "no-store" });
    if (res.status === 429) { results.push({ token, skipped: "rate limited by X" }); continue; }
    if (!res.ok) { results.push({ token, skipped: `X API ${res.status}` }); continue; }
    const j = await res.json();
    const names = new Map<string, string>((j.includes?.users ?? []).map((u: { id: string; username: string }) => [u.id, u.username]));
    const byHandle = new Map<string, Mention>();
    for (const t of ((j.data ?? []) as Tweet[]).sort((a, b) => a.created_at.localeCompare(b.created_at))) {
      const handle = names.get(t.author_id), stance = extractStance(t.text), url = `https://x.com/${handle}/status/${t.id}`;
      if (!handle || !stance || byHandle.has(handle) || seen.has(url)) continue; // one voice, one vote, no repeats
      byHandle.set(handle, { handle, platform: "x", url, postedAt: t.created_at, stance, excerpt: t.text.slice(0, 140) });
    }
    const mentions = [...byHandle.values()];
    if (mentions.length < MIN_VOICES) { results.push({ token, skipped: `only ${mentions.length} clear voices (min ${MIN_VOICES})` }); continue; }
    const r = await fetch(`${origin}/api/collect`, {
      method: "POST", headers: { "content-type": "application/json", "x-echo-key": process.env.ECHO_INGEST_KEY ?? "" },
      body: JSON.stringify({ token, voicesObserved: voices.length, windowHours: WINDOW_H, mentions }),
    });
    results.push({ token, ...(await r.json()) });
  }
  return { results };
}

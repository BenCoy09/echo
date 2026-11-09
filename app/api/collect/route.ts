import { NextResponse } from "next/server";
import { seal } from "@/lib/engine";
import { fetchMarket } from "@/lib/ryo";
import { addReceipt, getReceipts } from "@/lib/store";
import type { Mention } from "@/lib/types";

export const dynamic = "force-dynamic";
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const isMention = (m: Mention) => m && typeof m.handle === "string" && /^https?:\/\//.test(m.url) && !Number.isNaN(Date.parse(m.postedAt)) &&
  ["x", "telegram", "discord"].includes(m.platform) && ["long", "short"].includes(m.stance);

/**
 * POST /api/collect: webhook ingest for observed voices. Any collector (X poller, Telegram bot, manual) can post here.
 * Body: { token, voicesObserved, windowHours?, mentions: Mention[] }. Header x-echo-key must equal ECHO_INGEST_KEY
 * (when unset, ingest is open outside production only). Market data is fetched server-side via the RYO client.
 */
export async function POST(req: Request) {
  const key = process.env.ECHO_INGEST_KEY;
  if (key ? req.headers.get("x-echo-key") !== key : process.env.NODE_ENV === "production") return bad("Unauthorized", 401);
  const b = await req.json().catch(() => null);
  const token = String(b?.token ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!token || !Array.isArray(b?.mentions) || !b.mentions.every(isMention)) return bad("Expected { token, voicesObserved, mentions[] } with valid mentions");
  if (!Number.isInteger(b.voicesObserved) || b.voicesObserved < b.mentions.length) return bad("voicesObserved must be an integer ≥ mentions.length");
  // Catch data-entry mistakes: the handle must match its link, and an excerpt about another $TICKER is rejected.
  for (const m of b.mentions as Mention[]) {
    const hm = m.url.match(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/([^/?#]+)\/status/i);
    if (hm && hm[1].toLowerCase() !== m.handle.replace(/^@/, "").toLowerCase()) return bad(`@${m.handle} does not match its link (@${hm[1]})`);
    const tags = [...(m.excerpt ?? "").matchAll(/\$([A-Za-z]{2,10})\b/g)].map((x) => x[1].toUpperCase());
    if (tags.length && !tags.includes(token)) return bad(`@${m.handle}'s excerpt is about $${tags[0]}, not $${token}`);
  }
  // Every post must fall inside the claimed window (small allowance for clock skew).
  const winMs = (b.windowHours ?? 6) * 3.6e6, nowMs = Date.now();
  const stale = (b.mentions as Mention[]).filter((m) => nowMs - Date.parse(m.postedAt) > winMs || Date.parse(m.postedAt) > nowMs + 5 * 60e3);
  if (stale.length) return bad(`Posts must be from the last ${b.windowHours ?? 6}h. Outside the window: ${stale.map((m) => "@" + m.handle).join(", ")}`);
  const seen = new Set(getReceipts().flatMap((r) => r.evidence.mentions.map((m) => m.url)));
  if (b.mentions.some((m: Mention) => seen.has(m.url))) return bad("Mention already recorded in an earlier receipt", 409);

  const market = await fetchMarket(token);
  const now = new Date().toISOString();
  const id = `rcpt_${now.slice(5, 16).replace(/[-:T]/g, "")}_${token.toLowerCase()}`;
  const r = { ...seal(id, now, { token, windowHours: b.windowHours ?? 6, voicesObserved: b.voicesObserved, mentions: b.mentions, market }), origin: "ingest" as const, marketSource: (process.env.RYO_MCP_URL ? "ryo" : "mock") as "ryo" | "mock" };
  addReceipt(r);
  return NextResponse.json({ id, status: r.result.status, reasons: r.result.reasons, hash: r.evidenceHash }, { status: 201 });
}

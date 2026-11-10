import { NextResponse } from "next/server";
import { mcp } from "@/lib/mcp";

export const dynamic = "force-dynamic";
/**
 * GET /api/ryo/probe?key=<ECHO_INGEST_KEY>&tool=<name>&args=<url-encoded JSON>
 * Calls one RYO-CHAN tool and returns the raw result, so you can see the real field paths before filling RYO_FIELD_MAP.
 */
export async function GET(req: Request) {
  const key = process.env.ECHO_INGEST_KEY, u = new URL(req.url);
  if (key ? u.searchParams.get("key") !== key : process.env.NODE_ENV === "production") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tool = u.searchParams.get("tool");
  if (!tool || !process.env.RYO_MCP_URL) return NextResponse.json({ error: "Set RYO_MCP_URL and pass ?tool=<name>&args=<json>" }, { status: 400 });
  try {
    const args = JSON.parse(u.searchParams.get("args") ?? "{}");
    return NextResponse.json(await mcp("tools/call", { name: tool, arguments: args }));
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 502 }); }
}

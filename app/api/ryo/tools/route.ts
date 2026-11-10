import { NextResponse } from "next/server";
import { mcp } from "@/lib/mcp";

export const dynamic = "force-dynamic";
/** GET /api/ryo/tools?key=<ECHO_INGEST_KEY>: lists the tools the connected RYO-CHAN MCP server exposes (names, descriptions, input schemas). */
export async function GET(req: Request) {
  const key = process.env.ECHO_INGEST_KEY;
  if (key ? new URL(req.url).searchParams.get("key") !== key : process.env.NODE_ENV === "production") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.RYO_MCP_URL) return NextResponse.json({ configured: false, note: "Set RYO_MCP_URL (and RYO_MCP_KEY) to connect." });
  try { return NextResponse.json({ configured: true, result: await mcp("tools/list") }); }
  catch (e) { return NextResponse.json({ configured: true, error: (e as Error).message }, { status: 502 }); }
}

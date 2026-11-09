import { NextResponse } from "next/server";
import { voidReceipt } from "@/lib/store";

export const dynamic = "force-dynamic";
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** POST /api/void/<id> { reason }: retire a mistaken receipt. Same key rule as /api/collect. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const key = process.env.ECHO_INGEST_KEY;
  if (key ? req.headers.get("x-echo-key") !== key : process.env.NODE_ENV === "production") return bad("Unauthorized", 401);
  const b = await req.json().catch(() => null);
  const reason = String(b?.reason ?? "").trim().slice(0, 200);
  if (reason.length < 5) return bad("Give a reason (at least 5 characters)");
  return voidReceipt(params.id, reason) ? NextResponse.json({ ok: true }) : bad("Receipt not found or already voided", 404);
}

import { NextResponse } from "next/server";
import { getReceipt } from "@/lib/store";

export const dynamic = "force-dynamic";
/** Public JSON for one receipt (voided receipts included, with their void notice). */
export function GET(_: Request, { params }: { params: { id: string } }) {
  const r = getReceipt(params.id);
  return r ? NextResponse.json(r) : NextResponse.json({ error: "Receipt not found" }, { status: 404 });
}

import { NextResponse } from "next/server";
import { getReceipt } from "@/lib/store";
import { verify } from "@/lib/engine";

export const dynamic = "force-dynamic";
export function GET(_: Request, { params }: { params: { id: string } }) {
  const r = getReceipt(params.id);
  return r ? NextResponse.json(verify(r)) : NextResponse.json({ error: "Receipt not found" }, { status: 404 });
}

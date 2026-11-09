import { NextResponse } from "next/server";
import { fetchMarket } from "@/lib/ryo";

export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: { token: string } }) {
  return NextResponse.json(await fetchMarket(params.token.toUpperCase()));
}

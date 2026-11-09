import { NextResponse } from "next/server";
import { pollX } from "@/lib/collectors/x";

export const dynamic = "force-dynamic";
/** POST /api/poll/x: run one collection pass (wire to cron). */
export async function POST(req: Request) { return NextResponse.json(await pollX(new URL(req.url).origin)); }

import { NextResponse } from "next/server";
import { runGrading } from "@/lib/grader";

export const dynamic = "force-dynamic";
/** POST or GET /api/grade: run the grading job (wire to cron in production). GET lets you trigger it from a browser. */
export async function GET() { return NextResponse.json(await runGrading()); }
export async function POST() { return NextResponse.json(await runGrading()); }

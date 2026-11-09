import { NextResponse } from "next/server";
import { runGrading } from "@/lib/grader";

export const dynamic = "force-dynamic";
/** POST /api/grade: run the grading job (wire to cron in production). */
export async function POST() { return NextResponse.json(await runGrading()); }

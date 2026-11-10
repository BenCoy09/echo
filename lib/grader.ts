import { getAllReceipts, saveReceipts } from "./store";
import { getSources, type PriceSource } from "./prices";
import type { Grade, Receipt } from "./types";

const HORIZON_H = 24;

/** Grades one receipt over a fixed 24h horizon. Returns null until the horizon has elapsed. Never touches evidence or hash. */
export async function gradeReceipt(r: Receipt, src: PriceSource, now = Date.now()): Promise<Grade | null> {
  const exitAt = Date.parse(r.createdAt) + HORIZON_H * 3.6e6;
  if (exitAt > now) return null;
  const token = r.evidence.token;
  const [entry, exit] = [await src.priceAt(token, r.createdAt), await src.priceAt(token, new Date(exitAt).toISOString())];
  const returnPct = Math.round((exit / entry - 1) * 1e4) / 100;
  const { status, direction } = r.result;
  // Refused receipts record the move but have no "correct": nothing was called.
  const correct = status === "sized" && direction ? (direction === "long" ? returnPct > 0 : returnPct < 0) : null;
  return { horizonH: HORIZON_H, returnPct, entryPrice: entry, exitPrice: exit, correct, source: src.name, gradedAt: new Date(now).toISOString() };
}

const isMock = (s?: string) => Boolean(s?.startsWith("mock"));

/** Idempotent. Tries each price source in order; both prices for a receipt come from the same source. Failures are reported, never hidden. */
export async function runGrading() {
  const rs = getAllReceipts(), sources = getSources(), wantMock = isMock(sources[0].name);
  let graded = 0, changed = false;
  const errors: string[] = [];
  for (const r of rs) {
    if (r.voided) continue;
    if (r.grade?.gradedAt && isMock(r.grade.source) === wantMock) continue; // already graded by a real (or, in test mode, mock) source
    let g: Grade | null = null, lastErr = "";
    for (const s of sources) {
      try { g = await gradeReceipt(r, s); lastErr = ""; break; }
      catch (e) { lastErr = `${s.name}: ${(e as Error).message}`; }
    }
    if (g) { r.grade = g; graded++; changed = true; }
    else if (lastErr) { errors.push(`${r.evidence.token} ${lastErr}`); if (r.grade) { delete r.grade; changed = true; } }
  }
  if (changed) saveReceipts(rs);
  return { graded, pending: rs.filter((r) => !r.voided && !r.grade?.gradedAt).length, source: sources[0].name, errors };
}

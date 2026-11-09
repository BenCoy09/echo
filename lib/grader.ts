import { getReceipts, saveReceipts } from "./store";
import { getSource, type PriceSource } from "./prices";
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

/** Idempotent: grades only receipts without a stamped grade. Safe to call from cron or on page load. */
export async function runGrading() {
  const rs = getReceipts(), src = getSource();
  let graded = 0, changed = false;
  for (const r of rs) {
    if (r.grade?.gradedAt && r.grade.source === src.name) continue; // already graded by this source
    try { const g = await gradeReceipt(r, src); if (g) { r.grade = g; graded++; changed = true; } }
    catch { if (r.grade) { delete r.grade; changed = true; } } // never keep a grade from a different (e.g. mock) source
  }
  if (changed) saveReceipts(rs);
  return { graded, pending: rs.filter((r) => !r.grade?.gradedAt).length, source: src.name };
}

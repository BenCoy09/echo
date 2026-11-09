import fs from "fs";
import path from "path";
import { seedReceipts } from "./seed";
import { pushRemote, remoteEnabled } from "./remote";
import type { Receipt } from "./types";

// Receipts persist as structured JSON. First run seals the sample set into data/receipts.json.
const FILE = path.join(process.cwd(), "data", "receipts.json");

function readAll(): Receipt[] {
  if (!fs.existsSync(FILE)) saveReceipts(seedReceipts());
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}
/** Everything, including voided receipts. Use when writing back, or when voided ones should still be visible. */
export const getAllReceipts = readAll;
/** Active receipts only: what stats, the track record and the landing page use. */
export const getReceipts = () => readAll().filter((r) => !r.voided);

export function saveReceipts(rs: Receipt[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const json = JSON.stringify(rs, null, 2);
  fs.writeFileSync(FILE, json);
  if (remoteEnabled) void pushRemote(json); // durable copy; fire-and-forget
}
export const addReceipt = (r: Receipt) => saveReceipts([r, ...readAll()]);
export const getReceipt = (id: string) => readAll().find((r) => r.id === id);

/** Receipts are never edited or deleted (that would break the hash). A mistake is voided: kept, labelled, excluded from the record. */
export function voidReceipt(id: string, reason: string): boolean {
  const rs = readAll(), r = rs.find((x) => x.id === id);
  if (!r || r.voided) return false;
  r.voided = { reason, at: new Date().toISOString() };
  saveReceipts(rs);
  return true;
}

export type Outcome = "hit" | "miss" | "pending" | "not traded";
export const outcome = (r: Receipt): Outcome => {
  if (r.result.status === "refused") return "not traded";
  if (!r.grade?.gradedAt) return "pending";
  return r.grade.correct ? "hit" : "miss";
};
export function stats(origin?: "live" | "sample") {
  const rs = getReceipts().filter((r) => !origin || (origin === "live") === (r.origin === "ingest")), sized = rs.filter((r) => r.result.status === "sized");
  return { total: rs.length, sized: sized.length, refused: rs.length - sized.length, graded: sized.filter((r) => r.grade?.gradedAt).length, hits: sized.filter((r) => outcome(r) === "hit").length };
}

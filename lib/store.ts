import fs from "fs";
import path from "path";
import { seedReceipts } from "./seed";
import { pushRemote, remoteEnabled } from "./remote";
import type { Receipt } from "./types";

// Receipts persist as structured JSON. First run seals the sample set into data/receipts.json.
const FILE = path.join(process.cwd(), "data", "receipts.json");

export function getReceipts(): Receipt[] {
  if (!fs.existsSync(FILE)) saveReceipts(seedReceipts());
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}
export function saveReceipts(rs: Receipt[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const json = JSON.stringify(rs, null, 2);
  fs.writeFileSync(FILE, json);
  if (remoteEnabled) void pushRemote(json); // durable copy; fire-and-forget
}
export const addReceipt = (r: Receipt) => saveReceipts([r, ...getReceipts()]);
export const getReceipt = (id: string) => getReceipts().find((r) => r.id === id);

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

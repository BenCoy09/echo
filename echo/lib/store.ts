import fs from "fs";
import path from "path";
import { seedReceipts } from "./seed";
import type { Receipt } from "./types";

// Receipts persist as structured JSON. First run seals the sample set into data/receipts.json.
const FILE = path.join(process.cwd(), "data", "receipts.json");

export function getReceipts(): Receipt[] {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(seedReceipts(), null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}
export const getReceipt = (id: string) => getReceipts().find((r) => r.id === id);

export const outcome = (r: Receipt): "hit" | "miss" | "not traded" => {
  if (r.result.status === "refused" || !r.grade) return "not traded";
  return (r.result.direction === "long") === r.grade.returnPct > 0 ? "hit" : "miss";
};
export function stats() {
  const rs = getReceipts(), sized = rs.filter((r) => r.result.status === "sized");
  return { total: rs.length, sized: sized.length, refused: rs.length - sized.length, hits: sized.filter((r) => outcome(r) === "hit").length };
}

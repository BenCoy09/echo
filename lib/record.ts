import { getReceipts } from "./store";

/** Wilson 95% interval: honest about small samples. */
export function wilson(k: number, n: number, z = 1.96): [number, number] {
  if (!n) return [0, 0];
  const p = k / n, d = 1 + z * z / n, c = p + z * z / (2 * n), m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return [(c - m) / d, (c + m) / d];
}

export function record(origin?: "live" | "sample") {
  const graded = getReceipts().filter((r) => r.grade?.gradedAt && (!origin || (origin === "live") === (r.origin === "ingest")));
  const sized = graded.filter((r) => r.result.status === "sized");
  const correct = sized.filter((r) => r.grade?.correct).length;
  // Direction-adjusted move: positive means the call made money.
  const dir = sized.map((r) => (r.result.direction === "short" ? -1 : 1) * (r.grade?.returnPct ?? 0));
  return {
    graded, n: sized.length, correct,
    accuracy: sized.length ? correct / sized.length : 0,
    interval: wilson(correct, sized.length),
    avgMove: dir.length ? dir.reduce((a, b) => a + b, 0) / dir.length : 0,
  };
}

import type { Direction } from "./types";

const LONG = /\b(long|longing|buy|buying|bought|bullish|accumulat\w+|adding)\b/i;
const SHORT = /\b(short|shorting|sell|selling|sold|bearish|dump\w*|exiting)\b/i;

/**
 * Keyword stance. Deliberately conservative: questions, and posts that match both or neither side, return null and are skipped.
 * Known limits: no negation or sarcasm handling, and "short-term" reads as short. Treat as a baseline to replace.
 */
export function extractStance(text: string): Direction | null {
  if (/\?\s*$/.test(text.trim())) return null;
  const l = LONG.test(text), s = SHORT.test(text);
  return l === s ? null : l ? "long" : "short";
}

export type Direction = "long" | "short";
export interface Mention { handle: string; platform: "x" | "telegram" | "discord"; url: string; postedAt: string; stance: Direction }
export interface MarketPoint { key: "volumeChange24h" | "fundingPct" | "liquidityUsd"; path: string; fetchedAt: string; value: number | null }
/** Everything the engine is allowed to look at. The receipt hash covers exactly this. */
export interface Evidence { token: string; windowHours: number; voicesObserved: number; mentions: Mention[]; market: MarketPoint[] }
export interface Result { status: "sized" | "refused"; direction: Direction | null; sizePct: number | null; confidence: number; aligned: number; reasons: string[] }
export interface Grade { horizonH: number; returnPct: number }
export interface Receipt { id: string; createdAt: string; engineVersion: string; evidence: Evidence; result: Result; evidenceHash: string; grade?: Grade }

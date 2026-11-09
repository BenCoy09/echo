import fs from "fs";
import path from "path";
import { createHash } from "crypto";

export interface PriceSource { name: string; priceAt(token: string, iso: string): Promise<number> }

const CACHE = path.join(process.cwd(), "data", "price-cache.json");
/** Every fetched price is written to data/price-cache.json so grades are reproducible and inspectable. */
function cached(src: PriceSource): PriceSource {
  return {
    name: src.name,
    async priceAt(token, iso) {
      const c: Record<string, number> = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
      const k = `${src.name}|${token}|${iso}`;
      if (k in c) return c[k];
      c[k] = await src.priceAt(token, iso);
      fs.mkdirSync(path.dirname(CACHE), { recursive: true });
      fs.writeFileSync(CACHE, JSON.stringify(c, null, 2));
      return c[k];
    },
  };
}

/** Default: Binance public market data (no key). Price = open of the 1-minute candle containing the timestamp, quoted in USDT. */
const binance: PriceSource = {
  name: "binance-spot-1m",
  async priceAt(token, iso) {
    const url = `https://data-api.binance.vision/api/v3/klines?symbol=${token}USDT&interval=1m&startTime=${Date.parse(iso)}&limit=1`;
    const res = await fetch(url, { cache: "no-store" });
    const p = Number((await res.json())?.[0]?.[1]);
    if (!res.ok || !Number.isFinite(p)) throw new Error(`no price for ${token}USDT at ${iso}`);
    return p;
  },
};

/** Custom API: set PRICE_API_URL. GET ?token=SOL&at=<ISO> → { "price": number }. */
const http = (url: string): PriceSource => ({
  name: "http:" + new URL(url).host,
  async priceAt(token, iso) {
    const res = await fetch(`${url}?token=${token}&at=${encodeURIComponent(iso)}`, { cache: "no-store" });
    const p = (await res.json())?.price;
    if (!res.ok || typeof p !== "number") throw new Error(`price lookup failed for ${token}`);
    return p;
  },
});

/** Offline/test only: deterministic synthetic prices. Enable with PRICE_SOURCE=mock. Not market data. */
const u = (s: string) => parseInt(createHash("sha256").update(s).digest("hex").slice(0, 8), 16) / 0xffffffff;
export const mockSource: PriceSource = {
  name: "mock-deterministic-v1",
  async priceAt(token, iso) {
    const h = Math.floor(Date.parse(iso) / 3.6e6), k = u(token);
    return Math.round((1 + k * 9) * (1 + Math.sin(h / 9 + k * 6) * 0.08 + (u(token + h) - 0.5) * 0.06) * 1e4) / 1e4;
  },
};

export function getSource(): PriceSource {
  if (process.env.PRICE_SOURCE === "mock") return mockSource;
  return cached(process.env.PRICE_API_URL ? http(process.env.PRICE_API_URL) : binance);
}

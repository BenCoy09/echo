# Echo

Verifiable social signal agent for the RYO-CHAN Hackathon 2026.

## Run
```bash
npm install
npm run dev   # http://localhost:3000
```
Node 18.18+. The welcome sequence plays once per session (skippable; honours `prefers-reduced-motion`).

## Structure
- `tailwind.config.ts` design tokens (colour, type, 4px-based spacing)
- `components/Welcome.tsx` 3D logo sequence (CSS 3D, no WebGL dependency)
- `components/Landing.tsx`, `ReceiptPreview.tsx` landing page
- `lib/types.ts` receipt schema; `lib/sample.ts` mocked RYO data

## Status
Phase 1 done: scaffold, design system, welcome, landing.
Next: receipt store + deterministic re-run, MCP client, signals feed, receipt detail, grading, About.

## Phase 2–3 (added)
- `lib/engine.ts` deterministic `evaluate`, `seal`, `verify`; `lib/hash.ts` canonical JSON + SHA-256
- `lib/store.ts` receipts persist in `data/receipts.json` (sealed from `lib/seed.ts` on first run; delete the file to reseal). Edit evidence in that file, then press "Re-run" on the receipt to see a mismatch.
- `lib/ryo.ts` MCP client: set `RYO_MCP_URL` and `RYO_MCP_KEY` in `.env.local`. Retries on 429; failures return nulls, which become refusals. Check `/api/live/ARC`. The tool name `market_snapshot` is an assumption.
- Pages: `/signals`, `/receipt/[id]`, `/record`, `/about`

## Not yet built
Live voice collectors (X/Telegram/Discord), automatic grading job, tests, rate-limit UI states.

## Grading
- `lib/grader.ts` grades each receipt 24h after sealing: entry price at `createdAt`, exit at +24h. Sized: a long is correct if price rose, a short if it fell. Refused: move recorded, `correct: null`. Grades are stored on the receipt, outside the hashed evidence, so verification is unaffected.
- Prices: `lib/prices.ts`. Default is a deterministic **mock** (labelled on /record). Set `PRICE_API_URL` (GET `?token=&at=` → `{price}`) for real data.
- Run: automatic on /record load, or `curl -X POST localhost:3000/api/grade`. Idempotent; schedule it with cron in production.

## Live ingest
```bash
curl -X POST localhost:3000/api/collect -H 'content-type: application/json' \
  -d '{"token":"ARC","voicesObserved":8,"mentions":[
   {"handle":"alderline","platform":"x","url":"https://x.com/alderline/status/1","postedAt":"2026-11-09T08:00:00Z","stance":"long"},
   {"handle":"northbound","platform":"x","url":"https://x.com/northbound/status/2","postedAt":"2026-11-09T08:20:00Z","stance":"long"},
   {"handle":"ledgerfox","platform":"telegram","url":"https://t.me/c/3","postedAt":"2026-11-09T08:30:00Z","stance":"long"},
   {"handle":"quietmint","platform":"x","url":"https://x.com/quietmint/status/4","postedAt":"2026-11-09T08:40:00Z","stance":"long"},
   {"handle":"hexbridge","platform":"x","url":"https://x.com/hexbridge/status/5","postedAt":"2026-11-09T08:50:00Z","stance":"long"}]}'
```
Set `ECHO_INGEST_KEY` and send it as `x-echo-key` (required in production). Receipts appear on /signals tagged "live". Market values are mock until `RYO_MCP_URL` is set. An X poller can post to this endpoint; stance extraction is not built.

## Real prices
Default source is Binance public klines (`<TOKEN>USDT`, open of the 1-minute candle at the timestamp). Every lookup is cached in `data/price-cache.json`; grades record source, entry, exit and time. Tokens need a USDT spot pair. Receipts graded by another source (e.g. the old mock) are re-graded on the next /record load, or left pending if no price exists.

Sample receipts now use real tickers (SOL, ETH, LINK, AVAX, ARB) with **synthetic voices** (`sample://` URLs). They are labelled "sample"; only live receipts are real signals. To reseal the sample set with the new tickers: `rm data/receipts.json` (this also drops any receipts ingested so far).

## X collector
`POST /api/poll/x` runs one pass: recent search → one clear-stance post per curated voice → `POST /api/collect`. Config in `.env.example`. Stance is keyword-based (`lib/stance.ts`); ambiguous posts are skipped, and tokens with fewer than 3 clear voices are skipped. New receipts are graded 24h after sealing.

## Add signal (free, manual live ingest)
`/add` is a form over `POST /api/collect`: paste post links, pick long/short and post time, seal. Same engine, hashing and grading as automated ingest. In production set `ECHO_INGEST_KEY` and enter it in the form.

## Persistence on free hosts (Upstash)
Create a free Redis database at upstash.com, then set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` on the host. On boot (`instrumentation.ts`) receipts are restored from Redis, or Redis is seeded from the committed `data/receipts.json`. Every save (new receipt, new grade) is mirrored back. Once Redis holds data, it is the source of truth; pushing a new `data/receipts.json` will not overwrite it.
Schedule `POST /api/grade` hourly (e.g. cron-job.org) to grade without anyone visiting /record.

## RYO-CHAN (MCP)
`lib/mcp.ts` speaks MCP over Streamable HTTP (initialize handshake, session id, JSON or SSE replies). `lib/ryo.ts` calls one tool per receipt and maps its result to three fields: 24h volume change (%), funding (%), 1% liquidity depth (USD).
1. Set `RYO_MCP_URL` and `RYO_MCP_KEY`.
2. Open `/api/ryo/tools?key=<ECHO_INGEST_KEY>` to see the real tool names and input schemas.
3. Set `RYO_TOOL`, `RYO_ARGS` and `RYO_FIELD_MAP` to match (see `.env.example`), then check `/api/live/SOL`.
Live evidence paths read `ryo://<tool>/<TOKEN>#<field>`. If the server is down, rate-limited or returns a field as non-numeric, that value is null and the engine refuses to size: no guessing. Until configured, receipts are labelled "Mock market values".

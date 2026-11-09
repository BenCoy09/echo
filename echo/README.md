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

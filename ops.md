# Ops

Family cookbook for Mom: **My Addiction with Sally's Baking Addiction**.
Public site for family. Mom writes. Connor runs the services.

If a URL or ID is missing below, it is not set up yet. Do not invent cloud projects.

## Services

| What | Where | Status |
| --- | --- | --- |
| Source | GitHub `bytesofconnor/baking-addiction` | https://github.com/bytesofconnor/baking-addiction |
| App (SPA) | Vite 8 + React 19 + React Router 8 on Vercel | Team **Connor's projects** (`team_ynn7qy4sDXJcDEMHSuWLuXXo`) |
| Backend + DB | Convex project `baking-addiction` | Team **connor-barrett**. Production: `beloved-lapwing-642` |
| Domain | — | Not purchased. Intended: `myaddiction.kitchen` |
| Kitchen AI | Vercel AI Gateway via Convex action `kitchen.remix` | `AI_GATEWAY_API_KEY` is **not** set. Falls back to notes in `convex/lib/kitchenLetter.ts`. |

Git remote: `github.com-personal:bytesofconnor/baking-addiction.git`

## Production

| Piece | Address |
| --- | --- |
| Convex HTTP | https://beloved-lapwing-642.convex.cloud |
| Convex dashboard | https://dashboard.convex.dev/t/connor-barrett/baking-addiction/beloved-lapwing-642 |
| Site | Vercel production URL (see below once deployed) |

**Do not seed production.** `convex/seed.ts` is `internalMutation` only (CLI/dashboard). Live cookbook starts empty; Mom writes the real bakes.

Dummy cover photos live in `public/bakes/` for local samples. Real photos go through Convex file storage (`photos.generateUploadUrl` + `photos.attach`).

## Local

Run both. Convex first, then the app. Local still uses the anonymous deployment in `.env.local` so dummy bakes stay on your machine.

```bash
npm run convex:dev   # http://127.0.0.1:3210
npm run dev          # http://localhost:4821
```

| Piece | Address |
| --- | --- |
| Site | http://localhost:4821 |
| Convex HTTP | http://127.0.0.1:3210 |
| Convex site | http://127.0.0.1:3211 |
| Convex deployment name | `anonymous:anonymous-baking-addiction` (in `.env.local`) |

`.env.local` (Vite / Convex CLI — not secrets for the kitchen door):

- `CONVEX_DEPLOYMENT`
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`

Push functions to production without touching local:

```bash
npx convex deploy --env-file /tmp/convex-prod.env
# where CONVEX_DEPLOYMENT=prod:beloved-lapwing-642
```

## Routes

| Path | Who |
| --- | --- |
| `/` | Public cookbook |
| `/bakes/:slug` | Public bake |
| `/about` | Public |
| `/admin` | Mom writes. Do not advertise. `robots.txt` disallows it. |
| `/admin?code=…` | Magic link. Unlocks this device, then strips `code` from the URL. |
| `/mom-desk` | Legacy redirect to `/admin` |

Session cookie `mba_desk` + `localStorage` `mba-desk-session`, ~400 days.

## Convex env

Set on the **Convex** deployment, not Vercel.

| Name | Required | Lives on |
| --- | --- | --- |
| `WRITER_PASSWORD` | Yes | Convex. Kitchen door code. Never commit it. Never put the value in this file. Set on local anonymous **and** production `beloved-lapwing-642`. |
| `AI_GATEWAY_API_KEY` | No | Convex. If missing, Ask the kitchen still answers from Mom's notes. |

```bash
npx convex env set WRITER_PASSWORD --deployment connor-barrett:baking-addiction:production
npx convex env set AI_GATEWAY_API_KEY --deployment connor-barrett:baking-addiction:production
```

## Vercel env

| Name | Required | Notes |
| --- | --- | --- |
| `VITE_CONVEX_URL` | Yes | `https://beloved-lapwing-642.convex.cloud` — baked in at build time |

## Recipe rule

This site is Mom's version. She writes the method. Credit + link Sally. Do not copy Sally's ingredients, method, or photos into the database or the UI.

## Useful commands

```bash
npm run dev
npm run convex:dev
npm run typecheck
npm run lint
npx convex env list
npx convex run seed:ensureSamples   # local dummy data only; internal; never on prod
```

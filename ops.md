# Ops

Family cookbook for Mom: **My Addiction with Sally's Baking Addiction**.
Public site for family. Mom writes. Connor runs the services.

## Services

| What | Where | Status |
| --- | --- | --- |
| Source | GitHub `bytesofconnor/baking-addiction` | https://github.com/bytesofconnor/baking-addiction |
| App (SPA) | Vercel project `baking-addiction` | Team **Connor's projects** (`team_ynn7qy4sDXJcDEMHSuWLuXXo` / `connors-projects-408eaae2`). Project `prj_aFYDZXk50XMLtWsmraJ6lbd8eTAg` |
| Backend + DB | Convex project `baking-addiction` | Team **connor-barrett**. Production deployment `beloved-lapwing-642` |
| Domain | — | Not purchased. Intended: `myaddiction.kitchen`. Live URL is the Vercel alias below. |
| Kitchen AI | Vercel AI Gateway via Convex action `kitchen.remix` | `AI_GATEWAY_API_KEY` is **not** set. Falls back to notes in `convex/lib/kitchenLetter.ts`. |

Git remote: `github.com-personal:bytesofconnor/baking-addiction.git`

## Production

| Piece | Address |
| --- | --- |
| Site | https://baking-addiction.vercel.app |
| Vercel dashboard | https://vercel.com/connors-projects-408eaae2/baking-addiction |
| Convex HTTP | https://beloved-lapwing-642.convex.cloud |
| Convex dashboard | https://dashboard.convex.dev/t/connor-barrett/baking-addiction/beloved-lapwing-642 |

Production cookbook starts **empty**. Mom writes the real bakes. Dummy seed is `internalMutation` only — never run it on prod.

Git is **not** connected to Vercel right now. Auto-deploy on push was blocked because the GitHub commit author is not a member of the Vercel team. Ship with:

```bash
npx vercel pull --yes --environment=production --scope connors-projects-408eaae2
npx vercel build --prod --yes --scope connors-projects-408eaae2
npx vercel deploy --prebuilt --prod --yes --scope connors-projects-408eaae2
```

To reconnect Git later (after the GitHub user is on the Vercel team):

```bash
npx vercel git connect https://github.com/bytesofconnor/baking-addiction --yes --scope connors-projects-408eaae2
```

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

Do not let `vercel env pull` overwrite this file’s local Convex URL.

Push functions to production without touching local:

```bash
printf 'CONVEX_DEPLOYMENT=prod:beloved-lapwing-642\n' > /tmp/convex-prod.env
npx convex deploy --env-file /tmp/convex-prod.env
rm /tmp/convex-prod.env
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

Send Mom: `https://baking-addiction.vercel.app/admin?code=` plus the kitchen code. Once per phone, once per laptop.

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

# Ops

Family cookbook for Mom: **The Family Recipe Book**.
Private family book. Unlisted — `robots.txt` disallows everything. Mom writes. Family uses the URL. Not a blog. Sally is a source on some cards, not the name of the book. The line under the name is “Family favorites, all in one place.” Colors, header doodles, and monthly room artwork follow the Minnesota month (America/Chicago) on load. Family comes in with Google.

## Services

| What | Where | Status |
| --- | --- | --- |
| Source | GitHub `bytesofconnor/baking-addiction` | https://github.com/bytesofconnor/baking-addiction |
| App (SPA) | Vercel project `baking-addiction` | Team **Connor's projects** (`team_ynn7qy4sDXJcDEMHSuWLuXXo` / `connors-projects-408eaae2`). Project `prj_aFYDZXk50XMLtWsmraJ6lbd8eTAg` |
| Backend + DB | Convex project `baking-addiction` | Team **connor-barrett**. Production deployment `beloved-lapwing-642` |
| Domain | — | Intended: `thatsyum.kitchen` (not purchased). Live URL is the Vercel alias below. |
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

### CI/CD Deployment

GitHub Actions automatically deploys to production when you push to `main`. The workflow:

1. Builds the project locally
2. Pulls Vercel environment information
3. Builds Vercel production artifacts
4. Deploys to Vercel production
5. Deploys Convex functions to production

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

| Secret | Value | How to get it |
| --- | --- | --- |
| `VERCEL_TOKEN` | Your Vercel API token | Vercel dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | `team_ynn7qy4sDXJcDEMHSuWLuXXo` | From Vercel project settings |
| `VERCEL_PROJECT_ID` | `prj_aFYDZXk50XMLtWsmraJ6lbd8eTAg` | From Vercel project settings |
| `CONVEX_DEPLOY_KEY` | Your Convex deploy key | Convex dashboard → Settings → API Keys |

### Manual Deployment

If you need to deploy manually without CI (for testing or emergencies):

```bash
npx vercel pull --yes --environment=production --scope connors-projects-408eaae2
npx vercel build --prod --yes --scope connors-projects-408eaae2
npx vercel deploy --prebuilt --prod --yes --scope connors-projects-408eaae2
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
| `/slip/:token` | One recipe, if you have the unguessable link. No book, no profile, no sign-in. |
| `/about` | How she cooks. No recipes. |
| `/join` | Family door. `?code=` is an invite. |
| `/family` | People in the current kitchen. Invite lives here. |
| `/family/:userId` | What that person shared. |
| `/add` | Write desk. Family cooks, or the kitchen code. |
| `/add?code=…` | Magic link. Unlocks this device, then strips `code` from the URL. |
| `/admin` | Redirect to `/add` |
| `/write` | Redirect to `/add` |
| `/mom-desk` | Legacy redirect to `/add` |

Family signs in with Google. Session cookie `mba_desk` + `localStorage` `mba-desk-session` is only the write-desk kitchen code, ~400 days.

Family gets `/join?code=` from the Family page. After Google, the invite opens that kitchen. Mom can still write at `/admin` with the kitchen code, or by signing in as a cook.

## Convex env

Set on the **Convex** deployment, not Vercel.

| Name | Required | Lives on |
| --- | --- | --- |
| `WRITER_PASSWORD` | Yes | Convex. Kitchen door code. Never commit it. Never put the value in this file. Set on local anonymous **and** production `beloved-lapwing-642`. |
| `SITE_URL` | Yes | Frontend origin. Local: `http://localhost:4821`. Prod: the live site URL. |
| `JWT_PRIVATE_KEY` | Yes | Convex Auth. Generated once per deployment. |
| `JWKS` | Yes | Convex Auth public key. Generated with the private key. |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth client ID. |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth client secret. |
| `AI_GATEWAY_API_KEY` | No | Convex. If missing, Ask the kitchen still answers from Mom's notes. |

```bash
npx convex env set WRITER_PASSWORD --deployment connor-barrett:baking-addiction:production
npx convex env set AI_GATEWAY_API_KEY --deployment connor-barrett:baking-addiction:production
```

Google OAuth (Google Cloud → APIs & Services → Credentials → Web application):

- Authorized JavaScript origins: `http://localhost:4821` and the live site
- Authorized redirect URI: `{CONVEX_SITE_URL}/api/auth/callback/google`
  - Local site URL is `http://127.0.0.1:3211`
  - Prod site URL is `https://beloved-lapwing-642.convex.site`

```bash
npx convex env set SITE_URL http://localhost:4821
npx convex env set AUTH_GOOGLE_ID ...
npx convex env set AUTH_GOOGLE_SECRET ...
```

## Vercel env

| Name | Required | Notes |
| --- | --- | --- |
| `VITE_CONVEX_URL` | Yes | `https://beloved-lapwing-642.convex.cloud` — baked in at build time |

## Recipe rule

Private kitchens. Anyone can make an account. Recipes stay inside a kitchen you were invited to. No family directory. Sources: Sally (credit + link), original, or family. Dummy seed is local only — first kitchen on that deployment claims leftover cards.

## Useful commands

```bash
npm run dev
npm run convex:dev
npm run typecheck
npm run lint
npx convex env list
npx convex run seed:ensureSamples   # local dummy data only; internal; never on prod
```

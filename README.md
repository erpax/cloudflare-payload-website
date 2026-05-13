# Payload Website — Cloudflare D1 port

[Payload's official website](https://payloadcms.com/) repackaged to deploy entirely on Cloudflare's stack — D1 for the database, R2 for media, Cloudflare Images for transforms, OpenNext for the Next.js worker. The upstream feature set (admin, docs, case studies, posts, Stripe, forms with HubSpot, GitHub OAuth, Discord sync, etc.) is preserved; only the runtime bindings change.

## One-click deploy

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/erpax/cloudflare-payload-website)

The wizard:

1. **Forks this repo** into your account.
2. **Creates the bindings** — a new D1 database (default name `payload-website`) and a new R2 bucket (default name `payload-website`). The Images and ASSETS bindings are zero-config. The wizard writes the new `database_id` back into the forked `wrangler.jsonc`.
3. **Asks for one secret** — set `PAYLOAD_SECRET` as **Encrypted**. Generate it with `openssl rand -base64 48`. Every other internal token Payload needs (`NEXT_PRIVATE_DRAFT_SECRET`, `REVALIDATION_KEY`, etc.) is HMAC-derived from this at boot. No other secret is required for the worker to come up.
4. **Builds and deploys.** Cloudflare CI runs `pnpm run build`, which: applies pending D1 migrations against the freshly-created remote database, generates LLM docs, runs `next build`. OpenNext bundles `.open-next/worker.js`. Cloudflare deploys it.

That's it. The site is live at your Workers URL.

### Optional integrations

Each is **off** by default. Set the corresponding secret (Dashboard → Worker → Settings → Variables and Secrets → Encrypted) to turn it on; the related code path becomes inert when the secret is missing.

| Feature | Secret to set |
|---|---|
| Transactional email (Resend) | `RESEND_API_KEY` (+ optional `RESEND_FROM_ADDRESS`, `RESEND_FROM_NAME`) |
| Form submissions → HubSpot | `NEXT_PRIVATE_HUBSPOT_PORTAL_KEY` |
| reCAPTCHA verification | `NEXT_PRIVATE_RECAPTCHA_SECRET_KEY` |
| Admin "Redeploy" button | `VERCEL_REDEPLOY_URL` (despite the name, any HTTP webhook works — Cloudflare Workers Builds deploy hook, GitHub Actions `workflow_dispatch`, etc.) |
| Docs sync from GitHub | `GITHUB_ACCESS_TOKEN`, `COMMIT_DOCS_API_URL`, `COMMIT_DOCS_API_KEY` |
| Stripe (cloud-pricing) | `STRIPE_SECRET_KEY` (+ `STRIPE_WEBHOOK_SECRET` if you wire the webhook route) |
| Discord community-help sync | `DISCORD_TOKEN` |

Sync the wizard's `wrangler.jsonc` update back to your main repo so local CLI commands hit the same D1:

```bash
git remote add cf https://github.com/<your-fork-owner>/payload-website
git fetch cf
git cherry-pick cf/main
git push origin main
```

## CLI deploy (alternative)

```bash
pnpm install
pnpm wrangler login

# create resources
pnpm wrangler d1 create payload-website          # paste the printed id into wrangler.jsonc → d1_databases[0].database_id
pnpm wrangler r2 bucket create payload-website

# required secret
pnpm wrangler secret put PAYLOAD_SECRET --env production

# initial migration + build + deploy
pnpm payload migrate:create
pnpm run deploy                                  # = deploy:database && deploy:app
```

## Local development

```bash
pnpm install
cp .env.example .env.local                       # fill in PAYLOAD_SECRET at minimum
pnpm payload migrate                             # applies migrations to local D1 (.wrangler/state/v3/d1/)
pnpm dev                                         # next dev with Cloudflare bindings via @opennextjs/cloudflare
```

Cloudflare bindings (`D1`, `R2`, `IMAGES`) are wired into `next dev` by `initOpenNextCloudflareForDev()` in `next.config.js`, so `cloudflare.env.D1` etc. work in dev exactly as they do in the deployed worker — they just hit local SQLite/R2 emulation under `.wrangler/state/v3/`.

To preview the worker bundle locally (closer to production, slower iteration):

```bash
pnpm run preview                                 # opennextjs-cloudflare build && preview
```

## What changed from upstream payloadcms/website

Every diff against [`payloadcms/website` `main`](https://github.com/payloadcms/website) is justified by Cloudflare Workers runtime compatibility:

| Upstream (incompatible on workerd) | Cloudflare equivalent | Files touched |
|---|---|---|
| `@payloadcms/db-mongodb` | `@payloadcms/db-d1-sqlite` | `payload.config.ts`, `package.json` |
| `@payloadcms/storage-vercel-blob` | `@payloadcms/storage-r2` | `payload.config.ts`, `package.json` |
| `@payloadcms/email-nodemailer` + `nodemailer-sendgrid` | `@payloadcms/email-resend` | `payload.config.ts`, `package.json` |
| `sharp` (Node-only image processing) | Cloudflare Image Resizing via custom `next/image` loader | `next.config.js`, new `src/utilities/cloudflareImageLoader.ts`, `package.json` |
| `node-cron` | Cloudflare Cron Triggers (`triggers.crons` in `wrangler.jsonc` + a `scheduled()` handler if needed) | `package.json` removal only |
| Vercel deploy infra | `wrangler.jsonc` + `open-next.config.ts` + `public/_headers` | new files; deleted `vercel.json`, `Caddyfile` |

D1-specific schema accommodations — required because SQLite enforces a 63-character identifier limit that MongoDB never had:

- `enumName` on `link.type`, `link.appearance`, `linkGroup.type` (used by every block).
- `dbName` on the nested arrays whose Drizzle-generated table name overflows: `CaseStudyCards.cards`, `CaseStudyParallax.items` + `.images`, `ComparisonTable.rows`, `HoverHighlights.highlights`, `MediaContentAccordion.accordion`, `StickyHighlights.highlights`, `MediaContent.images`, `CodeFeature.codeTabs`.

Nothing else was touched. The upstream README's local-dev section (hosts file, `Caddyfile`, `local.payloadcms.com`) no longer applies because Cloudflare's wrangler proxy replaces those.

## Known caveats inherited from the Cloudflare runtime

- **GraphQL** — Workers has [open issues](https://github.com/cloudflare/workerd/issues/5175) with the API surface Payload's GraphQL uses. The route is present; some queries may fail at runtime. The website's main paths don't use GraphQL externally.
- **Worker size** — Payload + Lexical + Payload UI puts the bundle near or above Workers free-tier limits. **Paid Workers plan recommended** (this is also what the official `with-cloudflare-d1` template advises).

## License

MIT — inherited from upstream [payloadcms/website](https://github.com/payloadcms/website/blob/main/LICENSE).

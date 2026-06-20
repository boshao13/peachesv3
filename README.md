# Peaches Fitness Club — Website

Server-rendered marketing site for **Peaches Fitness Club**, Albuquerque's women-focused gym.
Built with **Next.js 15 (App Router, RSC) + TypeScript + Tailwind CSS v4**, SEO-first, accessible,
and on-brand.

- Design spec: [`docs/superpowers/specs/2026-06-19-peaches-rebuild-design.md`](docs/superpowers/specs/2026-06-19-peaches-rebuild-design.md)
- Implementation plan: [`docs/superpowers/plans/2026-06-19-peaches-rebuild.md`](docs/superpowers/plans/2026-06-19-peaches-rebuild.md)
- The previous Create React App lives under [`legacy/`](legacy/) for reference (not built/deployed).

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in keys (see below)
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build` · `npm run start` · `npm run lint` · `npm run test` (Vitest unit
tests) · `npm run test:a11y` (Playwright + axe; builds & starts the app automatically).

## Environment variables (`.env.example`)

| Var | Required | Purpose |
|-----|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | Canonical/OG/sitemap base URL (no trailing slash) |
| `RESEND_API_KEY` | yes (prod) | Sends contact/careers/newsletter emails via [Resend](https://resend.com) |
| `NEXT_PUBLIC_MAPBOX_API_KEY` | optional | Branded Mapbox map on `/contact` (falls back to a static address + directions if unset) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | yes (prod) | Durable form rate limiting ([Upstash](https://upstash.com)). The API **fails loud** in production if missing; dev degrades to honeypot-only. |

> ⚠️ **Security (spec §13.3):** the old CRA committed a Mapbox token to git history. **Rotate that token** and URL-restrict the new one to the production domain. Forms email is sent from a Resend test sender by default — set a verified domain sender in `lib/email.ts` before launch.

## Editing content

All copy and data live in [`content/`](content/) — edit these, not the components:

- `site.ts` — name, address/phone/email (single-source NAP), hours, socials, Glofox URLs, Mapbox style, promo banner, price range
- `amenities.ts`, `trainers.ts`, `classes.ts`, `plans.ts`, `dayPasses.ts`, `kidsCare.ts`, `faq.ts`, `codeOfConduct.ts`, `careers.ts`, `stats.ts`
- `nav.ts` — header/footer navigation

Images live in `public/images/<group>/` (migrated + resized from the live site via
`migration/download-live-assets.sh` → `migration/resize-to-public.sh`).

### Adding/updating a trainer

Edit `content/trainers.ts`. **Katie** is currently a placeholder (`placeholder: true`) — add her real
bio + a headshot in `public/images/trainers/` and remove the placeholder flag.

## Architecture

- **Server components** render all primary content (SEO). Interactive bits (header menu, modals,
  carousel, stat counters, forms, Mapbox, Glofox facade, hash redirect) are leaf `'use client'`
  components.
- **SEO:** per-route metadata + canonical/OG, `HealthClub`/`LocalBusiness` + `FAQPage` +
  `BreadcrumbList` JSON-LD, `app/sitemap.ts` / `app/robots.ts`, static OG image (`public/og.png`).
- **Forms:** one `app/api/contact/route.ts` (zod discriminated union) → honeypot → Upstash rate
  limit → Resend.
- **Design tokens** in `app/globals.css` (Tailwind v4 `@theme`); palette roles are AA-verified by a
  Vitest contrast test (`lib/__tests__/contrast.test.ts`).

## Deploy (Amazon EC2)

Runs as a long-lived Node server (`next start`, port 3000) behind nginx. On the instance:

```bash
# 1. Prereqs (Amazon Linux 2023 example)
sudo dnf install -y nodejs git nginx     # Node 20+; or use nvm

# 2. Get the code
git clone https://github.com/boshao13/peachesv3.git && cd peachesv3
git checkout master                       # or your deploy branch
npm ci

# 3. Set env vars (see table above). IMPORTANT: NEXT_PUBLIC_* are inlined at BUILD
#    time, so they must be present BEFORE `npm run build`. Put them in .env.production
#    (or export them in the shell / systemd EnvironmentFile).
cat > .env.production <<'ENV'
NEXT_PUBLIC_SITE_URL=https://www.peachesfitnessclub.com
NEXT_PUBLIC_MAPBOX_API_KEY=...        # rotated token
RESEND_API_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
ENV

# 4. Build + run
npm run build
npm run start            # serves on http://localhost:3000
```

**Keep it running** with a process manager so it survives crashes/reboots — e.g. **pm2**:

```bash
sudo npm i -g pm2
pm2 start "npm run start" --name peaches
pm2 save && pm2 startup     # follow the printed command to enable on boot
```

(Or a systemd unit running `npm run start` with `EnvironmentFile=/path/.env.production`.)

**nginx reverse proxy** (`/etc/nginx/conf.d/peaches.conf`) → proxy `:80/:443` to `:3000`:

```nginx
server {
  listen 80;
  server_name www.peachesfitnessclub.com peachesfitnessclub.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;   # required for rate limiting
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

Then add TLS with certbot (`sudo dnf install -y certbot python3-certbot-nginx && sudo certbot --nginx`),
open ports **80/443** in the instance Security Group, and point DNS at the instance/Elastic IP.

**Redeploys:** `git pull && npm ci && npm run build && pm2 restart peaches`.

Legacy CRA slugs (`/daypass`, `/kidscare`, `/codeofconduct`) 308-redirect to the new hyphenated
routes automatically (handled in `next.config.ts`).

## Backups & rollback

Three layers, safest first:

**1. Full-instance snapshot (do this before the first cutover).** Backs up the *entire* box —
the current live site, configs, everything — and restores in minutes:

```bash
aws ec2 create-image --instance-id <INSTANCE_ID> \
  --name "peaches-pre-cutover-$(date +%F-%H%M)" --no-reboot
```

Restore by launching a new instance from that AMI (or detach/attach the EBS snapshot) and
repointing the Elastic IP/DNS.

**2. Automatic per-deploy backups.** Use `scripts/deploy.sh` instead of building by hand — it
**snapshots the current site first**, then builds, and only reloads if the build succeeds (so a
bad build never takes the site down):

```bash
bash scripts/deploy.sh           # backup → git pull → npm ci → build → pm2 reload
```

Each run writes a timestamped `peaches-YYYYMMDD-HHMMSS.tar.gz` (built `.next` + `public` + source,
plus the git SHA and nginx config) to `~/peaches-backups` (keeps the last 10; set `S3_BUCKET=s3://…`
to also push offsite). You can also run it standalone any time: `bash scripts/backup-site.sh`.

**3. One-command rollback.** Restore the previous site if something looks wrong:

```bash
bash scripts/rollback.sh                                   # restore the most recent backup
bash scripts/rollback.sh ~/peaches-backups/peaches-XXXX.tar.gz   # or a specific one
ls -1t ~/peaches-backups/peaches-*.tar.gz                  # list backups
```

Rollback restores the archived build (no rebuild), keeps your `.env*`, moves the bad copy aside as
`peachesv3.broken-<ts>` for inspection, and reloads pm2. (Git-native alternative:
`git checkout <previous-sha> && npm ci && npm run build && pm2 reload peaches`.)

> All scripts are configurable via env vars (`APP_DIR`, `BRANCH`, `PM2_NAME`, `BACKUP_DIR`,
> `KEEP`, `S3_BUCKET`) — see the header comment in each `scripts/*.sh`.

> The `X-Forwarded-For` header above is required for the forms' IP-based rate limiting to work behind
> nginx. Also ensure `next build` runs on the server (or in CI) with the `NEXT_PUBLIC_*` vars set,
> since they are baked into the client bundle at build time.

## Launch checklist (spec §13)

- [ ] Confirm NAP (address/Suite/ZIP, phone) and update `content/site.ts`
- [ ] Confirm/seed the Facebook page URL (then add to `site.socials.facebook` for JSON-LD `sameAs`)
- [ ] Rotate + URL-restrict the Mapbox token; set `NEXT_PUBLIC_MAPBOX_API_KEY`
- [ ] Configure Upstash in production
- [ ] Add Katie's real bio + headshot
- [ ] Confirm membership pricing (or keep "Contact for pricing")
- [ ] Replace Privacy/Terms placeholder copy with finalized legal text
- [ ] Set a verified Resend sender domain

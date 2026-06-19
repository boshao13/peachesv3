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

## Deploy (Vercel)

1. Import the repo into Vercel (framework auto-detected as Next.js).
2. Set all env vars above in Project Settings.
3. Deploy. Legacy CRA slugs (`/daypass`, `/kidscare`, `/codeofconduct`) 308-redirect to the new
   hyphenated routes automatically.

## Launch checklist (spec §13)

- [ ] Confirm NAP (address/Suite/ZIP, phone) and update `content/site.ts`
- [ ] Confirm/seed the Facebook page URL (then add to `site.socials.facebook` for JSON-LD `sameAs`)
- [ ] Rotate + URL-restrict the Mapbox token; set `NEXT_PUBLIC_MAPBOX_API_KEY`
- [ ] Configure Upstash in production
- [ ] Add Katie's real bio + headshot
- [ ] Confirm membership pricing (or keep "Contact for pricing")
- [ ] Replace Privacy/Terms placeholder copy with finalized legal text
- [ ] Set a verified Resend sender domain

# Peaches Fitness Club — Next.js Rebuild — Design Spec

**Date:** 2026-06-19
**Status:** Approved (design); revised after spec review rounds 1–2
**Topic:** Full rebuild of the Peaches Fitness Club marketing website from a client-rendered CRA SPA to a server-rendered Next.js 15 app — SEO-first, local-search optimized, performant, accessible, on-brand, with tasteful animation.

> **Revision history.** R1 resolved the asset-source blocker (all 56 live assets downloaded into `migration/live-assets/`, incl. Kira's real headshot), reframed routes (ports vs. net-new), pinned fonts/tokens/Tailwind-v4 wiring, decided the backend shape + durable rate limiting, clarified NAP provenance, added legal pages and three appendices. R2 pinned an AA-safe button recipe + contrast-check mechanism, reconciled the careers form values↔zod enums, completed the asset manifest (thankyou.png; `.webp` heading fix; background roles), corrected the font inventory, gave the newsletter form a home, added 404/error pages, gated unconfirmed NAP/Facebook from production structured data, and declared the build order as a 3–4 slice plan decomposition.

---

## 1. Goal & Context

Peaches Fitness Club is a women-focused gym in Albuquerque, NM (opened June 2024; owners Rachel Berrier & Sean Kaplan). The current production site is a Create React App client-side SPA with poor SEO (~1 KB HTML shell; all content rendered after JS). This rebuild ships a server-rendered Next.js app with the same brand identity, full content coverage vs. the **live** site (which is ahead of the repo), and a new Trainers page.

**Primary objectives (priority order):** (1) SEO — server-rendered content, per-route metadata, JSON-LD, local keywords, sitemap/robots. (2) Local SEO — `HealthClub`/`LocalBusiness` structured data, single-source NAP. (3) Performance & Core Web Vitals. (4) Polished on-brand design with tasteful, accessible animation. (5) Working lead/contact backend with spam protection.

**Success criteria:** runs with `npm install && npm run dev`; Lighthouse targets per §12 measurement profile; all live content/photos migrated; deployable to Vercel.

---

## 2. Confirmed Decisions

1. **Page scope:** all live pages + all spec pages (full content coverage). See §4.
2. **Booking/conversion:** keep **Glofox** — membership/class CTAs deep-link to the real portal; embed the live Glofox class-schedule iframe on `/classes` (lazy facade). Membership tier pricing as editable placeholders.
3. **Brand/visual direction:** **keep the current look, but elevate it to feel elegant** — retain the coral-peach identity while refining toward a premium, feminine-but-strong aesthetic: generous whitespace, refined Pacifico script accents + clean Quicksand body (§5.2), restrained motion, soft shadows, considered type scale and rhythm. Polished and editorial, never clichéd-pink or templated. No rebrand of the palette.
4. **Map:** port the existing custom **Mapbox GL** map to `/contact`, dynamically imported, mounted on scroll-into-view, with a static fallback.
5. **Trainer roster (2026-06-19):** Shelbie has left; **Katie** is the new trainer. Trainers page = **Kira** (existing, real assets in hand) + **Katie** (new, bio/photo owner-supplied). The stale `"Chantal"` label in the live bundle is disregarded.
6. **Backend shape:** a single Route Handler `app/api/contact/route.ts` using a **zod discriminated union on `formType`** (`contact` | `careers` | `newsletter`). See §10.
7. **Rate limiting:** honeypot (primary cheap filter) + **Upstash Redis** (`@upstash/ratelimit`) durable limiter; **required in production** (fail-loud), honeypot-only allowed in dev. See §10 + §13.

---

## 3. Tech Stack

- **Next.js 15 (App Router) + React Server Components** — SSR/SSG, not a client SPA.
- **TypeScript**, strict.
- **Tailwind CSS v4** (CSS-first: `@import "tailwindcss"`, `@theme`, `@tailwindcss/postcss`) + CSS-variable design tokens (§5.1).
- **Framer Motion**; **Lenis** (optional, behind `prefers-reduced-motion`).
- **`next/image`**; **`next/font/google`** self-hosted at build (§5.2).
- **Email:** `resend`. **Validation:** `zod`. **Rate limiting:** `@upstash/ratelimit` + `@upstash/redis`.
- **ESLint + Prettier.** **Testing:** `vitest` (token contrast unit test) + `@axe-core/playwright` (page a11y scans). `package.json` scripts: `test` (vitest) and `test:a11y` (playwright+axe). No CI is assumed — these run **locally before launch** (Vercel does not run unit tests on deploy); a GitHub Action is optional.
- **Deploy:** Vercel; `.env.example` documents all vars; `.env` gitignored from first commit; no secrets committed. ⚠️ This is a rebuild of an existing repo whose `.env` is **already tracked in git history** with the live Mapbox token — see §13.3 (rotation mandatory; old token permanently compromised).

---

## 4. Routes & Information Architecture

Today's CRA has only **6 real routes**; most "pages" below are **net-new**, because the current site puts mission/gallery/map/FAQ as **sections of the single-page Home**.

| Route | Type | Content source |
|-------|------|----------------|
| `/` | port (Home, recomposed) | existing Home sections, refined |
| `/about` | **net-new** | mission statement + owner story (brother-sister, June 2024) — to-be-written |
| `/amenities` | **net-new** | amenity list (have) + descriptions — to-be-written |
| `/trainers` | **net-new** | Kira (ported) + Katie (owner-supplied) |
| `/classes` | port + new content | class types (to-be-written) **server-rendered** + Glofox iframe facade |
| `/membership` | **net-new** (canonical "join" page) | plan tiers + features; pricing placeholder; lead CTA → contact form |
| `/day-pass` | port | $15/$25 |
| `/kids-care` | port | $15/mo + $5 addl |
| `/code-of-conduct` | port | 7 rules |
| `/careers` | port | form + positions |
| `/contact` | promoted from Home section | form + map + hours + directions |
| `/faq` | promoted from Home section | 6 Q&A (FAQ #5/#6 to be reconciled — §6.2) |
| `/privacy` | **net-new** | boilerplate; owner to supply |
| `/terms` | **net-new** | boilerplate; owner to supply |
| `not-found` | **net-new** | `app/not-found.tsx` — on-brand 404, correct 404 status, nav back to key pages |
| (error boundary) | **net-new** | root `app/error.tsx` — on-brand recoverable error UI |
| `/sitemap.xml` | generated | `app/sitemap.ts` (uses `NEXT_PUBLIC_SITE_URL`) |
| `/robots.txt` | generated | `app/robots.ts` |

**Redirects (`next.config.ts` `redirects()`), exactly 3 (308):** `/daypass → /day-pass`, `/kidscare → /kids-care`, `/codeofconduct → /code-of-conduct`.

**Legacy hash anchors** (`/#contact-us-section`, `/#pre-enrollment-section`, `/#faq`) can't be matched by server `redirects()`. A small **leaf client component `<HashRedirect/>`** (its own `'use client'`, mounted in the root layout — the layout itself stays a server component) maps: `#contact-us-section → /contact`, `#faq → /faq`, `#pre-enrollment-section → /membership` (the canonical join page). Best-effort UX only; carries **no SEO equity** (client-side, JS-dependent).

---

## 5. Design System & Component Library

**Aesthetic principles (elegance):** generous whitespace and a calm vertical rhythm (8px spacing scale); a clear, restrained type hierarchy (Pacifico script reserved for accents/wordmark, Quicksand for body, Oswald for headings); soft, low-spread shadows and gentle radii over hard borders; large, well-composed photography with subtle overlays for text legibility; coral used sparingly as an accent against cream so it reads premium, not loud; understated, slow motion (fades/parallax/staggered reveals) rather than flashy effects. Editorial and refined — never clichéd-pink or templated.

### 5.1 Design tokens (single source) + Tailwind v4 wiring
- Raw tokens as CSS variables in `app/globals.css` `:root`; Tailwind v4 CSS-first via `@import "tailwindcss"` + `@theme inline { --color-coral: var(--coral); … }` so tokens expose CSS vars **and** generate utilities. PostCSS uses `@tailwindcss/postcss` (no v3 `tailwind.config.js`).
- **Pinned palette + AA-safe role table** (hexes fixed; ratios pre-computed):

  | Token | Hex | Role / allowed use |
  |-------|-----|--------------------|
  | `--cream` | `#FFF8F0` | page background (pinned) |
  | `--charcoal` | `#2B2622` | **primary body text** (AA on cream/white/peach) |
  | `--coral` | `#D56F52` | **large text only (≥24px / ≥18.66px bold), decorative, borders, icon accents** — never normal-size text or button text |
  | `--coral-deep` | `#A8503A` | **primary button fill with white text** (white-on-`#A8503A` ≈ 5.0:1, AA pass); text links on cream |
  | `--coral-dark` | `#B55C44` | hover state for `--coral-deep`; large text only |
  | `--peach` / `--peach-2` | `#FACCB5` / `#FAB39D` | backgrounds & decoration **only**, never text color |
  | `--sage` | `#4E7A51` | accent; text-safe on white (≈4.7:1); large text/decorative on cream |
- **Button recipe (decided):** primary = `--coral-deep` fill + white label (AA pass at any size); hover → `--coral-dark`. Secondary = `--charcoal` text on `--peach`/outline. `--coral` is reserved for large display text and decoration. This removes the white-on-`#D56F52` AA failure.
- **Coral on peach is forbidden:** `--coral`/`--coral-deep` large text and **functional** (non-decorative) icons/borders are allowed on **cream/white only** — never on `--peach`/`--peach-2` (coral-on-peach is <3:1). Peach is decoration/background only.
- **Allowed-pairings matrix (the token unit test iterates exactly this):**

  | fg | bg | size-class | required | actual |
  |----|----|-----------|----------|--------|
  | `--charcoal` | cream/white/peach/peach-2 | normal | 4.5:1 | 8.5–15:1 ✓ |
  | white | `--coral-deep` | normal | 4.5:1 | 5.42:1 ✓ |
  | white | `--coral-dark` (hover) | normal | 4.5:1 | 4.59:1 ✓ |
  | `--coral-deep` | cream/white | normal (links) | 4.5:1 | ~5:1 ✓ |
  | `--sage` | white | normal | 4.5:1 | 4.97:1 ✓ |
  | `--coral` | cream/white | large only | 3:1 | 3.2–3.37:1 ✓ |
- **Contrast gate (mechanism, not aspiration):** (a) a Vitest **token unit test** iterates the matrix above, computing the WCAG ratio per pairing and failing below its required threshold; (b) an **axe-core** (Playwright) pass over key pages in §14 step 9.

### 5.2 Fonts (`next/font/google`, self-hosted at build — no runtime CDN)
- **What the live site actually renders (verified in `src`, not just the CDN link):** the CDN link in `public/index.html` loads **7 families** (Hammersmith One, Lato, Oswald:500, Pacifico, Quicksand:500, Sacramento, Vujahday Script), but several are loaded-not-used: **Pacifico is commented out** (`src/Slogan.jsx:89`), **Quicksand has zero `font-family` usages**. The faces genuinely on screen are **Oswald** (dominant display/heading/body, 13 declarations), **Lato** (App.css body), and **Vujahday Script** (cursive accent).
- **DECISION (owner, 2026-06-19): Option B — refined re-skin.** Pinned allow-list (3 families):
  - `Pacifico` → `--font-display` (script accent: logo wordmark, slogan, section flourishes).
  - `Quicksand` (400/500/700) → `--font-sans` (all body/UI).
  - `Oswald` (500/600) → `--font-heading` (headings) — retained from the live look to anchor structure.
  - **Dropped:** Lato, Sacramento, Hammersmith One, Vujahday Script. This is a deliberate, owner-approved change from the live faces (which lean Oswald/Lato/Vujahday); softer/cleaner per §2.3's "cleaner" intent.
- **Weights** beyond the live single-weight CDN loads (Quicksand 400/700, Oswald 600) are intentional rebuild additions.
- **Build note:** `next/font/google` fetches + self-hosts at **build time** (needs network during build; runtime has no CDN call). All chosen families expose CSS variables (`--font-display`/`--font-sans`/`--font-heading`) that are mapped into Tailwind `@theme` and set on `<body>`. For fully offline/reproducible builds, vendor `.woff2` via `next/font/local`.

### 5.3 Reusable components
`Button`, `Container`, `Section`, `Card`, `Header` (sticky/condense + mobile menu — client), `Footer` (incl. Privacy/Terms links **and `NewsletterForm`**), `Modal` (focus-trap — client), `Accordion` (FAQ), `Carousel`/`Gallery` (keyboard-navigable — client), `Stat` (animated count-up — client), `TrainerCard` (+ expandable bio/modal), form primitives (`Field`, `Input`, `Textarea`, `Select`, `FormStatus`), `NewsletterForm` (Footer), `JsonLd` (server), `MapEmbed` (Mapbox wrapper — client, dynamic), `GlofoxEmbed` (iframe facade — client), `HashRedirect` (leaf client). Client interactivity confined to leaf components; pages/sections stay server. States in **Appendix B**; data shapes in **Appendix A**.

---

## 6. Content Layer (owner-editable, typed)

Typed modules under `/content/` (interfaces in **Appendix A**): `site.ts`, `amenities.ts`, `trainers.ts`, `classes.ts`, `plans.ts`, `dayPasses.ts`, `kidsCare.ts`, `faq.ts`, `codeOfConduct.ts`, `careers.ts`, `stats.ts`.

### 6.1 NAP — provenance & single source
The owner's project brief is **authoritative**; the repo's values (`87110`, no suite, commented placeholder phone `(505) 555-1234`) are **stale**.
- **Address:** 2801 Eubank Blvd NE, Suite P, Albuquerque, NM 87112. **Phone:** (505) 808-9499. **Email:** peachesfitnessclub@gmail.com.
- **Socials:** Instagram `@peachesfitnessclub`; Facebook `/peachesfitnessclub` (**unconfirmed slug** — see §8/§13).
- **Hours:** Operating M–F 5a–10p, Sat–Sun 5a–8p; Staffed M–F 8a–10p, Sat–Sun 8a–8p.
- **Geo:** lat `35.115047`, lng `-106.536046` — **single source for both the `LocalBusiness` JSON-LD and the Mapbox map center** (the map reads `nap.geo`, not a separate field).

**Single-source rule:** all NAP lives in `content/site.ts`, interpolated into the visible address, JSON-LD, directions URL, and map center — never hardcoded. NAP is a **production launch gate** (§13): build with brief values; do not expose unconfirmed NAP in production-indexed JSON-LD (preview/`noindex` until confirmed).

### 6.2 Ported real copy (verbatim, to be refined — no lorem)
- **Mission statement** (full paragraph), **Slogan** ("Where good things are growing/thriving/happening"), **6 FAQ Q&A**, **amenities** (weight room, cardio, turf, classes [yoga/Pilates/Zumba/strength], sauna, cold plunge, recovery, Booty Builder® equipment, private changing rooms, secure lockers, members lounge, Peachy Bar), **day passes** ($15 / $25), **Kids Care** ($15/mo + $5 addl), **Code of Conduct** (intro + 7 rules).
- **FAQ reconciliation (required before launch, §13):** FAQ #6 says sign up "through our website, mobile app, or in person" and FAQ #5 implies self-serve membership packages — both contradict the **Glofox-only booking** + **"Contact for pricing"** reality. Edit these answers to match; the **`FAQPage` JSON-LD must equal the edited on-page answers** (no stale rich-result text).
- **Membership tiers:** monthly/quarterly/annual; pricing placeholder → feature cards + "Contact for pricing". JSON-LD `priceRange` = literal `"$$"`.
- **Promo slot (`site.promo`):** the "no sign-up fee" banner renders on `/membership` (above the plan cards) and the Home membership CTA when `enabled: true`; `enabled: false` hides it everywhere (no layout gap).

### 6.3 Trainers
- **Kira** — real assets present (`kira.webp` 1080×1920; `kiraheading.webp`). Bio + specialization bullets ported. Complete.
- **Katie** — new; **bio + headshot owner-supplied (§13).** Build `TrainerCard` + `trainers.ts` entry now with `placeholder: true`, a neutral placeholder image, "Bio coming soon", and `// TODO: owner to provide`. No fabricated credentials.
- **Shelbie** — removed; assets excluded from build.

### 6.4 Stats (honest facts only)
Home "social proof" uses verifiable facts, never fabricated member counts. `stats.ts` defaults (owner-confirmable, §13): amenity count, group-class formats, daily access window (5AM–10PM), "Locally owned, est. 2024", "Women-focused". `Stat` renders whatever `stats.ts` holds; empty array → section omitted.

---

## 7. Asset Migration (resolved — verified manifest)

**Blocker resolved.** All **56** live assets downloaded (0 failures) into `migration/live-assets/` (hashed) + `migration/live-assets/clean/` (de-hashed). Raw downloads are git-ignored; reproducible via `migration/download-live-assets.sh`. Full mapping in **Appendix C** (every one of the 56 accounted for).

- **Authoritative source:** `migration/live-assets/clean/` (newer than repo). Includes **Kira's real headshot**.
- **Photos are large** (phone shots up to 7008×4672, 3–5.6 MB) → migration step **pre-resizes to ≤2400px long edge** into `public/images/<group>/`; `next/image` serves responsive variants.
- **Decorative "heading" art** (1000×200 / 600×200 text images; mostly PNG, **two are `.webp`**: `trainersheading1.webp`, `trainermodalheading.webp`) is **re-implemented as semantic HTML `<h1>/<h2>`** (SEO/a11y); keep files only where genuinely decorative.
- **Excluded:** `shelbiepeaches.webp`, `shelbieheading1.webp` (Shelbie left). **Dropped:** `thankyou.png` (former form-success image; success now rendered as text per Appendix B).
- Hero loaded `priority`; below-fold lazy with explicit dimensions (no CLS) + blur placeholders.

---

## 8. SEO

- All primary content **server-rendered**. `/classes` and `/faq` must server-render real, indexable content (class types from `content/classes.ts`; the 6 edited FAQ answers) **independent of third-party embeds** — the Glofox iframe is a hash-route SPA contributing **zero** indexable content.
- **Per-route Metadata API:** unique title/description/canonical, OG + Twitter. `metadataBase` from `NEXT_PUBLIC_SITE_URL`.
- **OG image:** one static branded PNG in `public/`, set as the **default `openGraph.images` + `twitter.images` in the root layout**; child routes **spread/inherit** (don't fully replace) so subpages never silently drop it. `metadataBase` ensures absolute URLs. Dynamic `next/og` is out of scope for v1.
- **Local keywords, natural:** "women's gym Albuquerque", "women-focused fitness club Albuquerque NM", "gym for women near me", "Albuquerque ladies gym", "sauna cold plunge Albuquerque".
- **JSON-LD:** `HealthClub`/`LocalBusiness` site-wide (name, single-source address/geo/phone/hours, `priceRange:"$$"`); `FAQPage` on `/faq` (matches edited answers); `BreadcrumbList` on subpages.
  - **`sameAs`:** include Instagram; **omit Facebook until the exact page URL is confirmed** (don't emit an unverified slug into structured data).
  - **NAP fields** emit brief values for build/preview; **gated from production indexing until confirmed** (§13 hard gate).
- Semantic HTML (one `<h1>`/page, ordered headings, descriptive `alt`), dynamic `app/sitemap.ts` + `app/robots.ts`, lazy/preloaded images, reserved space (no CLS).

---

## 9. Animation & Accessibility

- Framer Motion: scroll-reveal, subtle hero parallax, staggered cards, button/card hover micro-interactions, animated stat counters. Elegant, not busy. Lenis optional + gated.
- **`prefers-reduced-motion` everywhere** via a shared `useReducedMotion` guard (disables non-essential motion + Lenis).
- Mobile-first responsive; sticky header condenses on scroll.
- Keyboard nav, visible focus, ARIA, **AA contrast per §5.1 role table + the §5.1/§14 contrast gate**.

---

## 10. Backend / Forms (decided)

**Single endpoint** `app/api/contact/route.ts` (POST). Body = **zod discriminated union on `formType`**:
- `contact` (also serves lead/"join"/pre-enrollment): `{ name, email, phone?, message?, company? }` — **phone optional** (matches live ContactUsModal; maximizes conversion).
- `careers`: `{ name, email, phone, address, education, experience, overEighteen: boolean, gender, position, company? }`.
- `newsletter`: `{ email, company? }`.

**Careers values↔zod (critical — prevents silent 400s):** the new `<Select>` `option value`s **must equal the canonical enum literals**, NOT the legacy CRA values. Legacy `male|female|other|noanswer` → emit `Male|Female|Non-Binary|Prefer Not To Answer`; legacy position typo `Group Instuctor` → `Group Instructor`; legacy `overEighteen` `"yes"/"no"` string → rendered as a yes/no select **coerced to boolean** (`z.preprocess`/transform). Legacy values are intentionally replaced. (Field↔zod parity table in Appendix A.)

**Field-NAME remap (all forms — prevents silent 400s, mirrors the careers guarantee):** the live EmailJS forms post `user_name`/`user_phone`/`user_email`/`message`; the new inputs **must** use the bare zod names `name`/`phone`/`email`/`message`. Newsletter input → `email`. Honeypot input `name="company"` (must be empty). Legacy `user_*` names are replaced everywhere (Appendix A parity table).

**Entry-point field sets (both validate against the same optional-superset `contact` schema):** contact page = `name`, `email`, `phone?`, `message`; `/membership` lead CTA = `name`, `email`, `phone?` (no message). Newsletter (Footer) = `email`.

**Newsletter scope (v1):** like the current site (EmailJS→inbox), the newsletter just **emails the signup to `peachesfitnessclub@gmail.com`** — no list/ESP/double-opt-in. A real ESP (e.g. Resend Audiences/Mailchimp) is a documented future addition, not v1.

**Pipeline (shared helpers):** `parse(formType)` → honeypot check → `rateLimit(ip, formType)` → `sendEmail(formType)` (Resend). **Honeypot:** if `company` is non-empty (bot), return `200 { ok:true }` **without sending** (silent success, don't tip off bots). **IP source:** first hop of `x-forwarded-for` (Vercel), fallback to a shared key if absent. **Resend call** is wrapped in an `AbortController` timeout so slow failures map to the `502` contract rather than a platform 504; route sets `maxDuration` accordingly. **Response contract:**
- `200 { ok: true }`
- `400 { ok: false, errors: Record<field,string> }` — keys = the **zod field names** for that `formType`, one message/field (first zod issue).
- `400 { ok: false, error: "invalid_request" }` — malformed/unknown `formType` (discriminated-union fallthrough).
- `429 { ok: false, error: "rate_limited" }` · `502 { ok: false, error: "send_failed" }`.

`FormStatus` renders states per Appendix B. **Resend:** to `peachesfitnessclub@gmail.com`; per-`formType` subject + `reply_to` = submitter email.

**Spam protection:** honeypot (primary, free) + **Upstash Redis `@upstash/ratelimit`** (durable across serverless; in-memory does **not** work on Vercel). Env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. **Production requires Upstash (fail-loud at module init if absent when `NODE_ENV==='production'`);** dev degrades to honeypot-only with a logged warning. Production-Upstash config is a launch-gate item (§13).

---

## 11. Integrations

- **Glofox** (branch `65d38d833aabb0e6490203b0`): membership CTA → `…/memberships`; `/classes` embeds `…/classes-day-view` in a **facade** (poster + "Load schedule"/scroll-trigger) so the iframe loads on intent, with a "Book on Glofox" button. **Facade failure/timeout → "Book on Glofox" link out** (Appendix B).
- **Mapbox GL** on `/contact`: style `mapbox://styles/peachesgym/clqea736d005p01of0tvtg9g8`, **center = `nap.geo`**, zoom 14, pitch 60, `logo3` marker. **Dynamically imported, client-only, mounted on scroll-into-view.** Env `NEXT_PUBLIC_MAPBOX_API_KEY` (public token, exposed client-side — **URL-restrict to prod domain**). **No-key/load-failure → static map image + "Get Directions" button** (Appendix B). **The Mapbox token currently committed in the repo `.env` is compromised → rotate + URL-restrict before launch (§13).**
- **Google Maps directions:** `…/dir/?api=1&destination=` + URL-encoded `${street}${suite ? ', ' + suite : ''}, ${city}, ${state} ${zip}` — serialized entirely from `content/site.ts` `nap` (includes Suite P + correct ZIP; never hardcoded).

---

## 12. Performance Targets, Trade-offs & Non-Goals

**Lighthouse profile:** mobile, simulated throttling, **production build** on Vercel preview, **median of 3 runs**.

| Page group | Perf | SEO | A11y | Best Practices |
|------------|------|-----|------|----------------|
| Home + content pages | **≥90** | **100** | **≥95** | **≥95** |
| `/classes` (Glofox iframe), `/contact` (Mapbox GL) | best-effort, <90 expected (facades/lazy mounts) | **100** (content server-rendered) | **≥95** | best-effort (third-party console/cookie deductions acknowledged) |

- Obsolete **countdown timer** removed; pre-enrollment becomes the evergreen lead/join CTA (`contact` form type, reached from `/membership`).
- **Privacy/Terms** in scope as boilerplate (§4).
- **Non-goals (YAGNI):** no CMS, no auth, no e-commerce (Glofox owns booking/payments), no blog, no dynamic OG.

---

## 13. Launch Gate — Open Items

**Ship-blocking for production (SEO/local-SEO/security/correctness):**
1. **NAP confirmation** — full address (NE / Suite P / 87112-vs-87110), phone `(505) 808-9499`, geo. Build uses brief values; gate production-indexed JSON-LD until confirmed.
2. **Facebook page URL** — omit from `sameAs` until confirmed.
3. **Rotate the committed Mapbox token** + URL-restrict to prod domain. The token is in **committed git history** (`.env` is tracked under `REACT_APP_MAPBOX_API_KEY`), so it is permanently compromised — rotation is mandatory, the old token must never be reused, and `git rm --cached .env` + gitignore applies to the new branch (history rewrite optional). URL-restriction is the durable mitigation.
4. **Upstash configured in production** (durable rate limiting; fail-loud if absent).

**Non-blocking (build proceeds with placeholders/fallbacks):**
5. Katie's bio + headshot. 6. Membership pricing ("Contact for pricing"). 7. `stats.ts` values. 8. Privacy/Terms real copy. 9. FAQ #5/#6 copy reconciliation (must precede production, feeds JSON-LD). 10. Trainer roster confirmation (Kira + Katie).
11. ~~Font direction~~ — **RESOLVED (owner): Option B re-skin** (Pacifico + Quicksand, Oswald headings). See §5.2.

---

## 14. Build Order (= plan decomposition)

The numbered order **doubles as the decomposition into 5 balanced, independently reviewable plan slices**: **(A1) foundation** — scaffold, tokens + contrast test, fonts, assets, layout/shared components, legal + 404/error (steps 1–3); **(A2) pages + SEO** (steps 4–6); **(B) forms backend** (step 7); **(C) third-party integrations** (step 8); **(D) verify/polish** (step 9). B and C have minimal coupling to page rendering and can be planned/tested separately.

1. Scaffold Next.js 15 + TS + Tailwind v4 (CSS-first) + ESLint/Prettier; define tokens (§5.1) + token **contrast unit test**, fonts (§5.2), `content/site.ts` (incl. `siteUrl`, `nap.geo`).
2. Migrate & resize assets per Appendix C → `public/images/`; `next/image` helpers.
3. Layout (Header/Footer incl. `NewsletterForm` + `HashRedirect`), Privacy/Terms, `not-found.tsx` + `error.tsx`, shared components, remaining `content/*`.
4. Build Home, then remaining pages (server-rendered content first).
5. Animations with reduced-motion guards.
6. SEO: per-route metadata, `metadataBase`, JSON-LD (FB omitted; NAP gating), `sitemap.ts`/`robots.ts`, static OG default in root layout, 3 redirects.
7. Backend: `/api/contact` discriminated-union handler — zod (+careers value/boolean coercion), honeypot, Upstash (prod-required), Resend; wire all forms incl. newsletter + states.
8. Glofox facade + Mapbox map (with fallbacks).
9. Lighthouse per §12; **axe-core a11y/contrast pass**; verify AA; README + `.env.example`.

---

## 15. Deliverables

- Working repo on `rebuild/nextjs`; `npm install && npm run dev`.
- README: setup, env vars, content-editing guide, deploy steps, env-var rename note, **Mapbox token rotation + URL-restriction**, enabling Upstash (prod-required).
- `.env.example`: `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `NEXT_PUBLIC_MAPBOX_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, Glofox branch id.
- `.env` gitignored from first commit; 3 redirects + hash shim in place; no secrets committed.

---

## Appendix A — Data Contracts

```ts
// content/site.ts
interface SiteConfig {
  name: string; siteUrl: string;                 // NEXT_PUBLIC_SITE_URL → metadataBase
  nap: { street: string; suite?: string; city: string; state: string; zip: string;
         phone: string; email: string; geo: { lat: number; lng: number } };  // geo = JSON-LD geo AND map center
  hours: { operating: DayRange[]; staffed: DayRange[] };
  socials: { instagram: string; facebook?: string };   // facebook omitted from sameAs unless confirmed
  glofox: { branchId: string; membershipsUrl: string; scheduleUrl: string };
  mapbox: { styleUrl: string; zoom: number; pitch: number };   // center derived from nap.geo (no separate field)
  promo: { enabled: boolean; text: string };           // "no sign-up fee" slot
  priceRange: string;                                  // "$$"
}
interface DayRange { days: string; open: string; close: string }

interface Trainer { slug: string; name: string; photo: ImgRef; headingImg?: ImgRef;
  bio: string[]; specializations: string[]; certifications?: string[]; placeholder?: boolean }
interface Amenity { slug: string; name: string; description: string; images: ImgRef[] }
interface ClassType { slug: string; name: string; description: string; image?: ImgRef }
interface Plan { slug: string; tier: string; price?: string | null;   // null → "Contact for pricing"
  cadence?: 'monthly'|'quarterly'|'annual'; features: string[]; highlighted?: boolean }
interface DayPass { name: string; price: string; includes: string[] }
interface KidsCare { intro: string; priceMonthly: string; priceAdditional: string; images: ImgRef[] }
interface FaqItem { q: string; a: string }
interface ConductRule { title: string; body: string }
interface Stat { value: string; label: string }      // honest facts only; [] → hide section
interface ImgRef { src: string; width: number; height: number; alt: string }

// content/careers.ts — option value === label === canonical enum literal (NOT legacy CRA values)
const GENDER   = ['Male','Female','Non-Binary','Prefer Not To Answer'] as const;
const POSITION = ['Front Desk','Child Care Provider','Personal Trainer','Group Instructor'] as const; // typo fixed
// over-18: rendered as yes/no <select>, value 'yes'|'no', coerced to boolean in zod

// app/api/contact — zod discriminated union on `formType`
type ContactBody =
  | { formType:'contact';    name:string; email:string; phone?:string; message?:string; company?:'' }
  | { formType:'careers';    name:string; email:string; phone:string; address:string;
      education:string; experience:string; overEighteen:boolean;       // z.preprocess('yes'/'no' → boolean)
      gender:(typeof GENDER)[number]; position:(typeof POSITION)[number]; company?:'' }
  | { formType:'newsletter'; email:string; company?:'' };
// Response: 200 {ok:true} | 400 {ok:false,errors:{[field]:string}} | 400 {ok:false,error:'invalid_request'}
//         | 429 {ok:false,error:'rate_limited'} | 502 {ok:false,error:'send_failed'}
```

**Form-field ↔ zod parity (all forms):**
- **contact/newsletter input `name` attrs** = bare zod names `name`/`email`/`phone`/`message` (NOT legacy EmailJS `user_name`/`user_phone`/`user_email`); newsletter input = `email`; honeypot = `company`. Contact `phone` optional in both form (no `required`) and zod.
- **careers:** each input/select name maps 1:1 to a zod field; gender/position `<option value>` = the canonical literal (typo fixed); `overEighteen` select emits `'yes'|'no'`, coerced to boolean server-side. Legacy CRA values are intentionally replaced.

**Other contracts:** `Trainer.slug` is a React key / in-page anchor only — **there is no `/trainers/[slug]` route** (bios are TrainerCard modals). `ImgRef.width`/`height` are the **post-resize intrinsic dimensions** of the file in `public/images/` (≤2400px long edge), used by `next/image` to reserve space (no CLS).

## Appendix B — Component States Matrix

| Component | States |
|-----------|--------|
| Forms (`FormStatus`) | idle · submitting (disabled) · success (text, no image) · validation-error (per-field from `errors`, keyed by zod field name) · invalid_request · rate-limited (429 → "Too many attempts, try again shortly") · send-failed (502/network → "Couldn't send — call/email us") |
| `NewsletterForm` (Footer) | idle · submitting · success ("You're subscribed") · error (inline) |
| `GlofoxEmbed` | poster/idle → loading → loaded · **load-failure/timeout → "Book on Glofox" link out** |
| `MapEmbed` | scroll-idle → loading → loaded · **no API key OR load failure → static map image + "Get Directions"** |
| `Carousel`/`Gallery` | normal · single-image (hide arrows/dots) · **empty → render nothing** |
| `TrainerCard` | collapsed → expanded/modal · placeholder (Katie: neutral image + "Bio coming soon") |
| `Header` | top (full) → scrolled (condensed) · mobile menu open/closed |
| `not-found` / `error` | 404 page (correct status, nav back) · root error boundary (recoverable UI + retry) |

## Appendix C — Asset Manifest (verified — all 56 in `migration/live-assets/clean/`)

Photos pre-resize to ≤2400px long edge → `public/images/<group>/`.

| Group → destination | Files | Notes |
|---------------------|-------|-------|
| `gym/` | Gym1–7.webp | 7008×4672 / 4672×7008; resize (7 files) |
| `bootybuilder/` | Bootybuilder1–6.webp | 4672×7008; resize (6) |
| `classes/` | Classes1–3.webp | resize (3) |
| `plunge/` | Plunge1–4.webp | cold plunge; resize (4) |
| `sauna/` | Sauna1–2.webp | resize (2) |
| `peachybar/` | Peachybar1–2.webp | resize (2) |
| `lounge/` | PeachesLounge.webp | resize (1) |
| `kids/` | kidsclub1–5.webp | 4284²; resize (5) |
| `trainers/` | kira.webp (1080×1920), kiraheading.webp (800×400) | Kira real assets ✓ (2) |
| `brand/` | MAINLOGO.png (3750²), logo.png (480²), logo3.png (384², map marker), peachasset.png (800×1000), **mainbackground.webp (7008×4672 — site hero/section background)**, **background.png (1024² — legacy CoC page bg; optional/likely unused)** | (6) |
| decorative/optional (re-implement as HTML headings) | missionstatement.png, signuptoday.png, daypasses.png, kidscare.png, codeofconduct.png, cometrainwithus.png, careers.png, Faq.png, contactus1.png, growing2.png, thriving2.png, happening1.png, wheregoodthingsare.png (PNG, 1000×200/600×200) · **trainersheading1.webp, trainermodalheading.webp (WEBP, 1000×200 — not PNG)** | (15) |
| **dropped** | thankyou.png (former form-success image; success now text per Appendix B) | (1) |
| **excluded** | shelbiepeaches.webp, shelbieheading1.webp (Shelbie left) | (2) |
| historical fallback | repo `src/images/*` (older originals) | use only if a live asset is unsuitable |

**Count check:** 7+6+3+4+2+2+1+5+2+6+15+1+2 = **56** ✓

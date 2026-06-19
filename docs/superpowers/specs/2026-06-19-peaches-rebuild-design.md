# Peaches Fitness Club — Next.js Rebuild — Design Spec

**Date:** 2026-06-19
**Status:** Approved (design), pending spec review
**Topic:** Full rebuild of the Peaches Fitness Club marketing website from a client-rendered CRA SPA to a server-rendered Next.js 15 app, prioritizing SEO, local search, performance, accessibility, and a polished, on-brand aesthetic with tasteful animation.

---

## 1. Goal & Context

Peaches Fitness Club is a women-focused gym in Albuquerque, NM (opened June 2024, owners Rachel Berrier & Sean Kaplan). The current site is a Create React App (CRA) client-side SPA with poor SEO (all content rendered after JS; ~1 KB HTML shell). This project rebuilds it as a server-rendered Next.js app with the same brand identity, full content parity with the **live** site (which is ahead of the repo), and a new Trainers page.

**Primary objectives, in priority order:**
1. SEO — server-rendered content, per-route metadata, JSON-LD, local keywords, sitemap/robots.
2. Local SEO — `HealthClub`/`LocalBusiness` structured data, NAP consistency.
3. Performance & Core Web Vitals — fast content pages, no layout shift, optimized images.
4. Polished, on-brand design with tasteful, accessible animation.
5. Working lead/contact backend with spam protection.

**Success criteria:** runs with `npm install && npm run dev`; Lighthouse SEO 100 / Accessibility ≥95 / Best Practices ≥95 site-wide; Performance ≥90 on Home and content pages (see §11 for embed-page exceptions); all live content and photos migrated; deployable to Vercel.

---

## 2. Confirmed Decisions

These were explicitly decided with the owner and govern the build:

1. **Page scope:** Ship **all live pages + all spec pages** (full parity, nothing dropped). See §4.
2. **Booking/conversion:** **Keep Glofox** — membership/class CTAs deep-link to the real Glofox portal, **and embed the live Glofox class-schedule iframe** on `/classes` (lazy-loaded via a facade). Membership tier pricing shown as editable placeholders.
3. **Brand/visual direction:** **Keep the current look, cleaner** — retain the recognizable coral-peach palette and script/display accent type; rebuild clean, responsive, accessible, and SEO-optimized. No radical rebrand.
4. **Map:** **Port the existing custom Mapbox GL map** (branded style) to `/contact`, dynamically imported and loaded on scroll-into-view.
5. **Trainer roster (updated 2026-06-19):** Shelbie has left the club; **Katie** is the new trainer. Trainers page features **Kira** (existing) + **Katie** (new). The stale `"Chantal"` label found in the live bundle is disregarded.

---

## 3. Tech Stack

- **Framework:** Next.js 15 (App Router) with React Server Components — SSR/SSG, not a client SPA.
- **Language:** TypeScript, strict mode.
- **Styling:** Tailwind CSS v4 + a design-token layer of CSS variables (palette, spacing, radii, type scale) in a single tokens file.
- **Animation:** Framer Motion; Lenis smooth scroll (optional, behind `prefers-reduced-motion`).
- **Images:** `next/image` for all imagery (priority/preload hero, lazy-load below the fold, blur placeholders, explicit dimensions to avoid CLS).
- **Fonts:** `next/font` self-hosted (no external font CDN calls), echoing the current script/display + clean sans pairing.
- **Tooling:** ESLint + Prettier.
- **Backend:** Next.js Route Handler(s) under `app/api/` with zod validation, honeypot + rate limiting, email via Resend.
- **Deploy:** Vercel (`vercel`-ready config; no secrets committed; `.env.example` documents all env vars).

---

## 4. Routes

Full live + spec parity (12 content routes + generated SEO routes):

| Route | Purpose |
|-------|---------|
| `/` | Home: hero, value props, amenities preview, classes preview, trainers preview, social proof/stats, membership CTA, location/hours, lead form |
| `/about` | Story: brother-sister owners, women-focused mission, the space |
| `/amenities` | Full amenities grid with imagery + descriptions |
| `/trainers` | Meet the trainers (Kira + Katie) with bios; trainer modal/detail |
| `/classes` | Class types + embedded live Glofox schedule (lazy facade) + "Book on Glofox" |
| `/membership` | Plans comparison + "no sign-up fee" promo slot + Glofox CTA |
| `/day-pass` | Standard ($15) and Premium ($25) day passes |
| `/kids-care` | Kids Care program + pricing ($15/mo, $5 each additional) + gallery |
| `/code-of-conduct` | The 7 conduct rules |
| `/careers` | Job application form (positions: Front Desk, Child Care, Personal Trainer, Group Instructor) |
| `/contact` | Contact form + Mapbox map + hours + directions |
| `/faq` | Structured FAQ + `FAQPage` JSON-LD |
| `/sitemap.xml` | Generated via Next metadata route |
| `/robots.txt` | Generated via Next metadata route |

Legacy CRA route slugs (`/daypass`, `/kidscare`, `/codeofconduct`) are replaced by hyphenated slugs above; permanent redirects (`next.config` `redirects()`) map old → new to preserve any existing inbound links/SEO.

---

## 5. Design System & Component Library

### 5.1 Design tokens (CSS variables, single source)
- **Palette:** coral primary `#D56F52`; coral-dark (hover) `#B55C44`/`#b5533e`; peach `#FACCB5`, `#FAB39D`; sage accent `#4E7A51`; cream/off-white background; charcoal text. Exposed as CSS variables and mapped into Tailwind v4 theme.
- **Type scale, spacing scale, radii, shadows, container widths, motion durations/easings** — all tokenized so the owner can retune globally.

### 5.2 Fonts (`next/font`, self-hosted)
- One expressive script/display for logo + accents (echoing current Pacifico/Sacramento feel).
- One clean sans for body/UI (Quicksand/Lato family).
- Loaded via `next/font` with `display: swap`, subset, and CSS variables; no external CDN requests.

### 5.3 Reusable components
`Button`, `Container`, `Section`, `Card`, `Header` (sticky, condenses on scroll, mobile menu), `Footer`, `Modal` (accessible focus-trap), `Accordion` (FAQ), `Carousel`/`Gallery` (keyboard-navigable, the amenity/kids photo galleries), `Stat` (animated count-up), `TrainerCard` (+ expandable bio/modal), form primitives (`Field`, `Input`, `Textarea`, `Select`, `FormStatus`), `JsonLd` (renders structured data), `MapEmbed` (Mapbox wrapper), `GlofoxEmbed` (iframe facade).

Each component has one clear purpose, a typed props interface, and is independently understandable/testable. Client interactivity is confined to leaf components; pages and sections remain server components.

---

## 6. Content Layer (owner-editable)

All copy and data centralized in typed modules under `/content/` so the owner can edit without touching components:

- `site.ts` — name, NAP, hours (operating + staffed), socials, Glofox URLs/branch id, Mapbox style/center, promo flags.
- `amenities.ts`, `trainers.ts`, `classes.ts`, `plans.ts`, `dayPasses.ts`, `kidsCare.ts`, `faq.ts`, `codeOfConduct.ts`, `careers.ts`.

### 6.1 Real content to port (verbatim from current site, to be refined—not lorem)

**Mission statement:**
> "At Peaches Fitness Club, we're dedicated to fostering a welcoming, judgment-free environment that empowers clients to achieve their fitness goals. Our commitment to safety, support for women, and emphasis on diversity and inclusivity underpin our community's spirit. With top-notch trainers, advanced facilities, and a nurturing community, we inspire confidence and healthy living, celebrating the joy of self-improvement and the strength found in encouragement. At Peaches, we're more than a gym; we're a community where everyone grows together."

**Slogan:** "Where good things are *growing / thriving / happening*" (animated word rotation).

**NAP & hours:**
- Address: **2801 Eubank Blvd NE, Suite P, Albuquerque, NM 87112** (business-facts spec) — note: current site shows `87110`; **owner to confirm ZIP** (see §13).
- Phone: **(505) 808-9499** · Email: **peachesfitnessclub@gmail.com**
- Operating hours: M–F 5 AM–10 PM, Sat–Sun 5 AM–8 PM. Staffed hours: M–F 8 AM–10 PM, Sat–Sun 8 AM–8 PM.
- Geo (Mapbox center): lon `-106.536046`, lat `35.115047`.
- Socials: Instagram `@peachesfitnessclub` (https://www.instagram.com/peachesfitnessclub/); Facebook `/peachesfitnessclub` (**owner to confirm exact URL**).

**FAQ (6 Q&A, ported verbatim, expandable later):**
1. *What makes Peaches unique for women?* — "Peaches is tailored specifically for women, offering a safe and supportive environment. Our equipment, classes, and programs are designed with women's fitness needs and goals in mind, ensuring a comfortable and effective workout experience."
2. *Are there any classes specifically designed for women at Peaches?* — "Yes, we offer a variety of classes geared towards women, including yoga, Pilates, Zumba, strength training, and more. These classes focus on areas that most interest our female clientele, such as core strength, flexibility, and overall wellness."
3. *Do you offer personal training services at Peaches?* — "Absolutely! Our certified personal trainers specialize in women's fitness and can create customized workout plans to meet your individual goals, whether it's weight loss, strength building, or improving overall fitness."
4. *Is the gym equipped with amenities specific to women's needs?* — "Yes, we provide amenities like private changing rooms, secure lockers, women-specific fitness equipment, and a lounge area for relaxation and socializing."
5. *Are there any membership packages available at Peaches?* — "We offer a range of membership options to suit different needs and budgets, including monthly, quarterly, and annual plans. Each membership comes with access to all gym amenities and classes."
6. *How do I sign up for classes at Peaches?* — "You can sign up for classes through our website, mobile app, or in person at the gym. We recommend booking in advance to secure your spot."

**Amenities:** weight room, cardio room, turf area, group classes (yoga, Pilates, Zumba, strength training), sauna, cold plunge, recovery area, Booty Builder® equipment, private changing rooms, secure lockers, members lounge, Peachy Bar (juice/smoothie bar).

**Day passes:** Standard **$15** (24-hr unlimited gym use); Premium **$25** (24-hr gym + sauna + cold plunge + classes).

**Kids Care:** "Embrace your fitness journey with confidence while we take care of your little ones. For only **$15 a month, and $5 for each additional child**…" (full copy ported).

**Code of Conduct:** intro + 7 rules (photography/videography consent; personal space; advice & safety; respectful behavior; privacy & boundaries; conduct & movement; headphone rule) — ported verbatim.

**Membership tiers:** monthly / quarterly / annual — **pricing as editable placeholders** (not public); "no sign-up fee" promo slot is an editable, toggleable field.

### 6.2 Trainers content

- **Kira** — photo `kira.webp`, heading `kiraheading.webp`. Bio (ported): "Hi, I'm Kira! I'm a NASM certified personal trainer who loves helping women build their confidence inside and outside of the gym. Specializing in strength training and empowering women to break past their limits, I'm passionate about helping clients reach their fitness goals and build lasting, healthy habits for their future selves. With a focus on individualized coaching, I'm committed to providing a supportive, results-driven experience that's tailored to each woman's journey." Specialization bullets: strength training / empowerment; helping women break barriers; long-term sustainable habits; personalized programs; confidence building.
- **Katie** — **new trainer; bio and headshot to be supplied by owner.** Build the `TrainerCard` and content entry now with a clearly-marked editable placeholder bio and image slot (`// TODO: owner to provide Katie bio + headshot`). No fabricated credentials.

---

## 7. Asset Migration

Migrate **all** real photography into the new app, served via `next/image`:
- **Primary source — newer optimized `.webp` from the live bundle:** Gym1–7, Bootybuilder1–6, Plunge1–4, Sauna1–2, Classes1–3, Peachybar1–2, PeachesLounge, kidsclub1–5, MAINLOGO, logo, logo3, mainbackground, plus marketing title PNGs (missionstatement, signuptoday, daypasses, kidscare, codeofconduct, cometrainwithus, careers, Faq, contactus1) and slogan word art (wheregoodthingsare, growing/thriving/happening variants), peachasset, thankyou, trainer images (kira, kiraheading, trainersheading1, trainermodalheading).
- **Fallback source — repo originals** under `src/images/` for anything missing from the live bundle.
- Photos stored in `public/images/…` (galleries) and/or imported modules (hero/key images, for blur placeholders + dimension inference). Hero image preloaded with `priority`; all below-fold images lazy-loaded.
- Marketing "title" text currently baked into PNGs will be re-implemented as real semantic HTML headings where feasible (better SEO/accessibility), keeping the PNGs only where they're decorative brand art.

---

## 8. SEO

- All primary content server-rendered in HTML (no content that only appears after JS).
- **Per-route Metadata API:** unique `<title>`, meta description, canonical URL, Open Graph + Twitter cards with a branded OG image.
- **Local keywords, naturally** (no stuffing): "women's gym Albuquerque", "women-focused fitness club Albuquerque NM", "gym for women near me", "Albuquerque ladies gym", "sauna cold plunge Albuquerque".
- **JSON-LD structured data:**
  - `HealthClub`/`LocalBusiness` site-wide: name, address, geo, phone, opening hours, `sameAs` socials, `priceRange`.
  - `FAQPage` on `/faq`.
  - `BreadcrumbList` on subpages.
- Semantic HTML: exactly one `<h1>` per page, logical heading order, descriptive `alt` text.
- Dynamic `sitemap.xml` and `robots.txt` via Next metadata routes.
- Core Web Vitals: lazy-load below-fold images, preload hero, reserve space to avoid layout shift.

---

## 9. Animation & Accessibility

- Framer Motion: scroll-reveal on sections, subtle hero parallax, staggered card entrances, hover micro-interactions on buttons/cards, animated number counters for stats. Elegant, not busy.
- Lenis smooth scroll, optional and gated.
- **`prefers-reduced-motion` respected everywhere** via a shared `useReducedMotion` guard that disables non-essential motion (and Lenis).
- Mobile-first responsive; sticky header that condenses on scroll.
- Keyboard navigation, visible focus states, ARIA where needed, AA color contrast.

---

## 10. Backend / Forms

- A Route Handler `app/api/contact/route.ts` (with sibling handlers or a typed `type` discriminator) serving **contact, careers, newsletter, and lead/pre-enrollment** submissions.
- **Server-side validation with zod** per form schema.
- **Spam protection:** honeypot field + basic rate limiting (in-memory token bucket / IP throttle; documented as best-effort on serverless).
- **Email via Resend** to `peachesfitnessclub@gmail.com` (replaces the current EmailJS flow). `RESEND_API_KEY` stubbed in `.env.example`.
- Forms degrade gracefully: clear success/error states, accessible labels/errors, disabled-on-submit, no secrets client-side.

Form field sets (ported):
- **Contact/lead:** name, phone, email, message.
- **Careers:** name, email, phone, address, education, experience, over-18 (Y/N), gender, position desired.
- **Newsletter:** email.

---

## 11. Integrations

- **Glofox** (branch id `65d38d833aabb0e6490203b0`):
  - Membership CTA → `https://app.glofox.com/portal/#/branch/65d38d833aabb0e6490203b0/memberships`.
  - Classes schedule → embedded iframe of `…/classes-day-view`, wrapped in a **facade** (poster + "Load schedule"/scroll-trigger) so the heavy iframe loads only on intent; "Book on Glofox" button alongside.
- **Mapbox GL** on `/contact`: custom style `mapbox://styles/peachesgym/clqea736d005p01of0tvtg9g8`, center `-106.536046, 35.115047`, zoom 14, pitch 60, custom `logo3` marker. **Dynamically imported (client-only), mounted on scroll-into-view.** Key via `NEXT_PUBLIC_MAPBOX_API_KEY`.
- **Google Maps directions** button: `https://www.google.com/maps/dir/?api=1&destination=<address>`.

---

## 12. Trade-offs & Non-Goals

- **Performance on embed pages:** `/classes` (Glofox iframe) and `/contact` (Mapbox GL) will likely fall short of Performance ≥90 due to third-party JS. Mitigated with facades/lazy mounts so they load on intent; Home and content pages stay ≥90. SEO 100 / A11y ≥95 / BP ≥95 hold site-wide. (Accepted by owner.)
- **Obsolete countdown timer** (Feb 2024 launch) is removed; pre-enrollment becomes an evergreen lead/join CTA.
- **Privacy Policy / Terms** remain editable boilerplate — owner to supply real legal copy.
- No CMS, no auth, no e-commerce (Glofox owns booking/payments). No blog. These are explicitly out of scope (YAGNI).

---

## 13. Open Items (non-blocking; owner to confirm before launch)

1. **Katie's bio + headshot** — placeholder until provided.
2. **Address ZIP** — spec says `87112 Suite P`; current site shows `87110`. Confirm.
3. **Facebook URL** — confirm exact page URL.
4. **Membership pricing** — confirm tier prices (placeholders until then).
5. **Trainer roster** — confirmed Kira + Katie; flag if others should appear.

---

## 14. Build Order

1. Scaffold Next.js 15 + TS + Tailwind v4 + tooling; define design tokens, fonts, and theme.
2. Build layout (Header/Footer), shared component library, and `/content/*` data files (port real copy).
3. Migrate all assets (`next/image` pipeline).
4. Build Home, then remaining pages.
5. Add animations (with reduced-motion guards).
6. Add SEO: per-route metadata, JSON-LD, sitemap/robots, OG image; old→new redirects.
7. Wire contact/careers/newsletter/lead Route Handler(s) with zod, honeypot, rate limiting, Resend.
8. Integrate Glofox iframe facade + Mapbox map.
9. Run Lighthouse, fix to targets (§1, §12), write README.

---

## 15. Deliverables

- Full working repo, runs with `npm install && npm run dev`.
- README: setup, env vars, how to edit content, deploy steps.
- `.env.example` documenting `RESEND_API_KEY`, `NEXT_PUBLIC_MAPBOX_API_KEY`, Glofox branch id, and any other vars.
- Clean, commit-ready structure on branch `rebuild/nextjs`; no secrets committed; old→new redirects in place.

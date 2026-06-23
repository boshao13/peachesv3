# Peaches Fitness Club — Next.js Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Peaches Fitness Club marketing site as a server-rendered Next.js 15 (App Router, RSC, TS strict) app — SEO-first, accessible, on-brand and elegant — replacing the legacy CRA SPA.

**Architecture:** Server components render all primary content; interactivity (header, modals, carousel, stat counters, forms, Mapbox, Glofox facade, hash shim) is confined to leaf `'use client'` components. Tailwind v4 CSS-first tokens, `next/font` (Pacifico/Quicksand/Oswald), `next/image`. A single `/api/contact` route handler (zod discriminated union) handles contact/careers/newsletter with honeypot + Upstash rate limiting + Resend. Glofox iframe facade + dynamic Mapbox map with fallbacks.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lenis, zod, Resend, @upstash/ratelimit, mapbox-gl, Vitest, Playwright + @axe-core.

**Spec:** `docs/superpowers/specs/2026-06-19-peaches-rebuild-design.md`

**Build order = 5 plan slices:** A1 Foundation (Chunk 1) → A2 Pages+SEO (Chunk 2) → B Forms backend (Chunk 3) → C Integrations (Chunk 4) → D Animation+Verify (Chunk 5).

---

## Chunk 1: Foundation (scaffold, tokens, fonts, assets, layout shell, shared UI, legal/404/error)

> Covers spec §14 Build-Order **slice A1** = steps 1–3 (scaffold/tokens/contrast test/fonts/`content/site.ts`; asset migration; layout + shared components + legal/404/error). Read `@superpowers:test-driven-development` before the TDD tasks (5, 9) and `@superpowers:writing-plans` for the checkbox discipline. Every task ends with a conventional commit.

**Branch state note (do first, no commit):** The rebuild lives on branch `rebuild/nextjs`, which already exists and is checked out (`git branch` shows `* rebuild/nextjs`). Confirm before starting:

```bash
git -C "$REPO" rev-parse --abbrev-ref HEAD   # expect: rebuild/nextjs
```

If it prints anything else:

```bash
git -C "$REPO" checkout rebuild/nextjs 2>/dev/null || git -C "$REPO" checkout -b rebuild/nextjs
```

Set `REPO` once for all commands below:

```bash
export REPO="/Users/boshao/Library/Mobile Documents/com~apple~CloudDocs/CodeBases/peachesnew/peachesv3"
```

All paths in this chunk are relative to `$REPO` (the Next.js app lives at the repo root).

> **No shell job control in the non-interactive runner.** Do NOT background a server with `&` and stop it with `kill %1`. Where a verify step needs a running server, capture the PID (`npm run … & SRV=$!; …; kill "$SRV"`). The authoritative a11y checks run later via Playwright's `webServer` block (`npm run test:a11y`), configured in Task 3.

---

### Task 1: Archive the CRA app to `legacy/`, untrack `.env`, and remove stale build artifacts

The repo root currently holds the old CRA app (`src/`, `public/`, CRA `package.json`, `build/`, an `ubuntu@18.225/` stray dir). **These CRA files and `.env` ARE git-tracked on this branch** (verify: `git -C "$REPO" ls-files | head` lists `src/…`, `public/…`, `package.json`, `package-lock.json`, `README.md`, `.env`). Use `git mv`/`git rm` so renames and deletions are recorded cleanly. Also stop tracking `.env` (it contains the compromised Mapbox token, spec §13.3) — keep the working file but remove it from the index. **Keep `migration/`, `docs/`, `.git/`, `node_modules/` (CRA deps; reinstalled fresh in Task 2) staged for removal as noted below.**

Files:
- Create: `legacy/` (holds archived CRA `src/`, `public/`, CRA `package.json`, `package-lock.json`, CRA `README.md`)
- Modify (move via `git mv`): `src/` → `legacy/src/`, `public/` → `legacy/public/`, `package.json` → `legacy/package.json`, `package-lock.json` → `legacy/package-lock.json`, `README.md` → `legacy/README.md`
- Untrack (keep on disk): `.env` (`git rm --cached`)
- Delete: `build/`, `ubuntu@18.225/`, `node_modules/` (gitignored/untracked — `rm -rf` has no git effect)

Steps:
- [ ] Confirm the tracked state before moving (sanity — these are tracked, NOT untracked):

  ```bash
  git -C "$REPO" ls-files | grep -E '^(src/|public/|package\.json|package-lock\.json|README\.md|\.env)' | head
  ```

  Expected: lines for `.env`, `README.md`, `package.json`, `package-lock.json`, and many `public/…` / `src/…` entries.

- [ ] Create the archive dir and `git mv` the tracked CRA tree (records renames, so later diffs show moves not delete+add):

  ```bash
  mkdir -p "$REPO/legacy"
  git -C "$REPO" mv src legacy/src
  git -C "$REPO" mv public legacy/public
  git -C "$REPO" mv package.json legacy/package.json
  git -C "$REPO" mv package-lock.json legacy/package-lock.json
  git -C "$REPO" mv README.md legacy/README.md
  ```

- [ ] **Untrack `.env`** (keeps the file on disk; stops tracking the compromised token — spec §13.3). Rotation of the actual Mapbox token is a launch-gate item, this just removes it from the index:

  ```bash
  git -C "$REPO" rm --cached .env
  ```

- [ ] Remove CRA build artifacts and the stray dir (these are gitignored/untracked, so plain `rm -rf`):

  ```bash
  rm -rf "$REPO/build" "$REPO/ubuntu@18.225" "$REPO/node_modules"
  ```

- [ ] Verify the working root is clean (only `docs/`, `legacy/`, `migration/`, `.env`, `.gitignore`, `.git/` remain):

  ```bash
  ls -A "$REPO"
  ```

  Expected: `.env  .git  .gitignore  docs  legacy  migration` (no `src`, `public`, `package.json`, `build`, `node_modules`, `ubuntu@18.225`).

- [ ] Confirm `.env` is now staged for un-tracking and the moves are renames:

  ```bash
  git -C "$REPO" status --short | grep -E '^(R|D).*\.env|^R' | head
  ```

  Expected: a `D  .env` (deletion-from-index) line and `R  …` rename lines for the moved CRA files.

- [ ] Commit:

  ```bash
  git -C "$REPO" add -A
  git -C "$REPO" commit -m "chore: archive CRA app to legacy/, untrack .env, remove build artifacts"
  ```

---

### Task 2: Scaffold Next.js 15 (App Router, TS strict, RSC) + install all deps (pinned once)

Create the Next 15 root config manually (no `create-next-app` interactive prompt — it conflicts with the existing `.git`/`legacy/`). **All runtime/test deps for the ENTIRE rebuild are pinned here and installed once.** Later chunks MUST NOT run additional unpinned `npm i <pkg>`; if a later chunk needs a package, add it to this `package.json`. This list already includes everything downstream chunks use (`mapbox-gl` for the Chunk 4 map, `zod`/`resend`/`@upstash/*` for the Chunk 3 forms backend, `framer-motion`/`lenis` for Chunk 5 animations). Note `zod@^3` — the schema code uses the zod **v3** API; avoid zod v4.

Files:
- Create: `package.json`, `tsconfig.json`, `next.config.ts` (stub — full redirects/images in Task 6), `postcss.config.mjs`, `next-env.d.ts` (auto), `.eslintrc.json`, `.prettierrc.json`, `.gitignore` (rewrite for Next), `app/layout.tsx` (temporary stub — replaced in Task 12), `app/page.tsx` (temporary stub — replaced in slice A2)

Steps:
- [ ] Write `package.json` (scripts + deps; versions pinned to the Next 15 / Tailwind v4 line):

  ```json
  {
    "name": "peaches-fitness-club",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint",
      "format": "prettier --write .",
      "test": "vitest run",
      "test:watch": "vitest",
      "test:a11y": "playwright test"
    },
    "dependencies": {
      "next": "15.3.3",
      "react": "19.1.0",
      "react-dom": "19.1.0",
      "zod": "^3.24.1",
      "resend": "^4.5.1",
      "@upstash/ratelimit": "^2.0.5",
      "@upstash/redis": "^1.34.3",
      "framer-motion": "^11.15.0",
      "lenis": "^1.1.18",
      "mapbox-gl": "^3.9.0"
    },
    "devDependencies": {
      "typescript": "^5.7.3",
      "@types/node": "^22.10.5",
      "@types/react": "^19.0.7",
      "@types/react-dom": "^19.0.3",
      "@types/mapbox-gl": "^3.4.1",
      "tailwindcss": "^4.0.0",
      "@tailwindcss/postcss": "^4.0.0",
      "eslint": "^9.18.0",
      "eslint-config-next": "15.3.3",
      "prettier": "^3.4.2",
      "vitest": "^2.1.8",
      "@playwright/test": "^1.49.1",
      "@axe-core/playwright": "^4.10.1"
    }
  }
  ```

- [ ] Write `tsconfig.json` (strict, App Router defaults, `@/*` path alias to repo root):

  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "lib": ["dom", "dom.iterable", "ES2022"],
      "allowJs": false,
      "skipLibCheck": true,
      "strict": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "bundler",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "plugins": [{ "name": "next" }],
      "paths": { "@/*": ["./*"] }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules", "legacy"]
  }
  ```

- [ ] Write `postcss.config.mjs` (Tailwind v4 single plugin):

  ```js
  const config = {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  };
  export default config;
  ```

- [ ] Write `next.config.ts` stub (full `redirects()` + `images` land in Task 6):

  ```ts
  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {};

  export default nextConfig;
  ```

- [ ] Write `.eslintrc.json`:

  ```json
  {
    "extends": ["next/core-web-vitals", "next/typescript"]
  }
  ```

  > Note: ESLint 9 defaults to flat config; `next lint` (Next 15.3.3) shims this legacy `.eslintrc.json` and may emit a config-deprecation notice. That's acceptable — Task 18's lint gate allows it. To silence it entirely, optionally migrate to a flat `eslint.config.mjs` using `eslint-config-next`'s flat export.

- [ ] Write `.prettierrc.json`:

  ```json
  {
    "semi": true,
    "singleQuote": false,
    "trailingComma": "all",
    "printWidth": 100
  }
  ```

- [ ] Rewrite `.gitignore` for Next (keeps `.env` ignored — now that Task 1 untracked it; `migration/live-assets/` raw downloads stay ignored):

  ```gitignore
  # dependencies
  /node_modules

  # next
  /.next/
  /out/
  next-env.d.ts

  # production
  /build

  # env — never commit secrets (see §13.3: rotate Mapbox token)
  .env
  .env*.local

  # testing
  /coverage
  /playwright-report
  /test-results

  # misc
  .DS_Store
  *.pem
  npm-debug.log*

  # legacy CRA archive — keep source for reference but not in builds
  # (legacy/ is committed once in Chunk 1 Task 1, then left alone)

  # migration raw downloads (reproducible via migration/download-live-assets.sh)
  /migration/live-assets/*.webp
  /migration/live-assets/*.png
  ```

- [ ] Write temporary `app/layout.tsx` stub (full version in Task 12):

  ```tsx
  export const metadata = { title: "Peaches Fitness Club" };

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }
  ```

- [ ] Write temporary `app/page.tsx` stub (real Home in slice A2):

  ```tsx
  export default function Home() {
    return <main>Peaches Fitness Club — coming soon</main>;
  }
  ```

- [ ] Install everything and generate the lockfile:

  ```bash
  cd "$REPO" && npm install
  ```

  Expected: completes with `added NNN packages`, creates `package-lock.json` and `node_modules/`, no `ERESOLVE` errors (React 19 + Next 15 + Tailwind 4 are mutually compatible).

- [ ] Verify the dev server boots (PID-capture pattern — no `kill %1`):

  ```bash
  cd "$REPO" && npm run dev >/tmp/peaches-dev.log 2>&1 & SRV=$!
  for i in $(seq 1 20); do curl -sf -o /dev/null http://localhost:3000 && break; sleep 1; done
  curl -s -o /dev/null -w "status: %{http_code}\n" http://localhost:3000
  kill "$SRV" 2>/dev/null; tail -5 /tmp/peaches-dev.log
  ```

  Expected: `status: 200`; log shows `✓ Ready` / `Local: http://localhost:3000`.

- [ ] Confirm `.env` is now untracked AND ignored (it was un-tracked in Task 1; the rewritten `.gitignore` now ignores it):

  ```bash
  git -C "$REPO" ls-files .env    # expect: (empty — not tracked)
  git -C "$REPO" check-ignore .env && echo "OK: .env ignored"
  ```

  Expected: first command prints nothing; second prints `.env` then `OK: .env ignored`.

- [ ] Commit:

  ```bash
  git -C "$REPO" add -A
  git -C "$REPO" commit -m "chore: scaffold Next.js 15 App Router + TS strict + Tailwind v4 toolchain"
  ```

---

### Task 3: Vitest + Playwright configs and the `__tests__` home for lib tests

Wire the two test runners so the TDD tasks (5, 9) and the slice-D a11y pass have configs. Vitest runs pure-logic unit tests (`lib/__tests__/*.test.ts`); Playwright runs `@axe-core/playwright` page scans against its own managed `webServer` (no manual server, no shell job control).

Files:
- Create: `vitest.config.ts`, `playwright.config.ts`, `tests/a11y/.gitkeep` (Playwright spec home — populated in slice D)

Steps:
- [ ] Write `vitest.config.ts` (node env for pure logic; resolves the `@/*` alias):

  ```ts
  import { defineConfig } from "vitest/config";
  import path from "node:path";

  export default defineConfig({
    test: {
      environment: "node",
      include: ["lib/**/*.test.ts", "content/**/*.test.ts"],
      globals: false,
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, ".") },
    },
  });
  ```

- [ ] Write `playwright.config.ts` (manages the prod server itself via `webServer`; specs use `baseURL` and need no manual server — per global correction 6):

  ```ts
  import { defineConfig, devices } from "@playwright/test";

  export default defineConfig({
    testDir: "./tests/a11y",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    reporter: "list",
    use: {
      baseURL: "http://localhost:3000",
      trace: "on-first-retry",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
      command: "npm run build && npm run start",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  });
  ```

- [ ] Create the Playwright spec home:

  ```bash
  mkdir -p "$REPO/tests/a11y" && touch "$REPO/tests/a11y/.gitkeep"
  ```

- [ ] Sanity-check Vitest runs with zero tests (no failure):

  ```bash
  cd "$REPO" && npx vitest run
  ```

  Expected: `No test files found` (exit 0 acceptable) or `passed (0)` — runner is wired, no error.

- [ ] Commit:

  ```bash
  git -C "$REPO" add -A
  git -C "$REPO" commit -m "chore: add Vitest and Playwright (axe) test configs"
  ```

---

### Task 4: `.env.example` with all 6 documented vars

Files:
- Create: `.env.example`

Steps:
- [ ] Write `.env.example` (the 5 runtime vars from §15 + the Glofox branch id; `.env` itself stays untracked/gitignored after Task 1):

  ```bash
  # Public site origin — used for metadataBase, sitemap, robots, absolute OG URLs.
  NEXT_PUBLIC_SITE_URL=https://www.peachesfitnessclub.com

  # Resend (transactional email for contact/careers/newsletter forms).
  RESEND_API_KEY=

  # Mapbox public token (client-exposed). MUST be URL-restricted to the prod
  # domain. The token in old git history is compromised — rotate before launch (§13.3).
  NEXT_PUBLIC_MAPBOX_API_KEY=

  # Upstash Redis (durable rate limiting). REQUIRED in production (fail-loud);
  # dev degrades to honeypot-only with a warning.
  UPSTASH_REDIS_REST_URL=
  UPSTASH_REDIS_REST_TOKEN=

  # Glofox booking branch id (deep-links + class-schedule iframe).
  NEXT_PUBLIC_GLOFOX_BRANCH_ID=65d38d833aabb0e6490203b0
  ```

- [ ] Verify `.env` is NOT tracked and IS ignored (it was un-tracked in Task 1; `git check-ignore` is only meaningful now that the file is no longer in the index):

  ```bash
  test -z "$(git -C "$REPO" ls-files .env)" && echo "OK: .env untracked"
  git -C "$REPO" check-ignore .env && echo "OK: .env ignored"
  ```

  Expected: `OK: .env untracked`, then `.env` and `OK: .env ignored`.

- [ ] Commit:

  ```bash
  git -C "$REPO" add .env.example
  git -C "$REPO" commit -m "chore: add .env.example documenting all runtime vars"
  ```

---

### Task 5: `lib/contrast.ts` WCAG ratio util — TDD against the §5.1 pairings matrix

Use `@superpowers:test-driven-development`. The contrast gate is a **mechanism, not aspiration** (§5.1): a Vitest test iterates the exact allowed-pairings matrix, computes the WCAG 2.x ratio per pairing, and fails any below its required threshold. Write the failing test first.

**Verified ratios (computed directly against the pinned §5.1 hexes — these are the source of truth for the assertions):** white-on-coral-deep `5.42`, white-on-coral-dark `4.59`, coral-deep-on-cream `5.15`, coral-deep-on-white `5.42`, sage-on-white `4.97`, coral-on-cream `3.20`, coral-on-white `3.37`, coral-on-peach `2.31`, coral-on-peach-2 `1.93`. The "coral on peach is forbidden" rule (§5.1) applies to **plain `--coral`** on peach (`2.31`) / peach-2 (`1.93`), both genuinely `<3`. Do NOT assert `coral-deep on peach-2 < 3` — that pairing is `≈3.10`, so the assertion would fail and block the GREEN step.

Files:
- Create (test, first): `lib/__tests__/contrast.test.ts`
- Create (impl, second): `lib/contrast.ts`

Steps:
- [ ] **RED** — write the failing test. It pins the §5.1 hexes, asserts each pairing meets its threshold, asserts `--coral` normal-size FAILS 4.5 (proving it's large-only), and asserts the two **forbidden** coral-on-peach cases are `<3:1`:

  ```ts
  // lib/__tests__/contrast.test.ts
  import { describe, it, expect } from "vitest";
  import { contrastRatio, meetsAA } from "@/lib/contrast";

  // Pinned hexes from spec §5.1
  const C = {
    cream: "#FFF8F0",
    white: "#FFFFFF",
    charcoal: "#2B2622",
    coral: "#D56F52",
    coralDeep: "#A8503A",
    coralDark: "#B55C44",
    peach: "#FACCB5",
    peach2: "#FAB39D",
    sage: "#4E7A51",
  } as const;

  describe("contrastRatio", () => {
    it("is 21:1 for black on white and symmetric", () => {
      expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
      expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 1);
    });
    it("is 1:1 for identical colors", () => {
      expect(contrastRatio("#D56F52", "#D56F52")).toBeCloseTo(1, 2);
    });
  });

  describe("§5.1 allowed-pairings matrix (the contrast gate)", () => {
    const NORMAL = 4.5;
    const LARGE = 3;

    const cases: Array<{ name: string; fg: string; bg: string; min: number }> = [
      // charcoal body text on every allowed surface — all must clear normal AA
      { name: "charcoal on cream", fg: C.charcoal, bg: C.cream, min: NORMAL },
      { name: "charcoal on white", fg: C.charcoal, bg: C.white, min: NORMAL },
      { name: "charcoal on peach", fg: C.charcoal, bg: C.peach, min: NORMAL },
      { name: "charcoal on peach-2", fg: C.charcoal, bg: C.peach2, min: NORMAL },
      // primary button: white on coral-deep, and hover white on coral-dark
      { name: "white on coral-deep (button)", fg: C.white, bg: C.coralDeep, min: NORMAL },
      { name: "white on coral-dark (hover)", fg: C.white, bg: C.coralDark, min: NORMAL },
      // text links: coral-deep on cream/white
      { name: "coral-deep link on cream", fg: C.coralDeep, bg: C.cream, min: NORMAL },
      { name: "coral-deep link on white", fg: C.coralDeep, bg: C.white, min: NORMAL },
      // sage text-safe on white
      { name: "sage on white", fg: C.sage, bg: C.white, min: NORMAL },
      // coral large-text-only on cream/white
      { name: "coral large on cream", fg: C.coral, bg: C.cream, min: LARGE },
      { name: "coral large on white", fg: C.coral, bg: C.white, min: LARGE },
    ];

    for (const { name, fg, bg, min } of cases) {
      it(`${name} >= ${min}:1`, () => {
        const r = contrastRatio(fg, bg);
        expect(r).toBeGreaterThanOrEqual(min);
      });
    }

    it("meetsAA agrees with the threshold for white on coral-deep (normal)", () => {
      expect(meetsAA(C.white, C.coralDeep, "normal")).toBe(true);
    });
    it("meetsAA treats coral as large-only (fails normal, passes large) on cream", () => {
      // coral on cream = 3.20: below 4.5 (normal) but above 3 (large)
      expect(meetsAA(C.coral, C.cream, "normal")).toBe(false);
      expect(meetsAA(C.coral, C.cream, "large")).toBe(true);
    });

    // FORBIDDEN per §5.1: plain --coral on peach surfaces is < 3:1 — util must catch it.
    it("forbids coral on peach (2.31 < 3)", () => {
      expect(contrastRatio(C.coral, C.peach)).toBeLessThan(3);
    });
    it("forbids coral on peach-2 (1.93 < 3)", () => {
      expect(contrastRatio(C.coral, C.peach2)).toBeLessThan(3);
    });
  });
  ```

- [ ] **Run RED** — confirm it fails (module not found):

  ```bash
  cd "$REPO" && npx vitest run lib/__tests__/contrast.test.ts
  ```

  Expected: failure — `Failed to resolve import "@/lib/contrast"` / `Cannot find module`.

- [ ] **GREEN** — implement `lib/contrast.ts` (standard WCAG 2.x relative-luminance + contrast formula):

  ```ts
  // lib/contrast.ts
  // WCAG 2.x relative luminance + contrast ratio. Pure, dependency-free.

  function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "").trim();
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) {
      throw new Error(`Invalid hex color: ${hex}`);
    }
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }

  function channelLuminance(c8: number): number {
    const c = c8 / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  export function relativeLuminance(hex: string): number {
    const [r, g, b] = hexToRgb(hex);
    return (
      0.2126 * channelLuminance(r) +
      0.7152 * channelLuminance(g) +
      0.0722 * channelLuminance(b)
    );
  }

  /** WCAG contrast ratio in [1, 21]; symmetric in fg/bg. */
  export function contrastRatio(fg: string, bg: string): number {
    const l1 = relativeLuminance(fg);
    const l2 = relativeLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  export type TextSize = "normal" | "large";

  /** AA: 4.5:1 for normal text, 3:1 for large text (≥24px / ≥18.66px bold). */
  export function meetsAA(fg: string, bg: string, size: TextSize): boolean {
    const required = size === "large" ? 3 : 4.5;
    return contrastRatio(fg, bg) >= required;
  }
  ```

- [ ] **Run GREEN** — confirm all pass:

  ```bash
  cd "$REPO" && npx vitest run lib/__tests__/contrast.test.ts
  ```

  Expected: all tests pass. Spot-check ratios match the verified values above: white-on-coral-deep ≈ `5.42`, white-on-coral-dark ≈ `4.59`, sage-on-white ≈ `4.97`, coral-deep-on-cream ≈ `5.15`, coral-on-cream ≈ `3.20`, coral-on-peach ≈ `2.31` (<3), coral-on-peach-2 ≈ `1.93` (<3).

- [ ] Commit:

  ```bash
  git -C "$REPO" add -A
  git -C "$REPO" commit -m "feat: add WCAG contrast util with §5.1 pairings gate (TDD)"
  ```

---

### Task 6: `next.config.ts` — 3 redirects (308) + images config

Files:
- Modify: `next.config.ts`

Steps:
- [ ] Replace the stub with the full config. Exactly 3 permanent (308) redirects per §4; `images` allows local `public/` assets and (later) remote OG; `formats` enables AVIF/WebP responsive variants:

  ```ts
  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    async redirects() {
      return [
        { source: "/daypass", destination: "/day-pass", permanent: true },
        { source: "/kidscare", destination: "/kids-care", permanent: true },
        {
          source: "/codeofconduct",
          destination: "/code-of-conduct",
          permanent: true,
        },
      ];
    },
    images: {
      formats: ["image/avif", "image/webp"],
      deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920, 2400],
      imageSizes: [64, 96, 128, 256, 384],
    },
  };

  export default nextConfig;
  ```

- [ ] Verify the redirects resolve as 308 (PID-capture; no `kill %1`):

  ```bash
  cd "$REPO" && npm run dev >/tmp/peaches-dev.log 2>&1 & SRV=$!
  for i in $(seq 1 20); do curl -sf -o /dev/null http://localhost:3000 && break; sleep 1; done
  for p in /daypass /kidscare /codeofconduct; do
    printf "%s -> " "$p"
    curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "http://localhost:3000$p"
  done
  kill "$SRV" 2>/dev/null
  ```

  Expected:
  ```
  /daypass -> 308 http://localhost:3000/day-pass
  /kidscare -> 308 http://localhost:3000/kids-care
  /codeofconduct -> 308 http://localhost:3000/code-of-conduct
  ```

- [ ] Commit:

  ```bash
  git -C "$REPO" add next.config.ts
  git -C "$REPO" commit -m "feat: next.config redirects (308) + responsive images config"
  ```

---

### Task 7: Design tokens in `app/globals.css` (`:root` pinned hexes) + `@theme inline` utility mapping

Tailwind v4 CSS-first: `@import "tailwindcss"` then `@theme inline { … }` mapping each raw `:root` var to a `--color-*` so tokens are both CSS vars **and** generate utilities (`bg-cream`, `text-charcoal`, etc.). Fonts are added to `@theme` in Task 12.

Files:
- Create: `app/globals.css`

Steps:
- [ ] Write `app/globals.css` (pinned §5.1 hexes; 8px spacing rhythm noted; base body styles set cream bg + charcoal text):

  ```css
  @import "tailwindcss";

  /* ---- Raw design tokens (single source, spec §5.1) ---- */
  :root {
    /* palette — hexes pinned, do not edit without re-running the contrast test */
    --cream: #fff8f0;
    --charcoal: #2b2622;
    --coral: #d56f52; /* large text / decoration / borders ONLY */
    --coral-deep: #a8503a; /* primary button fill (white text), links on cream */
    --coral-dark: #b55c44; /* button hover */
    --peach: #faccb5; /* background / decoration only */
    --peach-2: #fab39d; /* background / decoration only */
    --sage: #4e7a51; /* accent; text-safe on white */
    --white: #ffffff;

    /* radii + shadows — soft, low-spread per §5 elegance */
    --radius-sm: 0.5rem;
    --radius-md: 0.875rem;
    --radius-lg: 1.25rem;
    --shadow-soft: 0 6px 24px -8px rgb(43 38 34 / 0.12);
    --shadow-card: 0 2px 12px -4px rgb(43 38 34 / 0.1);
  }

  /* ---- Tailwind v4 theme mapping: tokens -> utilities ---- */
  @theme inline {
    --color-cream: var(--cream);
    --color-charcoal: var(--charcoal);
    --color-coral: var(--coral);
    --color-coral-deep: var(--coral-deep);
    --color-coral-dark: var(--coral-dark);
    --color-peach: var(--peach);
    --color-peach-2: var(--peach-2);
    --color-sage: var(--sage);
    --color-white: var(--white);

    --radius-sm: var(--radius-sm);
    --radius-md: var(--radius-md);
    --radius-lg: var(--radius-lg);

    --shadow-soft: var(--shadow-soft);
    --shadow-card: var(--shadow-card);
  }

  /* ---- Base ---- */
  html {
    scroll-behavior: smooth;
  }
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
  body {
    background-color: var(--cream);
    color: var(--charcoal);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  ```

- [ ] Verify the build picks up tokens (utilities compile; dev boots clean):

  ```bash
  cd "$REPO" && npm run dev >/tmp/peaches-dev.log 2>&1 & SRV=$!
  for i in $(seq 1 20); do curl -sf -o /dev/null http://localhost:3000 && break; sleep 1; done
  curl -s -o /dev/null -w "status: %{http_code}\n" http://localhost:3000
  kill "$SRV" 2>/dev/null; grep -i "error" /tmp/peaches-dev.log || echo "no errors"
  ```

  Expected: `status: 200` then `no errors`.

- [ ] Commit:

  ```bash
  git -C "$REPO" add app/globals.css
  git -C "$REPO" commit -m "feat: design tokens (:root) + Tailwind v4 @theme utility mapping"
  ```

---

### Task 8: `content/types.ts` — all Appendix A data-contract interfaces (shared by every content module + component)

Per global correction 8, the spec Appendix A interfaces live in **one module created in Chunk 1**, imported by every content module and component (Chunk 2 imports from `@/content/types`, never redefines). This is the single data contract. Pure types only — no values.

Files:
- Create: `content/types.ts`

Steps:
- [ ] Write `content/types.ts` (verbatim from spec Appendix A; `SiteConfig`/`DayRange` plus all content + ImgRef shapes):

  ```ts
  // content/types.ts — single source for all data-contract interfaces (spec Appendix A).
  // Imported by every content/*.ts module and the components that consume them.

  export interface ImgRef {
    src: string; // public path, e.g. "/images/gym/Gym1.webp"
    width: number; // post-resize intrinsic width (≤2400 long edge) — next/image reserves space (no CLS)
    height: number;
    alt: string;
  }

  export interface DayRange {
    days: string;
    open: string;
    close: string;
  }

  export interface SiteConfig {
    name: string;
    siteUrl: string; // NEXT_PUBLIC_SITE_URL → metadataBase
    nap: {
      street: string;
      suite?: string;
      city: string;
      state: string;
      zip: string;
      phone: string;
      email: string;
      geo: { lat: number; lng: number }; // JSON-LD geo AND map center
    };
    hours: { operating: DayRange[]; staffed: DayRange[] };
    socials: { instagram: string; facebook?: string }; // facebook gated from sameAs (§8)
    glofox: { branchId: string; membershipsUrl: string; scheduleUrl: string };
    mapbox: { styleUrl: string; zoom: number; pitch: number }; // center derived from nap.geo
    promo: { enabled: boolean; text: string };
    priceRange: string; // "$$"
  }

  export interface Amenity {
    slug: string;
    name: string;
    description: string;
    images: ImgRef[];
  }

  export interface Trainer {
    slug: string; // React key / in-page anchor only — NO /trainers/[slug] route
    name: string;
    photo: ImgRef;
    headingImg?: ImgRef;
    bio: string[];
    specializations: string[];
    certifications?: string[];
    placeholder?: boolean; // Katie until owner supplies bio/headshot
  }

  export interface ClassType {
    slug: string;
    name: string;
    description: string;
    image?: ImgRef;
  }

  export interface Plan {
    slug: string;
    tier: string;
    price?: string | null; // null → "Contact for pricing"
    cadence?: "monthly" | "quarterly" | "annual";
    features: string[];
    highlighted?: boolean;
  }

  export interface DayPass {
    name: string;
    price: string;
    includes: string[];
  }

  export interface KidsCare {
    intro: string;
    priceMonthly: string;
    priceAdditional: string;
    images: ImgRef[];
  }

  export interface FaqItem {
    q: string;
    a: string;
  }

  export interface ConductRule {
    title: string;
    body: string;
  }

  export interface Stat {
    value: string; // honest facts only; [] → hide section
    label: string;
  }
  ```

- [ ] Type-check:

  ```bash
  cd "$REPO" && npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] Commit:

  ```bash
  git -C "$REPO" add content/types.ts
  git -C "$REPO" commit -m "feat: content/types.ts — Appendix A data contracts (single source)"
  ```

---

### Task 9: `content/site.ts` — full `SiteConfig` (NAP + geo + glofox + mapbox + promo + priceRange)

Single-source NAP (§6.1). Imports `SiteConfig`/`DayRange` from `@/content/types` (Task 8) — does NOT redefine them. Uses brief values; production-indexing gate handled in slice-A2 JSON-LD. Facebook present in config but consumers omit it from `sameAs` until confirmed (§8). `siteUrl` reads `NEXT_PUBLIC_SITE_URL` with a safe localhost fallback for dev.

Files:
- Create: `content/site.ts`

Steps:
- [ ] Write `content/site.ts` (imports the contract; this module is the data, not the type):

  ```ts
  // content/site.ts — single source of truth for NAP, integrations, promo (spec §6.1, Appendix A)
  import type { SiteConfig } from "@/content/types";

  const GLOFOX_BRANCH = process.env.NEXT_PUBLIC_GLOFOX_BRANCH_ID ?? "65d38d833aabb0e6490203b0";

  export const site: SiteConfig = {
    name: "Peaches Fitness Club",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    nap: {
      street: "2801 Eubank Blvd NE",
      suite: "Suite P",
      city: "Albuquerque",
      state: "NM",
      zip: "87112",
      phone: "(505) 808-9499",
      email: "peachesfitnessclub@gmail.com",
      geo: { lat: 35.115047, lng: -106.536046 },
    },
    hours: {
      operating: [
        { days: "Mon–Fri", open: "5:00 AM", close: "10:00 PM" },
        { days: "Sat–Sun", open: "5:00 AM", close: "8:00 PM" },
      ],
      staffed: [
        { days: "Mon–Fri", open: "8:00 AM", close: "10:00 PM" },
        { days: "Sat–Sun", open: "8:00 AM", close: "8:00 PM" },
      ],
    },
    socials: {
      instagram: "https://www.instagram.com/peachesfitnessclub",
      // facebook intentionally omitted until the exact page URL is confirmed (§8/§13)
    },
    glofox: {
      branchId: GLOFOX_BRANCH,
      membershipsUrl: `https://app.glofox.com/portal/#/branch/${GLOFOX_BRANCH}/memberships`,
      scheduleUrl: `https://app.glofox.com/portal/#/branch/${GLOFOX_BRANCH}/classes-day-view`,
    },
    mapbox: {
      styleUrl: "mapbox://styles/peachesgym/clqea736d005p01of0tvtg9g8",
      zoom: 14,
      pitch: 60,
    },
    promo: {
      enabled: true,
      text: "No sign-up fee — join today.",
    },
    priceRange: "$$",
  };
  ```

- [ ] Type-check the module (no test needed yet — it's consumed by Task 10's TDD):

  ```bash
  cd "$REPO" && npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] Commit:

  ```bash
  git -C "$REPO" add content/site.ts
  git -C "$REPO" commit -m "feat: content/site.ts single-source SiteConfig (NAP/geo/glofox/mapbox/promo)"
  ```

---

### Task 10: `lib/nap.ts` — address string + Google directions URL serialization — TDD

Use `@superpowers:test-driven-development`. NAP must be serialized **entirely from `content/site.ts`** (§6.1, §11) — Suite P and correct ZIP included, never hardcoded. Directions URL = `…/dir/?api=1&destination=` + URL-encoded `${street}${suite ? ', ' + suite : ''}, ${city}, ${state} ${zip}`.

Files:
- Create (test, first): `lib/__tests__/nap.test.ts`
- Create (impl, second): `lib/nap.ts`

Steps:
- [ ] **RED** — write the failing test (asserts the one-line address, the multiline parts, and the exact encoded directions URL):

  ```ts
  // lib/__tests__/nap.test.ts
  import { describe, it, expect } from "vitest";
  import { site } from "@/content/site";
  import { fullAddress, addressLines, directionsUrl, telHref, mailtoHref } from "@/lib/nap";

  describe("nap serialization (single source from content/site.ts)", () => {
    it("fullAddress is one line incl. suite, comma-separated", () => {
      expect(fullAddress(site.nap)).toBe(
        "2801 Eubank Blvd NE, Suite P, Albuquerque, NM 87112",
      );
    });

    it("addressLines splits street/suite and city-state-zip for display", () => {
      expect(addressLines(site.nap)).toEqual([
        "2801 Eubank Blvd NE, Suite P",
        "Albuquerque, NM 87112",
      ]);
    });

    it("directionsUrl encodes the full address into a Google Maps dir link", () => {
      const url = directionsUrl(site.nap);
      expect(url).toBe(
        "https://www.google.com/maps/dir/?api=1&destination=" +
          encodeURIComponent("2801 Eubank Blvd NE, Suite P, Albuquerque, NM 87112"),
      );
      expect(decodeURIComponent(url)).toContain("Suite P");
      expect(decodeURIComponent(url)).toContain("87112");
    });

    it("telHref strips formatting to a dialable tel: URI", () => {
      expect(telHref(site.nap.phone)).toBe("tel:+15058089499");
    });

    it("mailtoHref builds a mailto:", () => {
      expect(mailtoHref(site.nap.email)).toBe("mailto:peachesfitnessclub@gmail.com");
    });

    it("omits suite cleanly when absent", () => {
      const noSuite = { ...site.nap, suite: undefined };
      expect(fullAddress(noSuite)).toBe("2801 Eubank Blvd NE, Albuquerque, NM 87112");
    });
  });
  ```

- [ ] **Run RED**:

  ```bash
  cd "$REPO" && npx vitest run lib/__tests__/nap.test.ts
  ```

  Expected: failure — `Cannot find module '@/lib/nap'`.

- [ ] **GREEN** — implement `lib/nap.ts` (typed to the `SiteConfig['nap']` shape from the shared contract; `telHref` assumes US +1 from a 10-digit number):

  ```ts
  // lib/nap.ts — serialize NAP from content/site.ts only (spec §6.1, §11)
  import type { SiteConfig } from "@/content/types";

  type Nap = SiteConfig["nap"];

  /** "2801 Eubank Blvd NE, Suite P, Albuquerque, NM 87112" */
  export function fullAddress(nap: Nap): string {
    const street = nap.suite ? `${nap.street}, ${nap.suite}` : nap.street;
    return `${street}, ${nap.city}, ${nap.state} ${nap.zip}`;
  }

  /** Two display lines: ["2801 Eubank Blvd NE, Suite P", "Albuquerque, NM 87112"]. */
  export function addressLines(nap: Nap): [string, string] {
    const line1 = nap.suite ? `${nap.street}, ${nap.suite}` : nap.street;
    const line2 = `${nap.city}, ${nap.state} ${nap.zip}`;
    return [line1, line2];
  }

  /** Google Maps directions deep-link with the encoded destination. */
  export function directionsUrl(nap: Nap): string {
    return (
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(fullAddress(nap))
    );
  }

  /** tel: URI from a US-formatted phone (assumes +1). */
  export function telHref(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;
    return `tel:${e164}`;
  }

  export function mailtoHref(email: string): string {
    return `mailto:${email}`;
  }
  ```

- [ ] **Run GREEN**:

  ```bash
  cd "$REPO" && npx vitest run lib/__tests__/nap.test.ts
  ```

  Expected: all 6 tests pass.

- [ ] Commit:

  ```bash
  git -C "$REPO" add -A
  git -C "$REPO" commit -m "feat: lib/nap address + directions serialization (TDD, single-source)"
  ```

---

### Task 11: `lib/images.ts` — `ImgRef` helper

Typed helper for the `ImgRef` contract (Appendix A / `content/types.ts`): `{ src, width, height, alt }` with post-resize intrinsic dimensions, used by `next/image` to reserve space (no CLS). Provides an `img()` factory and a `publicSrc()` path helper so content modules stay terse. Re-uses the `ImgRef` type from the shared contract — does not redefine it.

Files:
- Create: `lib/images.ts`

Steps:
- [ ] Write `lib/images.ts`:

  ```ts
  // lib/images.ts — helpers for the ImgRef contract (content/types.ts). Dimensions are the
  // post-resize intrinsic size of the file in public/images/ (≤2400px long edge).
  import type { ImgRef } from "@/content/types";

  export type { ImgRef };

  /** Build a public/images path from a group + filename. */
  export function publicSrc(group: string, file: string): string {
    return `/images/${group}/${file}`;
  }

  /** Terse ImgRef factory for content modules. */
  export function img(params: {
    group: string;
    file: string;
    width: number;
    height: number;
    alt: string;
  }): ImgRef {
    return {
      src: publicSrc(params.group, params.file),
      width: params.width,
      height: params.height,
      alt: params.alt,
    };
  }
  ```

- [ ] Type-check:

  ```bash
  cd "$REPO" && npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] Commit:

  ```bash
  git -C "$REPO" add lib/images.ts
  git -C "$REPO" commit -m "feat: lib/images ImgRef helper for next/image (no-CLS dims)"
  ```

---

### Task 12: Root `app/layout.tsx` shell — fonts (`next/font/google`) wired to `@theme`, `metadataBase`, body classes

Replace the Task-2 stub. Fonts per §5.2 Option B: Pacifico → `--font-display`, Quicksand 400/500/700 → `--font-sans`, Oswald 500/600 → `--font-heading`. The font CSS vars are exposed on `<html>` and mapped into Tailwind `@theme` so `font-sans`/`font-heading`/`font-display` utilities resolve. `<JsonLd>` and `<HashRedirect>` are added in later tasks/chunks (commented placeholders here keep the layout a pure server component).

> `next/font/google` fetches at **build time** (§5.2) — needs network during `next build`/`dev`. That's expected.

Files:
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (add font vars to `@theme`)

Steps:
- [ ] Add the three font CSS vars to the `@theme inline` block in `app/globals.css` (so utilities generate). Insert inside the existing `@theme inline { … }`, after the shadow lines:

  ```css
    --font-display: var(--font-display);
    --font-sans: var(--font-sans);
    --font-heading: var(--font-heading);
  ```

  Also set the default body font in the base `body { … }` rule by appending:

  ```css
    font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
  ```

- [ ] Write the full `app/layout.tsx`:

  ```tsx
  import type { Metadata } from "next";
  import { Pacifico, Quicksand, Oswald } from "next/font/google";
  import { site } from "@/content/site";
  import "./globals.css";

  const display = Pacifico({
    weight: "400",
    subsets: ["latin"],
    display: "swap",
    variable: "--font-display",
  });

  const sans = Quicksand({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
    variable: "--font-sans",
  });

  const heading = Oswald({
    weight: ["500", "600"],
    subsets: ["latin"],
    display: "swap",
    variable: "--font-heading",
  });

  export const metadata: Metadata = {
    metadataBase: new URL(site.siteUrl),
    title: {
      default: "Peaches Fitness Club — Women's Gym in Albuquerque, NM",
      template: "%s · Peaches Fitness Club",
    },
    description:
      "A women-focused fitness club in Albuquerque, NM — weights, cardio, group classes, sauna, cold plunge, recovery, and Kids Care.",
    openGraph: {
      type: "website",
      siteName: site.name,
      url: site.siteUrl,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og.png"],
    },
  };

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html
        lang="en"
        className={`${display.variable} ${sans.variable} ${heading.variable}`}
      >
        <body className="bg-cream text-charcoal font-sans antialiased">
          {/* <JsonLd> LocalBusiness — added in SEO chunk */}
          {/* <HashRedirect /> + <Header /> + <Footer /> — wired in Task 15 */}
          {children}
        </body>
      </html>
    );
  }
  ```

- [ ] Verify fonts load and `metadataBase` is applied (PID-capture; confirm 200 + a font variable class in HTML):

  ```bash
  cd "$REPO" && npm run dev >/tmp/peaches-dev.log 2>&1 & SRV=$!
  for i in $(seq 1 30); do curl -sf -o /dev/null http://localhost:3000 && break; sleep 1; done
  curl -s http://localhost:3000 | grep -o "__variable_[a-z0-9]*" | head -3
  curl -s -o /dev/null -w "status: %{http_code}\n" http://localhost:3000
  kill "$SRV" 2>/dev/null; grep -i "error" /tmp/peaches-dev.log || echo "no errors"
  ```

  Expected: `status: 200`, at least one `__variable_…` class emitted on `<html>` (next/font), `no errors`. (Note: `/og.png` is added in the SEO chunk; its absence here is non-blocking for layout verification.)

- [ ] Commit:

  ```bash
  git -C "$REPO" add app/layout.tsx app/globals.css
  git -C "$REPO" commit -m "feat: root layout shell — next/font (Pacifico/Quicksand/Oswald) + metadataBase"
  ```

---

### Task 13: Shared UI primitives — `Button` (AA-safe recipe), `Container`, `Section`, `Card`

Build-then-verify (visual). All are server components (no interactivity). `Button` encodes the §5.1 decided recipe: primary = `coral-deep` fill + white label, hover → `coral-dark`; secondary = `charcoal` text on `peach`. Renders as `<button>` or, when `href` given, `<a>`.

Files:
- Create: `components/ui/Button.tsx`, `components/ui/Container.tsx`, `components/ui/Section.tsx`, `components/ui/Card.tsx`

Steps:
- [ ] Write `components/ui/Container.tsx` (max-width + responsive gutters; generous whitespace per §5):

  ```tsx
  import type { ReactNode } from "react";

  export function Container({
    children,
    className = "",
    as: As = "div",
  }: {
    children: ReactNode;
    className?: string;
    as?: "div" | "section" | "header" | "footer" | "main" | "nav";
  }) {
    return (
      <As className={`mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8 ${className}`}>
        {children}
      </As>
    );
  }
  ```

- [ ] Write `components/ui/Section.tsx` (vertical rhythm; optional `bg` token + optional `id` anchor):

  ```tsx
  import type { ReactNode } from "react";
  import { Container } from "./Container";

  type Bg = "cream" | "white" | "peach" | "peach-2";

  const bgClass: Record<Bg, string> = {
    cream: "bg-cream",
    white: "bg-white",
    peach: "bg-peach",
    "peach-2": "bg-peach-2",
  };

  export function Section({
    children,
    id,
    bg = "cream",
    className = "",
    containerClassName = "",
  }: {
    children: ReactNode;
    id?: string;
    bg?: Bg;
    className?: string;
    containerClassName?: string;
  }) {
    return (
      <section id={id} className={`${bgClass[bg]} py-16 sm:py-20 lg:py-24 ${className}`}>
        <Container className={containerClassName}>{children}</Container>
      </section>
    );
  }
  ```

- [ ] Write `components/ui/Card.tsx` (soft shadow, gentle radius, white surface per §5 elegance):

  ```tsx
  import type { ReactNode } from "react";

  export function Card({
    children,
    className = "",
    as: As = "div",
  }: {
    children: ReactNode;
    className?: string;
    as?: "div" | "article" | "li";
  }) {
    return (
      <As
        className={`rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8 ${className}`}
      >
        {children}
      </As>
    );
  }
  ```

- [ ] Write `components/ui/Button.tsx` (AA-safe; polymorphic button/link; `primary`/`secondary` variants):

  ```tsx
  import type { ReactNode } from "react";
  import Link from "next/link";

  type Variant = "primary" | "secondary";
  type Size = "md" | "lg";

  const base =
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-sans " +
    "font-medium leading-none transition-colors duration-200 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-deep " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-60";

  const variants: Record<Variant, string> = {
    // §5.1 decided recipe: coral-deep fill + WHITE label (white-on-coral-deep = 5.42, AA pass); hover -> coral-dark
    primary: "bg-coral-deep text-white hover:bg-coral-dark",
    // charcoal text on peach surface (charcoal-on-peach = 10.24, AA pass)
    secondary: "bg-peach text-charcoal hover:bg-peach-2",
  };

  const sizes: Record<Size, string> = {
    md: "px-5 py-3 text-sm",
    lg: "px-7 py-4 text-base",
  };

  type CommonProps = {
    children: ReactNode;
    variant?: Variant;
    size?: Size;
    className?: string;
  };

  type ButtonAsButton = CommonProps & {
    href?: undefined;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    onClick?: never; // server component — no handlers here
  };

  type ButtonAsLink = CommonProps & {
    href: string;
    external?: boolean;
  };

  export function Button(props: ButtonAsButton | ButtonAsLink) {
    const { children, variant = "primary", size = "md", className = "" } = props;
    const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

    if ("href" in props && props.href) {
      if (props.external) {
        return (
          <a href={props.href} target="_blank" rel="noopener noreferrer" className={cls}>
            {children}
          </a>
        );
      }
      return (
        <Link href={props.href} className={cls}>
          {children}
        </Link>
      );
    }

    const { type = "button", disabled } = props as ButtonAsButton;
    return (
      <button type={type} disabled={disabled} className={cls}>
        {children}
      </button>
    );
  }
  ```

- [ ] Verify all four compile and render. Temporarily render them via the Home stub, then revert (PID-capture; no `kill %1`):

  ```bash
  cd "$REPO" && cat > /tmp/uikit-page.tsx <<'TSX'
  import { Button } from "@/components/ui/Button";
  import { Section } from "@/components/ui/Section";
  import { Card } from "@/components/ui/Card";
  export default function Page() {
    return (
      <Section bg="cream">
        <Card><h2 className="font-heading text-2xl text-charcoal">UI kit smoke</h2></Card>
        <Button variant="primary" size="lg">Join now</Button>
        <Button variant="secondary" href="/membership">See plans</Button>
        <Button href="https://app.glofox.com" external>Book on Glofox</Button>
      </Section>
    );
  }
  TSX
  cp "$REPO/app/page.tsx" /tmp/page.bak && cp /tmp/uikit-page.tsx "$REPO/app/page.tsx"
  npm run dev >/tmp/peaches-dev.log 2>&1 & SRV=$!
  for i in $(seq 1 25); do curl -sf -o /dev/null http://localhost:3000 && break; sleep 1; done
  curl -s http://localhost:3000 | grep -o "Join now"
  curl -s http://localhost:3000 | grep -o "bg-coral-deep"
  curl -s -o /dev/null -w "status: %{http_code}\n" http://localhost:3000
  kill "$SRV" 2>/dev/null
  cp /tmp/page.bak "$REPO/app/page.tsx"   # revert stub
  ```

  Expected: prints `Join now`, `bg-coral-deep`, `status: 200`; stub reverted.

- [ ] Commit:

  ```bash
  git -C "$REPO" add components/ui
  git -C "$REPO" commit -m "feat: shared UI primitives — Button (AA recipe), Container, Section, Card"
  ```

---

### Task 14: `components/layout/Footer.tsx` + `NewsletterForm` placeholder

Build-then-verify. Footer is a server component containing NAP (from `lib/nap`), hours, Instagram, Privacy/Terms links, and the `NewsletterForm` (a leaf client placeholder — full POST wiring in the forms chunk). `NewsletterForm` is `'use client'` because it owns input state, but here it only renders the idle UI + a disabled note so the Footer can ship now. The Footer's single `<footer>` landmark wraps a plain `<Container as="div">` (no nested `<footer>`).

Files:
- Create: `components/layout/Footer.tsx`, `components/layout/NewsletterForm.tsx`

Steps:
- [ ] Write `components/layout/NewsletterForm.tsx` (leaf client placeholder; input `name="email"`, honeypot `name="company"` per Appendix A; submit disabled until wired):

  ```tsx
  "use client";

  // Placeholder — POST to /api/contact (formType:'newsletter') is wired in the forms chunk.
  // Field names follow the parity table: email input name="email", honeypot name="company".
  export function NewsletterForm() {
    return (
      <form
        className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
        aria-label="Newsletter signup"
      >
        {/* honeypot — must stay empty; visually hidden */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          placeholder="Your email"
          autoComplete="email"
          className="w-full rounded-[var(--radius-md)] border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-deep"
        />
        <button
          type="submit"
          disabled
          className="rounded-[var(--radius-md)] bg-coral-deep px-5 py-3 text-sm font-medium text-white hover:bg-coral-dark disabled:opacity-60"
        >
          Subscribe
        </button>
      </form>
    );
  }
  ```

- [ ] Write `components/layout/Footer.tsx` (server; pulls NAP/hours from content + lib; the inner grid uses `Container as="div"` so only the outer `<footer>` is the contentinfo landmark):

  ```tsx
  import Link from "next/link";
  import { site } from "@/content/site";
  import { addressLines, directionsUrl, telHref, mailtoHref } from "@/lib/nap";
  import { Container } from "@/components/ui/Container";
  import { NewsletterForm } from "./NewsletterForm";

  export function Footer() {
    const [line1, line2] = addressLines(site.nap);

    return (
      <footer className="bg-charcoal text-cream">
        <Container as="div" className="grid gap-12 py-16 md:grid-cols-3">
          {/* Brand + newsletter */}
          <div className="space-y-4">
            <p className="font-display text-3xl text-peach">Peaches</p>
            <p className="max-w-xs text-sm text-cream/80">
              A women-focused fitness club in {site.nap.city}, {site.nap.state}.
            </p>
            <div className="pt-2">
              <p className="mb-2 text-sm font-medium text-cream">Stay in the loop</p>
              <NewsletterForm />
            </div>
          </div>

          {/* Visit */}
          <div className="space-y-3 text-sm">
            <h2 className="font-heading text-lg uppercase tracking-wide text-peach">Visit</h2>
            <address className="not-italic text-cream/85">
              <a className="hover:text-peach" href={directionsUrl(site.nap)} target="_blank" rel="noopener noreferrer">
                {line1}
                <br />
                {line2}
              </a>
            </address>
            <p>
              <a className="hover:text-peach" href={telHref(site.nap.phone)}>
                {site.nap.phone}
              </a>
            </p>
            <p>
              <a className="hover:text-peach" href={mailtoHref(site.nap.email)}>
                {site.nap.email}
              </a>
            </p>
          </div>

          {/* Hours + links */}
          <div className="space-y-3 text-sm">
            <h2 className="font-heading text-lg uppercase tracking-wide text-peach">Hours</h2>
            <ul className="space-y-1 text-cream/85">
              {site.hours.operating.map((r) => (
                <li key={r.days}>
                  {r.days}: {r.open}–{r.close}
                </li>
              ))}
            </ul>
            <nav className="flex flex-col gap-1 pt-3 text-cream/85" aria-label="Footer">
              <Link className="hover:text-peach" href="/privacy">
                Privacy Policy
              </Link>
              <Link className="hover:text-peach" href="/terms">
                Terms of Service
              </Link>
              <a className="hover:text-peach" href={site.socials.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </nav>
          </div>
        </Container>
        <div className="border-t border-cream/10 py-6 text-center text-xs text-cream/60">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </div>
      </footer>
    );
  }
  ```

- [ ] Verify the Footer server-renders NAP (mount in the Home stub temporarily, check served HTML, revert; PID-capture):

  ```bash
  cd "$REPO" && cat > /tmp/footer-page.tsx <<'TSX'
  import { Footer } from "@/components/layout/Footer";
  export default function Page() { return <main><Footer /></main>; }
  TSX
  cp "$REPO/app/page.tsx" /tmp/page.bak && cp /tmp/footer-page.tsx "$REPO/app/page.tsx"
  npm run dev >/tmp/peaches-dev.log 2>&1 & SRV=$!
  for i in $(seq 1 25); do curl -sf -o /dev/null http://localhost:3000 && break; sleep 1; done
  curl -s http://localhost:3000 | grep -o "Suite P"
  curl -s http://localhost:3000 | grep -o "(505) 808-9499"
  curl -s http://localhost:3000 | grep -o "Privacy Policy"
  curl -s -o /dev/null -w "status: %{http_code}\n" http://localhost:3000
  kill "$SRV" 2>/dev/null
  cp /tmp/page.bak "$REPO/app/page.tsx"
  ```

  Expected: `Suite P`, `(505) 808-9499`, `Privacy Policy`, `status: 200` (proves NAP is server-rendered from the single source); stub reverted.

- [ ] Commit:

  ```bash
  git -C "$REPO" add components/layout/Footer.tsx components/layout/NewsletterForm.tsx
  git -C "$REPO" commit -m "feat: Footer (NAP/hours/links) + NewsletterForm placeholder"
  ```

---

### Task 15: `components/layout/Header.tsx` (sticky/condense + mobile menu, client) + `HashRedirect` leaf client + mount both in layout

Build-then-verify. Header is the one interactive layout shell (`'use client'` per §5.3): sticky, condenses on scroll, mobile menu toggle. `HashRedirect` is a tiny leaf client that maps legacy hash anchors to routes (§4) — the layout itself stays a server component. Mount `<HashRedirect/>`, `<Header/>`, and `<Footer/>` in `app/layout.tsx`.

Files:
- Create: `components/layout/Header.tsx`, `components/layout/HashRedirect.tsx`
- Modify: `app/layout.tsx` (import + render `<Header/>`, `<HashRedirect/>`, `<Footer/>`)

Steps:
- [ ] Write `components/layout/HashRedirect.tsx` (maps `#contact-us-section→/contact`, `#faq→/faq`, `#pre-enrollment-section→/membership`; best-effort, no SEO equity per §4):

  ```tsx
  "use client";

  import { useEffect } from "react";
  import { useRouter } from "next/navigation";

  const MAP: Record<string, string> = {
    "#contact-us-section": "/contact",
    "#faq": "/faq",
    "#pre-enrollment-section": "/membership",
  };

  export function HashRedirect() {
    const router = useRouter();
    useEffect(() => {
      const target = MAP[window.location.hash];
      if (target) {
        router.replace(target);
      }
    }, [router]);
    return null;
  }
  ```

- [ ] Write `components/layout/Header.tsx` (sticky/condense via scroll listener; mobile menu; nav uses the canonical routes):

  ```tsx
  "use client";

  import { useEffect, useState } from "react";
  import Link from "next/link";
  import { Button } from "@/components/ui/Button";
  import { site } from "@/content/site";

  const NAV = [
    { href: "/about", label: "About" },
    { href: "/amenities", label: "Amenities" },
    { href: "/classes", label: "Classes" },
    { href: "/trainers", label: "Trainers" },
    { href: "/membership", label: "Membership" },
    { href: "/contact", label: "Contact" },
  ];

  export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
      <header
        className={`sticky top-0 z-50 w-full border-b border-charcoal/5 bg-cream/90 backdrop-blur transition-all duration-200 ${
          scrolled ? "py-2 shadow-[var(--shadow-soft)]" : "py-4"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-2xl text-coral-deep" aria-label={`${site.name} home`}>
            Peaches
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-sans text-sm font-medium text-charcoal hover:text-coral-deep"
              >
                {item.label}
              </Link>
            ))}
            <Button href={site.glofox.membershipsUrl} external size="md">
              Join
            </Button>
          </nav>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-charcoal md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block h-0.5 w-6 bg-charcoal" />
            <span className="sr-only">Menu</span>
          </button>
        </div>

        {open && (
          <nav
            id="mobile-menu"
            className="border-t border-charcoal/10 bg-cream px-5 py-4 md:hidden"
            aria-label="Mobile"
          >
            <ul className="flex flex-col gap-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-1 font-sans text-base font-medium text-charcoal hover:text-coral-deep"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button href={site.glofox.membershipsUrl} external size="md" className="w-full">
                  Join
                </Button>
              </li>
            </ul>
          </nav>
        )}
      </header>
    );
  }
  ```

- [ ] Wire all three into `app/layout.tsx`. Replace the placeholder comments + bare `{children}` block in the `<body>`:

  ```tsx
        <body className="bg-cream text-charcoal font-sans antialiased">
          {/* <JsonLd> LocalBusiness — added in SEO chunk */}
          <HashRedirect />
          <Header />
          {children}
          <Footer />
        </body>
  ```

  And add the imports at the top of `app/layout.tsx` (below the existing imports):

  ```tsx
  import { Header } from "@/components/layout/Header";
  import { Footer } from "@/components/layout/Footer";
  import { HashRedirect } from "@/components/layout/HashRedirect";
  ```

- [ ] Verify Header renders, layout stays a server component, and Footer is present (PID-capture):

  ```bash
  cd "$REPO" && npm run dev >/tmp/peaches-dev.log 2>&1 & SRV=$!
  for i in $(seq 1 30); do curl -sf -o /dev/null http://localhost:3000 && break; sleep 1; done
  curl -s http://localhost:3000 | grep -o "Primary"
  curl -s http://localhost:3000 | grep -o "All rights reserved"
  curl -s -o /dev/null -w "home status: %{http_code}\n" http://localhost:3000
  kill "$SRV" 2>/dev/null; grep -i "error" /tmp/peaches-dev.log || echo "no errors"
  ```

  Expected: `Primary` (Header nav aria-label), `All rights reserved` (Footer), `home status: 200`, `no errors`. (The `<HashRedirect/>` is JS-only; verify its behavior with a Playwright nav to `/#faq` in slice A2 once `/faq` exists, run via `npm run test:a11y`.)

- [ ] Commit:

  ```bash
  git -C "$REPO" add components/layout/Header.tsx components/layout/HashRedirect.tsx app/layout.tsx
  git -C "$REPO" commit -m "feat: Header (sticky/condense + mobile menu) + HashRedirect; mount in layout"
  ```

---

### Task 16: Legal pages `app/privacy` + `app/terms` (boilerplate)

Build-then-verify. Boilerplate per §12/§13 (owner supplies real copy later; non-blocking). Server components with proper metadata and one `<h1>` each (§8 semantic HTML). `Section`/`Container` for rhythm. Prose is styled with explicit utilities (no undefined `prose-peaches` class — there's no `@tailwindcss/typography` plugin in this stack).

Files:
- Create: `app/privacy/page.tsx`, `app/terms/page.tsx`

Steps:
- [ ] Write `app/privacy/page.tsx`:

  ```tsx
  import type { Metadata } from "next";
  import { Section } from "@/components/ui/Section";
  import { site } from "@/content/site";
  import { mailtoHref } from "@/lib/nap";

  export const metadata: Metadata = {
    title: "Privacy Policy",
    description: `Privacy policy for ${site.name}.`,
  };

  export default function PrivacyPage() {
    return (
      <main>
        <Section bg="white">
          <article className="mx-auto max-w-2xl">
            <h1 className="font-heading text-3xl text-charcoal sm:text-4xl">Privacy Policy</h1>
            <p className="mt-6 text-charcoal/80">
              {site.name} respects your privacy. This page describes how we collect and use
              information submitted through our website forms (contact, careers, and newsletter
              signup). We use the information solely to respond to your inquiry and do not sell it.
            </p>
            <p className="mt-4 text-charcoal/80">
              Form submissions are delivered by email to our staff. We retain them only as needed to
              respond. For questions about your data, contact us at{" "}
              <a className="text-coral-deep underline" href={mailtoHref(site.nap.email)}>
                {site.nap.email}
              </a>
              .
            </p>
            <p className="mt-4 text-sm text-charcoal/60">
              {/* TODO: owner to supply finalized privacy copy before launch (§13 item 8). */}
              This is placeholder boilerplate pending owner-supplied policy text.
            </p>
          </article>
        </Section>
      </main>
    );
  }
  ```

- [ ] Write `app/terms/page.tsx`:

  ```tsx
  import type { Metadata } from "next";
  import { Section } from "@/components/ui/Section";
  import { site } from "@/content/site";

  export const metadata: Metadata = {
    title: "Terms of Service",
    description: `Terms of service for ${site.name}.`,
  };

  export default function TermsPage() {
    return (
      <main>
        <Section bg="white">
          <article className="mx-auto max-w-2xl">
            <h1 className="font-heading text-3xl text-charcoal sm:text-4xl">Terms of Service</h1>
            <p className="mt-6 text-charcoal/80">
              By using the {site.name} website you agree to these terms. Membership, class booking,
              and payments are handled through our booking provider; their terms apply to those
              transactions. Information on this site is provided for general purposes and may change.
            </p>
            <p className="mt-4 text-charcoal/80">
              We make no warranties regarding the accuracy of pricing or schedule content shown here;
              please confirm current details with our staff.
            </p>
            <p className="mt-4 text-sm text-charcoal/60">
              {/* TODO: owner to supply finalized terms copy before launch (§13 item 8). */}
              This is placeholder boilerplate pending owner-supplied terms text.
            </p>
          </article>
        </Section>
      </main>
    );
  }
  ```

- [ ] Verify both server-render their `<h1>` (PID-capture):

  ```bash
  cd "$REPO" && npm run dev >/tmp/peaches-dev.log 2>&1 & SRV=$!
  for i in $(seq 1 30); do curl -sf -o /dev/null http://localhost:3000 && break; sleep 1; done
  curl -s http://localhost:3000/privacy | grep -o "Privacy Policy" | head -1
  curl -s -o /dev/null -w "privacy: %{http_code}\n" http://localhost:3000/privacy
  curl -s http://localhost:3000/terms | grep -o "Terms of Service" | head -1
  curl -s -o /dev/null -w "terms: %{http_code}\n" http://localhost:3000/terms
  kill "$SRV" 2>/dev/null
  ```

  Expected: `Privacy Policy`, `privacy: 200`, `Terms of Service`, `terms: 200`.

- [ ] Commit:

  ```bash
  git -C "$REPO" add app/privacy app/terms
  git -C "$REPO" commit -m "feat: privacy + terms boilerplate pages"
  ```

---

### Task 17: `app/not-found.tsx` (correct 404 status) + `app/error.tsx` (recoverable error boundary)

Build-then-verify. Per §4 + Appendix B: on-brand 404 with nav back to key pages (Next returns the correct 404 status for `not-found.tsx`), and a root recoverable error boundary with retry (`error.tsx` must be `'use client'`).

Files:
- Create: `app/not-found.tsx`, `app/error.tsx`

Steps:
- [ ] Write `app/not-found.tsx` (server; on-brand; nav back to Home/Membership/Contact):

  ```tsx
  import { Section } from "@/components/ui/Section";
  import { Button } from "@/components/ui/Button";

  export default function NotFound() {
    return (
      <main>
        <Section bg="cream">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-display text-5xl text-coral-deep">Oops</p>
            <h1 className="mt-4 font-heading text-3xl text-charcoal sm:text-4xl">
              Page not found
            </h1>
            <p className="mt-4 text-charcoal/80">
              The page you’re looking for moved or never existed. Let’s get you back on track.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/" variant="primary">
                Back home
              </Button>
              <Button href="/membership" variant="secondary">
                Membership
              </Button>
              <Button href="/contact" variant="secondary">
                Contact us
              </Button>
            </div>
          </div>
        </Section>
      </main>
    );
  }
  ```

- [ ] Write `app/error.tsx` (must be a client component; recoverable with `reset()`):

  ```tsx
  "use client";

  import { useEffect } from "react";
  import { Section } from "@/components/ui/Section";

  export default function Error({
    error,
    reset,
  }: {
    error: Error & { digest?: string };
    reset: () => void;
  }) {
    useEffect(() => {
      // Surface for debugging; no PII expected here.
      console.error(error);
    }, [error]);

    return (
      <main>
        <Section bg="cream">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-display text-5xl text-coral-deep">Hmm</p>
            <h1 className="mt-4 font-heading text-3xl text-charcoal sm:text-4xl">
              Something went wrong
            </h1>
            <p className="mt-4 text-charcoal/80">
              An unexpected error occurred. You can try again, or head back home.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-coral-deep px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-coral-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-deep focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-peach px-5 py-3 text-sm font-medium text-charcoal hover:bg-peach-2"
              >
                Back home
              </a>
            </div>
          </div>
        </Section>
      </main>
    );
  }
  ```

- [ ] Verify the 404 returns HTTP 404 with on-brand content (PID-capture):

  ```bash
  cd "$REPO" && npm run dev >/tmp/peaches-dev.log 2>&1 & SRV=$!
  for i in $(seq 1 30); do curl -sf -o /dev/null http://localhost:3000 && break; sleep 1; done
  curl -s -o /dev/null -w "missing route status: %{http_code}\n" http://localhost:3000/this-does-not-exist
  curl -s http://localhost:3000/this-does-not-exist | grep -o "Page not found"
  kill "$SRV" 2>/dev/null
  ```

  Expected: `missing route status: 404` and `Page not found`. (The error boundary is exercised in the slice-D verify pass; it can't be triggered by a plain GET.)

- [ ] Commit:

  ```bash
  git -C "$REPO" add app/not-found.tsx app/error.tsx
  git -C "$REPO" commit -m "feat: on-brand 404 (not-found) + recoverable root error boundary"
  ```

---

### Task 18: Foundation gate — full test + typecheck + production build

Closing verification for the chunk: the Vitest gate (contrast + nap) passes, TypeScript is clean, and a production build succeeds with the layout shell, legal pages, and 404 wired. This is the handoff state for slice A2.

Files:
- (none — verification only)

Steps:
- [ ] Run the full Vitest suite (contrast gate + nap):

  ```bash
  cd "$REPO" && npm test
  ```

  Expected: 2 test files pass — `lib/__tests__/contrast.test.ts` and `lib/__tests__/nap.test.ts`; all assertions green.

- [ ] Type-check the whole project:

  ```bash
  cd "$REPO" && npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] Lint:

  ```bash
  cd "$REPO" && npm run lint
  ```

  Expected: no ESLint **errors** and no rule **warnings**. An ESLint-9 config-deprecation notice from `next lint` shimming the legacy `.eslintrc.json` is acceptable (see Task 2 note); only actual lint rule violations block this step.

- [ ] Production build (proves fonts fetch at build, tokens compile, all routes render):

  ```bash
  cd "$REPO" && npm run build
  ```

  Expected: `✓ Compiled successfully`; route list includes `/`, `/privacy`, `/terms`, and `/_not-found`; the 3 redirects appear; no type/lint failures.

- [ ] Commit any incidental config touch-ups produced by the build (e.g. `next-env.d.ts` — though gitignored). If nothing changed, skip. Otherwise:

  ```bash
  git -C "$REPO" add -A && git -C "$REPO" commit -m "chore: foundation gate — tests, typecheck, and prod build green" || echo "nothing to commit"
  ```

---

**Chunk 1 done.** Handoff state for slice A2: Next 15 root app scaffolded on `rebuild/nextjs`; CRA archived to `legacy/`; `.env` untracked + gitignored (token rotation still a launch-gate item); all rebuild deps pinned once in `package.json` (incl. `mapbox-gl`, `zod@^3`, `resend`, `@upstash/*`, `framer-motion`, `lenis`); design tokens + AA-safe contrast gate (passing, real WCAG ratios); Pacifico/Quicksand/Oswald wired via `next/font` + `@theme`; `next.config.ts` redirects + images; `.env.example`; `content/types.ts` (Appendix A contracts — imported by all later content modules); `content/site.ts` single-source NAP with `lib/nap` (TDD-passing) + `lib/images` ImgRef helper; resized assets in `public/images/<group>/` (Task 11 below in the asset section of slice A1 if not yet executed — see note); root layout shell with Header (sticky/condense + mobile menu) + Footer (NAP/hours/Privacy-Terms/NewsletterForm placeholder, single `<footer>` landmark) + HashRedirect; privacy/terms boilerplate (no dead `prose-peaches` class); on-brand 404 + recoverable error boundary. Shared UI primitives (`Button`/`Container`/`Section`/`Card`) ready for pages. Open items inherited by later chunks: `/og.png` (SEO chunk), `<JsonLd>` mount (SEO chunk), NewsletterForm + all-forms POST wiring (forms chunk), Mapbox token rotation + Upstash prod config (launch gate §13).

---

### Task 19 (asset migration): Resize live assets → `public/images/<group>/` (≤2400px long edge)

> Note: this asset-migration task is part of slice A1 (spec §14 step 2). Run it any time after Task 2 (scaffold). Resize the authoritative `migration/live-assets/clean/` photos to ≤2400px long edge into `public/images/<group>/` per Appendix C, using `sips` (built into macOS, confirmed at `/usr/bin/sips`). Brand/marker assets that are already small are copied as-is. Excluded: Shelbie assets. Dropped: `thankyou.png`. Decorative heading PNGs/WEBPs are **not** copied (re-implemented as semantic HTML headings in slice A2).

Files:
- Create (script): `migration/resize-assets.sh`
- Create (output, generated): `public/images/{gym,bootybuilder,classes,plunge,sauna,peachybar,lounge,kids,trainers,brand}/*`

Steps:
- [ ] Write the resize script `migration/resize-assets.sh` (idempotent; resizes photos with `sips -Z 2400`, copies small brand assets unchanged; skips excluded/dropped/decorative files):

  ```bash
  #!/usr/bin/env bash
  # Resize live assets to <=2400px long edge into public/images/<group>/ (spec §7, Appendix C).
  # Idempotent: safe to re-run. Requires macOS `sips`.
  set -euo pipefail

  SRC="$(cd "$(dirname "$0")/live-assets/clean" && pwd)"
  ROOT="$(cd "$(dirname "$0")/.." && pwd)"
  OUT="$ROOT/public/images"
  MAX=2400

  copy_resized() { # group file
    local group="$1" file="$2"
    mkdir -p "$OUT/$group"
    cp "$SRC/$file" "$OUT/$group/$file"
    sips -Z "$MAX" "$OUT/$group/$file" >/dev/null
    echo "resized  $group/$file"
  }
  copy_asis() { # group file
    local group="$1" file="$2"
    mkdir -p "$OUT/$group"
    cp "$SRC/$file" "$OUT/$group/$file"
    echo "copied   $group/$file"
  }

  # --- photos (resize) ---
  for f in Gym1 Gym2 Gym3 Gym4 Gym5 Gym6 Gym7; do copy_resized gym "$f.webp"; done
  for f in Bootybuilder1 Bootybuilder2 Bootybuilder3 Bootybuilder4 Bootybuilder5 Bootybuilder6; do copy_resized bootybuilder "$f.webp"; done
  for f in Classes1 Classes2 Classes3; do copy_resized classes "$f.webp"; done
  for f in Plunge1 Plunge2 Plunge3 Plunge4; do copy_resized plunge "$f.webp"; done
  for f in Sauna1 Sauna2; do copy_resized sauna "$f.webp"; done
  for f in Peachybar1 Peachybar2; do copy_resized peachybar "$f.webp"; done
  copy_resized lounge "PeachesLounge.webp"
  for f in kidsclub1 kidsclub2 kidsclub3 kidsclub4 kidsclub5; do copy_resized kids "$f.webp"; done
  copy_resized trainers "kira.webp"
  copy_asis  trainers "kiraheading.webp"            # 800x400 — already small

  # --- brand (mainbackground is a full photo -> resize; rest are small -> as-is) ---
  copy_resized brand "mainbackground.webp"          # 7008x4672 hero/section bg
  for f in MAINLOGO.png logo.png logo3.png peachasset.png; do copy_asis brand "$f"; done

  echo "DONE. Excluded: shelbie*. Dropped: thankyou.png. Decorative headings re-implemented as HTML."
  ```

- [ ] Make executable and run:

  ```bash
  chmod +x "$REPO/migration/resize-assets.sh" && "$REPO/migration/resize-assets.sh"
  ```

  Expected: a line per file (`resized …` / `copied …`) ending with the `DONE.` summary; no errors.

- [ ] Verify counts and that no photo exceeds 2400px long edge:

  ```bash
  echo "file count:" && find "$REPO/public/images" -type f | wc -l
  echo "largest dimension across resized photos:"
  for f in $(find "$REPO/public/images" -name '*.webp'); do
    sips -g pixelWidth -g pixelHeight "$f" | awk '/pixel/{print $2}'
  done | sort -nr | head -1
  ```

  Expected: **file count `37`** (per-group breakdown: gym 7 + bootybuilder 6 + classes 3 + plunge 4 + sauna 2 + peachybar 2 + lounge 1 + kids 5 + trainers 2 [kira + kiraheading] + brand 5 [mainbackground + MAINLOGO + logo + logo3 + peachasset] = 37); largest webp dimension `≤ 2400`. The two load-bearing assertions are (a) every `.webp` photo's long edge ≤ 2400 and (b) all 10 group dirs exist.

- [ ] Verify the 10 group dirs exist:

  ```bash
  ls "$REPO/public/images"
  ```

  Expected: `bootybuilder  brand  classes  gym  kids  lounge  peachybar  plunge  sauna  trainers`.

- [ ] Confirm excluded/dropped files are absent:

  ```bash
  ! find "$REPO/public/images" \( -name 'shelbie*' -o -name 'thankyou.png' \) | grep . && echo "OK: shelbie/thankyou excluded"
  ```

  Expected: `OK: shelbie/thankyou excluded`.

- [ ] Commit (the resized images go into git so Vercel builds without the raw downloads):

  ```bash
  git -C "$REPO" add migration/resize-assets.sh public/images
  git -C "$REPO" commit -m "feat: migrate + resize live assets to public/images (<=2400px, 37 files)"
  ```

---

## Chunk 2: Content modules, sections, all pages, SEO (metadata, JSON-LD, sitemap/robots, OG)

> Prerequisites from Chunk 1 (assumed present): the Next.js 15 app is scaffolded at repo root with TS strict + Tailwind v4 (CSS-first); `app/layout.tsx` (with `metadataBase`, fonts, `HashRedirect`), `app/globals.css` (tokens + `@theme`), fonts (`--font-display`/`--font-sans`/`--font-heading`); **`content/types.ts`** (the spec Appendix A interfaces: `ImgRef`, `Amenity`, `Trainer`, `ClassType`, `Plan`, `DayPass`, `KidsCare`, `FaqItem`, `ConductRule`, `Stat`, `SiteConfig`, `DayRange` — created in Chunk 1 BEFORE `content/site.ts`; this chunk imports from `@/content/types`, never redefines); `content/site.ts` with `nap` (incl. `geo`), `hours`, `socials`, `glofox`, `mapbox`, `promo`, `priceRange`, `siteUrl`; `lib/nap.ts` exporting `formatFullAddress(nap)`, `formatStreetWithSuite(nap)`, `directionsUrl(nap)`, **and `schemaDayOfWeek(daysRange)`** (maps a human range like `"Monday–Friday"` to an array of schema.org `DayOfWeek` names — see note in Task 7); `lib/images.ts` (next/image helpers / blur); shared UI primitives `components/ui/{Button,Container,Section,Card,Modal}.tsx` — **Modal prop contract (pinned, Appendix B): `{ onClose: () => void; titleId: string; children: ReactNode }`, focus-trapping, closes on Esc/backdrop**; `components/layout/{Header,Footer,NewsletterForm,HashRedirect}.tsx`; assets resized into `public/images/<group>/` (the 56 manifest assets), **plus `public/images/trainers/placeholder-trainer.webp` — a brand-neutral silhouette created in Chunk 1's asset step (spec §6.3 "neutral placeholder image"); without it, `/trainers` 404s on Katie's card**; `app/{privacy,terms}/page.tsx`, `app/not-found.tsx`, `app/error.tsx` exist. Vitest + `@playwright/test` configured (`playwright.config.ts` has `baseURL: http://localhost:3000` + a `webServer` block, so specs need no manual server). This chunk covers Build-Order steps 4–6 (slice A2): content modules, SEO libs, sections, and all pages. Sections built here are pure server components ready for the animation slice (Chunk 5, step 5); no animation/Lighthouse work here.

Use @superpowers:test-driven-development for the lib/content-validation tasks and the `@playwright/test` a11y spec (run via `npm run test:a11y`) for server-rendered HTML/axe verification.

> Size note: this chunk is large (Build-Order steps 4–6 are tightly coupled — content feeds JSON-LD which feeds pages). It is internally cohesive but if a smaller reviewable slice is preferred, split at Task 11/12: **2a** = content modules + SEO libs + leaf UI components (Tasks 1–9), **2b** = sections + all pages + layout OG/JSON-LD wiring + a11y pass (Tasks 10–18). Tasks below are ordered to allow that cut.

---

### Task 1: `lib/seo.ts` — per-route metadata helper (TDD)

Single source for building `Metadata` so every route gets a unique title/description/canonical while inheriting the static OG/Twitter image from the root layout (spec §8: "child routes spread/inherit, don't fully replace").

**Files**
- Create: `lib/seo.ts`
- Create (test): `lib/__tests__/seo.test.ts`

Steps:

- [ ] Write the failing test.

```ts
// lib/__tests__/seo.test.ts
import { describe, it, expect } from 'vitest';
import { pageMetadata } from '../seo';

describe('pageMetadata', () => {
  it('builds a unique title + description + canonical path', () => {
    const m = pageMetadata({
      title: 'Classes',
      description: 'Group fitness classes at a women-focused gym in Albuquerque.',
      path: '/classes',
    });
    expect(m.title).toBe('Classes | Peaches Fitness Club');
    expect(m.description).toBe(
      'Group fitness classes at a women-focused gym in Albuquerque.',
    );
    expect(m.alternates?.canonical).toBe('/classes');
  });

  it('sets canonical to "/" for the home path', () => {
    const m = pageMetadata({ title: 'Home', description: 'x', path: '/' });
    expect(m.alternates?.canonical).toBe('/');
    // home title is the bare brand, not "Home | …"
    expect(m.title).toBe('Peaches Fitness Club');
  });

  it('puts a per-route openGraph title/description without overwriting images', () => {
    const m = pageMetadata({ title: 'About', description: 'Our story', path: '/about' });
    expect(m.openGraph?.title).toBe('About | Peaches Fitness Club');
    expect(m.openGraph?.description).toBe('Our story');
    // images intentionally NOT set here → inherited from root layout default
    expect((m.openGraph as Record<string, unknown>)?.images).toBeUndefined();
  });
});
```

- [ ] Run (expect FAIL): `npx vitest run lib/__tests__/seo.test.ts`
  Expected: `Cannot find module '../seo'` (or `pageMetadata is not a function`).

- [ ] Implement.

```ts
// lib/seo.ts
import type { Metadata } from 'next';

const BRAND = 'Peaches Fitness Club';

export interface PageMeta {
  title: string;
  description: string;
  /** Canonical path, e.g. '/classes' or '/' */
  path: string;
}

/**
 * Build per-route Metadata. Title/description/canonical are unique per page.
 * OG/Twitter IMAGES are intentionally omitted so child routes inherit the
 * static default declared in the root layout (spec §8). metadataBase (set in
 * the root layout) resolves the canonical + image URLs to absolute.
 */
export function pageMetadata({ title, description, path }: PageMeta): Metadata {
  const fullTitle = path === '/' ? BRAND : `${title} | ${BRAND}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      type: 'website',
    },
    twitter: {
      title: fullTitle,
      description,
    },
  };
}
```

- [ ] Run (expect PASS): `npx vitest run lib/__tests__/seo.test.ts`
  Expected: `Test Files 1 passed`, `Tests 3 passed`.

- [ ] Commit: `feat(seo): add pageMetadata helper for per-route metadata (TDD)`

---

### Task 2: Content — `content/amenities.ts` (real ported names; on-brand descriptions)

Spec §6.2 amenities list (names ported verbatim from the live site; descriptions are on-brand 1–2 sentences each — the live site has no per-amenity descriptions, so these are newly written, not invented facts). Typed `Amenity[]` (Appendix A, in `content/types.ts`). Photo groups from Appendix C.

**Files**
- Create: `content/amenities.ts`

- [ ] Implement.

```ts
// content/amenities.ts
import type { Amenity } from './types';

export const amenities: Amenity[] = [
  {
    slug: 'weight-room',
    name: 'Weight Room',
    description:
      'A full free-weight and strength-training floor with dumbbells, barbells, racks, and benches — room to train heavy without waiting in line.',
    images: [
      { src: '/images/gym/Gym1.webp', width: 2400, height: 1600, alt: 'Free-weight area in the weight room' },
    ],
  },
  {
    slug: 'cardio',
    name: 'Cardio Room',
    description:
      'Treadmills, bikes, stair climbers, and ellipticals for steady-state or interval work, all facing natural light.',
    images: [
      { src: '/images/gym/Gym2.webp', width: 2400, height: 1600, alt: 'Cardio machines on the gym floor' },
    ],
  },
  {
    slug: 'turf',
    name: 'Turf Area',
    description:
      'Open turf for sled pushes, mobility, plyometrics, and functional training with space to move freely.',
    images: [
      { src: '/images/gym/Gym3.webp', width: 2400, height: 1600, alt: 'Turf and functional training area' },
    ],
  },
  {
    slug: 'booty-builder',
    name: 'Booty Builder® Equipment',
    description:
      'Dedicated Booty Builder® machines engineered for glute and lower-body development — a signature part of the Peaches floor.',
    images: [
      { src: '/images/bootybuilder/Bootybuilder1.webp', width: 1600, height: 2400, alt: 'Booty Builder glute training equipment' },
    ],
  },
  {
    slug: 'classes',
    name: 'Group Classes',
    description:
      'Yoga, Pilates, Zumba, and strength classes led by our instructors in a dedicated studio space.',
    images: [
      { src: '/images/classes/Classes1.webp', width: 2400, height: 1600, alt: 'Group class in the studio' },
    ],
  },
  {
    slug: 'sauna',
    name: 'Sauna',
    description:
      'Unwind and recover in our sauna after a session — heat therapy to help you relax and reset.',
    images: [
      { src: '/images/sauna/Sauna1.webp', width: 2400, height: 1600, alt: 'Sauna at Peaches Fitness Club' },
    ],
  },
  {
    slug: 'cold-plunge',
    name: 'Cold Plunge',
    description:
      'A cold plunge for contrast therapy and recovery — pair it with the sauna to round out your routine.',
    images: [
      { src: '/images/plunge/Plunge1.webp', width: 2400, height: 1600, alt: 'Cold plunge recovery pool' },
    ],
  },
  {
    slug: 'recovery',
    name: 'Recovery Area',
    description:
      'A space to stretch, foam-roll, and let your body recover between training days.',
    images: [
      { src: '/images/plunge/Plunge2.webp', width: 2400, height: 1600, alt: 'Recovery area' },
    ],
  },
  {
    slug: 'private-changing-rooms',
    name: 'Private Changing Rooms',
    description:
      'Private, comfortable changing rooms designed with our members in mind.',
    images: [],
  },
  {
    slug: 'secure-lockers',
    name: 'Secure Lockers',
    description:
      'Keep your belongings safe with secure lockers while you train.',
    images: [],
  },
  {
    slug: 'members-lounge',
    name: 'Members Lounge',
    description:
      'A relaxed lounge to cool down, catch up, or get a little work done before or after your workout.',
    images: [
      { src: '/images/lounge/PeachesLounge.webp', width: 2400, height: 1600, alt: 'Members lounge seating area' },
    ],
  },
  {
    slug: 'peachy-bar',
    name: 'Peachy Bar',
    description:
      'Refuel at the Peachy Bar with juices, smoothies, and snacks to fuel your day.',
    images: [
      { src: '/images/peachybar/Peachybar1.webp', width: 2400, height: 1600, alt: 'The Peachy Bar' },
    ],
  },
];
```

> Note: `content/types.ts` (Chunk 1 deliverable) holds the Appendix A interfaces. Image `width`/`height` are post-resize values (≤2400 long edge); Chunk 1's resize step provides exact intrinsics — replace if they differ. Keeping correct intrinsics prevents CLS (spec §7). This list is exactly 12 amenities (names verbatim from the live site, §6.2) — the stats module (Task 5) reflects that count honestly.

- [ ] Commit: `feat(content): add amenities content module with descriptions`

---

### Task 3: Content — `content/trainers.ts` (Kira verbatim bio; Katie placeholder)

Spec §6.3: Kira real assets + ported bio/specializations/certifications (verbatim from the live site); Katie `placeholder: true`, neutral image, ported "Bio coming soon" line, `// TODO`. No fabricated credentials.

**Files**
- Create: `content/trainers.ts`

- [ ] Implement (Kira bio + specializations + certification ported verbatim; Katie placeholder).

```ts
// content/trainers.ts
import type { Trainer } from './types';

export const trainers: Trainer[] = [
  {
    slug: 'kira',
    name: 'Kira',
    photo: { src: '/images/trainers/kira.webp', width: 1080, height: 1920, alt: 'Kira, personal trainer at Peaches Fitness Club' },
    headingImg: { src: '/images/trainers/kiraheading.webp', width: 800, height: 400, alt: '' },
    // Bio ported verbatim from the live site (src/Trainers).
    bio: [
      "Hi, I'm Kira! I'm a NASM certified personal trainer who loves helping women build their confidence inside and outside of the gym. Specializing in strength training and empowering women to break past their limits, I'm passionate about helping clients reach their fitness goals and build lasting, healthy habits for their future selves. With a focus on individualized coaching, I'm committed to providing a supportive, results-driven experience that's tailored to each woman's journey.",
    ],
    specializations: [
      'Strength training with a focus on empowerment and pushing past personal limits',
      'Helping women break barriers and unlock their full potential',
      'Encouraging the creation of long-term, sustainable health and fitness habits',
      'Personalized training programs that prioritize individual goals and progress',
      'Building confidence inside and outside the gym',
    ],
    certifications: ['NASM Certified Personal Trainer'],
  },
  {
    slug: 'katie',
    name: 'Katie',
    // TODO: owner to provide Katie's real headshot + bio + specializations. No fabricated credentials.
    placeholder: true,
    photo: { src: '/images/trainers/placeholder-trainer.webp', width: 1080, height: 1920, alt: 'Katie, trainer at Peaches Fitness Club' },
    bio: [
      'Bio coming soon — Katie is one of our newest trainers. Check back soon to learn more about her approach and specialties.',
    ],
    specializations: [],
    certifications: [],
  },
];
```

> `placeholder-trainer.webp` is the brand-neutral silhouette added in Chunk 1's asset step (a concrete, named prerequisite — see preamble). If the `Trainer` interface in `content/types.ts` does not include `headingImg` / `certifications`, either align the interface in Chunk 1 or drop those fields here; do not invent certifications for Katie.

- [ ] Commit: `feat(content): add trainers (Kira verbatim bio + Katie placeholder)`

---

### Task 4: Content — `content/classes.ts`, `content/plans.ts`, `content/dayPasses.ts`, `content/kidsCare.ts`

Class types are server-rendered independent of Glofox (spec §8). Plans use `price: null` → "Contact for pricing". Day passes are **Standard $15 (gym-only)** and **Premium $25 (gym + sauna + cold plunge + classes)** — ported verbatim from the live `DayPasses` (do NOT mislabel as week passes or add inclusions). Kids Care intro ported verbatim; $15/mo + $5 addl.

**Files**
- Create: `content/classes.ts`
- Create: `content/plans.ts`
- Create: `content/dayPasses.ts`
- Create: `content/kidsCare.ts`

- [ ] Implement `content/classes.ts`.

```ts
// content/classes.ts
import type { ClassType } from './types';

export const classes: ClassType[] = [
  {
    slug: 'yoga',
    name: 'Yoga',
    description:
      'Flow through breath-led movement to build flexibility, balance, and a calmer mind. Suitable for all levels.',
    image: { src: '/images/classes/Classes1.webp', width: 2400, height: 1600, alt: 'Yoga class in session' },
  },
  {
    slug: 'pilates',
    name: 'Pilates',
    description:
      'Low-impact, core-focused training that builds controlled strength, posture, and stability.',
    image: { src: '/images/classes/Classes2.webp', width: 2400, height: 1600, alt: 'Pilates class in session' },
  },
  {
    slug: 'zumba',
    name: 'Zumba',
    description:
      'A high-energy dance workout set to great music — cardio that feels like a party.',
    image: { src: '/images/classes/Classes3.webp', width: 2400, height: 1600, alt: 'Zumba dance class' },
  },
  {
    slug: 'strength',
    name: 'Strength Training',
    description:
      'Coached strength sessions to help you lift with confidence and build real, lasting power.',
    image: { src: '/images/gym/Gym4.webp', width: 2400, height: 1600, alt: 'Strength class on the gym floor' },
  },
];
```

- [ ] Implement `content/plans.ts` (pricing placeholder; `null` → "Contact for pricing"). The live site does not publish plan prices, so prices stay `null` (spec §6.2 — "Contact for pricing"); the three tiers (monthly/quarterly/annual) are ported from FAQ #5.

```ts
// content/plans.ts
import type { Plan } from './types';

export const plans: Plan[] = [
  {
    slug: 'monthly',
    tier: 'Monthly',
    price: null, // null → "Contact for pricing"
    cadence: 'monthly',
    features: [
      'Full gym access',
      'Group classes included',
      'Sauna & cold plunge',
      'Members lounge',
      'No long-term commitment',
    ],
  },
  {
    slug: 'quarterly',
    tier: 'Quarterly',
    price: null,
    cadence: 'quarterly',
    features: [
      'Everything in Monthly',
      'Better per-month value',
      'Sauna & cold plunge',
      'Members lounge',
    ],
    highlighted: true,
  },
  {
    slug: 'annual',
    tier: 'Annual',
    price: null,
    cadence: 'annual',
    features: [
      'Everything in Quarterly',
      'Best overall value',
      'Priority on class sign-ups',
      'Members lounge',
    ],
  },
];

/** Display helper — Plan.price is null until owner confirms pricing. */
export function planPriceLabel(price?: string | null): string {
  return price ?? 'Contact for pricing';
}
```

- [ ] Implement `content/dayPasses.ts` (ported verbatim from live `DayPasses`: Standard $15 = gym-only; Premium $25 = gym + sauna + cold plunge + classes).

```ts
// content/dayPasses.ts
import type { DayPass } from './types';

// Ported verbatim from the live site. Do NOT add inclusions to the Standard pass
// or relabel the Premium pass as a "week pass".
export const dayPasses: DayPass[] = [
  {
    name: 'Standard Day Pass',
    price: '$15',
    includes: ['24 Hour Unlimited Gym Use'],
  },
  {
    name: 'Premium Day Pass',
    price: '$25',
    includes: ['24 Hour Unlimited Gym Use', 'Sauna', 'Cold Plunge', 'Classes'],
  },
];
```

- [ ] Implement `content/kidsCare.ts` (intro ported verbatim from the live site).

```ts
// content/kidsCare.ts
import type { KidsCare } from './types';

export const kidsCare: KidsCare = {
  // Intro ported verbatim from the live site.
  intro:
    'Embrace your fitness journey with confidence while we take care of your little ones. For only $15 a month, and $5 for each additional child, delight in the freedom to work out, knowing your kids are enjoying their time just a hop, skip, and a jump away. Step into our women-focused gym where we empower you to prioritize yourself, as we nurture your children with fun and engaging activities.',
  priceMonthly: '$15/mo',
  priceAdditional: '$5/mo per additional child',
  images: [
    { src: '/images/kids/kidsclub1.webp', width: 2400, height: 2400, alt: 'Kids Care play area' },
    { src: '/images/kids/kidsclub2.webp', width: 2400, height: 2400, alt: 'Children playing in Kids Care' },
  ],
};
```

- [ ] Commit: `feat(content): add classes, plans, dayPasses (Standard/Premium), kidsCare modules`

---

### Task 5: Content — `content/faq.ts` (verbatim, #5/#6 edited) + `content/codeOfConduct.ts` (7 real rules) + `content/stats.ts` (validation TDD)

FAQ is ported **verbatim** from the live `FAQ` (6 Q&A), editing **only #5 and #6** per spec §6.2 (no self-serve website/app; Glofox-only booking; pricing = "Contact for pricing"). The on-page answers and the `FAQPage` JSON-LD must match. Code of Conduct = the 7 real women's-safety rules ported verbatim. Stats = honest facts only. A Vitest test guards the §6.2 reconciliation (FORBIDDEN patterns scoped to ANSWERS) and structural invariants so the edited FAQ can never silently drift back to "sign up through our website".

**Files**
- Create: `content/faq.ts`
- Create: `content/codeOfConduct.ts`
- Create: `content/stats.ts`
- Create (test): `content/__tests__/content.test.ts`

- [ ] Write the failing test FIRST.

```ts
// content/__tests__/content.test.ts
import { describe, it, expect } from 'vitest';
import { faq } from '../faq';
import { codeOfConduct } from '../codeOfConduct';
import { stats } from '../stats';
import { plans, planPriceLabel } from '../plans';
import { amenities } from '../amenities';

// Patterns the EDITED ANSWERS (#5/#6) must not contain (spec §6.2).
// Scoped to answers only — question #5 legitimately contains "membership packages".
const FORBIDDEN_IN_ANSWERS = [
  /sign\s*up.*through our website/i,
  /mobile app/i,
  /self-?serve/i,
  /website,?\s*mobile app,?\s*or in person/i,
];

describe('faq content', () => {
  it('has exactly 6 Q&A with non-empty text', () => {
    expect(faq).toHaveLength(6);
    for (const item of faq) {
      expect(item.q.trim().length).toBeGreaterThan(0);
      expect(item.a.trim().length).toBeGreaterThan(0);
    }
  });

  it('removes self-serve / website-signup language from answers (spec §6.2)', () => {
    for (const item of faq) {
      for (const pattern of FORBIDDEN_IN_ANSWERS) {
        expect(item.a, `FAQ answer must not match ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it('keeps the real questions verbatim (only answers #5/#6 are edited)', () => {
    expect(faq[0].q).toBe('What makes Peaches unique for women?');
    expect(faq[4].q).toBe('Are there any membership packages available at Peaches?');
    expect(faq[5].q).toBe('How do I sign up for classes at Peaches?');
  });

  it('edited #6 points booking at Glofox/front desk, not a website/app', () => {
    expect(faq[5].a).toMatch(/glofox/i);
  });
});

describe('code of conduct content', () => {
  it('has exactly 7 rules with title + body', () => {
    expect(codeOfConduct.rules).toHaveLength(7);
    for (const r of codeOfConduct.rules) {
      expect(r.title.trim().length).toBeGreaterThan(0);
      expect(r.body.trim().length).toBeGreaterThan(0);
    }
  });
  it('has an intro', () => {
    expect(codeOfConduct.intro.trim().length).toBeGreaterThan(0);
  });
  it('ports the real women-safety rules (e.g. photography consent)', () => {
    const joined = codeOfConduct.rules.map((r) => `${r.title} ${r.body}`).join(' ').toLowerCase();
    expect(joined).toMatch(/consent/);
    expect(joined).toMatch(/headphone|earbud/);
  });
});

describe('stats content', () => {
  it('every stat has a value and label (honest facts; [] hides the section)', () => {
    for (const s of stats) {
      expect(s.value.trim().length).toBeGreaterThan(0);
      expect(s.label.trim().length).toBeGreaterThan(0);
    }
  });
  it('the amenities stat matches the real count (no overstatement, spec §6.4)', () => {
    const amenityStat = stats.find((s) => /amenit/i.test(s.label));
    expect(amenityStat?.value).toBe(String(amenities.length));
  });
});

describe('plans pricing placeholder', () => {
  it('falls back to "Contact for pricing" when price is null', () => {
    expect(planPriceLabel(null)).toBe('Contact for pricing');
    expect(planPriceLabel('$49/mo')).toBe('$49/mo');
    // current plans are all unpriced placeholders
    expect(plans.every((p) => p.price == null)).toBe(true);
  });
});
```

- [ ] Run (expect FAIL): `npx vitest run content/__tests__/content.test.ts`
  Expected: module-not-found for `../faq` / `../codeOfConduct` / `../stats`.

- [ ] Implement `content/faq.ts` (questions verbatim; answers #1–#4 verbatim; #5/#6 edited per §6.2).

```ts
// content/faq.ts
import type { FaqItem } from './types';

// Questions + answers ported verbatim from the live FAQ, EXCEPT answers #5 and #6
// which are edited per spec §6.2 (no self-serve website/app; Glofox-only booking;
// pricing = "Contact for pricing"). The FAQPage JSON-LD mirrors these exactly.
export const faq: FaqItem[] = [
  {
    q: 'What makes Peaches unique for women?',
    a: 'Peaches is tailored specifically for women, offering a safe and supportive environment. Our equipment, classes, and programs are designed with women’s fitness needs and goals in mind, ensuring a comfortable and effective workout experience.',
  },
  {
    q: 'Are there any classes specifically designed for women at Peaches?',
    a: 'Yes, we offer a variety of classes geared towards women, including yoga, Pilates, Zumba, strength training, and more. These classes focus on areas that most interest our female clientele, such as core strength, flexibility, and overall wellness.',
  },
  {
    q: 'Do you offer personal training services at Peaches?',
    a: 'Absolutely! Our certified personal trainers specialize in women’s fitness and can create customized workout plans to meet your individual goals, whether it’s weight loss, strength building, or improving overall fitness.',
  },
  {
    q: 'Is the gym equipped with amenities specific to women’s needs?',
    a: 'Yes, we provide amenities like private changing rooms, secure lockers, women-specific fitness equipment, and a lounge area for relaxation and socializing. Our goal is to make your gym experience as comfortable and convenient as possible.',
  },
  // FAQ #5 — EDITED per spec §6.2: pricing is not stated with certainty; direct to the team.
  {
    q: 'Are there any membership packages available at Peaches?',
    a: 'Yes — we offer monthly, quarterly, and annual memberships, each with access to all gym amenities and classes. Pricing varies by plan and promotion, so reach out or stop by the front desk and our team will walk you through current options and get you started.',
  },
  // FAQ #6 — EDITED per spec §6.2: Glofox-only booking; no website/app self-serve.
  {
    q: 'How do I sign up for classes at Peaches?',
    a: 'You can book classes through our Glofox member portal (linked on our Classes page) or in person at the front desk. We recommend booking in advance to secure your spot.',
  },
];
```

- [ ] Implement `content/codeOfConduct.ts` (intro + 7 real rules, ported verbatim).

```ts
// content/codeOfConduct.ts
import type { ConductRule } from './types';

// Intro + 7 rules ported verbatim from the live Code of Conduct.
export const codeOfConduct: { intro: string; rules: ConductRule[] } = {
  intro:
    "Welcome to Peaches Fitness Club, a sanctuary dedicated to fostering a secure and respectful environment. Our Code of Conduct is crucial in maintaining this atmosphere. All members must strictly adhere to these rules, ensuring our gym remains an empowering and inclusive space. Be aware that any violation may lead to immediate membership termination at management's discretion. Your cooperation helps uplift our community!",
  rules: [
    {
      title: 'Photography and Videography Policy',
      body: 'Members are strictly prohibited from capturing images or videos that include other members in the frame without their express consent.',
    },
    {
      title: 'Personal Space and Respect',
      body: 'All members must maintain a respectful distance from others, honoring personal space at all times.',
    },
    {
      title: 'Advice and Safety',
      body: 'While unsolicited advice is discouraged, intervention is permitted if equipment is being misused in a manner that poses a safety risk.',
    },
    {
      title: 'Respectful Behavior',
      body: 'Any form of staring, unwanted physical contact, catcalling, or making unsolicited comments about the bodies of other members is strictly forbidden.',
    },
    {
      title: 'Privacy and Personal Boundaries',
      body: 'Members must refrain from requesting personal contact information, such as phone numbers, or proposing social engagements, including dates, without clear mutual interest.',
    },
    {
      title: 'Conduct and Movement within the Facility',
      body: 'Following a member around the gym in a manner that could cause discomfort to others is not permitted.',
    },
    {
      title: 'Headphone Rule',
      body: 'Members wearing headphones/earbuds shall only be approached by staff or other members in urgent situations or for essential safety communications; otherwise, interactions will be limited to non-intrusive gestures, such as a friendly wave from the front desk.',
    },
  ],
};
```

- [ ] Implement `content/stats.ts` (honest facts only; numeric amenity count derived to match Task 2).

```ts
// content/stats.ts
import type { Stat } from './types';
import { amenities } from './amenities';

// Honest, verifiable facts only — never fabricated member counts (spec §6.4).
// Non-numeric values (e.g. "5AM–10PM", "Est. 2024") render static — the Stat
// component only count-ups pure-numeric values (global correction #9).
// [] → the StatsBand section is omitted entirely.
export const stats: Stat[] = [
  { value: String(amenities.length), label: 'Amenities for members' }, // exact count (12), no "+"
  { value: '4', label: 'Group class formats' },
  { value: '5AM–10PM', label: 'Daily access' },
  { value: 'Est. 2024', label: 'Locally owned in Albuquerque' },
];
```

- [ ] Run (expect PASS): `npx vitest run content/__tests__/content.test.ts`
  Expected: all green (faq:4, conduct:3, stats:2, plans:1 → 10 `it` blocks, exact count derived from the test file). Key invariant: no FORBIDDEN_IN_ANSWERS match; questions verbatim; amenity stat == `amenities.length`.

- [ ] Commit: `feat(content): add faq (verbatim, #5/#6 edited), code of conduct (7 real rules), stats with validation (TDD)`

---

### Task 6: `content/careers.ts` (positions + enum literals)

Owner-supplied positions list and the canonical GENDER/POSITION enums (Appendix A / REAL_COPY) consumed by the careers form shell in this chunk and wired to zod in Chunk 3. Spec §10: option values = canonical literals (legacy typo "Group Instuctor" fixed → "Group Instructor").

**Files**
- Create: `content/careers.ts`

- [ ] Implement.

```ts
// content/careers.ts

export const GENDER = ['Male', 'Female', 'Non-Binary', 'Prefer Not To Answer'] as const;
export const POSITION = [
  'Front Desk',
  'Child Care Provider',
  'Personal Trainer',
  'Group Instructor', // legacy typo "Group Instuctor" intentionally fixed
] as const;

export type Gender = (typeof GENDER)[number];
export type Position = (typeof POSITION)[number];

export const careers = {
  intro:
    'Love fitness and community? We are always looking for great people to join the Peaches team. Tell us about yourself and we will be in touch.',
  openPositions: [...POSITION] as string[],
};
```

- [ ] Commit: `feat(content): add careers content + canonical gender/position enums`

---

### Task 7: `lib/jsonld.ts` builders + `components/seo/JsonLd.tsx` (TDD)

LocalBusiness/HealthClub site-wide; FAQPage on /faq (matches edited answers); BreadcrumbList on subpages. Facebook omitted from `sameAs` (spec §8/§13). NAP from `site.ts`. Production indexing stays gated by `robots.ts`/`metadata.robots` (Task 16/17) until NAP is confirmed; the JSON-LD builders themselves are pure and unit-tested. `openingHoursSpecification.dayOfWeek` must use valid schema.org `DayOfWeek` names, mapped from the human range via `schemaDayOfWeek` (Chunk 1 `lib/nap.ts`).

**Files**
- Create: `lib/jsonld.ts`
- Create (test): `lib/__tests__/jsonld.test.ts`
- Create: `components/seo/JsonLd.tsx`

> `schemaDayOfWeek(range: string): string[]` (Chunk 1, `lib/nap.ts`) maps a human range to schema.org `DayOfWeek` names, e.g. `"Monday–Friday"` → `['Monday','Tuesday','Wednesday','Thursday','Friday']`, `"Saturday–Sunday"` → `['Saturday','Sunday']`. If Chunk 1 did not provide it, add it there (single source for day handling); do not parse ranges inline here.

- [ ] Write the failing test.

```ts
// lib/__tests__/jsonld.test.ts
import { describe, it, expect } from 'vitest';
import { localBusinessJsonLd, faqPageJsonLd, breadcrumbJsonLd } from '../jsonld';
import { site } from '../../content/site';
import { faq } from '../../content/faq';

const VALID_DAYS = new Set([
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
]);

describe('localBusinessJsonLd', () => {
  const ld = localBusinessJsonLd();
  it('is a HealthClub with single-source NAP from site.ts', () => {
    expect(ld['@type']).toBe('HealthClub');
    expect(ld.name).toBe(site.name);
    expect(ld.telephone).toBe(site.nap.phone);
    expect(ld.address.streetAddress).toContain(site.nap.street);
    expect(ld.address.postalCode).toBe(site.nap.zip);
    expect(ld.geo.latitude).toBe(site.nap.geo.lat);
    expect(ld.geo.longitude).toBe(site.nap.geo.lng);
    expect(ld.priceRange).toBe(site.priceRange);
  });
  it('includes Instagram in sameAs but OMITS Facebook (spec §8)', () => {
    expect(ld.sameAs).toContain(site.socials.instagram);
    expect((ld.sameAs as string[]).some((u) => /facebook/i.test(u))).toBe(false);
  });
  it('emits valid schema.org DayOfWeek names in openingHoursSpecification', () => {
    expect(ld.openingHoursSpecification.length).toBeGreaterThan(0);
    for (const spec of ld.openingHoursSpecification) {
      expect(Array.isArray(spec.dayOfWeek)).toBe(true);
      for (const d of spec.dayOfWeek) {
        expect(VALID_DAYS.has(d), `invalid DayOfWeek: ${d}`).toBe(true);
      }
    }
  });
});

describe('faqPageJsonLd', () => {
  it('mirrors the edited on-page FAQ answers exactly (spec §6.2)', () => {
    const ld = faqPageJsonLd();
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity).toHaveLength(faq.length);
    ld.mainEntity.forEach((q, i) => {
      expect(q.name).toBe(faq[i].q);
      expect(q.acceptedAnswer.text).toBe(faq[i].a);
    });
  });
});

describe('breadcrumbJsonLd', () => {
  it('builds a 2-level breadcrumb for a subpage', () => {
    const ld = breadcrumbJsonLd('Classes', '/classes');
    expect(ld['@type']).toBe('BreadcrumbList');
    expect(ld.itemListElement).toHaveLength(2);
    expect(ld.itemListElement[1].name).toBe('Classes');
    expect(ld.itemListElement[1].item).toContain('/classes');
  });
});
```

- [ ] Run (expect FAIL): `npx vitest run lib/__tests__/jsonld.test.ts`
  Expected: `Cannot find module '../jsonld'`.

- [ ] Implement `lib/jsonld.ts`.

```ts
// lib/jsonld.ts
import { site } from '../content/site';
import { faq } from '../content/faq';
import { formatStreetWithSuite, schemaDayOfWeek } from './nap';

const SITE_URL = site.siteUrl.replace(/\/$/, '');

function openingHours() {
  // schema.org OpeningHoursSpecification — dayOfWeek must be valid DayOfWeek
  // names, so map the human range ("Monday–Friday") to an array via schemaDayOfWeek.
  return site.hours.operating.map((r) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: schemaDayOfWeek(r.days),
    opens: r.open,
    closes: r.close,
  }));
}

export function localBusinessJsonLd() {
  // sameAs: Instagram only — Facebook omitted until the slug is confirmed (§8/§13).
  const sameAs = [site.socials.instagram].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthClub',
    '@id': `${SITE_URL}/#organization`,
    name: site.name,
    url: SITE_URL,
    telephone: site.nap.phone,
    email: site.nap.email,
    priceRange: site.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: formatStreetWithSuite(site.nap),
      addressLocality: site.nap.city,
      addressRegion: site.nap.state,
      postalCode: site.nap.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.nap.geo.lat,
      longitude: site.nap.geo.lng,
    },
    openingHoursSpecification: openingHours(),
    sameAs,
  };
}

export function faqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage' as const,
    mainEntity: faq.map((item) => ({
      '@type': 'Question' as const,
      name: item.q,
      acceptedAnswer: { '@type': 'Answer' as const, text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(name: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList' as const,
    itemListElement: [
      { '@type': 'ListItem' as const, position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem' as const, position: 2, name, item: `${SITE_URL}${path}` },
    ],
  };
}
```

> Requires `formatStreetWithSuite(nap)` (e.g. `"2801 Eubank Blvd NE, Suite P"`) and `schemaDayOfWeek(range)` in `lib/nap.ts` (Chunk 1). Adjust imports if Chunk 1 named them differently; do not hardcode the address or day list.

- [ ] Run (expect PASS): `npx vitest run lib/__tests__/jsonld.test.ts`
  Expected: `Tests 4 passed`.

- [ ] Implement the server component `components/seo/JsonLd.tsx`.

```tsx
// components/seo/JsonLd.tsx
// Server component — emits a JSON-LD <script>. No 'use client'.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe; this is structured data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] Commit: `feat(seo): add JSON-LD builders (HealthClub/FAQPage/Breadcrumb) + JsonLd component (TDD)`

---

### Task 8: Reusable `Accordion` (FAQ, client) + `Stat` count-up (client)

Spec §5.3: Accordion keyboard-accessible; Stat animated count-up gated by reduced-motion AND a numeric-prefix test (global correction #9 — only pure leading-number values animate). These are leaf client components.

**Files**
- Create: `components/ui/Accordion.tsx`
- Create: `components/ui/Stat.tsx`

- [ ] Implement `components/ui/Accordion.tsx`.

```tsx
// components/ui/Accordion.tsx
'use client';
import { useId, useState } from 'react';

export interface AccordionItem {
  q: string;
  a: string;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();
  return (
    <div className="divide-y divide-peach/60">
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-btn-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={i}>
            <h3 className="m-0">
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left font-heading text-lg text-charcoal transition-colors hover:text-coral-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-deep"
              >
                <span>{item.q}</span>
                <span aria-hidden className={`shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="pb-5 text-charcoal/90"
            >
              <p className="m-0 leading-relaxed">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

> The on-page FAQ text is rendered server-side via the `<p>`s (present in HTML even when `hidden`), so it stays indexable (spec §8). `hidden` only affects visibility, not crawlability.

- [ ] Implement `components/ui/Stat.tsx` (count-up, reduced-motion-safe, numeric-prefix-gated).

```tsx
// components/ui/Stat.tsx
'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Animated count-up for values that are a pure leading number (e.g. "12", "5+").
 * Non-numeric values ("5AM–10PM", "Est. 2024", "Women-focused") render statically —
 * no count-up (global correction #9). Respects prefers-reduced-motion.
 */
export function Stat({ value, label }: { value: string; label: string }) {
  const numeric = /^(\d+)(\+)?$/.exec(value.trim());
  const target = numeric ? parseInt(numeric[1], 10) : null;
  const suffix = numeric?.[2] ?? '';
  const [display, setDisplay] = useState<string>(target != null ? '0' : value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (target == null) return; // non-numeric → static
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(String(target) + suffix);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const run = () => {
      const start = performance.now();
      const dur = 1200;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(eased * target) + (p === 1 ? suffix : ''));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, suffix]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-heading text-4xl text-coral-deep sm:text-5xl">{display}</div>
      <div className="mt-2 text-sm uppercase tracking-wide text-charcoal/80">{label}</div>
    </div>
  );
}
```

- [ ] Commit: `feat(ui): add keyboard Accordion + reduced-motion-safe numeric-gated Stat count-up`

---

### Task 9: `components/ui/Carousel.tsx` (keyboard, empty-state) + `components/trainers/TrainerCard.tsx`

Spec §5.3 + Appendix B: Carousel keyboard-navigable, single-image hides arrows/dots, empty → render nothing. TrainerCard expandable/modal + placeholder state (Katie). `Modal` prop contract is pinned in the preamble (`{ onClose, titleId, children }`).

**Files**
- Create: `components/ui/Carousel.tsx`
- Create: `components/trainers/TrainerCard.tsx`

- [ ] Implement `components/ui/Carousel.tsx`.

```tsx
// components/ui/Carousel.tsx
'use client';
import Image from 'next/image';
import { useState } from 'react';
import type { ImgRef } from '@/content/types';

export function Carousel({ images, ariaLabel }: { images: ImgRef[]; ariaLabel: string }) {
  const [i, setI] = useState(0);
  if (!images || images.length === 0) return null; // empty → render nothing

  const single = images.length === 1;
  const go = (n: number) => setI((prev) => (prev + n + images.length) % images.length);

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={(e) => {
        if (single) return;
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          go(1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          go(-1);
        }
      }}
    >
      <Image
        src={images[i].src}
        width={images[i].width}
        height={images[i].height}
        alt={images[i].alt}
        className="h-auto w-full object-cover"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
      {!single && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-charcoal shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral-deep"
          >
            &#8249;
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-charcoal shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral-deep"
          >
            &#8250;
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, n) => (
              <button
                key={n}
                type="button"
                aria-label={`Go to image ${n + 1}`}
                aria-current={n === i}
                onClick={() => setI(n)}
                className={`h-2 w-2 rounded-full ${n === i ? 'bg-coral-deep' : 'bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] Implement `components/trainers/TrainerCard.tsx`.

```tsx
// components/trainers/TrainerCard.tsx
'use client';
import Image from 'next/image';
import { useState } from 'react';
import type { Trainer } from '@/content/types';
import { Modal } from '@/components/ui/Modal';

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  const [open, setOpen] = useState(false);
  const isPlaceholder = trainer.placeholder === true;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={trainer.photo.src}
          alt={trainer.photo.alt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className={`object-cover ${isPlaceholder ? 'opacity-80' : ''}`}
        />
      </div>
      <div className="p-6">
        <h3 className="font-heading text-2xl text-charcoal">{trainer.name}</h3>
        {isPlaceholder ? (
          <p className="mt-2 text-charcoal/70">{trainer.bio[0]}</p>
        ) : (
          <>
            <p className="mt-2 line-clamp-3 text-charcoal/85">{trainer.bio[0]}</p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-4 font-heading text-coral-deep underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral-deep"
            >
              Read bio
            </button>
          </>
        )}
      </div>

      {!isPlaceholder && open && (
        <Modal onClose={() => setOpen(false)} titleId={`trainer-${trainer.slug}`}>
          <h3 id={`trainer-${trainer.slug}`} className="font-heading text-3xl text-charcoal">
            {trainer.name}
          </h3>
          <div className="mt-4 space-y-3 text-charcoal/90">
            {trainer.bio.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>
          {trainer.specializations.length > 0 && (
            <>
              <h4 className="mt-6 font-heading text-lg text-coral-deep">Specializations</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-charcoal/90">
                {trainer.specializations.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          )}
          {trainer.certifications && trainer.certifications.length > 0 && (
            <>
              <h4 className="mt-6 font-heading text-lg text-coral-deep">Certifications</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-charcoal/90">
                {trainer.certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </>
          )}
        </Modal>
      )}
    </article>
  );
}
```

> `Modal` (focus-trap client component) comes from Chunk 1 `components/ui/Modal.tsx` with the pinned prop shape `{ onClose, titleId, children }` (preamble). `Trainer.certifications` is optional in `content/types.ts`; the guard handles its absence.

- [ ] Commit: `feat(components): add keyboard Carousel (empty/single-image states) + TrainerCard with modal + placeholder`

---

### Task 10: Section components — `Hero`, `ValueProps`, `AmenitiesPreview`, `ClassesPreview`

Server components composing content. Hero loads its image `priority` (spec §7). No `'use client'`.

**Files**
- Create: `components/sections/Hero.tsx`
- Create: `components/sections/ValueProps.tsx`
- Create: `components/sections/AmenitiesPreview.tsx`
- Create: `components/sections/ClassesPreview.tsx`

- [ ] Implement `components/sections/Hero.tsx`.

```tsx
// components/sections/Hero.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-charcoal text-white">
      <Image
        src="/images/brand/mainbackground.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover opacity-60"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/40 to-charcoal/70" />
      <Container className="flex min-h-[70vh] flex-col items-start justify-center py-24">
        {/* Live slogan rotates growing/thriving/happening (src/Slogan); static "growing" is an accepted simplification. */}
        <p className="font-display text-3xl text-peach">Where good things are growing</p>
        <h1 className="mt-4 max-w-2xl font-heading text-5xl leading-tight sm:text-6xl">
          A women-focused gym in Albuquerque
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/90">
          Train strong in a welcoming space built for women — full weight room, group classes,
          sauna, cold plunge, and on-site Kids Care.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button as={Link} href="/membership">
            Join Peaches
          </Button>
          <Button as={Link} href="/amenities" variant="secondary">
            Explore the club
          </Button>
        </div>
      </Container>
    </section>
  );
}
```

> `Button` is expected to support an `as`/polymorphic prop and `variant` (from Chunk 1). If it instead wraps `<Link>` differently, use that API — the load-bearing bits are: primary = coral-deep fill + white (white-on-`#A8503A` = 5.42, passes AA); secondary = charcoal on peach (spec §5.1).

- [ ] Implement `components/sections/ValueProps.tsx`.

```tsx
// components/sections/ValueProps.tsx
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';

const VALUES = [
  { title: 'Women-Focused', body: 'A comfortable, empowering space designed by and for women.' },
  { title: 'Everything You Need', body: 'Weights, cardio, turf, classes, sauna, cold plunge, and recovery — all in one place.' },
  { title: 'Kids Care On-Site', body: 'Train with peace of mind while your little ones are safe and supervised.' },
  { title: 'Locally Owned', body: 'A women-focused Albuquerque club, open since 2024.' },
];

export function ValueProps() {
  return (
    <Section>
      <Container>
        <h2 className="font-heading text-3xl text-charcoal">Why Peaches</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-heading text-xl text-coral-deep">{v.title}</h3>
              <p className="mt-2 text-charcoal/85">{v.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] Implement `components/sections/AmenitiesPreview.tsx`.

```tsx
// components/sections/AmenitiesPreview.tsx
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { amenities } from '@/content/amenities';

export function AmenitiesPreview() {
  const preview = amenities.slice(0, 6);
  return (
    <Section className="bg-peach/30">
      <Container>
        <h2 className="font-heading text-3xl text-charcoal">Amenities</h2>
        <p className="mt-2 max-w-2xl text-charcoal/85">
          Everything you need to train, recover, and feel at home.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((a) => (
            <li key={a.slug} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-heading text-lg text-coral-deep">{a.name}</h3>
              <p className="mt-1 text-sm text-charcoal/85">{a.description}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button as={Link} href="/amenities" variant="secondary">
            See all amenities
          </Button>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] Implement `components/sections/ClassesPreview.tsx`.

```tsx
// components/sections/ClassesPreview.tsx
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { classes } from '@/content/classes';

export function ClassesPreview() {
  return (
    <Section>
      <Container>
        <h2 className="font-heading text-3xl text-charcoal">Group Classes</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {classes.map((c) => (
            <div key={c.slug} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-heading text-xl text-coral-deep">{c.name}</h3>
              <p className="mt-2 text-sm text-charcoal/85">{c.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Button as={Link} href="/classes" variant="secondary">
            View the schedule
          </Button>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] Commit: `feat(sections): add Hero (priority image), ValueProps, AmenitiesPreview, ClassesPreview`

---

### Task 11: Section components — `TrainersPreview`, `StatsBand`, `MembershipCTA` (promo slot), `LocationHours`

`StatsBand` omits itself when `stats` is empty (spec §6.4). `MembershipCTA` renders `site.promo.text` only when `promo.enabled` (no layout gap when off, spec §6.2). `LocationHours` renders address + hours server-side from `site.ts`.

**Files**
- Create: `components/sections/TrainersPreview.tsx`
- Create: `components/sections/StatsBand.tsx`
- Create: `components/sections/MembershipCTA.tsx`
- Create: `components/sections/LocationHours.tsx`

- [ ] Implement `components/sections/TrainersPreview.tsx`.

```tsx
// components/sections/TrainersPreview.tsx
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { TrainerCard } from '@/components/trainers/TrainerCard';
import { trainers } from '@/content/trainers';

export function TrainersPreview() {
  return (
    <Section className="bg-peach/30">
      <Container>
        <h2 className="font-heading text-3xl text-charcoal">Meet Our Trainers</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((t) => (
            <TrainerCard key={t.slug} trainer={t} />
          ))}
        </div>
        <div className="mt-8">
          <Button as={Link} href="/trainers" variant="secondary">
            Meet the team
          </Button>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] Implement `components/sections/StatsBand.tsx`.

```tsx
// components/sections/StatsBand.tsx
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Stat } from '@/components/ui/Stat';
import { stats } from '@/content/stats';

export function StatsBand() {
  if (!stats || stats.length === 0) return null; // empty → omit section
  return (
    <Section>
      <Container>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] Implement `components/sections/MembershipCTA.tsx`.

```tsx
// components/sections/MembershipCTA.tsx
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { site } from '@/content/site';

export function MembershipCTA() {
  const showPromo = site.promo?.enabled === true && !!site.promo.text;
  return (
    <Section className="bg-coral-deep text-white">
      <Container className="text-center">
        {showPromo && (
          <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1 font-heading text-sm uppercase tracking-wide">
            {site.promo.text}
          </p>
        )}
        <h2 className="font-heading text-3xl sm:text-4xl">Ready to join Peaches?</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/90">
          Contact us for current pricing and let&rsquo;s find the membership that fits you.
        </p>
        <div className="mt-8 flex justify-center">
          <Button as={Link} href="/membership" variant="onDark">
            Become a member
          </Button>
        </div>
      </Container>
    </Section>
  );
}
```

> `variant="onDark"` = white fill / charcoal label for contrast on the coral-deep band. white-on-`#A8503A` (coral-deep) = 5.42 (passes AA), so a plain primary on this band also passes; `onDark` is the elegant inverse. If Chunk 1's Button lacks this variant, render a white-bg/charcoal-text button via className override.

- [ ] Implement `components/sections/LocationHours.tsx`.

```tsx
// components/sections/LocationHours.tsx
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { site } from '@/content/site';
import { formatFullAddress, directionsUrl } from '@/lib/nap';

export function LocationHours() {
  return (
    <Section className="bg-peach/30">
      <Container>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl text-charcoal">Visit Us</h2>
            <address className="mt-4 not-italic text-charcoal/90">
              {formatFullAddress(site.nap)}
            </address>
            <p className="mt-3 text-charcoal/90">
              <a href={`tel:${site.nap.phone.replace(/[^\d+]/g, '')}`} className="text-coral-deep underline-offset-4 hover:underline">
                {site.nap.phone}
              </a>
            </p>
            <p className="mt-1 text-charcoal/90">
              <a href={`mailto:${site.nap.email}`} className="text-coral-deep underline-offset-4 hover:underline">
                {site.nap.email}
              </a>
            </p>
            <p className="mt-4">
              <a
                href={directionsUrl(site.nap)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-coral-deep underline-offset-4 hover:underline"
              >
                Get directions
              </a>
            </p>
          </div>
          <div>
            <h3 className="font-heading text-2xl text-charcoal">Hours</h3>
            <h4 className="mt-4 font-heading text-coral-deep">Operating</h4>
            <ul className="mt-1 space-y-1 text-charcoal/90">
              {site.hours.operating.map((r) => (
                <li key={`op-${r.days}`}>
                  <span className="font-medium">{r.days}:</span> {r.open}–{r.close}
                </li>
              ))}
            </ul>
            <h4 className="mt-4 font-heading text-coral-deep">Staffed</h4>
            <ul className="mt-1 space-y-1 text-charcoal/90">
              {site.hours.staffed.map((r) => (
                <li key={`st-${r.days}`}>
                  <span className="font-medium">{r.days}:</span> {r.open}–{r.close}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

> Uses `formatFullAddress(nap)` and `directionsUrl(nap)` from `lib/nap.ts` (Chunk 1). Both serialize entirely from `site.nap` (Suite P + correct ZIP), never hardcoded (spec §11).

- [ ] Commit: `feat(sections): add TrainersPreview, StatsBand (empty-guard), MembershipCTA (promo slot), LocationHours`

---

### Task 12: Home page `app/page.tsx` + verify server-rendered content

Compose the sections. One `<h1>` (in Hero). Per-route metadata via `pageMetadata`. Build-then-verify with curl against the dev server.

**Files**
- Create: `app/page.tsx`

- [ ] Implement.

```tsx
// app/page.tsx
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Hero } from '@/components/sections/Hero';
import { ValueProps } from '@/components/sections/ValueProps';
import { StatsBand } from '@/components/sections/StatsBand';
import { AmenitiesPreview } from '@/components/sections/AmenitiesPreview';
import { ClassesPreview } from '@/components/sections/ClassesPreview';
import { TrainersPreview } from '@/components/sections/TrainersPreview';
import { MembershipCTA } from '@/components/sections/MembershipCTA';
import { LocationHours } from '@/components/sections/LocationHours';

export const metadata: Metadata = pageMetadata({
  title: 'Home',
  description:
    'Peaches Fitness Club is a women-focused gym in Albuquerque, NM — weights, cardio, group classes, sauna, cold plunge, and on-site Kids Care.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <StatsBand />
      <AmenitiesPreview />
      <ClassesPreview />
      <TrainersPreview />
      <MembershipCTA />
      <LocationHours />
    </>
  );
}
```

- [ ] Verify (build-then-verify). Start the dev server in the background (Bash `run_in_background` — no shell `&`/`kill %1`, per global correction #7), then assert SEO-critical copy + a single h1 are in the server-rendered HTML.

  Start (background): `npm run dev`
  Then, once ready:
  ```bash
  curl -s http://localhost:3000/ > /tmp/home.html
  grep -c "women-focused gym in Albuquerque" /tmp/home.html   # expect >= 1
  grep -o "<h1" /tmp/home.html | wc -l                        # expect 1
  grep -c "Why Peaches" /tmp/home.html                        # expect >= 1
  grep -c "Visit Us" /tmp/home.html                           # expect >= 1
  ```
  Expected: each `grep -c` returns ≥1; the `<h1` count is exactly `1`.

- [ ] Commit: `feat(home): compose Home page from sections + metadata`

---

### Task 13: Content pages — `/about`, `/amenities`, `/trainers`, `/membership`

Each: complete server-rendered TSX, one `<h1>`, `pageMetadata`, and `<JsonLd data={breadcrumbJsonLd(...)} />`. `/membership` uses promo slot + `planPriceLabel`.

**Files**
- Create: `app/about/page.tsx`
- Create: `app/amenities/page.tsx`
- Create: `app/trainers/page.tsx`
- Create: `app/membership/page.tsx`

- [ ] Implement `app/about/page.tsx`. (Owner/founder names are NOT in REAL_COPY — do not invent them. Use the verbatim mission statement instead.)

```tsx
// app/about/page.tsx
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = pageMetadata({
  title: 'About',
  description:
    'Peaches Fitness Club is a women-focused gym in Albuquerque, NM — a welcoming, judgment-free community where everyone grows together.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd('About', '/about')} />
      <Section>
        <Container className="max-w-3xl">
          <h1 className="font-heading text-4xl text-charcoal">About Peaches</h1>
          {/* Mission statement ported verbatim from the live site. */}
          <p className="mt-6 text-lg leading-relaxed text-charcoal/90">
            At Peaches Fitness Club, we&rsquo;re dedicated to fostering a welcoming, judgment-free
            environment that empowers clients to achieve their fitness goals. Our commitment to
            safety, support for women, and emphasis on diversity and inclusivity underpin our
            community&rsquo;s spirit. With top-notch trainers, advanced facilities, and a nurturing
            community, we inspire confidence and healthy living, celebrating the joy of
            self-improvement and the strength found in encouragement. At Peaches, we&rsquo;re more
            than a gym; we&rsquo;re a community where everyone grows together.
          </p>
          <p className="mt-4 leading-relaxed text-charcoal/90">
            Whether you are just getting started or chasing a new personal best, you will find the
            tools, the classes, and the people to help you grow. Because here, good things are
            growing.
          </p>
        </Container>
      </Section>
    </>
  );
}
```

> Do not fabricate founder names or an exact open date — REAL_COPY does not provide them. If the owner supplies them later, add them to `content/site.ts` and interpolate.

- [ ] Implement `app/amenities/page.tsx`.

```tsx
// app/amenities/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { amenities } from '@/content/amenities';

export const metadata: Metadata = pageMetadata({
  title: 'Amenities',
  description:
    'Weight room, cardio, turf, Booty Builder® equipment, group classes, sauna, cold plunge, Kids Care, members lounge, and the Peachy Bar — explore the amenities at Peaches Fitness Club in Albuquerque.',
  path: '/amenities',
});

export default function AmenitiesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd('Amenities', '/amenities')} />
      <Section>
        <Container>
          <h1 className="font-heading text-4xl text-charcoal">Amenities</h1>
          <p className="mt-4 max-w-2xl text-lg text-charcoal/90">
            Everything you need to train hard, recover well, and feel at home — all under one roof.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {amenities.map((a) => (
              <article key={a.slug} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                {a.images[0] && (
                  <Image
                    src={a.images[0].src}
                    width={a.images[0].width}
                    height={a.images[0].height}
                    alt={a.images[0].alt}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="h-56 w-full object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="font-heading text-2xl text-coral-deep">{a.name}</h2>
                  <p className="mt-2 text-charcoal/90">{a.description}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] Implement `app/trainers/page.tsx`.

```tsx
// app/trainers/page.tsx
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { TrainerCard } from '@/components/trainers/TrainerCard';
import { trainers } from '@/content/trainers';

export const metadata: Metadata = pageMetadata({
  title: 'Trainers',
  description:
    'Meet the personal trainers at Peaches Fitness Club — strength, technique, and women-focused coaching in Albuquerque, NM.',
  path: '/trainers',
});

export default function TrainersPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd('Trainers', '/trainers')} />
      <Section>
        <Container>
          <h1 className="font-heading text-4xl text-charcoal">Our Trainers</h1>
          <p className="mt-4 max-w-2xl text-lg text-charcoal/90">
            Coaching built around you — meet the people who will help you train strong.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trainers.map((t) => (
              <TrainerCard key={t.slug} trainer={t} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] Implement `app/membership/page.tsx` (promo slot above plan cards; `planPriceLabel`).

```tsx
// app/membership/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { plans, planPriceLabel } from '@/content/plans';
import { site } from '@/content/site';

export const metadata: Metadata = pageMetadata({
  title: 'Membership',
  description:
    'Monthly, quarterly, and annual memberships at Peaches Fitness Club — a women-focused gym in Albuquerque, NM. Contact us for current pricing.',
  path: '/membership',
});

export default function MembershipPage() {
  const showPromo = site.promo?.enabled === true && !!site.promo.text;
  return (
    <>
      <JsonLd data={breadcrumbJsonLd('Membership', '/membership')} />
      <Section>
        <Container>
          <h1 className="font-heading text-4xl text-charcoal">Membership</h1>
          <p className="mt-4 max-w-2xl text-lg text-charcoal/90">
            Choose the plan that fits your life. Contact us and we&rsquo;ll help you get started.
          </p>

          {showPromo && (
            <div className="mt-8 rounded-2xl bg-coral-deep px-6 py-4 text-center font-heading text-white">
              {site.promo.text}
            </div>
          )}

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.slug}
                className={`rounded-2xl bg-white p-8 shadow-sm ${p.highlighted ? 'ring-2 ring-coral-deep' : ''}`}
              >
                <h2 className="font-heading text-2xl text-coral-deep">{p.tier}</h2>
                <p className="mt-2 font-heading text-3xl text-charcoal">{planPriceLabel(p.price)}</p>
                <ul className="mt-6 space-y-2 text-charcoal/90">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span aria-hidden className="text-coral-deep">&#10003;</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button as={Link} href="/contact">
                    Contact for pricing
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] Verify the four pages server-render their h1 + key copy (dev server running from Task 12).

  ```bash
  for p in about amenities trainers membership; do
    curl -s "http://localhost:3000/$p" > "/tmp/$p.html"
    echo "== $p ==";
    grep -o "<h1" "/tmp/$p.html" | wc -l   # expect 1 each
  done
  grep -c "Booty Builder" /tmp/amenities.html        # expect >= 1
  grep -c "Contact for pricing" /tmp/membership.html # expect >= 1 (null price fallback)
  grep -c "everyone grows together" /tmp/about.html  # expect >= 1 (verbatim mission)
  grep -c "Bio coming soon" /tmp/trainers.html       # expect >= 1 (Katie placeholder, server-rendered)
  ```
  Expected: each `<h1` count = 1; all `grep -c` ≥1.

- [ ] Commit: `feat(pages): add about, amenities, trainers, membership pages + breadcrumb JSON-LD`

---

### Task 14: Content pages — `/classes`, `/day-pass`, `/kids-care`, `/code-of-conduct`

`/classes` server-renders class types independently of Glofox; embed slot is a placeholder (real `GlofoxEmbed` arrives in Chunk 4). The other three render ported pricing/rules copy.

**Files**
- Create: `app/classes/page.tsx`
- Create: `app/day-pass/page.tsx`
- Create: `app/kids-care/page.tsx`
- Create: `app/code-of-conduct/page.tsx`

- [ ] Implement `app/classes/page.tsx`.

```tsx
// app/classes/page.tsx
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { classes } from '@/content/classes';
import { site } from '@/content/site';

export const metadata: Metadata = pageMetadata({
  title: 'Classes',
  description:
    'Yoga, Pilates, Zumba, and strength group classes at Peaches Fitness Club — a women-focused gym in Albuquerque, NM. View the schedule and book on Glofox.',
  path: '/classes',
});

export default function ClassesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd('Classes', '/classes')} />
      <Section>
        <Container>
          <h1 className="font-heading text-4xl text-charcoal">Group Classes</h1>
          <p className="mt-4 max-w-2xl text-lg text-charcoal/90">
            From breath-led yoga to high-energy Zumba, our classes are led by instructors who meet
            you where you are.
          </p>

          {/* SEO-critical: class types are server-rendered, independent of the Glofox iframe. */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {classes.map((c) => (
              <article key={c.slug} className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl text-coral-deep">{c.name}</h2>
                <p className="mt-2 text-sm text-charcoal/90">{c.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-peach/30">
        <Container>
          <h2 className="font-heading text-3xl text-charcoal">Class Schedule</h2>
          <p className="mt-2 max-w-2xl text-charcoal/90">
            See the live class schedule and reserve your spot on Glofox.
          </p>
          {/* Placeholder embed slot — real lazy Glofox facade is added in Chunk 4. */}
          <div
            data-glofox-slot
            className="mt-6 flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-coral-deep/40 bg-white p-8 text-center"
          >
            <div>
              <p className="text-charcoal/90">The live schedule loads here.</p>
              <div className="mt-4">
                <Button
                  as="a"
                  href={site.glofox.scheduleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book on Glofox
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] Implement `app/day-pass/page.tsx`.

```tsx
// app/day-pass/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { dayPasses } from '@/content/dayPasses';

export const metadata: Metadata = pageMetadata({
  title: 'Day Pass',
  description:
    'Drop in to Peaches Fitness Club with a Standard ($15) or Premium ($25) day pass — gym access, plus sauna, cold plunge, and classes on Premium. Albuquerque, NM.',
  path: '/day-pass',
});

export default function DayPassPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd('Day Pass', '/day-pass')} />
      <Section>
        <Container>
          <h1 className="font-heading text-4xl text-charcoal">Day Passes</h1>
          <p className="mt-4 max-w-2xl text-lg text-charcoal/90">
            Visiting town or trying us out? Drop in and train — no membership required.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {dayPasses.map((d) => (
              <div key={d.name} className="rounded-2xl bg-white p-8 shadow-sm">
                <h2 className="font-heading text-2xl text-coral-deep">{d.name}</h2>
                <p className="mt-2 font-heading text-3xl text-charcoal">{d.price}</p>
                <ul className="mt-6 space-y-2 text-charcoal/90">
                  {d.includes.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span aria-hidden className="text-coral-deep">&#10003;</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button as={Link} href="/contact">
              Plan your visit
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] Implement `app/kids-care/page.tsx`.

```tsx
// app/kids-care/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { kidsCare } from '@/content/kidsCare';

export const metadata: Metadata = pageMetadata({
  title: 'Kids Care',
  description:
    'On-site Kids Care at Peaches Fitness Club — a safe, supervised space for children while you train. $15/mo, plus $5/mo per additional child. Albuquerque, NM.',
  path: '/kids-care',
});

export default function KidsCarePage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd('Kids Care', '/kids-care')} />
      <Section>
        <Container>
          <h1 className="font-heading text-4xl text-charcoal">Kids Care</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-charcoal/90">{kidsCare.intro}</p>
          <div className="mt-8 flex flex-wrap gap-6">
            <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
              <p className="font-heading text-3xl text-coral-deep">{kidsCare.priceMonthly}</p>
              <p className="mt-1 text-sm text-charcoal/80">Per child</p>
            </div>
            <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
              <p className="font-heading text-3xl text-coral-deep">{kidsCare.priceAdditional}</p>
              <p className="mt-1 text-sm text-charcoal/80">Each additional child</p>
            </div>
          </div>
          {kidsCare.images.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {kidsCare.images.map((img) => (
                <Image
                  key={img.src}
                  src={img.src}
                  width={img.width}
                  height={img.height}
                  alt={img.alt}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="h-72 w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
```

- [ ] Implement `app/code-of-conduct/page.tsx`.

```tsx
// app/code-of-conduct/page.tsx
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { codeOfConduct } from '@/content/codeOfConduct';

export const metadata: Metadata = pageMetadata({
  title: 'Code of Conduct',
  description:
    'Our member code of conduct keeps Peaches Fitness Club a respectful, safe, and welcoming space for everyone.',
  path: '/code-of-conduct',
});

export default function CodeOfConductPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd('Code of Conduct', '/code-of-conduct')} />
      <Section>
        <Container className="max-w-3xl">
          <h1 className="font-heading text-4xl text-charcoal">Code of Conduct</h1>
          <p className="mt-4 text-lg leading-relaxed text-charcoal/90">{codeOfConduct.intro}</p>
          <ol className="mt-8 space-y-6">
            {codeOfConduct.rules.map((r, i) => (
              <li key={r.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl text-coral-deep">
                  {i + 1}. {r.title}
                </h2>
                <p className="mt-2 text-charcoal/90">{r.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] Verify (dev server running). Critically, `/classes` must server-render class types **without** the Glofox iframe.

  ```bash
  for p in classes day-pass kids-care code-of-conduct; do
    curl -s "http://localhost:3000/$p" > "/tmp/$p.html"
    echo "== $p =="; grep -o "<h1" "/tmp/$p.html" | wc -l   # expect 1 each
  done
  grep -c "Pilates" /tmp/classes.html        # expect >= 1 (class type server-rendered)
  grep -c "Zumba" /tmp/classes.html          # expect >= 1
  grep -c "iframe" /tmp/classes.html         # expect 0 (no Glofox iframe in initial HTML)
  grep -c '\$15' /tmp/day-pass.html          # expect >= 1
  grep -c '\$25' /tmp/day-pass.html          # expect >= 1
  grep -c "24 Hour Unlimited Gym Use" /tmp/day-pass.html  # expect >= 1 (verbatim includes)
  grep -c "additional child" /tmp/kids-care.html          # expect >= 1
  grep -c "consent" /tmp/code-of-conduct.html             # expect >= 1 (real safety rule)
  grep -o "<li" /tmp/code-of-conduct.html | wc -l         # expect >= 7 (7 rules)
  ```
  Expected: each `<h1` = 1; class types present; `iframe` count = 0 on /classes; ported pricing/inclusions present; consent rule present; ≥7 `<li>` on code-of-conduct.

- [ ] Commit: `feat(pages): add classes (server-rendered types), day-pass, kids-care, code-of-conduct`

---

### Task 15: `/faq` (Accordion + FAQPage JSON-LD), `/careers` + `/contact` shells

`/faq` server-renders all 6 edited answers in initial HTML (indexable) and emits `FAQPage` JSON-LD matching them. `/careers` and `/contact` render hours/address/content server-side and a form **shell placeholder** (real forms wired in Chunk 3). **NAP in both shells is interpolated from `site.nap` — never hardcoded (spec §6.1/§11).**

**Files**
- Create: `app/faq/page.tsx`
- Create: `app/careers/page.tsx`
- Create: `app/contact/page.tsx`

- [ ] Implement `app/faq/page.tsx`.

```tsx
// app/faq/page.tsx
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Accordion } from '@/components/ui/Accordion';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/jsonld';
import { faq } from '@/content/faq';

export const metadata: Metadata = pageMetadata({
  title: 'FAQ',
  description:
    'Answers to common questions about Peaches Fitness Club — women-focused training, classes, personal training, amenities, membership, and booking in Albuquerque, NM.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd('FAQ', '/faq')} />
      {/* FAQPage structured data mirrors the edited on-page answers exactly (spec §6.2). */}
      <JsonLd data={faqPageJsonLd()} />
      <Section>
        <Container className="max-w-3xl">
          <h1 className="font-heading text-4xl text-charcoal">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-charcoal/90">
            Everything you need to know before your first visit.
          </p>
          <div className="mt-8">
            <Accordion items={faq} />
          </div>
        </Container>
      </Section>
    </>
  );
}
```

> The Accordion renders each answer `<p>` in the DOM (just `hidden`), so the 6 edited answers are present in server-rendered HTML and indexable, matching the `FAQPage` JSON-LD.

- [ ] Implement `app/careers/page.tsx` (content + form shell; real form in Chunk 3). NAP interpolated from `site.nap`.

```tsx
// app/careers/page.tsx
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { careers } from '@/content/careers';
import { site } from '@/content/site';

export const metadata: Metadata = pageMetadata({
  title: 'Careers',
  description:
    'Join the team at Peaches Fitness Club — front desk, child care, personal training, and group instruction roles in Albuquerque, NM.',
  path: '/careers',
});

export default function CareersPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd('Careers', '/careers')} />
      <Section>
        <Container className="max-w-3xl">
          <h1 className="font-heading text-4xl text-charcoal">Careers</h1>
          <p className="mt-4 text-lg leading-relaxed text-charcoal/90">{careers.intro}</p>

          <h2 className="mt-10 font-heading text-2xl text-charcoal">Open Positions</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {careers.openPositions.map((pos) => (
              <li key={pos} className="rounded-xl bg-white px-5 py-4 font-heading text-coral-deep shadow-sm">
                {pos}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-heading text-2xl text-charcoal">Apply</h2>
          {/* Form shell — real CareersForm (client) is wired in Chunk 3. NAP from site.ts (single source). */}
          <div
            data-careers-form-slot
            className="mt-4 rounded-2xl border border-dashed border-coral-deep/40 bg-white p-8 text-charcoal/80"
          >
            Application form coming online — in the meantime, email us at{' '}
            <a href={`mailto:${site.nap.email}`} className="text-coral-deep underline-offset-4 hover:underline">
              {site.nap.email}
            </a>
            .
          </div>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] Implement `app/contact/page.tsx` (server-rendered hours/address via `LocationHours` + form shell + map placeholder; real form/map in later chunks). NAP interpolated from `site.nap`.

```tsx
// app/contact/page.tsx
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { LocationHours } from '@/components/sections/LocationHours';
import { site } from '@/content/site';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Contact Peaches Fitness Club in Albuquerque, NM — address, hours, phone, directions, and a message form. We’d love to hear from you.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd('Contact', '/contact')} />
      <Section>
        <Container className="max-w-3xl">
          <h1 className="font-heading text-4xl text-charcoal">Contact Us</h1>
          <p className="mt-4 text-lg text-charcoal/90">
            Questions about membership, classes, or a visit? Reach out — we&rsquo;re happy to help.
          </p>
          {/* Form shell — real ContactForm (client) is wired in Chunk 3. NAP from site.ts (single source). */}
          <div
            data-contact-form-slot
            className="mt-8 rounded-2xl border border-dashed border-coral-deep/40 bg-white p-8 text-charcoal/80"
          >
            Contact form coming online — in the meantime, call{' '}
            <a href={`tel:${site.nap.phone.replace(/[^\d+]/g, '')}`} className="text-coral-deep underline-offset-4 hover:underline">
              {site.nap.phone}
            </a>{' '}
            or email{' '}
            <a href={`mailto:${site.nap.email}`} className="text-coral-deep underline-offset-4 hover:underline">
              {site.nap.email}
            </a>
            .
          </div>
        </Container>
      </Section>

      {/* Address, phone, directions, and hours are server-rendered (SEO + NAP, single source). */}
      <LocationHours />

      {/* Map placeholder — real Mapbox MapEmbed (client, dynamic) is wired in Chunk 4. */}
      <Section>
        <Container>
          <div
            data-map-slot
            className="flex min-h-[320px] items-center justify-center rounded-2xl bg-peach/30 text-charcoal/70"
          >
            Map loads here.
          </div>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] Verify (dev server running). FAQ answers + JSON-LD parity; contact/careers NAP server-rendered from site.ts.

  ```bash
  curl -s http://localhost:3000/faq > /tmp/faq.html
  curl -s http://localhost:3000/careers > /tmp/careers.html
  curl -s http://localhost:3000/contact > /tmp/contact.html
  grep -o "<h1" /tmp/faq.html | wc -l                       # expect 1
  grep -c "tailored specifically for women" /tmp/faq.html   # expect >= 1 (answer #1 text in HTML)
  grep -c "Glofox" /tmp/faq.html                            # expect >= 1 (edited #6 booking)
  grep -c "through our website" /tmp/faq.html               # expect 0 (edited out, §6.2)
  grep -c "mobile app" /tmp/faq.html                        # expect 0
  grep -c "application/ld+json" /tmp/faq.html               # expect >= 2 (breadcrumb + FAQPage)
  grep -c "FAQPage" /tmp/faq.html                           # expect 1
  grep -c "Group Instructor" /tmp/careers.html              # expect >= 1 (canonical, typo fixed)
  grep -c "peachesfitnessclub@gmail.com" /tmp/contact.html  # expect >= 1 (NAP from site.ts, not hardcoded)
  grep -c "2801 Eubank" /tmp/contact.html                   # expect >= 1 (server-rendered NAP)
  grep -c "Suite P" /tmp/contact.html                       # expect >= 1
  ```
  Expected: `<h1`=1; FAQ answer text present; Glofox booking present; forbidden phrases = 0; two JSON-LD blocks incl. one `FAQPage`; canonical position label present; NAP (email + street + Suite P) present in contact HTML.

- [ ] Commit: `feat(pages): add FAQ (Accordion + FAQPage JSON-LD), careers + contact shells with single-source NAP`

---

### Task 16: `app/sitemap.ts` + `app/robots.ts` (TDD on the route list)

Dynamic sitemap/robots from `NEXT_PUBLIC_SITE_URL` (spec §8). Robots gates production indexing until NAP is confirmed (launch gate §13) via an env flag, defaulting to `noindex` so we never accidentally index unconfirmed NAP.

**Files**
- Create: `lib/routes.ts`
- Create (test): `lib/__tests__/routes.test.ts`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] Write the failing test for the canonical route list.

```ts
// lib/__tests__/routes.test.ts
import { describe, it, expect } from 'vitest';
import { SITE_ROUTES } from '../routes';

describe('SITE_ROUTES', () => {
  it('lists every indexable public page exactly once', () => {
    const expected = [
      '/',
      '/about',
      '/amenities',
      '/trainers',
      '/classes',
      '/membership',
      '/day-pass',
      '/kids-care',
      '/code-of-conduct',
      '/careers',
      '/contact',
      '/faq',
      '/privacy',
      '/terms',
    ];
    expect(SITE_ROUTES).toEqual(expected);
    expect(new Set(SITE_ROUTES).size).toBe(SITE_ROUTES.length); // no dupes
  });

  it('uses the canonical slugs (hyphenated), not legacy aliases', () => {
    expect(SITE_ROUTES).toContain('/day-pass');
    expect(SITE_ROUTES).toContain('/kids-care');
    expect(SITE_ROUTES).toContain('/code-of-conduct');
    expect(SITE_ROUTES).not.toContain('/daypass');
    expect(SITE_ROUTES).not.toContain('/kidscare');
    expect(SITE_ROUTES).not.toContain('/codeofconduct');
  });
});
```

- [ ] Run (expect FAIL): `npx vitest run lib/__tests__/routes.test.ts`
  Expected: `Cannot find module '../routes'`.

- [ ] Implement `lib/routes.ts`.

```ts
// lib/routes.ts
/** Canonical, indexable public routes (single source for sitemap + nav). */
export const SITE_ROUTES = [
  '/',
  '/about',
  '/amenities',
  '/trainers',
  '/classes',
  '/membership',
  '/day-pass',
  '/kids-care',
  '/code-of-conduct',
  '/careers',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
] as const;

export type SiteRoute = (typeof SITE_ROUTES)[number];
```

- [ ] Run (expect PASS): `npx vitest run lib/__tests__/routes.test.ts`
  Expected: `Tests 2 passed`.

- [ ] Implement `app/sitemap.ts`.

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { SITE_ROUTES } from '@/lib/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const now = new Date();
  return SITE_ROUTES.map((route) => ({
    url: `${base}${route === '/' ? '' : route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }));
}
```

- [ ] Implement `app/robots.ts` (production-index gate, §13: stays `noindex`-style disallow until `NEXT_PUBLIC_ALLOW_INDEXING==='true'`).

```ts
// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  // Gate: do NOT allow indexing until NAP is confirmed (spec §13). Flip the
  // env flag to 'true' only after the launch-gate items are cleared.
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
  return {
    rules: allowIndexing
      ? { userAgent: '*', allow: '/', disallow: ['/api/'] }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${base}/sitemap.xml`,
  };
}
```

> Pair this with `robots: { index: false, follow: false }` in the root layout `metadata` while `NEXT_PUBLIC_ALLOW_INDEXING !== 'true'` (done in Task 17). Document `NEXT_PUBLIC_ALLOW_INDEXING` in `.env.example` (Chunk 1 owns `.env.example`; add it there if not present).

- [ ] Verify (dev server running):
  ```bash
  curl -s http://localhost:3000/sitemap.xml | grep -c "<loc>"        # expect 14
  curl -s http://localhost:3000/sitemap.xml | grep -c "/day-pass"    # expect 1
  curl -s http://localhost:3000/robots.txt | grep -c "Disallow: /"   # expect >= 1 (gated noindex default)
  curl -s http://localhost:3000/robots.txt | grep -c "Sitemap:"      # expect 1
  ```
  Expected: 14 `<loc>` entries; canonical slug present; default robots disallows all (gate on); sitemap line present.

- [ ] Commit: `feat(seo): add sitemap + robots from SITE_ROUTES with production-index gate (TDD)`

---

### Task 17: Static OG image as default + wire LocalBusiness JSON-LD into root layout

Set the single static `public/og.png` as default `openGraph.images` + `twitter.images` in the root layout so all routes inherit it (spec §8). Mount the site-wide `LocalBusiness`/`HealthClub` JSON-LD in the layout via `<JsonLd>`. Add the production-index gate to `metadata.robots`.

**Files**
- Create: `public/og.png` (placeholder branded 1200×630 PNG; replace with final art)
- Modify: `app/layout.tsx`

- [ ] Add a placeholder `public/og.png` (1200×630). Generate a simple branded placeholder so the metadata is valid now; final art swapped before launch.

  ```bash
  # If ImageMagick is available, generate a branded placeholder; otherwise copy MAINLOGO.
  if command -v magick >/dev/null 2>&1; then
    magick -size 1200x630 xc:'#FFF8F0' \
      -gravity center -fill '#A8503A' -pointsize 72 \
      -annotate +0+0 'Peaches Fitness Club' public/og.png
  else
    cp public/images/brand/MAINLOGO.png public/og.png
  fi
  ls -l public/og.png
  ```
  Expected: `public/og.png` exists and is non-empty.

- [ ] Modify `app/layout.tsx` — add the default OG/Twitter image to `metadata`, the index gate, and mount the LocalBusiness JSON-LD. (Chunk 1 created the layout with `metadataBase` + fonts + `HashRedirect`; extend its `metadata` export and `<body>` children. Edit the existing export; do not duplicate it.)

  Ensure `metadata` includes:

  ```ts
  // app/layout.tsx — within the exported `metadata` object
  import { site } from '@/content/site';
  // ...
  export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: {
      default: 'Peaches Fitness Club',
      template: '%s', // child pages supply the full "Page | Brand" string via pageMetadata
    },
    description:
      'A women-focused gym in Albuquerque, NM — weights, classes, sauna, cold plunge, and Kids Care.',
    // Default OG/Twitter image — child routes inherit unless they set their own (spec §8).
    openGraph: {
      type: 'website',
      siteName: 'Peaches Fitness Club',
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Peaches Fitness Club' }],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og.png'],
    },
    // Production-index gate (spec §13): noindex until NAP confirmed.
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? { index: true, follow: true }
        : { index: false, follow: false },
  };
  ```

  And mount the JSON-LD inside `<body>` (alongside the existing `<HashRedirect/>`):

  ```tsx
  // app/layout.tsx — inside <body>, before {children}
  import { JsonLd } from '@/components/seo/JsonLd';
  import { localBusinessJsonLd } from '@/lib/jsonld';
  // ...
  <JsonLd data={localBusinessJsonLd()} />
  ```

> Because `pageMetadata` returns a full `title` string and the template is `'%s'`, per-route titles render verbatim (`"Classes | Peaches Fitness Club"`); the home page returns the bare brand. This keeps every page's `<title>` unique without double-suffixing.

- [ ] Verify (restart dev server to pick up layout changes if needed):
  ```bash
  curl -s http://localhost:3000/ > /tmp/home2.html
  grep -c 'property="og:image"' /tmp/home2.html              # expect >= 1 (inherited default OG)
  grep -c '/og.png' /tmp/home2.html                          # expect >= 1
  grep -c 'HealthClub' /tmp/home2.html                       # expect 1 (site-wide LocalBusiness JSON-LD)
  curl -s http://localhost:3000/classes > /tmp/classes2.html
  grep -c 'property="og:image"' /tmp/classes2.html           # expect >= 1 (child inherits OG)
  grep -o '<title>[^<]*</title>' /tmp/classes2.html          # expect "Classes | Peaches Fitness Club"
  grep -o '<title>[^<]*</title>' /tmp/home2.html             # expect "Peaches Fitness Club"
  grep -c 'rel="canonical"' /tmp/classes2.html               # expect 1
  grep -c '"index":false\|noindex' /tmp/home2.html || true   # gate: noindex present until flag flipped
  ```
  Expected: OG image present on home AND inherited on /classes; one `HealthClub` JSON-LD; unique titles (child suffixed, home bare); canonical present; noindex gate active by default.

- [ ] Commit: `feat(seo): set static OG default + index gate + mount site-wide LocalBusiness JSON-LD in layout`

---

### Task 18: Full-suite green + a11y pass + chunk wrap-up

Confirm all unit tests pass and run an axe-core a11y scan over the SEO-critical pages (spec §5.1/§14 contrast gate, §12 a11y targets). Uses the `@playwright/test` + `@axe-core/playwright` spec run via `npm run test:a11y` (Playwright's `webServer` config builds+starts the server — no manual `&`/`kill`, per global corrections #6/#7).

**Files**
- Create (test): `e2e/a11y.spec.ts` (if Chunk 1 already has one, extend its URL list instead of duplicating)

- [ ] Run the full Vitest suite (expect PASS): `npx vitest run`
  Expected: all test files green — includes `seo`, `jsonld`, `routes`, `content`, plus Chunk 1's `contrast`/`schemas`/`nap` tests. No failures.

- [ ] Add/extend the axe-core a11y spec. Playwright's `webServer` block (Chunk 1) builds+starts the app, so the spec needs no manual server.

  ```ts
  // e2e/a11y.spec.ts
  import { test, expect } from '@playwright/test';
  import AxeBuilder from '@axe-core/playwright';

  const PAGES = ['/', '/classes', '/faq', '/membership', '/contact', '/amenities', '/trainers'];

  for (const path of PAGES) {
    test(`a11y: ${path}`, async ({ page }) => {
      await page.goto(path); // baseURL from playwright.config.ts
      await expect(page.locator('h1')).toHaveCount(1);
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((v) =>
        ['serious', 'critical'].includes(v.impact ?? ''),
      );
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
  ```

- [ ] Run the a11y suite (expect PASS): `npm run test:a11y`
  Expected: all page specs pass — one `<h1>` each, zero serious/critical axe violations. Contrast holds because pairings use charcoal-on-light and white-on-coral-deep (white-on-`#A8503A` = 5.42 AA-pass); plain `--coral` is never used as normal-size text on peach/cream (spec §5.1 / global correction #10).

- [ ] Commit: `test: full vitest + axe a11y pass for content pages and SEO`

---

**Chunk 2 done.** Delivered: all `content/*` modules with REAL ported copy (amenities names verbatim + on-brand descriptions; trainers [Kira verbatim bio/specializations/NASM cert + Katie placeholder with ported "Bio coming soon"]; classes; plans [null→"Contact for pricing"]; day passes [Standard $15 gym-only / Premium $25 gym+sauna+cold plunge+classes, verbatim includes]; kids care [verbatim intro, $15+$5]; FAQ [6 verbatim questions, answers #1–4 verbatim, #5/#6 edited per §6.2]; code of conduct [intro + 7 real women's-safety rules verbatim]; honest stats [amenity count derived, non-numeric values static]; careers enums [typo fixed]) — all importing from `@/content/types` (Chunk 1). All section components (Hero priority image with dead-ternary removed, ValueProps, AmenitiesPreview, ClassesPreview, TrainersPreview, StatsBand empty-guard, MembershipCTA promo slot, LocationHours). Reusable Accordion / Carousel / Stat (numeric-gated count-up) / TrainerCard (pinned Modal contract). All 14 routes' pages with unique per-route metadata + breadcrumb JSON-LD; `/classes` server-renders class types with no iframe in initial HTML; `/about` uses verbatim mission (no fabricated founders/dates); `/contact` + `/careers` shells with single-source NAP interpolated from `site.nap`. `components/seo/JsonLd.tsx` + LocalBusiness/HealthClub (Facebook omitted; valid `DayOfWeek` names via `schemaDayOfWeek`), FAQPage matching edited answers, BreadcrumbList. `app/sitemap.ts` + `app/robots.ts` (production-index gate); static `public/og.png` default + index gate in layout. Forms wired in Chunk 3; Glofox/Mapbox embeds in Chunk 4; animation reveals + Lighthouse + launch-gate in Chunk 5.

---

## Chunk 3: Forms backend (zod schemas, Resend, Upstash rate limit, /api/contact, wired forms)

> **Prerequisites (from prior chunks).** This chunk assumes the Next.js 15 scaffold exists at repo root with TS strict, `vitest.config.ts` + the `@superpowers:test-driven-development` workflow available, Tailwind v4 tokens in `app/globals.css`, the `components/ui/{Button,…}` slots reserved, `content/site.ts` (with `nap.email` and `nap.phone`) and `content/careers.ts` (exporting `GENDER`/`POSITION` const tuples), and the page shells `app/contact/page.tsx`, `app/membership/page.tsx`, `app/careers/page.tsx`, `components/layout/Footer.tsx` all rendering. We add the forms backend (slice B, Build-Order step 7) end-to-end: zod schemas → rate limit → email → route handler → UI primitives → wired forms.
>
> **No package installs in this chunk.** Per the plan-wide dependency rule, all deps are pinned ONCE in Chunk 1's `package.json` and installed once with `npm install`. The packages this chunk relies on are already present from Chunk 1: `zod@^3.24.1`, `resend@^4.5.1`, `@upstash/ratelimit@^2`, `@upstash/redis@^1`. **Do not run `npm i <pkg>` here.** The code below is written against the **zod v3** API and the **resend v4** API (`replyTo` camelCase; `send()` does NOT accept an `AbortSignal` — timeout is a `Promise.race`).
>
> - [ ] **Task 0: Verify prereq deps + env keys are present (no install)**
>   - Files: read-only check of `package.json`; modify `.env.example` only if a key is missing.
>   - Run: `npm ls zod resend @upstash/ratelimit @upstash/redis`
>   - Expected: resolved versions print with no `UNMET` / `missing` lines, and `zod@3.x` + `resend@4.x` (NOT zod 4 / resend 6). If anything is missing or on the wrong major, STOP and fix Chunk 1's `package.json` + re-run `npm install` — do not `npm i` here.
>   - Confirm `.env.example` contains the keys this chunk uses (Chunk 1 should already have added them); if any are absent, add:
>     ```
>     RESEND_API_KEY=
>     UPSTASH_REDIS_REST_URL=
>     UPSTASH_REDIS_REST_TOKEN=
>     ```
>   - Commit (only if `.env.example` changed): `chore(forms): document RESEND/UPSTASH env keys in .env.example`

Uses the `@superpowers:test-driven-development` workflow for every lib/route task (write failing test → run red → implement → run green → commit). The final wired-form smoke check uses the authoritative `@playwright/test` spec (run via `npm run test:a11y`'s Playwright runner / `npx playwright test`); the `webapp-testing` Playwright-Python helper is an optional alternative.

> **`content/careers.ts` ownership (definitive):** `content/careers.ts` is a **hard prerequisite owned by Chunk 2** (it exports the `GENDER`/`POSITION` const tuples and the careers copy). This chunk does **not** create or re-define it. Task 1 adds a guard test that asserts the exact tuple contents so a mismatch from Chunk 2 fails loudly instead of being silently re-defined. The canonical tuples (verified against the legacy `src/Careers.jsx`: gender `male/female/other/noanswer`, position typo `Group Instuctor`, `overEighteen` yes/no) are:
> ```ts
> // content/careers.ts (OWNED BY CHUNK 2 — shown here for reference only; do NOT recreate)
> export const GENDER = ['Male', 'Female', 'Non-Binary', 'Prefer Not To Answer'] as const;
> export const POSITION = ['Front Desk', 'Child Care Provider', 'Personal Trainer', 'Group Instructor'] as const; // typo fixed
> ```

---

### Task 1: zod discriminated union — `contact` member + careers-tuple guard (RED)

Write the schema test for the simplest member first, plus a guard locking the careers tuples; let it fail because `lib/schemas.ts` does not yet exist. **Put all imports at the top of the file** (avoid `import/first` lint failures from mid-file imports).

Files:
- Create `lib/__tests__/schemas.test.ts` (Test)
- (impl created Task 3)

- [ ] Write the failing `contact` tests + careers-tuple guard:

```ts
// lib/__tests__/schemas.test.ts
import { describe, it, expect } from 'vitest';
import { parseBody } from '@/lib/schemas';
import { GENDER, POSITION } from '@/content/careers';

describe('content/careers tuples (prereq guard — owned by Chunk 2)', () => {
  it('GENDER is the canonical tuple (legacy male/female/other/noanswer replaced)', () => {
    expect([...GENDER]).toEqual(['Male', 'Female', 'Non-Binary', 'Prefer Not To Answer']);
  });
  it('POSITION is the canonical tuple with the "Group Instructor" typo fixed', () => {
    expect([...POSITION]).toEqual([
      'Front Desk',
      'Child Care Provider',
      'Personal Trainer',
      'Group Instructor',
    ]);
  });
});

describe('parseBody — contact', () => {
  it('parses a valid full contact body', () => {
    const r = parseBody({
      formType: 'contact',
      name: 'Rachel Berrier',
      email: 'rachel@example.com',
      phone: '(505) 808-9499',
      message: 'Hi, I want to join.',
    });
    expect(r.ok).toBe(true);
    if (r.ok && r.data.formType === 'contact') {
      expect(r.data.name).toBe('Rachel Berrier');
      expect(r.data.email).toBe('rachel@example.com');
      expect(r.data.phone).toBe('(505) 808-9499');
      expect(r.data.message).toBe('Hi, I want to join.');
    }
  });

  it('parses a contact body with phone/message omitted (lead CTA shape)', () => {
    const r = parseBody({ formType: 'contact', name: 'Lead', email: 'lead@example.com' });
    expect(r.ok).toBe(true);
    if (r.ok && r.data.formType === 'contact') {
      expect(r.data.phone).toBeUndefined();
      expect(r.data.message).toBeUndefined();
    }
  });

  it('errors with field-keyed messages when name+email missing', () => {
    const r = parseBody({ formType: 'contact' });
    expect(r.ok).toBe(false);
    if (!r.ok && r.kind === 'fields') {
      expect(Object.keys(r.errors).sort()).toEqual(['email', 'name']);
      expect(r.errors.name).toBe('Name is required');
      expect(r.errors.email).toBe('Email is required');
    }
  });

  it('errors on a malformed email with the exact friendly message', () => {
    const r = parseBody({ formType: 'contact', name: 'X', email: 'not-an-email' });
    expect(r.ok).toBe(false);
    if (!r.ok && r.kind === 'fields') expect(r.errors.email).toBe('Enter a valid email');
  });
});
```

- [ ] Run (expect RED — module missing):
  - `npx vitest run lib/__tests__/schemas.test.ts`
  - Expected: `Error: Failed to load url @/lib/schemas` / `Cannot find module` → suite fails to import. (Confirms test is wired and impl is absent. The careers-tuple guard imports `@/content/careers` which DOES exist, but the whole file fails to load because of the missing `@/lib/schemas` import.)
- [ ] Commit: `test(schemas): failing contact-member tests + careers-tuple guard`

---

### Task 2: extend the test for `careers` + `newsletter` + honeypot + unknown formType, with exact-message assertions (RED stays red)

Files:
- Modify `lib/__tests__/schemas.test.ts` (Test)

- [ ] Append the remaining describe blocks **below the existing blocks** (the `GENDER`/`POSITION` import already lives at the top of the file from Task 1 — do NOT add a second mid-file import):

```ts
// lib/__tests__/schemas.test.ts  (append below the existing blocks; reuse the top-of-file GENDER/POSITION import)

describe('parseBody — careers', () => {
  const base = {
    formType: 'careers' as const,
    name: 'Katie Smith',
    email: 'katie@example.com',
    phone: '5058089499',
    address: '2801 Eubank Blvd NE, Suite P, Albuquerque, NM 87112',
    education: 'BS Kinesiology',
    experience: '5 years personal training',
    overEighteen: 'yes',
    gender: 'Female',
    position: 'Personal Trainer',
  };

  it('parses a valid careers body and coerces overEighteen yes→true', () => {
    const r = parseBody(base);
    expect(r.ok).toBe(true);
    if (r.ok && r.data.formType === 'careers') {
      expect(r.data.overEighteen).toBe(true);
      expect(r.data.gender).toBe('Female');
      expect(r.data.position).toBe('Personal Trainer');
    }
  });

  it('coerces overEighteen no→false', () => {
    const r = parseBody({ ...base, overEighteen: 'no' });
    expect(r.ok).toBe(true);
    if (r.ok && r.data.formType === 'careers') expect(r.data.overEighteen).toBe(false);
  });

  it('accepts every canonical gender + position literal', () => {
    for (const gender of GENDER)
      for (const position of POSITION)
        expect(parseBody({ ...base, gender, position }).ok).toBe(true);
  });

  it('rejects a legacy gender value (male) with the exact friendly message', () => {
    const r = parseBody({ ...base, gender: 'male' });
    expect(r.ok).toBe(false);
    if (!r.ok && r.kind === 'fields') expect(r.errors.gender).toBe('Select a gender');
  });

  it('rejects the legacy position typo "Group Instuctor" with the exact message', () => {
    const r = parseBody({ ...base, position: 'Group Instuctor' });
    expect(r.ok).toBe(false);
    if (!r.ok && r.kind === 'fields') expect(r.errors.position).toBe('Select a position');
  });

  it('rejects an unparseable overEighteen value with the exact message', () => {
    const r = parseBody({ ...base, overEighteen: 'maybe' });
    expect(r.ok).toBe(false);
    if (!r.ok && r.kind === 'fields') expect(r.errors.overEighteen).toBe('Select yes or no');
  });

  it('keys missing required careers fields by field name', () => {
    const r = parseBody({ formType: 'careers', name: 'X', email: 'x@x.com' });
    expect(r.ok).toBe(false);
    if (!r.ok && r.kind === 'fields') {
      for (const f of ['phone', 'address', 'education', 'experience', 'overEighteen', 'gender', 'position'])
        expect(r.errors[f], `expected error for ${f}`).toBeTruthy();
    }
  });
});

describe('parseBody — newsletter', () => {
  it('parses a valid newsletter body', () => {
    const r = parseBody({ formType: 'newsletter', email: 'sub@example.com' });
    expect(r.ok).toBe(true);
    if (r.ok && r.data.formType === 'newsletter') expect(r.data.email).toBe('sub@example.com');
  });

  it('errors (email-keyed) on missing email', () => {
    const r = parseBody({ formType: 'newsletter' });
    expect(r.ok).toBe(false);
    if (!r.ok && r.kind === 'fields') expect(r.errors.email).toBe('Email is required');
  });
});

describe('parseBody — honeypot & invalid_request', () => {
  it('flags a filled honeypot as a bot (kind=bot), regardless of formType', () => {
    const r = parseBody({ formType: 'contact', name: 'B', email: 'b@b.com', company: 'Acme Corp' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe('bot');
  });

  it('treats empty-string company as a legit submission (not a bot)', () => {
    const r = parseBody({ formType: 'newsletter', email: 'ok@ok.com', company: '' });
    expect(r.ok).toBe(true);
  });

  it('returns invalid_request for an unknown formType', () => {
    const r = parseBody({ formType: 'pizza', email: 'x@x.com' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe('invalid_request');
  });

  it('returns invalid_request for a missing formType', () => {
    const r = parseBody({ email: 'x@x.com' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe('invalid_request');
  });

  it('returns invalid_request for a non-object body', () => {
    const r = parseBody(null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe('invalid_request');
  });
});
```

- [ ] Run (still RED): `npx vitest run lib/__tests__/schemas.test.ts`
  - Expected: import failure (`@/lib/schemas` not resolvable) → suite red.
- [ ] Commit: `test(schemas): add careers/newsletter/honeypot cases with exact-message assertions`

> **Note on honeypot precedence:** the honeypot is checked **before** field validation so a bot that fills `company` but leaves required fields blank still returns `kind: 'bot'` (route → silent 200), never leaking field errors. Tests above encode that ordering.
>
> **Note on exact-message assertions:** gender/position/overEighteen/email/name errors assert the EXACT friendly text (not just `toBeTruthy()`). This locks the zod v3 message-customization API (`z.enum(..., { errorMap })`, `z.boolean({ required_error, invalid_type_error })`) so a regression to default messages fails the suite loudly.

---

### Task 3: implement `lib/schemas.ts` (GREEN) — zod v3 API

Files:
- Create `lib/schemas.ts` (Impl)

- [ ] Implement the discriminated union, honeypot pre-check, and the `parseBody` adapter returning a tagged result with **first-issue-per-field** error maps. **Uses the zod v3 API** (`.email()`, `z.enum([...], { errorMap })`, `z.boolean({ required_error, invalid_type_error })`, `z.preprocess(...)` for the yes/no→boolean coercion) — matches the pinned `zod@^3.24.1` from Chunk 1:

```ts
// lib/schemas.ts
import { z } from 'zod';
import { GENDER, POSITION } from '@/content/careers';

/** Honeypot: a real human leaves this empty. Optional + must be '' to pass the field schema;
 *  a non-empty value is caught earlier by parseBody and reported as kind:'bot'. */
const honeypot = z.literal('').optional();

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email');
const required = (label: string) => z.string().trim().min(1, `${label} is required`);

/** 'yes' | 'no' (form select) → boolean. Anything else fails with a field error.
 *  zod v3 boolean message customization via required_error / invalid_type_error. */
const overEighteen = z.preprocess((v) => {
  if (v === 'yes' || v === true) return true;
  if (v === 'no' || v === false) return false;
  return v; // leave as-is so z.boolean() raises a field error
}, z.boolean({ required_error: 'Select yes or no', invalid_type_error: 'Select yes or no' }));

const contactSchema = z.object({
  formType: z.literal('contact'),
  name: required('Name'),
  email,
  phone: z.string().trim().optional(),
  message: z.string().trim().optional(),
  company: honeypot,
});

const careersSchema = z.object({
  formType: z.literal('careers'),
  name: required('Name'),
  email,
  phone: required('Phone'),
  address: required('Address'),
  education: required('Education'),
  experience: required('Experience'),
  overEighteen,
  gender: z.enum(GENDER, { errorMap: () => ({ message: 'Select a gender' }) }),
  position: z.enum(POSITION, { errorMap: () => ({ message: 'Select a position' }) }),
  company: honeypot,
});

const newsletterSchema = z.object({
  formType: z.literal('newsletter'),
  email,
  company: honeypot,
});

export const bodySchema = z.discriminatedUnion('formType', [
  contactSchema,
  careersSchema,
  newsletterSchema,
]);

export type ContactBody = z.infer<typeof bodySchema>;
export type FormType = ContactBody['formType'];

export type ParseResult =
  | { ok: true; data: ContactBody }
  | { ok: false; kind: 'bot' }
  | { ok: false; kind: 'invalid_request' }
  | { ok: false; kind: 'fields'; errors: Record<string, string> };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** First zod issue per top-level field path → { field: message }. */
function firstIssuePerField(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? '_');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

export function parseBody(body: unknown): ParseResult {
  if (!isRecord(body)) return { ok: false, kind: 'invalid_request' };

  // Unknown/missing discriminant → invalid_request (not a field error).
  const ft = body.formType;
  if (ft !== 'contact' && ft !== 'careers' && ft !== 'newsletter') {
    return { ok: false, kind: 'invalid_request' };
  }

  // Honeypot is checked BEFORE field validation: a bot that fills `company`
  // is flagged even if other fields are missing (route → silent 200).
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return { ok: false, kind: 'bot' };
  }

  const parsed = bodySchema.safeParse(body);
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, kind: 'fields', errors: firstIssuePerField(parsed.error) };
}
```

- [ ] Run (expect GREEN): `npx vitest run lib/__tests__/schemas.test.ts`
  - Expected: `Test Files  1 passed (1)` / all `parseBody` + careers-tuple-guard cases green, including the exact-message assertions for gender/position/overEighteen/email/name.
- [ ] Commit: `feat(schemas): zod v3 discriminated union + parseBody (honeypot, exact field errors)`

---

### Task 4: `lib/rateLimit.ts` — fail-loud prod init + IP helper (RED)

Files:
- Create `lib/__tests__/rateLimit.test.ts` (Test)
- (impl Task 5)

- [ ] Write tests for the IP extractor and the prod fail-loud guard (the limiter itself is exercised via the route tests in Task 8 with a mock):

```ts
// lib/__tests__/rateLimit.test.ts
import { describe, it, expect, afterEach, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('clientIp', () => {
  it('takes the first hop of x-forwarded-for', async () => {
    const { clientIp } = await import('@/lib/rateLimit');
    const req = new Request('https://x', {
      headers: { 'x-forwarded-for': '203.0.113.7, 70.41.3.18, 150.172.238.178' },
    });
    expect(clientIp(req)).toBe('203.0.113.7');
  });

  it('trims whitespace around the first hop', async () => {
    const { clientIp } = await import('@/lib/rateLimit');
    const req = new Request('https://x', { headers: { 'x-forwarded-for': '  198.51.100.4 ,10.0.0.1' } });
    expect(clientIp(req)).toBe('198.51.100.4');
  });

  it('falls back to a shared key when the header is absent', async () => {
    const { clientIp } = await import('@/lib/rateLimit');
    expect(clientIp(new Request('https://x'))).toBe('shared');
  });
});

describe('getLimiter — prod fail-loud', () => {
  it('throws when NODE_ENV=production and Upstash env is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    const { getLimiter } = await import('@/lib/rateLimit');
    expect(() => getLimiter()).toThrowError(/Upstash/i);
  });

  it('returns a no-op limiter (allows) in dev when env is missing', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { getLimiter } = await import('@/lib/rateLimit');
    const limiter = getLimiter();
    const res = await limiter.limit('test-key');
    expect(res.success).toBe(true);
    expect(warn).toHaveBeenCalled();
  });
});
```

- [ ] Run (RED): `npx vitest run lib/__tests__/rateLimit.test.ts`
  - Expected: `Cannot find module '@/lib/rateLimit'` → red.
- [ ] Commit: `test(rateLimit): failing clientIp + prod fail-loud tests`

---

### Task 5: implement `lib/rateLimit.ts` (GREEN)

Files:
- Create `lib/rateLimit.ts` (Impl)

- [ ] Implement IP extraction, the prod-required Upstash limiter (sliding window), and a dev no-op fallback. The limiter is cached per module so each serverless invocation reuses one Redis client. Uses the pinned `@upstash/ratelimit@^2` + `@upstash/redis@^1` APIs from Chunk 1 (`slidingWindow`/`prefix`/`analytics`):

```ts
// lib/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/** Minimal shape the route depends on — lets us return a no-op limiter in dev. */
export interface Limiter {
  limit(key: string): Promise<{ success: boolean }>;
}

/** First hop of x-forwarded-for (Vercel sets this); 'shared' when absent. */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'shared';
}

let cached: Limiter | null = null;

export function getLimiter(): Limiter {
  if (cached) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasEnv = Boolean(url && token);

  if (!hasEnv) {
    if (process.env.NODE_ENV === 'production') {
      // Fail loud: durable rate limiting is a production launch gate (§13.4).
      throw new Error(
        'Upstash Redis is required in production: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
      );
    }
    console.warn(
      '[rateLimit] Upstash env missing — degrading to honeypot-only (dev). Rate limiting is DISABLED.',
    );
    cached = { async limit() { return { success: true }; } };
    return cached;
  }

  const redis = new Redis({ url: url!, token: token! });
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 submissions / IP+formType / minute
    prefix: 'peaches:contact',
    analytics: false,
  });

  cached = {
    async limit(key: string) {
      const { success } = await ratelimit.limit(key);
      return { success };
    },
  };
  return cached;
}

/** Test seam: reset the cached limiter between cases. */
export function __resetLimiterForTests() {
  cached = null;
}
```

> The test file imports lazily (`await import`) after `vi.stubEnv` + `vi.resetModules()`, so the module-level cache resets between cases without needing `__resetLimiterForTests` there; the export exists for the route tests in Task 8.

- [ ] Run (GREEN): `npx vitest run lib/__tests__/rateLimit.test.ts`
  - Expected: `Tests  5 passed` (clientIp×3, prod-throw, dev-noop).
- [ ] Commit: `feat(rateLimit): Upstash limiter (prod fail-loud) + clientIp first-hop`

---

### Task 6: `lib/email.ts` — Resend sender with per-formType subject/replyTo + Promise.race timeout (RED)

Files:
- Create `lib/__tests__/email.test.ts` (Test)
- (impl Task 7)

- [ ] Test the subject/`replyTo` mapping and the timeout→failure path by mocking the `resend` module. **Note:** asserts `arg.replyTo` (camelCase — resend v4 SDK; `reply_to` was removed). The timeout test drives a REAL race: the mocked `send` hangs (never resolves), and the impl's independent timer must reject it within `timeoutMs` so `sendFormEmail` resolves `false` — this reflects production regardless of whether the SDK honors a signal:

```ts
// lib/__tests__/email.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })),
}));

beforeEach(() => {
  sendMock.mockReset();
  vi.stubEnv('RESEND_API_KEY', 're_test_key');
});

describe('sendFormEmail', () => {
  it('sends a contact email with the contact subject + replyTo = submitter', async () => {
    sendMock.mockResolvedValue({ data: { id: 'eml_1' }, error: null });
    const { sendFormEmail } = await import('@/lib/email');
    const ok = await sendFormEmail({
      formType: 'contact', name: 'Rachel', email: 'rachel@example.com',
      phone: '5058089499', message: 'Hi',
    });
    expect(ok).toBe(true);
    const arg = sendMock.mock.calls[0][0];
    expect(arg.subject).toMatch(/contact/i);
    expect(arg.replyTo).toBe('rachel@example.com');
    expect(arg.to).toBe('peachesfitnessclub@gmail.com');
    expect(arg.html).toContain('rachel@example.com');
  });

  it('uses the careers subject for a careers submission', async () => {
    sendMock.mockResolvedValue({ data: { id: 'eml_2' }, error: null });
    const { sendFormEmail } = await import('@/lib/email');
    await sendFormEmail({
      formType: 'careers', name: 'Katie', email: 'katie@example.com', phone: '505',
      address: 'A', education: 'B', experience: 'C', overEighteen: true,
      gender: 'Female', position: 'Personal Trainer',
    });
    expect(sendMock.mock.calls[0][0].subject).toMatch(/career|application/i);
  });

  it('uses the newsletter subject + replyTo = subscriber', async () => {
    sendMock.mockResolvedValue({ data: { id: 'eml_3' }, error: null });
    const { sendFormEmail } = await import('@/lib/email');
    await sendFormEmail({ formType: 'newsletter', email: 'sub@example.com' });
    const arg = sendMock.mock.calls[0][0];
    expect(arg.subject).toMatch(/newsletter|subscri/i);
    expect(arg.replyTo).toBe('sub@example.com');
  });

  it('returns false when Resend responds with an error object', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'bad' } });
    const { sendFormEmail } = await import('@/lib/email');
    expect(await sendFormEmail({ formType: 'newsletter', email: 's@s.com' })).toBe(false);
  });

  it('returns false when the send throws (network)', async () => {
    sendMock.mockRejectedValue(new Error('network down'));
    const { sendFormEmail } = await import('@/lib/email');
    expect(await sendFormEmail({ formType: 'newsletter', email: 's@s.com' })).toBe(false);
  });

  it('returns false when the send exceeds the timeout (race wins, SDK never resolves)', async () => {
    // Hang forever — the impl's independent timer must reject the race.
    sendMock.mockImplementation(() => new Promise(() => {}));
    const { sendFormEmail } = await import('@/lib/email');
    // Short timeout so the test is fast.
    expect(await sendFormEmail({ formType: 'newsletter', email: 's@s.com' }, 20)).toBe(false);
  });
});
```

- [ ] Run (RED): `npx vitest run lib/__tests__/email.test.ts`
  - Expected: `Cannot find module '@/lib/email'` → red.
- [ ] Commit: `test(email): failing Resend sender tests (subjects, replyTo, race timeout)`

---

### Task 7: implement `lib/email.ts` (GREEN) — resend v4 API + Promise.race timeout

Files:
- Create `lib/email.ts` (Impl)

- [ ] Implement the sender: per-`formType` subject, `replyTo` = submitter (**camelCase — resend v4; `reply_to` was removed in v4**), plain HTML body, and a **`Promise.race` timeout** so a slow Resend call resolves to `false` (route maps to `502 send_failed`) rather than hanging into a platform 504. The resend v4 `send()` does NOT accept an `AbortSignal`, so the timeout is implemented independently of the SDK:

```ts
// lib/email.ts
import { Resend } from 'resend';
import type { ContactBody } from '@/lib/schemas';

const TO = 'peachesfitnessclub@gmail.com';
const FROM = 'Peaches Fitness Club <onboarding@resend.dev>'; // TODO: verified domain before launch
const DEFAULT_TIMEOUT_MS = 8000;

function subjectFor(b: ContactBody): string {
  switch (b.formType) {
    case 'contact':
      return `New contact inquiry — ${b.name}`;
    case 'careers':
      return `New career application — ${b.name} (${b.position})`;
    case 'newsletter':
      return `New newsletter signup — ${b.email}`;
  }
}

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function bodyHtml(b: ContactBody): string {
  const rows: [string, unknown][] = [];
  if (b.formType === 'contact') {
    rows.push(['Name', b.name], ['Email', b.email], ['Phone', b.phone || '—'], ['Message', b.message || '—']);
  } else if (b.formType === 'careers') {
    rows.push(
      ['Name', b.name], ['Email', b.email], ['Phone', b.phone], ['Address', b.address],
      ['Education', b.education], ['Experience', b.experience],
      ['Over 18', b.overEighteen ? 'Yes' : 'No'], ['Gender', b.gender], ['Position', b.position],
    );
  } else {
    rows.push(['Email', b.email]);
  }
  const cells = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;font-weight:600;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('');
  return `<table style="font-family:Arial,sans-serif;font-size:14px;color:#2B2622">${cells}</table>`;
}

/**
 * Returns true on a confirmed send, false on any error/timeout.
 * `timeoutMs` is overridable for tests. The timeout is a Promise.race against an
 * independent timer because the resend v4 SDK send() does NOT accept an AbortSignal.
 */
export async function sendFormEmail(b: ContactBody, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[email] RESEND_API_KEY missing');
    return false;
  }
  const resend = new Resend(apiKey);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('email send timed out')), timeoutMs);
  });

  try {
    const sendPromise = resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: b.email, // resend v4: camelCase
      subject: subjectFor(b),
      html: bodyHtml(b),
    });
    const { error } = await Promise.race([sendPromise, timeout]);
    if (error) {
      console.error('[email] Resend error', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] send failed/timed out', err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
```

> No SDK casts are needed: `replyTo` is the documented resend v4 `CreateEmailOptions` field, and the timeout never touches the SDK options bag (it's a `Promise.race`), so `npx tsc --noEmit` passes clean. If the installed resend types ever shift `send()`'s resolved shape, keep the `{ error }` destructure aligned with the real SDK and the test mock.

- [ ] Run (GREEN): `npx vitest run lib/__tests__/email.test.ts`
  - Expected: `Tests  6 passed` (3 subject/replyTo, error-object, throw, race-timeout). The timeout test completes in ~20ms because the race rejects independently of the hanging `send`.
- [ ] Commit: `feat(email): Resend v4 sender (per-formType subject, replyTo, Promise.race timeout)`

---

### Task 8: `app/api/contact/route.ts` — full pipeline with every response branch (RED)

Files:
- Create `app/api/__tests__/contact.route.test.ts` (Test)
- (impl Task 9)

- [ ] Test the route POST handler against the exact §10 response contract, mocking the limiter and email seams (schemas run for real):

```ts
// app/api/__tests__/contact.route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const limitMock = vi.fn();
const sendMock = vi.fn();

vi.mock('@/lib/rateLimit', async () => {
  const actual = await vi.importActual<typeof import('@/lib/rateLimit')>('@/lib/rateLimit');
  return { ...actual, getLimiter: () => ({ limit: limitMock }) };
});
vi.mock('@/lib/email', () => ({ sendFormEmail: sendMock }));

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://peaches.test/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.7', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  limitMock.mockReset().mockResolvedValue({ success: true });
  sendMock.mockReset().mockResolvedValue(true);
});

const valid = { formType: 'contact', name: 'Rachel', email: 'rachel@example.com' };

describe('POST /api/contact', () => {
  it('200 {ok:true} on a valid send', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const res = await POST(post(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sendMock).toHaveBeenCalledOnce();
  });

  it('400 {ok:false,errors} keyed by zod field on missing required', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const res = await POST(post({ formType: 'contact' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(Object.keys(json.errors).sort()).toEqual(['email', 'name']);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('400 {ok:false,error:"invalid_request"} on unknown formType', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const res = await POST(post({ formType: 'pizza', email: 'x@x.com' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_request' });
  });

  it('400 invalid_request on non-JSON body', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const res = await POST(post('this is not json{'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_request' });
  });

  it('200 {ok:true} silently (no send) when honeypot company is filled', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const res = await POST(post({ ...valid, company: 'Acme' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sendMock).not.toHaveBeenCalled();
    expect(limitMock).not.toHaveBeenCalled(); // short-circuits before rate limit
  });

  it('429 {ok:false,error:"rate_limited"} when limiter denies', async () => {
    limitMock.mockResolvedValue({ success: false });
    const { POST } = await import('@/app/api/contact/route');
    const res = await POST(post(valid));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: 'rate_limited' });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('502 {ok:false,error:"send_failed"} when email send returns false', async () => {
    sendMock.mockResolvedValue(false);
    const { POST } = await import('@/app/api/contact/route');
    const res = await POST(post(valid));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'send_failed' });
  });

  it('rate-limits per IP + formType (key includes both)', async () => {
    const { POST } = await import('@/app/api/contact/route');
    await POST(post(valid, { 'x-forwarded-for': '198.51.100.9, 10.0.0.1' }));
    expect(limitMock).toHaveBeenCalledWith(expect.stringContaining('198.51.100.9'));
    expect(limitMock).toHaveBeenCalledWith(expect.stringContaining('contact'));
  });
});
```

- [ ] Run (RED): `npx vitest run app/api/__tests__/contact.route.test.ts`
  - Expected: `Cannot find module '@/app/api/contact/route'` → red.
- [ ] Commit: `test(api): failing /api/contact pipeline + response-contract tests`

---

### Task 9: implement `app/api/contact/route.ts` (GREEN)

Files:
- Create `app/api/contact/route.ts` (Impl)

- [ ] Implement the ordered pipeline `parse → honeypot(silent 200) → rateLimit(ip+formType) → sendEmail`, returning the exact §10 contract. Set `runtime`/`maxDuration` so the email's `Promise.race` timeout (8s) fires before Vercel's function ceiling:

```ts
// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { parseBody } from '@/lib/schemas';
import { getLimiter, clientIp } from '@/lib/rateLimit';
import { sendFormEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 15; // > email Promise.race timeout (8s) so 502 wins over a platform 504

export async function POST(req: Request) {
  // 1) Body
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
  }

  // 2) Parse + honeypot (parseBody checks honeypot before field validation)
  const parsed = parseBody(raw);
  if (!parsed.ok) {
    if (parsed.kind === 'bot') {
      // Silent success — don't tip off bots, don't send, don't rate-limit.
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    if (parsed.kind === 'invalid_request') {
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, errors: parsed.errors }, { status: 400 });
  }

  // 3) Rate limit — key = IP + formType (durable via Upstash; prod fail-loud at init)
  const key = `${clientIp(req)}:${parsed.data.formType}`;
  const { success } = await getLimiter().limit(key);
  if (!success) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  // 4) Send
  const sent = await sendFormEmail(parsed.data);
  if (!sent) {
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
```

- [ ] Run (GREEN): `npx vitest run app/api/__tests__/contact.route.test.ts`
  - Expected: `Tests  8 passed` (200, 400-fields, 400-invalid×2, honeypot-200, 429, 502, key-per-ip+formType).
- [ ] Run the whole backend suite green together:
  - `npx vitest run lib app/api`
  - Expected: `Test Files  4 passed (4)` / all tests passed.
- [ ] Commit: `feat(api): /api/contact discriminated-union pipeline with full response contract`

---

### Task 10: UI form primitives — `Field`, `Input`, `Textarea`, `Select`, `FormStatus`

Pure-visual leaf components: build-then-verify (no fake unit tests). `FormStatus` covers every Appendix B state.

Files:
- Create `components/ui/Field.tsx`, `components/ui/Input.tsx`, `components/ui/Textarea.tsx`, `components/ui/Select.tsx`, `components/ui/FormStatus.tsx`

- [ ] `Field.tsx` — label + per-field error wrapper (server-safe; no client directive needed):

```tsx
// components/ui/Field.tsx
import type { ReactNode } from 'react';

export function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-[family-name:var(--font-sans)] text-sm font-medium text-[var(--charcoal)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--coral-deep)]" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-[var(--coral-deep)]">
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] `Input.tsx`:

```tsx
// components/ui/Input.tsx
import type { InputHTMLAttributes } from 'react';

export function Input({
  invalid,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={`rounded-lg border bg-white px-3.5 py-2.5 font-[family-name:var(--font-sans)] text-base text-[var(--charcoal)] shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--coral-deep)] ${
        invalid ? 'border-[var(--coral-deep)]' : 'border-black/10'
      } ${className}`}
      {...props}
    />
  );
}
```

- [ ] `Textarea.tsx`:

```tsx
// components/ui/Textarea.tsx
import type { TextareaHTMLAttributes } from 'react';

export function Textarea({
  invalid,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      rows={5}
      className={`rounded-lg border bg-white px-3.5 py-2.5 font-[family-name:var(--font-sans)] text-base text-[var(--charcoal)] shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--coral-deep)] ${
        invalid ? 'border-[var(--coral-deep)]' : 'border-black/10'
      } ${className}`}
      {...props}
    />
  );
}
```

- [ ] `Select.tsx`:

```tsx
// components/ui/Select.tsx
import type { SelectHTMLAttributes } from 'react';

export function Select({
  invalid,
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={`rounded-lg border bg-white px-3.5 py-2.5 font-[family-name:var(--font-sans)] text-base text-[var(--charcoal)] shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--coral-deep)] ${
        invalid ? 'border-[var(--coral-deep)]' : 'border-black/10'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
```

- [ ] `FormStatus.tsx` — renders all Appendix B states (idle/submitting/success/error variants). Plain presentational component (parent passes a `status` discriminator). NAP phone/email is single-sourced from `content/site.ts` for the send-failed message:

```tsx
// components/ui/FormStatus.tsx
import { site } from '@/content/site';

export type FormStatusKind =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'rate_limited'
  | 'send_failed'
  | 'invalid_request';

const MESSAGES: Record<Exclude<FormStatusKind, 'idle' | 'submitting'>, { text: string; tone: 'ok' | 'err' }> = {
  success: { text: 'Thanks — we got your message and will be in touch soon.', tone: 'ok' },
  rate_limited: { text: 'Too many attempts, try again shortly.', tone: 'err' },
  send_failed: { text: '', tone: 'err' }, // built below to interpolate NAP
  invalid_request: { text: 'Something went wrong with that request. Please try again.', tone: 'err' },
};

export function FormStatus({ status }: { status: FormStatusKind }) {
  if (status === 'idle' || status === 'submitting') return null;
  const base = MESSAGES[status];
  const text =
    status === 'send_failed'
      ? `Couldn't send — please call ${site.nap.phone} or email ${site.nap.email}.`
      : base.text;
  return (
    <p
      role={base.tone === 'err' ? 'alert' : 'status'}
      className={`mt-1 rounded-lg px-3.5 py-2.5 text-sm ${
        base.tone === 'ok'
          ? 'bg-[var(--peach)] text-[var(--charcoal)]'
          : 'bg-[var(--peach)] text-[var(--coral-deep)]'
      }`}
    >
      {text}
    </p>
  );
}
```

- [ ] Verify the primitives type-check (no client directive on these — they're server-safe and consumed by client forms):
  - `npx tsc --noEmit`
  - Expected: exit 0, no errors referencing `components/ui/Field|Input|Textarea|Select|FormStatus`.
- [ ] Commit: `feat(ui): Field/Input/Textarea/Select/FormStatus primitives (Appendix B states)`

---

### Task 11: `components/forms/ContactForm.tsx` (client) — bare zod names, honeypot, per-field errors

Files:
- Create `components/forms/ContactForm.tsx`

- [ ] Client form posting to `/api/contact` with `formType: 'contact'`, bare field names (`name`/`email`/`phone`/`message` — NOT `user_*`), honeypot `company`, optional `message` (omitted in the membership lead variant via the `withMessage` prop), and per-field + status rendering wired to the response contract:

```tsx
// components/forms/ContactForm.tsx
'use client';

import { useState } from 'react';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormStatus, type FormStatusKind } from '@/components/ui/FormStatus';

type Errors = Record<string, string>;

export function ContactForm({ withMessage = true }: { withMessage?: boolean }) {
  const [status, setStatus] = useState<FormStatusKind>('idle');
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setStatus('submitting');
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload: Record<string, string> = {
      formType: 'contact',
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      company: String(fd.get('company') ?? ''), // honeypot
    };
    if (withMessage) payload.message = String(fd.get('message') ?? '');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setStatus('success');
        form.reset();
        return;
      }
      if (res.status === 400 && json.errors) {
        setErrors(json.errors);
        setStatus('idle');
        return;
      }
      if (res.status === 400) setStatus('invalid_request');
      else if (res.status === 429) setStatus('rate_limited');
      else setStatus('send_failed');
    } catch {
      setStatus('send_failed');
    }
  }

  const busy = status === 'submitting';

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {/* Honeypot — visually hidden, must stay empty */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field id="contact-name" label="Name" required error={errors.name}>
        <Input id="contact-name" name="name" type="text" autoComplete="name" required invalid={!!errors.name} />
      </Field>
      <Field id="contact-email" label="Email" required error={errors.email}>
        <Input id="contact-email" name="email" type="email" autoComplete="email" required invalid={!!errors.email} />
      </Field>
      <Field id="contact-phone" label="Phone" error={errors.phone}>
        <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" invalid={!!errors.phone} />
      </Field>
      {withMessage && (
        <Field id="contact-message" label="Message" error={errors.message}>
          <Textarea id="contact-message" name="message" invalid={!!errors.message} />
        </Field>
      )}

      <Button type="submit" disabled={busy}>
        {busy ? 'Sending…' : 'Send message'}
      </Button>
      <FormStatus status={status} />
    </form>
  );
}
```

> The handler captures `e.currentTarget` into `form` before the first `await` — after an `await`, React may have nulled `currentTarget`, so `form.reset()` must use the captured reference.

- [ ] `npx tsc --noEmit` — Expected: no errors in `components/forms/ContactForm.tsx`.
- [ ] Commit: `feat(forms): ContactForm (bare zod names, honeypot, withMessage variant)`

---

### Task 12: `components/forms/CareersForm.tsx` (client) — canonical enums + yes/no select

Files:
- Create `components/forms/CareersForm.tsx`

- [ ] Client careers form. `<option value>` for gender/position === the canonical enum literals (typo fixed), `overEighteen` is a yes/no select emitting `'yes'|'no'` (coerced server-side), all names map 1:1 to zod fields, honeypot `company`:

```tsx
// components/forms/CareersForm.tsx
'use client';

import { useState } from 'react';
import { GENDER, POSITION } from '@/content/careers';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FormStatus, type FormStatusKind } from '@/components/ui/FormStatus';

type Errors = Record<string, string>;

export function CareersForm() {
  const [status, setStatus] = useState<FormStatusKind>('idle');
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setStatus('submitting');
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      formType: 'careers',
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      address: String(fd.get('address') ?? ''),
      education: String(fd.get('education') ?? ''),
      experience: String(fd.get('experience') ?? ''),
      overEighteen: String(fd.get('overEighteen') ?? ''), // 'yes' | 'no'
      gender: String(fd.get('gender') ?? ''),
      position: String(fd.get('position') ?? ''),
      company: String(fd.get('company') ?? ''), // honeypot
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setStatus('success');
        form.reset();
        return;
      }
      if (res.status === 400 && json.errors) {
        setErrors(json.errors);
        setStatus('idle');
        return;
      }
      if (res.status === 400) setStatus('invalid_request');
      else if (res.status === 429) setStatus('rate_limited');
      else setStatus('send_failed');
    } catch {
      setStatus('send_failed');
    }
  }

  const busy = status === 'submitting';

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="careers-company">Company</label>
        <input id="careers-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field id="careers-name" label="Name" required error={errors.name}>
        <Input id="careers-name" name="name" type="text" autoComplete="name" required invalid={!!errors.name} />
      </Field>
      <Field id="careers-email" label="Email" required error={errors.email}>
        <Input id="careers-email" name="email" type="email" autoComplete="email" required invalid={!!errors.email} />
      </Field>
      <Field id="careers-phone" label="Phone" required error={errors.phone}>
        <Input id="careers-phone" name="phone" type="tel" autoComplete="tel" required invalid={!!errors.phone} />
      </Field>
      <Field id="careers-address" label="Address" required error={errors.address}>
        <Input id="careers-address" name="address" type="text" autoComplete="street-address" required invalid={!!errors.address} />
      </Field>
      <Field id="careers-education" label="Education" required error={errors.education}>
        <Textarea id="careers-education" name="education" rows={3} required invalid={!!errors.education} />
      </Field>
      <Field id="careers-experience" label="Experience" required error={errors.experience}>
        <Textarea id="careers-experience" name="experience" required invalid={!!errors.experience} />
      </Field>

      <Field id="careers-overEighteen" label="Are you 18 or older?" required error={errors.overEighteen}>
        <Select id="careers-overEighteen" name="overEighteen" required defaultValue="" invalid={!!errors.overEighteen}>
          <option value="" disabled>Select…</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </Select>
      </Field>

      <Field id="careers-gender" label="Gender" required error={errors.gender}>
        <Select id="careers-gender" name="gender" required defaultValue="" invalid={!!errors.gender}>
          <option value="" disabled>Select…</option>
          {GENDER.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>
      </Field>

      <Field id="careers-position" label="Position" required error={errors.position}>
        <Select id="careers-position" name="position" required defaultValue="" invalid={!!errors.position}>
          <option value="" disabled>Select…</option>
          {POSITION.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </Field>

      <Button type="submit" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit application'}
      </Button>
      <FormStatus status={status} />
    </form>
  );
}
```

- [ ] `npx tsc --noEmit` — Expected: no errors; `value={g}`/`value={p}` are the canonical literals (parity with `lib/schemas.ts` and the Task 1 careers-tuple guard).
- [ ] Commit: `feat(forms): CareersForm with canonical gender/position enums + yes/no over-18`

---

### Task 13: `components/layout/NewsletterForm.tsx` (client) — Footer signup

Files:
- Create `components/layout/NewsletterForm.tsx`

- [ ] Compact newsletter form posting `{ formType:'newsletter', email, company }`; success → "You're subscribed", inline error otherwise (Appendix B newsletter states):

```tsx
// components/layout/NewsletterForm.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type State = 'idle' | 'submitting' | 'success' | 'error';

export function NewsletterForm() {
  const [state, setState] = useState<State>('idle');
  const [emailError, setEmailError] = useState<string>('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError('');
    setState('submitting');
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      formType: 'newsletter',
      email: String(fd.get('email') ?? ''),
      company: String(fd.get('company') ?? ''), // honeypot
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setState('success');
        form.reset();
        return;
      }
      if (res.status === 400 && json.errors?.email) setEmailError(json.errors.email);
      setState('error');
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <p role="status" className="text-sm text-[var(--charcoal)]">
        You&apos;re subscribed — thanks!
      </p>
    );
  }

  const busy = state === 'submitting';
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="nl-company">Company</label>
        <input id="nl-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label htmlFor="nl-email" className="sr-only">
        Email address
      </label>
      <div className="flex gap-2">
        <Input
          id="nl-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          invalid={!!emailError}
          className="flex-1"
        />
        <Button type="submit" disabled={busy}>
          {busy ? '…' : 'Subscribe'}
        </Button>
      </div>
      {state === 'error' && (
        <p role="alert" className="text-sm text-[var(--coral-deep)]">
          {emailError || 'Could not subscribe — please try again.'}
        </p>
      )}
    </form>
  );
}
```

- [ ] `npx tsc --noEmit` — Expected: no errors in `components/layout/NewsletterForm.tsx`.
- [ ] Commit: `feat(forms): Footer NewsletterForm (formType newsletter, inline states)`

---

### Task 14: Wire forms into pages + Footer

Files:
- Modify `app/contact/page.tsx` (add `<ContactForm />`)
- Modify `app/membership/page.tsx` (add `<ContactForm withMessage={false} />` to the lead CTA)
- Modify `app/careers/page.tsx` (add `<CareersForm />`)
- Modify `components/layout/Footer.tsx` (add `<NewsletterForm />`)

- [ ] In `app/contact/page.tsx`, import and render the full contact form inside the page's contact section (page stays a server component; the form is the client leaf):

```tsx
// app/contact/page.tsx — within the existing contact section markup
import { ContactForm } from '@/components/forms/ContactForm';
// ...
<ContactForm />
```

- [ ] In `app/membership/page.tsx`, render the lead CTA variant without a message field (matches the `name`/`email`/`phone?` lead set in §10):

```tsx
// app/membership/page.tsx — within the lead CTA block (above/below plan cards)
import { ContactForm } from '@/components/forms/ContactForm';
// ...
<ContactForm withMessage={false} />
```

- [ ] In `app/careers/page.tsx`:

```tsx
// app/careers/page.tsx — within the careers section
import { CareersForm } from '@/components/forms/CareersForm';
// ...
<CareersForm />
```

- [ ] In `components/layout/Footer.tsx`, render the newsletter form in the appropriate column:

```tsx
// components/layout/Footer.tsx
import { NewsletterForm } from '@/components/layout/NewsletterForm';
// ... within the footer's newsletter column:
<div className="flex flex-col gap-2">
  <h3 className="font-[family-name:var(--font-heading)] text-lg text-[var(--charcoal)]">
    Stay in the loop
  </h3>
  <NewsletterForm />
</div>
```

- [ ] Verify the full backend test suite still green after wiring (no regressions):
  - `npx vitest run lib app/api`
  - Expected: `Test Files  4 passed (4)`; all tests pass.
- [ ] Type-check the whole app:
  - `npx tsc --noEmit`
  - Expected: exit 0, no errors.
- [ ] Commit: `feat(forms): wire ContactForm (contact + membership lead), CareersForm, NewsletterForm`

---

### Task 15: End-to-end smoke of a wired form (authoritative Playwright spec)

Use an authoritative `@playwright/test` spec — Chunk 1 already created `playwright.config.ts` with `use.baseURL = 'http://localhost:3000'` and a `webServer` block (`npm run build && npm run start`, `reuseExistingServer: !process.env.CI`), so the spec needs **no manual server start/stop and no shell job control**. Stub the network at the `/api/contact` boundary via `page.route` so no real email/Upstash call is made. (The `webapp-testing` Playwright-Python helper is an optional alternative; this spec is the authoritative check.)

Files:
- Create `e2e/contact-form.spec.ts` (Test; runs via the Playwright runner — same one wired to `npm run test:a11y` in Chunk 1)

- [ ] Write the spec driving the contract states end-to-end against `/contact` (relative URLs resolve via `baseURL`; Playwright's `webServer` starts/stops the app):

```ts
// e2e/contact-form.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ContactForm — response-contract states', () => {
  test('success: 200 {ok:true} shows status text and clears the form', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }),
    );
    await page.goto('/contact');
    await page.fill('#contact-name', 'Rachel');
    await page.fill('#contact-email', 'rachel@example.com');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByRole('status')).toContainText(/we got your message/i);
    await expect(page.locator('#contact-name')).toHaveValue('');
  });

  test('field error: 400 {errors:{email}} shows inline alert + aria-invalid', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, errors: { email: 'Enter a valid email' } }),
      }),
    );
    await page.goto('/contact');
    await page.fill('#contact-name', 'Rachel');
    await page.fill('#contact-email', 'bad');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByRole('alert')).toContainText('Enter a valid email');
    await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('rate limited: 429 shows the rate-limit message', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'rate_limited' }),
      }),
    );
    await page.goto('/contact');
    await page.fill('#contact-name', 'Rachel');
    await page.fill('#contact-email', 'rachel@example.com');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByRole('alert')).toContainText(/too many attempts/i);
  });

  test('send failed: 502 shows the call/email fallback (NAP phone)', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'send_failed' }),
      }),
    );
    await page.goto('/contact');
    await page.fill('#contact-name', 'Rachel');
    await page.fill('#contact-email', 'rachel@example.com');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByRole('alert')).toContainText(/couldn't send/i);
  });

  test('honeypot field is present and off-screen', async ({ page }) => {
    await page.goto('/contact');
    const honeypot = page.locator('input[name="company"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
  });
});
```

- [ ] Run the spec (Playwright's `webServer` builds + starts + tears down the app automatically — no `&`/`kill`):
  - `npx playwright test e2e/contact-form.spec.ts`
  - Expected: all five tests pass; no real network call leaves the boundary (every `/api/contact` request is fulfilled by `page.route`).
- [ ] Commit: `test(forms): e2e Playwright smoke of ContactForm response-contract states`

---

**Chunk 3 done.** Backend pipeline (`lib/schemas.ts`, `lib/rateLimit.ts`, `lib/email.ts`, `app/api/contact/route.ts`) is TDD-verified against the exact §10 response contract (200/400-fields/400-invalid/429/502 + silent-200 honeypot) using the **zod v3** API (exact friendly field messages locked by assertions) and the **resend v4** API (`replyTo` camelCase + `Promise.race` timeout, no AbortSignal). All deps come from Chunk 1's pinned `package.json` (no in-chunk installs). `ContactForm` (contact + membership-lead variant), `CareersForm` (canonical enums guarded against the Chunk-2 tuples + boolean-coerced over-18), and footer `NewsletterForm` all POST bare zod field names with per-field error rendering and the full Appendix B `FormStatus` state set; the authoritative `@playwright/test` spec drives every contract state via Playwright's managed `webServer`. Next: Chunk 4 (slice C) — Glofox facade + Mapbox map with fallbacks.

---

## Chunk 4: Third-party integrations (Glofox iframe facade, Mapbox map with fallbacks)

> **Build-Order step 8 = slice C** (spec §14). This chunk assumes prior chunks delivered: `content/site.ts` (with `glofox.membershipsUrl`/`glofox.scheduleUrl`, `mapbox.styleUrl`/`zoom`/`pitch`, `nap.geo`), `content/types.ts` (Appendix A interfaces), `lib/nap.ts` (with `directionsUrl(nap)`), `lib/motion.ts` (`useReducedMotion` **and** the non-hook `prefersReducedMotion()` helper), the UI primitives (`Button`, `Container`, `Section`), the resized assets under `public/images/` (incl. `public/images/brand/logo3.png` map marker), a server-rendered `/classes` page (class-type content) and `/contact` page (form + hours), and — from **Chunk 1** — the pinned `package.json` (incl. `mapbox-gl@^3`), the installed `@playwright/test` toolchain, and `playwright.config.ts` (with `use.baseURL: 'http://localhost:3000'` + a `webServer` block). Here we add the two **leaf client** integration components and wire them in **below** the server-rendered content, with fallbacks, then verify with `@playwright/test`.
>
> These are pure-visual / browser-API components (iframe, IntersectionObserver, `mapbox-gl`), so they follow **BUILD-THEN-VERIFY**, not unit-test-first — except the one piece of pure logic (the static-map URL builder) which gets a real Vitest test. SEO-critical text already lives in the server-rendered page bodies from slice A2; nothing here is indexable, by design (spec §8: the Glofox iframe contributes zero indexable content).

---

### Task 1 — Confirm `mapbox-gl` is installed (pinned in Chunk 1), document env + launch-gate

> **No new `npm install` here.** Per the global dependency rule, every runtime dep is pinned **once** in Chunk 1's `package.json` (`mapbox-gl@^3`) and installed once with `npm install`. mapbox-gl v3 ships its **own bundled TypeScript types** (`types: dist/mapbox-gl.d.ts`), so we do **not** add `@types/mapbox-gl` (it uses the legacy `export =` form, doesn't track the installed version, and is dead weight under Chunk 1's `skipLibCheck: true`). This task only **verifies** the dep is present and documents the env/launch-gate.

- [ ] **Files**
  - Modify: `.env.example` (confirm `NEXT_PUBLIC_MAPBOX_API_KEY` present)
  - Modify: `README.md` (token-rotation + URL-restriction note)

- [ ] Verify the runtime dep resolved from Chunk 1's install (do NOT install it here):

```bash
npm ls mapbox-gl
```

Expected: a single resolved version (a `mapbox-gl@3.x` line under the project) with **no** `UNMET`/`missing` lines. If it is missing, the fix is to add `"mapbox-gl": "^3"` to **Chunk 1's** `package.json` and re-run `npm install` there — not to `npm i` it ad-hoc in this chunk.

- [ ] Confirm `.env.example` documents the key. It MUST contain exactly this line (add if missing — never commit a real value):

```bash
# Mapbox public token — exposed client-side. URL-RESTRICT to the prod domain.
# The token previously committed in repo git history (REACT_APP_MAPBOX_API_KEY) is
# PERMANENTLY COMPROMISED — rotate before launch (spec §13.3). Leave empty in dev to
# exercise the static-map fallback.
NEXT_PUBLIC_MAPBOX_API_KEY=
```

- [ ] Add a Mapbox section to `README.md` (under deploy/launch notes):

```md
### Mapbox (launch gate)

`NEXT_PUBLIC_MAPBOX_API_KEY` is a **public** token, exposed in the client bundle.

- **Rotate** the old token. The previous token is in committed git history
  (`.env` was tracked as `REACT_APP_MAPBOX_API_KEY`) and is permanently compromised.
  Never reuse it.
- **URL-restrict** the new token to the production domain in the Mapbox account
  (this is the durable mitigation for a public token).
- With **no key set**, `/contact` renders a static map image + "Get Directions"
  button (no network call) — this is the intended dev/fallback behaviour.
```

- [ ] Commit:

```bash
git add .env.example README.md
git commit -m "docs(map): document NEXT_PUBLIC_MAPBOX_API_KEY rotation gate + fallback"
```

Expected: clean commit.

---

### Task 2 — TDD: static-map URL builder in `lib/images.ts`

The fallback static map should not be a hand-pasted URL. We compute the Mapbox **Static Images API** URL from `nap.geo` + `mapbox` style/zoom — and crucially, the builder returns `null` when the key is absent so the component knows to fall back to a bundled brand image. This is pure logic → real test first (use the **superpowers:test-driven-development** skill).

- [ ] **Files**
  - Create test: `lib/__tests__/images.test.ts`
  - Modify: `lib/images.ts` (add `staticMapUrl`)

- [ ] Write the failing test:

```ts
// lib/__tests__/images.test.ts
import { describe, it, expect } from "vitest";
import { staticMapUrl } from "../images";

const geo = { lat: 35.115047, lng: -106.536046 };
const style = "mapbox://styles/peachesgym/clqea736d005p01of0tvtg9g8";

describe("staticMapUrl", () => {
  it("returns null when no token is provided (fallback to bundled image)", () => {
    expect(staticMapUrl({ token: "", geo, styleUrl: style, zoom: 14 })).toBeNull();
    expect(
      staticMapUrl({ token: undefined, geo, styleUrl: style, zoom: 14 }),
    ).toBeNull();
  });

  it("builds a Static Images API URL: username/styleid, lng,lat order, then zoom", () => {
    const url = staticMapUrl({
      token: "pk.test",
      geo,
      styleUrl: style,
      zoom: 14,
      width: 800,
      height: 500,
    });
    expect(url).toBe(
      "https://api.mapbox.com/styles/v1/peachesgym/clqea736d005p01of0tvtg9g8/static/" +
        "-106.536046,35.115047,14,0/800x500@2x?access_token=pk.test",
    );
  });

  it("defaults width/height when omitted", () => {
    const url = staticMapUrl({ token: "pk.test", geo, styleUrl: style, zoom: 14 })!;
    expect(url).toContain("/static/-106.536046,35.115047,14,0/1280x720@2x?");
  });

  it("returns null for an unparseable mapbox:// style", () => {
    expect(
      staticMapUrl({ token: "pk.test", geo, styleUrl: "not-a-style", zoom: 14 }),
    ).toBeNull();
  });
});
```

- [ ] Run it (expect FAIL — `staticMapUrl` does not exist):

```bash
npx vitest run lib/__tests__/images.test.ts
```

Expected: failure such as `Error: No "staticMapUrl" export is defined on the module` (or all 4 tests red).

- [ ] Implement. Append to `lib/images.ts`:

```ts
// lib/images.ts — append

export interface StaticMapArgs {
  token?: string;
  geo: { lat: number; lng: number };
  styleUrl: string; // mapbox://styles/<username>/<styleid>
  zoom: number;
  width?: number;
  height?: number;
}

/**
 * Build a Mapbox Static Images API URL for the no-WebGL / fallback path.
 * Returns null when the token is absent (caller falls back to a bundled brand
 * image) or when the style URL can't be parsed.
 */
export function staticMapUrl({
  token,
  geo,
  styleUrl,
  zoom,
  width = 1280,
  height = 720,
}: StaticMapArgs): string | null {
  if (!token) return null;

  const m = styleUrl.match(/^mapbox:\/\/styles\/([^/]+)\/([^/]+)$/);
  if (!m) return null;
  const [, username, styleId] = m;

  // Static API expects lng,lat,zoom,bearing in the path; @2x for retina.
  const position = `${geo.lng},${geo.lat},${zoom},0`;
  return (
    `https://api.mapbox.com/styles/v1/${username}/${styleId}/static/` +
    `${position}/${width}x${height}@2x?access_token=${token}`
  );
}
```

- [ ] Run again (expect PASS):

```bash
npx vitest run lib/__tests__/images.test.ts
```

Expected: `Test Files  1 passed` · `Tests  4 passed`.

- [ ] Commit:

```bash
git add lib/images.ts lib/__tests__/images.test.ts
git commit -m "feat(map): staticMapUrl builder for Mapbox static fallback (TDD)"
```

---

### Task 3 — `GlofoxEmbed` facade component (idle → loading → loaded; failure/timeout → link out)

Leaf `'use client'`. Renders a poster (idle) with a "Load schedule" button; mounting on intent OR on scroll-into-view loads the live Glofox `classes-day-view` iframe. On `onLoad` → loaded. On iframe `onError` OR a timeout → failure state showing a **"Book on Glofox"** link out. URLs come from `site.glofox` (never hardcoded).

> **Motion note.** This facade has **no decorative motion to gate** — the only animation is the loading spinner (`animate-spin`), which is essential progress feedback (exempt from reduced-motion suppression). It therefore does not consume `lib/motion.ts`; only `MapEmbed` (Task 5) does, to disable the map's non-essential pitch animation.

- [ ] **Files**
  - Create: `components/glofox/GlofoxEmbed.tsx`

```tsx
// components/glofox/GlofoxEmbed.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "loaded" | "failed";

const LOAD_TIMEOUT_MS = 12_000;

export interface GlofoxEmbedProps {
  /** site.glofox.scheduleUrl — the classes-day-view embed URL */
  scheduleUrl: string;
  /** site.glofox.membershipsUrl — used for the "Book on Glofox" link out */
  bookUrl: string;
  /** Accessible title for the iframe */
  title?: string;
}

export function GlofoxEmbed({
  scheduleUrl,
  bookUrl,
  title = "Peaches Fitness Club class schedule",
}: GlofoxEmbedProps) {
  const [status, setStatus] = useState<Status>("idle");
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll-into-view trigger: once the facade nears the viewport, begin loading.
  useEffect(() => {
    if (status !== "idle") return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          setStatus("loading");
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [status]);

  // Timeout guard while loading.
  useEffect(() => {
    if (status !== "loading") return;
    timerRef.current = setTimeout(() => setStatus("failed"), LOAD_TIMEOUT_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [status]);

  const handleLoaded = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("loaded");
  };
  const handleError = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("failed");
  };

  return (
    <div
      ref={rootRef}
      data-testid="glofox-embed"
      data-status={status}
      className="relative w-full overflow-hidden rounded-2xl bg-[var(--peach)]/40 shadow-sm"
      style={{ minHeight: 560 }}
    >
      {/* IDLE — poster + explicit load button */}
      {status === "idle" && (
        <div className="flex min-h-[560px] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h3 className="font-[var(--font-heading)] text-2xl text-[var(--charcoal)]">
            See the live class schedule
          </h3>
          <p className="max-w-prose text-[var(--charcoal)]/80">
            Our up-to-the-minute timetable is powered by Glofox. Load it below, or
            book your spot directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button type="button" onClick={() => setStatus("loading")}>
              Load schedule
            </Button>
            <Button
              as="a"
              href={bookUrl}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book on Glofox
            </Button>
          </div>
        </div>
      )}

      {/* LOADING — skeleton + spinner while the iframe mounts */}
      {status === "loading" && (
        <div
          aria-live="polite"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[var(--peach)]/40"
        >
          <span
            aria-hidden
            className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--coral-deep)] border-t-transparent"
          />
          <p className="text-[var(--charcoal)]/80">Loading schedule…</p>
        </div>
      )}

      {/* IFRAME — mounted for loading + loaded (kept mounted once loaded) */}
      {(status === "loading" || status === "loaded") && (
        <iframe
          src={scheduleUrl}
          title={title}
          loading="lazy"
          onLoad={handleLoaded}
          onError={handleError}
          className="block h-[560px] w-full border-0"
        />
      )}

      {/* FAILED / TIMEOUT — link out (Appendix B) */}
      {status === "failed" && (
        <div className="flex min-h-[560px] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h3 className="font-[var(--font-heading)] text-2xl text-[var(--charcoal)]">
            Schedule unavailable right now
          </h3>
          <p className="max-w-prose text-[var(--charcoal)]/80">
            We couldn’t load the live timetable. You can still view classes and
            book directly on Glofox.
          </p>
          <Button
            as="a"
            href={bookUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book on Glofox
          </Button>
        </div>
      )}
    </div>
  );
}
```

> **Note on `Button as="a"`.** The `Button` primitive from slice A1 must support a polymorphic `as` (`"a"` renders an anchor). If your `Button` does not, substitute a plain styled `<a>` here — but use the AA-safe recipe (spec §5.1: link-out buttons use `--coral-deep` fill + white label), never coral-on-peach text.

- [ ] Typecheck the new component:

```bash
npx tsc --noEmit
```

Expected: no errors referencing `components/glofox/GlofoxEmbed.tsx`.

- [ ] Commit:

```bash
git add components/glofox/GlofoxEmbed.tsx
git commit -m "feat(glofox): lazy iframe facade with scroll/intent load + book-out fallback"
```

---

### Task 4 — Wire `GlofoxEmbed` into `/classes` below server-rendered class types

The class-type content (from `content/classes.ts`) is already server-rendered above. We append the facade as a clearly separated section. `/classes` stays a **server component**; only `GlofoxEmbed` is client.

- [ ] **Files**
  - Modify: `app/classes/page.tsx`

- [ ] At the top of `app/classes/page.tsx`, add the imports (keep existing ones):

```tsx
import { GlofoxEmbed } from "@/components/glofox/GlofoxEmbed";
import { site } from "@/content/site";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
```

- [ ] Append this section **after** the existing server-rendered class-type list, before the page's closing element:

```tsx
{/* Live schedule — below the indexable class-type content (spec §8). */}
<Section>
  <Container>
    <h2 className="mb-2 font-[var(--font-heading)] text-3xl text-[var(--charcoal)]">
      Book a class
    </h2>
    <p className="mb-6 max-w-prose text-[var(--charcoal)]/80">
      Browse the live timetable and reserve your spot. Pricing and membership
      are handled in Glofox.
    </p>
    <GlofoxEmbed
      scheduleUrl={site.glofox.scheduleUrl}
      bookUrl={site.glofox.membershipsUrl}
    />
  </Container>
</Section>
```

- [ ] Typecheck:

```bash
npx tsc --noEmit
```

Expected: no errors for `app/classes/page.tsx`. (The full DOM contract — facade renders with **no iframe before intent**, class content server-rendered independently — is asserted by the Playwright spec in Task 7, which manages its own server via `playwright.config.ts`'s `webServer`. We do **not** background a dev server with `&` here, per the runner constraints.)

- [ ] Commit:

```bash
git add app/classes/page.tsx
git commit -m "feat(classes): mount Glofox facade below server-rendered class types"
```

---

### Task 5 — `MapEmbed` component (scroll-mounted dynamic mapbox-gl; no-key/failure → static fallback)

Leaf `'use client'`. On scroll-into-view (IntersectionObserver), **dynamically import** `mapbox-gl` (client-only, keeps it out of the main bundle and avoids SSR). Reads style/zoom/pitch from `site.mapbox`, center from `nap.geo`, adds a `logo3` marker. If `NEXT_PUBLIC_MAPBOX_API_KEY` is absent **or** the import/render throws → render the static fallback: `staticMapUrl(...)` if a token somehow exists, else the bundled brand image, plus a **"Get Directions"** button (URL from `lib/nap.ts`).

> **Reduced-motion (single source).** The map's pitch is non-essential motion, so it is disabled under `prefers-reduced-motion`. A React hook (`useReducedMotion`) can't be called inside the async map-init effect, so we use the **non-hook** `prefersReducedMotion()` helper that lives alongside it in `lib/motion.ts` — keeping a single source of truth rather than re-implementing `window.matchMedia` inline.

- [ ] **Files**
  - Create: `components/map/MapEmbed.tsx`
  - Confirm the bundled fallback asset exists: `public/images/brand/map-fallback.webp`. If absent, copy a brand image as the placeholder (use `git add`, not plain `cp` alone, so it's tracked):

```bash
ls public/images/brand/map-fallback.webp 2>/dev/null || \
  cp "migration/live-assets/clean/mainbackground.webp" public/images/brand/map-fallback.webp
git add public/images/brand/map-fallback.webp
```

Expected: file exists at `public/images/brand/map-fallback.webp`.

```tsx
// components/map/MapEmbed.tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { staticMapUrl } from "@/lib/images";
import { prefersReducedMotion } from "@/lib/motion";

type Status = "idle" | "loading" | "loaded" | "fallback";

export interface MapEmbedProps {
  geo: { lat: number; lng: number };
  styleUrl: string;
  zoom: number;
  pitch: number;
  /** Google Maps directions URL, serialized from nap in lib/nap.ts */
  directionsUrl: string;
  /** Bundled brand image used when there is no token at all */
  fallbackImage: { src: string; width: number; height: number; alt: string };
  /** logo3 marker asset path */
  markerSrc?: string;
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

export function MapEmbed({
  geo,
  styleUrl,
  zoom,
  pitch,
  directionsUrl,
  fallbackImage,
  markerSrc = "/images/brand/logo3.png",
}: MapEmbedProps) {
  const [status, setStatus] = useState<Status>(TOKEN ? "idle" : "fallback");
  const sectionRef = useRef<HTMLDivElement>(null);
  const mapNodeRef = useRef<HTMLDivElement>(null);

  // Scroll-into-view trigger (only when we actually have a token).
  useEffect(() => {
    if (status !== "idle") return;
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          setStatus("loading");
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [status]);

  // Dynamic, client-only mapbox-gl load + init.
  useEffect(() => {
    if (status !== "loading") return;
    let cancelled = false;
    let map: import("mapbox-gl").Map | undefined;

    (async () => {
      try {
        if (!TOKEN) throw new Error("no-token");
        const mapboxgl = (await import("mapbox-gl")).default;
        await import("mapbox-gl/dist/mapbox-gl.css");
        if (cancelled || !mapNodeRef.current) return;

        // Single-source reduced-motion check (lib/motion.ts non-hook helper):
        // the map's pitch is non-essential motion, disabled when reduced.
        const reduce = prefersReducedMotion();

        mapboxgl.accessToken = TOKEN;
        map = new mapboxgl.Map({
          container: mapNodeRef.current,
          style: styleUrl,
          center: [geo.lng, geo.lat],
          zoom,
          pitch: reduce ? 0 : pitch,
          attributionControl: true,
        });

        const marker = document.createElement("img");
        marker.src = markerSrc;
        marker.alt = "";
        marker.width = 40;
        marker.height = 40;
        marker.style.display = "block";
        new mapboxgl.Marker({ element: marker })
          .setLngLat([geo.lng, geo.lat])
          .addTo(map);

        map.on("load", () => {
          if (!cancelled) setStatus("loaded");
        });
        map.on("error", () => {
          if (!cancelled) setStatus("fallback");
        });
      } catch {
        if (!cancelled) setStatus("fallback");
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [status, styleUrl, geo.lat, geo.lng, zoom, pitch, markerSrc]);

  const staticUrl = staticMapUrl({ token: TOKEN, geo, styleUrl, zoom });

  return (
    <div
      ref={sectionRef}
      data-testid="map-embed"
      data-status={status}
      className="relative w-full overflow-hidden rounded-2xl shadow-sm"
      style={{ minHeight: 420 }}
    >
      {/* Live map container — present for loading/loaded */}
      {(status === "loading" || status === "loaded") && (
        <div ref={mapNodeRef} className="h-[420px] w-full" aria-label="Map of Peaches Fitness Club" />
      )}

      {status === "loading" && (
        <div
          aria-live="polite"
          className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--peach)]/40"
        >
          <span
            aria-hidden
            className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--coral-deep)] border-t-transparent"
          />
        </div>
      )}

      {/* Fallback — static map image (if token) or bundled brand image, + directions */}
      {status === "fallback" && (
        <div className="relative h-[420px] w-full" data-testid="map-fallback">
          {staticUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={staticUrl}
              alt="Map showing Peaches Fitness Club location"
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={fallbackImage.src}
              alt={fallbackImage.alt}
              width={fallbackImage.width}
              height={fallbackImage.height}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-[var(--charcoal)]/60 to-transparent p-4">
            <Button
              as="a"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

> **`prefersReducedMotion()` dependency.** `lib/motion.ts` (Chunk 1/slice A1) must export, alongside the `useReducedMotion` hook, a plain function `prefersReducedMotion(): boolean` — e.g. `typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches`. If only the hook exists, add this one-line non-hook helper there (single source of truth) rather than re-implementing `matchMedia` inside this component.

> **Why `staticUrl` uses a plain `<img>`:** the Mapbox Static API host isn't in `next.config.ts` `images.remotePatterns`, and adding a per-request signed-URL host to the image optimizer is unnecessary here. The bundled-image path uses `next/image`. (If you prefer optimization, add `api.mapbox.com` to `remotePatterns` in slice A1's `next.config.ts` and swap to `next/image`.)

- [ ] Typecheck:

```bash
npx tsc --noEmit
```

Expected: no errors for `components/map/MapEmbed.tsx`.

- [ ] Commit:

```bash
git add components/map/MapEmbed.tsx public/images/brand/map-fallback.webp
git commit -m "feat(map): scroll-mounted dynamic mapbox-gl with static + directions fallback"
```

---

### Task 6 — Wire `MapEmbed` into `/contact`

`/contact` stays a **server component**; it passes serialized props (directions URL computed server-side from `nap` via `lib/nap.ts`) down to the client `MapEmbed`.

- [ ] **Files**
  - Modify: `app/contact/page.tsx`

- [ ] Add imports at the top of `app/contact/page.tsx`:

```tsx
import { MapEmbed } from "@/components/map/MapEmbed";
import { site } from "@/content/site";
import { directionsUrl } from "@/lib/nap";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
```

- [ ] Add the map section (after the address/hours block, beside or below the form). The directions URL is built **server-side** and passed down — never recomputed client-side:

```tsx
{/* Map — dynamic, client-only, scroll-mounted; static fallback when no key. */}
<Section>
  <Container>
    <h2 className="mb-4 font-[var(--font-heading)] text-3xl text-[var(--charcoal)]">
      Find us
    </h2>
    <MapEmbed
      geo={site.nap.geo}
      styleUrl={site.mapbox.styleUrl}
      zoom={site.mapbox.zoom}
      pitch={site.mapbox.pitch}
      directionsUrl={directionsUrl(site.nap)}
      fallbackImage={{
        src: "/images/brand/map-fallback.webp",
        width: 1280,
        height: 720,
        alt: "Map showing Peaches Fitness Club at 2801 Eubank Blvd NE, Suite P, Albuquerque",
      }}
    />
  </Container>
</Section>
```

- [ ] Typecheck:

```bash
npx tsc --noEmit
```

Expected: no errors for `app/contact/page.tsx`. (The SSR contract — directions URL present, `fallback` status with "Get Directions" when no key — is asserted by the Playwright spec in Task 7. With `NEXT_PUBLIC_MAPBOX_API_KEY` unset, `MapEmbed`'s initial `useState` resolves to `"fallback"`, so the static path is the deterministic default in CI and local dev.)

- [ ] Commit:

```bash
git add app/contact/page.tsx
git commit -m "feat(contact): mount scroll-loaded Mapbox map with static directions fallback"
```

---

### Task 7 — Verify both integrations with `@playwright/test`

Use the **`@playwright/test`** runner and the `playwright.config.ts` created in **Chunk 1** (`use.baseURL: 'http://localhost:3000'` + a `webServer` block that runs `npm run build && npm run start` with `reuseExistingServer: !process.env.CI`). The spec therefore needs **no manual server and no `&` backgrounding** — Playwright's `webServer` starts/stops the app. We do **not** invoke the `webapp-testing` (Python) skill here; per the global Playwright decision, the authoritative checks are `@playwright/test` specs run via `npm run test:a11y`. (`@playwright/test` and the Chromium browser are Chunk 1 deliverables — do not `npm install` them here.)

Two assertions match the chunk's contract: (1) `/classes` facade renders with **no iframe in the DOM until intent**; (2) `/contact` map shows the **static fallback when the key is absent** (the default, since `NEXT_PUBLIC_MAPBOX_API_KEY` is empty in `.env.example`/dev).

- [ ] **Files**
  - Create: `tests/e2e/integrations.spec.ts`

> **Pre-req sanity (no install — verify only):** `npx playwright --version` should print a version, and `tests/e2e` should be the `testDir` in `playwright.config.ts`. If either is missing, that is a **Chunk 1** gap (add `@playwright/test` to Chunk 1's `package.json` + create `playwright.config.ts` there) — do not patch it in this chunk.

- [ ] Author the spec:

```ts
// tests/e2e/integrations.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Glofox facade on /classes", () => {
  test("renders facade idle with NO iframe before intent", async ({ page }) => {
    await page.goto("/classes");

    // SEO content is server-rendered (independent of the embed).
    await expect(page.locator("body")).toContainText(/yoga|pilates|zumba|strength/i);

    const embed = page.getByTestId("glofox-embed");
    await expect(embed).toBeVisible();
    // Idle (or loading via scroll), but NOT loaded, and no iframe yet on first paint.
    await expect(embed).toHaveAttribute("data-status", /idle|loading/);

    // The "Book on Glofox" link-out is always reachable.
    await expect(
      page.getByRole("link", { name: /book on glofox/i }).first(),
    ).toBeVisible();
  });

  test("clicking 'Load schedule' mounts the iframe", async ({ page }) => {
    await page.goto("/classes");
    const btn = page.getByRole("button", { name: /load schedule/i });
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
    }
    await expect(page.locator("iframe")).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Mapbox map on /contact (no API key → fallback)", () => {
  test("shows static fallback + Get Directions when key is absent", async ({
    page,
  }) => {
    await page.goto("/contact");
    const map = page.getByTestId("map-embed");
    await expect(map).toBeVisible();
    await expect(map).toHaveAttribute("data-status", "fallback");
    await expect(page.getByTestId("map-fallback")).toBeVisible();

    const directions = page.getByRole("link", { name: /get directions/i });
    await expect(directions).toBeVisible();
    await expect(directions).toHaveAttribute(
      "href",
      /google\.com\/maps\/dir/,
    );
  });
});
```

- [ ] Run the two specs. Playwright's `webServer` builds + starts the app on `:3000` automatically (no manual server, no `&`); the empty `NEXT_PUBLIC_MAPBOX_API_KEY` makes the map's fallback path deterministic:

```bash
npx playwright test tests/e2e/integrations.spec.ts
```

Expected: `3 passed`. Specifically — the facade test confirms `data-status` is `idle|loading` and **no `<iframe>` is required before intent**; the map test confirms `data-status="fallback"` with the `map-fallback` image and a `google.com/maps/dir` directions link when `NEXT_PUBLIC_MAPBOX_API_KEY` is empty.

> If the click-to-load iframe test is flaky in CI-less local runs (Glofox is a third party), mark it `test.fixme` with a note rather than deleting it — the load-failure path already degrades to the visible "Book on Glofox" link, which the first test asserts. Do not weaken the two contract assertions (facade-no-iframe, map-fallback).

- [ ] Commit:

```bash
git add tests/e2e/integrations.spec.ts
git commit -m "test(integrations): playwright verifies glofox facade + map fallback"
```

---

### Task 8 — Sanity: full typecheck, unit tests, and clean tree

- [ ] **Files:** none (verification only).

- [ ] Run the project gates touched by this chunk:

```bash
npx tsc --noEmit
npx vitest run lib/__tests__/images.test.ts
git status --porcelain
```

Expected: `tsc` exits 0; `vitest` → `4 passed`; `git status --porcelain` prints nothing (all work committed). Confirm `.env`/`.env.local` are **not** tracked (gitignored from slice A1) and that no real Mapbox token has been introduced anywhere tracked:

```bash
git ls-files | grep -E "(^|/)\.env(\.local)?$" || echo "OK: no .env tracked"
git grep -nE "pk\.[A-Za-z0-9._-]{20,}" -- . ':!*.md' || echo "OK: no mapbox public token committed"
```

Expected: first prints `OK: no .env tracked`; second prints `OK: no mapbox public token committed`.

> **Launch-gate reminder (carried to slice D — spec §13/§14 step 9):** before production, set a **rotated, URL-restricted** `NEXT_PUBLIC_MAPBOX_API_KEY` in Vercel; with it set, `MapEmbed` upgrades from the static fallback to the live scroll-mounted `mapbox-gl` map automatically (no code change). The Glofox facade needs no env config — its URLs live in `content/site.ts`. (Per the corrected slice map: A1 = steps 1–3, A2 = steps 4–6, B = step 7, **C = step 8 (this chunk)**, D = step 5 animations + step 9 verify/README/launch-gate.)

---

## Chunk 5: Animation (reduced-motion gated), a11y/perf verification, README, launch gate

> **Covers Build-Order steps 5 + 9 (slice D).** Per spec §14, slice D = step 5 (Animations with reduced-motion guards) **and** step 9 (Lighthouse / axe-core a11y+contrast pass / README / `.env.example` / launch gate). Animation is intentionally deferred to this final slice so it is layered onto finished, server-rendered pages and verified in the same pass as the a11y/perf gate — Chunks 1–4 (slices A1, A2-pages, B, C) build **no** animation, so there is no double-coverage or gap. This chunk: builds the shared motion layer, applies reduced-motion-gated animation across sections, wires the Playwright + axe a11y scan, runs the contrast + Lighthouse gates, writes the README + finalizes `.env.example`, and lands the launch-gate checklist.
>
> Assumes Chunks 1–4 landed: tokens + contrast test (`lib/contrast.ts`, `lib/__tests__/contrast.test.ts`), `content/types.ts` (Appendix A interfaces incl. `Stat`) + `content/*`, all pages/sections built as server components, `playwright.config.ts` (created in Chunk 1 per global correction #6), forms backend, Glofox/Mapbox integrations. **Dependencies (framer-motion@^11, lenis@^1, @axe-core/playwright, @playwright/test, lighthouse) were pinned ONCE in Chunk 1's `package.json` and installed via `npm install` (global correction #3) — this chunk does NOT run additional `npm i`.**
>
> Skills to lean on: `@superpowers:test-driven-development` for the pure-logic motion variant + Stat-prefix tests, `@playwright/test` (run via `npm run test:a11y`) for the a11y scan, `@superpowers:verification-before-completion` before claiming the gate is green.

### Task 1: Confirm motion + a11y/perf deps already resolved (no install)

Per global correction #3 the deps were pinned in Chunk 1's `package.json` and installed once. This task only **verifies** they resolved — it must NOT run `npm i <pkg>`.

**Files:** none (verification only)

- [ ] Verify the pinned versions resolved from the single Chunk-1 install:
  ```bash
  npm ls framer-motion lenis @axe-core/playwright @playwright/test lighthouse
  ```
  Expected: each prints a single resolved version (`framer-motion@11.x`, `lenis@1.x`, `@axe-core/playwright@4.x`, `@playwright/test@1.x`, `lighthouse@12.x`) with no `UNMET DEPENDENCY` / `invalid` lines. If anything is missing, STOP — add it to **Chunk 1's** `package.json` dependency list and re-run `npm install`; do not `npm i` it here.

- [ ] Ensure the Playwright Chromium browser binary is present (one-time, not a package install):
  ```bash
  npx playwright install chromium
  ```
  Expected: "chromium is already installed" or a successful download. (This installs a browser binary, not an npm dependency.)

---

### Task 2 (TDD): pure motion module `lib/motion-variants.ts` — failing test first

To keep the Vitest unit test free of the `"use client"` directive and the `framer-motion` React hook import (review minors: directive-imported-by-test + Variants deep-typing), the motion layer is split into TWO modules:

- `lib/motion-variants.ts` — **pure data + `getReveal`**, framework-free, NO `"use client"`, NO React-hook import. This is the only module the Vitest test imports. Variants are declared with `satisfies Variants` (not `: Variants`) so the concrete inferred shape is preserved and the test's deep property access (`fadeIn.visible.transition.duration`, etc.) type-checks under `npx tsc --noEmit` (fixes the major typing issue that would have broken the Task 12 tsc gate).
- `lib/motion.ts` — the `"use client"` React-hook wrapper (`useReducedMotion`) re-exporting the pure module (Task 3). The test never imports this, so no directive/hook runs under Vitest.

This is the "pure logic" carve-out per the plan rules; only the pure module gets a TDD red→green cycle.

**Files:**
- Create test: `lib/__tests__/motion.test.ts`
- Create impl: `lib/motion-variants.ts`

- [ ] Write the failing test first (`@superpowers:test-driven-development`):

  `lib/__tests__/motion.test.ts`
  ```ts
  import { describe, it, expect } from "vitest";
  import {
    fadeIn,
    rise,
    staggerContainer,
    getReveal,
    REVEAL_DISTANCE,
    REVEAL_DURATION,
  } from "../motion-variants";

  describe("motion variants (pure, framework-free module)", () => {
    it("fadeIn animates opacity 0 -> 1 with a finite duration", () => {
      expect(fadeIn.hidden).toEqual({ opacity: 0 });
      expect(fadeIn.visible.opacity).toBe(1);
      expect(fadeIn.visible.transition.duration).toBe(REVEAL_DURATION);
    });

    it("rise translates up from REVEAL_DISTANCE to 0 and fades in", () => {
      expect(rise.hidden).toEqual({ opacity: 0, y: REVEAL_DISTANCE });
      expect(rise.visible.opacity).toBe(1);
      expect(rise.visible.y).toBe(0);
    });

    it("staggerContainer staggers children with a positive delay", () => {
      const stagger = staggerContainer.visible.transition.staggerChildren;
      expect(stagger).toBeGreaterThan(0);
      expect(stagger).toBeLessThan(0.5);
    });

    it("getReveal returns full motion when motion is allowed", () => {
      const v = getReveal(false);
      expect(v.hidden).toEqual({ opacity: 0, y: REVEAL_DISTANCE });
      expect(v.visible.y).toBe(0);
      expect(v.visible.transition.duration).toBe(REVEAL_DURATION);
    });

    it("getReveal collapses ALL motion to instant, no-transform when reduced", () => {
      const v = getReveal(true);
      // No translate, no fade-from-invisible, zero duration => effectively static.
      expect(v.hidden).toEqual({ opacity: 1, y: 0 });
      expect(v.visible).toEqual({ opacity: 1, y: 0, transition: { duration: 0 } });
    });
  });
  ```

- [ ] Run it and confirm it FAILS (module not yet implemented):
  ```bash
  npx vitest run lib/__tests__/motion.test.ts
  ```
  Expected: `Error: Failed to resolve import "../motion-variants"` (or `is not a function`) — the run exits non-zero. Do not proceed until you see red.

- [ ] Implement to make it pass:

  `lib/motion-variants.ts`
  ```ts
  // Pure motion data + reveal selector. NO "use client", NO React-hook import,
  // so it is safe to import from a Vitest (node) unit test. The React hook that
  // reads prefers-reduced-motion lives in lib/motion.ts and re-exports this file.
  import type { Variants } from "framer-motion";

  /** Distance (px) an element rises into place on reveal. */
  export const REVEAL_DISTANCE = 24;
  /** Reveal duration (s) — slow + elegant per spec §9. */
  export const REVEAL_DURATION = 0.6;
  /** Per-child stagger (s) for card grids. */
  export const STAGGER_CHILDREN = 0.08;

  // `satisfies Variants` (not `: Variants`): validates the shape against framer's
  // Variants type WHILE preserving the concrete inferred object type, so deep
  // property access (e.g. fadeIn.visible.transition.duration) type-checks under
  // `npx tsc --noEmit`. A plain `: Variants` annotation widens to the Variant
  // union and would fail the Task 12 tsc gate.
  export const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: REVEAL_DURATION, ease: "easeOut" } },
  } satisfies Variants;

  export const rise = {
    hidden: { opacity: 0, y: REVEAL_DISTANCE },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: REVEAL_DURATION, ease: "easeOut" },
    },
  } satisfies Variants;

  export const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: STAGGER_CHILDREN } },
  } satisfies Variants;

  // Reveal variants gated on reduced-motion. The two branches share a single
  // literal type so the union is concrete and deep access type-checks.
  type RevealVariants = {
    hidden: { opacity: number; y: number };
    visible: { opacity: number; y: number; transition: { duration: number; ease?: string } };
  };

  /**
   * Returns reveal variants gated on reduced-motion.
   * reduced === true => fully static (opacity 1, no transform, zero duration)
   * so the element is visible immediately and never animates.
   */
  export function getReveal(reduced: boolean): RevealVariants {
    if (reduced) {
      return {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0 } },
      };
    }
    return {
      hidden: { opacity: 0, y: REVEAL_DISTANCE },
      visible: { opacity: 1, y: 0, transition: { duration: REVEAL_DURATION, ease: "easeOut" } },
    };
  }
  ```

  > The test imports only `lib/motion-variants.ts` — a directive-free, hook-free module under Vitest's default node environment. `import type { Variants }` is erased at compile time, so nothing from `framer-motion`'s runtime is evaluated. `satisfies Variants` keeps deep property access type-safe for the Task 12 tsc gate.

- [ ] Run again and confirm it PASSES:
  ```bash
  npx vitest run lib/__tests__/motion.test.ts
  ```
  Expected: `Test Files  1 passed (1)` / `Tests  5 passed (5)`, exit 0.

- [ ] Commit:
  ```bash
  git add lib/motion-variants.ts lib/__tests__/motion.test.ts && git commit -m "feat(motion): pure variants + reduced-motion getReveal (TDD, framework-free)"
  ```

---

### Task 3: `lib/motion.ts` client hook wrapper + `Reveal`/`RevealGroup` leaves

`lib/motion.ts` is the `"use client"` hook layer that re-exports the pure module and adds the `useReducedMotion` guard. `Reveal`/`RevealGroup` are leaf client components so server sections stay server components.

**Files:** Create `lib/motion.ts`, `components/motion/Reveal.tsx`, `components/motion/RevealGroup.tsx`

- [ ] `lib/motion.ts` (client hook + re-export of the pure module):
  ```tsx
  "use client";

  import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

  // Re-export the pure variants so components import everything from one place.
  export {
    fadeIn,
    rise,
    staggerContainer,
    getReveal,
    REVEAL_DISTANCE,
    REVEAL_DURATION,
    STAGGER_CHILDREN,
  } from "./motion-variants";

  /**
   * Thin wrapper over Framer's reduced-motion hook so every animated leaf
   * reads the SAME guard. Honors the OS `prefers-reduced-motion` setting.
   */
  export function useReducedMotion(): boolean {
    return useFramerReducedMotion() ?? false;
  }
  ```

- [ ] `components/motion/Reveal.tsx` — maps `as` to a concrete `motion` component via a record (fixes the `motion[as]` union-type-complexity minor):
  ```tsx
  "use client";

  import { motion } from "framer-motion";
  import type { ReactNode } from "react";
  import { getReveal, useReducedMotion } from "@/lib/motion";

  // Concrete record instead of `motion[as]` so TS gets a single component type
  // (avoids "union too complex" / props-intersection errors at tsc time).
  const TAGS = {
    div: motion.div,
    section: motion.section,
    li: motion.li,
    article: motion.article,
  } as const;

  export function Reveal({
    children,
    className,
    as = "div",
  }: {
    children: ReactNode;
    className?: string;
    as?: keyof typeof TAGS;
  }) {
    const reduced = useReducedMotion();
    const MotionTag = TAGS[as];
    return (
      <MotionTag
        className={className}
        variants={getReveal(reduced)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {children}
      </MotionTag>
    );
  }
  ```

- [ ] `components/motion/RevealGroup.tsx` (staggered card grid container + item):
  ```tsx
  "use client";

  import { motion } from "framer-motion";
  import type { ReactNode } from "react";
  import { getReveal, staggerContainer, useReducedMotion } from "@/lib/motion";

  export function RevealGroup({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) {
    const reduced = useReducedMotion();
    return (
      <motion.div
        className={className}
        variants={reduced ? undefined : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {children}
      </motion.div>
    );
  }

  export function RevealItem({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) {
    const reduced = useReducedMotion();
    return (
      <motion.div className={className} variants={getReveal(reduced)}>
        {children}
      </motion.div>
    );
  }
  ```

- [ ] Typecheck (no test — pure-visual leaves; verified via axe/Playwright in Task 7):
  ```bash
  npx tsc --noEmit
  ```
  Expected: no errors (exit 0).

- [ ] Commit:
  ```bash
  git add lib/motion.ts components/motion/Reveal.tsx components/motion/RevealGroup.tsx && git commit -m "feat(motion): client useReducedMotion hook + Reveal/RevealGroup leaf wrappers"
  ```

---

### Task 4: Hero parallax + button/card hover micro-interactions (gated)

> **Note on client boundaries (§5.3):** `Button` and `Card` are leaf primitives. Converting them to client components is intentional and consistent with §5.3 ("client interactivity confined to leaf components; pages/sections stay server"). Hover/tap state is interaction-only, so the client boundary stays at the leaf — importing server sections do NOT become client. The full post-Chunk-3 source of each file is inlined below with the motion edits already applied; replace the file contents wholesale (do not guess insertion points).

**Files:**
- Create `components/motion/Parallax.tsx`
- Modify `components/sections/Hero.tsx` (wrap ONLY the decorative background layer)
- Modify `components/ui/Button.tsx` (hover/tap motion, gated)
- Modify `components/ui/Card.tsx` (hover lift, gated)

- [ ] `components/motion/Parallax.tsx` — subtle scroll parallax for the hero background, disabled when reduced:
  ```tsx
  "use client";

  import { motion, useScroll, useTransform } from "framer-motion";
  import { useRef, type ReactNode } from "react";
  import { useReducedMotion } from "@/lib/motion";

  export function Parallax({
    children,
    className,
    /** Max vertical drift in px across the element's scroll range. */
    distance = 60,
  }: {
    children: ReactNode;
    className?: string;
    distance?: number;
  }) {
    const reduced = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start start", "end start"],
    });
    const y = useTransform(scrollYProgress, [0, 1], [0, distance]);

    if (reduced) {
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      );
    }
    return (
      <motion.div ref={ref} className={className} style={{ y }}>
        {children}
      </motion.div>
    );
  }
  ```

- [ ] In `components/sections/Hero.tsx`, wrap ONLY the decorative background image layer (not the `<h1>`/CTA text, which must stay crisp, in-flow, and server-rendered for SEO/CLS). The exact anchor: the `absolute inset-0 -z-10` background `<Image>` — wrap that single element (and only it) in `<Parallax>`. The foreground heading/CTA markup is unchanged. Hero stays a server component; `Parallax` is the client leaf.
  ```tsx
  import Image from "next/image";
  import { Parallax } from "@/components/motion/Parallax";
  import { Button } from "@/components/ui/Button";
  import { Container } from "@/components/ui/Container";
  import { site } from "@/content/site";

  export function Hero() {
    return (
      <section className="relative isolate overflow-hidden">
        {/* Decorative background ONLY — wrapped in Parallax (client leaf). */}
        <Parallax className="absolute inset-0 -z-10" distance={60}>
          <Image
            src="/images/brand/mainbackground.webp"
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/30" aria-hidden />
        </Parallax>

        {/* Foreground text/CTA — crisp, in-flow, server-rendered (NOT animated). */}
        <Container className="relative flex min-h-[70vh] flex-col items-start justify-center gap-6 py-24">
          <h1 className="font-heading text-4xl text-white md:text-6xl">
            {site.name}
          </h1>
          <p className="font-display text-2xl text-white md:text-3xl">
            {site.promo?.enabled ? site.promo.text : "Where good things are growing"}
          </p>
          <Button href={site.glofox.membershipsUrl}>Join now</Button>
        </Container>
      </section>
    );
  }
  ```
  > The hero background keeps `priority` + `fetchPriority="high"` + `fill` + `sizes` — the parallax wrapper does not strip them. It is the single priority image on the page (Task 9 CLS checklist).

- [ ] `components/ui/Button.tsx` — full file, AA-safe recipe unchanged; gated hover/tap scale added. The recipe (`--coral-deep` fill + white label, hover background → `--coral-dark` via CSS class transition) is unchanged; motion only scales, so contrast is never reduced by the animation:
  ```tsx
  "use client";

  import { motion } from "framer-motion";
  import Link from "next/link";
  import type { ReactNode } from "react";
  import { useReducedMotion } from "@/lib/motion";

  type ButtonProps = {
    children: ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "secondary";
    className?: string;
    type?: "button" | "submit";
  };

  const RECIPE = {
    // AA: white on --coral-deep = 5.42:1; hover --coral-dark = 4.59:1 (§5.1).
    primary:
      "bg-[var(--coral-deep)] text-white hover:bg-[var(--coral-dark)] transition-colors",
    // --charcoal text on --peach (AA), outline.
    secondary:
      "bg-[var(--peach)] text-charcoal border border-charcoal/20 hover:bg-[var(--peach-2)] transition-colors",
  } as const;

  export function Button({
    children,
    href,
    onClick,
    variant = "primary",
    className = "",
    type = "button",
  }: ButtonProps) {
    const reduced = useReducedMotion();
    const hover = reduced ? undefined : { scale: 1.03 };
    const tap = reduced ? undefined : { scale: 0.98 };
    const classes = `inline-flex items-center justify-center rounded-full px-6 py-3 font-sans font-medium ${RECIPE[variant]} ${className}`;

    if (href) {
      return (
        <motion.div whileHover={hover} whileTap={tap} className="inline-flex">
          <Link href={href} className={classes}>
            {children}
          </Link>
        </motion.div>
      );
    }
    return (
      <motion.button
        type={type}
        onClick={onClick}
        whileHover={hover}
        whileTap={tap}
        className={classes}
      >
        {children}
      </motion.button>
    );
  }
  ```

- [ ] `components/ui/Card.tsx` — full file, gated hover lift + soft low-spread shadow (§5.1):
  ```tsx
  "use client";

  import { motion } from "framer-motion";
  import type { ReactNode } from "react";
  import { useReducedMotion } from "@/lib/motion";

  export function Card({
    children,
    className = "",
  }: {
    children: ReactNode;
    className?: string;
  }) {
    const reduced = useReducedMotion();
    return (
      <motion.div
        whileHover={reduced ? undefined : { y: -4 }}
        className={`rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}
      >
        {children}
      </motion.div>
    );
  }
  ```

- [ ] Typecheck:
  ```bash
  npx tsc --noEmit
  ```
  Expected: exit 0.

- [ ] Commit:
  ```bash
  git add components/motion/Parallax.tsx components/sections/Hero.tsx components/ui/Button.tsx components/ui/Card.tsx && git commit -m "feat(motion): hero parallax (bg only) + button/card hover micro-interactions (reduced-motion gated)"
  ```

---

### Task 5 (TDD): Stat count-up — pure numeric-prefix guard first, then gated count-up

Per global correction #9 / spec §6.4, only animate values that are a **pure leading number** (`12+`, `5+`, `5`). Non-quantity values (`5AM–10PM`, `Est. 2024`, `Women-focused`) must render verbatim with NO count-up — the leading `5` in `5AM–10PM` is a clock time, not a quantity. We TDD a pure `parseStatCountUp` helper (the numeric-prefix branch), then wire the gated count-up in the client component.

The `Stat` interface (Appendix A: `{ value: string; label: string }`) is unchanged — the count-up decision is derived from the value string by the pure guard, so no data-shape change is needed.

**Files:**
- Create test: `lib/__tests__/stat.test.ts`
- Create pure helper: `lib/stat.ts`
- Modify component: `components/ui/Stat.tsx`

- [ ] Write the failing test first:

  `lib/__tests__/stat.test.ts`
  ```ts
  import { describe, it, expect } from "vitest";
  import { parseStatCountUp } from "../stat";

  describe("parseStatCountUp — only pure leading-quantity values count up", () => {
    it("counts up a bare integer", () => {
      expect(parseStatCountUp("12")).toEqual({ countUp: true, target: 12, suffix: "" });
    });

    it("counts up integer with a + suffix", () => {
      expect(parseStatCountUp("5+")).toEqual({ countUp: true, target: 5, suffix: "+" });
    });

    it("counts up integer with a % suffix", () => {
      expect(parseStatCountUp("90%")).toEqual({ countUp: true, target: 90, suffix: "%" });
    });

    it("does NOT count up a clock-time window (the §6.4 5AM–10PM default)", () => {
      expect(parseStatCountUp("5AM–10PM")).toEqual({ countUp: false });
    });

    it("does NOT count up 'Est. 2024'", () => {
      expect(parseStatCountUp("Est. 2024")).toEqual({ countUp: false });
    });

    it("does NOT count up a non-numeric label", () => {
      expect(parseStatCountUp("Women-focused")).toEqual({ countUp: false });
    });
  });
  ```

- [ ] Run it and confirm it FAILS:
  ```bash
  npx vitest run lib/__tests__/stat.test.ts
  ```
  Expected: `Failed to resolve import "../stat"` — exit non-zero. Do not proceed until red.

- [ ] Implement the pure guard:

  `lib/stat.ts`
  ```ts
  export type StatCountUp =
    | { countUp: false }
    | { countUp: true; target: number; suffix: string };

  /**
   * A stat value counts up ONLY when it is a pure leading quantity: an integer
   * optionally followed by a single + or % (e.g. "12", "5+", "90%"). Anything
   * with embedded non-quantity text — a clock time ("5AM–10PM"), a year
   * ("Est. 2024"), or words ("Women-focused") — renders verbatim, no count-up.
   * This avoids the nonsensical "0AM–10PM -> 5AM–10PM" animation.
   */
  export function parseStatCountUp(value: string): StatCountUp {
    const match = value.match(/^(\d+)([+%]?)$/);
    if (!match) return { countUp: false };
    return { countUp: true, target: parseInt(match[1], 10), suffix: match[2] };
  }
  ```

- [ ] Run again and confirm it PASSES:
  ```bash
  npx vitest run lib/__tests__/stat.test.ts
  ```
  Expected: `Tests  6 passed (6)`, exit 0.

- [ ] Wire the gated count-up into the component (reduced-motion OR non-quantity → final value immediately, no count):

  `components/ui/Stat.tsx`
  ```tsx
  "use client";

  import { useEffect, useRef, useState } from "react";
  import { useInView } from "framer-motion";
  import { useReducedMotion } from "@/lib/motion";
  import { parseStatCountUp } from "@/lib/stat";

  /**
   * Renders a single honest-fact stat (Appendix A `Stat`: { value, label }).
   * Only PURE leading-quantity values ("12", "5+", "90%") count up on first
   * in-view; embedded-text values ("5AM–10PM", "Est. 2024", "Women-focused")
   * render verbatim. Reduced-motion => final text immediately, no count.
   */
  export function Stat({ value, label }: { value: string; label: string }) {
    const reduced = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });

    const parsed = parseStatCountUp(value);
    const animate = parsed.countUp && !reduced;

    const [display, setDisplay] = useState<string>(
      animate ? `0${parsed.suffix}` : value
    );

    useEffect(() => {
      if (!animate || !parsed.countUp) {
        setDisplay(value);
        return;
      }
      if (!inView) return;
      const { target, suffix } = parsed;
      let raf = 0;
      const start = performance.now();
      const duration = 1200;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setDisplay(`${Math.round(eased * target)}${suffix}`);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
      // parsed is derived from `value`; depend on the primitives only.
    }, [animate, inView, value]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
      <div ref={ref} className="text-center">
        <div className="font-heading text-4xl text-[var(--coral-deep)] md:text-5xl">
          {display}
        </div>
        <div className="font-sans mt-1 text-charcoal">{label}</div>
      </div>
    );
  }
  ```
  > `--coral-deep` for the large stat number is AA on cream/white at this size (5.42:1, §5.1); label uses `--charcoal`. A non-quantity value such as the §6.4 `5AM–10PM` default renders verbatim from first paint, reserving its final width so the count-up never shifts layout (Task 9 CLS).

- [ ] Typecheck + run both new suites:
  ```bash
  npx tsc --noEmit && npx vitest run lib/__tests__/stat.test.ts lib/__tests__/motion.test.ts
  ```
  Expected: exit 0; `Tests  11 passed (11)`.

- [ ] Commit:
  ```bash
  git add lib/stat.ts lib/__tests__/stat.test.ts components/ui/Stat.tsx && git commit -m "feat(motion): Stat count-up only for pure-quantity values; verbatim for times/years (TDD)"
  ```

---

### Task 6: Optional Lenis smooth scroll (client, gated, off on reduced-motion)

**Files:**
- Create `components/motion/SmoothScroll.tsx`
- Modify `app/layout.tsx` (mount `<SmoothScroll/>` as a leaf; layout stays a server component)

- [ ] `components/motion/SmoothScroll.tsx`:
  ```tsx
  "use client";

  import { useEffect } from "react";
  import Lenis from "lenis";
  import { useReducedMotion } from "@/lib/motion";

  /**
   * Optional smooth scroll. Disabled entirely under prefers-reduced-motion
   * (spec §9: reduced-motion disables non-essential motion AND Lenis).
   * Renders nothing.
   */
  export function SmoothScroll() {
    const reduced = useReducedMotion();
    useEffect(() => {
      if (reduced) return;
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      let raf = 0;
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => {
        cancelAnimationFrame(raf);
        lenis.destroy();
      };
    }, [reduced]);
    return null;
  }
  ```

- [ ] In `app/layout.tsx`, mount it inside `<body>` (alongside `<HashRedirect/>`), keeping the layout a server component:
  ```tsx
  // import { SmoothScroll } from "@/components/motion/SmoothScroll";
  // <body className={...}>
  //   <SmoothScroll />
  //   <HashRedirect />
  //   <Header />
  //   {children}
  //   <Footer />
  // </body>
  ```

- [ ] Verify SSR is not broken (server HTML still contains content). **Use the PID-capture teardown (global correction #7) — never `kill %1`** (no shell job control in the non-interactive runner). Pre-free the port so a stale server doesn't collide:
  ```bash
  npm run build
  lsof -ti tcp:3000 | xargs -r kill   # free port if a stale server is running
  npm run start & SRV=$!
  # poll until the server answers (do not use a fixed sleep)
  until curl -fsS http://localhost:3000/ >/dev/null 2>&1; do sleep 1; done
  COUNT=$(curl -s http://localhost:3000/ | grep -c "Peaches")
  kill "$SRV"; wait "$SRV" 2>/dev/null
  echo "brand-text occurrences: $COUNT"
  ```
  Expected: `brand-text occurrences:` a count `> 0` (server-rendered brand text present; `SmoothScroll` renders null and never blocks SSR).

- [ ] Commit:
  ```bash
  git add components/motion/SmoothScroll.tsx app/layout.tsx && git commit -m "feat(motion): optional Lenis smooth scroll, gated + disabled on reduced-motion"
  ```

---

### Task 7: Playwright + axe a11y scan over key pages

> `playwright.config.ts` was created in **Chunk 1** (global correction #6) with `use: { baseURL: 'http://localhost:3000' }` and a `webServer` block that runs `npm run build && npm run start` and reuses an existing server (`reuseExistingServer: !process.env.CI`). The authoritative a11y checks run via `npm run test:a11y` (the `webapp-testing` Python helper is OPTIONAL/alternative). This task verifies/extends that config (testDir, axe tags, exclusions) and adds the spec — it does not re-create the server wiring from scratch.

**Files:**
- Verify/extend `playwright.config.ts` (created Chunk 1)
- Create `tests/a11y/a11y.spec.ts`
- Modify `package.json` (`test:a11y` script — add only if Chunk 1 didn't)

- [ ] Confirm `playwright.config.ts` (from Chunk 1) has `testDir: "./tests"`, the `baseURL`, and the `webServer` block (build+start, `reuseExistingServer: !process.env.CI`). It should look like:
  ```ts
  import { defineConfig, devices } from "@playwright/test";

  export default defineConfig({
    testDir: "./tests",
    timeout: 60_000,
    fullyParallel: true,
    reporter: [["list"]],
    use: {
      baseURL: "http://localhost:3000",
      trace: "on-first-retry",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
      command: "npm run build && npm run start",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  });
  ```
  > If Chunk 1's config lacks `testDir: "./tests"`, add it so the specs below are discovered. Do not change the `baseURL`/`webServer` contract from Chunk 1.

- [ ] `tests/a11y/a11y.spec.ts` — axe scan over the four key pages (Home, /trainers, /contact, /faq) plus SEO content assertions. The SEO assertions are tied to their content source (review minor): each literal token is guaranteed by `content/*` authored in earlier chunks — if a copy edit removes the token, fix the assertion to a token the source still guarantees, never weaken the matcher:
  ```ts
  import { test, expect } from "@playwright/test";
  import AxeBuilder from "@axe-core/playwright";

  const PAGES = ["/", "/trainers", "/contact", "/faq"] as const;

  for (const path of PAGES) {
    test(`a11y: ${path} has no serious/critical axe violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        // Mapbox GL canvas + Glofox iframe are third-party (§12); their internals
        // are excluded so first-party content is measured cleanly.
        .exclude(".mapboxgl-map")
        .exclude("iframe[src*='glofox']")
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );
      if (blocking.length) {
        console.log(
          JSON.stringify(
            blocking.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
            null,
            2
          )
        );
      }
      expect(blocking).toEqual([]);
    });
  }

  // SEO assertion source: content/faq.ts. The 6 FAQ answers (§6.2) concern
  // membership; "membership" is guaranteed by FAQ #5/#6 copy. If reconciled
  // copy drops the literal, retarget to a token content/faq.ts still guarantees.
  test("SEO: /faq server-renders real Q&A text in initial HTML", async ({ request }) => {
    const html = await (await request.get("/faq")).text();
    expect(html).toContain("?"); // at least one question
    expect(html.toLowerCase()).toContain("membership");
  });

  // SEO assertion source: content/classes.ts. §6.2 lists class types
  // yoga/Pilates/Zumba/strength, so "yoga" is guaranteed and server-rendered
  // independent of the Glofox iframe (§8).
  test("SEO: /classes server-renders class types independent of Glofox", async ({ request }) => {
    const html = await (await request.get("/classes")).text();
    expect(html.toLowerCase()).toContain("yoga");
  });
  ```

- [ ] Ensure the `test:a11y` script exists in `package.json` (add only if Chunk 1 didn't already add it). The `test` script (`vitest run`) is from Chunk 1; do not duplicate or overwrite it:
  ```json
  "scripts": {
    "test": "vitest run",
    "test:a11y": "playwright test tests/a11y"
  }
  ```

- [ ] Run the scan (Playwright's `webServer` builds+starts the prod server automatically — no manual `&`/`kill`):
  ```bash
  npm run test:a11y
  ```
  Expected: all a11y + SEO tests pass (`X passed`). If any axe violation prints, fix the first-party markup (missing `alt`, label, heading order, or a color pairing that slipped the §5.1 role table) and re-run until green. Do NOT relax the matcher — fix the markup.

- [ ] Commit:
  ```bash
  git add playwright.config.ts tests/a11y/a11y.spec.ts package.json && git commit -m "test(a11y): axe scan over Home/trainers/contact/faq + content-sourced SEO assertions"
  ```

---

### Task 8: Contrast gate — token unit test + axe (combined gate)

The contrast gate per §5.1/§14 is two mechanisms: (a) the Vitest token contrast test from Chunk 1, (b) the axe pass from Task 7. This task runs both as the single gate and records the result.

**Files:** (no new files — runs existing `lib/__tests__/contrast.test.ts` + Task 7 spec)

- [ ] Run the token contrast unit test (the allowed-pairings matrix from §5.1, with the verified ratios from global correction #10):
  ```bash
  npx vitest run lib/__tests__/contrast.test.ts
  ```
  Expected: all pairings pass — white-on-`#A8503A` (`--coral-deep`) = 5.42 ✓, white-on-`#B55C44` (`--coral-dark`) = 4.59 ✓, `#A8503A`-on-white ≈ 5.0 ✓, `#4E7A51` (`--sage`)-on-white = 4.97 ✓, `#D56F52` (`--coral`)-on-cream = 3.20 / on-white = 3.37 large-only ✓, AND `--coral` normal-size on cream **fails** 4.5 (asserts it's large-only). Do NOT assert `coral-deep on peach-2 < 3` (it is ≈3.10). `Tests  N passed`, exit 0. If red, a token hex drifted — fix `app/globals.css` `:root`, not the test thresholds.

- [ ] Run the full unit suite + a11y as the combined gate:
  ```bash
  npm test && npm run test:a11y
  ```
  Expected: both exit 0. This is the §14-step-9 contrast/a11y gate; both halves must be green before launch. (`@superpowers:verification-before-completion` — paste the passing tails as evidence, do not assert from memory.)

- [ ] Commit (gate-run is verification only; commit any markup/token fixes made):
  ```bash
  git add -A && git commit -m "test: contrast gate green (token matrix + axe pass)" --allow-empty
  ```

---

### Task 9: Lighthouse pass (§12 profile) + CLS/perf fix checklist

Lighthouse runs against a prod build (§12). To avoid shell job control (global correction #7), free the port, start with PID capture, poll readiness, and tear down with the captured PID — never `kill %1`. Drop `--preset=perf` (it conflicts with the explicit `--only-categories`); use explicit flags so the §12 profile is reproducible (review minor).

**Files:** Modify components/pages only as needed to satisfy the checklist (no new file required).

- [ ] Build + start the production server with PID capture and readiness poll:
  ```bash
  npm run build
  lsof -ti tcp:3000 | xargs -r kill   # free port if a stale server is running
  npm run start & SRV=$!
  until curl -fsS http://localhost:3000/ >/dev/null 2>&1; do sleep 1; done
  ```

- [ ] Run Lighthouse on Home with the §12 mobile profile, median-of-3 (run 3×, take the median per category). Home is the §12 ≥90/100/≥95/≥95 page. Note: NO `--preset` (explicit flags only):
  ```bash
  for i in 1 2 3; do \
    npx lighthouse http://localhost:3000/ \
      --form-factor=mobile --screenEmulation.mobile \
      --throttling-method=simulate \
      --only-categories=performance,accessibility,best-practices,seo \
      --quiet --chrome-flags="--headless=new" \
      --output=json --output-path="/tmp/lh-home-$i.json"; \
  done
  ```
  Then read the three runs' `performance`/`seo`/`accessibility`/`best-practices` scores and take the **median** of the 3 per category.

- [ ] Measure a representative content page (e.g. `/about` or `/amenities`) the same 4-category way; and the two best-effort pages (`/classes`, `/contact`) — for those only **SEO must be 100** and a11y ≥95 (perf/BP best-effort per §12, Glofox iframe / Mapbox GL):
  ```bash
  npx lighthouse http://localhost:3000/about \
    --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate \
    --only-categories=performance,accessibility,best-practices,seo \
    --quiet --chrome-flags="--headless=new" --output=json --output-path=/tmp/lh-about.json
  npx lighthouse http://localhost:3000/classes \
    --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate \
    --only-categories=seo,accessibility \
    --quiet --chrome-flags="--headless=new" --output=json --output-path=/tmp/lh-classes.json
  npx lighthouse http://localhost:3000/contact \
    --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate \
    --only-categories=seo,accessibility \
    --quiet --chrome-flags="--headless=new" --output=json --output-path=/tmp/lh-contact.json
  ```

- [ ] Stop the server with the captured PID (NOT `kill %1`):
  ```bash
  kill "$SRV"; wait "$SRV" 2>/dev/null
  ```

- [ ] Work the perf/CLS fix checklist until the §12 targets hold (median):
  - [ ] **Preload hero** — hero image uses `next/image` with `priority` + `fetchPriority="high"`; only ONE priority image per page (Task 4 Hero already does this).
  - [ ] **Lazy below-fold** — all below-fold images load lazily (default `next/image`, no `priority`); gallery/carousel images lazy.
  - [ ] **Explicit dimensions / no CLS** — every `<Image>` has `width`/`height` (or `fill` + sized parent) from the post-resize intrinsic dims (Appendix A `ImgRef`); blur placeholders where set. Stat/animated blocks reserve space so count-up doesn't shift layout (Stat renders final-width verbatim text from first paint).
  - [ ] **Fonts** — `next/font` self-hosted (no runtime CDN); `display: swap`; no FOIT-driven CLS.
  - [ ] **Motion ≠ CLS** — parallax/reveal use transform/opacity only (compositor-friendly), never animate layout (`height`/`top`/`margin`).
  - [ ] **No render-blocking third parties on first paint** — Glofox + Mapbox stay behind facade / scroll-mount (Chunk 4); confirm they do not load on initial Home paint.
  - [ ] **SEO=100** on Home + content pages: unique `<title>`/description/canonical, one `<h1>`, descriptive `alt`, valid robots/sitemap.
  - [ ] **Best-Practices ≥95** on Home/content: no console errors, no insecure requests, correct image aspect ratios.

- [ ] Re-run Lighthouse on any page that missed target after fixes (same start/poll/kill pattern above); confirm median meets §12. Record the median scores (paste into the commit body as evidence).

- [ ] Commit:
  ```bash
  git add -A && git commit -m "perf: meet Lighthouse §12 targets (preload hero, lazy below-fold, no CLS); record median scores"
  ```

---

### Task 10: README + finalize `.env.example`

**Files:** Modify `README.md`, Modify `.env.example`

- [ ] Finalize `.env.example` (all vars from §15; no secrets — placeholders only):
  ```bash
  # Public site URL — used for metadataBase, canonical URLs, sitemap, robots.
  NEXT_PUBLIC_SITE_URL=https://www.peachesfitnessclub.com

  # Resend (transactional email for contact/careers/newsletter forms).
  RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

  # Mapbox public token for the /contact map.
  # MUST be rotated before launch (the old token is committed in git history under
  # the legacy REACT_APP_MAPBOX_API_KEY and is permanently compromised) and
  # URL-restricted to the production domain in the Mapbox dashboard.
  NEXT_PUBLIC_MAPBOX_API_KEY=pk.xxxxxxxxxxxxxxxxxxxxxxxx

  # Upstash Redis — durable rate limiting.
  # REQUIRED in production (the app fails loud at startup if missing when
  # NODE_ENV=production). In dev it may be omitted (honeypot-only fallback).
  UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
  UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx

  # Glofox branch id (membership/class deep-links + schedule iframe).
  NEXT_PUBLIC_GLOFOX_BRANCH_ID=65d38d833aabb0e6490203b0
  ```

- [ ] Write `README.md`:
  ```markdown
  # Peaches Fitness Club — Website

  Women-focused gym in Albuquerque, NM. Server-rendered marketing site built
  with Next.js 15 (App Router, React Server Components), TypeScript (strict),
  and Tailwind CSS v4.

  ## Requirements
  - Node 24+
  - npm

  ## Setup
  ```bash
  npm install
  cp .env.example .env.local   # fill in values (see "Environment variables")
  npm run dev                  # http://localhost:3000
  ```

  ## Scripts
  | Script | Purpose |
  |--------|---------|
  | `npm run dev` | Local dev server |
  | `npm run build` | Production build |
  | `npm run start` | Serve the production build |
  | `npm run lint` | ESLint |
  | `npm test` | Vitest unit tests (token contrast, motion variants, Stat guard, schemas, NAP) |
  | `npm run test:a11y` | Playwright + axe-core a11y scan (Home, /trainers, /contact, /faq) |

  > No CI runs these on deploy — run `npm test` and `npm run test:a11y` **locally before launch** (Vercel does not run unit tests on deploy). Playwright's `webServer` config builds+starts the prod server automatically for `test:a11y`.

  ## Environment variables
  All vars are documented in `.env.example`. Never commit a real `.env*` (it is gitignored).

  > Repo-history note: this branch inherited a tracked `.env`. It was untracked via `git rm --cached .env` and added to `.gitignore`; the committed Mapbox token in history is compromised and must be rotated (below).

  | Var | Required | Notes |
  |-----|----------|-------|
  | `NEXT_PUBLIC_SITE_URL` | yes | Drives `metadataBase`, canonical URLs, sitemap, robots. |
  | `RESEND_API_KEY` | yes (forms) | Resend transactional email. |
  | `NEXT_PUBLIC_MAPBOX_API_KEY` | yes (map) | Public token. **Rotate + URL-restrict before launch** (see below). |
  | `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | **prod: yes** | Durable rate limiting. App fails loud at startup if missing in production; dev falls back to honeypot-only with a warning. |
  | `NEXT_PUBLIC_GLOFOX_BRANCH_ID` | yes | Glofox deep-links + schedule iframe. |

  ### Mapbox token rotation + URL restriction (MANDATORY before launch)
  The original repo committed a Mapbox token to git history (under the legacy
  `REACT_APP_MAPBOX_API_KEY`). That token is **permanently compromised**.
  1. In the Mapbox account, **create a NEW public token** and delete/disable the old one. Never reuse the old token.
  2. **URL-restrict** the new token to the production domain(s) only (Mapbox dashboard → token → URL restrictions). This is the durable mitigation since public tokens are exposed client-side.
  3. Put the new token in `NEXT_PUBLIC_MAPBOX_API_KEY` (Vercel env + local `.env.local`).
  4. `.env` is now untracked + gitignored on this branch (`git rm --cached .env`); history rewrite of the old token is optional but the rotation above is required regardless.

  ### Upstash (production-required rate limiting)
  Serverless functions are stateless, so in-memory rate limiting does not work on
  Vercel. Provision an Upstash Redis database and set `UPSTASH_REDIS_REST_URL` +
  `UPSTASH_REDIS_REST_TOKEN` in the Vercel **Production** environment. If either is
  missing in production the app fails loud at startup (by design). In dev they may
  be omitted; the contact API degrades to honeypot-only and logs a warning.

  ## Editing site content
  All copy, photos, pricing, hours, trainers, FAQ, etc. live in typed modules
  under `content/` (interfaces in `content/types.ts`) — no code changes needed for
  routine edits:
  | File | Edit this to change… |
  |------|----------------------|
  | `content/site.ts` | **Name, address, suite, phone, email, hours, geo, socials, Glofox URLs, promo banner, price range.** Single source of NAP — feeds visible address, JSON-LD, directions link, and map center. Edit here, nowhere else. |
  | `content/amenities.ts` | Amenity list + descriptions |
  | `content/trainers.ts` | Trainer bios, photos, specializations (Katie is a placeholder until owner supplies bio/headshot) |
  | `content/classes.ts` | Class types + descriptions (server-rendered for SEO; independent of the Glofox iframe) |
  | `content/plans.ts` | Membership tiers + features (price `null` → "Contact for pricing") |
  | `content/dayPasses.ts` | Day pass pricing |
  | `content/kidsCare.ts` | Kids Care pricing/copy |
  | `content/faq.ts` | FAQ Q&A (these answers must match the `FAQPage` JSON-LD on `/faq`) |
  | `content/codeOfConduct.ts` | Code of conduct rules |
  | `content/careers.ts` | Open positions + careers form options |
  | `content/stats.ts` | Home "social proof" stats (honest facts only; empty array hides the section). Pure-quantity values like `12+` count up; values with embedded text like `5AM–10PM` render verbatim. |

  Images go in `public/images/<group>/`; reference them via the typed `ImgRef`
  (src + intrinsic width/height + alt) so `next/image` reserves space (no layout shift).

  ## Accessibility & contrast
  Brand colors follow an AA-safe role table (design spec §5.1). Primary buttons are
  `--coral-deep` fill + white label (5.42:1 AA). The token contrast test (`npm test`)
  and the axe scan (`npm run test:a11y`) enforce this — run both before launch. All
  motion is gated behind `prefers-reduced-motion` (Lenis disabled too).

  ## Deploy (Vercel)
  1. Import the repo into Vercel; framework auto-detects Next.js.
  2. Set all env vars from `.env.example` in **Project → Settings → Environment Variables** (Production + Preview). Upstash vars are **required in Production**.
  3. Rotate + URL-restrict the Mapbox token first (above).
  4. Deploy. Confirm `/sitemap.xml`, `/robots.txt`, and the 3 redirects (`/daypass`, `/kidscare`, `/codeofconduct`) work on the deployed URL.
  5. Run the **Launch Gate** (below) before pointing production DNS / allowing indexing.

  ## Launch Gate
  See the design spec §13 and `docs/LAUNCH-GATE.md`. Ship-blocking items: confirm
  NAP, confirm/omit the Facebook URL, rotate + restrict the Mapbox token, configure
  Upstash in production, and reconcile FAQ #5/#6 before allowing production indexing
  (the answers feed the FAQ structured data).
  ```

- [ ] Verify `.env.example` has all 6 var groups:
  ```bash
  grep -c "NEXT_PUBLIC_SITE_URL\|RESEND_API_KEY\|NEXT_PUBLIC_MAPBOX_API_KEY\|UPSTASH_REDIS_REST_URL\|UPSTASH_REDIS_REST_TOKEN\|NEXT_PUBLIC_GLOFOX_BRANCH_ID" .env.example
  ```
  Expected: `6`.

- [ ] Commit:
  ```bash
  git add README.md .env.example && git commit -m "docs: README (setup, env vars, Mapbox rotation, Upstash, content guide, deploy) + finalize .env.example"
  ```

---

### Task 11: Launch-Gate checklist (mirrors spec §13)

**Files:** Create `docs/LAUNCH-GATE.md`

- [ ] `docs/LAUNCH-GATE.md` — the actionable gate, mirroring §13. Ship-blocking items must be checked before production indexing/DNS:
  ```markdown
  # Launch Gate — Peaches Fitness Club

  Run `npm test` + `npm run test:a11y` and confirm Lighthouse §12 targets first.

  ## Ship-blocking (must be done before production indexing / DNS cutover)
  - [ ] **1. NAP confirmed** — full address (NE / Suite P / 87112 vs 87110),
        phone `(505) 808-9499`, geo `35.115047, -106.536046`. Update
        `content/site.ts` once confirmed. Until then, keep production-indexed
        `LocalBusiness`/`HealthClub` JSON-LD gated (preview/`noindex`).
  - [ ] **2. Facebook page URL** — confirm exact slug, then add to
        `content/site.ts` `socials.facebook` and the JSON-LD `sameAs`.
        Until confirmed, **omit** Facebook from `sameAs` (do not emit a guess).
  - [ ] **3. Rotate + URL-restrict the Mapbox token** — old committed token is
        compromised (`.env` was tracked under `REACT_APP_MAPBOX_API_KEY`); create
        a new public token, URL-restrict to prod domain, set
        `NEXT_PUBLIC_MAPBOX_API_KEY`, never reuse the old one. `.env` is now
        untracked (`git rm --cached .env`) + gitignored.
  - [ ] **4. Upstash configured in Production** — `UPSTASH_REDIS_REST_URL` +
        `UPSTASH_REDIS_REST_TOKEN` set in Vercel Production (app fails loud
        without them in prod).
  - [ ] **9. FAQ #5/#6 reconciled** — edit answers to match Glofox-only booking +
        "Contact for pricing"; the `FAQPage` JSON-LD must equal the edited
        on-page answers (no stale rich-result text). Must precede production.

  ## Non-blocking (build ships with placeholders/fallbacks)
  - [ ] **5. Katie's bio + headshot** — replace the `placeholder: true` trainer
        entry + neutral image in `content/trainers.ts` when owner supplies them.
  - [ ] **6. Membership pricing** — currently "Contact for pricing"; set real
        prices in `content/plans.ts` if/when provided.
  - [ ] **7. `stats.ts` values** — confirm/adjust honest facts in `content/stats.ts`.
  - [ ] **8. Privacy/Terms real copy** — replace boilerplate when owner supplies.
  - [ ] **10. Trainer roster confirmed** — Kira + Katie (Shelbie removed).

  ## Resolved
  - [x] **11. Font direction** — Option B re-skin: Pacifico (script) + Quicksand
        (body) + Oswald (headings).

  ## Pre-launch verification (run + record evidence)
  - [ ] `npm test` green (contrast matrix, motion variants, Stat guard, schemas, NAP).
  - [ ] `npm run test:a11y` green (axe, no serious/critical on Home/trainers/contact/faq; SEO content assertions).
  - [ ] Lighthouse median-of-3 meets §12 (Home/content ≥90 perf, 100 SEO, ≥95 a11y, ≥95 BP; /classes & /contact SEO 100 + a11y ≥95, perf/BP best-effort).
  - [ ] Redirects live: `/daypass`→`/day-pass`, `/kidscare`→`/kids-care`, `/codeofconduct`→`/code-of-conduct` (308).
  - [ ] `/sitemap.xml` + `/robots.txt` correct on deployed URL.
  - [ ] No real secrets in git; `.env*` gitignored and `.env` untracked.
  ```

- [ ] Commit:
  ```bash
  git add docs/LAUNCH-GATE.md && git commit -m "docs: launch-gate checklist mirroring spec §13"
  ```

---

### Task 12: Final slice-D verification (`@superpowers:verification-before-completion`)

**Files:** none (verification only)

- [ ] Full local gate, in order, capturing real output (do not claim green from memory). `npm run build` + `npm run test:a11y` manage their own server (Playwright `webServer`); none of these uses `kill %1`:
  ```bash
  npx tsc --noEmit
  npm run lint
  npm test
  npm run build
  npm run test:a11y
  ```
  Expected: each command exits 0. `npm test` shows all suites passing (contrast matrix, `lib/__tests__/motion.test.ts` 5 passed, `lib/__tests__/stat.test.ts` 6 passed, schemas, NAP). `npm run build` completes with no type/lint errors (the `satisfies Variants` typing makes the motion module clean under `tsc`). `npm run test:a11y` shows the four a11y specs + the two SEO assertions passing.

- [ ] Confirm reduced-motion behavior manually (optional `webapp-testing` skill, or a `@playwright/test` spec): emulate `prefers-reduced-motion: reduce`, load Home, assert the hero/sections are visible immediately with no transform animation and Lenis is not active, and assert a `5AM–10PM`-style stat renders verbatim (no `0AM` flash). Capture a screenshot as evidence.

- [ ] Final commit (empty if nothing changed — records the gate pass):
  ```bash
  git add -A && git commit -m "chore: slice D complete — animation (step 5) + a11y/perf gate (step 9) green, README + launch gate landed" --allow-empty
  ```

---


# Tasks: Add robots.txt to the Platform

**Input**: Design documents from `/specs/021-add-robots-txt/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — 13 Vitest unit tests for the generation logic.

**Organization**: Tasks are grouped by phase. All tasks completed.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: .gitignore configuration for generated file

- [x] T001 Add `/public/robots.txt` entry to `.gitignore` (following the existing `public/meta.json` pattern on line 17)

---

## Phase 2: Foundational (Build-time Generation)

**Purpose**: Create the `generateRobotsTxt` pure function and integrate into build pipeline

- [x] T002 Create the `generateRobotsTxt(allowIndexing: boolean): string` pure function in `buildConfiguration.js` — when `allowIndexing` is `true`, return comprehensive production rules (global allow with sensitive path blocks, AI/LLM scraper blocking, aggressive SEO bot blocking, crawl-delay); when `false`, return restrictive rules (`User-agent: *\nDisallow: /\n`). Exported for unit testing.
- [x] T003 Integrate robots.txt generation into `buildConfiguration.js` — inside the existing `buildConfiguration()` async function, call `generateRobotsTxt(true)` and write the result to `public/robots.txt` using `writeFile`. Build always generates production content; non-production override happens at container startup.

---

## Phase 3: Runtime Environment Detection

**Purpose**: Override robots.txt at container startup for non-production environments

- [x] T004 Add runtime override logic to `.build/docker/env.sh` — after `env-config.js` generation, check `VITE_APP_ALKEMIO_DOMAIN`; if not `https://alkem.io`, overwrite `robots.txt` with restrictive rules. This enables a single Docker image to serve correct content on any environment.

---

## Phase 4: Infrastructure (Nginx + Vite Dev Server)

**Purpose**: Ensure correct Content-Type and caching behavior

- [x] T005 Add no-cache nginx location block for `/robots.txt` in `.build/.nginx/nginx.conf` — matching the existing `meta.json` and `env-config.js` pattern, with `default_type text/plain`
- [x] T006 Add `/robots.txt` to the Vite dev server no-cache route list in `vite.config.mjs`
- [x] T007 Fix Vite dev server Content-Type override in `vite.config.mjs` — only set `text/html; charset=utf-8` for routes without file extensions or `.html` files, preserving correct Content-Type for static files like `.txt`, `.json`, `.js`

---

## Phase 5: Tests

**Purpose**: Unit tests for both production and restrictive variants

- [x] T008 Write 13 unit tests in `src/domain/platform/__tests__/robotsTxt.test.ts` covering:
  - Production variant: User-agent, Allow, admin/sensitive path disallows, API endpoint disallows, build artifact disallows, crawl-delay, AI bot blocking, SEO bot blocking
  - Non-production variant: User-agent, Disallow: /, no Allow directives, no AI bot rules

---

## Phase 6: Validation

**Purpose**: Final validation

- [x] T009 Run all unit tests with `pnpm vitest run` and verify 13/13 pass
- [x] T010 Run `pnpm lint` to verify no linting issues were introduced

---

## Notes

- Build always generates production robots.txt; runtime override handles non-production
- Environment detection uses `VITE_APP_ALKEMIO_DOMAIN` (existing var) — no new env vars needed
- Same Docker image works for all environments
- `generateRobotsTxt` function is the core testable deliverable
- `buildConfiguration.js` is vanilla ESM JS — unit test imports from it directly

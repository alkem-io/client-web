# Tasks: Add robots.txt to the Platform

**Input**: Design documents from `/specs/021-add-robots-txt/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — plan.md specifies Vitest unit tests for the generation logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment variable documentation and .gitignore configuration

- [x] T001 Add `VITE_APP_ROBOTS_ALLOW_INDEXING` variable (empty/commented) to `.env` with a descriptive comment explaining its purpose and fail-safe behavior
- [x] T002 [P] Add `/public/robots.txt` entry to `.gitignore` (following the existing `public/meta.json` pattern on line 17)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extract robots.txt content generation as a pure, testable function

**⚠️ CRITICAL**: User story work depends on this function existing

- [x] T003 Create the `generateRobotsTxt(allowIndexing: boolean): string` pure function in `buildConfiguration.js` — when `allowIndexing` is `true`, return production rules (`User-agent: *\nAllow: /\nDisallow: /admin\n`); otherwise return restrictive rules (`User-agent: *\nDisallow: /\n`). Define the function as a named `export` above the existing IIFE so the test file can import it directly (e.g., `export function generateRobotsTxt(allowIndexing) { ... }`). The function takes a **boolean**; string-to-boolean coercion (`=== 'true'`) happens at the call site in T005.

**Checkpoint**: Foundation ready — the generation function exists and can be tested and integrated.

---

## Phase 3: User Story 1 — Search Engine Crawler Visits Production (Priority: P1) 🎯 MVP

**Goal**: Production environments serve a valid robots.txt that allows crawling of public content while blocking `/admin`.

**Independent Test**: Set `VITE_APP_ROBOTS_ALLOW_INDEXING=true`, run `pnpm start`, request `http://localhost:3001/robots.txt` — response should contain `Allow: /` and `Disallow: /admin`.

### Tests for User Story 1

> **NOTE: Write the test FIRST, ensure it FAILS before implementation**

- [x] T004 [US1] Write unit test in `src/domain/platform/__tests__/robotsTxt.test.ts` — test that `generateRobotsTxt(true)` returns RFC 9309-compliant output containing `User-agent: *`, `Allow: /`, and `Disallow: /admin` (and no `Disallow: /` without the `/admin` suffix)

### Implementation for User Story 1

- [x] T005 [US1] Integrate robots.txt generation into `buildConfiguration.js` — inside the existing `buildConfiguration()` async function, read `VITE_APP_ROBOTS_ALLOW_INDEXING` from the parsed env vars, coerce to boolean (`env.VITE_APP_ROBOTS_ALLOW_INDEXING === 'true'`), call `generateRobotsTxt(boolean)`, and write the result to `public/robots.txt` using `writeFile` (same pattern as the existing `public/env-config.js` generation)

**Checkpoint**: Production robots.txt generation works end-to-end. Run `VITE_APP_ROBOTS_ALLOW_INDEXING=true node buildConfiguration.js` and verify `public/robots.txt` content.

---

## Phase 4: User Story 2 — Crawler Visits Non-Production Environment (Priority: P1)

**Goal**: Non-production environments serve a robots.txt that disallows all crawling (fail-safe default).

**Independent Test**: Run `pnpm start` without setting `VITE_APP_ROBOTS_ALLOW_INDEXING` — request `http://localhost:3001/robots.txt` and verify it contains `Disallow: /`.

### Tests for User Story 2

- [x] T006 [US2] Write unit tests in `src/domain/platform/__tests__/robotsTxt.test.ts` — test that `generateRobotsTxt(false)` returns `User-agent: *` and `Disallow: /`. The function takes a boolean, so only test `false` here (string-to-boolean coercion is the caller's responsibility, tested implicitly via T007's manual verification).

### Implementation for User Story 2

- [x] T007 [US2] Verify fail-safe logic in `buildConfiguration.js` — ensure the env var check uses strict equality (`=== 'true'`) so that missing, empty, or any non-`"true"` value produces the restrictive robots.txt. No new code may be needed if T005 already implemented this correctly; verify and adjust if necessary.

**Checkpoint**: Non-production robots.txt works. Run `node buildConfiguration.js` (without the env var) and verify `public/robots.txt` contains `Disallow: /`.

---

## Phase 5: User Story 3 — Eliminating Sentry 404 Errors (Priority: P2)

**Goal**: After deployment, `/robots.txt` returns 200 instead of 404, eliminating Sentry noise.

**Independent Test**: After building (`pnpm build`), confirm `public/robots.txt` exists in the `build/` output directory. Any web server serving this directory will return 200 for `/robots.txt`.

### Implementation for User Story 3

- [x] T008 [US3] Verify that `public/robots.txt` is included in the Vite build output — run `pnpm build` and confirm `build/robots.txt` exists (Vite copies `public/` contents to `build/` by default, so no configuration should be needed; verify only)

**Checkpoint**: The generated robots.txt survives the build pipeline and will be served in production.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T009 Run all unit tests with `pnpm vitest run src/domain/platform/__tests__/robotsTxt.test.ts --reporter=basic` and verify they pass
- [x] T010 Run `pnpm lint` to verify no linting issues were introduced
- [x] T011 Run quickstart.md validation — execute both verification commands from `specs/021-add-robots-txt/quickstart.md` (with and without `VITE_APP_ROBOTS_ALLOW_INDEXING`). Also verify FR-006: run `curl -sI http://localhost:3001/robots.txt` and confirm `Content-Type: text/plain` is present in the response headers.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Can start in parallel with Phase 1 (different files)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (needs `generateRobotsTxt` function)
- **User Story 2 (Phase 4)**: Depends on Phase 2; can run in parallel with Phase 3 (tests are additive, implementation is verification of existing logic)
- **User Story 3 (Phase 5)**: Depends on Phase 3 (needs robots.txt generation integrated into build)
- **Polish (Phase 6)**: Depends on all previous phases

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational only — no dependencies on other stories
- **User Story 2 (P1)**: Depends on Foundational only — tests are independent; implementation verifies US1's fail-safe logic
- **User Story 3 (P2)**: Depends on US1 completion (needs generation integrated into build pipeline)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Integration into `buildConfiguration.js` before build verification

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T001/T002 and T003 can run in parallel (different files)
- T004 and T006 can run in parallel (same file but additive test cases — or sequential if preferred)
- US1 and US2 test phases can run in parallel

---

## Parallel Example: Setup + Foundation

```bash
# All three tasks touch different files — run in parallel:
Task T001: "Add VITE_APP_ROBOTS_ALLOW_INDEXING to .env"
Task T002: "Add /public/robots.txt to .gitignore"
Task T003: "Create generateRobotsTxt function in buildConfiguration.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003)
3. Complete Phase 3: User Story 1 (T004, T005)
4. **STOP and VALIDATE**: Run `VITE_APP_ROBOTS_ALLOW_INDEXING=true node buildConfiguration.js` and verify `public/robots.txt`
5. Production robots.txt is functional

### Incremental Delivery

1. Setup + Foundational → Generation function ready
2. Add User Story 1 → Production robots.txt works → MVP!
3. Add User Story 2 → Non-production fail-safe verified
4. Add User Story 3 → Build pipeline verified
5. Polish → All tests pass, lint clean

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This is a small feature (~30 lines of build logic); most "phases" are lightweight
- The `generateRobotsTxt` function is the core deliverable; everything else is integration and verification
- `buildConfiguration.js` is vanilla ESM JS — the unit test will need to import from it (ensure the function is exported)
- Commit after each logical group of tasks

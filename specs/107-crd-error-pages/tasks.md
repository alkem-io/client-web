---
description: "Task list for 107-crd-error-pages (story #9852)"
---

# Tasks: Port the Error Pages to CRD

**Input**: Design documents from `/specs/107-crd-error-pages/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓
**Story**: alkem-io/client-web#9852

**Tests**: REQUIRED — the spec and the story Verification section mandate `pnpm lint` + `pnpm vitest run` and explicitly call for extending the dispatcher tests. Tests are written test-first where feasible.

**Scope of this PR**: **P1 (US1) ships now.** US2 (P2), US3 (P3), US4 (P4) are captured below as **DEFERRED** phases (no tasks executed in this PR) so the task list stays a complete record of the feature.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = CRD 404 (this PR); US2/US3/US4 deferred

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the worktree builds and the existing suite is green before changes.

- [X] T001 Verify deps installed and baseline gates pass in the worktree: `pnpm install` (if needed), `pnpm vitest run` (record baseline pass count), `pnpm lint`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the i18n keys and confirm the reusable infra the CRD 404 depends on. The `notFound.*` keys must exist before the integration wrapper references them.

- [X] T002 [US1] Add the `notFound.*` block (`title`, `description`, `actions.goHome`, `actions.goBack`) to `src/crd/i18n/error/error.en.json` (English source of truth).
- [X] T003 [P] [US1] Add the translated `notFound.*` block to the other five locales: `error.nl.json`, `error.es.json`, `error.bg.json`, `error.de.json`, `error.fr.json` (one edit each, parallel-safe — different files).
- [X] T004 [US1] Confirm reusable infra is present and unchanged: `useCrdEnabled`, `isCrdRoute`, `hasInAppHistory`, `log404NotFound` (in `@/core/logging/sentry/log`), `usePageTitle`, `useNavigate`, `CrdLayoutWrapper`, `@/crd/primitives/button`, `cn()`. No code change — verification only.

**Checkpoint**: i18n keys exist in all six locales; the building blocks are confirmed.

---

## Phase 3: User Story 1 - CRD 404 / Not Found page (Priority: P1) 🎯 MVP

**Goal**: A CRD user hitting an unknown URL sees a CRD-styled 404 inside CRD chrome (no MUI), via both the in-router boundary and the `path="*"` catch-all; legacy users are unchanged.

**Independent Test**: Seed design version `2`, navigate to `/this-does-not-exist` → CRD 404 in CRD chrome. Seed `1` → MUI `Error404`. Covered by unit tests on the page, the branch wrapper, and the dispatcher; six-locale parity test.

### Tests for User Story 1 (write first, expect FAIL before impl)

- [X] T005 [P] [US1] Write `src/crd/components/error/CrdNotFoundPage.test.tsx` per contract (title/description render; go-home always + click; go-back gated on `showGoBack && onGoBack` + click; optional `search` slot). Expect FAIL (component not yet created).
- [X] T006 [P] [US1] Write `src/main/crdPages/error/CrdNotFoundBranch.test.tsx` per contract (`log404NotFound` called once on mount; tab title `notFound.title`; rendered in `crd-layout-wrapper`; go-back hidden when no history, `navigate(-1)` when present; go-home → `/home`). Expect FAIL.
- [X] T007 [US1] Update `src/main/crdPages/error/CrdAwareErrorComponent.test.tsx`: replace the `isNotFound (CRD 404 out of scope)` test with `renders CRD 404 when toggle on + CRD route + isNotFound`; add non-CRD-route→MUI, CRD-disabled→MUI, undefined-pathname→MUI cases; keep all 403 tests. Expect the new 404 assertions to FAIL.
- [X] T008 [P] [US1] Write `src/crd/i18n/error/error.parity.test.ts` (mirror `auth.parity.test.ts`) enforcing six-locale key parity for the `crd-error` namespace. Should PASS once T002/T003 are done (guards the new keys).

### Implementation for User Story 1

- [X] T009 [US1] Create `src/crd/components/error/CrdNotFoundPage.tsx` — props-only presentational page mirroring `CrdForbiddenPage` (Tailwind, `cn()`, `lucide-react` `FileQuestion`, `@/crd/primitives/button`), with the `CrdNotFoundPageProps` contract incl. optional `search` slot. Makes T005 PASS.
- [X] T010 [US1] Create `src/main/crdPages/error/CrdNotFoundBranch.tsx` — integration wrapper: `CrdLayoutWrapper` + `CrdNotFoundPage`, `useTranslation('crd-error')`, `usePageTitle(t('notFound.title'))`, `useEffect(() => log404NotFound(), [])` once, `hasInAppHistory()` gating, `useNavigate` for go-home (`/${TopLevelRoutePath.Home}`) and go-back (`navigate(-1)`). Makes T006 PASS.
- [X] T011 [US1] Extend `src/main/crdPages/error/CrdAwareErrorComponent.tsx` — add the `isNotFound` branch (`crdEnabled && isCrd && props.isNotFound === true → <CrdNotFoundBranch />`) before the MUI fallback, after the 403 branch. Makes the new T007 cases PASS, keeps 403 green.
- [X] T012 [US1] Wire the catch-all in `src/main/routing/TopLevelRoutes.tsx` — `path="*"` element renders `{crdEnabled ? <CrdNotFoundBranch /> : <TopLevelLayout><Error404 /></TopLevelLayout>}` (reusing the already-read `crdEnabled`; keep the `Error404` import for the MUI branch). Mirrors the `/restricted` toggle.

**Checkpoint**: CRD 404 fully functional via both entry points; all US1 tests green; legacy path unchanged.

---

## Phase 4: Polish & Verification (US1)

- [X] T013 [US1] Run targeted tests: the four new/updated test files all green (`pnpm vitest run <file> --reporter=basic`).
- [X] T014 [US1] Run full exit gates: `pnpm vitest run` (no regressions vs T001 baseline) and `pnpm lint` (TypeScript + Biome + ESLint clean). Fix any failures and re-run.
- [X] T015 [US1] Self-review the diff: confirm zero `@mui/*`/`@emotion/*` imports in new `src/crd/` and `src/main/crdPages/` files; confirm `CrdNotFoundPage` has no business-logic/router/GraphQL imports; confirm six-locale parity; confirm 403 + legacy 404 behaviour untouched.

**Checkpoint**: P1 mergeable.

---

## Phase 5: User Story 2 - CRD generic error page (Priority: P2) — DEFERRED

**Status**: Specified (FR-015), NOT implemented in this PR. Tracked as follow-up.

- [ ] T016 [US2] *(deferred)* `CrdErrorPage` under `src/crd/components/error/` (message, optional numeric code, reload action, dev-only stack behind a prop) + `generic.*` i18n.
- [ ] T017 [US2] *(deferred)* Wire the in-router generic branch via `CrdAwareErrorComponent` when CRD.
- [ ] T018 [US2] *(deferred)* Top-level Sentry fallback (`SentryErrorBoundaryProvider`) picks CRD vs MUI from `useCrdEnabled()` (localStorage, router-independent).

---

## Phase 6: User Story 3 - CRD lazy chunk-load dialog (Priority: P3) — DEFERRED

**Status**: Specified (FR-016), NOT implemented in this PR.

- [ ] T019 [US3] *(deferred)* Port `GlobalErrorDialog` to a CRD dialog primitive, gated on `useCrdEnabled()`, reusing `GlobalErrorContext`/`getGlobalErrorSetter` unchanged.

---

## Phase 7: User Story 4 - Cleanup dead MUI surfaces (Priority: P4) — DEFERRED

**Status**: Specified (FR-017), NOT implemented in this PR; gated on verification.

- [ ] T020 [US4] *(deferred)* After confirming unreferenced: remove `LoginPage`, `VerificationPage`, `RecoveryPage`, `EmailVerificationRequiredPage`, `ErrorRoute`. Leave `ErrorDisplay` and `LinesFitterErrorBoundary` (migrate with hosts).

---

## Dependencies & Execution Order

### Phase dependencies
- Setup (T001) → first.
- Foundational (T002–T004) → after Setup; T003 [P] parallel across five locale files; blocks US1 impl that references keys.
- US1 (T005–T012) → after Foundational. Tests (T005, T006, T008) [P] in parallel; T007 edits an existing test file (not [P] with itself). Impl T009 → unblocks T010 (imports the page) → T011 (imports the branch) and T012 (imports the branch). T011 and T012 touch different files and can run in parallel after T010.
- Polish/Verify (T013–T015) → after US1 impl.
- US2/US3/US4 (T016–T020) → DEFERRED, not in this PR.

### Within US1
- Test-first: T005/T006/T008 written before T009/T010; T007 updated before T011.
- Page (T009) before branch (T010); branch before dispatcher (T011) and catch-all (T012).

### Parallel opportunities
- T003: five locale files in parallel.
- T005, T006, T008: three independent new test files in parallel.
- T011 and T012: parallel after T010 (different files: dispatcher vs router).

## Implementation Strategy

MVP = US1 only. Complete Setup → Foundational → US1 → validate independently (seed `2`/`1` smoke test) → gates green → open PR. US2–US4 follow in separate PRs.

## Notes
- [P] = different files, no dependency.
- Commit in logical slices: (a) i18n keys + parity test, (b) presentational page + test, (c) branch wrapper + test, (d) dispatcher + catch-all + dispatcher test.
- All commits signed (repo requirement).
- Keep the tree green between commits.

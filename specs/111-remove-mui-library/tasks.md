---
description: "Task list for: Remove MUI library and code (story #9885)"
---

# Tasks: Remove MUI library and code

**Input**: Design documents from `/specs/111-remove-mui-library/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test tasks. The spec explicitly delivers documentation + committed
artifacts only with zero runtime change; verification is via grep checks + the
existing suite/build/lint staying green (see Phase 6).

**Organization**: Grouped by the three user stories from spec.md (US1 baseline,
US2 inventory, US3 documentation), each independently completable and verifiable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (baseline), US2 (inventory), US3 (docs)

## Path Conventions

Single web frontend repo. Deliverable artifacts live under
`specs/111-remove-mui-library/`; doc edits under repo root `CLAUDE.md`,
`.coderabbit.yaml`, and `docs/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the measurement environment and base state.

- [X] T001 Verify the worktree is on `story/9885-remove-mui-library-and-code` cut
  from `origin/develop`, and record the baseline commit SHA
  (`git rev-parse HEAD`).
- [X] T002 [P] Confirm the measurement tools are available without a backend:
  `grep`, `find`, and `pnpm analyze` (bundle analysis via
  `rollup-plugin-visualizer`).

**Checkpoint**: Base state known; measurement commands runnable.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Gather the raw measurements that BOTH the baseline (US1) and the
inventory (US2) depend on. Must complete before US1/US2.

**⚠️ CRITICAL**: US1 and US2 both consume these numbers.

- [X] T003 Capture the source-import metrics: count of `src/` files importing
  `@mui/*`, count importing `@emotion/*` directly, and total `.ts`/`.tsx` files
  (commands from quickstart.md §1).
- [X] T004 [P] Capture the distribution breakdown: MUI-importing files by
  top-level area, `src/core/ui` count, and import occurrences per `@mui/*`
  subpackage (quickstart.md §2).
- [X] T005 [P] Capture the runtime dependency list: every `@mui/*`/`@emotion/*`
  entry in `package.json` `dependencies` + `pnpm.overrides` Emotion pins
  (quickstart.md §3).
- [X] T006 [P] Enumerate the MUI surfaces for the inventory: confirm the
  `designVersion` toggle files, the MUI route tree in `TopLevelRoutes.tsx`, the
  `root.tsx` `ThemeProvider`, the legacy `translation.<lang>.json` files, and any
  MUI-importing `*.test.*` files.

**Checkpoint**: All raw numbers and surface lists in hand.

---

## Phase 3: User Story 1 - Footprint baseline (Priority: P1) 🎯 MVP

**Goal**: A reproducible, committed MUI footprint baseline.

**Independent Test**: Re-run quickstart.md §1/§3 on the baseline SHA and confirm
the recorded integers reproduce exactly.

- [X] T007 [US1] Write `specs/111-remove-mui-library/mui-footprint-baseline.md`
  per `contracts/footprint-baseline.contract.md`: provenance block, source-import
  metric + commands, distribution breakdown, runtime dependency list, bundle
  contribution method, dev-only exclusion note, reproduction section.
- [X] T008 [US1] Run `pnpm analyze`, read `build/stats.html`, and fill the
  production bundle contribution (raw + gzip where available) for the MUI/Emotion
  chunk(s) into the baseline. If the build cannot complete in-environment, record
  the method and the figure captured during the Phase 6 gate build.
- [X] T009 [US1] Self-verify the baseline against the contract: every numeric
  metric is paired with its reproducing command; re-running §1/§3 reproduces the
  integers (SC-002).

**Checkpoint**: Baseline complete and reproducible (FR-001..FR-004, FR-014;
SC-001, SC-002, SC-007).

---

## Phase 4: User Story 2 - Removal inventory (Priority: P1)

**Goal**: An authoritative, categorized MUI removal inventory with preconditions.

**Independent Test**: All six categories present; every entry has a non-empty
precondition; coverage assertion holds against a live `@mui/*` grep (zero
unclassified files).

- [X] T010 [US2] Write `specs/111-remove-mui-library/mui-removal-inventory.md`
  per `contracts/removal-inventory.contract.md`: one section per category
  (`runtime-library`, `view-component`, `route-dialog-condition`,
  `coupled-business-logic`, `mui-test`, `legacy-translation`), each row with
  path(s)/glob, count, unblocking precondition, removal owner, notes.
- [X] T011 [US2] Add the coverage assertion: state (with the reproducing grep)
  that the `view-component` + `coupled-business-logic` + `route-dialog-condition`
  + `mui-test` rows account for all currently `@mui/*`-importing `.ts`/`.tsx`
  files — zero unclassified (FR-007, SC-003).
- [X] T012 [US2] Add the ordering note: `runtime-library` removal is last, gated
  on source MUI import count == 0; legacy-translation removal includes the
  extract-still-used-strings-into-a-new-legacy-file procedure as a deferred step.
- [X] T013 [US2] Self-verify against the contract: six categories present, every
  precondition non-empty (FR-005, FR-006; SC-004).

**Checkpoint**: Inventory complete and verified.

---

## Phase 5: User Story 3 - Documentation accuracy (Priority: P2)

**Goal**: Docs reflect the migration-gated removal policy and link the artifacts.

**Independent Test**: No doc presents MUI as the design system for new/future
work; every remaining MUI reference is historical context or states the
frozen/removal-in-progress policy.

- [X] T014 [US3] Update `CLAUDE.md` Overview so the MUI/Emotion design-system
  sentence is qualified as frozen and being removed in favour of CRD (FR-008).
  (The "Recent Changes"/"Active Technologies" trailer is owned by the
  agent-context step and already updated.)
- [X] T015 [P] [US3] Add links to `mui-footprint-baseline.md` and
  `mui-removal-inventory.md` from `docs/crd/migration-guide.md` (FR-013).
- [X] T016 [P] [US3] Review `.coderabbit.yaml` and the `docs/` set
  (`i18n.md`, `svg.md`, `crd/why-shadcn.md`, `crd/migration-guide.md`,
  `crd/suspense-teardown-audit.md`, `crd/markdown-editor.md`, `crd/notifications.md`)
  for MUI references; correct only statements that are outdated or contradict the
  constitution's MUI-frozen / CRD-only policy; leave accurate historical context
  intact (FR-009).
- [X] T017 [US3] Self-verify: grep the doc set for MUI and confirm SC-005 holds.

**Checkpoint**: Documentation accurate and artifacts discoverable.

---

## Phase 6: Polish & Exit Gates

**Purpose**: Prove zero behavioral change and green gates (FR-010..FR-012; SC-006).

- [X] T018 Confirm no `src/` file, no `package.json` dependency, no route, and no
  `translation.<lang>.json` was modified (git diff scoped to docs + spec dir only)
  — FR-010, FR-011.
- [X] T019 Run the full exit-gate sequence: `pnpm vitest run`, then `pnpm build`,
  then `pnpm lint` — all must pass (FR-012, SC-006). Capture the production MUI
  chunk size from this build into the baseline if not already filled (T008).
- [X] T020 Commit in logical slices (artifacts; documentation) with signed
  commits.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: After Setup. BLOCKS US1 and US2 (both consume the
  measurements/surface lists).
- **US1 (Phase 3)** and **US2 (Phase 4)**: After Foundational; independent of each
  other (different artifact files) — can run in parallel.
- **US3 (Phase 5)**: After US1+US2 exist (it links them); doc edits are otherwise
  independent and the `[P]` items touch different files.
- **Polish/Gates (Phase 6)**: Last.

### Within Each User Story

- US1: T007 → T008 → T009.
- US2: T010 → T011/T012 → T013.
- US3: T014, T015, T016 (parallel, different files) → T017.

### Parallel Opportunities

- T004, T005, T006 in parallel (Foundational).
- US1 (T007–T009) and US2 (T010–T013) in parallel once Foundational is done.
- T015 and T016 in parallel (different files).

---

## Implementation Strategy

### MVP First

1. Phase 1 Setup → Phase 2 Foundational.
2. Phase 3 US1 (baseline) — the MVP increment (directly satisfies AC #8).
3. Phase 4 US2 (inventory).
4. Phase 5 US3 (docs).
5. Phase 6 gates.

### Notes

- [P] tasks = different files, no dependencies.
- No runtime code is touched; the gates must pass with zero behavioral change.
- Commit after each story's artifact and after the doc edits; signed commits.

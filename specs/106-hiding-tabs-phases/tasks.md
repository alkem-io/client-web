# Tasks: Hiding tabs/phases (CRD implementation)

**Feature**: `specs/106-hiding-tabs-phases` | **Branch**: `story/9727-hiding-tabs-phases` | **Story**: client-web#9727
**Input**: plan.md, research.md, data-model.md, contracts/{innovation-flow-state-visibility.graphql.md, ui-hide-show-phase.md}, spec.md

Scope: client-web only, **CRD architecture** (`src/crd/` + `src/main/crdPages/` integration layer) —
new features go into CRD, never the legacy MUI tree. The server `InnovationFlowStateSettings.visible`
field is an **external dependency** (alkem-io/server#6138), not a task here. The client wires against
it defensively and guards on its presence (graceful degradation).

> **Rework note.** This task list was rewritten after the original implementation landed in the wrong
> layer (the legacy MUI `InnovationFlowDragNDropEditor` tree). The MUI changes were reverted and the
> feature re-implemented in CRD. Behaviour and acceptance criteria are unchanged from spec.md; only the
> target files differ. Tasks below reflect the CRD implementation as shipped.

Conventions: React Compiler enabled (no manual `useMemo`/`useCallback`/`React.memo`). No barrel
`index.ts` exports — explicit import paths. CRD components are purely presentational (props-only, no
Apollo/domain/routing). CRD i18n via `useTranslation('crd-spaceSettings')`; keys added to all 6 locales.

---

## Phase 1: Setup

- [X] T001 Verify toolchain and baseline green in the worktree: `pnpm vitest run`, `pnpm build`, `pnpm lint`. Acceptance: gates pass on the baseline checkout (pre-existing, unrelated lint debt aside).

## Phase 2: Foundational (shared data contract — not MUI-specific)

- [X] T002 Add optional `visible?: boolean` to `settings` in `src/domain/collaboration/InnovationFlow/models/InnovationFlowStateModel.ts`. Acceptance: type compiles; `settings` is `{ allowNewCallouts: boolean; visible?: boolean }`; no other field changed.
- [X] T003 [P] Update GraphQL fragment source `src/domain/collaboration/InnovationFlow/graphql/InnovationFlowStates.fragment.graphql` to select `settings { allowNewCallouts visible }`. Acceptance: fragment requests `visible`; valid GraphQL. (Inert until `pnpm codegen` runs against a server exposing the field.)
- [X] T004 [P] Update mutation `UpdateInnovationFlowState` source `src/domain/collaboration/InnovationFlow/graphql/UpdateInnovationFlowStates.graphql` (and `SpaceTabs.graphql`) to select `settings { allowNewCallouts visible }`. Acceptance: selection includes `visible`.
- [X] T005 Record in the PR body that `pnpm codegen` against a live backend (server#6138) is required once the server exposes `settings.visible`, and that generated `apollo-hooks.ts`/`graphql-schema.ts` are intentionally NOT regenerated in this PR. Acceptance: PR body records the codegen follow-up; no generated files hand-edited.

## Phase 3: User Story 1 — Admin hides a phase/tab (Priority: P1) 🎯 MVP

**Goal**: An admin can hide a visible phase via the per-phase (column) menu on the CRD Space-Settings
Layout surface, confirm via the CRD `ConfirmationDialog` that explains the hide is UI-only, and the
phase disappears from member-facing CRD navigation.

**Independent test**: As admin, open the phase column kebab → "Hide from menu" → confirm; verify the
dialog copy and that a non-admin no longer sees the phase in CRD navigation while its direct URL still loads.

- [X] T006 [P] [US1] Create the pure selector `src/domain/collaboration/InnovationFlow/utils/filterVisibleStates.ts`: `filterVisibleStates(states, canEditFlow)` returns all states for admins, all when no state carries a boolean `visible` (capability absent), else members get `visible !== false`. Generic over `{ settings: object }` so it accepts the generated state types and reads `visible` defensively. Acceptance: pure (no Apollo/side effects); reused by the CRD member paths.
- [X] T007 [P] [US1] Unit test `src/domain/collaboration/InnovationFlow/utils/filterVisibleStates.test.ts` (Vitest): admin sees all; member sees only visible; absent-field => all shown; all-hidden => empty for member. Acceptance: passes.
- [X] T008 [P] [US1] Add CRD i18n keys under `layout.column.hideShow.*` (`hideMenuLabel`, `showMenuLabel`, `hiddenBadge`, `confirm.{title,description,confirm,cancel}`) to all 6 `src/crd/i18n/spaceSettings/spaceSettings.<lang>.json` files. `confirm.description` MUST state the hide is UI-only and content stays reachable by URL (FR-003). Acceptance: keys present in en, nl, es, bg, de, fr; copy matches FR-003 wording.
- [X] T009 [US1] Extend CRD component contracts in `src/crd/components/space/settings/SpaceSettingsLayoutView.types.ts`: add `isHidden?: boolean` to `LayoutPoolColumn`; add `onToggleVisibility?: (columnId, nextHidden) => Promise<void>` to `ColumnMenuActions`. Acceptance: plain TS props, documented as UI-only / graceful-degradation gated.
- [X] T010 [US1] Add the Hide/Show kebab entry + hide confirmation to `src/crd/components/space/settings/LayoutPoolColumn.tsx`: gate the entry on `onToggleVisibility` present AND `typeof column.isHidden === 'boolean'` (FR-016); "Hide from menu" (EyeOff) when visible routes through the CRD `ConfirmationDialog` (`hideShow.confirm.*` copy, FR-002/FR-003); confirm calls `onToggleVisibility(id, true)`; cancel makes no change (FR-005). Acceptance: presentational only; keyboard-accessible Radix dropdown + alert dialog; non-admins never reach it (admin-gated surface, FR-010).
- [X] T011 [US1] Derive `isHidden` in the integration mapper `src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.ts`: `column.isHidden = !state.settings.visible` when `visible` is a boolean, else `undefined` (defensive read — FR-016 graceful degradation). Acceptance: covered by `layoutMapper.test.ts`.
- [X] T012 [US1] Add `onToggleVisibility(columnId, nextHidden)` to `src/main/crdPages/topLevelPages/spaceSettings/layout/useLayoutTabData.ts`: optimistically flip `isHidden` on buffer + snapshot (immediate-save, not part of the Save buffer — mirrors active-phase/default-template actions), then fire `updateInnovationFlowState` carrying the unchanged `displayName`/`description`/`allowNewCallouts` plus the new `visible` flag, and refetch InnovationFlowSettings. Acceptance: hide persists + is shared across viewers (FR-004); no authorization/content code touched, so content stays reachable by URL (FR-007).
- [X] T013 [US1] Forward the callback through `src/main/crdPages/topLevelPages/spaceSettings/layout/useColumnMenu.ts` (`onToggleVisibility` option → `ColumnMenuActions`) and wire it in `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` (`useColumnMenu({ ..., onToggleVisibility: layout.onToggleVisibility })`). Acceptance: the affordance is present on both the L0 "space settings > layout" screen and the subspace L1/L2 "manage innovation flow" layout (FR-013) — both render `SpaceSettingsLayoutView` (FR-014); no dead menu item.
- [X] T014 [US1] Apply `filterVisibleStates` at the member-facing CRD navigation sources, passing the flow Update privilege as `canEditFlow`: `src/main/crdPages/subspace/hooks/useCrdSubspace.ts` (subspace flow tabs → `SubspaceFlowTabs`) and `src/main/crdPages/space/hooks/useCrdSpaceTabs.tsx` (space tabs). Acceptance: non-admin nav excludes hidden phases (FR-006); admin nav unchanged (FR-011); default tab selects first visible state and an all-hidden flow yields the existing empty/neutral nav state, not an error (FR-015).

**Checkpoint**: US1 is independently shippable — hide works end-to-end with CRD confirmation and member filtering.

## Phase 4: User Story 2 — Admin re-shows a hidden phase (Priority: P2)

**Goal**: An admin can unhide a hidden phase from the same kebab, with no confirmation, restoring it.

**Independent test**: With a phase hidden, open its column kebab → "Show in menu" → verify it reappears in member nav.

- [X] T015 [US2] In `LayoutPoolColumn.tsx`, make the visibility entry state-aware: label `showMenuLabel` (Eye icon) when `column.isHidden`, else `hideMenuLabel` (EyeOff) (FR-009). Acceptance: hidden phase shows "Show in menu"; visible phase shows "Hide from menu".
- [X] T016 [US2] In `LayoutPoolColumn.tsx`, route Show directly to `onToggleVisibility(id, false)` WITHOUT a confirmation dialog (A-007), while Hide still confirms. Acceptance: unhide is one click, no dialog; phase reappears for members after refetch (FR-008).

**Checkpoint**: Hide/Show is fully reversible.

## Phase 5: User Story 3 — Admin distinguishes hidden phases (Priority: P3)

**Goal**: Hidden phases are visually marked in the CRD layout surface so admins see them at a glance.

**Independent test**: With one hidden and one visible phase, open the CRD layout editor and confirm the
hidden one carries a "Hidden" badge.

- [X] T017 [US3] (i18n) `layout.column.hideShow.hiddenBadge` key added across all 6 locales in T008. Acceptance: key present.
- [X] T018 [US3] In `LayoutPoolColumn.tsx`, render a subtle "Hidden" `Badge` (secondary variant, EyeOff icon) on a column card when `column.isHidden` (admin-only surface), alongside the existing "Active phase" badge. Acceptance: hidden columns show the badge; visible columns unchanged (FR-012); no layout breakage.

## Phase 6: Polish & Cross-Cutting

- [X] T019 [P] Accessibility pass on the new kebab entry, "Hidden" badge, and hide dialog: keyboard focus order, decorative icons `aria-hidden`, dialog announced/focus-trapped (Radix AlertDialog). Acceptance: WCAG 2.1 AA per CRD accessibility rules + Constitution V.
- [X] T020 Add CRD-side unit test for the pure selector logic: `layoutMapper.test.ts` covers `isHidden` mapping (visible:false → hidden; absent → undefined). Acceptance: `pnpm vitest run` includes the new cases, all green.
- [X] T021 Run the full local exit gates in order: `pnpm lint` (tsc + biome + eslint), `pnpm vitest run`, `pnpm build`. Acceptance: tsc clean; my files 0 biome errors; 1451 tests pass; build succeeds. (Pre-existing, unrelated branch lint debt in untouched files is out of scope.)

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T005)** → **US1 (T006–T014)** → **US2 (T015–T016)** → **US3 (T017–T018)** → **Polish (T019–T021)**.
- T002 (model `visible`) underpins the defensive reads in T011/T012/T014.
- T003/T004 (GraphQL source) are inert until the server field + codegen land but are prerequisites for the data to arrive; done in Foundational.
- CRD component contracts (T009) precede the component edits (T010, T015, T016, T018) and the integration wiring (T011–T014).
- US2 and US3 both depend on US1 being in place (kebab entry + callback + mapping).

## Parallel Opportunities

- Foundational: T003 and T004 in parallel (different `.graphql` files).
- US1: T006, T007, T008 in parallel (selector, its test, i18n — different files) before the component + integration wiring (T009–T014).

## MVP scope

User Story 1 (Phase 3) alone delivers the core story: hide a phase with a CRD confirmation dialog and
have it filtered from member navigation. US2 (reversibility) and US3 (indicator) are fast follow-ons.

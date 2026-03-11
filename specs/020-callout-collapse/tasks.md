# Tasks: Configurable Callout Collapse/Expand State

**Input**: Design documents from `/specs/020-callout-collapse/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (GraphQL & Codegen)

**Purpose**: Update GraphQL documents and regenerate types so the new `layout.calloutDescriptionDisplayMode` field is available to client code.

**Prerequisites**: Server branch `043-callout-collapse` must be deployed and running at `localhost:4000/graphql`.

- [ ] T001 Add `layout { calloutDescriptionDisplayMode }` to the `SpaceSettings` fragment in `src/domain/spaceAdmin/SpaceAdminSettings/graphql/SpaceSettings.graphql`
- [ ] T002 Add `layout { calloutDescriptionDisplayMode }` to the mutation response in `src/domain/spaceAdmin/SpaceAdminSettings/graphql/UpdateSpaceSettings.graphql`
- [ ] T003 Run `pnpm codegen` to regenerate types and hooks in `src/core/apollo/generated/`
- [ ] T004 Verify `CalloutDescriptionDisplayMode` enum and `SpaceSettingsLayout` type exist in `src/core/apollo/generated/graphql-schema.ts`

**Checkpoint**: Generated types include the new enum and layout type. `pnpm lint` passes.

---

## Phase 2: Foundational (Types, Defaults & Core Component)

**Purpose**: Client-side type model, default values, and `ExpandableMarkdown` enhancement. MUST complete before any user story.

- [ ] T005 [P] Add `SpaceSettingsLayout` interface (importing the generated `CalloutDescriptionDisplayMode` enum) to `src/domain/space/settings/SpaceSettingsModel.ts`
- [ ] T006 [P] Add `layout` default (`calloutDescriptionDisplayMode: CalloutDescriptionDisplayMode.Expanded`) to `src/domain/spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings.tsx`
- [ ] T007 [P] Add `defaultCollapsed?: boolean` prop to `ExpandableMarkdown` in `src/core/ui/markdown/ExpandableMarkdown.tsx`. When `true` and overflow is detected, resolve `detecting` state to `'collapsed'` instead of `'expanded'`. When `false`/`undefined`, preserve current behavior (resolve to `'expanded'`).
- [ ] T008 [P] Add i18n keys for the layout setting labels (e.g., setting title, collapsed/expanded option labels) to `src/core/i18n/en/translation.en.json`

**Checkpoint**: `pnpm lint` passes. `ExpandableMarkdown` supports `defaultCollapsed` prop. Types and defaults are in place.

---

## Phase 3: User Story 1 — Space Admin Configures Callout Display Mode (Priority: P1) — MVP

**Goal**: Space admins can toggle the callout description display mode (Collapsed/Expanded) via the Space Admin Layout tab (L0) or Settings tab (L1/L2), and the setting persists via the `updateSpaceSettings` mutation.

**Independent Test**: Navigate to Space -> Admin -> Layout tab, toggle the setting, verify it saves and persists across page reloads.

### Implementation for User Story 1

- [ ] T009 [US1] Extend `useSpaceSettingsUpdate` hook in `src/domain/spaceAdmin/SpaceAdminSettings/useSpaceSettingsUpdate.ts`: add `layout` to `SpaceSettingsUpdateParams` interface, `UseSpaceSettingsUpdateProps.currentSettings`, optimistic state reducer, and `settingsVariable` in the mutation call
- [ ] T010 [US1] Create a `CalloutDisplayModeSettings` component (following the `MemberActionsSettings` pattern) that renders a labeled switch or radio group for Collapsed/Expanded and calls `updateSettings` on change. Place it in `src/domain/spaceAdmin/SpaceAdminSettings/components/CalloutDisplayModeSettings.tsx`
- [ ] T011 [US1] Add the `CalloutDisplayModeSettings` toggle to `SpaceAdminLayoutPage` in `src/domain/spaceAdmin/SpaceAdminLayout/SpaceAdminLayoutPage.tsx` as a new `PageContentBlock` below the existing Innovation Flow editor block. Wire it to the space settings query and `useSpaceSettingsUpdate` hook.
- [ ] T012 [US1] Add the `CalloutDisplayModeSettings` toggle to the Settings tab for subspaces (L1/L2) in `src/domain/spaceAdmin/SpaceAdminSettings/SpaceAdminSettingsPage.tsx` so each subspace can independently configure its display mode.

**Checkpoint**: Admin can toggle the setting in L0 Layout tab and L1/L2 Settings tab. Setting persists. `pnpm lint` passes.

---

## Phase 4: User Story 2 — Consistent Callout State Across a Space (Priority: P1)

**Goal**: All callouts with markdown descriptions in a space render with the configured default collapse/expand state on page load.

**Independent Test**: Set a space to "Collapsed", navigate to any page with callouts, verify all are collapsed. Switch to "Expanded", verify all are expanded.

### Implementation for User Story 2

- [ ] T013 [US2] Add a GraphQL query or fragment to fetch `settings.layout.calloutDescriptionDisplayMode` in the callout rendering context. Determine the optimal placement — either extend an existing space query used by `CalloutsView`/`CalloutPage`, or create a lightweight dedicated query. Ensure the query result is available where `CalloutViewLayout` is rendered.
- [ ] T014 [US2] Thread the `calloutDescriptionDisplayMode` value as a prop through the callout component tree: from the query result through `CalloutsView` → `CalloutView` → `CalloutViewLayout`. Add `defaultCollapsed?: boolean` to the relevant prop types (`BaseCalloutViewProps`, `CalloutLayoutProps`).
- [ ] T015 [US2] In `CalloutViewLayout` (`src/domain/collaboration/callout/CalloutView/CalloutViewLayout.tsx`), pass `defaultCollapsed` to the `ExpandableMarkdown` component, computed as `calloutDescriptionDisplayMode === CalloutDescriptionDisplayMode.Collapsed`.
- [ ] T016 [US2] Ensure the `CalloutPage` full-screen dialog view (`src/domain/collaboration/CalloutPage/CalloutPage.tsx`) also receives and passes the display mode to `CalloutView` for consistency.

**Checkpoint**: All callouts in a space reflect the configured display mode. Changing the setting in admin reactively updates callouts (FR-011) via Apollo cache propagation. `pnpm lint` passes.

---

## Phase 5: User Story 3 — User Temporarily Toggles Individual Callout (Priority: P2)

**Goal**: Users can still click "Read More"/"Show Less" to temporarily override the default state, with the state resetting on navigation.

**Independent Test**: In a "Collapsed" space, click "Read More" on a callout — it expands. Navigate away and back — it reverts to collapsed.

### Implementation for User Story 3

- [ ] T017 [US3] Verify that `ExpandableMarkdown`'s existing "Read More"/"Show Less" toggle still works correctly with the new `defaultCollapsed` prop. The user toggle between `'expanded'` and `'collapsed'` states must remain functional regardless of the initial default. No code changes expected — this is a verification task.
- [ ] T018 [US3] Verify that on navigation (component unmount/remount), the `ExpandableMarkdown` state resets to the space's configured default (re-enters `'detecting'` and resolves based on `defaultCollapsed`). No code changes expected — React's component lifecycle handles this naturally.

**Checkpoint**: Temporary toggle works in both Collapsed and Expanded default modes. State resets on navigation.

---

## Phase 6: User Story 4 — Default Behavior for New and Existing Spaces (Priority: P1)

**Goal**: Existing spaces show expanded callouts (no regression). New spaces default to collapsed. Missing/null values fall back to expanded.

**Independent Test**: Check an existing space — callouts expanded. Create a new space — callouts collapsed.

### Implementation for User Story 4

- [ ] T019 [US4] Ensure the client fallback for missing/null `calloutDescriptionDisplayMode` resolves to `EXPANDED`. Verify this in the component that reads the setting (from T013/T014) — use nullish coalescing to default to `CalloutDescriptionDisplayMode.Expanded` when the value is absent.
- [ ] T020 [US4] Verify that `SpaceDefaultSettings.tsx` uses `CalloutDescriptionDisplayMode.Expanded` as the default, ensuring the optimistic state and admin UI show "Expanded" for existing spaces that haven't been explicitly configured.

**Checkpoint**: Existing spaces remain expanded. New spaces (server-side default `COLLAPSED`) display collapsed. Fallback is safe.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Lint, type-check, and validate the complete feature.

- [ ] T021 Run `pnpm lint` to verify TypeScript and ESLint pass across all modified files
- [ ] T022 Run `pnpm vitest run` to verify no existing tests are broken
- [ ] T023 Manually validate the full feature flow per `specs/020-callout-collapse/quickstart.md` verification steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — requires running backend with new schema
- **Foundational (Phase 2)**: Depends on Phase 1 (codegen must complete first)
- **US1 (Phase 3)**: Depends on Phase 2 — admin UI needs types, defaults, and hook
- **US2 (Phase 4)**: Depends on Phase 2 — callout rendering needs `ExpandableMarkdown` enhancement and types
- **US3 (Phase 5)**: Depends on Phase 2 + Phase 4 — verification of existing behavior with new prop
- **US4 (Phase 6)**: Depends on Phase 2 — verification of fallback defaults
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)** and **US2 (P1)**: Can proceed **in parallel** after Phase 2 — they touch different files
- **US3 (P2)**: Depends on US2 completion (needs `defaultCollapsed` wired through to verify)
- **US4 (P1)**: Can proceed in parallel with US1/US2 after Phase 2 — only verifies defaults

### Within Each User Story

- GraphQL/type changes before component changes
- Hook changes before UI component changes
- Container changes before view changes

### Parallel Opportunities

- T005, T006, T007, T008 (Phase 2) can all run in parallel — different files
- US1 (Phase 3) and US2 (Phase 4) can run in parallel after Phase 2
- US4 (Phase 6) can run in parallel with US1/US2
- T009, T010 within US1 can run in parallel (hook vs. component)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# All four tasks touch different files — launch in parallel:
Task T005: "Add SpaceSettingsLayout interface in src/domain/space/settings/SpaceSettingsModel.ts"
Task T006: "Add layout default in src/domain/spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings.tsx"
Task T007: "Add defaultCollapsed prop to ExpandableMarkdown in src/core/ui/markdown/ExpandableMarkdown.tsx"
Task T008: "Add i18n keys in src/core/i18n/en/translation.en.json"
```

## Parallel Example: US1 + US2 (after Phase 2)

```bash
# US1 and US2 touch different parts of the codebase — launch in parallel:
# US1 stream: T009 → T010 → T011, T012
# US2 stream: T013 → T014 → T015 → T016
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (GraphQL + codegen)
2. Complete Phase 2: Foundational (types, defaults, ExpandableMarkdown)
3. Complete Phase 3: US1 (admin toggle)
4. Complete Phase 4: US2 (callout rendering integration)
5. **STOP and VALIDATE**: Admin can toggle setting, callouts reflect it, reactive updates work
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → GraphQL and core ready
2. Add US1 → Admin can configure → Demo admin UI
3. Add US2 → Callouts respond to setting → Demo full feature
4. Add US3 → Verify temporary toggle → Regression check
5. Add US4 → Verify defaults → Migration safety check
6. Polish → Lint, test, validate → Ship

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US3 and US4 are primarily verification tasks — minimal or no new code expected
- Server branch `043-callout-collapse` must be deployed before Phase 1 can start
- Commit after each phase or logical task group
- Stop at any checkpoint to validate independently

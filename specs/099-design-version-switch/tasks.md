---
description: "Task list for Design Version Switch (MUI ↔ CRD)"
---

# Tasks: Design Version Switch (MUI ↔ CRD)

**Input**: Design documents from `/specs/099-design-version-switch/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit tests for the two new hooks (Vitest) are explicitly required per plan.md (Testing section). UI render assertions are covered by the manual scenarios in quickstart.md — no additional component test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. Phase 2 (Foundational) is shared infrastructure that all three stories depend on.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Different file, no ordering dependency on other [P] tasks in the same phase — safe to parallelize.
- **[Story]**: US1 / US2 / US3 maps to spec.md user stories.
- All file paths are absolute from the repo root.

## Path Conventions

Single React SPA project (no backend/frontend split). All paths are `src/...` from the repo root `/Users/borislavkolev/WebstormProjects/client-web/`.

---

## Phase 1: Setup (Shared Prerequisites)

**Purpose**: External preconditions that must be true before any code is written.

- [X] T001 Verify server deploy that adds `UserSettings.designVersion` is live against the backend at `localhost:4000/graphql`. Inspect the schema (e.g., via GraphQL Playground introspection) and confirm `UserSettings.designVersion: String` and `UpdateUserSettingsEntityInput.designVersion: String` are present. If not, **stop here** — server work must complete first.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared plumbing (storage helpers, GraphQL field, context exposure, translation keys). Every user story depends on these.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

- [X] T002 [P] Extend `src/main/crdPages/useCrdEnabled.ts` to export `readCrdEnabledFromStorage(): boolean | null` (returns `null` when the LS key is unset or unreadable) and `writeCrdEnabledToStorage(enabled: boolean): void`. **Do not change the default**: `useCrdEnabled()` keeps returning `false` when LS is unset or throws — same as today. The existing `CRD_TOGGLE_STORAGE_KEY` export stays. Keep the hook synchronous.
- [X] T003 Add `settings { id designVersion }` to the `me { user { ... } }` selection in `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserLight.graphql` per `specs/099-design-version-switch/contracts/CurrentUserLight.graphql.diff`. The `id` is included alongside `designVersion` to keep the Apollo cache normalized with the heavier `userSettings` query that already selects `settings { id ... }`. Do not remove or rename any existing fields.
- [X] T004 Run `pnpm codegen` and commit the regenerated `src/core/apollo/generated/graphql-schema.ts` and `src/core/apollo/generated/apollo-hooks.ts`. Confirm `designVersion` now appears on `UserSettings` and `UpdateUserSettingsEntityInput`. Depends on T001 + T003. **Schema discovery**: the field is `Int` (non-null), not `String` — values `1`, `2`, `3+` reserved. Planning docs corrected to reflect this.
- [X] T005 Update `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider.tsx` and `src/domain/community/userCurrent/model/CurrentUserModel.ts` to read `data?.me?.user?.settings?.designVersion` (server type is non-null `Int` per the regenerated schema; values `1`, `2`, `3+` reserved), normalize anything outside `{1, 2}` to `undefined`, and expose `designVersion: 1 | 2 | undefined` on the returned model so it is accessible via `useCurrentUserContext()`. Depends on T004.
- [X] T006 [P] Add two new keys to `src/core/i18n/en/translation.en.json` under `topBar.designVersion`: `label` ("New design") and `caption` ("Beta — the old design will remain available for a short time."). English only — Crowdin handles other locales.
- [X] T007 [P] Add `designVersion.label` and `designVersion.caption` (nested under `header`) to all six CRD layout locale files: `src/crd/i18n/layout/layout.{en,nl,es,bg,de,fr}.json`. Translated AI-assisted in each locale.

**Checkpoint**: Foundation complete — user-story phases can begin. T002, T006, T007 can run in parallel; T003 → T004 → T005 are sequential.

---

## Phase 3: User Story 1 — Switch the active design from the user menu (Priority: P1) 🎯 MVP

**Goal**: Authenticated users see a working toggle above "Dashboard" in both the CRD and MUI user menus. Clicking it saves the preference server-side, updates LS, reloads the page, and the other design renders. A Sentry info-log event fires on every successful toggle.

**Independent Test**: Sign in as any user, open the user menu in whichever shell is currently active, flip the toggle, confirm the other shell loads with the toggle now visible in its correct state. Confirm the mutation fires (Network tab) and a Sentry `DESIGN_VERSION_SWITCH` info log is emitted. Matches quickstart Scenarios D and E.

### Implementation

- [X] T008 [US1] Create `src/main/crdPages/useDesignVersionToggle.ts` exporting a hook that returns the `DesignVersionToggleState` shape defined in `specs/099-design-version-switch/data-model.md`. Internally: reads current user via `useCurrentUserContext()`, calls `useUpdateUserSettingsMutation` from the generated Apollo hooks, sets `enabled` from `useCrdEnabled()`, sets `isVisible = isAuthenticated && !loadingMe && userID present`. On `onChange(enabled)`: await `updateUserSettings({ settingsData: { userID, settings: { designVersion: enabled ? 2 : 1 } } })`; on success → `writeCrdEnabledToStorage(enabled)` → `logInfo` (from `@/core/logging/sentry/log`) with `{ label: 'DESIGN_VERSION_SWITCH', category: TagCategoryValues.UI }` → `window.location.reload()`. On error → `useNotification()` with severity `'error'` and key `topBar.designVersion.errorSaving`, and DO NOT update LS or reload. Depends on T002 + T005.
- [X] T009 [US1] Update `src/crd/layouts/components/UserMenu.tsx`, `Header.tsx`, `CrdLayout.tsx`, and `types.ts` (shared `CrdDesignVersionSwitch`) to accept a new optional prop:
    ```ts
    designVersionSwitch?: {
      enabled: boolean;
      onChange: (enabled: boolean) => void;
      label: string;
      infoText: string;
      disabled?: boolean;
    };
    ```
    Render a non-navigating row above the Dashboard `DropdownMenuItem` (currently around line 90) when the prop is present: use `Switch` from `@/crd/primitives/switch`, pair with `label`, render `infoText` beneath as a muted caption. Use `onSelect={(e) => e.preventDefault()}` on the wrapper so the menu does not close on click. **Do not import any non-presentational module** — the component remains pure per `src/crd/CLAUDE.md`. The label and caption strings come from the `crd-layout` namespace via `useTranslation('crd-layout')` (`header.designVersion.label`, `header.designVersion.caption`), matching the rest of `UserMenu.tsx`. The simplified prop is `{ enabled, onChange, disabled? }`. The row carries `role="switch"` + `aria-checked` for accessibility, the visual Switch is `aria-hidden` to avoid double-announcement, and the caption is associated via `aria-describedby`. Depends on T007.
- [X] T010 [US1] Wire `useDesignVersionToggle()` in the CRD layout integration layer at `src/main/ui/layout/CrdLayoutWrapper.tsx`, derive `designVersionSwitch` from the returned state, and forward it through `CrdLayout` → `Header` → `UserMenu` (added a passthrough prop on each). The CRD presentational components remain free of Apollo/business logic. Depends on T008 + T009.
- [X] T011 [US1] Update `src/main/ui/platformNavigation/PlatformNavigationUserMenu.tsx`: call `useDesignVersionToggle()` at the component top, and when `isVisible` is true, render a `<Box>` row directly above the existing "Dashboard" `NavigatableMenuItem`. The row contains a `<FormControlLabel control={<Switch size="small" checked={enabled} onChange={(_, v) => onChange(v)} disabled={isPending} />} label={t('topBar.designVersion.label')} labelPlacement="start" />` plus a `<Caption color="neutralMedium.main">{t('topBar.designVersion.caption')}</Caption>` beneath, followed by a `UserMenuDivider`. Depends on T006 + T008.
- [X] T012 [P] [US1] Add `src/main/crdPages/useDesignVersionToggle.test.ts` with Vitest covering: (a) `isVisible` is `false` for anonymous / loading / missing-userID states; (b) `isVisible` is `true` for a fully loaded user with `enabled` mirroring `useCrdEnabled`; (c) `isPending` reflects mutation loading; (d) on successful `onChange(true)`/`onChange(false)`, the mutation is called with the right `designVersion: 2`/`1` int, LS is written, the Sentry `info` helper is called with the expected label, and `window.location.reload` is invoked; (e) on mutation rejection, LS is NOT touched, `reload` is NOT called, the notification helper IS called with `'error'` severity. 8 tests, all passing. Depends on T008.

**Checkpoint**: User Story 1 is fully functional. Toggling from either menu now writes to the server, updates LS, reloads, and emits the analytics event. SC-001, SC-002, SC-007, FR-001 through FR-006, FR-010, FR-012, FR-014, FR-016 are all verifiable manually via quickstart Scenarios D and E.

---

## Phase 4: User Story 2 — Design preference follows the user across devices (Priority: P2)

**Goal**: When an authenticated user lands on a fresh browser/device, the saved preference is fetched and — if it disagrees with the local cache — exactly one reconciliation reload runs so the user lands in the design they previously chose.

**Independent Test**: With LS deliberately set to the "wrong" value (e.g. `alkemio-design-version='1'` for a user whose server preference is `2`), reload the page. Confirm the cached shell renders briefly, then the page reloads exactly once to the saved design. Matches quickstart Scenario B and Scenario I.

### Implementation

- [X] T013 [US2] Create `src/main/crdPages/useDesignVersionSync.ts`. Logic per `specs/099-design-version-switch/research.md` R4: read `useCurrentUserContext()`; if not authenticated or no userID, reset the module-level guard and return. If loading or `designVersion` is `undefined`, return. Otherwise compute `desiredLS = designVersion === 2`; read LS via `readCrdEnabledFromStorage()`; if they match, mark guard done and return; otherwise mark guard done, call `writeCrdEnabledToStorage(desiredLS)` and `window.location.reload()`. The guard is keyed by `userID` (module-level `let lastReconciledUserID`) so sign-out → sign-in as a different user re-evaluates exactly once. Depends on T002 + T005.
- [X] T014 [US2] Mount the sync hook in `src/root.tsx` via a `DesignVersionSyncMount` no-render component placed inside `<UserProvider>` (alongside `<ApmUserSetter />`) so `useCurrentUserContext` is available. Depends on T013.
- [X] T015 [P] [US2] Add `src/main/crdPages/useDesignVersionSync.test.ts` with Vitest covering the matrix from `data-model.md`:
    - anonymous → no-op
    - loading → no-op
    - error → no-op
    - `designVersion === 2` and LS `'2'` → no-op
    - `designVersion === 2` and LS `'1'` → write `'2'`, reload called once
    - `designVersion === 1` and LS `'2'` → write `'1'`, reload called once
    - `designVersion === 2` and LS unset → write `'2'`, reload called once
    - Re-rendering the hook after a reload was triggered must NOT call reload again (asserts the module-level guard). Depends on T013.

**Checkpoint**: User Story 2 is fully functional. Cross-device preferences propagate with at most one reload per fresh session. SC-003, SC-004, FR-007, FR-008, FR-008a, FR-008b, FR-009 are verifiable via quickstart Scenarios B, C, G, I.

---

## Phase 5: User Story 3 — Single canonical entry point; legacy controls removed (Priority: P3)

**Goal**: The two legacy toggle UIs are removed. The duplicated LS helpers are unified onto the centralized ones from `useCrdEnabled.ts`.

**Independent Test**: Visit the user-settings sub-tab and the platform-admin layout page. Confirm no design-toggle UI is present and the surrounding pages still render without console errors. Matches quickstart Scenario H.

### Implementation

- [X] T016 [P] [US3] Edit `src/main/crdPages/topLevelPages/userPages/settings/settings/CrdUserSettingsTab.tsx` and `src/crd/components/user/settings/UserSettingsTabView.tsx`: remove the Design System `SettingsCard` and all related props/state/imports (`Palette`, `crdEnabled`, `onToggleCrdDesign`). The Communication & Privacy card is the only one left on this tab.
- [X] T017 [US3] Edit `src/main/crdPages/topLevelPages/userPages/settings/settings/userSettingsMapper.ts`: delete the `CRD_STORAGE_KEY`, `readCrdEnabledLocally`, and `writeCrdEnabledLocally` exports. Grep confirms `CrdUserSettingsTab.tsx` was the only consumer.
- [X] T018 [P] [US3] Edit `src/domain/platformAdmin/domain/layout/AdminLayoutPage.tsx`: remove the inline localStorage read/write and the "Use the new design" button block. The page is reduced to an empty `AdminLayout` shell so the existing route stays valid; future work can repurpose or delete it.
- [X] T019 [P] [US3] Edit `src/domain/community/userAdmin/tabs/UserAdminSettingsPage.tsx`: remove the inline LS access AND the now-redundant Design System `PageContentBlock` (FR-011: single user-facing entry point). The Communication & Privacy block remains.

**Checkpoint**: User Story 3 is complete. SC-006, FR-011 are verifiable via quickstart Scenario H.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification gates and PR-ready artifacts.

- [X] T020 [P] Run `pnpm lint` from the repo root and confirm zero new errors or warnings introduced by this branch. (Exit code 0 — the 495 warnings shown are pre-existing across the codebase.)
- [X] T021 [P] Run `pnpm vitest run` and confirm all tests pass — including the two new test files from T012 and T015. (110 test files, 1115 tests, 3 pre-existing skips, 0 failures.)
- [X] T022 [P] Run `pnpm build` and confirm the production build completes without errors. (Built in 55 s; the chunk-size warnings are pre-existing.)
- [ ] T023 Execute every quickstart scenario A through J in `specs/099-design-version-switch/quickstart.md` against a local backend. Capture screenshots of both menus showing the switch + caption for the PR description.
- [ ] T024 Author the PR description per Constitution §Engineering Workflow §4. Must include: (a) screenshots from T023 of both menus showing the switch + caption, (b) explicit note that the platform default is **unchanged** (link to `specs/099-design-version-switch/spec.md` Clarifications session 2026-05-13) so reviewers know existing users without an LS key continue to see the old design — the migration push is deferred to a later milestone, (c) confirmation that the two legacy toggle entry points are removed, (d) the regenerated GraphQL diff summary from T004, (e) **accessibility evidence**: result of an axe-DevTools scan or VoiceOver/NVDA pass over both menus confirming the switch is keyboard-reachable, focus-visible, and announces its state and caption (FR-017), (f) **test evidence**: the `pnpm vitest run` summary line showing tests pass including the two new files from T012 and T015, (g) **build/perf evidence**: confirmation `pnpm build` succeeded with the bundle-size delta compared to `develop` (acceptable for a small feature; flag any chunk that grew by >5 KB gzip), (h) note that the LS format changed from `alkemio-crd-enabled = 'true'/'false'` to `alkemio-design-version = '1'/'2'`; existing browsers are migrated transparently on first load.

---

## Phase 7: Follow-up (Future Release)

**Purpose**: Scheduled cleanup after the new LS scheme has been live long enough for returning users to have migrated.

- [ ] T025 **Future release (~3 releases / 4–6 weeks after #099 ships)** — Remove the one-time legacy-LS migration block in `src/main/crdPages/useCrdEnabled.ts`:
  - Delete the `CRD_TOGGLE_STORAGE_KEY` export.
  - Delete the `migrateLegacyDesignVersionLS` IIFE (top of file).
  - Remove the `localStorage.removeItem(CRD_TOGGLE_STORAGE_KEY)` line from `disableCrdAndNavigate`.
  - Grep `'alkemio-crd-enabled'` across the codebase to confirm no other references remain.
  - The TODO comments in `useCrdEnabled.ts` point at this task.

---

## Phase 8: Default flip & migration nudge (2026-05-26)

**Purpose**: Land the deferred default flip (clarification 2026-05-26 superseding 2026-05-13) and add an active migration push for existing MUI users. Coordinates with a parallel backend default flip.

- [X] T026 Invert the LS-default boolean in `src/main/crdPages/useCrdEnabled.ts:56`: `useCrdEnabled()` returns `readDesignVersionFromStorage() !== DESIGN_VERSION_OLD` instead of `=== DESIGN_VERSION_NEW`. Every "no preference known" state (anonymous, fresh device, missing or unrecognized LS) now renders CRD. Explicit `'1'` opt-ins continue to render MUI. No LS migration of existing `'1'` values — the backend default flip + `useDesignVersionSync` handles authenticated re-evaluation on next sign-in.
- [X] T027 [P] Update the project CLAUDE.md note about the default (line ~347) to read "Default is `2` (CRD)" and explain the inverted condition.
- [X] T028 [P] Refresh the toggle-label copy in all CRD layout locales: keep the single `header.designVersion.label` key, update its value to **"New look (old design available for a limited time)"** across `src/crd/i18n/layout/layout.{en,nl,es,bg,de,fr}.json` (AI-translated for the five non-EN locales). Drop the previously-shipped `caption` key entirely. `src/crd/layouts/components/UserMenu.tsx` renders the single label regardless of toggle state. *(Briefly during this phase a `toCrd` / `toMui` pair was tried; reverted same session.)*
- [X] T029 [P] Mirror the copy refresh on the MUI side: keep the single `topBar.designVersion.label` key in `src/core/i18n/en/translation.en.json` and update its value to match the CRD side (English source only — Crowdin handles other locales on the next sync). `src/main/ui/platformNavigation/PlatformNavigationUserMenu.tsx` renders the single label regardless of toggle state.
- [X] T030 Create the CRD presentational dialog `src/crd/components/common/DesignVersionUpgradeDialog.tsx`. Props: `open`, `isPending?`, `onConfirm`, `onDismiss`. All strings via `useTranslation('crd-layout')` reading `header.designVersionUpgrade.{title,body,confirm,dismiss,closeLabel}`. Add those keys to all six `layout.*.json` files. Dialog content uses `className="crd-root"` so Tailwind preflight applies inside the Radix portal even when the surrounding shell is MUI.
- [X] T031 Create the mount/controller `src/main/crdPages/DesignVersionUpgradePromptMount.tsx`. Gates: `isAuthenticated && !loadingMe && designVersion === DESIGN_VERSION_OLD && !isDismissed && toggle.isVisible`. Reads `useCurrentUserContext()` + `useDesignVersionToggle()`. Inline LS helpers for the per-device dismissal marker (`alkemio-design-version-upgrade-dismissed`, value `'1'`). `onConfirm` writes the marker and runs `toggle.onChange(true)` (which writes server + LS and reloads into CRD). `onDismiss` writes the marker only. Mount in `src/root.tsx` next to `DesignVersionSyncMount`, inside `UserProvider` + `AlkemioApolloProvider`, outside `TopLevelRoutes` so the prompt surfaces on any page. Depends on T026 + T028 + T030.
- [X] T032 [P] Run `pnpm lint` and `pnpm vitest run` against the combined changes. Lint clean. Tests: 1205 passed / 3 skipped (122 files).
- [X] T033 [P] Convert stylistic `—` (em-dash) and `–` (en-dash) in `header.designVersionUpgrade.body` to plain `-` (hyphen) across all six locale files. Manual review follow-up; no code change.
- [X] T034 [P] Update the 099 spec set — spec.md (new 2026-05-26 clarification, US4, FR-018/FR-019/FR-020, FR-004/FR-008b superseded inline), plan.md (Subsequent Changes section), tasks.md (this Phase 8), data-model.md (default row flipped, dismissal-marker entity), quickstart.md (Scenario A expectation flipped, new Scenario K for the modal), research.md (R5 amendment + R7 for the modal pattern).

**Checkpoint**: Default flip + migration push live. New visitors and signed-in users with no preference see CRD; existing MUI users see the modal once on next load. SC-001 through SC-007 from US1–US3 still hold; new acceptance scenarios from US4 (1–5) verifiable per quickstart Scenario K.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: Blocks all subsequent phases. T001 is a hard precondition — without the server field, T004 codegen cannot succeed.
- **Phase 2 (Foundational)**: Depends on T001. Blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2. Independent of US2 and US3.
- **Phase 4 (US2)**: Depends on Phase 2. Independent of US1 and US3.
- **Phase 5 (US3)**: Depends on Phase 2. Independent of US1 and US2.
- **Phase 6 (Polish)**: Depends on whichever stories are being shipped (minimum: US1 for the MVP).

### Within-phase ordering

- **Phase 2**: T003 → T004 → T005 must be sequential (schema → codegen → context wiring). T002, T006, T007 are independent of that chain and can run in parallel with it.
- **Phase 3**: T009 can be done in parallel with T008 (different files). T010 needs both T008 and T009. T011 needs T008 only. T012 is the test for T008.
- **Phase 4**: T013 → T014 sequential. T015 in parallel with T014.
- **Phase 5**: T016 → T017 sequential (caller before helper deletion). T018, T019 independent.
- **Phase 6**: T020, T021, T022 in parallel; T023 after them; T024 after T023.

### Parallel opportunities

- **Phase 2 parallel batch**: T002, T006, T007 (three different files, three different concerns).
- **Phase 3 parallel batch (after T008 lands)**: T009, T011, T012 against three different files.
- **Phase 5 parallel batch**: T016, T018, T019 (T017 must wait for T016).
- **Phase 6 parallel batch**: T020, T021, T022.
- **Cross-story parallel** (different developers): once Phase 2 is done, US1, US2, and US3 are independent — three developers could take one each.

---

## Parallel Example: Phase 2 Foundational batch

```bash
# After T001 confirms the schema is deployed, run these in parallel:
Task: "Extend src/main/crdPages/useCrdEnabled.ts with helpers + invert default"   # T002
Task: "Add topBar.designVersion.{label,beta} to src/core/i18n/en/translation.en.json"  # T006
Task: "Add designVersion.{label,beta} to all six src/crd/i18n/layout/layout.*.json files"  # T007

# In parallel, the GraphQL chain (sequential):
T003 → T004 → T005
```

## Parallel Example: Phase 3 after T008

```bash
# Once T008 (the toggle hook) lands:
Task: "Add designVersionSwitch prop + JSX row to src/crd/layouts/components/UserMenu.tsx"  # T009
Task: "Add switch row to src/main/ui/platformNavigation/PlatformNavigationUserMenu.tsx"   # T011
Task: "Vitest for useDesignVersionToggle"                                                  # T012

# After T009 lands:
Task: "Wire useDesignVersionToggle in src/crd/layouts/Header.tsx"  # T010
```

---

## Implementation Strategy

### MVP first (User Story 1 only)

1. Complete Phase 1 (T001).
2. Complete Phase 2 (T002–T007).
3. Complete Phase 3 (T008–T012).
4. **Stop and validate**: quickstart Scenarios A, D, E, F (skip the cross-device scenarios that need US2).
5. Deploy as MVP — the toggle is functional. Cross-device sync isn't, but the user can manually opt in on each device.

### Incremental delivery (recommended)

1. Phase 1 + 2 → foundation ready.
2. Phase 3 (US1) → MVP demoable.
3. Phase 4 (US2) → cross-device sync demoable.
4. Phase 5 (US3) → legacy cleanup. Often best to land **with** US1 so the menu toggle replaces the old entry points cleanly in the same release.
5. Phase 6 polish before opening the PR.

### Parallel team strategy

1. Whole team completes Phase 1 + Phase 2 together.
2. Developer A: Phase 3 (US1).
3. Developer B: Phase 4 (US2).
4. Developer C: Phase 5 (US3).
5. All three converge on Phase 6 together.

---

## Notes

- The codegen step in T004 is the single hardest gate — confirm with whoever owns the server deploy that `UserSettings.designVersion` is live before starting any code work.
- T002 deliberately does **not** invert the LS-unset default — existing users keep seeing the old design. This was re-decided on 2026-05-13 (see spec Clarifications). The migration push that flips the default to the new design is a separate, later milestone.
- Tasks marked [P] are parallel-safe relative to other [P] tasks in the same phase; they are still subject to the inter-phase dependency rules above.
- The CRD `UserMenu.tsx` change in T009 must remain purely presentational — no Apollo, no `@/domain/*`, no Sentry imports. The integration layer is `Header.tsx` (T010).
- The MUI side in T011 calls `useDesignVersionToggle()` directly because `PlatformNavigationUserMenu.tsx` is already part of the app integration layer (not under `src/crd/`), so no separation is required.
- After T023, if any quickstart scenario fails, do not soften the spec — diagnose root cause per Constitution §Engineering Workflow §5.

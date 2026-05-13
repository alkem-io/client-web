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

- [ ] T001 Verify server deploy that adds `UserSettings.designVersion` is live against the backend at `localhost:4000/graphql`. Inspect the schema (e.g., via GraphQL Playground introspection) and confirm `UserSettings.designVersion: String` and `UpdateUserSettingsEntityInput.designVersion: String` are present. If not, **stop here** — server work must complete first.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared plumbing (storage helpers, GraphQL field, context exposure, translation keys). Every user story depends on these.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

- [ ] T002 [P] Extend `src/main/crdPages/useCrdEnabled.ts` to export `readCrdEnabledFromStorage(): boolean | null` (returns `null` when the LS key is unset or unreadable) and `writeCrdEnabledToStorage(enabled: boolean): void`. **Do not change the default**: `useCrdEnabled()` keeps returning `false` when LS is unset or throws — same as today. The existing `CRD_TOGGLE_STORAGE_KEY` export stays. Keep the hook synchronous.
- [ ] T003 Add `settings { id designVersion }` to the `me { user { ... } }` selection in `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserLight.graphql` per `specs/099-design-version-switch/contracts/CurrentUserLight.graphql.diff`. The `id` is included alongside `designVersion` to keep the Apollo cache normalized with the heavier `userSettings` query that already selects `settings { id ... }`. Do not remove or rename any existing fields.
- [ ] T004 Run `pnpm codegen` and commit the regenerated `src/core/apollo/generated/graphql-schema.ts` and `src/core/apollo/generated/apollo-hooks.ts`. Confirm `designVersion` now appears on `UserSettings` and `UpdateUserSettingsEntityInput`. Depends on T001 + T003.
- [ ] T005 Update `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider.tsx` to read `data?.me?.user?.settings?.designVersion`, normalize unknown values to `undefined`, and expose `designVersion: '1' | '2' | undefined` on the returned model so it is accessible via `useCurrentUserContext()`. Depends on T004.
- [ ] T006 [P] Add two new keys to `src/core/i18n/en/translation.en.json` under a `topBar.designVersion` group: `label` (~"New design") and `beta` (~"Beta — the old design will remain available for a short time."). English only — Crowdin handles other locales.
- [ ] T007 [P] Add `designVersion.label` and `designVersion.beta` to all six CRD layout locale files: `src/crd/i18n/layout/layout.en.json`, `layout.nl.json`, `layout.es.json`, `layout.bg.json`, `layout.de.json`, `layout.fr.json`. Each locale must have an appropriate translation (AI-assisted, manual).

**Checkpoint**: Foundation complete — user-story phases can begin. T002, T006, T007 can run in parallel; T003 → T004 → T005 are sequential.

---

## Phase 3: User Story 1 — Switch the active design from the user menu (Priority: P1) 🎯 MVP

**Goal**: Authenticated users see a working toggle above "Dashboard" in both the CRD and MUI user menus. Clicking it saves the preference server-side, updates LS, reloads the page, and the other design renders. A Sentry info-log event fires on every successful toggle.

**Independent Test**: Sign in as any user, open the user menu in whichever shell is currently active, flip the toggle, confirm the other shell loads with the toggle now visible in its correct state. Confirm the mutation fires (Network tab) and a Sentry `DESIGN_VERSION_SWITCH` info log is emitted. Matches quickstart Scenarios D and E.

### Implementation

- [ ] T008 [US1] Create `src/main/crdPages/useDesignVersionToggle.ts` exporting a hook that returns the `DesignVersionToggleState` shape defined in `specs/099-design-version-switch/data-model.md`. Internally: reads current user via `useCurrentUserContext()`, calls `useUpdateUserSettingsMutation` from the generated Apollo hooks, sets `enabled` from `useCrdEnabled()`, sets `isVisible = isAuthenticated && !loading`. On `onChange(enabled)`: await `updateUserSettings({ settingsData: { userID, settings: { designVersion: enabled ? '2' : '1' } } })`; on success → `writeCrdEnabledToStorage(enabled)` → `logInfo` (from `@/core/logging/sentry/log`) with `{ label: 'DESIGN_VERSION_SWITCH', category: 'user-action' }` → `window.location.reload()`. On error → call the existing notification helper used in `UserAdminSettingsPage.tsx` and DO NOT update LS or reload. Depends on T002 + T005.
- [ ] T009 [US1] Update `src/crd/layouts/components/UserMenu.tsx` to accept a new optional prop:
    ```ts
    designVersionSwitch?: {
      enabled: boolean;
      onChange: (enabled: boolean) => void;
      label: string;
      infoText: string;
      disabled?: boolean;
    };
    ```
    Render a non-navigating row above the Dashboard `DropdownMenuItem` (currently around line 90) when the prop is present: use `Switch` from `@/crd/primitives/switch`, pair with `label`, render `infoText` beneath as a muted caption. Use `onSelect={(e) => e.preventDefault()}` on the wrapper so the menu does not close on click. **Do not import any non-presentational module** — the component remains pure per `src/crd/CLAUDE.md`. Depends on T007.
- [ ] T010 [US1] Update `src/crd/layouts/Header.tsx` (around lines 172–185 where `<UserMenu />` is rendered) to call `useDesignVersionToggle()` and, when `isVisible` is true, pass a `designVersionSwitch` prop built from `{ enabled, onChange, label: t('designVersion.label'), infoText: t('designVersion.beta'), disabled: isPending }` using the `crd-layout` namespace. When `isVisible` is false, omit the prop. Depends on T008 + T009.
- [ ] T011 [US1] Update `src/main/ui/platformNavigation/PlatformNavigationUserMenu.tsx`: call `useDesignVersionToggle()` at the component top, and when `isVisible` is true, render a `<MenuItem disableRipple>` row directly above the existing "Dashboard" `NavigatableMenuItem` (~line 150). The row contains a `<FormControlLabel control={<Switch size="small" checked={enabled} onChange={(_, v) => onChange(v)} disabled={isPending} />} label={t('topBar.designVersion.label')} />` plus a `<Typography variant="caption">{t('topBar.designVersion.beta')}</Typography>` beneath, matching the pattern in `src/main/topLevelPages/myDashboard/DashboardMenu/DashboardMenu.tsx:103-108`. Depends on T006 + T008.
- [ ] T012 [P] [US1] Add `src/main/crdPages/useDesignVersionToggle.test.ts` with Vitest covering: (a) `isVisible` is `false` for anonymous and loading states; (b) on successful `onChange`, the mutation is called with the right variables, LS is written, the Sentry `info` helper is called with the expected label, and `window.location.reload` is invoked; (c) on mutation rejection, LS is NOT touched, `reload` is NOT called, the notification helper IS called. Mock `useCurrentUserContext`, the generated mutation hook, `@/core/logging/sentry/log`, `window.location`, and the notification helper. Depends on T008.

**Checkpoint**: User Story 1 is fully functional. Toggling from either menu now writes to the server, updates LS, reloads, and emits the analytics event. SC-001, SC-002, SC-007, FR-001 through FR-006, FR-010, FR-012, FR-014, FR-016 are all verifiable manually via quickstart Scenarios D and E.

---

## Phase 4: User Story 2 — Design preference follows the user across devices (Priority: P2)

**Goal**: When an authenticated user lands on a fresh browser/device, the saved preference is fetched and — if it disagrees with the local cache — exactly one reconciliation reload runs so the user lands in the design they previously chose.

**Independent Test**: With LS deliberately set to the "wrong" value (e.g. `'false'` for a user whose server preference is `"2"`), reload the page. Confirm the cached shell renders briefly, then the page reloads exactly once to the saved design. Matches quickstart Scenario B and Scenario I.

### Implementation

- [ ] T013 [US2] Create `src/main/crdPages/useDesignVersionSync.ts`. Logic per `specs/099-design-version-switch/research.md` R4: read `useCurrentUserContext()`; if not authenticated, or loading, or `designVersion` is `undefined`, return. If the query is in an error state, return. Otherwise compute `desiredLS = designVersion === '2'`; read LS via `readCrdEnabledFromStorage()`; if they match, return; otherwise call `writeCrdEnabledToStorage(desiredLS)` and `window.location.reload()`. Guard the reload with a **module-level** `let hasReloaded = false` flag set immediately before `reload()` so React Strict Mode never triggers a double reload. The hook returns nothing. Depends on T002 + T005.
- [ ] T014 [US2] Mount the sync hook in `src/root.tsx`. Add `useDesignVersionSync()` as a top-level call alongside the existing `useCrdEnabled()` site so it runs on every authenticated app load. Place it inside the same component that already calls `useCrdEnabled()` (or as close to the auth/context provider as possible — must be **inside** `CurrentUserProvider` so `useCurrentUserContext` is available). Depends on T013.
- [ ] T015 [P] [US2] Add `src/main/crdPages/useDesignVersionSync.test.ts` with Vitest covering the matrix from `data-model.md`:
    - anonymous → no-op
    - loading → no-op
    - error → no-op
    - `designVersion === '2'` and LS `'true'` → no-op
    - `designVersion === '2'` and LS `'false'` → write `'true'`, reload called once
    - `designVersion === '1'` and LS `'true'` → write `'false'`, reload called once
    - `designVersion === '2'` and LS unset → write `'true'`, reload called once
    - Re-rendering the hook after a reload was triggered must NOT call reload again (asserts the module-level guard). Depends on T013.

**Checkpoint**: User Story 2 is fully functional. Cross-device preferences propagate with at most one reload per fresh session. SC-003, SC-004, FR-007, FR-008, FR-008a, FR-008b, FR-009 are verifiable via quickstart Scenarios B, C, G, I.

---

## Phase 5: User Story 3 — Single canonical entry point; legacy controls removed (Priority: P3)

**Goal**: The two legacy toggle UIs are removed. The duplicated LS helpers are unified onto the centralized ones from `useCrdEnabled.ts`.

**Independent Test**: Visit the user-settings sub-tab and the platform-admin layout page. Confirm no design-toggle UI is present and the surrounding pages still render without console errors. Matches quickstart Scenario H.

### Implementation

- [ ] T016 [P] [US3] Edit `src/main/crdPages/topLevelPages/userPages/settings/settings/CrdUserSettingsTab.tsx`: remove the design-toggle row (around lines 77–84 that calls `writeCrdEnabledLocally(next)` and `location.reload()`) and any imports that become unused. Leave the rest of the settings tab intact.
- [ ] T017 [US3] Edit `src/main/crdPages/topLevelPages/userPages/settings/settings/userSettingsMapper.ts`: delete the `readCrdEnabledLocally` and `writeCrdEnabledLocally` functions. Verify (via grep) that no other callers reference them — `CrdUserSettingsTab.tsx` was the only consumer. Depends on T016.
- [ ] T018 [P] [US3] Edit `src/domain/platformAdmin/domain/layout/AdminLayoutPage.tsx`: remove the inline localStorage read/write (lines 6, 17–28) and the "Use the new design" / "Use the old design" button block (lines 32–44). Remove the `localStorage` and `location.reload` calls. If the page becomes empty, leave a minimal shell so the route remains valid; do not delete the file.
- [ ] T019 [P] [US3] Edit `src/domain/community/userAdmin/tabs/UserAdminSettingsPage.tsx`: replace the inline localStorage access (lines 15, 31–38) with imports of `readCrdEnabledFromStorage` and `writeCrdEnabledToStorage` from `@/main/crdPages/useCrdEnabled`. Keep the page's UI surface (the toggle itself is gone in this page — only the data path changes).

**Checkpoint**: User Story 3 is complete. SC-006, FR-011 are verifiable via quickstart Scenario H.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification gates and PR-ready artifacts.

- [ ] T020 [P] Run `pnpm lint` from the repo root and confirm zero new errors or warnings introduced by this branch.
- [ ] T021 [P] Run `pnpm vitest run` and confirm all tests pass — including the two new test files from T012 and T015, and the existing `CrdAwareErrorComponent.test.tsx` / `AncestorRedirectDispatcher.test.tsx` which mock `useCrdEnabled` (the mocks shouldn't need updating, but watch for snapshots affected by the inverted default).
- [ ] T022 [P] Run `pnpm build` and confirm the production build completes without errors (~20 s expected).
- [ ] T023 Execute every quickstart scenario A through J in `specs/099-design-version-switch/quickstart.md` against a local backend. Capture screenshots of both menus showing the switch + caption for the PR description.
- [ ] T024 Author the PR description per Constitution §Engineering Workflow §4. Must include: (a) screenshots from T023 of both menus showing the switch + caption, (b) explicit note that the platform default is **unchanged** (link to `specs/099-design-version-switch/spec.md` Clarifications session 2026-05-13) so reviewers know existing users without an LS key continue to see the old design — the migration push is deferred to a later milestone, (c) confirmation that the two legacy toggle entry points are removed, (d) the regenerated GraphQL diff summary from T004, (e) **accessibility evidence**: result of an axe-DevTools scan or VoiceOver/NVDA pass over both menus confirming the switch is keyboard-reachable, focus-visible, and announces its state and caption (FR-017), (f) **test evidence**: the `pnpm vitest run` summary line showing tests pass including the two new files from T012 and T015, (g) **build/perf evidence**: confirmation `pnpm build` succeeded with the bundle-size delta compared to `develop` (acceptable for a small feature; flag any chunk that grew by >5 KB gzip).

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

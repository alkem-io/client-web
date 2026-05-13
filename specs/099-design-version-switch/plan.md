# Implementation Plan: Design Version Switch (MUI ↔ CRD)

**Branch**: `099-design-version-switch` | **Date**: 2026-05-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/099-design-version-switch/spec.md`

## Summary

Add a single-source-of-truth design-version toggle that:

1. Lives in both user menus (legacy MUI `PlatformNavigationUserMenu` and new CRD `UserMenu` rendered by `src/crd/layouts/Header.tsx`), above the Dashboard link, with a beta caption — visible only to authenticated users.
2. Persists the choice as `UserSettings.designVersion` server-side (`"1"` = old, `"2"` = new) via the existing `updateUserSettings` mutation, with a localStorage fast-boot cache (`alkemio-crd-enabled`) read synchronously by `useCrdEnabled()` at app shell mount.
3. Reconciles cache vs. saved preference on every authenticated load — server preference wins, cache rewritten, exactly one `window.location.reload()` on mismatch. Renders the cached design immediately so first paint isn't blocked.
4. Preserves the existing platform default — **old design** — when no preference is known (per clarification 2026-05-13, superseding 2026-05-12 Q3). `useCrdEnabled()` keeps its current "unset LS → returns `false`" behavior. Flipping the default to the new design is deferred to a later migration milestone, out of scope here.
5. Removes the two existing legacy toggle UIs (`CrdUserSettingsTab.tsx` row and `AdminLayoutPage.tsx` button) so the user menu is the only entry point.
6. Emits a Sentry `info` log on every successful toggle click using the existing `info` helper at `src/core/logging/sentry/log.ts`. Reconciliation reloads emit nothing.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 (with React Compiler — no manual memoization) / Node ≥24.0.0 (Volta-pinned 24.14.0)

**Primary Dependencies**:
- Apollo Client (existing generated hooks `useCurrentUserLightQuery`, `useUpdateUserSettingsMutation`)
- `react-i18next` (existing — `translation` namespace for MUI side, `crd-layout` namespace for CRD side)
- `@mui/material` (legacy menu — `Switch`, `FormControlLabel`, `MenuItem`)
- shadcn/ui primitives (`src/crd/primitives/switch.tsx` for the CRD menu — already present, no new install)
- `lucide-react` (icons — existing usage in `UserMenu.tsx`)
- Sentry info-logger at `src/core/logging/sentry/log.ts` (existing — `info(msg, { label, category })`)

**Storage**:
- Client cache: `localStorage` key `alkemio-crd-enabled` (existing, value `'true'`/`'false'`/unset). Default-when-unset semantics are **unchanged** from today: unset → `useCrdEnabled()` returns `false` → old (MUI) design renders.
- Server: `User.settings.designVersion` field on the GraphQL schema. **Currently absent** from generated `graphql-schema.ts` — appears after `pnpm codegen` against the deployed server (server work tracked at https://github.com/alkem-io/server/blob/139119695a4d2745c10e559cb18c19e8629d6bc2/specs/096-user-design-version/plan.md).

**Testing**: Vitest with jsdom (`pnpm vitest run`). Add unit tests for the new sync/toggle hooks and a render test for both menu integrations. Existing tests for `useCrdEnabled` consumers (`CrdAwareErrorComponent.test.tsx`, `AncestorRedirectDispatcher.test.tsx`) must continue to pass — they mock `useCrdEnabled` directly. Default-when-unset semantics are unchanged (still MUI), so no implicit-default assumptions break.

**Target Platform**: Modern evergreen browsers per project rule (>90% caniuse coverage). Single-page React 19 app served by Vite.

**Project Type**: Web (frontend SPA). Single project. No new top-level directories.

**Performance Goals**:
- SC-001: toggle → reload → new design renders in under 5 s end-to-end.
- SC-003: at-most-one reconciliation reload on a fresh session.
- SC-004: zero reloads when cache matches saved preference.
- No new bundles or split points required.

**Constraints**:
- React Compiler enabled — **no** `useMemo` / `useCallback` / `React.memo`.
- CRD components (`src/crd/**`) stay presentational — no GraphQL, no `@/core/apollo`, no `@/domain/*` imports. The switch wiring in `UserMenu.tsx` accepts a prop; the data flows from `Header.tsx` (the layout consumer) via a hook.
- No barrel `index.ts` re-exports.
- The reconciliation reload must be guarded by a module-level flag so React Strict Mode's double-mount never triggers a double reload.
- `useCrdEnabled()` stays synchronous (it is read at `TopLevelRoutes` mount and 8 other call sites; an async refactor would be a much larger change).

**Scale/Scope**: All authenticated users of the platform see the new toggle. Every signed-in app load now runs one reconciliation check (one cheap LS read + a comparison once Apollo has the user; no extra round trip — `designVersion` rides along on the existing `CurrentUserLight` query).

## Constitution Check

*Gate: must pass before Phase 0. Re-checked post-Phase 1 design (see below).*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | Pass | GraphQL extension lives in `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserLight.graphql`. New hooks (`useDesignVersionSync`, `useDesignVersionToggle`) live in `src/main/crdPages/` (the app-shell orchestration layer that already owns `useCrdEnabled`). Presentational CRD primitives untouched by business logic. |
| II. React 19 Concurrent UX Discipline | Pass | No `useMemo`/`useCallback` introduced. The reconciliation reload is a deliberate full-page navigation, not concurrent state mutation. The reload guard is a module-level boolean (not React state) so Strict Mode double-render is safe. |
| III. GraphQL Contract Fidelity | Pass with action | `pnpm codegen` MUST run once the server deploys `designVersion`. PR carries the generated diff. We add `settings { designVersion }` to `CurrentUserLight.graphql` and rely on the existing `useUpdateUserSettingsMutation`. No raw `useQuery`. |
| IV. State & Side-Effect Isolation | Pass | LocalStorage access is the single existing wrapper in `src/main/crdPages/useCrdEnabled.ts`, extended (not duplicated). `window.location.reload()` and `localStorage.setItem` are isolated to `useDesignVersionSync` and `useDesignVersionToggle` — components never call them directly. |
| V. Experience Quality & Safeguards | Pass | Toggle leverages existing Radix `Switch` (CRD) and MUI `Switch` (legacy) — both keyboard-operable and screen-reader-labelled by default. We pair each switch with a textual label and a caption via `aria-describedby`. Adds Vitest coverage for new hooks. |

**Architecture Standards** (constitution §Architecture):
- §1 directory mapping — respected (domain for data, `src/main/crdPages` for orchestration, presentation in `src/main/ui` + `src/crd/layouts`).
- §2 styling — both shells get the toggle in their respective design systems; CRD usage stays within `src/crd/primitives`.
- §3 i18n — English source edited in `src/core/i18n/en/translation.en.json` for the MUI side; all six locales edited under `src/crd/i18n/layout/` for the CRD side (per `src/crd/CLAUDE.md`).
- §5 no barrel exports — respected.
- §6 SOLID — split clearly: presentational switch (CRD), MUI menu integration, data-mapping hook, sync hook, mutation/toggle hook.

**Engineering Workflow** (constitution §Engineering Workflow):
- §1 — this plan documents the GraphQL operations touched (`CurrentUserLight`, `updateUserSettings`) and the React 19 features (no manual memo, synchronous reconciliation hook). Constitution Check explicit above.
- §2 — `pnpm codegen` step is in the verification checklist and `quickstart.md`.
- §3 — domain-first: schema fragment → context exposure → app-shell hooks → menu integrations → cleanup of legacy toggles.
- §5 — root cause analysis: the previous duplicated LS reads across three files is the actual reason for the centralization work, not a workaround. The default-inversion is a deliberate spec decision (clarification 2026-05-12 Q3), not a symptom mask.

**No constitution violations to justify in the Complexity Tracking table.**

## Project Structure

### Documentation (this feature)

```text
specs/099-design-version-switch/
├── plan.md              # This file
├── spec.md              # Feature specification (clarified 2026-05-12)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── CurrentUserLight.graphql.diff
│   └── updateUserSettings.contract.md
├── checklists/
│   └── requirements.md  # Created during /speckit.specify
└── tasks.md             # /speckit.tasks output (not produced here)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/generated/                            # Regenerated via `pnpm codegen` (no manual edits)
│   ├── i18n/en/translation.en.json                  # +2 keys (MUI menu side)
│   └── logging/sentry/log.ts                        # Existing — `info()` helper reused
├── crd/
│   ├── i18n/layout/layout.{en,nl,es,bg,de,fr}.json  # +2 keys × 6 locales
│   ├── layouts/
│   │   ├── Header.tsx                               # Wires designVersionSwitch prop into <UserMenu>
│   │   └── components/UserMenu.tsx                  # New presentational prop + JSX row above Dashboard
│   └── primitives/switch.tsx                        # Existing Radix Switch — reused as-is
├── domain/
│   ├── community/
│   │   ├── userCurrent/
│   │   │   └── CurrentUserProvider/
│   │   │       ├── CurrentUserLight.graphql         # +settings { designVersion }
│   │   │       └── CurrentUserProvider.tsx          # Surface `designVersion` on the model
│   │   └── userAdmin/
│   │       └── tabs/UserAdminSettingsPage.tsx       # Switch inline LS to shared helpers
│   └── platformAdmin/
│       └── domain/layout/AdminLayoutPage.tsx        # Remove legacy toggle (FR-011)
├── main/
│   ├── crdPages/
│   │   ├── useCrdEnabled.ts                         # Extended: read/write helpers + INVERTED default
│   │   ├── useDesignVersionSync.ts                  # NEW — reconciliation hook (mounted in root.tsx)
│   │   ├── useDesignVersionToggle.ts                # NEW — toggle hook (mutation + LS + reload + log)
│   │   └── topLevelPages/userPages/settings/settings/
│   │       ├── CrdUserSettingsTab.tsx               # Remove legacy toggle block (FR-011)
│   │       └── userSettingsMapper.ts                # Delete duplicated LS helpers
│   ├── ui/platformNavigation/
│   │   └── PlatformNavigationUserMenu.tsx           # Add Switch row above Dashboard (MUI side)
│   └── routing/TopLevelRoutes.tsx                   # Unchanged — still gated by useCrdEnabled()
└── root.tsx                                          # Mount the sync hook
```

**Structure Decision**: Single web SPA project. No new directories. All work fits the existing `src/core` / `src/domain` / `src/main` / `src/crd` taxonomy.

## Phase 0 — Research

See [research.md](./research.md). Resolves: CRD `UserMenu` consumer location, Sentry info-logger API, current schema state for `designVersion`, and the chosen reconciliation/reload contract.

## Phase 1 — Design & Contracts

- [data-model.md](./data-model.md) — entities, attributes, and the cache↔server mapping table.
- [contracts/CurrentUserLight.graphql.diff](./contracts/CurrentUserLight.graphql.diff) — the exact GraphQL fragment addition.
- [contracts/updateUserSettings.contract.md](./contracts/updateUserSettings.contract.md) — input shape used by the toggle hook.
- [quickstart.md](./quickstart.md) — local setup, end-to-end verification recipe matching SC-001 through SC-007.

### Constitution Re-check (post-design)

After defining the data model and contracts, re-evaluating each principle:

- **I (Domain Boundaries)**: GraphQL change confined to the existing `userCurrent` provider; toggle hook still in `crdPages` orchestration layer. Pass.
- **II (React 19)**: No new memoization. Reload guard is a module-level `let` outside React's render cycle. Pass.
- **III (GraphQL fidelity)**: Single fragment addition, single mutation reuse, regenerated artifacts committed. Pass.
- **IV (State isolation)**: One LS wrapper, one Sentry log call-site. Pass.
- **V (Quality)**: Vitest covers the two new hooks; manual a11y check on both menus part of quickstart. Pass.

No new violations introduced by the design.

## Complexity Tracking

> Empty — no constitution violations to justify.

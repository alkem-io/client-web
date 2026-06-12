# Implementation Plan: Hiding tabs/phases

**Branch**: `story/9727-hiding-tabs-phases` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/106-hiding-tabs-phases/spec.md`
**Story**: alkem-io/client-web#9727

## Summary

Give space/subspace admins a per-phase (innovation-flow state) "Hide" / "Show" action in the
phase management menu, with a confirmation dialog on hide that explains the action is UI-only
(content stays reachable by URL). Hidden phases are filtered out of the member-facing phase
navigation while admins continue to see and manage all phases. Visibility is a new per-state
setting (`settings.visible`, boolean, default `true`) carried on the existing innovation-flow
state settings; the client wires the action and member-side filtering against it and renders
the affordance only when the platform exposes the field (graceful degradation).

**Technical approach (CRD architecture — `src/crd/` only)**: New features go into the CRD design
system, never the legacy MUI tree. The admin affordance is added to the CRD Space-Settings Layout
surface: the per-phase column kebab in `LayoutPoolColumn` (composed by `SpaceSettingsLayoutView`)
gains a "Hide from menu" / "Show in menu" entry, and hiding routes through the CRD
`ConfirmationDialog` (`@/crd/components/dialogs/ConfirmationDialog`) explaining the action is
UI-only (content stays reachable by URL). A "Hidden" badge surfaces hidden phases to the admin.

CRD components stay purely presentational: visibility comes in via props (`LayoutPoolColumn.isHidden`
on the column data, `ColumnMenuActions.onToggleVisibility` callback). All Apollo/domain wiring lives
in the integration layer under `src/main/crdPages/topLevelPages/spaceSettings/layout/`:
`layoutMapper.ts` derives `isHidden` from `state.settings.visible`; `useLayoutTabData.ts` owns the
optimistic snapshot flip + the persist mutation (the existing `UpdateInnovationFlowState`, carrying
the unchanged displayName/description/allowNewCallouts plus the new `visible` flag); `useColumnMenu.ts`
forwards the callback into `ColumnMenuActions`. The member-facing CRD navigation paths
(`useCrdSubspace` → `SubspaceFlowTabs`, and `useCrdSpaceTabs` → space tabs) filter hidden phases for
non-admins via the single shared pure selector `filterVisibleStates`. Admins (Update privilege) keep
every phase so they can unhide. The affordance lights up only when the platform exposes the per-state
`visible` flag (graceful degradation: with the field absent, `isHidden` is `undefined`, the kebab entry
is suppressed, and the member filter is a no-op).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: Apollo Client (generated hooks only), shadcn/ui + Tailwind CSS v4 + Radix UI (CRD layer, via `@/crd/primitives/*` + `@/crd/components/*`), `react-i18next` (`crd-spaceSettings` namespace), `lucide-react` (Eye/EyeOff icons), `@dnd-kit` (existing, in the layout columns). No MUI in any touched component — the implementation lives entirely in `src/crd/` + its `src/main/crdPages/` integration layer.
**Storage**: Server-persisted via GraphQL (`InnovationFlowStateSettings.visible`). Client cache is Apollo `InMemoryCache`. No local/device persistence (visibility is shared across all viewers).
**Testing**: Vitest + jsdom (`pnpm vitest run`)
**Target Platform**: Web SPA (Vite build), evergreen browsers (>90% support per repo policy)
**Project Type**: Web frontend (single SPA). This is the client-web slice only.
**Performance Goals**: No new network round-trips on render; visibility filtering is an O(n) array filter over the already-fetched states list. Standard web responsiveness.
**Constraints**: Must not change authorization or content access (hide is UI-only). Must degrade gracefully when the server field is absent. `pnpm codegen` requires a live backend and is NOT available in this environment, so the client model treats `visible` as optional and guards on its presence rather than depending on regenerated types.
**Scale/Scope**: CRD layer + its integration layer — `src/crd/components/space/settings/` (column kebab + types), `src/main/crdPages/topLevelPages/spaceSettings/layout/` (mapper + data/menu hooks), `src/main/crdPages/{subspace,space}/hooks/` (member-nav filtering), one pure selector under the InnovationFlow domain slice (`filterVisibleStates`, reused by the CRD member paths), the GraphQL source documents (`visible` selection — inert until codegen), the shared client model, and CRD `crd-spaceSettings` i18n (6 locales). No schema regeneration committed in this PR (see External Dependencies); `pnpm codegen` is NOT run.

### External Dependencies (out of this repo)

- **Server: per-state visibility field.** The platform `InnovationFlowStateSettings` type currently exposes only `allowNewCallouts`. True cross-user persistence of "hidden" requires the server to add `visible: Boolean` to `InnovationFlowStateSettings` and accept it on `UpdateInnovationFlowStateSettingsInput` (default `true`). This is recorded as a dependency; tracked separately for the server repo. Until it lands, the client guards on the field's presence (FR-016) so the Hide/Show affordance is not a misleading no-op.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **CRD architecture (golden rule) — PASS.** The feature lives entirely in `src/crd/` + its
  `src/main/crdPages/` integration layer. Zero MUI in any touched component. The admin affordance
  is the CRD column kebab in `LayoutPoolColumn`; the hide confirmation uses the canonical CRD
  `ConfirmationDialog` (`@/crd/components/dialogs/ConfirmationDialog`); icons come from `lucide-react`
  (`Eye`/`EyeOff`); styling is Tailwind + design tokens.
- **I. CRD components are purely presentational — PASS.** `LayoutPoolColumn` receives `isHidden`
  on the column data and `onToggleVisibility` as a `ColumnMenuActions` callback prop. No Apollo,
  domain, routing, or auth imports cross into the CRD layer. All data derivation + mutation wiring
  lives in the integration layer (`layoutMapper.ts`, `useLayoutTabData.ts`, `useColumnMenu.ts`).
- **II. React 19 Concurrent UX Discipline — PASS.** No manual memoization (React Compiler). The
  toggle is an immediate-save async action with an optimistic snapshot flip (mirroring the existing
  active-phase / default-template actions in `useLayoutTabData`), reconciled by the
  InnovationFlowSettings refetch.
- **III. GraphQL Contract Fidelity — PASS (with documented dependency).** Only generated hooks are
  used (`useUpdateInnovationFlowStateMutation`). The `visible` field is added to the
  `InnovationFlowStates` fragment + the `UpdateInnovationFlowState` mutation **source** documents so
  that, once the server exposes it and `pnpm codegen` runs, the generated types carry it. Because
  codegen needs a live backend unavailable here, the runtime reads `visible` defensively (the
  integration layer + the shared model treat it as optional) and no generated types are hand-edited.
  The PR documents that a codegen run is required when server#6138 lands.
- **IV. State & Side-Effect Isolation — PASS.** No new global state; Apollo cache holds the
  persisted value, the layout buffer holds the optimistic flip. No direct DOM manipulation.
- **V. Experience Quality & Safeguards — PASS.** The kebab entry, the "Hidden" badge, and the
  confirmation dialog are keyboard-accessible CRD primitives (Radix), copy is fully localized in the
  `crd-spaceSettings` namespace across all 6 locales, and destructive-explanatory confirmation is
  enforced per the CRD "all deletions/explanatory actions confirmed" rule. Unit tests cover the pure
  visibility selector and the `isHidden` mapping.

**Result**: PASS — no violations; no Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/106-hiding-tabs-phases/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (UI + GraphQL contracts)
│   ├── innovation-flow-state-visibility.graphql.md
│   └── ui-hide-show-phase.md
├── checklists/
│   └── requirements.md  # from /speckit-specify
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
CRD design system (purely presentational):
src/crd/components/space/settings/
├── SpaceSettingsLayoutView.types.ts                # add isHidden? to LayoutPoolColumn; onToggleVisibility? to ColumnMenuActions
└── LayoutPoolColumn.tsx                            # Hide/Show kebab entry (Eye/EyeOff), "Hidden" badge, hide ConfirmationDialog

src/crd/i18n/spaceSettings/
└── spaceSettings.<lang>.json  (en, nl, es, bg, de, fr)   # layout.column.hideShow.* keys (menu labels, badge, confirm copy)

CRD integration layer (Apollo / domain wiring):
src/main/crdPages/topLevelPages/spaceSettings/
├── CrdSpaceSettingsPage.tsx                         # pass layout.onToggleVisibility into useColumnMenu
└── layout/
    ├── layoutMapper.ts                              # derive column.isHidden from state.settings.visible (defensive read)
    ├── useLayoutTabData.ts                          # onToggleVisibility: optimistic snapshot flip + persist mutation (visible flag)
    └── useColumnMenu.ts                             # forward onToggleVisibility into ColumnMenuActions
src/main/crdPages/subspace/hooks/useCrdSubspace.ts   # member-facing subspace tabs: filterVisibleStates(states, canEditFlow)
src/main/crdPages/space/hooks/useCrdSpaceTabs.tsx    # member-facing space tabs: filterVisibleStates(states, canUpdate)

Shared data contract (reused, not MUI-specific):
src/domain/collaboration/InnovationFlow/
├── models/InnovationFlowStateModel.ts              # visible?: boolean on settings (shared client model)
├── graphql/InnovationFlowStates.fragment.graphql   # select settings.visible (source — inert until codegen)
├── graphql/UpdateInnovationFlowStates.graphql      # return settings.visible (source — inert until codegen)
└── utils/
    ├── filterVisibleStates.ts                       # pure selector — members see visible only; admins see all
    └── filterVisibleStates.test.ts                  # unit tests for the selector

src/domain/space/layout/tabbedLayout/Tabs/SpaceTabs.graphql   # select settings.visible (source — inert until codegen)

tests (Vitest, co-located):
src/domain/collaboration/InnovationFlow/utils/filterVisibleStates.test.ts            # selector
src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.test.ts            # isHidden mapping
```

**Structure Decision**: Single web SPA, CRD architecture. The admin affordance is built into the
CRD Space-Settings Layout surface (the screen the story targets — "space settings > layout" and the
subspace "manage innovation flow" view, which both render `SpaceSettingsLayoutView`). CRD components
stay presentational; all Apollo/domain logic lives in `src/main/crdPages/`. Member-facing filtering
happens in the CRD render path's data hooks. The pure `filterVisibleStates` selector and the GraphQL
source/model are shared data-contract artifacts (not MUI-specific) and are retained. The legacy MUI
InnovationFlow editor is intentionally **not** touched — new features go into CRD only.

## Complexity Tracking

> No Constitution Check violations. No entries required.

# Phase 0 Research: Hiding tabs/phases

All decisions below were made autonomously (YOLO), grounded in the existing client-web code.

## R1 — Where the "tabs/phases" concept lives

- **Decision**: "Tabs/phases" are **InnovationFlow states**. The per-phase admin menu is
  `src/domain/collaboration/InnovationFlow/InnovationFlowDragNDropEditor/InnovationFlowStateMenu.tsx`,
  rendered per state by `InnovationFlowDragNDropEditor.tsx`.
- **Rationale**: The story's two named entry points — "space settings > Layout" and subspace
  "Manage innovation flow" — both render the same shared `InnovationFlowDragNDropEditor`
  (via `SpaceAdminLayoutPage`, `InnovationFlowSettingsDialog`/`InnovationFlowCollaborationToolsBlock`,
  and the CRD `LayoutReplaceFlowConnector`). One change to the menu + editor covers all surfaces.
- **Alternatives considered**: A bespoke new menu per surface — rejected (duplication, violates DRY).

## R2 — How to persist "hidden"

- **Decision**: Add a per-state boolean setting `settings.visible` (default `true`) on the
  innovation-flow state, carried by the existing `UpdateInnovationFlowState` mutation through
  `UpdateInnovationFlowStateSettingsInput`. Filter on `visible === false` for members.
- **Rationale**: The state already has a `settings` object (`allowNewCallouts`) wired end-to-end
  (fragment selection + update input + domain hook). Adding `visible` mirrors that exact path,
  minimizing surface area and respecting GraphQL contract fidelity (Constitution III). Using
  `visible` (default true) rather than `hidden` keeps the "absent = shown" default safe.
- **External dependency**: The server does not yet expose `visible` on `InnovationFlowStateSettings`
  (only `allowNewCallouts`). This is a prerequisite for true cross-user persistence and is recorded
  as an external (server-repo) dependency. See R3 for the client-side degradation strategy.
- **Alternatives considered**:
  - Client-only persistence (localStorage) — rejected: visibility must be shared across all
    viewers of the space (FR-004), not per-device.
  - A separate top-level mutation — rejected: the settings path already exists; no need for new surface.

## R3 — Graceful degradation when the server field is absent

- **Decision**: Treat `visible` as **optional** on the client `InnovationFlowStateModel`
  (`settings.visible?: boolean`). The Hide/Show affordance and the member-side filter activate
  only when the field is present in the fetched data (i.e. `typeof state.settings.visible === 'boolean'`).
  When absent, the menu item is not rendered and members see all states (current behavior).
- **Rationale**: `pnpm codegen` requires a live backend, unavailable in this worktree, so we
  cannot regenerate types from a server that lacks the field. Guarding on presence (FR-016)
  avoids a misleading no-op and keeps the PR shippable ahead of the server change. When the
  server lands the field, a `pnpm codegen` run regenerates the types and the affordance lights up.
- **Alternatives considered**: Hand-editing generated types — rejected (Constitution III forbids;
  generated files are source-of-truth from codegen).

## R4 — Confirmation dialog

- **Decision**: Reuse `@/core/ui/dialogs/ConfirmationDialog` exactly as the delete-state flow does
  in `InnovationFlowDragNDropEditor` (state held in the editor, opened from the menu action).
  Hide requires confirmation; **unhide does not** (non-destructive, A-007).
- **Rationale**: Consistency with the existing per-state destructive-action pattern; zero new dialog
  primitive. The dialog body carries the mandated explanation (FR-003).
- **Alternatives considered**: A new bespoke dialog component — rejected (duplication).

## R5 — Member-facing filtering point

- **Decision**: Add a pure selector `filterVisibleStates(states, canEditFlow)` in
  `src/domain/collaboration/InnovationFlow/utils/filterVisibleStates.ts`. Apply it at the
  member-nav state sources (`SubspacePageLayout` and the tabbed-layout `SpaceTabProvider`/
  `useSpaceTabs`) so that non-admin viewers receive only visible states; admins (holding the
  innovation-flow `Update` privilege already exposed on the flow's authorization) receive all.
- **Rationale**: Single shared, unit-testable selector keeps the rule DRY (Constitution 6f) and
  out of components. Admin gating reuses the existing `Update` privilege the editor already checks
  (`canEditInnovationFlow` in `useInnovationFlowSettings`). Members default to the first visible
  state; an all-hidden flow yields an empty list handled by existing empty-state rendering (FR-015).
- **Alternatives considered**: Filtering inside each visualizer component — rejected (logic scattered,
  hard to test, repeated). Server-side filtering — out of scope for the client slice and would hide
  states from admins too.

## R6 — i18n

- **Decision**: Add MUI-surface strings under `components.innovationFlowSettings.stateEditor.*`
  in `src/core/i18n/en/translation.en.json` (English source only; Crowdin handles the rest). Keys:
  `hideState`, `showState`, `hideDialog.title`, `hideDialog.text`, plus a `hiddenIndicator` label.
  CRD-only strings are added under the relevant `src/crd/i18n/<feature>` namespace only if the CRD
  surface renders copy not already covered by the shared MUI editor (the shared editor uses the
  `translation` namespace, so no separate CRD keys are expected).
- **Rationale**: Follows the repo's split i18n rules. The dialog text states explicitly that hiding
  is UI-only and content remains reachable by URL (FR-003).

## R7 — Testing strategy

- **Decision**: Unit-test the `filterVisibleStates` selector (admin sees all; member sees only
  visible; absent-field => all shown; all-hidden => empty for member). Keep component coverage light
  given React Compiler + existing editor tests; rely on the selector + hook action for logic coverage.
- **Rationale**: The risk is in the filtering rule and the degradation guard, which are pure and
  cheaply testable. Matches the repo's Vitest unit-test conventions.

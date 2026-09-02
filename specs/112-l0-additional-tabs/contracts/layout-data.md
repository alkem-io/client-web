# Contract: Layout Data / Integration (crdPages)

**Feature**: 112-l0-additional-tabs · Layer: `src/main/crdPages/topLevelPages/spaceSettings/`

This layer owns Apollo, the `level` policy, and the protection derivation. It maps GraphQL → CRD props.

## `layout/layoutMapper.ts`

### Change — set `isDeletable` per column from level + position

`mapCollaborationToLayoutColumns(collaboration)` gains a second parameter — the space level (or a precomputed `isL0: boolean`) — so it can stamp each column:

```ts
export function mapCollaborationToLayoutColumns(
  collaboration: LayoutCollaboration,
  level: 'L0' | 'L1' | 'L2',          // ← NEW second arg
): LayoutPoolColumn[]
// for each state at ordered position `index`:
//   isDeletable: level === 'L0' ? index >= 4 : true,
```

Contract:
- L0 indices 0–3 → `isDeletable: false`; index ≥ 4 → `true`.
- L1/L2 → `true` for every column (or omit the field — both read as deletable; prefer explicit `true` for clarity).
- Ordering is by the same sortOrder the editor already uses; the mapper must not reorder.

### Threading `level` to the mapper (call-site hop)

The mapper is invoked **inside `useLayoutTabData`** (not at the page). Therefore `level` must be added to `useLayoutTabData`'s signature and forwarded:

```ts
// was: useLayoutTabData(spaceId: string)
export function useLayoutTabData(spaceId: string, level: 'L0' | 'L1' | 'L2'): UseLayoutTabDataResult
// internally: mapCollaborationToLayoutColumns(collaboration, level)
```

`CrdSpaceSettingsPage.tsx` already computes `level`; it passes it as the new second arg: `useLayoutTabData(activeTab === 'layout' ? spaceId : '', level)`.

## `layout/useColumnMenu.ts`

### Change — allow delete on L0; protection handled by the flag, not the level

- Remove the implicit "L1/L2 only" assumption in the doc-comment and the call site; `onDeleteState` may now be provided on L0.
- `canDelete` keeps its min-states formula (`columnCount > minimumNumberOfStates`). The **positional** protection is enforced upstream by `isDeletable` on the column (the menu won't render Delete for protected columns), so `useColumnMenu` needs no positional knowledge.
- The delete click-guard ref logic is unchanged.

## `layout/useLayoutTabData.ts`

### Mostly unchanged — already level-agnostic

- `onCreateState`, `onDeleteState`, `minimumNumberOfStates`, `maximumNumberOfStates`, `isStructureMutating`, and the active-state-advance-before-delete logic are reused as-is.
- The hook already awaits refetches so the tab strip updates without reload (SC-001).
- Error surface: a failed create/delete leaves `saveBar`/`isStructureMutating` consistent; on save-path failure `saveBar` becomes `{ kind: 'saveError', message }` (FR-018). No new error UI.

## `CrdSpaceSettingsPage.tsx`

### Change — wire L0 add/delete + capability

Replace the L0 suppression with capability + protection:

```ts
// was: onDeleteState: level !== 'L0' ? layout.onDeleteState : undefined,
onDeleteState: layout.onDeleteState,            // now provided at every level

// useColumnMenu / view get the L0 admin capability:
const canManageTabs = /* admin privilege */ ;   // same privilege used for subspace tab mgmt

// SpaceSettingsLayoutView props:
canManageTabs={canManageTabs}
onCreatePhase={canManageTabs ? layout.onCreateState : undefined}   // was: level !== 'L0' ? ...
maximumNumberOfStates={layout.maximumNumberOfStates}
// headerActionsSlot stays omitted on L0 (Replace-flow not offered)
entityNoun={level === 'L0' ? 'tab' : 'phase'}   // drives Add/Delete wording
```

The mapper invocation passes `level` so columns carry `isDeletable`. Built-in L0 tabs (index 0–3) therefore get no Delete entry regardless of `onDeleteState` being present.

Contract obligations:
- `canManageTabs` is true only for users holding the same admin/update privilege that already gates subspace tab management (FR-010, SC-007). Non-admins → no Add/Delete/rename/visibility affordances.
- L1/L2 call sites are unchanged in behaviour (the new props default to prior semantics).

## GraphQL

- Reuses existing generated hooks: `useCreateStateOnInnovationFlowMutation`, `useDeleteStateOnInnovationFlowMutation`, `useUpdateInnovationFlowStatesSortOrderMutation`, `useUpdateInnovationFlowCurrentStateMutation`, `useUpdateInnovationFlowStateMutation`.
- No new client `.graphql` operation is strictly required. If server#6177 exposes a new field the client must read (e.g. a settings flag), add it to the relevant `.graphql` and run `pnpm codegen` in this PR, committing generated outputs.
- Templates already capture all states via `SpaceTemplateContent_Collaboration` → `InnovationFlowStates` (FR-013); no client change needed, verified in quickstart.

## Tests (integration layer)

- `layoutMapper.test.ts`: `isDeletable` derivation matrix (L0 0–3 false, ≥4 true; L1/L2 true).
- Capability-gating test for the settings page wiring (admin vs non-admin; L0 vs subspace) where feasible at unit scope.
- Existing subspace layout tests remain green (FR-015 / SC-005).

# Phase 0 Research: Additional Tabs on L0 Spaces

**Feature**: 112-l0-additional-tabs · **Story**: client-web#9857 · **Epic**: alkemio#1930

This feature is an enablement of an existing, working capability, so research is grounding-and-decision rather than greenfield exploration. The relevant code was mapped before planning; the findings and decisions are below.

## Existing capability inventory (what already works for subspaces)

| Concern | Existing artifact | Status |
|---|---|---|
| Add a tab/phase | `useLayoutTabData.onCreateState` → `useInnovationFlowSettings.actions.createState` → `createStateOnInnovationFlow` (+ sort-order de-collide), refetch awaited | Works at L1/L2 |
| Delete a tab/phase | `useLayoutTabData.onDeleteState` → advances active state if needed → `deleteStateOnInnovationFlow`, refetch awaited; posts move to first tab server-side | Works at L1/L2 |
| Per-column Delete menu | `LayoutPoolColumn` → `ColumnOverflowMenu`, gated on `columnMenuActions.onDeletePhase` truthiness | Works at L1/L2 |
| Min/max limits | `useLayoutTabData.{minimumNumberOfStates,maximumNumberOfStates}` from innovation-flow settings; `useColumnMenu` computes `canDelete = count > min`; view computes `canAddPhase = count < max` | Works at L1/L2 |
| Rename / description | `useColumnMenu.onSaveColumnDetails` + buffered renames in `useLayoutTabData.onSave` | Works at all levels already |
| Hide / show | `useLayoutTabData.onToggleVisibility` — already wired at every level including L0 | Works at L0 |
| Custom tab rendering | `useCrdSpaceTabs` renders states at index ≥ 4 as custom tabs; `CrdSpaceTabbedPages` routes index ≥ 4 → `CrdSpaceCustomTabPage` | Works at L0 |

## The L0 gap (root cause of "no longer works")

The add/delete capability is suppressed on L0 by **client-side guards**, not by a missing feature:

- `CrdSpaceSettingsPage.tsx:226` — `onDeleteState: level !== 'L0' ? layout.onDeleteState : undefined`
- `CrdSpaceSettingsPage.tsx:434` — `onCreatePhase={level !== 'L0' ? layout.onCreateState : undefined}`
- `SpaceSettingsLayoutView.tsx:120` — `const canManagePhases = level !== 'L0' && !!onCreatePhase;`

These three guards (plus the comment at `useColumnMenu.ts` "Provided only at L1/L2") are why an L0 admin sees no Add/Delete tab affordances. The story's "there is a mutation that adds one tab to a space, reported no longer working" maps to this: the underlying mutation is fine; the client path to it is gated off at L0. Re-enabling requires removing the `level !== 'L0'` gates **and** adding the protection that subspaces never needed (subspaces have no "first four are sacred" rule — their floor is just `minimumNumberOfStates`).

## Decision 1 — How to express the "first four protected" rule

**Decision**: Add a per-column `isDeletable?: boolean` field to `LayoutPoolColumn`, set by `layoutMapper` as `level === 'L0' ? index >= 4 : true`, and gate the Delete menu entry on `actions.onDeletePhase && column.isDeletable !== false`.

**Rationale**:
- Keeps the rule in the integration mapper (where `level` and ordering already live), not inside the CRD menu — preserving the CRD "no business logic" rule.
- `isDeletable !== false` (rather than `=== true`) means subspace columns that never set the flag keep today's behaviour with zero change — satisfies FR-015 (L1/L2 unchanged) by construction.
- Per-column granularity is required because the rule is positional (index 0–3 vs ≥ 4), not space-wide; a single `canDelete` flag cannot express it.

**Alternatives considered**:
- *Level check inside `ColumnOverflowMenu`* — rejected: leaks `level` + the "index < 4" rule into `src/crd/`, violating Architecture #2/Golden-Rule-2.
- *A separate L0-only delete handler in `useColumnMenu`* — rejected: duplicates the create/sort-order/active-advance orchestration already in `useLayoutTabData`; SRP/DRY violation.
- *Rely solely on the server to reject deletes of the first four* — rejected as the **only** mechanism: the affordance would still appear, then error, which is poor UX and contradicts FR-006 ("no Delete affordance is offered"). The server guard (server#6177) remains as authoritative defense-in-depth.

## Decision 2 — Capability prop shape on the view

**Decision**: Generalize `canManagePhases` to admit L0. Concretely, the view's add/delete enablement keys off the presence of the `onCreatePhase` handler and a new explicit capability, not a hard-coded `level !== 'L0'`. Introduce `canManageTabs?: boolean` (defaulting to the prior behaviour) so the consumer decides; the page passes `true` for L0 admins. Column reorder stays gated off on L0 (`canReorderColumns` keeps `level !== 'L0'`), per the clarify decision (reorder out of scope this slice).

**Rationale**: Moves the level policy to the integration layer (the page already computes `level` and admin privilege), keeping the CRD view a dumb capability consumer. Reorder stays off to avoid the "can't move ahead of the built-in four" DnD constraint (FR-016, out of scope).

**Alternatives considered**:
- *Flip `canManagePhases` to `level !== undefined`* — rejected: still encodes level policy in CRD.
- *Enable reorder too* — rejected this slice: out of scope and adds the leading-four constraint.

## Decision 3 — "tab" vs "phase" wording

**Decision**: Add level-aware label props to `AddPhaseDialog` and the Delete confirmation / menu entry. On L0 the strings read "Add tab" / "Delete tab" / "Delete this tab?"; on L1/L2 they keep "phase". New keys live in the existing `crd-spaceSettings` namespace under a `layout.tabWording.*` (or equivalent) sub-tree, added to all six locale files with key parity. Default-named built-in tabs continue to use the `crd-space` `tabs.*` keys for their display labels.

**Rationale**: The CRD components stay presentational (labels arrive as props / via their own namespace); six-language parity is enforced in review. Respects the Dutch glossary ("Post"/"Posts" untranslated, "template" lowercase mid-sentence).

**Alternatives considered**:
- *Reuse the "phase" strings on L0* — rejected: violates FR-003 (user-facing term must be "tab").
- *Hard-code English "tab"* — rejected: violates i18n constitution rule.

## Decision 4 — Error handling on structural failure

**Decision**: Reuse the existing Layout-editor structure/save error surface (`useLayoutTabData` sets `saveBar: { kind: 'saveError' }` / the create-delete `try/finally` recovers `isStructureMutating`). No bespoke L0 error UI (FR-018, clarify Q5).

**Rationale**: The only realistic server-side rejection on L0 is a race on a protected tab the client never offered; the generic error path is sufficient and avoids new surfaces.

## Decision 5 — Tests

**Decision**: Unit-test the mapper's `isDeletable` derivation (L0 index 0–3 → false, ≥ 4 → true; L1/L2 → true/undefined) and the view/menu gating (Delete entry absent on protected columns, present on additional tabs; Add disabled at max). Keep all existing subspace layout tests green (regression guard for FR-015 / SC-005).

**Rationale**: The protection rule is the feature's central safety invariant (SC-002, SC-003) and is pure/derivable — cheap and high-value to unit test. Full DnD/Apollo integration is already covered by existing subspace tests.

## Open questions

None. All spec `[NEEDS CLARIFICATION]` were resolved in the Clarifications session; no remaining technical unknowns block Phase 1.

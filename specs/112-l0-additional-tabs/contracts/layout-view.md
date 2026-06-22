# Contract: CRD Layout View (presentational)

**Feature**: 112-l0-additional-tabs · Layer: `src/crd/components/space/settings/`

These are CRD components — plain-TypeScript props, no Apollo/domain/router imports, Tailwind-only, all destructive actions confirmed.

## `SpaceSettingsLayoutView.types.ts`

### Change — `LayoutPoolColumn` gains a protection flag

```ts
export type LayoutPoolColumn = {
  id: LayoutColumnId;
  title: string;
  description: string;
  isCurrentPhase: boolean;
  isHidden?: boolean;
  /**
   * Whether this column may be deleted. The per-column Delete affordance is shown only when the
   * delete capability is present AND this is not `false`. Left `undefined` for subspace columns
   * (their deletability is governed by the flow's min-states limit), so existing behaviour is
   * unchanged. Set to `false` for the four built-in L0 tabs (indices 0–3) to protect them.
   */
  isDeletable?: boolean;          // ← NEW (opt-out: undefined ⇒ deletable as before)
  callouts: LayoutCallout[];
};
```

`ColumnMenuActions.onDeletePhase` is unchanged in shape; its *visibility* is now additionally gated per-column by `isDeletable`.

## `SpaceSettingsLayoutView.tsx`

### Change — capability admits L0

```ts
export type SpaceSettingsLayoutViewProps = {
  level: 'L0' | 'L1' | 'L2';
  /**
   * Whether the admin may add/delete tabs. When omitted, falls back to the prior `level !== 'L0'`
   * behaviour so existing subspace callers are unaffected. The L0 settings page passes `true`
   * for admins to enable additional-tab management; the four built-in tabs remain protected via
   * each column's `isDeletable` flag, not via this prop.
   */
  canManageTabs?: boolean;        // ← NEW
  // ...unchanged props...
  onCreatePhase?: (input: { displayName: string; description: string }) => Promise<void>;
  maximumNumberOfStates?: number;
  // ...
};
```

Behavioural contract:
- `canManagePhases := canManageTabs ?? (level !== 'L0')` and `&& !!onCreatePhase`.
- `canAddPhase := canManagePhases && columns.length < maximumNumberOfStates && !isStructureMutating && !isReplacingFlow` (unchanged formula; now reachable on L0).
- `canReorderColumns := level !== 'L0' && !!onReorderColumns` (**unchanged** — reorder stays off on L0, FR-016 out of scope).
- The `AddPhaseDialog` renders when `canManagePhases && onCreatePhase`; on L0 it shows tab-worded labels (below).
- `headerActionsSlot` (Replace-flow) stays omitted on L0 — the page must not pass it for L0.

## `AddPhaseDialog.tsx`

### Change — level-aware wording via props (or namespace key selection)

The dialog accepts the user-facing noun so the same component serves both "phase" (L1/L2) and "tab" (L0):

```ts
export type AddPhaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { displayName: string; description: string }) => Promise<void>;
  existingPhaseNames: string[];
  /**
   * User-facing noun for the entity being created. 'tab' on L0, 'phase' on subspaces.
   * Drives the dialog title, submit CTA, and the duplicate-name validation message via the
   * component's own i18n keys (e.g. `layout.addEntity.tab.title` vs `...phase.title`). Defaults
   * to 'phase' so existing subspace callers are unchanged.
   */
  entityNoun?: 'tab' | 'phase';   // ← NEW (default 'phase')
};
```

## `LayoutPoolColumn.tsx` / `ColumnOverflowMenu`

### Change — Delete entry gated per-column + tab wording on L0

```tsx
// Delete entry visibility:
{actions.onDeletePhase && column.isDeletable !== false && (
  <DropdownMenuItem className="text-destructive ...">{t(deleteLabelKey)}</DropdownMenuItem>
)}
```

- `deleteLabelKey` resolves to the tab-worded key on L0 and the phase-worded key on subspaces (passed down from the view's `entityNoun`/level, or via a `deleteLabel` prop — keep CRD presentational).
- The Delete confirmation dialog (`ConfirmationDialog`, `variant="destructive"`) likewise uses the tab-worded title/CTA on L0 (FR-009).
- All other menu entries (Active phase, Default template, Hide/Show, Edit details) are unchanged.

## Accessibility / i18n obligations

- New/changed buttons keep `aria-label`s; Delete confirmation names the action.
- All new strings come from the `crd-spaceSettings` namespace, added to en/nl/es/bg/de/fr with key parity (Dutch glossary: "Post"/"Posts", "template" untranslated/lowercase).
- No raw typography combos — use semantic tokens.

## Invariants asserted by tests

- L0: no Delete entry on columns where `isDeletable === false` (indices 0–3).
- L0: Delete entry present on columns where `isDeletable === true` (index ≥ 4) and capability present.
- Add button disabled when `columns.length >= maximumNumberOfStates`.
- Subspace columns (no `isDeletable`, `canManageTabs` undefined) render exactly as before.

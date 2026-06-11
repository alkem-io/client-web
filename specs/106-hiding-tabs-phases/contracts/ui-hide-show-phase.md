# Contract: Hide/Show phase UI

## InnovationFlowStateMenu (per-phase action menu)

New props (added to existing `InnovationFlowStateMenuProps`):

```ts
// Rendered only when visibility capability is present AND the viewer is an admin.
onToggleVisibility?: (stateId: string) => void;   // hide if currently visible, show if hidden
isHidden?: boolean;                                // current visibility (false/undefined => visible)
canToggleVisibility?: boolean;                     // capability present (settings.visible is boolean)
```

Behavior:
- When `canToggleVisibility` is true, render a menu item:
  - label = `showState` when `isHidden`, else `hideState`
  - icon = an eye / eye-off MUI icon (`VisibilityOutlined` / `VisibilityOffOutlined`)
  - on click: call `onToggleVisibility(stateId)` then close the menu (using the existing
    `createMenuAction` wrapper).
- When `canToggleVisibility` is false/undefined, the item is not rendered (FR-016).
- The item is independent of the active-state, edit, delete, add, and default-template items.

## InnovationFlowDragNDropEditor (owns the confirmation flow)

- New optional prop: `onToggleFlowStateVisibility?: (stateId: string, nextVisible: boolean) => Promise<unknown>`.
- New local state: `hideFlowStateId?: string` (the state pending a hide confirmation).
- Hide path: menu "Hide" → set `hideFlowStateId` → render a `ConfirmationDialog`
  (mirror the existing delete dialog) → on confirm call
  `onToggleFlowStateVisibility(id, false)` and clear; on cancel just clear (FR-005).
- Show path: menu "Show" → call `onToggleFlowStateVisibility(id, true)` directly (no dialog, A-007).
- Visible indicator (FR-012): hidden state cards carry a subtle "Hidden" caption/badge so admins
  can tell at a glance; visible cards are unchanged.

ConfirmationDialog entities (i18n keys, MUI `translation` namespace):

```
titleId:           components.innovationFlowSettings.stateEditor.hideDialog.title
contentId:         components.innovationFlowSettings.stateEditor.hideDialog.text
confirmButtonTextId: components.innovationFlowSettings.stateEditor.hideDialog.confirm   // "Hide"
```

`hideDialog.text` MUST state: hiding only removes the phase/tab from the interface; anyone with
a URL to the phase or a post inside it can still access it (FR-003).

## useInnovationFlowSettings (domain hook)

New action exposed under `actions`:

```ts
toggleStateVisibility: (stateId: string, nextVisible: boolean) => Promise<unknown>;
```

Implementation: find the state, call `updateInnovationFlowState` with the unchanged
`displayName`/`description` and `settings: { allowNewCallouts: <current>, visible: nextVisible }`,
then refetch the settings query (matching the existing edit-state refetch behavior). The
`canEditInnovationFlow` authorization flag is already returned and gates the affordance.

## filterVisibleStates (domain selector)

```ts
function filterVisibleStates<T extends { settings: { visible?: boolean } }>(states: T[]): T[];
```

- No state has a boolean `visible` → returns `states` unchanged (capability absent, FR-016).
- Otherwise → returns `states.filter(s => s.settings.visible !== false)` (FR-006).
- Hidden phases are removed for everyone, including admins. FR-011/FR-012 (admins still see
  hidden phases) is satisfied by the management surface (Settings → Layout / `layoutMapper`,
  which lists every state with a "hidden" badge), NOT by this selector.

Applied at the live navigation sources (`useCrdSpaceTabs`, `useCrdSubspace`) before passing
states to the nav components.

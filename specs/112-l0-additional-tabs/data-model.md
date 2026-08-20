# Phase 1 Data Model: Additional Tabs on L0 Spaces

**Feature**: 112-l0-additional-tabs

This is a client feature over an existing GraphQL contract; the "data model" here is the **view-model** flowing from the innovation-flow GraphQL types into the CRD Layout editor, plus the derived protection rule. No new persisted entity is introduced on the client.

## Entities & view-models

### Tab (rendered from an InnovationFlow state)

| Field | Type | Source | Notes |
|---|---|---|---|
| `id` | `string` | `InnovationFlow.states[].id` | The flow-state id; used as `LayoutColumnId`. |
| `title` | `string` | `states[].displayName` | Built-in L0 tabs render localized names via `crd-space` `tabs.*`; custom tabs use the raw `displayName`. |
| `description` | `string` | `states[].description` | Markdown. |
| `index` | `number` | position in `states` (by sortOrder) | 0–3 = built-in L0 tabs; ≥ 4 = additional tabs. |
| `isCurrentPhase` | `boolean` | `innovationFlow.currentState.id === id` | Drives the "active" badge; on delete of the active tab the active advances first. |
| `isHidden` | `boolean \| undefined` | `states[].settings.visible` (inverted) | UI-only member visibility; `undefined` when server doesn't expose `visible`. |
| `isDeletable` | `boolean` | **derived** (see below) | **New.** Whether the per-column Delete affordance is offered. |
| `callouts` | `LayoutCallout[]` | `calloutsSet.callouts` classified to this state | Posts in this tab. |

### Derivation — `isDeletable`

Computed in `layoutMapper.mapCollaborationToLayoutColumns`, given the space `level`:

```
isDeletable(level, index) =
  level === 'L0'  ? index >= 4   // first four (Dashboard, Community, Subspaces, Knowledge Base) are protected
                  : true          // subspaces: deletability is governed only by minimumNumberOfStates
```

Consumers (the `ColumnOverflowMenu`) show the Delete entry when **both** hold:
`actions.onDeletePhase` is defined (capability present) **AND** `column.isDeletable !== false` (column not protected).

Using `!== false` makes the flag opt-out: existing subspace columns that never set it behave exactly as today (FR-015 / SC-005).

### Tab limits

| Field | Type | Source | Effect |
|---|---|---|---|
| `minimumNumberOfStates` | `number` | innovation-flow settings | Subspace delete floor; for L0 the positional "first four protected" rule is the effective floor and is stricter for the leading tabs. |
| `maximumNumberOfStates` | `number` | innovation-flow settings | Caps Add for **all** levels including L0 (FR-004); Add disabled when `columns.length >= max`. |

### Post relocation on delete (FR-007 / SC-003)

When a tab is deleted, posts in it move to the **first** tab. This is enforced server-side by `deleteStateOnInnovationFlow` (the same path subspaces use); the client does not re-tag posts itself. The client's only delete-time logic is advancing the active state if the deleted tab is current (FR-008), which already exists in `useLayoutTabData.onDeleteState`.

## State transitions (a tab's lifecycle on L0)

```
(absent) --admin Add (index becomes next, ≥ 4)--> Additional tab (isDeletable = true)
Additional tab --rename / edit description--> Additional tab (title/description changed)
Additional tab --hide--> Additional tab (isHidden = true, dropped from member tab strip, still admin-reachable)
Additional tab --delete (confirmed; active advances first if current)--> (absent); its posts --> first tab
Built-in tab (index 0–3) --rename/hide where already supported--> Built-in tab; DELETE is never offered (isDeletable = false)
```

## Invariants

1. **No built-in L0 tab is ever deletable.** `isDeletable === false` for L0 indices 0–3 ⇒ Delete entry never rendered ⇒ no delete request issued (FR-006, SC-002).
2. **Tab count never exceeds the maximum.** Add disabled at `columns.length >= maximumNumberOfStates` (FR-004, SC-004).
3. **No post is lost on delete.** Server relocates posts to the first tab (FR-007, SC-003).
4. **Subspaces are byte-for-byte unchanged.** The new flag is opt-out and the new capability prop defaults to prior behaviour (FR-015, SC-005).
5. **Additional L0 tabs render in the main tab bar.** Guaranteed by the existing index-≥-4 rendering path; no change needed (FR-011).

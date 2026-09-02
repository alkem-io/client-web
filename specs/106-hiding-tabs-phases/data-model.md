# Phase 1 Data Model: Hiding tabs/phases

This is a frontend SPA slice. The "data model" is the shape of the innovation-flow state as the
client consumes/mutates it, plus the derived view models for navigation.

## Entity: InnovationFlowState (phase/tab)

Existing client model: `src/domain/collaboration/InnovationFlow/models/InnovationFlowStateModel.ts`

| Field | Type | Source | Change |
|-------|------|--------|--------|
| `id` | `string` | server | unchanged |
| `displayName` | `string` | server | unchanged |
| `description` | `string?` | server | unchanged |
| `sortOrder` | `number` | server | unchanged |
| `settings.allowNewCallouts` | `boolean` | server | unchanged |
| `settings.visible` | `boolean?` | server (NEW field) | **ADDED** — optional on the client; `undefined` when the platform does not yet expose it. Semantics: `true`/absent = shown in member nav; `false` = hidden from member nav. |
| `defaultCalloutTemplate` | `{…} \| null` | server | unchanged |

**Validation / invariants**:
- `visible` is independent of `allowNewCallouts` and of the current/active state.
- Hiding never alters authorization or content; it is purely a navigation-visibility flag.
- Default for a newly created or legacy state is "visible" (treat `undefined` as visible).

## Derived: live navigation states

A pure selector produces the list shown in the live phase/tab navigation:

```
filterVisibleStates(states):
  if no state carries a boolean `visible`:
    return states                      # capability absent => unchanged behavior (FR-016)
  return states.filter(s => s.settings.visible !== false)   # visible only (FR-006)
```

- Hidden phases are removed for everyone, including admins — the live nav is the member-facing
  surface (FR-006). FR-011/FR-012 (admins still see hidden phases) is satisfied by the
  management surface (Settings → Layout / `layoutMapper`), which lists every state with a
  "hidden" badge, NOT by this selector. Admins unhide there; content stays reachable by URL.
- Default selection: the first state of the filtered list (already how nav picks a default). If
  the current/active phase is hidden, nav resolves to the first visible one (FR-015).
- All-hidden flow: filtered list is empty → existing empty/neutral nav state (FR-015).

## State transitions (visibility)

| From | Action (admin) | Confirmation | To | Persisted via |
|------|----------------|-------------|----|---------------|
| visible (`visible` true/absent) | "Hide" | Yes (dialog, FR-002/003) | hidden (`visible=false`) | `UpdateInnovationFlowState` settings |
| hidden (`visible=false`) | "Show"/"Unhide" | No (A-007) | visible (`visible=true`) | `UpdateInnovationFlowState` settings |

- The hide/show menu item label is chosen from the current `visible` value (FR-009).
- The action is only offered to admins and only when `visible` is a boolean on the state (FR-010, FR-016).

## Authorization

- Capability gate reuses the existing `canEditInnovationFlow` derivation in
  `useInnovationFlowSettings` (`innovationFlow.authorization.myPrivileges` includes `Update`).
- No new role or privilege is introduced (A-004).

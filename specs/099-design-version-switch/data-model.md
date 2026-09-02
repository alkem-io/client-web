# Phase 1 — Data Model

This is a frontend feature with one new persisted field on the server, one existing client-side cache, and several derived in-memory values. No new tables, no relationships.

## Entities

### 1. UserSettings.designVersion (server)

**Owner**: Server (`UserSettings` GraphQL type).
**Type**: `Int` (non-null). Server default is `1`. Values: `1` (old design), `2` (new design), `3+` reserved by the server for future design generations.
**Mutability**: Updatable via `updateUserSettings` mutation by the user themselves (input field `designVersion: Int`).
**Constraints**:
- Only the owning user can read/write their own value (existing platform authorization model — no special grant required for this feature).
- Server does not enforce client-side semantics — the client only ever writes `1` or `2`.
- The server schema is non-null, so for any authenticated user the value will always be present once `CurrentUserLight` resolves. "No preference set" only applies pre-fetch / on fetch error.

**Domain meaning**:
| Value | Meaning |
|-------|---------|
| `1`   | User prefers the old (MUI) design (also the server default for accounts that never explicitly toggled) |
| `2`   | User prefers the new (CRD) design |
| `3+`  | Reserved by the server for future design generations — this client treats `3+` as "unrecognized → don't reconcile". |

### 2. Local Design Cache (client)

**Owner**: Client (`localStorage` on the user's browser).
**Key**: `alkemio-design-version` (defined as `DESIGN_VERSION_STORAGE_KEY` in `src/main/crdPages/useCrdEnabled.ts`). Stores the design version directly as a stringified integer — mirrors the server's `designVersion` value.
**Type**: `string` — values `'1'`, `'2'`, or unset.
**Mutability**: Written by `writeDesignVersionToStorage(version: 1 | 2)` only.
**Constraints**:
- Per-browser, per-device. Not synced across devices (the server preference handles that).
- Read with a try/catch wrapper to tolerate SSR or private-mode environments.

**Domain meaning** *(updated 2026-05-26 — default flipped per FR-008b revision)*:

| Stored value | `useCrdEnabled()` returns | Notes |
|--------------|---------------------------|-------|
| `'2'`        | `true`                    | User has opted into the new design |
| `'1'`        | `false`                   | User has explicitly opted into the old design |
| _unset_      | `true`                    | **Default — new design (CRD).** Anonymous visitors, fresh devices, and signed-in users with no server preference land here. |
| LS access throws | `true`                | Fallback to the new-design default |
| Any unrecognized value | `true`              | Anything other than the literal string `'1'` falls back to the new-design default |

The implementation (`useCrdEnabled.ts:56`) returns `readDesignVersionFromStorage() !== DESIGN_VERSION_OLD`, so only the explicit `'1'` opt-in renders MUI. Pre-2026-05-26 the comparison was `=== DESIGN_VERSION_NEW`; the inversion is non-destructive (existing `'1'` opt-ins still render MUI).

**Legacy key migration**: The previous boolean key `alkemio-crd-enabled` (values `'true'`/`'false'`) is migrated on first module load: existing `'true'` becomes `'2'`, anything else becomes `'1'`, and the legacy key is deleted. The migration block and the `CRD_TOGGLE_STORAGE_KEY` export are scheduled for removal in T025 (~3 releases after this ships).

### 3. Upgrade-prompt dismissal marker (client) *(added 2026-05-26)*

**Owner**: Client (`localStorage` on the user's browser).
**Key**: `alkemio-design-version-upgrade-dismissed` (inline helper in `src/main/crdPages/DesignVersionUpgradePromptMount.tsx` — not exported from `useCrdEnabled.ts` because it's prompt-state, not design-state).
**Type**: `string` — `'1'` when the modal has been dismissed at least once on this device; unset otherwise.
**Mutability**: Written by `writeDismissedToStorage()` only — called from both modal actions (`onConfirm` and `onDismiss`).
**Constraints**:
- Per-browser, per-device. Not synced across devices.
- Set on either action (confirm or dismiss). Never cleared by the app — users who clear browser storage will see the modal again, which is acceptable for a per-device welcome prompt.
- Read with try/catch to tolerate private-mode failures.

**Domain meaning**:

| Stored value | Modal visibility | Notes |
|--------------|-------------------|-------|
| `'1'`        | hidden            | User has already seen the modal on this device |
| _unset_      | shown (if other gates pass) | First load on this device |
| LS access throws | hidden        | Treated as "dismissed" to avoid spamming the user in private-mode contexts |

**Visibility gate** (all must be true): `isAuthenticated && !loadingMe && designVersion === DESIGN_VERSION_OLD && !isDismissed && toggle.isVisible`.

## Cache ↔ Server Mapping

| Server `designVersion` | Cache `alkemio-design-version` | Action on load (signed-in user) |
|------------------------|---------------------------------|----------------------------------|
| `2` (new design)       | `'2'`                           | No-op |
| `2` (new design)       | `'1'` or unset                  | Write `'2'`, reload once |
| `1` (old design)       | `'1'`                           | No-op |
| `1` (old design)       | `'2'` or unset                  | Write `'1'`, reload once |
| `3+` (unrecognized)    | any value or unset              | No-op — client treats as unsupported |
| (fetch errored)        | any value or unset              | No-op — silent skip per FR-008a |

## Derived in-memory values

### `useCurrentUserContext().designVersion`

**Origin**: GraphQL `User.settings.designVersion` via the extended `CurrentUserLight` query.
**Type**: `1 | 2 | undefined`. The server field is a non-null `Int`, but in the model we narrow to the two values this feature recognizes; `3+` and any unexpected value collapse to `undefined`. `undefined` also represents "not yet loaded / anonymous user".
**Consumers**: Only `useDesignVersionSync` and `useDesignVersionToggle`.

### `useDesignVersionToggle()` return shape

```ts
type DesignVersionToggleState =
  | { isVisible: false }
  | {
      isVisible: true;
      enabled: boolean;
      onChange: (next: boolean) => Promise<void>;
      isPending: boolean;
    };
```

- `isVisible` is `false` for anonymous users or while the current user is still loading (FR-003, FR-009).
- `enabled` reflects the active design (mirrors `useCrdEnabled()` so the switch matches what's rendered — FR-005).
- `onChange` runs the mutation, then writes LS, then reloads (and emits the Sentry info log) — only when the mutation succeeds (FR-006). On error it surfaces a non-blocking notification via the existing notification system and does NOT update LS or reload (FR-010, SC-007).
- `isPending` is `true` while the mutation is in flight, to disable the switch and avoid double-clicks.

## State transitions

```
        ┌─────────────────────────────────────────────────────────┐
        │                  signed-in app load                     │
        └─────────────────────────────────────────────────────────┘
                                  │
            ┌─────────────────────┴─────────────────────┐
            │ Read LS → render cached design (or old    │
            │ design if LS unset). App becomes usable.  │
            └─────────────────────┬─────────────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │ CurrentUserLight resolves         │
                └─────────────────┬─────────────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
            error│ undefined      │ '1'/'2'        │ '1'/'2'
                 │                │ matches LS     │ differs from LS
                 │                │                │
                 ▼                ▼                ▼
            no-op            no-op           write LS, reload
            (FR-008a)        (FR-007)        once (guarded)
                                              (FR-007)
```

## Persistence summary

| Data | Persistence | Lifetime |
|------|-------------|----------|
| `UserSettings.designVersion` | Server (the user's settings record) | Permanent until user changes it or admin clears it |
| `alkemio-design-version` | `localStorage` | Until user clears browser storage or explicitly logs out (existing platform behavior). Legacy key `alkemio-crd-enabled` is migrated and removed on first load. |
| `hasReloaded` flag in `useDesignVersionSync` | Module-level JS variable | Until the next full page reload (which resets the module) |
| `designVersion` on `useCurrentUserContext()` | Apollo cache | Until the query is refetched or cache evicted (standard Apollo behavior) |

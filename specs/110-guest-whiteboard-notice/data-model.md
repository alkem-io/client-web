# Phase 1 Data Model: Guest whiteboard return notification (CRD)

This feature introduces **no server-side entities and no GraphQL**. The only data involved is the existing client-side guest session, read from browser session storage.

## Entity: Guest Session (client-only, existing)

Represents an anonymous whiteboard collaboration session. Persisted in `sessionStorage`; not a backend entity. Already established by spec 005 (Guest Whiteboard Access). This feature only **reads** it.

| Field | Storage key | Type | Set by | Read by |
|---|---|---|---|---|
| Guest display name | `alkemio_guest_name` | string | `CrdPublicWhiteboardPage` / `useGuestSession` (when the guest enters a name) | `getGuestName()` → `useGuestSessionReturn` |
| Whiteboard URL | `alkemio_guest_whiteboard_url` | string | `CrdPublicWhiteboardPage` (`setGuestWhiteboardUrl`) | `getGuestWhiteboardUrl()` → `useGuestSessionReturn` |

### Derived state

- **`shouldShowNotification`** = `Boolean(guestName && whiteboardUrl)` — both fields must be present. Computed in `useGuestSessionReturn`. This is the sole trigger for rendering the notice (FR-001).

### Lifecycle / transitions

| Transition | Trigger | Effect on session | Effect on notice |
|---|---|---|---|
| Created | Guest enters a display name on a public whiteboard | both keys written | notice will show on next sign-up visit |
| Read (notice shown) | Guest opens the CRD sign-up page with both keys present | unchanged (FR-006) | notice rendered |
| Back to whiteboard | Guest activates "Back to whiteboard" | unchanged (FR-006) | n/a (navigates away) |
| Go to website | Guest activates "Go to our website" | unchanged (FR-006) | n/a (navigates away) |
| Cleared | Guest successfully authenticates (login/registration) → `clearAllGuestSessionData()` | both keys removed (FR-007) | notice will NOT show again |
| Absent / partial | Only one key (or neither) present | n/a | notice NOT rendered (FR-008, edge case) |

### Validation rules

- The notice renders **only** when BOTH keys are non-empty strings. A single key present → no notice (spec Edge Case "Partial session data").
- Session storage being unavailable (private mode / blocked) resolves both getters to `null` → no notice, no error (the getters already use optional chaining `globalThis.sessionStorage?.…`).

## Component prop model (presentational)

The CRD component is data-free in the GraphQL sense; its "model" is its plain-TypeScript prop contract. See [`contracts/GuestReturnNotice.contract.ts`](./contracts/GuestReturnNotice.contract.ts).

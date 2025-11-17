# Data Model: Whiteboard Guest Access Toggle

## Entities

### Whiteboard

- **Identifiers**: `id` (UUID), `nameID` (slug used in URLs)
- **Attributes**:
  - `guestContributionsAllowed` (Boolean) — reflects if the public guest experience is currently active.
  - `authorization.myPrivileges` (Privilege[]) — used to determine whether the viewer sees toggle controls.
  - `previewSettings` (existing object) — unchanged but warnings overlay the preview when guests are allowed.
- **Derived Fields**:
  - `guestShareUrl` (string, client-computed) — generated from space slug + whiteboard `nameID`; not persisted in backend.
- **State Transitions**:
  1. **Disabled → Enabled**: triggered via `updateWhiteboardGuestAccess` mutation with `allowGuestContributions = true`; UI renders link and warnings on confirmation.
  2. **Enabled → Disabled**: triggered with `allowGuestContributions = false`; UI hides link and warnings immediately after confirmation.

### Space Member (viewer)

- **Identifiers**: `id` (UUID)
- **Attributes**:
  - `hasPrivilege(PUBLIC_SHARE)` (Boolean) — indicates if the member sees the toggle.
- **Relationships**: belongs to a Space that contains the whiteboard.
- **Responsibilities**: authorized members invoke toggle; all members view warnings/link when enabled.

### Guest Share Link (client derived)

- **Source Data**: space slug, whiteboard `nameID`
- **Format**: `https://{alkemio-domain}/guest/whiteboard/{spaceSlug}/{whiteboardNameID}` (final path confirmed during implementation).
- **Lifecycle**: regenerated deterministically each time guest access turns on; invalid when the flag becomes false.

## Validation Rules

- Toggle requests must originate from viewers whose privileges include `PUBLIC_SHARE`.
- UI must confirm backend `guestContributionsAllowed` before exposing the generated link.
- Warnings must remain visible while `guestContributionsAllowed` is true for the current whiteboard state.
- Client must remove any cached guest link when the backend returns false or an error.

## Relationships

- A Space owns many Whiteboards; guest access warnings should appear anywhere the whiteboard preview is rendered within that space.
- The Share dialog composes data from the whiteboard façade; it must not store independent guest-access state outside Apollo caches.

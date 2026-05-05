# Phase 1 Data Model — CRD Space Apply/Join Button on Dashboard

**Feature**: 088-crd-space-apply-button
**Date**: 2026-04-17

This feature introduces exactly one new TypeScript type: the props contract for `SpaceApplyButtonConnector`. Every other type consumed at runtime is re-used unchanged from spec 087 or the domain layer.

## 1. New type: `SpaceApplyButtonConnectorProps`

Defined at `src/main/crdPages/space/SpaceApplyButtonConnector.tsx`.

```typescript
type SpaceApplyButtonConnectorProps = {
  /** The Space the viewer is looking at. Feeds `useApplicationButton({ spaceId })`. */
  spaceId: string;

  /** The Space's root profile URL. Used by the `onJoin` callback to navigate
   *  the newly-joined member into the Space on success. */
  spaceProfileUrl: string;

  /** Optional wrapper className. The connector wraps the CRD button
   *  in a <div> so callers can control top/bottom spacing within the
   *  Dashboard content column (e.g., `mb-6`). */
  className?: string;
};
```

### Field rules

| Field | Required | Validation | Notes |
|---|---|---|---|
| `spaceId` | Yes | Non-empty string | If empty, `useApplicationButton` skips its query (it already guards via `skip: !spaceId`). In practice the Dashboard page never renders this connector with an empty id — it is wrapped in the Space route which resolves `space.id` before mounting. |
| `spaceProfileUrl` | Yes | Non-empty string | Must be the Space root URL (`space.about.profile.url`) so `onJoin` → `navigate(spaceProfileUrl)` lands the new member on the Space root. |
| `className` | No | Tailwind-safe string | Applied to the wrapping `<div>`, not the button itself. The button remains `w-full` internally; `className` controls outer layout concerns. |

No transformations or derived fields are exposed to consumers — everything else the connector needs comes from `useApplicationButton` and `useSpace()`.

## 2. Re-used types (no modifications)

### 2.1 `applicationButtonProps` (from `useApplicationButton`)

Source: `src/domain/access/ApplicationsAndInvitations/useApplicationButton.ts`

```typescript
// The hook returns { applicationButtonProps, loading: boolean }
// applicationButtonProps is:
Omit<ApplicationButtonProps, 'spaceId' | 'spaceLevel'>
// which expands to:
{
  isAuthenticated: boolean;
  isMember: boolean;
  isParentMember: boolean;
  applyUrl: string | undefined;              // the Space profile URL
  parentUrl: string | undefined;
  applicationState: 'new' | 'archived' | string | undefined;
  userInvitation: PendingInvitationItem | undefined;
  parentApplicationState: string | undefined;
  parentCommunityName: string | undefined;
  parentCommunitySpaceLevel: SpaceLevel | undefined;
  subspaceName: string | undefined;
  canJoinCommunity: boolean;
  canAcceptInvitation: boolean;
  canApplyToCommunity: boolean;
  canJoinParentCommunity: boolean;
  canApplyToParentCommunity: boolean;
  onJoin: () => Promise<void>;
  onUpdateInvitation: () => Promise<void>;
  loading: boolean;
}
```

Every field is passed through to the CRD button per the mapping in [`contracts/connector.md`](./contracts/connector.md).

### 2.2 `SpaceAboutApplyButtonProps` (from spec 087)

Source: `src/crd/components/space/SpaceAboutApplyButton.tsx`

Unchanged. The connector maps the domain-side `applicationButtonProps` onto this presentational contract.

### 2.3 Flow-surface props (from spec 087)

All five surfaces consume their own already-published prop contracts:
- `ApplyDialogConnectorProps` — `src/main/crdPages/space/about/ApplyDialogConnector.tsx`
- `InvitationDetailConnectorProps` — `src/main/crdPages/space/about/InvitationDetailConnector.tsx`
- `ApplicationSubmittedDialogProps` — `src/crd/components/community/ApplicationSubmittedDialog.tsx`
- `PreApplicationDialogProps` — `src/crd/components/community/PreApplicationDialog.tsx`
- `PreJoinParentDialogProps` — `src/crd/components/community/PreJoinParentDialog.tsx`

None are modified.

## 3. Connector-local visual state

The connector holds five `useState<boolean>` flags, each strictly visual and independent:

| State | Default | Opens when user clicks | Closes when |
|---|---|---|---|
| `isApplyDialogOpen` | `false` | `onApplyClick` / `onJoinClick` | `onApplied` success or user dismisses the dialog |
| `isInvitationDialogOpen` | `false` | `onAcceptInvitationClick` | User accepts or rejects or dismisses |
| `isPreAppDialogOpen` | `false` | `onApplyParentClick` | User dismisses |
| `isPreJoinDialogOpen` | `false` | `onJoinParentClick` | User dismisses |
| `isSubmittedDialogOpen` | `false` | Set to `true` by `onApplied` callback | User closes the submitted dialog |

No cross-dialog coordination logic (e.g., "close Apply when opening Invitation") is required — each dialog is user-triggered from a distinct button state and the button itself is only visible when exactly one of those states is active.

## 4. No entity model changes

This feature adds no new domain entities, no new GraphQL types, no new database-shaped objects, and no new API surfaces. Every data shape referenced at runtime already exists in the codebase and is consumed unchanged.

## 5. State transitions

The state transitions of the Dashboard CTA are identical to those of the About dialog CTA (087) because they share the same state machine (`SpaceAboutApplyButton`) driven by the same hook (`useApplicationButton`). For reference:

```
[initial render with state resolved]
    │
    ├─ isMember?                        → (connector returns null; no state)
    ├─ !isAuthenticated?                → "Sign in to apply"     ──click──> navigate(login URL)
    ├─ canAcceptInvitation?             → "Accept invitation"    ──click──> open Invitation dialog
    ├─ canJoinCommunity?                → "Join"                 ──click──> open Apply dialog (join mode)
    ├─ applicationState is pending?     → "Application pending"  (disabled)
    ├─ canApplyToCommunity?             → "Apply"                ──click──> open Apply dialog (apply mode)
    ├─ isParentMember?                  → "Apply not available"  (disabled)
    ├─ parentApplicationState pending?  → "Parent application pending" (disabled)
    ├─ canJoinParentCommunity?          → "Join" (to parent)     ──click──> open PreJoinParent dialog
    ├─ canApplyToParentCommunity?       → "Apply" (to parent)    ──click──> open PreApplication dialog
    └─ fallback                         → "Apply not available"  (disabled)
```

On successful apply mutation: Apollo cache update → `useApplicationButtonQuery` re-renders → button transitions from "Apply" to "Application pending".
On successful join mutation: `clearCacheForType(cache, 'Authorization')` → `isMember` flips to `true` → connector returns `null`.
On successful invitation accept: handler from `useInvitationActions` navigates to the Space URL → page remounts as a member → connector returns `null`.

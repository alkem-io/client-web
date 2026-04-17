# Contract — `SpaceApplyButtonConnector`

**Feature**: 088-crd-space-apply-button
**File**: `src/main/crdPages/space/SpaceApplyButtonConnector.tsx` (NEW)

## Public surface

```typescript
type SpaceApplyButtonConnectorProps = {
  spaceId: string;
  spaceProfileUrl: string;
  className?: string;
};

export function SpaceApplyButtonConnector(props: SpaceApplyButtonConnectorProps): JSX.Element | null;
```

No `ref`, no render-prop, no `children`. The connector is terminal.

## Responsibilities

1. Call `useApplicationButton({ spaceId, onJoin: () => navigate(spaceProfileUrl) })`.
2. Render `null` whenever `applicationButtonProps.isMember === true` OR `applicationButtonProps.loading === true`. The ambient hook's `loading` flag is authoritative.
3. Render the presentational `SpaceAboutApplyButton` with props mapped from `applicationButtonProps` plus the five click callbacks.
4. Render five dialog subtrees as siblings of the button, each open/closed by local `useState<boolean>` flags. Dialogs that are closed are lightweight; Apollo queries inside them are gated by the dialog's `open` prop (this behavior is inherited from 087 and is not re-implemented here).
5. Pull the Space display name from `useSpace()` for the `ApplicationSubmittedDialog.communityName` prop.

## Events the connector does not emit

The connector has no `on*` props. Everything the outside world needs to know (join success, apply success, invitation accept, etc.) is already propagated through the Apollo cache and the existing domain hooks (which the Dashboard page separately consumes via `useSpace()` for membership state).

## State-mapping table

The mapping from `applicationButtonProps` (domain) to `SpaceAboutApplyButton` props (presentational) is one-to-one and identical to the mapping used by `CrdSpaceAboutPage.tsx:162-183`.

| `SpaceAboutApplyButton` prop | Source |
|---|---|
| `isAuthenticated` | `applicationButtonProps.isAuthenticated` |
| `isMember` | `applicationButtonProps.isMember` |
| `isParentMember` | `applicationButtonProps.isParentMember` |
| `applicationState` | `applicationButtonProps.applicationState` |
| `userInvitation` | `applicationButtonProps.userInvitation` |
| `parentApplicationState` | `applicationButtonProps.parentApplicationState` |
| `canJoinCommunity` | `applicationButtonProps.canJoinCommunity` |
| `canAcceptInvitation` | `applicationButtonProps.canAcceptInvitation` |
| `canApplyToCommunity` | `applicationButtonProps.canApplyToCommunity` |
| `canJoinParentCommunity` | `applicationButtonProps.canJoinParentCommunity` |
| `canApplyToParentCommunity` | `applicationButtonProps.canApplyToParentCommunity` |
| `loading` | `applicationButtonProps.loading` (always `false` when rendered, because the outer visibility guard already excludes loading) |
| `onLoginClick` | `() => navigate(buildLoginUrl(applicationButtonProps.applyUrl))` |
| `onApplyClick` | `() => setIsApplyDialogOpen(true)` |
| `onJoinClick` | `() => setIsApplyDialogOpen(true)` (`ApplyDialogConnector` opens in `join` mode when `canJoinCommunity`) |
| `onAcceptInvitationClick` | `() => setIsInvitationDialogOpen(true)` |
| `onApplyParentClick` | `() => setIsPreAppDialogOpen(true)` |
| `onJoinParentClick` | `() => setIsPreJoinDialogOpen(true)` |

## Dialog subtree wiring

| Dialog | Open when | `onOpenChange` | Extra props |
|---|---|---|---|
| `<ApplyDialogConnector>` | `isApplyDialogOpen` | `setIsApplyDialogOpen` | `spaceId={spaceId}`, `canJoinCommunity={applicationButtonProps.canJoinCommunity}`, `onJoin={() => applicationButtonProps.onJoin()}`, `onApplied={() => setIsSubmittedDialogOpen(true)}` |
| `<ApplicationSubmittedDialog>` | `isSubmittedDialogOpen` | `setIsSubmittedDialogOpen` | `communityName={space.about.profile.displayName}` (via `useSpace()`) |
| `<InvitationDetailConnector>` | `isInvitationDialogOpen` | `setIsInvitationDialogOpen` | `invitation={applicationButtonProps.userInvitation}` |
| `<PreApplicationDialog>` | `isPreAppDialogOpen` | `setIsPreAppDialogOpen` | `dialogVariant={isApplicationPending(applicationButtonProps.parentApplicationState) ? 'dialog-parent-app-pending' : 'dialog-apply-parent'}`, plus `parentCommunity*`, `subspaceName`, `parentApplicationState`, `applyUrl`, `parentApplyUrl` all from `applicationButtonProps` |
| `<PreJoinParentDialog>` | `isPreJoinDialogOpen` | `setIsPreJoinDialogOpen` | `parentCommunityName`, `parentCommunitySpaceLevel`, `subspaceName`, `parentApplyUrl` all from `applicationButtonProps` |

The `preAppDialogVariant` helper is imported from `@/domain/community/applicationButton/isApplicationPending` — same import `CrdSpaceAboutPage` already uses.

## Imports (exhaustive)

```typescript
import { useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { ApplicationSubmittedDialog } from '@/crd/components/community/ApplicationSubmittedDialog';
import { PreApplicationDialog } from '@/crd/components/community/PreApplicationDialog';
import { PreJoinParentDialog } from '@/crd/components/community/PreJoinParentDialog';
import { SpaceAboutApplyButton } from '@/crd/components/space/SpaceAboutApplyButton';
import useApplicationButton from '@/domain/access/ApplicationsAndInvitations/useApplicationButton';
import isApplicationPending from '@/domain/community/applicationButton/isApplicationPending';
import { useSpace } from '@/domain/space/context/useSpace';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import { ApplyDialogConnector } from './about/ApplyDialogConnector';
import { InvitationDetailConnector } from './about/InvitationDetailConnector';
```

**Forbidden imports** (must not be added):
- `@mui/*`, `@emotion/*` — this is integration-layer code but Arch 2 still rules: no MUI is rendered.
- Any file under `src/crd/` other than the five listed above.
- `react-router-dom` directly — use `@/core/routing/useNavigate`.

## Edit target — `CrdSpaceDashboardPage.tsx`

Two additions:

```typescript
// Added import
import { SpaceApplyButtonConnector } from '../SpaceApplyButtonConnector';

// Added JSX, inside the returned fragment, immediately before <CalloutListConnector>:
<SpaceApplyButtonConnector
  spaceId={space.id}
  spaceProfileUrl={space.about.profile.url}
  className="mb-6"
/>
```

No other changes. `space` is already in scope via the existing `useSpace()` call at `CrdSpaceDashboardPage.tsx:20`.

## Accessibility contract

Inherited entirely from `SpaceAboutApplyButton` (087):
- Keyboard-focusable button with visible `focus-visible:ring` indicator.
- `aria-hidden="true"` on the decorative icons inside the button (`Plus`, `User`, `Loader2`).
- `aria-busy={true}` when in loading state (the outer connector guards against this render, but the CRD button defends in depth).
- `aria-disabled={true}` for all disabled states ("Member", "Application pending", "Apply not available", etc.).
- Helper text beneath the button for the unauthenticated state is a plain `<p>` — visible to all users and screen readers alike.

Dialog subtrees inherit focus-trap, Esc-to-close, and focus return behavior from their 087 implementations.

## Non-goals (explicit exclusions)

- No ref forwarding (the About-dialog-only "Learn how to apply" lock-tooltip indirection does not apply here).
- No Contact-host affordance (out of scope for this feature).
- No community guidelines "Read more" surface (lives in About dialog, not Dashboard).
- No per-section edit pencils (About-only, 087).

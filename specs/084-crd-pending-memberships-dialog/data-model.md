# Data Model: CRD Pending Memberships Dialog

**Feature**: 084-crd-pending-memberships-dialog
**Date**: 2026-04-08

## Entities

### PendingInvitationCardData (CRD prop type)

Flat data for rendering one invitation card in the list view.

| Field | Type | Source |
|-------|------|--------|
| id | string | `PendingInvitationItem.id` |
| spaceName | string | `InvitationWithMeta.space.about.profile.displayName` |
| spaceAvatarUrl | string? | `InvitationWithMeta.space.about.profile.cardBanner?.uri` |
| senderName | string | `InvitationWithMeta.userDisplayName` |
| welcomeMessageExcerpt | string? | `InvitationWithMeta.invitation.welcomeMessage` (truncated) |
| timeElapsed | string | `formatTimeElapsed(invitation.createdDate, t)` |

### PendingApplicationCardData (CRD prop type)

Flat data for rendering one application card in the list view.

| Field | Type | Source |
|-------|------|--------|
| id | string | `PendingApplicationItem.id` |
| spaceName | string | `ApplicationWithMeta.space.about.profile.displayName` |
| spaceAvatarUrl | string? | `ApplicationWithMeta.space.about.profile.cardBanner?.uri` |
| tagline | string? | `ApplicationWithMeta.space.about.profile.tagline` |
| spaceHref | string | `ApplicationWithMeta.space.about.profile.url` |

### InvitationDetailData (CRD prop type)

Flat data for rendering the invitation detail view.

| Field | Type | Source |
|-------|------|--------|
| spaceName | string | `InvitationWithMeta.space.about.profile.displayName` |
| spaceAvatarUrl | string? | `InvitationWithMeta.space.about.profile.cardBanner?.uri` |
| spaceTagline | string? | `InvitationWithMeta.space.about.profile.tagline` |
| spaceTags | string[] | `InvitationWithMeta.space.about.profile.tagset?.tags ?? []` |
| spaceHref | string | `InvitationWithMeta.space.about.profile.url` |
| senderName | string | `InvitationWithMeta.userDisplayName` |
| timeElapsed | string | `formatTimeElapsed(invitation.createdDate, t)` |

Note: `descriptionSlot`, `welcomeMessageSlot`, and `guidelinesSlot` are `ReactNode` — rendered by the integration layer, not mapped from data.

## Data Flow

```
GraphQL Layer (unchanged)
  │
  ├── useUserPendingMembershipsQuery → { invitations, applications }
  │     (skipped when dialog closed)
  │
  ├── useInvitationHydrator(invitation) → InvitationWithMeta
  │     ├── useSpacePrivilegesQuery(spaceId)
  │     ├── usePendingMembershipsSpaceQuery(spaceId)
  │     └── usePendingMembershipsUserQuery(userId)
  │
  ├── useApplicationHydrator(application) → ApplicationWithMeta
  │     ├── useSpacePrivilegesQuery(spaceId)
  │     └── usePendingMembershipsSpaceQuery(spaceId)
  │
  └── useInvitationStateEventMutation → accept/reject
        (via useInvitationActions hook)

Integration Layer (new)
  │
  ├── HydratedInvitationCard component
  │     calls useInvitationHydrator → maps to PendingInvitationCardData → renders PendingInvitationCard
  │
  ├── HydratedApplicationCard component
  │     calls useApplicationHydrator → maps to PendingApplicationCardData → renders PendingApplicationCard
  │
  └── InvitationDetailContainer component
        calls useInvitationHydrator(withCommunityGuidelines) + useInvitationActions
        → maps to InvitationDetailData + renders slots → renders InvitationDetailDialog

CRD Layer (new, presentational only)
  │
  ├── PendingMembershipsListDialog — shell with loading/empty states
  ├── PendingMembershipsSection — titled section wrapper
  ├── PendingInvitationCard — clickable card
  ├── PendingApplicationCard — clickable card with link
  └── InvitationDetailDialog — detail view with accept/decline actions
```

## Mapping Functions

### mapHydratedInvitationToCardData

```
Input:  InvitationWithMeta (from useInvitationHydrator)
        TFunction (for formatTimeElapsed)
Output: PendingInvitationCardData
```

Truncates `welcomeMessage` to ~100 characters for the card excerpt.

### mapHydratedApplicationToCardData

```
Input:  ApplicationWithMeta (from useApplicationHydrator)
Output: PendingApplicationCardData
```

### mapHydratedInvitationToDetailData

```
Input:  InvitationWithMeta (from useInvitationHydrator)
        TFunction (for formatTimeElapsed)
Output: InvitationDetailData
```

Note: Does NOT include community guidelines — those are rendered separately via a slot prop.

## State Management

No new state mechanisms. Reuses:
- `PendingMembershipsDialogContext` — dialog open/close and view switching (list vs detail)
- `useInvitationActions` — accept/reject loading states
- Apollo cache — refetch queries after mutations (existing behavior)

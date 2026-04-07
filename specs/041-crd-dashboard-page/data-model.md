# Data Model: CRD Dashboard Page Migration

**Branch**: `041-crd-dashboard-page` | **Date**: 2026-04-03

## Overview

No new data model or GraphQL schema changes. The CRD dashboard reuses all existing GraphQL hooks. Data mappers in `src/main/crdPages/dashboard/dashboardDataMappers.ts` transform GraphQL response types into plain TypeScript prop types consumed by CRD components.

## CRD Component Prop Types (Plain TypeScript)

### CompactSpaceCardData

```typescript
type CompactSpaceCardData = {
  id: string;
  name: string;
  href: string;
  bannerUrl?: string;
  isPrivate: boolean;
  isHomeSpace: boolean;
};
```

**Source**: `useRecentSpacesQuery` + `useHomeSpaceLookupQuery`
**Mapper**: `mapRecentSpacesToCompactCards()`

### ActivityItemData

```typescript
type ActivityItemData = {
  id: string;
  avatarUrl?: string;
  avatarInitials: string;
  userName: string;
  actionText: string;        // i18n-resolved action description
  targetName: string;        // space/callout name
  targetHref?: string;       // link to target
  timestamp: string;         // ISO date string (relative formatting in CRD component)
};
```

**Source**: `useLatestContributionsQuery` (space activity) / `useLatestContributionsGroupedQuery` (personal)
**Mapper**: `mapActivityToFeedItems()`

### ActivityFilterOption

```typescript
type ActivityFilterOption = {
  value: string;
  label: string;
};
```

**Source**: Derived from space memberships list
**Mapper**: Built in integration layer from `useLatestContributionsSpacesFlatQuery` results

### SidebarResourceData

```typescript
type SidebarResourceData = {
  id: string;
  name: string;
  href: string;
  avatarUrl?: string;
  initials: string;
  avatarColor?: string;
};
```

**Source**: `useMyResourcesQuery`
**Mapper**: `mapResourcesToSidebarItems()`

### SidebarMenuItemData

```typescript
type SidebarMenuItemData = {
  id: string;
  label: string;
  icon: string;              // lucide-react icon name (resolved in CRD component)
  href?: string;             // for navigation items
  onClick?: () => void;      // for dialog triggers
  badgeCount?: number;       // for invitations
};
```

**Source**: Built in `useDashboardSidebar.ts` from static menu definition + `usePendingInvitationsCount`

### InvitationCardData

```typescript
type InvitationCardData = {
  id: string;
  spaceName: string;
  spaceHref: string;
  senderName: string;
  senderAvatarUrl?: string;
  role: string;
  onAccept: () => void;
  onDecline: () => void;
};
```

**Source**: `usePendingInvitationsQuery`
**Mapper**: `mapInvitationsToCards()` (callbacks wired in integration layer)

### SpaceHierarchyCardData

```typescript
type SpaceHierarchyCardData = {
  id: string;
  name: string;
  href: string;
  tagline?: string;
  bannerUrl?: string;
  isHomeSpace: boolean;
  subspaces: Array<{
    id: string;
    name: string;
    href: string;
  }>;
};
```

**Source**: `useDashboardWithMembershipsLazyQuery`
**Mapper**: `mapDashboardSpaces()`

### MembershipTreeNodeData

```typescript
type MembershipTreeNodeData = {
  id: string;
  name: string;
  href: string;
  avatarUrl?: string;
  initials: string;
  avatarColor?: string;
  roles: string[];           // e.g., ["Admin", "Member"]
  children: MembershipTreeNodeData[];
};
```

**Source**: `useMyMembershipsQuery`
**Mapper**: `mapMembershipsToTree()`

### TipItemData

```typescript
type TipItemData = {
  id: string;
  title: string;
  description: string;
  href?: string;
  iconUrl?: string;
};
```

**Source**: i18n keys in `crd-dashboard` namespace (static content)

## GraphQL Hooks → CRD Prop Type Mapping

| GraphQL Hook | CRD Prop Type | Mapper Function |
| --- | --- | --- |
| `useRecentSpacesQuery` + `useHomeSpaceLookupQuery` | `CompactSpaceCardData[]` | `mapRecentSpacesToCompactCards()` |
| `useLatestContributionsQuery` | `ActivityItemData[]` | `mapActivityToFeedItems()` |
| `useLatestContributionsGroupedQuery` | `ActivityItemData[]` | `mapActivityToFeedItems()` |
| `useLatestContributionsSpacesFlatQuery` | `ActivityFilterOption[]` | inline in integration layer |
| `useMyResourcesQuery` | `SidebarResourceData[]` (×4 sections) | `mapResourcesToSidebarItems()` |
| `usePendingInvitationsQuery` | `InvitationCardData[]` | `mapInvitationsToCards()` |
| `usePendingInvitationsCount` | `number` | direct pass-through |
| `useDashboardWithMembershipsLazyQuery` | `SpaceHierarchyCardData[]` | `mapDashboardSpaces()` |
| `useMyMembershipsQuery` | `MembershipTreeNodeData[]` | `mapMembershipsToTree()` |
| `useLatestReleaseDiscussionQuery` | `{ title: string; content: string; href: string }` | inline extraction |
| `useCurrentUserContext` | auth state + user info | handled by `CrdLayoutWrapper` |
| `useCreateSpaceLink` | `string` (href) | direct pass-through |
| `useVirtualContributorWizard` | `{ startWizard: () => void }` | callback prop |

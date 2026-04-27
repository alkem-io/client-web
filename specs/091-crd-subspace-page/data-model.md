# Data Model: CRD SubSpace Page

**Branch**: `091-crd-subspace-page` | **Date**: 2026-04-26

These are the CRD component prop types and integration-layer data-mapper outputs — plain TypeScript, never GraphQL generated types. Data mappers in `src/main/crdPages/subspace/dataMappers/` and `src/main/crdPages/space/dataMappers/` transform GraphQL responses into these shapes.

> **Convention**: any field that may be missing for a given entity uses `?:` rather than `| null`. The mapper normalises `null` → `undefined` so the CRD components only deal with one absent shape.

---

## Banner

### `SubspaceBannerData`
Source: `src/main/crdPages/subspace/dataMappers/subspacePageDataMapper.ts` → consumed by `SubspaceHeader`.

```typescript
type SubspaceBannerData = {
  /** L1 / L2 subspace identity */
  title: string;                        // subspace.about.profile.displayName
  tagline?: string;                     // subspace.about.profile.tagline
  subspaceInitials: string;             // first 2 letters of title (uppercase)
  subspaceColor: string;                // pickColorFromId(subspace.id) — only used when subspaceAvatarUrl is missing
  subspaceAvatarUrl?: string;           // subspace.about.profile.avatar?.uri

  /** Immediate parent identity (L0 for an L1; L1 for an L2). Per FR-003 + clarification Q3. */
  parentName: string;                   // parent.about.profile.displayName — used for aria-label
  parentInitials: string;
  parentColor: string;                  // pickColorFromId(parent.id) — fallback
  parentBannerUrl?: string;             // parent.about.profile.banner?.uri — banner background

  /** Level badge */
  badgeLabel: 'SubSpace' | 'SubSubSpace'; // derived from space.level (L1 → SubSpace, L2 → SubSubSpace)
};
```

### `BannerCommunityData`
Returned by the extended `mapMemberAvatars` in `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts`. Consumed by both `SpaceHeader` (L0) and `SubspaceHeader` (L1).

```typescript
type MemberAvatar = {
  id: string;
  url?: string;                         // user.profile.avatar?.uri
  initials: string;                     // first 2 letters of displayName
};

// Note: the `BannerCommunityData = { avatars, totalCount }` shape originally proposed here
// is dropped — see tasks.md T004. Banner shows lead-user avatars only (no `+N` overflow chip).
// `useCrdSubspace` exposes a flat `bannerAvatars: MemberAvatar[]` instead.
```

### `SubspaceHeaderActionsData`
Determines which icons render on the banner action row.

```typescript
type SubspaceHeaderActionsData = {
  showActivity: boolean;                // always true (recent-activity dialog is platform-wide)
  showVideoCall: boolean;               // entitlement-driven; mirror L0
  showShare: boolean;                   // always true
  showSettings: boolean;                // permissions.canUpdate
  shareUrl: string;                     // subspace.about.profile.url
  settingsHref?: string;                // buildSubspaceSettingsUrl(subspace.about.profile.url) — legacy link
};
```

---

## Innovation Flow Tabs

### `SubspaceFlowPhase`
Consumed by `SubspaceFlowTabs`.

```typescript
type SubspaceFlowPhase = {
  id: string;                           // innovationFlow.states[].id
  label: string;                        // innovationFlow.states[].displayName
};
```

> **Intentionally absent**: no `count` field, no `linkedToNext` flag (FR-009 + FR-010). The component renders connectors unconditionally between every adjacent pair and never displays counts.

### `SubspaceFlowTabsData`
The data-mapper output. The component receives `phases` and `activePhaseId` directly.

```typescript
type SubspaceFlowTabsData = {
  phases: SubspaceFlowPhase[];          // ordered by sortOrder asc
  activePhaseId: string | undefined;    // resolved by useCrdSubspaceFlow (URL → currentState → first)
  canEditFlow: boolean;                 // permissions.canUpdate
  canAddPost: boolean;                  // permissions.canCreate (CreateCallout privilege)
  editFlowHref?: string;                // legacy flow editor link (until L1 settings migration)
};
```

---

## Right Sidebar

### `SubspaceSidebarData`
Aggregated by the integration layer; consumed by `SubspaceSidebar`.

```typescript
type SubspaceLeadData = {
  name: string;
  avatarUrl?: string;
  initials: string;
  href: string;                         // user.profile.url
  location?: string;                    // user.profile.location.{city, country}
};

type SubspaceVirtualContributorData = {
  name: string;
  avatarUrl?: string;
  description?: string;
  href: string;
};

type SubspaceQuickActionId =
  | 'community'
  | 'events'
  | 'activity'
  | 'index'
  | 'subspaces';

type SubspaceQuickAction = {
  id: SubspaceQuickActionId;
  label: string;                        // translated by the consumer (CRD layer reads from t())
};

type SubspaceSidebarData = {
  /** Info card body. The "Challenge Statement" header is intentionally omitted (FR-016). */
  whyMarkdown?: string;                 // subspace.about.why
  tagline?: string;                     // fallback when whyMarkdown is empty

  /** Lead block — singular or plural heading derived from leads.length */
  leads: SubspaceLeadData[];

  /** "About this Subspace" button rendered outside the info card (FR-017). */
  aboutHref: string;                    // typically subspace.about.profile.url + '/about', opens SpaceAboutDialog

  /** Quick Actions list (FR-018). The L1 layout owns the dialog state and reacts to onActionClick(id). */
  quickActions: SubspaceQuickAction[];

  /** Virtual Contributor section (FR-021). null when none associated → section is hidden. */
  virtualContributor?: SubspaceVirtualContributorData;
};
```

---

## Community Dialog

### `SubspaceCommunityDialogProps`
The dialog shell is presentational; the connector wraps `SpaceMembers` (whose own props are documented in `specs/042-crd-space-page/data-model.md`).

```typescript
type SubspaceCommunityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;                        // translated by the consumer
  description?: string;                 // optional dialog subtitle
  children: ReactNode;                  // rendered SpaceMembers element
};
```

The connector composes:

```typescript
type CrdSubspaceCommunityDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;                      // works for both L0 and L1
  roleSetId: string;
};
```

Internally it uses `useRoleSetManager(roleSetId)` and `useSubspaceCommunityDialogData(spaceId)` to map results to the `MemberCardData[]` shape that `SpaceMembers` already consumes.

---

## Visibility & Apply CTA

### `SubspaceVisibilityData`
Identical shape to `SpaceVisibilityData` from spec 042 — reuse `mapSpaceVisibility`.

```typescript
type SubspaceVisibilityStatus = 'active' | 'archived' | 'demo' | 'inactive';

type SubspaceVisibilityData = {
  status: SubspaceVisibilityStatus;
  contactHref?: string;
};
```

### `SubspaceApplyCtaData`
Pass-through from the existing `useApplicationButton` hook. No new mapper — `applicationButtonProps` is consumed directly by the existing `SpaceAboutApplyButton` CRD component.

```typescript
// shape lives in src/domain/access/ApplicationsAndInvitations/useApplicationButton.ts
// Documented here only for reference:
type ApplicationButtonProps = {
  isMember: boolean;
  isParentMember?: boolean;
  isAuthenticated: boolean;
  applicationState?: 'pending' | 'approved' | 'rejected';
  parentApplicationState?: 'pending' | 'approved' | 'rejected';
  userInvitation?: { id: string; createdDate: string };
  canJoinCommunity: boolean;
  canAcceptInvitation: boolean;
  canApplyToCommunity: boolean;
  canJoinParentCommunity: boolean;
  canApplyToParentCommunity: boolean;
  onJoin: (params: { communityId: string }) => void;
  // ...
};
```

---

## Aggregated page model

### `CrdSubspacePageData`
The output of `useCrdSubspace`, consumed by `CrdSubspacePageLayout`. Brings the per-section shapes together for one render.

```typescript
type CrdSubspacePageData = {
  loading: boolean;
  notFound: boolean;                    // when the URL resolves no subspace

  banner: SubspaceBannerData;
  bannerActions: SubspaceHeaderActionsData;
  bannerCommunity: BannerCommunityData; // shared shape with L0

  flowTabs: SubspaceFlowTabsData;

  sidebar: SubspaceSidebarData;

  visibility: SubspaceVisibilityData;
  apply: ApplicationButtonProps;        // from useApplicationButton

  /** Used by CrdSubspaceCommunityDialogConnector + breadcrumbs */
  subspaceId: string;
  subspaceName: string;
  parentSpaceId: string | undefined;
  parentSpaceUrl: string | undefined;
  parentSpaceName: string | undefined;

  /** Permissions surfaced on the page */
  canRead: boolean;
  canUpdate: boolean;
  canCreateCallout: boolean;
};
```

---

## State transitions

The L1 page itself is stateless beyond visual UI state (active phase, dialog open/close). All persistent state lives in Apollo cache or domain hooks.

**Visual state owned by `CrdSubspacePageLayout`**:
- `activePhaseId` (resolved by `useCrdSubspaceFlow`; written to URL `?phase=<id>` on change).
- `openDialog: SubspaceQuickActionId | null` (one-of state for the Quick Action dialogs).
- `aboutDialogOpen: boolean` (independent of Quick Actions).
- `communityDialogOpen: boolean` (also opens from the banner's avatar stack click).
- `applyDialogOpen: boolean` (managed by `SpaceAboutApplyButton`'s existing API).

No state machines needed.

---

## Validation rules (mapper-level)

- `subspaceInitials` and `parentInitials` always have ≥1 character (mapper takes `displayName.slice(0,2).toUpperCase()`; for empty displayNames the mapper returns `'??'`).
- `subspaceColor` and `parentColor` are always defined; `pickColorFromId` is total over all string ids.
- `bannerAvatars` length is bounded to ≤5 by the component (`SubspaceHeader` slices the prop). May be empty → the avatar stack is hidden (FR-028).
- `flowTabs.phases` may be empty → the component renders the empty-state message (FR-008 edge case + clarification Q4).
- `flowTabs.activePhaseId` is always one of `phases[].id` when `phases` is non-empty (resolver guarantees this).

---

## Reuse map

| New shape | Reuses / Extends | From |
|---|---|---|
| `BannerCommunityData` | Replaces today's `MemberAvatar[]` return of `mapMemberAvatars` | `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts` |
| `SubspaceVisibilityData` | Identical to `SpaceVisibilityData`, reuses `mapSpaceVisibility` | `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts` |
| `SubspaceLeadData` | Same fields as `SpaceLeadData` (lead block on L0) | `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts` |
| `MemberCardData` (consumed by community dialog) | Already defined for `SpaceMembers` | `src/crd/components/space/SpaceMembers.tsx` |
| `ApplicationButtonProps` | Existing domain shape, no remapping | `src/domain/access/ApplicationsAndInvitations/useApplicationButton.ts` |

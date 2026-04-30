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

### `LeadItem` (shared between L0 and L1)
Defined in `src/crd/components/space/sidebar/InfoBlock.tsx` and consumed by both the L0 and L1 sidebars via the shared `InfoBlock` widget (plan D14).

```typescript
type LeadItem = {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  location?: string;                    // user/org `profile.location.{city, country}`
  href?: string;                        // profile.url; absent for read-only rows
  type: 'person' | 'org';               // 'org' renders a square avatar
};
```

### `InfoBlockProps` (shared CRD widget)
The L0 and L1 sidebars both render a single `<InfoBlock>` at the top of the sidebar (plan D14). The widget is purely presentational: description in, leads in, edit callback in. The integration layer maps source data to this shape.

```typescript
type InfoBlockProps = {
  description: string;                  // markdown — sourced from profile.description (L0 + L1)
  leads?: LeadItem[];                   // rendered inline below the description with a thin white separator
  onEditClick?: () => void;             // hover pencil + whole-block click; ALWAYS navigates to settings/about (plan D17)
  className?: string;
};
```

The InfoBlock has only one click target (the edit pencil). The read-only About dialog is reached via a **separate** outline button rendered immediately below the InfoBlock by the parent sidebar component — see `SpaceSidebarProps.onAboutClick` and `SubspaceSidebarProps.onAboutClick` (plan D17).

### `SubspaceLeadData` (legacy alias)
Existed in earlier drafts as a separate L1-only lead shape. **Now structurally equivalent to `LeadItem`** and the SubspaceSidebar's data mapper produces `LeadItem[]` directly. The L1 hook continues to expose `leads` in `SubspaceSidebarData` (below) using the shared shape.

```typescript
// Identical to LeadItem above. Retained for backward compatibility in the integration layer.
type SubspaceLeadData = LeadItem;
```

### `SubspaceVirtualContributorData`
Unchanged — the Virtual Contributor card sits below the InfoBlock and is unrelated to the unification.

```typescript
type SubspaceVirtualContributorData = {
  id: string;
  name: string;
  avatarUrl?: string;
  description?: string;
  initials: string;
  href: string;
};
```

### `SubspaceQuickActionId` / Quick Action labels
Unchanged.

```typescript
type SubspaceQuickActionId =
  | 'community'
  | 'events'
  | 'activity'
  | 'index'
  | 'subspaces';
```

### `SubspaceSidebarData`
Aggregated by `useCrdSubspace` and consumed by `SubspaceSidebar`. **Updated during polish (plan D14)**: the `whyMarkdown` and `tagline` fields are gone — the description is now sourced from `subspace.about.profile.description` and rendered through the shared `InfoBlock`. The standalone "About this Subspace" outline button below the InfoBlock was briefly removed but later **restored** (plan D17) — clicking it opens the read-only `SpaceAboutDialog`. The InfoBlock pencil now navigates to `${subspaceUrl}/settings/about` (the edit surface) — never to the dialog. Both destinations are wired by `CrdSubspacePageLayout` via two distinct sidebar props (`onEditClick`, `onAboutClick`); neither is a URL-shaped data-model field.

```typescript
type SubspaceSidebarData = {
  /** Sourced from subspace.about.profile.description (markdown). Replaces the previously
   *  separate `whyMarkdown`/`tagline` fields. Rendered through the shared InfoBlock. */
  description: string;

  /** Lead users + lead organizations, mapped to the shared LeadItem shape. Rendered inline
   *  inside the InfoBlock (FR-015). */
  leads: LeadItem[];

  /** Virtual Contributor section (FR-021). undefined when none associated → section is hidden. */
  virtualContributor?: SubspaceVirtualContributorData;
};
```

> **Removed from this shape (post-polish)**:
> - `whyMarkdown` / `tagline` — replaced by the single `description` field.
> - `aboutHref` — the read-only About dialog is reached via the layout-owned `onAboutClick` callback (button below the InfoBlock); the edit surface is reached via `onEditClick` (InfoBlock pencil) which navigates to `${subspaceUrl}/settings/about`. Both are layout concerns, not data-model concerns. (Plan D17.)
> - `quickActions: SubspaceQuickAction[]` — the L1 layout uses a static `QUICK_ACTIONS` table inside `SubspaceSidebar.tsx` for the icons + ids, with labels translated via `t('crd-subspace:sidebar.quickActions.*')`. The data mapper does not produce a quick-actions array.

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
  bannerAvatars: MemberAvatar[];        // flat lead-user avatars (no `+N`/totalCount — research R1)

  /** Innovation flow (consumed by SubspaceFlowTabs + the callouts page) */
  phases: SubspaceFlowPhase[];
  currentPhaseId: string | undefined;
  canEditFlow: boolean;
  canAddPost: boolean;

  sidebar: SubspaceSidebarData;         // description + leads + optional VC (post-polish shape)

  visibility: SubspaceVisibilityData;
  applicationButtonProps: ApplicationButtonProps; // pass-through from useApplicationButton
  applicationLoading: boolean;

  /** Identity — used by the shared community-dialog connector and breadcrumbs */
  subspaceId: string;
  subspaceName: string;
  subspaceUrl: string;
  parentSpaceId: string | undefined;
  parentSpaceUrl: string | undefined;
  parentSpaceName: string | undefined;
  /** L0 ancestor — distinct from parent only when viewing an L2 (otherwise identical) */
  levelZeroSpaceId: string | undefined;
  levelZeroSpaceUrl: string | undefined;
  levelZeroSpaceName: string | undefined;
  roleSetId: string | undefined;
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;

  /** Permissions surfaced on the page */
  canRead: boolean;
  canUpdate: boolean;
};
```

### `useCrdSpaceLeads` (L0 sidebar leads — polish addition)
The L0 sidebar's leads are loaded by a new shared hook because `SpaceContext` only fetches the lightweight `SpaceAboutLight` fragment (which omits `leadUsers` / `leadOrganizations`). The hook lives at `src/main/crdPages/space/hooks/useCrdSpaceLeads.ts` and is invoked by the Dashboard, Subspaces, and Knowledge L0 tab pages (the Community tab already exposes leads via its own `useCrdSpaceCommunity` hook). Plan D15.

```typescript
function useCrdSpaceLeads(spaceId: string | undefined): LeadItem[];
```

Internally calls `useSpaceAboutDetailsQuery({ spaceId, skip: !spaceId })`, then `mapSidebarLeads(leadUsers, leadOrganizations)`. Apollo dedupes against the same query when used by other consumers (e.g. the L1 layout for the parent banner).

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
| `LeadItem` (post-polish) | Single shared lead shape used by both L0 and L1 sidebars; replaces the previously-distinct `SubspaceLeadData` and `SidebarLeadData`. Mapped by `mapSidebarLeads(leadUsers, leadOrganizations?)`. | `src/crd/components/space/sidebar/InfoBlock.tsx` (type) + `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts` (mapper) |
| `InfoBlockProps` (post-polish) | Shared sidebar widget consumed by both `SpaceSidebar` (L0) and `SubspaceSidebar` (L1). Replaces three previously-separate widgets (info card + LeadBlock + standalone About button). | `src/crd/components/space/sidebar/InfoBlock.tsx` |
| `MemberAvatar[]` (banner) | Returned by `mapMemberAvatars`. The earlier proposed `BannerCommunityData = { avatars, totalCount }` was deferred — see research R1. | `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts` |
| `SubspaceVisibilityData` | Identical to `SpaceVisibilityData`, reuses `mapSpaceVisibility` | `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts` |
| `MemberCardData` (consumed by community dialog) | Already defined for `SpaceMembers` | `src/crd/components/space/SpaceMembers.tsx` |
| `ApplicationButtonProps` | Existing domain shape, no remapping | `src/domain/access/ApplicationsAndInvitations/useApplicationButton.ts` |

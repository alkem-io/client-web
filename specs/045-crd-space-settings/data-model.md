# Phase 1 Data Model: CRD Space Settings Page

**Feature**: 045-crd-space-settings
**Date**: 2026-04-15

This feature introduces no new backend entities. It defines the shape of data mapped from existing GraphQL `SpaceSettingsQuery` responses into plain TypeScript props consumed by CRD components. All types below are authored by `src/main/crdPages/topLevelPages/spaceSettings/**` and passed as props to `src/crd/components/space/settings/**`.

---

## Shared view-model types

### `SpaceHeroProps`

Reused from spec 042 (`src/crd/components/space/SpaceHeader.tsx`). Re-imported by the settings shell unchanged.

**Note**: `SpaceHeroProps.bannerUrl` and `AboutFormValues.pageBannerUrl` refer to the **same underlying asset** — the page banner visible at the top of the Space page. The About form owns the source of truth (`pageBannerUrl`); the hero's `bannerUrl` is derived from the live About form state when editing. `cardBannerUrl` is a distinct, smaller banner used only in space cards and the Preview.

| Field | Type | Source |
|---|---|---|
| `spaceName` | `string` | `Space.profile.displayName` |
| `tagline` | `string` | `Space.profile.tagline` |
| `bannerUrl` | `string \| null` | `Space.profile.visuals[type=banner].uri` |
| `memberAvatars` | `{ id: string; displayName: string; avatarUrl: string \| null }[]` | `Space.community.memberUsers` (limit 5) |
| `memberCount` | `number` | `Space.community.memberUsers.length` |

### `TabId`

```
type TabId = 'about' | 'layout' | 'community' | 'subspaces' | 'templates' | 'storage' | 'settings' | 'account';
```

Used by the tab strip and URL sync hook. Any other string routes to `'about'` and the URL is normalized.

### `SaveBarState`

```
type SaveBarState =
  | { kind: 'clean' }
  | { kind: 'dirty'; canSave: boolean }
  | { kind: 'saving' }
  | { kind: 'saveError'; message: string };
```

Emitted by each tab's data hook. `canSave = false` when validation fails (e.g., empty page name on Layout tab).

---

## About tab

### `AboutViewProps`

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | Required, min length 1 |
| `tagline` | `string` | Optional |
| `pageBannerUrl` | `string \| null` | Uploaded banner |
| `cardBannerUrl` | `string \| null` | Smaller banner used in space cards |
| `avatarUrl` | `string \| null` | Logo / avatar |
| `tags` | `string[]` | Tags for discovery |
| `vision` | `string` | Rich text allowed |
| `mission` | `string` | Rich text allowed |
| `impact` | `string` | Rich text allowed |
| `who` | `string` | Rich text allowed |
| `previewCard` | `SpaceCardPreview` | Derived live from form state |
| `saveBar` | `SaveBarState` | — |
| `onChange` | `(patch: Partial<AboutFormValues>) => void` | — |
| `onSave` | `() => void` | — |
| `onReset` | `() => void` | — |
| `onUploadPageBanner` | `(file: File) => void` | — |
| `onUploadCardBanner` | `(file: File) => void` | — |
| `onUploadAvatar` | `(file: File) => void` | — |

### `SpaceCardPreview`

Plain mirror of the CRD `SpaceCard` props (name, tagline, banner, avatar, tags) but built from the About tab's **live** form state, not from Apollo.

---

## Layout tab

### `LayoutPoolColumn`

| Field | Type | Notes |
|---|---|---|
| `id` | `'home' \| 'community' \| 'subspaces' \| 'knowledge'` | Pool identifier |
| `title` | `string` | i18n-resolved column title |
| `description` | `string` | Short help text |
| `pages` | `LayoutPageRow[]` | Ordered list |

### `LayoutPageRow`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable ID across renders |
| `name` | `string` | Editable inline (when movable) |
| `kind` | `'system' \| 'callout'` | `'system'` = pinned, no grab handle; `'callout'` = movable |
| `icon` | `string` | Lucide icon key |

### `LayoutViewProps`

| Field | Type | Notes |
|---|---|---|
| `columns` | `LayoutPoolColumn[]` (length 4) | Fixed order: home / community / subspaces / knowledge |
| `saveBar` | `SaveBarState` | — |
| `onReorder` | `(pageId: string, target: { columnId: LayoutPoolColumn['id']; index: number }) => void` | Fires on drop and on keyboard commit (Enter) |
| `onRename` | `(pageId: string, newName: string) => void` | — |
| `onAdd` | `(columnId: LayoutPoolColumn['id'], name: string) => void` | — |
| `onRemove` | `(pageId: string) => void` | Preceded by `ConfirmDeleteDialog` |
| `onSave` | `() => void` | — |
| `onReset` | `() => void` | — |

**Validation**: `onReorder` is rejected in the mapper if the source `kind === 'system'` (defense in depth — UI also disables grab handles on system rows).

---

## Community tab

### `CommunityViewProps`

| Field | Type | Notes |
|---|---|---|
| `members` | `MemberRow[]` | Shape matches member cards from spec 084 |
| `leads` | `MemberRow[]` | Separate list |
| `invitationPolicy` | `'open' \| 'invite-only' \| 'application'` | — |
| `membershipApplicationForm` | `ApplicationQuestion[]` | Question text + required flag |
| `communityGuidelines` | `string` | Markdown body |
| `saveBar` | `SaveBarState` | — |
| `onRemoveMember` | `(userId: string) => void` | Preceded by `ConfirmDeleteDialog` |
| `onPromoteToLead` | `(userId: string) => void` | — |
| `onInvitationPolicyChange` | `(next: CommunityViewProps['invitationPolicy']) => void` | — |
| `onApplicationFormChange` | `(questions: ApplicationQuestion[]) => void` | — |
| `onGuidelinesChange` | `(markdown: string) => void` | — |
| `onSave` | `() => void` | — |
| `onReset` | `() => void` | — |

`MemberRow` must be identical to the shape used by `src/crd/components/dialogs/PendingMembershipsDialog/*` (spec 084) — SC-008 requires zero visual divergence.

---

## Subspaces / Templates / Storage tabs

### `SubspacesViewProps`

| Field | Type | Notes |
|---|---|---|
| `subspaces` | `SubspaceTile[]` | name, avatar, memberCount, id |
| `onCreate` | `() => void` | Opens CRD create-subspace dialog |
| `onRename` | `(id: string, name: string) => void` | — |
| `onMove` | `(id: string, targetParentSpaceId: string) => void` | — |
| `onDelete` | `(id: string) => void` | Preceded by `ConfirmDeleteDialog` |

### `TemplatesViewProps`

| Field | Type | Notes |
|---|---|---|
| `templates` | `TemplateTile[]` | category, name, description, id |
| `onCreate` | `(category: TemplateCategory) => void` | — |
| `onEdit` | `(id: string) => void` | — |
| `onDelete` | `(id: string) => void` | Preceded by `ConfirmDeleteDialog` |

### `StorageViewProps`

| Field | Type | Notes |
|---|---|---|
| `documents` | `DocumentRow[]` | name, type, sizeBytes, uploaderName, uploadedAt, id |
| `onUpload` | `(file: File) => void` | — |
| `onDelete` | `(id: string) => void` | Preceded by `ConfirmDeleteDialog` |

These three tabs have no tab-level save bar because actions commit immediately — each action is individually scoped and confirmed via dialog when destructive.

---

## Settings tab

### `SettingsViewProps`

| Field | Type | Notes |
|---|---|---|
| `privacy` | `'public' \| 'private'` | — |
| `hostOrganizationName` | `string \| null` | Read-only display |
| `allowGuestVisitors` | `boolean` | — |
| `allowMemberCreatedSubspaces` | `boolean` | — |
| `showOnExplorer` | `boolean` | — |
| `saveBar` | `SaveBarState` | — |
| `onPrivacyChange` | `(next: SettingsViewProps['privacy']) => void` | — |
| `onToggle` | `(key: 'allowGuestVisitors' \| 'allowMemberCreatedSubspaces' \| 'showOnExplorer', next: boolean) => void` | — |
| `onSave` | `() => void` | — |
| `onReset` | `() => void` | — |

---

## Account tab

### `AccountViewProps`

| Field | Type | Notes |
|---|---|---|
| `plan` | `{ name: string; description: string }` | — |
| `entitlements` | `EntitlementRow[]` | feature, limit, usage |
| `contactAdminHref` | `string \| null` | Mailto / support link if available |

Read-only — no save bar, no onChange callbacks.

---

## Dirty-state model (controller only, not passed to CRD)

### `DirtyTabState`

```
type DirtyTabState = {
  activeTab: TabId;
  dirtyTab: TabId | null; // at most one at a time (Clarification Q2)
  pendingSwitch: TabId | null; // tab the user tried to switch to while dirty
};
```

Produced by `useDirtyTabGuard`. Consumed only by the page controller (`CrdSpaceSettingsPage`) — never exposed to CRD components.

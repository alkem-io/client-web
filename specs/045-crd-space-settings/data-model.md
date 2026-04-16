# Phase 1 Data Model: CRD Space Settings Page

**Feature**: 045-crd-space-settings
**Date**: 2026-04-15

No new backend entities are introduced. This document defines the **view-model shapes** produced by the per-tab data mappers and consumed by the CRD presentational components. All types below are authored by `src/main/crdPages/topLevelPages/spaceSettings/**` and passed as props to `src/crd/components/space/settings/**`. Every view prop interface MAY accept an optional `className?: string` (CRD convention) — omitted below for brevity.

---

## Shared view-model types

### `SpaceHeroProps`

Reused verbatim from spec 042 (`src/crd/components/space/SpaceHeader.tsx`).

**Note**: `SpaceHeroProps.bannerUrl` and `AboutFormValues.pageBannerUrl` reference the **same underlying asset** (the page banner at the top of the Space page). The About form owns the source of truth (`pageBannerUrl`); the hero's `bannerUrl` derives from live About form state when editing. `cardBannerUrl` is a distinct, smaller banner used only in space cards and the Preview.

### `TabId`

```
type TabId =
  | 'about'
  | 'layout'
  | 'community'
  | 'subspaces'
  | 'templates'
  | 'storage'
  | 'settings'
  | 'account';
```

Tab render order matches this declaration order. Any other URL segment normalizes to `'about'`.

### `SaveBarState`

```
type SaveBarState =
  | { kind: 'clean' }
  | { kind: 'dirty'; canSave: boolean }
  | { kind: 'saving' }
  | { kind: 'saveError'; message: string };
```

**Used only by the Layout tab.** About uses per-field autosave (FR-005a); every other tab commits per action.

---

## About tab

### `AboutFormValues` (full field set retained from current MUI + prototype additions)

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | Required |
| `tagline` | `string` | Retained from current MUI |
| `email` | `string` | Retained from current MUI |
| `pronouns` | `string` | Retained from current MUI |
| `country` | `string` | Retained from current MUI |
| `city` | `string` | Retained from current MUI |
| `avatarUrl` | `string \| null` | Retained from current MUI |
| `pageBannerUrl` | `string \| null` | Source of truth for the hero banner |
| `cardBannerUrl` | `string \| null` | Used in space cards / Preview |
| `visualsGallery` | `{ id: string; url: string; alt: string }[]` | Retained from current MUI |
| `tags` | `string[]` | Prototype addition |
| `references` | `{ id: string; title: string; url: string }[]` | Prototype addition |
| `what` | `string` (markdown) | Prototype addition — renamed from current MUI `description` |
| `why` | `string` (markdown) | Retained from current MUI |
| `who` | `string` (markdown) | Retained from current MUI |

### `SpaceCardPreview`

Plain mirror of CRD `SpaceCard` props (name, tagline, banner, avatar, tags, color) built from the live About form state, not from Apollo. Includes `color = pickColorFromId(space.id)` for the deterministic accent fallback.

### `FieldAutosaveState` + `AboutAutosaveStateMap`

```
type FieldAutosaveState =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; message: string };

type AboutFieldKey = keyof AboutFormValues;
type AboutAutosaveStateMap = Partial<Record<AboutFieldKey, FieldAutosaveState>>;
```

The view reads this map and renders per-field indicators next to each field label:
- `saving` → spinner.
- `saved` → grayed "Saved!" indicator.
- `error` → inline error message.

### `AboutViewProps`

`AboutFormValues` &

| Field | Type | Notes |
|---|---|---|
| `previewCard` | `SpaceCardPreview` | Derived live from form state |
| `autosaveState` | `AboutAutosaveStateMap` | Per-field indicator state |
| `onChange` | `(patch: Partial<AboutFormValues>) => void` | Any field edit; the hook debounces, then fires the autosave mutation |
| `onUploadPageBanner` | `(file: File) => void` | Upload delegate; autosave fires immediately on upload completion (no debounce) |
| `onUploadCardBanner` | `(file: File) => void` | Upload delegate; immediate autosave |
| `onUploadAvatar` | `(file: File) => void` | Upload delegate; immediate autosave |
| `onAddReference` | `() => void` | Append empty reference; autosave fires immediately after the empty row is committed |
| `onRemoveReference` | `(id: string) => void` | Remove reference; immediate autosave |
| `onUploadVisual` | `(file: File) => void` | Append visual; immediate autosave |
| `onRemoveVisual` | `(id: string) => void` | Remove visual; immediate autosave |

About has **no** `saveBar`, `onSave`, `onReset` — FR-005a prohibits them.

---

## Layout tab

### `LayoutColumnId`

```
type LayoutColumnId = 'home' | 'community' | 'subspaces' | 'knowledge';
```

### `LayoutCallout`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable across renders |
| `title` | `string` | **Read-only** on the Layout tab. Post title is edited from the post's own page. |
| `description` | `string` | **Read-only** on the Layout tab. Post description is edited from the post's own page. |
| `kind` | `'system' \| 'callout'` | Pinned vs movable |
| `icon` | `string` | Lucide key |
| `pendingRemoval` | `boolean` | Local-buffer-only flag. `true` when the callout has been marked via Remove from Tab but the buffer has not yet been saved. The row stays visible with pending-removal styling; NO mutation has fired (FR-008a). |

### `LayoutPoolColumn`

| Field | Type | Notes |
|---|---|---|
| `id` | `LayoutColumnId` | Pool ID |
| `title` | `string` | Inline-editable column title |
| `description` | `string` | Inline-editable column description |
| `callouts` | `LayoutCallout[]` | Ordered list |

### `LayoutViewProps`

| Field | Type | Notes |
|---|---|---|
| `columns` | `[LayoutPoolColumn, LayoutPoolColumn, LayoutPoolColumn, LayoutPoolColumn]` | Fixed order: home / community / subspaces / knowledge |
| `postDescriptionDisplay` | `'collapsed' \| 'expanded'` | `calloutDescriptionDisplayMode` value, part of the dirty buffer |
| `saveBar` | `SaveBarState` | — |
| `onReorder` | `(calloutId: string, target: { columnId: LayoutColumnId; index: number }) => void` | Buffered; fires on drag-drop and on keyboard Enter commit |
| `onRenameColumn` | `(columnId: LayoutColumnId, patch: { title?: string; description?: string }) => void` | Buffered — the only inline-edit on Layout |
| `onPostDescriptionDisplayChange` | `(next: 'collapsed' \| 'expanded') => void` | Buffered |
| `onSave` | `() => void` | Flushes entire buffer in `useTransition` block |
| `onReset` | `() => void` | Reverts buffer to last backend snapshot |
| `onMoveToColumn` | `(calloutId: string, target: LayoutColumnId) => void` | Visible kebab — Move to submenu; buffered |
| `onViewPost` | `(calloutId: string) => void` | Visible kebab — navigates (blocked by discard-confirm when buffer dirty) |
| `onRemoveFromTab` | `(calloutId: string) => void` | Visible kebab — sets `pendingRemoval: true` on the callout in the buffer; no mutation fires |
| `onUndoRemoveFromTab` | `(calloutId: string) => void` | Clears `pendingRemoval` in the buffer |
| `columnMenuActions` | `ColumnMenuActions` | **Per-column** (not per-callout). Rendered via a three-dot button in the top-right of each column header. Separate from the visible per-callout kebab. |

### `ColumnMenuActions`

```
type ColumnMenuActions = {
  onChangeActivePhase: (columnId: LayoutColumnId, phaseId: string) => void;
  onSetAsDefaultPostTemplate: (columnId: LayoutColumnId, templateId: string) => void;
  availablePhases: { id: string; label: string }[];
  availablePostTemplates: { id: string; label: string }[];
};
```

Consumed by `LayoutPoolColumn.tsx` (the column header's top-right three-dot button), NOT by `LayoutCalloutRow.tsx`. These are innovation-flow-step-level concerns.

**Validation**: `onReorder` is rejected in the mapper if the source `kind === 'system'` (defense in depth — UI also disables grab handles on system rows).

---

## Community tab

### `MemberRow` (shared row template across users / orgs / VC tables)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | — |
| `kind` | `'user' \| 'organization' \| 'virtualContributor'` | Discriminator for kebab labels + icons |
| `displayName` | `string` | — |
| `secondaryText` | `string \| null` | Email (users) / domain (orgs) / status (VCs) |
| `avatarUrl` | `string \| null` | — |
| `role` | `'host' \| 'admin' \| 'lead' \| 'member' \| 'virtualContributor'` | — |
| `status` | `'active' \| 'pending' \| 'invited' \| 'inactive'` | — |
| `joinedAt` | `string \| null` | ISO-8601 |

### `CommunityViewProps`

| Field | Type | Notes |
|---|---|---|
| `users` | `{ rows: MemberRow[]; totalCount: number; pageSize: 10; page: number }` | Main top table, paginated |
| `organizations` | `{ rows: MemberRow[]; totalCount: number; pageSize: 5; page: number; collapsed: boolean }` | Inside collapsible; 5 rows visible |
| `virtualContributors` | `{ rows: MemberRow[]; totalCount: number; pageSize: 5; page: number; collapsed: boolean }` | Inside collapsible; 5 rows visible |
| `invitationPolicy` | `'open' \| 'invite-only' \| 'application'` | Mirror of Settings value for display only |
| `applicationForm` | `ApplicationQuestion[]` | — |
| `communityGuidelines` | `string` (markdown) | — |
| `onUsersPageChange` | `(page: number) => void` | — |
| `onUsersSearch` | `(query: string) => void` | — |
| `onUsersFilter` | `(filter: { role?: MemberRow['role']; status?: MemberRow['status'] }) => void` | — |
| `onRowAction` | `(kind: 'user' \| 'organization' \| 'virtualContributor', id: string, action: 'viewProfile' \| 'changeRole' \| 'resend' \| 'revoke' \| 'approve' \| 'reject' \| 'remove' \| 'edit' \| 'toggleActive') => void` | Single entry point; the hook dispatches to the right mutation |
| `onInvite` | `() => void` | Opens existing invite flow |
| `onToggleOrganizations` | `() => void` | — |
| `onToggleVirtualContributors` | `() => void` | — |
| `onApplicationFormChange` | `(questions: ApplicationQuestion[]) => void` | — |
| `onGuidelinesChange` | `(markdown: string) => void` | — |
| `onSaveGuidelinesAsTemplate` | `() => void` | Fires existing `createTemplate` mutation |

### `ApplicationQuestion`

```
type ApplicationQuestion = { id: string; question: string; required: boolean };
```

No `SaveBarState` on Community — every action commits on confirm.

---

## Subspaces tab

### `SubspaceTile`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | — |
| `name` | `string` | — |
| `description` | `string` | — |
| `href` | `string` | Click target — existing subspace route |
| `avatarUrl` | `string \| null` | — |
| `bannerUrl` | `string \| null` | For card banner in grid view |
| `memberCount` | `number` | — |
| `lastActiveAt` | `string \| null` | ISO-8601 |
| `visibility` | `'active' \| 'archived'` | Mapped from `SpaceVisibility` |
| `isPinned` | `boolean` | Relevant in alphabetical sort mode |

### `SubspacesViewProps`

| Field | Type | Notes |
|---|---|---|
| `subspaces` | `SubspaceTile[]` | Filtered + searched server-agnostic list |
| `defaultTemplate` | `{ id: string; name: string; description: string; features: string[]; thumbnailUrl: string \| null }` | Current default subspace template |
| `sortMode` | `'alphabetical' \| 'manual'` | Retained toggle |
| `searchQuery` | `string` | Local state held in view |
| `filter` | `'all' \| 'active' \| 'archived'` | Client-side filter |
| `viewMode` | `'grid' \| 'list'` | — |
| `onSortModeChange` | `(next: 'alphabetical' \| 'manual') => void` | Retained |
| `onSearchChange` | `(next: string) => void` | — |
| `onFilterChange` | `(next: 'all' \| 'active' \| 'archived') => void` | — |
| `onViewModeChange` | `(next: 'grid' \| 'list') => void` | — |
| `onCreate` | `() => void` | Opens existing subspace-creation flow (may be wrapped in a CRD dialog) |
| `onChangeDefaultTemplate` | `() => void` | Opens template-pick dialog |
| `onKebabAction` | `(id: string, action: 'pinToggle' \| 'saveAsTemplate' \| 'delete') => void` | Only three actions — no Edit Details, no Archive, no View |

No `SaveBarState`. Every action commits on confirm.

---

## Templates tab

### `TemplateCategory`

```
type TemplateCategory =
  | 'space'
  | 'collaborationTool'
  | 'whiteboard'
  | 'post'
  | 'communityGuidelines';
```

### `TemplateTile`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | — |
| `category` | `TemplateCategory` | — |
| `name` | `string` | — |
| `description` | `string` | — |
| `thumbnailUrl` | `string \| null` | — |
| `isCustom` | `boolean` | Space-owned |

### `TemplatesViewProps`

| Field | Type | Notes |
|---|---|---|
| `categories` | `{ category: TemplateCategory; templates: TemplateTile[]; collapsed: boolean }[]` | Five entries in declared order |
| `searchQuery` | `string` | — |
| `onSearchChange` | `(q: string) => void` | — |
| `onToggleCategory` | `(c: TemplateCategory) => void` | — |
| `onCreateTemplate` | `(c: TemplateCategory) => void` | "Create a new template" |
| `onSelectFromLibrary` | `(c: TemplateCategory) => void` | "Select from the platform library" |
| `onTemplateAction` | `(id: string, action: 'preview' \| 'duplicate' \| 'edit' \| 'delete') => void` | Edit / Delete only on `isCustom === true` |

No `SaveBarState`.

---

## Storage tab

### `DocumentNode`

```
type DocumentNode =
  | { id: string; kind: 'folder'; name: string; children: DocumentNode[] }
  | {
      id: string;
      kind: 'file';
      name: string;
      sizeBytes: number;
      mimeType: string;
      uploaderName: string;
      uploaderHref: string;
      uploadedAt: string;
      openInNewTabHref: string;
    };
```

### `StorageViewProps`

| Field | Type | Notes |
|---|---|---|
| `tree` | `DocumentNode[]` | Hierarchical |
| `expandedFolderIds` | `Set<string>` | View-managed state |
| `onToggleFolder` | `(id: string) => void` | — |
| `onDelete` | `(id: string) => void` | Preceded by `ConfirmationDialog` |

No `SaveBarState`.

---

## Settings tab

### `SpacePrivacy`

```
type SpacePrivacy = 'public' | 'private';
type MembershipPolicy = 'open' | 'application' | 'invitation';
```

### `AllowedActionToggle`

Each toggle is `{ key: AllowedActionKey; enabled: boolean }` where `AllowedActionKey` covers every current MUI key:

```
type AllowedActionKey =
  | 'subspaceAdminInvitations'
  | 'memberCreatePosts'
  | 'videoCalls'
  | 'guestContributions'
  | 'memberCreateSubspaces'
  | 'subspaceEvents'
  | 'alkemioSupportAccess'
  | 'trustHostOrganization'
  | 'inheritMemberRightsFromParent';
```

### `ApplicableOrganization`

`{ id: string; name: string; domain: string; automaticAccess: boolean }`

### `SettingsViewProps`

| Field | Type | Notes |
|---|---|---|
| `privacy` | `SpacePrivacy` | — |
| `membershipPolicy` | `MembershipPolicy` | — |
| `applicableOrganizations` | `ApplicableOrganization[]` | — |
| `allowedActions` | `AllowedActionToggle[]` | Every current MUI toggle |
| `onPrivacyChange` | `(next: SpacePrivacy) => void` | Immediate commit |
| `onMembershipPolicyChange` | `(next: MembershipPolicy) => void` | Immediate commit |
| `onAddOrganization` | `() => void` | Opens existing org-picker |
| `onRemoveOrganization` | `(id: string) => void` | Immediate commit (with confirm) |
| `onToggleAutomaticAccess` | `(id: string, next: boolean) => void` | Immediate commit |
| `onToggleAllowedAction` | `(key: AllowedActionKey, next: boolean) => void` | Immediate commit |
| `onDeleteSpace` | `() => void` | Opens Danger Zone confirm dialog |

No `SaveBarState`.

---

## Account tab

### `EntitlementRow`

`{ feature: string; limit: number | 'unlimited'; usage: number }`

### `AccountViewProps`

| Field | Type | Notes |
|---|---|---|
| `url` | `string` | Read-only space URL |
| `plan` | `{ name: string; description: string; features: string[] }` | — |
| `entitlements` | `EntitlementRow[]` | Rendered as progress bars |
| `visibilityStatus` | `{ label: string; tone: 'active' \| 'inactive' }` | — |
| `host` | `{ displayName: string; avatarUrl: string \| null; organizationName: string }` | NO change-host CTA |
| `contactSupportHref` | `string` | — |
| `canDeleteSpace` | `boolean` | Gates the Delete button |
| `onCopyUrl` | `() => void` | — |
| `onChangeLicenseHref` | `string \| null` | Conditional external link |
| `onContactSupport` | `() => void` | — |
| `onDeleteSpace` | `() => void` | Opens confirm dialog |

Read-only content + 3 action buttons. No `SaveBarState`.

---

## Dirty-state controller (not a CRD prop)

### `DirtyTabState`

```
type DirtyTabState = {
  activeTab: TabId;
  dirtyTab: 'layout' | null; // Only Layout can be dirty — About autosaves per field
  pendingSwitch: TabId | null;
};
```

Produced by `useDirtyTabGuard`. Consumed only by `CrdSpaceSettingsPage`.

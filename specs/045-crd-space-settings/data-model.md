# Phase 1 Data Model: CRD Space Settings Page

**Feature**: 045-crd-space-settings
**Date**: 2026-04-15

No new backend entities are introduced. This document defines the **view-model shapes** produced by the per-tab data mappers and consumed by the CRD presentational components. All types below are authored by `src/main/crdPages/topLevelPages/spaceSettings/**` and passed as props to `src/crd/components/space/settings/**`. Every view prop interface MAY accept an optional `className?: string` (CRD convention) — omitted below for brevity.

---

## Shared view-model types

### `SettingsScopeLevel` (added 2026-04-27)

```
type SettingsScopeLevel = 'L0' | 'L1' | 'L2';
```

Plain string union — never the GraphQL `SpaceLevel` enum, per `src/crd/CLAUDE.md` Rule 4. Converted at the page boundary inside `useSettingsScope`. Threaded as a `level` prop into every CRD view that gates inner sections (Community, Settings, Subspaces, Layout).

### `SettingsScope` (added 2026-04-27)

Returned by `useSettingsScope()` in `src/main/crdPages/topLevelPages/spaceSettings/useSettingsScope.ts`. The single source of truth for the IDs every tab needs.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Space id at L0; subspace id at L1 / L2 |
| `level` | `SettingsScopeLevel` | Derived from `useUrlResolver().spaceLevel` |
| `url` | `string` | The space's profile URL |
| `roleSetId` | `string \| undefined` | From `useSubSpace` at L1 / L2; from `useSpace` at L0 |
| `communityId` | `string \| undefined` | Same |
| `guidelinesId` | `string \| undefined` | Same |
| `accountId` | `string \| undefined` | Populated only at L0 — Templates / Account tabs are hidden at L1 / L2 |
| `loading` | `boolean` | True while either context is still resolving |

### `SpaceSettingsTabId` (added 2026-04-27)

```
type SpaceSettingsTabId =
  | 'about' | 'layout' | 'community' | 'updates'
  | 'subspaces' | 'templates' | 'storage' | 'settings' | 'account';

const SPACE_SETTINGS_TAB_IDS: readonly SpaceSettingsTabId[] = [...] // declared in useSpaceSettingsTab.ts
```

The visible-tab list per level is derived by `getVisibleSettingsTabs(level)`:

- **L0**: all 9 tabs.
- **L1**: hide `templates`, `storage`, `account` (`HIDDEN_AT_L1`).
- **L2**: hide `templates`, `storage`, `account`, `subspaces` (`HIDDEN_AT_L2`).

`useSpaceSettingsTab(visibleTabs?)` clamps the active tab to a member of the visible list and redirects hidden URL hits to `'about'` via `replace: true`.

### `SpaceHeroProps`

Reused verbatim from spec 042 (`src/crd/components/space/SpaceHeader.tsx`).

**Note**: `SpaceHeroProps.bannerUrl` and `AboutFormValues.pageBanner.uri` reference the **same underlying asset** (the page banner at the top of the Space page). The About form owns the source of truth (`pageBanner`); the hero's `bannerUrl` derives from live About form state when editing. `cardBanner` is a distinct, smaller banner used only in space cards and the Preview.

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

### `AboutFormValues` (exact parity with current MUI — no phantom fields)

| Field | Type | Backend source |
|---|---|---|
| `name` | `string` | `profile.displayName` |
| `tagline` | `string` | `profile.tagline` |
| `country` | `string` (2-char ISO code) | `profile.location.country` |
| `city` | `string` | `profile.location.city` |
| `avatar` | `AboutVisual` | `profile.avatar` (Visual) |
| `pageBanner` | `AboutVisual` | `profile.banner` (Visual, 1536×256) |
| `cardBanner` | `AboutVisual` | `profile.cardBanner` (Visual, 416×256) |
| `tagsetId` | `string` | `profile.tagset[0].id` (required by `UpdateTagsetInput`) |
| `tags` | `string[]` | `profile.tagset[0].tags` |
| `profileId` | `string` | `profile.id` (required by `useCreateReferenceOnProfileMutation`) |
| `references` | `AboutReference[]` | `profile.references` — full CRUD (name + uri + description) |
| `what` | `string` (markdown) | `profile.description` — renamed "What" in CRD |
| `why` | `string` (markdown) | `about.why` |
| `who` | `string` (markdown) | `about.who` |

**Dropped** from any earlier draft: `email`, `pronouns`, `visualsGallery`. These are user-profile-only concepts and do not exist on Space profile in the current schema.

### `AboutVisual`

| Field | Type |
|---|---|
| `id` | `string` |
| `uri` | `string \| null` |
| `altText` | `string \| null` |

### `AboutReference`

Full CRUD parity with the current MUI About page — all three fields editable.

| Field | Type | Backend source |
|---|---|---|
| `id` | `string` | `reference.id` (needed for patch + delete mutations) |
| `title` | `string` | `reference.name` |
| `uri` | `string` | `reference.uri` |
| `description` | `string` | `reference.description` |

### `SpaceCardPreview`

Plain subset of CRD `SpaceCard` props (name, tagline, banner, avatar, tags, color, initials, href) built from the live About form state, not from Apollo. Includes `color = pickColorFromId(space.id)` for the deterministic accent fallback. **Only editable About fields are included** — the SpaceCard's non-editable surfaces (LEADS, member count, privacy badge from Settings, pinned badge) are omitted; SpaceCard gracefully hides any section whose props aren't provided.

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
/** The innovation-flow state's UUID (dynamic). Columns are not fixed. */
type LayoutColumnId = string;
```

### `LayoutCallout`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Callout UUID, stable across renders |
| `title` | `string` | **Read-only** on the Layout tab. Post title is edited from the post's own page. |
| `description` | `string` | **Read-only** on the Layout tab. Post description is edited from the post's own page. |
| `flowStateTagsetId` | `string` | Tagset UUID (the `classification.flowState` tagset). Needed to issue `updateCallout` moves. |

### `LayoutPoolColumn`

| Field | Type | Notes |
|---|---|---|
| `id` | `LayoutColumnId` | Innovation-flow state UUID |
| `title` | `string` | State `displayName` — inline-editable column title |
| `description` | `string` | State `description` — inline-editable column description |
| `isCurrentPhase` | `boolean` | `true` when this state is the innovation flow's currently-active state |
| `callouts` | `LayoutCallout[]` | Ordered list |

### `LayoutViewProps`

| Field | Type | Notes |
|---|---|---|
| `level` | `SettingsScopeLevel` | Added 2026-04-27. Gates Add Phase + Delete phase visibility (FR-038 / FR-039). |
| `columns` | `LayoutPoolColumn[]` | Dynamic count and order — driven by backend `innovationFlow.states` |
| `postDescriptionDisplay` | `'collapsed' \| 'expanded'` | `calloutDescriptionDisplayMode` value, part of the dirty buffer |
| `saveBar` | `SaveBarState` | — |
| `onReorder` | `(calloutId: string, target: { columnId: LayoutColumnId; index: number }) => void` | Buffered; fires on drag-drop and on keyboard Enter commit |
| `onRenameColumn` | `(columnId: LayoutColumnId, patch: { title?: string; description?: string }) => void` | Buffered |
| `onPostDescriptionDisplayChange` | `(next: 'collapsed' \| 'expanded') => void` | Buffered |
| `onSave` | `() => void` | Flushes entire buffer in `useTransition` block. If a column was renamed, also cascades the rename to every callout tagged with the old name. |
| `onReset` | `() => void` | Reverts buffer to last backend snapshot |
| `onMoveToColumn` | `(calloutId: string, target: LayoutColumnId) => void` | Visible kebab — Move to submenu; buffered |
| `onViewPost` | `(calloutId: string) => void` | Visible kebab — navigates (blocked by discard-confirm when buffer dirty) |
| `columnMenuActions` | `ColumnMenuActions` | **Per-column** menu (top-right three-dot). Fires immediately (not buffered). Includes optional `onDeletePhase` (Decision 21). |
| `onCreatePhase` | `((input: { displayName: string; description?: string }) => Promise<void>) \| undefined` | Added 2026-04-27. Passed only at L1 / L2. Page passes `level !== 'L0' ? layout.onCreateState : undefined`. Delegates to `useInnovationFlowSettings.actions.createState` for atomic create+sortOrder+refetch (Decision 21). |
| `minimumNumberOfStates` | `number` | Added 2026-04-27. Used to disable Delete phase when at minimum. |
| `maximumNumberOfStates` | `number` | Added 2026-04-27. Used to disable / hide Add Phase when at maximum. |
| `isStructureMutating` | `boolean` | Added 2026-04-27. True while a create / delete state mutation is in flight; disables Save Changes bar to prevent double-fire. |

### `ColumnMenuActions`

```
type ColumnMenuActions = {
  onChangeActivePhase: (columnId: LayoutColumnId) => void;
  onSetAsDefaultPostTemplate: (columnId: LayoutColumnId, templateId: string) => void;
  availablePostTemplates: { id: string; label: string }[];
  onDeletePhase?: (columnId: LayoutColumnId) => Promise<void>; // Added 2026-04-27 — L1/L2 only; visible only when columnCount > minimumNumberOfStates
};
```

`onChangeActivePhase(columnId)` marks `columnId` as the innovation flow's current state. `onSetAsDefaultPostTemplate(columnId, templateId)` sets (or clears) the default callout template for that state. `onDeletePhase(columnId)` (added 2026-04-27) deletes the state, gated by `level !== 'L0'` and `columns.length > minimumNumberOfStates`; delegates to `useInnovationFlowSettings.actions.deleteState` (Decision 21) — confirms via existing `ConfirmationDialog`. Consumed by `LayoutPoolColumn.tsx` (the column header's top-right three-dot button), NOT by `LayoutCalloutRow.tsx`.

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
| `isLead` | `boolean` | Added 2026-04-27. Drives the row's promote/demote dropdown disabled state per Decision 20. |
| `isAdmin` | `boolean` | Added 2026-04-27. When true, the lead-toggle dropdown items MUST be hidden (Admin role stays read-only). |
| `status` | `'active' \| 'pending' \| 'invited' \| 'inactive'` | — |
| `joinedAt` | `string \| null` | ISO-8601 |

### `LeadPolicy` (added 2026-04-27)

```
type LeadPolicy = {
  canAddLeadUser: boolean;
  canRemoveLeadUser: boolean;
  canAddLeadOrganization: boolean;
  canRemoveLeadOrganization: boolean;
};
```

Aggregate flags from `useCommunityPolicyChecker`. Users and organizations are gated independently — the policy returns separate add/remove flags per role-set entity type. The view composes the matching pair with each row's `isLead` to derive the per-row `disabled` state, e.g. for a user row: `(!canAddLeadUser && !row.isLead) || (!canRemoveLeadUser && row.isLead)` (Decision 20).

### `CommunityViewProps`

| Field | Type | Notes |
|---|---|---|
| `level` | `SettingsScopeLevel` | Added 2026-04-27. Gates promote/demote-Lead dropdown items (visible only when `level !== 'L0'`); hides VC block + "Save as guidelines template" at non-L0 (FR-036). |
| `leadPolicy` | `LeadPolicy` | Added 2026-04-27. Aggregate flags driving the lead-toggle disabled state (Decision 20). |
| `onUserLeadChange` | `(userId: string, isLead: boolean) => void` | Added 2026-04-27. Delegates to `useCommunityAdmin().onUserLeadChange`. Immediate (no buffer). |
| `onOrgLeadChange` | `(orgId: string, isLead: boolean) => void` | Added 2026-04-27. Delegates to `useCommunityAdmin().onOrganizationLeadChange`. Immediate. |
| `users` | `{ rows: MemberRow[]; totalCount: number; pageSize: 10; page: number }` | Main top table, paginated |
| `organizations` | `{ rows: MemberRow[]; totalCount: number; pageSize: 5; page: number; collapsed: boolean }` | Inside collapsible; 5 rows visible |
| `virtualContributors` | `{ rows: MemberRow[]; totalCount: number; pageSize: 5; page: number; collapsed: boolean }` | Inside collapsible; 5 rows visible. Card hidden when `level !== 'L0'`. |
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
| `onChangeDefaultTemplate` | `(() => void) \| undefined` | Updated 2026-04-27. **Optional** — passed only at L0. When `undefined`, the entire "Default Subspace Template" card MUST NOT render (template management is L0-only per FR-036). |
| `canSaveAsTemplate` | `boolean` | Added 2026-04-27. The page wires `subspacesTab.canSaveAsTemplate && level === 'L0'` so the kebab "Save as Template" entry is hidden at L1. |
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
  | 'subspaceAdminInvitations'        // Visible at L0 + L1 (hidden at L2 per FR-036)
  | 'memberCreatePosts'
  | 'videoCalls'
  | 'guestContributions'
  | 'memberCreateSubspaces'           // Visible at L0 + L1 (hidden at L2)
  | 'subspaceEvents'                  // Visible at L0 + L1 (hidden at L2)
  | 'alkemioSupportAccess'
  | 'trustHostOrganization'
  | 'inheritMemberRightsFromParent'   // Renamed `inheritMembershipRights` in implementation; visible at L1 + L2 only (hidden at L0 per FR-036)
  | 'inheritMembershipRights';        // Added 2026-04-27 — implementation key for FR-036; alias of inheritMemberRightsFromParent
```

**Level-aware filtering** (added 2026-04-27): `SpaceSettingsSettingsView` accepts a `level: SettingsScopeLevel` prop and filters its rendered toggles via three `Set<AllowedActionKey>` constants — `ACTIONS_VISIBLE_AT_L0`, `ACTIONS_VISIBLE_AT_L1`, `ACTIONS_VISIBLE_AT_L2`. The page does NOT filter the `allowedActions` payload — the view does the filtering — so the data hook stays level-agnostic.

### `ApplicableOrganization`

`{ id: string; name: string; domain: string; automaticAccess: boolean }`

### `SettingsViewProps`

| Field | Type | Notes |
|---|---|---|
| `level` | `SettingsScopeLevel` | Added 2026-04-27. Drives the level-aware filtering of `allowedActions` (FR-036). |
| `privacy` | `SpacePrivacy` | — |
| `membershipPolicy` | `MembershipPolicy` | — |
| `applicableOrganizations` | `ApplicableOrganization[]` | — |
| `allowedActions` | `AllowedActionToggle[]` | Every current MUI toggle. The view filters by `level` before rendering. |
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

---

## Subspace breadcrumbs (added 2026-04-27)

`CrdSubspacePageLayout` calls `useSetBreadcrumbs` unconditionally before any early loading return so the trail is set on every render. The trail shape:

```ts
const baseTrail =
  data.parentSpaceName && data.subspaceName
    ? [
        ...(includeL0Crumb ? [{ label: data.levelZeroSpaceName, href: data.levelZeroSpaceUrl, icon: Layers }] : []),
        { label: data.parentSpaceName, href: data.parentSpaceUrl, icon: Layers },
        {
          label: data.subspaceName,
          ...(isOnSettings ? { href: data.subspaceUrl, icon: Layers } : {}),
        },
      ]
    : [];
const settingsTrail = isOnSettings
  ? [
      { label: t('tabs.settings'), href: `${data.subspaceUrl}/settings` },
      { label: t(`tabs.${activeSettingsTab}`) },
    ]
  : [];
useSetBreadcrumbs(baseTrail.length > 0 ? [...baseTrail, ...settingsTrail] : []);
```

- The L0 hop is included only when `levelZeroSpaceId !== parentSpaceId` (true at L2; false at L1 because L1's parent IS the L0 space).
- The subspace hop becomes a link only when `isOnSettings` is true; otherwise it is a leaf (matches the existing non-settings behaviour).
- The active-tab hop reuses the existing `crd-spaceSettings:tabs.<id>` translation keys from the tab strip — no new i18n keys.

The `BreadcrumbsProvider` is mounted by `CrdLayoutWrapper` and wraps the entire route tree; `CrdSubspacePageLayout` consumes it via `useSetBreadcrumbs` from `@/main/ui/breadcrumbs/BreadcrumbsContext`.

# Phase 1 Data Model: CRD (Sub)Space Settings Parity

This is a frontend parity feature; the "data model" is the set of **CRD prop-type shapes**, **mapper outputs**, and **GraphQL field selections** that change. No backend entities change. CRD prop types are plain TypeScript (never generated GraphQL types) per `src/crd/CLAUDE.md`.

---

## 1. Subspaces view (US4)

### `SpaceSettingsSubspacesView` props — additions
File: `src/crd/components/space/settings/SpaceSettingsSubspacesView.tsx`

| Field | Type | Notes |
|---|---|---|
| `sortMode` | `'alphabetical' \| 'manual'` | New. Drives the selector + drag-enabled logic. |
| `onSortModeChange` | `(mode: 'alphabetical' \| 'manual') => void` | New. Consumer persists via `updateSpaceSettings`. |
| `onReorder` | `(orderedSubspaceIds: string[]) => void` | New. Consumer persists via `updateSubspacesSortOrder`. |

`SubspaceTile` (existing, unchanged) already carries `isPinned: boolean`, used to decide drag-enabled rows in Alphabetical mode.

**Drag-enabled rule** (mirrors MUI):
- `sortMode === 'manual'` → every tile draggable.
- `sortMode === 'alphabetical'` → only tiles where `isPinned === true` are draggable; unpinned stay alphabetical.

### Hook / mapper
- `useSubspacesTabData.ts`: expose `sortMode` (map `settings.sortMode` via existing `mapSortMode`) and new `onSortModeChange` (calls `useUpdateSpaceSettingsMutation`). `onReorder` + `useUpdateSubspacesSortOrderMutation` already exist — wire to the page.
- `subspacesMapper.ts`: existing `mapSortMode` / `mapSortModeToBackend` become used; no new fields on `SubspaceTile`.

---

## 2. Layout view — active phase (US3) & description (US5)

### `LayoutPoolColumn` (CRD prop type) — unchanged shape
File: `src/crd/components/space/settings/SpaceSettingsLayoutView.types.ts`

```ts
type LayoutPoolColumn = {
  id: LayoutColumnId;
  title: string;
  description: string;     // markdown/HTML string — now rendered via InlineMarkdown
  isCurrentPhase: boolean;  // ALREADY present & set; now also drives the visible indicator
  callouts: LayoutCallout[];
};
```
No type change. US3 consumes the existing `isCurrentPhase` for a visible indicator; US5 changes how `description` is *rendered* (raw `<p>` → `<InlineMarkdown>` inside `<div>` keeping `line-clamp-3`).

---

## 3. Layout view — View post (US6)

### `LayoutCallout` (CRD prop type) — addition
File: `src/crd/components/space/settings/SpaceSettingsLayoutView.types.ts`

| Field | Type | Notes |
|---|---|---|
| `profileUrl` | `string` | New. The callout's canonical `profile.url`. Empty/absent → "View post" not offered as an actionable item (FR-010). |

### Mapper
File: `src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.ts` — `calloutToLayoutCallout` sets `profileUrl: rawCallout.framing.profile.url`.

---

## 4. Member invite (US1) — connector parameterization

### `InviteMembersDialogConnector` props — additions (all optional)
File: `src/main/crdPages/space/dialogs/InviteMembersDialogConnector.tsx`

| Field | Type | Notes |
|---|---|---|
| `roleSetId` | `string \| undefined` | Override; falls back to `useUrlResolver()` when absent. |
| `spaceId` | `string \| undefined` | Override; falls back to `useUrlResolver()`. |
| `spaceName` | `string \| undefined` | Override for the welcome-message default + dialog title. |

The CRD `InviteMembersDialog` and its prop type (`selectedContributors`, `searchResults`, `welcomeMessage`, `extraRoles: ('Member'|'Lead'|'Admin')[]`, `results`, etc.) are unchanged and reused.

---

## 5. Virtual Contributor invite (US2) — new CRD prop type

### `VirtualContributorInviteDialog` props (NEW, plain TS)
File: `src/crd/components/community/VirtualContributorInviteDialog.tsx`

```ts
type VcInviteItem = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  tagline?: string;
  color: string;          // pickColorFromId fallback (mapper-supplied)
};

type VirtualContributorInviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  accountVcs: VcInviteItem[];     // "On account" — direct add
  libraryVcs: VcInviteItem[];     // "In library" — invite with message
  onAddAccountVc: (id: string) => void;          // no message
  onInviteLibraryVc: (id: string, welcomeMessage: string) => void;  // message required
  loading?: boolean;
  inviting?: boolean;
  labels: VcInviteLabels;         // all strings via props/crd-* (no hardcoded text)
  className?: string;
};
```

### Connector (NEW)
File: `src/main/crdPages/topLevelPages/spaceSettings/community/VirtualContributorInviteConnector.tsx` — maps available-VC queries (account + library) to `VcInviteItem[]` (applying `pickColorFromId`), and wires `onAddAccountVc` → `virtualContributorAdmin.onAdd`, `onInviteLibraryVc` → `virtualContributorAdmin.inviteContributors({ welcomeMessage, invitedContributorIds:[id], invitedUserEmails:[] })`.

---

## 6. GraphQL field selection change (only one)

| Fragment | File | Change |
|---|---|---|
| `InnovationFlowCollaboration` | `src/domain/collaboration/InnovationFlow/graphql/InnovationFlowCollaboration.fragment.graphql` | Add `url` under `callouts.framing.profile`. Requires `pnpm codegen`; commit regenerated `apollo-hooks.ts` / `graphql-schema.ts`. |

All mutations/queries used (`updateSubspacesSortOrder`, `updateSubspacePinned`, `updateSpaceSettings`, `updateInnovationFlowCurrentState`, `inviteForEntryRoleOnRoleSet`, available-VC queries) already exist and are unchanged — see `contracts/graphql-operations.md`.

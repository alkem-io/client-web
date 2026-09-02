# Phase 1 Data Model — CRD Innovation Hub

**Feature**: 102-crd-innovation-hub
**Date**: 2026-05-28

This document captures the data shapes that flow through the new feature. It separates **GraphQL types** (existing, on the wire) from **CRD prop types** (new, plain TypeScript, what the CRD components consume). The mappers in `src/main/crdPages/innovationHub/dataMappers/` are the only place these two worlds meet.

---

## Existing GraphQL surface (unchanged — no schema work)

All operations and fragments listed here already exist in `src/core/apollo/generated/apollo-hooks.ts`. They are reused verbatim.

### Queries

| Operation | Variables | Returns | Used by |
|---|---|---|---|
| `InnovationHub($subdomain: String)` | `subdomain` (optional — server reads from host header if omitted) | `Platform.innovationHub: InnovationHubHomeInnovationHub` | Home page on a hub subdomain (via `useInnovationHub()`) |
| `InnovationHubById($id: UUID!)` | `id` resolved from the `/hub/<slug>` URL via `useUrlResolver()` | `Platform.innovationHub: InnovationHubHomeInnovationHub` | Home page on the `/hub/<slug>` path |
| `InnovationHubSettings($innovationHubId: UUID!)` | hub id from `useUrlResolver()` | `Platform.innovationHub: InnovationHubSettings` | Settings page (About + Spaces tabs) |

### Mutations

| Operation | Input subset used in this feature | Notes |
|---|---|---|
| `UpdateInnovationHub` → `useUpdateInnovationHubMutation` | `{ ID, profileData: { displayName?, description?, tagline?, tagsets? } }` for profile fields; `{ ID, spaceListFilter }` for spaces tab; `{ ID, subdomain? }` for subdomain change | Partial updates — only the changed fields appear in `hubData` per call. Mutation accepts the same input shape it does today. |
| `UploadVisual` → `useUploadVisualMutation` | `{ file: File, uploadData: { visualID: <BANNER_WIDE visual id> } }` | Banner upload. Triggers Apollo cache update via mutation result; the `BANNER_WIDE` visual's `uri` updates in place. |

### Fragments (existing — reused)

- `InnovationHubHomeInnovationHub` — home-page data (id, nameID, profile{displayName,tagline,description,banner}, authorization.myPrivileges)
- `InnovationHubSettings` — settings data (id, subdomain, profile{InnovationHubProfile}, spaceListFilter[InnovationHubSpace], spaceVisibilityFilter)
- `InnovationHubProfile` — id, displayName, description, tagline, tagset, visual(BANNER_WIDE), url
- `InnovationHubSpace` — id, visibility, about{SpaceAboutMinimalUrl, provider{id,profile{id,displayName}}}

---

## CRD prop types (NEW — defined alongside CRD components)

These plain TypeScript types are owned by `src/crd/components/innovationHub/`. CRD presentational components import nothing else. GraphQL generated types **never** appear here.

### Home page

```typescript
// src/crd/components/innovationHub/InnovationHubHome.tsx — co-located type
export type InnovationHubHomeData = {
  /** Hub display name (header). */
  name: string;
  /** Italic tagline shown under the name. */
  tagline: string;
  /** Markdown-rendered description body. May contain HTML tags allowed by the markdown renderer. */
  description: string;
  /** Optional banner image URI. If absent, render the deterministic gradient via `bannerColor`. */
  bannerImageUrl?: string;
  /** Deterministic accent colour derived from the hub id; used for the banner-fallback gradient. */
  bannerColor: string;
  /** Alt text for the banner image (i18n'd in the integration layer). */
  bannerAlt: string;
  /** When set, render the settings gear icon linked to this URL. When undefined, hide the icon. */
  settingsUrl?: string;
  /** Curated spaces in display order. Reuses the existing CRD SpaceCardData type. */
  spaces: SpaceCardData[];
  /**
   * URL of the platform-wide Spaces explorer on the canonical platform host
   * (e.g. `//alkem.io/spaces`). Used by the "Browse all Spaces on Alkemio" CTA.
   */
  allSpacesUrl: string;
};
```

### Settings shell

```typescript
// src/crd/components/innovationHub/InnovationHubSettingsShell.tsx — co-located type
export type HubSettingsHeaderData = {
  name: string;
  tagline: string;
  /** When present, render the cropped image; otherwise fall back to gradient + initials. */
  bannerImageUrl?: string;
  /** Deterministic colour from `pickColorFromId(hub.id)`. */
  thumbnailColor: string;
  /** Pre-computed initials for the avatar fallback. */
  initials: string;
  /** Public hub home URL — the "view hub" icon button links here. */
  viewHubUrl: string;
};

export type HubSettingsTabKey = 'about' | 'spaces';

export type InnovationHubSettingsShellProps = {
  header: HubSettingsHeaderData;
  activeTab: HubSettingsTabKey;
  /** Pre-built href for each tab — consumer decides URL shape via urlBuilders. */
  tabHrefs: Record<HubSettingsTabKey, string>;
  /** Rendered content for the active tab — composed by the integration page. */
  children: React.ReactNode;
};
```

### About tab

```typescript
// src/crd/components/innovationHub/InnovationHubAboutTab.tsx — co-located types
export type HubAboutSectionKey =
  | 'subdomain'
  | 'name'
  | 'tagline'
  | 'description'
  | 'tags'
  | 'banner';

export type HubAboutSectionSaveStatus = 'idle' | 'saving' | 'saved';

export type HubAboutFormValues = {
  subdomain: string;
  name: string;
  tagline: string;
  description: string;       // markdown string
  tags: string[];
  bannerImageUrl?: string;   // current banner URI from the resolved hub
};

export type InnovationHubAboutTabProps = {
  /** Current editable values (local state in the integration hook). */
  values: HubAboutFormValues;
  /** Dirty flag per section — drives the visibility of inline Save. */
  dirty: Partial<Record<HubAboutSectionKey, boolean>>;
  /** Per-section save status — drives the inline indicator. */
  saveStatus: Partial<Record<HubAboutSectionKey, HubAboutSectionSaveStatus>>;
  /** Validation errors keyed by section — surfaced inline on the offending field. */
  errors: Partial<Record<HubAboutSectionKey, string>>;
  /** Patch any subset of editable values (called from inputs). */
  onChange: (patch: Partial<HubAboutFormValues>) => void;
  /** Commit one section's pending changes. */
  onSaveSection: (key: HubAboutSectionKey) => void;
  /** Upload a new banner file. The integration layer handles the upload mutation. */
  onBannerFileSelected: (file: File) => void;
  /** Whether the banner upload is currently in flight. */
  bannerUploading: boolean;
};
```

### Spaces tab

```typescript
// src/crd/components/innovationHub/InnovationHubSpacesTab.tsx — co-located types
export type SpaceVisibilityVariant = 'active' | 'demo' | 'archived' | 'unknown';

export type HubSpacesTableRow = {
  /** Space id (used as dnd-kit sortable id). */
  id: string;
  /** Space display name. */
  name: string;
  /** Visibility variant — drives the badge styling. */
  visibility: SpaceVisibilityVariant;
  /** Display string for the visibility column (already localised). */
  visibilityLabel: string;
  /** Host account display name. */
  hostAccount: string;
};

export type InnovationHubSpacesTabProps = {
  rows: HubSpacesTableRow[];
  /** True while any add/remove/reorder mutation is in flight (disables the table). */
  busy: boolean;
  onReorder: (orderedIds: string[]) => void;
  onAddClick: () => void;
  /** Removal request — opens the ConfirmationDialog in the integration layer. */
  onRemoveRequest: (row: HubSpacesTableRow) => void;
};
```

---

## Mapper contracts

Each mapper is a pure function: GraphQL fragment → CRD prop type. Pure → trivially unit-testable.

### `mapInnovationHubToHomeData`

```text
Input:  InnovationHubHomeInnovationHubFragment + DashboardSpacesQuery + currentUser auth state + canonicalDomain (string)
Output: InnovationHubHomeData

Logic:
- name        := profile.displayName
- tagline     := profile.tagline ?? ''
- description := profile.description ?? ''
- bannerImageUrl := profile.banner?.uri || undefined
- bannerColor    := pickColorFromId(hub.id)
- bannerAlt   := profile.banner?.alternativeText ?? profile.displayName
- settingsUrl := authorization.myPrivileges.includes(Update)
                   ? buildSettingsUrl(`/hub/${nameID}`)
                   : undefined
- spaces      := mapSpacesToSpaceCardData(dashboardSpaces, authenticated)  (existing helper from explore-spaces mapper)
- allSpacesUrl := `//${canonicalDomain}/spaces`     // canonical platform host
```

### `mapInnovationHubToSettingsHeader`

```text
Input:  InnovationHubSettings fragment (the hub)
Output: HubSettingsHeaderData

Logic:
- name           := profile.displayName
- tagline        := profile.tagline ?? ''
- bannerImageUrl := profile.visual?.uri || undefined     // BANNER_WIDE
- thumbnailColor := pickColorFromId(hub.id)
- initials       := computeInitials(profile.displayName) // shared helper
- viewHubUrl     := buildInnovationHubUrl(hub.subdomain) // existing builder
```

### `mapInnovationHubToAboutValues`

```text
Input:  InnovationHubSettings fragment
Output: HubAboutFormValues

Logic:
- subdomain      := hub.subdomain
- name           := profile.displayName
- tagline        := profile.tagline ?? ''
- description    := profile.description ?? ''
- tags           := profile.tagset?.tags ?? []
- bannerImageUrl := profile.visual?.uri || undefined
```

### `mapInnovationHubSpaceToTableRow`

```text
Input:  InnovationHubSpaceFragment, i18n t(...)
Output: HubSpacesTableRow

Logic:
- id              := space.id
- name            := space.about.profile.displayName
- visibility      := normalizeVisibility(space.visibility)
                       (SpaceVisibility.Active → 'active'
                        SpaceVisibility.Demo   → 'demo'
                        SpaceVisibility.Archived → 'archived'
                        else                   → 'unknown')
- visibilityLabel := t(`settings.spaces.visibility.${visibility}`)
- hostAccount     := space.about.provider?.profile?.displayName ?? '—'
```

---

## State transitions

### About tab — per-section save state machine

```text
       onChange (any input)
            │
            ▼
   ┌────────────────────┐
   │ dirty[key] = true  │
   │ status[key] = idle │
   └────────────────────┘
            │
            │ user clicks Save (or onSaveSection(key) called)
            ▼
   ┌────────────────────────┐
   │ status[key] = 'saving' │
   │ mutation in flight     │
   └────────────────────────┘
            │
            │ mutation resolves
            ▼
        ┌───────┴────────────┐
        │ success            │ failure
        ▼                    ▼
┌─────────────────┐   ┌────────────────────────┐
│ status = 'saved'│   │ status = 'idle'        │
│ flash 1.8s      │   │ errors[key] = message  │
│ then → 'idle'   │   │ dirty[key] stays true  │
└─────────────────┘   └────────────────────────┘
```

`useTransition` wraps the status transitions so they are scheduled as non-urgent.

### Spaces tab — auto-save on action

```text
  user action (add / remove / reorder)
            │
            ▼
   ┌────────────────────────────┐
   │ optimistic update to rows  │
   │ busy = true                │
   └────────────────────────────┘
            │
            │ updateInnovationHub mutation
            ▼
        ┌───┴────────────┐
        │ success        │ failure
        ▼                ▼
  ┌────────────┐   ┌────────────────────────┐
  │ refetch    │   │ rollback optimistic    │
  │ busy=false │   │ surface error toast    │
  │ toast OK   │   │ busy=false             │
  └────────────┘   └────────────────────────┘
```

### Privilege guard — settings page boot

```text
  page mount → useInnovationHubSettingsQuery resolves
            │
            ▼
   ┌────────────────────────────────────┐
   │ authorization?.myPrivileges        │
   │   .includes(Update) ?              │
   └────────────────────────────────────┘
            │
        ┌───┴────────────┐
        │ yes            │ no
        ▼                ▼
  ┌─────────────┐   ┌──────────────────────────┐
  │ render shell│   │ <Navigate                │
  │             │   │   to={profile.url}       │
  │             │   │   replace />             │
  └─────────────┘   └──────────────────────────┘
```

---

## Entities (recap from spec, with field-level mapping)

### Innovation Hub

- `id: UUID` — identity
- `subdomain: string` — unique key for subdomain dispatch
- `profile: { displayName, tagline?, description?, tagset, visual(BANNER_WIDE), url }`
- `spaceListFilter: InnovationHubSpace[]` — curated, ordered selection
- `spaceVisibilityFilter` — preserved as-is, out of scope for this spec
- `authorization.myPrivileges: AuthorizationPrivilege[]` — drives `settingsUrl` on home, drives the guard on settings

### Hub-selected Space

- `id: UUID`
- `visibility: SpaceVisibility`
- `about: { profile, provider }`

### Design Version preference (unchanged)

- `localStorage('alkemio-design-version'): '1' | '2'` (default: `'2'`)
- `useCrdEnabled() → boolean` — `true` unless explicitly `'1'`

---

## What is intentionally NOT in this data model

- No new GraphQL types or fragments — all existing.
- No new domain hooks — existing `useUrlResolver`, `useResolveSpaceUrl`, `useInnovationHub` reused as-is.
- No new server-side persistence — every write goes through `useUpdateInnovationHubMutation` or `useUploadVisualMutation`.
- No `spaceVisibilityFilter` editing — out of scope.
- No additional settings tabs (Settings, Account from the prototype) — explicitly out of scope per the spec.

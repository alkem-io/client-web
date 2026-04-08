# Data Model: Search Dialog CRD Migration

**Date**: 2026-04-08 | **Plan**: [plan.md](./plan.md)

## Overview

This feature is **frontend-only** — no new data models are created. All entities already exist in the backend GraphQL schema. This document maps the entities, their relevant fields, and the data transformations needed to bridge existing GraphQL search results to CRD component props.

## CRD Component Prop Types

### SearchOverlayProps

The top-level overlay component receives all state and callbacks from the integration layer.

| Field | Type | Source |
|-------|------|--------|
| `isOpen` | `boolean` | SearchContext |
| `onClose` | `() => void` | SearchContext.closeSearch |
| `loading` | `boolean` | useSearchViewState |
| `searchTags` | `string[]` | useSearchTerms / local state |
| `onTagAdd` | `(term: string) => void` | Integration layer |
| `onTagRemove` | `(index: number) => void` | Integration layer |
| `categories` | `SearchCategoryData[]` | Data mapper |
| `scope` | `SearchScopeData \| null` | Integration layer |
| `onScopeChange` | `(scope: 'all' \| string) => void` | Integration layer |
| `disclaimer` | `string` | i18n |

### SearchCategoryData

One per result category displayed in the overlay.

| Field | Type | Source |
|-------|------|--------|
| `id` | `string` | Category identifier (e.g., 'spaces', 'posts') |
| `label` | `string` | i18n translated label |
| `icon` | `LucideIcon` | Category icon component |
| `count` | `number` | Total filtered results count |
| `items` | `SearchResultCardData[]` | Mapped result items |
| `visibleCount` | `number` | Currently visible items (for "Load more") |
| `hasMore` | `boolean` | Whether more items can be loaded |
| `onLoadMore` | `() => void` | Load more callback |
| `filterConfig` | `SearchFilterConfig \| undefined` | Filter options (undefined = no filter) |
| `activeFilter` | `string` | Currently active filter value |
| `onFilterChange` | `(value: string) => void` | Filter change callback |

### SearchFilterConfig

Filter options for a category section.

| Field | Type | Description |
|-------|------|-------------|
| `options` | `{ value: string; label: string }[]` | Available filter options |

### SearchScopeData

Scope information when inside a space.

| Field | Type | Description |
|-------|------|-------------|
| `currentSpaceName` | `string` | Display name of the current space |
| `activeScope` | `'all' \| string` | Currently active scope ('all' or space identifier) |

### SpaceCardData (existing)

Reused from `src/crd/components/space/SpaceCard.tsx`. No changes needed — the search data mapper transforms `SearchResultSpaceFragment` to the existing `SpaceCardData` type.

### PostResultCardData

| Field | Type | Source |
|-------|------|--------|
| `id` | `string` | SearchResult.id |
| `title` | `string` | Callout framing displayName or framing displayName |
| `snippet` | `string` | Description text (truncated) |
| `type` | `'post' \| 'whiteboard' \| 'memo'` | Mapped from SearchResultType |
| `bannerUrl` | `string \| undefined` | Banner visual URI |
| `author` | `{ name: string; avatarUrl?: string }` | Creator profile |
| `date` | `string` | Formatted date string |
| `spaceName` | `string` | Parent space displayName |
| `href` | `string` | Navigation URL |

### ResponseResultCardData

| Field | Type | Source |
|-------|------|--------|
| `id` | `string` | SearchResult.id |
| `title` | `string` | Contribution displayName |
| `snippet` | `string` | Description text (truncated) |
| `type` | `'post' \| 'whiteboard' \| 'memo'` | Mapped from SearchResultType |
| `author` | `{ name: string; avatarUrl?: string }` | Creator profile |
| `date` | `string` | Formatted date string |
| `parentPostTitle` | `string` | Parent callout framing displayName |
| `spaceName` | `string` | Parent space displayName |
| `href` | `string` | Navigation URL |

### UserResultCardData

| Field | Type | Source |
|-------|------|--------|
| `id` | `string` | SearchResult.id |
| `name` | `string` | User displayName |
| `avatarUrl` | `string \| undefined` | User avatar URI |
| `role` | `string \| undefined` | User tagline or primary role |
| `email` | `string \| undefined` | User email (if visible) |
| `href` | `string` | User profile URL |

### OrgResultCardData

| Field | Type | Source |
|-------|------|--------|
| `id` | `string` | SearchResult.id |
| `name` | `string` | Organization displayName |
| `logoUrl` | `string \| undefined` | Organization avatar/logo URI |
| `type` | `string` | Organization type label |
| `tagline` | `string \| undefined` | Organization tagline |
| `href` | `string` | Organization profile URL |

## Data Flow

```
GraphQL Search Query (existing)
    │
    ▼
useSearchViewState (existing hook — reused as-is)
    │
    ├── spaceResults      ──────────────────────► mapSpaceResults()      → SpaceCardData[]
    ├── calloutResults  ──┐
    │                     ├─ interlace ─────────► mapPostResults()       → PostResultCardData[]
    ├── framingResults  ──┘
    ├── contributionResults ────────────────────► mapResponseResults()   → ResponseResultCardData[]
    └── actorResults
        ├── USER type   ────────────────────────► mapUserResults()       → UserResultCardData[]
        └── ORGANIZATION type ──────────────────► mapOrgResults()        → OrgResultCardData[]
    │
    ▼
CrdSearchOverlay (integration component in src/main/search/)
    │
    ▼
SearchOverlay (CRD presentational component in src/crd/components/search/)
```

## Category Configuration

| UI Category | Backend Source | Result Types | Filter Options | Icon |
|-------------|---------------|-------------|----------------|------|
| Spaces | `spaceResults` | SPACE, SUBSPACE | All / Spaces only / Subspaces only | Globe |
| Posts | `calloutResults` + `framingResults` (interlaced) | CALLOUT, WHITEBOARD, MEMO | All / Whiteboards / Memos | FileText |
| Responses | `contributionResults` | POST, WHITEBOARD, MEMO | All / Posts / Whiteboards / Memos | MessageSquare |
| Users | `actorResults` (USER) | USER | — | Users |
| Organizations | `actorResults` (ORGANIZATION) | ORGANIZATION | — | Building2 |

## Pagination

Each category maintains its own pagination state (reusing existing `useSearchViewState` cursor management):

| State | Type | Description |
|-------|------|-------------|
| `visibleCount` | `number` | Currently displayed items (starts at 4) |
| `canLoadMore` | `boolean` | From existing hook: whether backend has more |
| `cursor` | `string \| undefined` | Backend pagination cursor |

"Load more" first reveals already-fetched but hidden items (client-side). When all fetched items are shown and the backend has more, it calls `fetchMore()` via the existing hook.

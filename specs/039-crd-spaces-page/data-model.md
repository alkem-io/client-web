# Data Model: CRD Spaces Page

**Branch**: `039-crd-spaces-page` | **Date**: 2026-03-26

## Entities

### SpaceCardData (CRD View Model)

The plain TypeScript type consumed by the CRD SpaceCard component. Lives in `src/crd/components/space/SpaceCard.tsx`.

| Field | Type | Required | Source |
| --- | --- | --- | --- |
| `id` | `string` | yes | `space.id` |
| `name` | `string` | yes | `space.about.profile.displayName` |
| `description` | `string` | yes | `space.about.profile.tagline ?? ''` |
| `bannerImageUrl` | `string \| undefined` | no | `space.about.profile.cardBanner?.uri` |
| `initials` | `string` | yes | Derived from `displayName` |
| `avatarColor` | `string` | yes | Deterministic hash of `space.id` → palette color |
| `isPrivate` | `boolean` | yes | `!space.about.isContentPublic` |
| `tags` | `string[]` | yes | `space.about.profile.tagset?.tags ?? []` |
| `leads` | `SpaceLead[]` | yes | Flattened from `leadUsers` + `leadOrganizations` |
| `href` | `string` | yes | `space.about.profile.url` |
| `matchedTerms` | `boolean` | no | `!!space.matchedTerms?.length` |
| `parent` | `SpaceCardParent \| undefined` | no | Present only for subspaces |

### SpaceCardParent

| Field | Type | Required | Source |
| --- | --- | --- | --- |
| `name` | `string` | yes | `parent.about.profile.displayName` |
| `href` | `string` | yes | `parent.about.profile.url` |
| `avatarUrl` | `string \| undefined` | no | `parent.about.profile.avatar?.uri` |
| `initials` | `string` | yes | Derived from parent `displayName` |
| `avatarColor` | `string` | yes | Deterministic hash of parent `id` |

### SpaceLead

| Field | Type | Required | Source |
| --- | --- | --- | --- |
| `name` | `string` | yes | `profile.displayName` |
| `avatarUrl` | `string` | yes | `profile.avatar?.uri ?? ''` |
| `type` | `'person' \| 'org'` | yes | Determined by source list (leadUsers vs leadOrganizations) |

## Relationships

```
TopLevelRoutes.tsx
  ├── [MUI routes] → TopLevelLayout (MUI header/nav/footer)
  │
  └── [CRD routes] → CrdLayoutWrapper (src/main/, smart container)
                      └── CrdLayout (src/crd/layouts/, presentational)
                          ├── Header (CRD, Tailwind)
                          ├── <main>
                          │   └── SpaceExplorerPage
                          │       ├── useSpaceExplorer()        → SpaceWithParent[]  (GraphQL, unchanged)
                          │       └── SpaceExplorerCrdView      → mapSpaceToCardData() → SpaceCardData[]
                          │                                     → CRD SpaceExplorer / SpaceCard
                          └── Footer (CRD, Tailwind)
```

The route-level split happens in `TopLevelRoutes.tsx`: CRD routes are wrapped in `CrdLayoutWrapper`, which renders the full CRD page shell. MUI routes continue using `TopLevelLayout`. The old MUI `SpaceExplorerView` is kept in the codebase but no longer imported.

## Derived Field Computation

### `initials` — from display name
```
"Green Energy Space" → "GE"   (first letter of first two words)
"Alkemio"            → "A"    (single word → single letter)
"Community Building"  → "CB"
```

### `avatarColor` — deterministic from ID
Pick from a fixed 10-color palette using a simple hash of the space ID. The same space always gets the same color. Colors are CSS hex values from the design tokens.

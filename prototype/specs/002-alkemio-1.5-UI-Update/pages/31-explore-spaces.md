# Page 31: Browse All Spaces (Explore)

> **Route**: `/spaces` or `/explore`  
> **Access**: All authenticated users  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/platform/pages/ExploreSpaces.tsx`

---

## Current Layout

Public/authenticated directory page listing all available spaces. Uses the SAME Space Card component as the Dashboard and Subspaces tab.

```
┌─────────────────────────────────────────────────────┐
│  Global Header                                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Explore Spaces                                      │
│  Discover spaces and join the conversation            │
│                                                      │
│  ┌───────────────────────────────────────────┐       │
│  │ 🔍 Search spaces...                        │       │
│  └───────────────────────────────────────────┘       │
│                                                      │
│  Showing 24 of 156 spaces                            │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Space    │ │ Space    │ │ Space    │ │Space   │ │
│  │ Banner   │ │ Banner   │ │ Banner   │ │Banner  │ │
│  │          │ │          │ │          │ │        │ │
│  │ [Avatar] │ │ [Avatar] │ │ [Avatar] │ │[Avatar]│ │
│  │ Name     │ │ Name     │ │ Name     │ │Name    │ │
│  │ Tagline  │ │ Tagline  │ │ Tagline  │ │Tagline │ │
│  │ 👤 12    │ │ 👤 34    │ │ 👤 8     │ │👤 56   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Space    │ │ Space    │ │ Space    │ │Space   │ │
│  │ Banner   │ │ Banner   │ │ Banner   │ │Banner  │ │
│  │          │ │          │ │          │ │        │ │
│  │ [Avatar] │ │ [Avatar] │ │ [Avatar] │ │[Avatar]│ │
│  │ Name     │ │ Name     │ │ Name     │ │Name    │ │
│  │ Tagline  │ │ Tagline  │ │ Tagline  │ │Tagline │ │
│  │ 👤 12    │ │ 👤 34    │ │ 👤 8     │ │👤 56   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                      │
│  [Load more spaces]                                  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Page Header**: Title + subtitle
- **Search Bar**: Full-width search/filter input
- **Results Count**: "Showing X of Y spaces"
- **Space Card Grid**: 4-column grid of Space Cards (SAME card as Dashboard and Subspaces Tab)
- **Space Card**: Banner image, avatar (overlapping), space name, tagline, member count
- **Load More**: Button-based pagination (not infinite scroll)

---

## Element Inventory

### Page Header
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Page title | `Typography` h1 | Heading with Tailwind | "Explore Spaces" |
| Subtitle | `Typography` body | Tailwind text-muted | Description |
| Search input | `TextField` with search icon | `Input` (shadcn) with Lucide search icon | Full-width |
| Results count | `Typography` caption | Tailwind text-muted | "Showing 24 of 156 spaces" |

### Space Card Grid
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Grid container | Custom grid | Tailwind `grid grid-cols-4 gap-4` | 4-col desktop, 2-col tablet, 1-col mobile |
| Space card | `ContributeCard` / `Paper` | `Card` (shadcn) with hover | **SAME card as Dashboard & Subspaces** |
| Banner image | `<img>` | `<img>` with aspect-ratio | Space cover image |
| Space avatar | MUI `Avatar` (overlapping) | `Avatar` (shadcn) with negative margin | Overlaps banner bottom |
| Space name | `Typography` h6 | `CardTitle` (shadcn) | Space name |
| Tagline | `Typography` body2 | `CardDescription` (shadcn) | Short tagline |
| Member count | `Typography` + icon | Tailwind text-muted + Lucide Users icon | "👤 12 members" |
| Card link | `<a>` / `Link` | `<a>` wrapping Card | Clickable → Space Home |

### Pagination
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Load more button | MUI `Button` | `Button` (shadcn) variant="outline" | "Load more spaces" |

---

## Prototype Status

✅ **BUILT** — `pages/BrowseSpacesPage.tsx` (1055 lines)

**Prototype structure:**
- Page header ("Explore Spaces" + subtitle)
- **Search & Filter Bar** — search Input with clear button, Sort Select (recent/alpha/members/active), Filter DropdownMenu with checkbox items for Privacy (Public/Private) and Type (Spaces/Subspaces)
- **Active filter chips** — removable Badge pills for each active filter
- **Results count** — "Showing X of Y spaces"
- **Card grid** — responsive CSS grid (`auto-fill minmax(280px)`) using SpaceCard component
- **SpaceCard** — banner image (16:9), privacy badge, stacked avatars for subspaces, name, description, lead avatars, tags, member count. Includes SpaceCardSkeleton for loading state.
- **Load More button** with simulated 600ms network delay
- **Empty state** — dashed border card with FolderOpen icon + "Clear filters" CTA
- 25 mock spaces (10 top-level, 15 subspaces)

**shadcn components used:** Button, Input, Badge, Select, DropdownMenu

---

## Pull-Back Notes

- [ ] **Page structure** — matches brief closely. Verify against screenshot (`explroe spaces.png`).
- [x] **Current platform may have this as a DIALOG, not a page** — screenshot `dashboard > explroe alll my spaces.png` suggests current "Explore all Spaces" is triggered from sidebar as a dialog (ExploreSpacesDialog). Prototype has BOTH: dialog and full page. Verify which is correct for 1:1 match.
- [ ] **SpaceCard component** — well-built, matches brief description (banner + avatar + name + description + lead avatars + tags + member count).
- [ ] **Search/filter/sort** — more advanced than brief described. May be an enhancement.
- [ ] **Filter DropdownMenu with checkboxes** — brief used simpler filter description.
- [ ] **Active filter chips** — nice UX addition, acceptable improvement.
- [ ] **Load More** — matches brief description.
- [ ] **SpaceCardSkeleton** — loading state, acceptable improvement.

---

## Allowed Improvements

- **Card** — shadcn Card with hover lift animation
- **Avatar** — shadcn Avatar with fallback initials
- **Input** — shadcn Input with integrated search icon
- **Responsive grid** — Tailwind responsive breakpoints (4→2→1 columns)

---

## Figma Make Instructions

```
You are recreating the Alkemio Browse All Spaces (Explore) page using shadcn/ui components.

LAYOUT (keep exactly):
- Full-page layout with global header
- Page title + subtitle
- Full-width search input
- Results count text ("Showing X of Y spaces")
- 4-column Space Card grid (responsive: 4-col desktop, 2-col tablet, 1-col mobile)
- "Load more spaces" button at bottom

SPACE CARD (SAME card used on Dashboard & Subspaces Tab):
- shadcn Card with hover lift
- Banner image (aspect-ratio)
- shadcn Avatar overlapping banner bottom edge (negative margin)
- CardTitle (space name)
- CardDescription (tagline)
- Member count with Users icon

COMPONENTS (swap to new):
- Search: shadcn Input with Lucide search icon
- Cards: shadcn Card + Avatar + CardTitle + CardDescription
- Load more: shadcn Button variant="outline"

Use the design system tokens from design-system-page.md.
```

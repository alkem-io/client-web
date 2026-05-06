# Page 4: Subspaces Tab

> **Route**: `/space/[space-slug]/subspaces`  
> **Access**: Space members  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/space/layout/tabbedLayout/Tabs/SpaceSubspaces/SpaceSubspacesPage.tsx`

---

## Current Layout

The Subspaces tab shows all child subspaces (challenges/workstreams) within this space.

```
┌──────────────────────────────────────────────────────────┐
│  Space Banner + Tab Bar (HOME | COMMUNITY | SUBSP* | KB) │
├──────────────────────────────────────────────────────────┤
│  Section Header: "Subspaces"                             │
│  ┌────────────────────────────────────────────────┐      │
│  │  Search / Filter bar                           │      │
│  └────────────────────────────────────────────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Subspace │ │ Subspace │ │ Subspace │ │ Subspace │    │
│  │ Card     │ │ Card     │ │ Card     │ │ Card     │    │
│  │          │ │          │ │          │ │          │    │
│  │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │    │
│  │ Name     │ │ Name     │ │ Name     │ │ Name     │    │
│  │ Desc     │ │ Desc     │ │ Desc     │ │ Desc     │    │
│  │ Members  │ │ Members  │ │ Members  │ │ Members  │    │
│  │ Leads    │ │ Leads    │ │ Leads    │ │ Leads    │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  [+ Create Subspace]           [Show more]               │
└──────────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Tab Bar**: SUBSPACES tab is active
- **Card Grid**: Responsive grid of subspace cards
- **Subspace Card**: Banner image, name, description, member count, lead avatars row
- **Create Subspace**: Button for facilitators
- **Filtering**: Optional filter/sort by status, role

---

## Element Inventory

### Subspace Card Grid
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Subspace card | `ContributeCard` / `Paper` | `Card` (shadcn) | Image + name + desc + leads |
| Card banner image | `<img>` | `<img>` with Tailwind | 16:9 aspect ratio thumbnail |
| Card title | `Typography` heading | Heading with Tailwind | Subspace name, linked |
| Card description | `Typography` body | Tailwind body text | 1-2 lines, truncated |
| Member count | `Typography` + icon | Tailwind text + Lucide icon | "42 members" |
| Lead avatars row | `AvatarGroup` / custom | Stacked `Avatar` (shadcn) | 3-5 small avatars + overflow |
| Privacy badge | `Chip` + `LockIcon` | `Badge` (shadcn) + Lock icon | Public / Private indicator |
| Card grid | MUI Grid / custom | Tailwind `grid grid-cols-3` | Responsive grid |

### Search & Filters
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Search input | `TextField` | `Input` (shadcn) | Search by subspace name |
| Status filter | `Select` | `Select` (shadcn) | Active / Archived |

### Actions
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Create button | `Button` / FAB | `Button` (shadcn) | Facilitator-only |
| "Show more" | `Button` | `Button` variant="outline" | Pagination |

---

## Prototype Status

✅ **BUILT** — `pages/SpaceSubspaces.tsx` + `components/space/SpaceSubspacesList.tsx`

**Prototype structure:**
- Same space shell
- `SpaceSubspacesList` — filter pills (All/Active/Archived), 3-column card grid with image banners
- Cards: image, status badge, lead avatars overlay, title, description, member count, last active, arrow indicator on hover
- 6 mock subspaces, empty state with folder icon

**shadcn components used:** Card, Badge, Avatar, Button, Separator, Input, DropdownMenu, Tooltip

---

## Pull-Back Notes

- [x] **Filter pills (All/Active/Archived) may need REMOVAL** — current platform's Subspaces tab (screenshot `space subspaces tab.png`) likely has no filter pills. Verify.
- [x] **Status badges (Active/Archived)** — current platform may not have these. Verify.
- [ ] **Card layout** — 3-column grid with image banners is close to current ContributeCard style. Verify card elements match.
- [ ] **Lead avatars overlay** — current uses lead avatar row on cards. Verify placement matches.
- [x] **Arrow hover indicator** — new design element, verify if current has this.

---

## Allowed Improvements

- **Better card images** — cleaner aspect ratio handling with Tailwind
- **Lead avatar stacking** — shadcn Avatar with overlap styling
- **Hover states** — shadow lift on card hover is smoother
- **Badge styling** — shadcn Badge for privacy indicator looks cleaner

---

## Figma Make Instructions

```
You are recreating the Alkemio Subspaces Tab using shadcn/ui components.

LAYOUT (keep exactly):
- Space banner + horizontal tab bar (SUBSPACES tab active)
- Search/filter bar below tabs
- Responsive card grid (3-4 per row desktop, 2 tablet, 1 mobile)

COMPONENTS (swap to new):
- Subspace cards: shadcn Card with image, name, description, member count, lead avatar row
- Card images: 16:9 aspect ratio thumbnails
- Lead avatars: shadcn Avatar (small, stacked/overlapping row, 3-5 max + overflow)
- Privacy indicator: shadcn Badge with Lock icon
- Search: shadcn Input
- Filter: shadcn Select
- Create button: shadcn Button (primary)

CONTENT (keep current):
- Subspace cards with banner image, name, description
- Member count and lead avatar row on each card
- Same card component used on Dashboard recent spaces and Browse All Spaces

IMPORTANT: The subspace card here is the SAME card component used on Page 31 (Browse All Spaces). Keep them visually identical.

Use the design system tokens from design-system-page.md.
```

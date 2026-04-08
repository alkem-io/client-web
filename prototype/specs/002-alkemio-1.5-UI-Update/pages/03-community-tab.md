# Page 3: Community Tab

> **Route**: `/space/[space-slug]/community`  
> **Access**: Space members  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/space/layout/tabbedLayout/Tabs/SpaceCommunity/SpaceCommunityPage.tsx`

---

## Current Layout

The Community tab shows the members of a space and their roles.

```
┌──────────────────────────────────────────────────────────┐
│  Space Banner + Tab Bar (HOME | COMMUNITY* | SUBSP | KB) │
├──────────────────────────────────────────────────────────┤
│  Section Header: "Members" / "Community"                 │
│  ┌────────────────────────────────────────────────┐      │
│  │  Filter / Search bar                           │      │
│  └────────────────────────────────────────────────┘      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │Member│ │Member│ │Member│ │Member│ │Member│           │
│  │Card  │ │Card  │ │Card  │ │Card  │ │Card  │           │
│  │      │ │      │ │      │ │      │ │      │           │
│  │Avatar│ │Avatar│ │Avatar│ │Avatar│ │Avatar│           │
│  │Name  │ │Name  │ │Name  │ │Name  │ │Name  │           │
│  │Role  │ │Role  │ │Role  │ │Role  │ │Role  │           │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
│                                                          │
│  [Invite members]     [Show more]                        │
└──────────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Tab Bar**: Same as Space Home — COMMUNITY tab is active
- **Member Grid**: Card-based grid of member cards (responsive)
- **Member Card**: Avatar, name, role badge (Contributor, Facilitator, etc.)
- **Search / Filter**: Search by name, filter by role
- **Invite**: Button for Facilitators to invite new members

---

## Element Inventory

### Member Grid
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Member card | Custom member card / `Paper` | `Card` (shadcn) | Avatar + name + role |
| Avatar | MUI `Avatar` | `Avatar` (shadcn) | Large, circular, photo or initials |
| Member name | `Typography` | Heading with Tailwind | Linked to profile |
| Role badge | `Chip` | `Badge` (shadcn) | Color-coded: Facilitator, Contributor |
| Card container | Grid / Flexbox | Tailwind `grid grid-cols-2 md:grid-cols-4` | Responsive grid |

### Search & Filters
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Search input | `TextField` | `Input` (shadcn) | Search by member name |
| Role filter | `Select` / Dropdown | `Select` (shadcn) | Filter by role |
| Sort control | `Select` | `Select` (shadcn) | Sort by activity, name |

### Actions
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Invite button | `Button` | `Button` (shadcn) | Facilitator-only |
| View profile link | Click avatar/name | Click card → navigate | Link to User Profile |
| "Show more" | `Button` | `Button` variant="outline" | Pagination |

---

## Prototype Status

✅ **BUILT** — `pages/SpaceCommunity.tsx` + `components/space/SpaceMembers.tsx`

**Prototype structure:**
- Same space shell (SpaceHeader + SpaceSidebar + SpaceNavigationTabs)
- `SpaceMembers` — search input + role filter pills (All/Host/Admin/Lead/Member), 3-column grid of member cards
- Member cards: Avatar, name (linked), role badge (color-coded), bio, join date, more menu (DropdownMenu)
- 29 mock members, empty state with "Clear filters" button

**shadcn components used:** Card, Avatar, Badge, Button, Input, DropdownMenu, Separator, Tooltip

---

## Pull-Back Notes

- [x] **SpaceSidebar** — same removal needed as Space Home.
- [ ] **Member card layout** — 3-column grid matches current community tab concept. Verify card design against screenshot (`community tab.jpg`).
- [ ] **Role filter pills** — current platform has similar filtering. Verify exact filter options match.
- [ ] **Role badges** — color-coded by role (admin=primary, moderator=indigo, member=muted). Verify color mapping.
- [ ] **DropdownMenu on cards** — current platform may have simpler actions. Verify.

---

## Allowed Improvements

- **Cleaner role badges** — shadcn Badge with color variants looks more refined than MUI Chip
- **Better card hover** — shadcn Card with subtle shadow on hover
- **Avatar fallbacks** — shadcn Avatar with initials fallback is cleaner
- **Search input** — shadcn Input with search icon prefix

---

## Figma Make Instructions

```
You are recreating the Alkemio Community Tab using shadcn/ui components.

LAYOUT (keep exactly):
- Space banner + horizontal tab bar (COMMUNITY tab active)
- Search/filter bar below tabs
- Responsive grid of member cards (4-5 per row desktop, 2-3 tablet, 1-2 mobile)

COMPONENTS (swap to new):
- Member cards: shadcn Card with Avatar + name + role Badge
- Avatar: shadcn Avatar (large, circular)
- Role indicator: shadcn Badge (color-coded per role)
- Search: shadcn Input with search icon
- Filter: shadcn Select dropdowns
- Invite button: shadcn Button (primary, facilitator-only)
- Show more: shadcn Button variant="outline"

CONTENT (keep current):
- Member cards: avatar, name, role (Contributor, Facilitator, etc.)
- Search by name
- Filter by role
- Invite new members action (facilitator-only)

Use the design system tokens from design-system-page.md.
```

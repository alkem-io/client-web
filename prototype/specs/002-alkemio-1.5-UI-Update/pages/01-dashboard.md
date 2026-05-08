# Page 1: Dashboard (Home)

> **Route**: `/` (post-login)  
> **Access**: All authenticated users  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/main/topLevelPages/Home/HomePage.tsx` → `MyDashboard.tsx`

---

## Current Layout

The Dashboard is a three-zone layout (no welcome banner):

```
┌──────────────────────────────────────────────────────────┐
│  Top Navigation Bar                                      │
│  [Logo]              [Search] [Msg] [Bell] [Grid] [Avtr] │
├──────────────────────────────────────────────────────────┤
│  Recent Spaces Cards (horizontal row, 4 cards)           │
│            "Explore all your Spaces >>"                   │
├─────────┬────────────────────┬───────────────────────────┤
│ Left    │ Left Activity Col  │ Right Activity Col        │
│ Sidebar │ "Latest Activity   │ "My Latest Activity"      │
│         │  in my Spaces"     │                           │
│ - Menu  │ [Space] [Role]     │ [Space]                   │
│ - Spaces│ filter dropdowns   │ filter dropdown           │
│ - VCs   │                    │                           │
└─────────┴────────────────────┴───────────────────────────┘
│  Footer: © 2026 Alkemio B.V. | Terms | Privacy | etc.   │
└──────────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Top Navigation Bar**: Alkemio logo (left); Search icon, Messaging icon, Notifications bell, Spaces grid icon (2×2), Profile avatar with "Beta" badge (right)
- **Recent Spaces Row**: 4 horizontal space cards (banner image + name + lock icon), centered "Explore all your Spaces >>" link below
- **Left Sidebar**:
  - Navigation menu: Invitations (envelope), Tips & Tricks, My Account (tag), Create my own Space (rocket), Activity View (toggle switch)
  - "Spaces" section: list of user's spaces with space avatar + name
  - "Virtual Contributors" section: list of VCs with avatar + name (e.g. Softmann, The Collaboration Methodologist)
- **Two-Column Activity Feeds**: Equal-width columns — left for "Latest Activity in my Spaces" (filterable by Space + Role dropdowns), right for "My Latest Activity" (filterable by Space dropdown). Each item: avatar + action text + space name + timestamp. "Show more" link at bottom of each column.
- **Footer**: Copyright, Terms, Privacy, Security, Alkemio logo, Support, About, Language selector

---

## Element Inventory

### Top Navigation Bar
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Alkemio logo | Logo image | Logo image (keep as-is) | Links to dashboard |
| Search icon | `IconButton` | `Button` variant="ghost" + Lucide `Search` | Opens Platform Search overlay |
| Messaging icon | `IconButton` | `Button` variant="ghost" + Lucide `MessageSquare` | Opens messaging panel |
| Notifications bell | `IconButton` + badge | `Button` variant="ghost" + Lucide `Bell` + `Badge` | Badge for unread count |
| Spaces grid icon | `IconButton` | `Button` variant="ghost" + Lucide `LayoutGrid` | Opens spaces grid/drawer |
| Profile avatar | `Avatar` + badge | `Avatar` + "Beta" badge overlay | Opens profile dropdown menu |
| Profile dropdown | `Menu` + `Avatar` | `DropdownMenu` + `Avatar` | MY DASHBOARD, MY PROFILE, etc. |

### Recent Spaces Row
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Space card | `ContributeCard` / `Paper` | `Card` + `CardHeader` + `CardContent` | Image, name, lock icon |
| Lock icon (private) | MUI `LockIcon` | Lucide `Lock` icon | Indicate private space |
| "Explore all" link | `Typography` link | Tailwind link / `Button` variant="link" | Navigation link |
| Scroll container | Custom horizontal scroll | Tailwind `overflow-x-auto flex gap-4` | 4 cards visible |

### Left Sidebar
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Menu container | `DashboardMenu` custom | Custom sidebar with shadcn | Preserve menu structure |
| Invitations | Custom list item + envelope icon | `Button` variant="ghost" + Lucide `Mail` | Link to invitations |
| Tips & Tricks | Custom list item | `Button` variant="ghost" + Lucide `Lightbulb` | Link to tips |
| My Account | Custom list item + tag icon | `Button` variant="ghost" + Lucide `Tag` | Link to account page |
| Create my own Space | Custom list item + rocket icon | `Button` variant="ghost" + Lucide `Rocket` | Opens create space dialog |
| Activity View toggle | `Switch` + label | `Switch` (shadcn) + label | Toggle activity view, green when ON |
| Spaces section header | `Typography` | Tailwind heading class | "Spaces" heading |
| Space list items | Custom list item | `Avatar` + space name | Each user space with avatar + name |
| Virtual Contributors header | `Typography` | Tailwind heading class | "Virtual Contributors" heading |
| VC list items | Custom list item | `Avatar` + VC name | Each VC with avatar + name (e.g. Softmann) |

### Activity Feeds (Two Columns)
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Column container | `PageContentColumn` | Tailwind grid `grid-cols-2` | Equal-width columns |
| Left column header | `Typography` heading | Heading with Tailwind | "Latest Activity in my Spaces" |
| Right column header | `Typography` heading | Heading with Tailwind | "My Latest Activity" |
| Space filter (both cols) | `Select` | `Select` (shadcn) | "Space: All Spaces" dropdown |
| Role filter (left col only) | `Select` | `Select` (shadcn) | "My role: All roles" dropdown |
| Activity item | Custom list item | List row: `Avatar` + text + space name + timestamp | Avatar left, action text + space/context, relative time right |
| "Show more" link | Link / `Button` | `Button` variant="link" or Tailwind link | "Show more" at bottom of each column |

---

## Prototype Status

✅ **BUILT** — `pages/Dashboard.tsx` + `components/dashboard/DashboardHero.tsx`, `RecentSpaces.tsx`, `ActivityFeed.tsx`

**Prototype structure:**
- `DashboardHero` — full-bleed hero banner with Unsplash background, dark overlay, welcome text + CTA button → opens ExploreSpacesDialog
- `RecentSpaces` — react-slick carousel (3→2→1 responsive slides), cards with image thumbnail, Lock badge, colored initials, name, "Last visited" text, "Explore all your Spaces" link
- `ActivityFeed` ×2 — hand-styled card list (no shadcn), avatar + activity text + timestamp, "Show more" footer link
- Layout: `flex-col gap-8 p-6 md:p-8 max-w-[1600px] mx-auto`, two-column grid for activity feeds on `lg`

**shadcn components used:** None directly on this page — all hand-styled with Tailwind. Child components use custom `<button>` elements.

---

## Pull-Back Notes

- [x] **Hero banner must be REMOVED** — confirmed: new screenshot shows NO welcome/hero banner. Space cards start directly below the header.
- [x] **Recent Spaces uses carousel (react-slick) — must revert to flat row** — screenshot shows 4 cards in a simple horizontal row, not a carousel. No slider dots/arrows.
- [x] **Activity feeds are hand-styled** — acceptable but should use shadcn components for consistency.
- [x] **"Explore all your Spaces >>" is a centered link below cards** — screenshot confirms it's inline (centered below space cards), NOT a sidebar-only link. Both locations may work.
- [x] **Two-column layout confirmed** — screenshot confirms two equal activity columns with filter dropdowns (Space + Role on left, Space on right) and "Show more" links.
- [x] **Left sidebar confirmed** — screenshot shows sidebar with: Invitations, Tips & Tricks, My Account, Create my own Space, Activity View toggle, Spaces section (with space avatars), Virtual Contributors section (Softmann, The Collaboration Methodologist).
- [x] **Header icons** — screenshot shows 5 action icons: Search, Messaging, Notifications, Spaces Grid (2×2), Profile Avatar with "Beta" badge. Prototype may be missing Messaging and Spaces Grid icons.
- [x] **Footer present** — screenshot shows footer: © 2026 Alkemio B.V. | Terms, Privacy, Security, Alkemio logo, Support, About, Language.
- [x] **ExploreSpacesDialog** — current platform has "Explore all your Spaces" link that likely opens a dialog.

---

## Allowed Improvements

These changes from the new components are **acceptable** (don't pull back):
- **Better card hover states** — shadcn cards with subtle shadow transitions look cleaner than MUI Paper elevation changes
- **Cleaner dropdown menus** — shadcn Select and DropdownMenu have better visual weight
- **Modern toggle switch** — shadcn Switch is visually sharper
- **Typography refinement** — if the new type scale is more readable, keep it
- **Icon consistency** — Lucide icons (shadcn default) instead of MUI icons is fine as long as meaning is preserved

---

## Figma Make Instructions

```
You are recreating the Alkemio Dashboard (post-login homepage) using the new shadcn/ui component library.

LAYOUT (keep exactly — NO welcome banner):
- Full-width top navigation bar:
  - Left: Alkemio logo
  - Right: Search icon, Messaging icon, Notifications bell, Spaces grid icon (2×2), Profile avatar with "Beta" badge
- Horizontal row of 4 recent space cards directly below header (banner image + name + lock icon)
- Centered "Explore all your Spaces >>" link below cards
- Three-column layout below:
  - Left sidebar (~240px):
    - Menu: Invitations (envelope), Tips & Tricks, My Account (tag), Create my own Space (rocket)
    - Activity View toggle (Switch, green when ON)
    - "Spaces" section: list of user's spaces with space avatar + name
    - "Virtual Contributors" section: list of VCs with avatar + name
  - Center column: "Latest Activity in my Spaces" with filters (Space: All Spaces, My role: All roles)
  - Right column: "My Latest Activity" with filter (Space: All Spaces)
- Activity items: avatar + action text + space/context name + relative timestamp
- "Show more" link at bottom of each activity column
- Footer: © 2026 Alkemio B.V. | Terms, Privacy, Security, Alkemio logo, Support, About, Language

COMPONENTS (swap to new):
- Cards: shadcn Card (space cards with banner image + CardContent)
- Buttons: shadcn Button (ghost for sidebar menu + header icons, link for "Show more")
- Dropdowns: shadcn Select for activity filters
- Profile menu: shadcn DropdownMenu triggered from Avatar
- Search: ghost Button with Lucide Search icon (triggers search overlay)
- Notifications: ghost Button with Lucide Bell
- Switch: shadcn Switch for Activity View toggle
- Avatars: shadcn Avatar for spaces, VCs, and activity items

CONTENT (match current exactly):
- NO welcome banner or hero section
- Space cards with thumbnail, name, lock icon for private
- Activity feed items: avatar, action description, space name, relative timestamp
- Sidebar: Invitations, Tips & Tricks, My Account, Create my own Space, Activity View toggle, Spaces list, Virtual Contributors list

Use the design system tokens from design-system-page.md.
```

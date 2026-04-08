# Page 19: Space Settings — Subspaces Tab

> **Route**: `/space/[space-slug]/settings/subspaces`  
> **Access**: Space Facilitators, Space Admins  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Parent layout**: [15-space-settings-master.md](15-space-settings-master.md)

---

## Current Layout

The Subspaces settings tab configures default templates and manages existing subspaces.

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR │  "Subspaces"                              │
│          │  "Edit the Subspaces in this Space..."    │
│  ...     │                                           │
│  Subspc* │  Default Subspace Template                │
│  ...     │  ┌──────────────────────────────────┐     │
│          │  │ [Template Card]  [CHANGE DEFAULT] │     │
│          │  └──────────────────────────────────┘     │
│          │                                           │
│          │  Subspaces (5)             [+ CREATE]     │
│          │  [Search: ____________]                    │
│          │  ┌──────┐ ┌──────┐ ┌──────┐              │
│          │  │Card  │ │Card  │ │Card  │               │
│          │  │Name  │ │Name  │ │Name  │               │
│          │  │Desc  │ │Desc  │ │Desc  │               │
│          │  │[⋮]   │ │[⋮]   │ │[⋮]   │               │
│          │  └──────┘ └──────┘ └──────┘              │
└──────────┴───────────────────────────────────────────┘
```

### Key structural elements:
- **Default Template Section**: Current template card + "Change Default Template" button
- **Subspaces List**: Search + card grid of existing subspaces
- **Per-subspace Actions**: 3-dot overflow menu (Edit, Archive, Delete)
- **Create Subspace**: "+ CREATE SUBSPACE" button

---

## Element Inventory

### Default Template
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Template card | Custom card | `Card` (shadcn) | Thumbnail, name, desc |
| Change button | `Button` | `Button` variant="outline" | "CHANGE DEFAULT TEMPLATE" |

### Subspace Grid
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Search input | `TextField` | `Input` (shadcn) | Search subspaces |
| Subspace card | `ContributeCard` | `Card` (shadcn) | Image, name, desc, members |
| Status badge | `Chip` | `Badge` (shadcn) | Active / Archived |
| Overflow menu | `IconButton` 3-dot | `DropdownMenu` (shadcn) | Edit, Archive, Delete |
| Count badge | `Badge` | `Badge` (shadcn) | "(5)" in header |
| Create button | `Button` | `Button` (shadcn) | "+ CREATE SUBSPACE" |
| Card grid | MUI Grid | Tailwind grid | Responsive |

---

## Prototype Status

✅ **BUILT** — `components/space/SpaceSettingsSubspaces.tsx` (576 lines)

**Prototype structure:**
- Default template selector (card grid modal)
- Subspace CRUD with grid/list view toggle
- Search + status filters
- Archive/delete actions
- 576 lines of code

**shadcn components used:** Card, Badge, Button, Input, Dialog, Select, DropdownMenu, Switch, Separator, Avatar, Tabs

---

## Pull-Back Notes

- [ ] **Subspace management** — current has subspace management in settings. Verify UI matches.
- [x] **Grid/list view toggle** — may be new. Verify if current has view switching.
- [x] **Default template selector modal** — may be enhanced. Verify current template assignment flow.
- [x] **Status filters** — may be new. Verify.
- [ ] **Archive/delete actions** — verify current has these actions.

---

## Allowed Improvements

- **Card styling** — shadcn Card with better shadows
- **DropdownMenu** — shadcn for overflow actions
- **Badge** — shadcn Badge for status and counts

---

## Figma Make Instructions

```
You are recreating the Space Settings Subspaces Tab using shadcn/ui components.

LAYOUT: Within Space Settings master layout (Page 15).

CONTENT (keep exactly):
- Title: "Subspaces" + instructional text
- Default Subspace Template section (template card + "Change Default" button)
- Subspaces list header with count badge + "CREATE SUBSPACE" button
- Search bar
- Responsive card grid of subspaces (each with image, name, desc, status, overflow menu)

COMPONENTS:
- Template card: shadcn Card
- Subspace cards: shadcn Card (same as Subspaces Tab Page 4)
- Search: shadcn Input
- Status: shadcn Badge
- Overflow: shadcn DropdownMenu
- Create: shadcn Button (primary)
- Change Default: shadcn Button variant="outline"

Use the design system tokens from design-system-page.md.
```

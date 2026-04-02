# Page 20: Space Settings — Templates Tab

> **Route**: `/space/[space-slug]/settings/templates`  
> **Access**: Space Facilitators, Space Admins  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Parent layout**: [15-space-settings-master.md](15-space-settings-master.md)

---

## Current Layout

The Templates settings tab manages which templates are available to space members.

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR │  "Templates"                              │
│          │  "Select and manage templates..."         │
│  ...     │                                           │
│  Templ*  │  [Search: ___________] [Filter ▾]        │
│  ...     │                                           │
│          │  ▾ Space Templates (3)      [+ CREATE]    │
│          │  ┌──────┐ ┌──────┐ ┌──────┐              │
│          │  │Tmpl  │ │Tmpl  │ │Tmpl  │               │
│          │  │Name  │ │Name  │ │Name  │               │
│          │  │[on]  │ │[off] │ │[on]  │               │
│          │  │[⋮]   │ │[⋮]   │ │[⋮]   │               │
│          │  └──────┘ └──────┘ └──────┘              │
│          │                                           │
│          │  ▾ Collaboration Tool Templates (2)       │
│          │  ┌──────┐ ┌──────┐                        │
│          │  │Tmpl  │ │Tmpl  │                         │
│          │  └──────┘ └──────┘                        │
│          │                                           │
│          │  ▾ Whiteboard Templates (4)               │
│          │  ...                                      │
│          │                                           │
│          │  ▾ Brief Templates (1)                    │
│          │  ...                                      │
│          │                                           │
│          │  ▾ Community Guidelines Templates (1)     │
│          │  ...                                      │
└──────────┴───────────────────────────────────────────┘
```

### Key structural elements:
- **Search & Filter**: Search by name/desc, filter by category/status
- **Grouped Sections**: Collapsible sections by template type (Space, Collaboration, Whiteboard, Brief, Guidelines)
- **Template Cards**: Thumbnail, name, desc, category badge, enable/disable toggle
- **Per-section**: "+ CREATE NEW" button
- **Overflow menu**: Preview, Edit, Delete, Duplicate per card

---

## Element Inventory

### Search & Filter
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Search input | `TextField` | `Input` (shadcn) | Search templates |
| Filter dropdown | `Select` | `Select` (shadcn) | Category, status |

### Template Sections (Collapsible)
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section header | Custom collapsible | `Collapsible` or `Accordion` (shadcn) | Type name + count |
| Chevron icon | MUI icon | Lucide `ChevronDown` | Expand/collapse |
| Count badge | `Badge` | `Badge` (shadcn) | "(3)" per section |
| Create button | `Button` | `Button` variant="outline" | "+ CREATE NEW" per section |

### Template Cards
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Template card | Custom card / `Paper` | `Card` (shadcn) | Thumbnail + name + toggle |
| Thumbnail | `<img>` | `<img>` with Tailwind | Template preview image |
| Template name | `Typography` | Heading with Tailwind | Template name |
| Description | `Typography` body | Tailwind body text | Brief desc |
| Category badge | `Chip` | `Badge` (shadcn) | Design, Innovation, etc. |
| Enable toggle | `Switch` / `Checkbox` | `Switch` (shadcn) | On/off per template |
| Status indicator | Custom | `Badge` (shadcn) | "Enabled" / "Disabled" |
| Overflow menu | `IconButton` 3-dot | `DropdownMenu` (shadcn) | Preview, Edit, Delete |
| Card grid | MUI Grid | Tailwind grid | Responsive per section |

---

## Prototype Status

✅ **BUILT** — `components/space/SpaceSettingsTemplates.tsx` (430 lines)

**Prototype structure:**
- Templates organized by category (Space, Collaboration, Whiteboard, Brief, Guidelines) in collapsible sections
- Template cards with preview/duplicate/edit/delete actions
- 430 lines of code

**shadcn components used:** Card, Badge, Button, Input, Dialog, Select, DropdownMenu, Separator, Accordion, Tabs, Tooltip

---

## Pull-Back Notes

- [ ] **Templates by category in collapsible sections** — verify current template management layout.
- [x] **Template categories (Space/Collaboration/Whiteboard/Brief/Guidelines)** — verify these match current categories.
- [ ] **Preview/duplicate/edit/delete actions** — verify current action set.
- [ ] **Collapsible sections** — verify current uses collapsible or flat list.

---

## Allowed Improvements

- **Accordion sections** — shadcn Accordion for template groups
- **Switch toggle** — shadcn Switch for enable/disable
- **Badge** — shadcn Badge for categories and counts
- **DropdownMenu** — shadcn for overflow actions

---

## Figma Make Instructions

```
You are recreating the Space Settings Templates Tab using shadcn/ui components.

LAYOUT: Within Space Settings master layout (Page 15).

CONTENT (keep exactly):
- Title: "Templates" + instructional text
- Search + filter bar
- 5 collapsible template sections:
  1. Space Templates (with count, create button)
  2. Collaboration Tool Templates
  3. Whiteboard Templates
  4. Brief Templates
  5. Community Guidelines Templates
- Each section: card grid of templates with thumbnail, name, desc, enable/disable toggle, overflow menu

COMPONENTS:
- Sections: shadcn Accordion or Collapsible
- Template cards: shadcn Card with Switch toggle + DropdownMenu overflow
- Search: shadcn Input
- Filter: shadcn Select
- Category badges: shadcn Badge
- Enable toggle: shadcn Switch
- Create: shadcn Button variant="outline" per section

Use the design system tokens from design-system-page.md.
```

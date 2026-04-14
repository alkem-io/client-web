# Page 5: Knowledge Base Tab

> **Route**: `/space/[space-slug]/knowledge-base`  
> **Access**: Space members  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/space/layout/tabbedLayout/Tabs/SpaceKnowledgeBase/`

---

## Current Layout

The Knowledge Base tab is a repository of curated resources and documents for the space.

```
┌──────────────────────────────────────────────────────────┐
│  Space Banner + Tab Bar (HOME | COMMUNITY | SUBSP | KB*) │
├──────────────────────────────────────────────────────────┤
│  Section Header: "Knowledge Base"                        │
│  ┌────────────────────────────────────────────────┐      │
│  │  Search / Filter by type                       │      │
│  └────────────────────────────────────────────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Resource │ │ Resource │ │ Resource │ │ Resource │    │
│  │ Card     │ │ Card     │ │ Card     │ │ Card     │    │
│  │          │ │          │ │          │ │          │    │
│  │ [Icon]   │ │ [Icon]   │ │ [Icon]   │ │ [Icon]   │    │
│  │ Name     │ │ Name     │ │ Name     │ │ Name     │    │
│  │ Type     │ │ Type     │ │ Type     │ │ Type     │    │
│  │ Author   │ │ Author   │ │ Author   │ │ Author   │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  [+ Add Resource]              [Show more]               │
└──────────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Tab Bar**: KNOWLEDGE BASE tab is active
- **Resource Grid / List**: Cards or list items showing documents, links, whiteboards
- **File Type Indicators**: Icons per resource type (document, link, whiteboard)
- **Organization**: Categories or folders (if supported), search/filter by type
- **Add Resource**: Button for contributors/facilitators

---

## Element Inventory

### Resource List / Cards
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Resource card | Custom card / `Paper` | `Card` (shadcn) | Icon + name + metadata |
| File type icon | MUI icon (Description, Link, etc.) | Lucide icon | Document, Link, Whiteboard, etc. |
| Resource name | `Typography` heading | Heading with Tailwind | Linked, clickable |
| Description | `Typography` body | Tailwind body text | Short description |
| "Uploaded by" | `Typography` caption + `Avatar` | `Avatar` (shadcn) + text | Author info |
| Last modified | `Typography` caption | Tailwind small text | Date |
| Resource grid | MUI Grid / custom | Tailwind grid or `Table` | Cards or table layout |

### Search & Filters
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Search input | `TextField` | `Input` (shadcn) | Search by name |
| Type filter | `Select` | `Select` (shadcn) | Filter: Links, Documents, Whiteboards |

### Actions
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Add resource | `Button` | `Button` (shadcn) | Contributors create; Facilitators manage |
| Open/download | Click card | Card link / download trigger | Opens or downloads |
| "Show more" | `Button` | `Button` variant="outline" | Pagination |

---

## Prototype Status

✅ **BUILT** — `pages/SpaceKnowledgeBase.tsx` + `components/space/SpaceResourcesList.tsx`

**Prototype structure:**
- Same space shell
- `SpaceResourcesList` — **FULL DATA TABLE** with file-type icons, category filter badges, sortable columns (Name/Category/Uploaded By/Date/Size), row actions (Download/Rename/Move/Delete) via DropdownMenu
- File type colors: red=pdf, green=spreadsheet, blue=doc, purple=link, orange=image
- Empty search state

**shadcn components used:** Card, Badge, Button, Input, DropdownMenu, Separator, Table, Tooltip, Avatar

---

## Pull-Back Notes

- [x] **Data table layout is a MAJOR DIVERGENCE** — current platform Knowledge Base (screenshot `Space Knowledge Base.png`) uses a CARD-based layout with content type sections, NOT a sortable data table. This needs significant pull-back.
- [x] **File-type colored icons** — current uses different content type indicators.
- [x] **Sortable columns** — current KB has no table sorting.
- [x] **Row actions (Rename/Move/Delete)** — current may have simpler actions.
- [x] **Must revert to card-based layout** matching current platform structure.

---

## Allowed Improvements

- **Cleaner file type icons** — Lucide icons are more consistent than MUI icons
- **Better card layout** — shadcn Card with organized metadata sections
- **Search input** — shadcn Input with type filter feels more integrated

---

## Figma Make Instructions

```
You are recreating the Alkemio Knowledge Base Tab using shadcn/ui components.

LAYOUT (keep exactly):
- Space banner + horizontal tab bar (KNOWLEDGE BASE tab active)
- Search/filter bar below tabs
- Responsive grid or list of resource cards

COMPONENTS (swap to new):
- Resource cards: shadcn Card with file type icon, name, description, author, date
- File type icons: Lucide icons (FileText, Link, PenTool for whiteboards)
- Search: shadcn Input with search icon
- Type filter: shadcn Select dropdown
- Add button: shadcn Button (primary)
- Pagination: shadcn Button variant="outline"

CONTENT (keep current):
- Resources: documents, links, whiteboards, files
- Each resource: name, type icon, description, uploaded by, last modified
- Search by name, filter by type
- Add resource action

Use the design system tokens from design-system-page.md.
```

# Page 21: Space Settings — Storage Tab

> **Route**: `/space/[space-slug]/settings/storage`  
> **Access**: Space Facilitators, Space Admins  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Parent layout**: [15-space-settings-master.md](15-space-settings-master.md)

---

## Current Layout

The Storage tab shows the space's document library and storage usage.

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR │  "Storage"                                │
│          │  "View and manage documents..."           │
│  ...     │                                           │
│  Storag* │  Storage Usage                            │
│  ...     │  ███████████░░░  45 GB / 100 GB           │
│          │                                           │
│          │  Documents                                │
│          │  [Search: _________]  [Filter: All ▾]     │
│          │  ┌────────────────────────────────────┐   │
│          │  │ Name | Type | Size | By | Date | ⋮ │   │
│          │  │ ──────────────────────────────────  │   │
│          │  │ doc.pdf | 📄 | 2MB | Jo | Jan | ⋮  │   │
│          │  │ wb.excl | 📐 | 5MB | Sa | Feb | ⋮  │   │
│          │  │ img.png | 🖼️ | 1MB | Je | Mar | ⋮  │   │
│          │  └────────────────────────────────────┘   │
│          │  [Page 1 of 5]  [< 1 2 3 4 5 >]          │
└──────────┴───────────────────────────────────────────┘
```

### Key structural elements:
- **Storage Meter**: Progress bar showing used vs. total (color-coded)
- **Documents Table**: Searchable, sortable table of files
- **File Type Icons**: Per-file type (Document, Whiteboard, Image, etc.)
- **Row Actions**: Preview, Download, Share, Delete via overflow menu
- **Pagination**: Table pagination controls

---

## Element Inventory

### Storage Usage
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Progress bar | Custom / MUI `LinearProgress` | `Progress` (shadcn) or Tailwind | Color-coded |
| Usage text | `Typography` | Tailwind text | "45 GB / 100 GB used" |
| Breakdown (optional) | Custom chart/table | Tailwind list | By content type |
| Upgrade button | `Button` (optional) | `Button` variant="outline" | If applicable |

### Documents Table
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Table | Custom / MUI `Table` | `Table` (shadcn) | Sortable columns |
| Search input | `TextField` | `Input` (shadcn) | Search by name |
| Type filter | `Select` | `Select` (shadcn) | Documents, Whiteboards, Images |
| File type icon | MUI icon | Lucide icon | Per type |
| File name | `Typography` | Tailwind text | File name |
| Size | `Typography` | Tailwind text | File size |
| Uploaded by | `Typography` + `Avatar` | Text + `Avatar` (shadcn) | Author |
| Date | `Typography` | Tailwind text | Upload date |
| Row actions | `IconButton` 3-dot | `DropdownMenu` (shadcn) | Preview, Download, Delete |
| Pagination | Custom controls | Pagination component | Page controls |
| Empty state | Custom text | Centered text + icon | "No documents uploaded" |

---

## Prototype Status

✅ **BUILT** — `components/space/SpaceSettingsStorage.tsx` (398 lines)

**Prototype structure:**
- Storage usage meter with color-coded progress bar
- Breakdown by file type
- Sortable/searchable file table with bulk selection and actions
- 398 lines of code

**shadcn components used:** Card, Badge, Button, Input, Progress, Table, Checkbox

---

## Pull-Back Notes

- [ ] **Storage usage meter** — verify current has storage display. Screenshot (`space settings Storage Tab.jpg`) shows storage tab.
- [ ] **File type breakdown** — verify against screenshot.
- [x] **Bulk selection and actions** — may be enhanced. Verify.
- [ ] **Sortable file table** — verify current table structure.

---

## Allowed Improvements

- **Progress bar** — shadcn Progress with color coding looks cleaner
- **Table** — shadcn Table with better row styling
- **File type icons** — Lucide icons are more consistent
- **DropdownMenu** — shadcn for row actions

---

## Figma Make Instructions

```
You are recreating the Space Settings Storage Tab using shadcn/ui components.

LAYOUT: Within Space Settings master layout (Page 15).

CONTENT (keep exactly):
- Title: "Storage" + instructional text
- Storage usage meter (progress bar + "X GB / Y GB used")
- Documents table: search + type filter + sortable columns (Name, Type, Size, By, Date, Actions)
- Row actions via 3-dot menu (Preview, Download, Delete)
- Pagination controls

COMPONENTS:
- Progress bar: shadcn Progress (color-coded: green <75%, yellow 75-90%, red >90%)
- Table: shadcn Table with sortable headers
- Search: shadcn Input
- Filter: shadcn Select
- File type icons: Lucide icons
- Row actions: shadcn DropdownMenu
- Pagination: Button group or pagination component

Use the design system tokens from design-system-page.md.
```

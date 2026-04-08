# Page 28: Template Library

> **Route**: `/templates` or accessed from Space Settings → Templates  
> **Access**: Admin / Host users  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/templates/TemplateLibrary.tsx`

---

## Current Layout

The Template Library is a discovery page where admins browse and select templates to apply to their spaces. Contains template packs (grouped collections) and individual templates.

```
┌─────────────────────────────────────────────────────┐
│  Global Header                                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Template Library                                    │
│  Browse templates for your space                     │
│                                                      │
│  ┌───────────────────────────────────────────┐       │
│  │ 🔍 Search templates...                     │       │
│  └───────────────────────────────────────────┘       │
│                                                      │
│  ── Template Packs ──────────────────────────────    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Pack     │ │ Pack     │ │ Pack     │             │
│  │ Thumb    │ │ Thumb    │ │ Thumb    │             │
│  │          │ │          │ │          │             │
│  │ Pack Name│ │ Pack Name│ │ Pack Name│             │
│  │ N items  │ │ N items  │ │ N items  │             │
│  └──────────┘ └──────────┘ └──────────┘            │
│  [See all packs →]                                   │
│                                                      │
│  ── Individual Templates ────────────────────────    │
│  [All] [Post] [Whiteboard] [Innovation Flow]        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Template │ │ Template │ │ Template │ │Template│ │
│  │ Preview  │ │ Preview  │ │ Preview  │ │Preview │ │
│  │          │ │          │ │          │ │        │ │
│  │ Name     │ │ Name     │ │ Name     │ │Name    │ │
│  │ Type Tag │ │ Type Tag │ │ Type Tag │ │Type Tag│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  [Load more]                                         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Page Header**: Title + subtitle
- **Search Bar**: Full-width search input
- **Template Packs Section**: Horizontal card row showing grouped template collections
- **Individual Templates Section**: Filterable grid of individual templates
- **Type Filters**: All, Post, Whiteboard, Innovation Flow, etc.
- **Load More**: Pagination for templates

---

## Element Inventory

### Page Header
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Page title | `Typography` h1 | Heading with Tailwind | "Template Library" |
| Subtitle | `Typography` body | Tailwind text-muted | Description text |
| Search input | `TextField` with search icon | `Input` (shadcn) with Lucide search icon | Full-width |

### Template Packs Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section header | `Typography` h2 | Heading with Tailwind | "Template Packs" |
| Section separator | `Divider` | `Separator` (shadcn) | Visual break |
| Pack card | `Paper` / custom card | `Card` (shadcn) | Clickable → Pack Detail |
| Pack thumbnail | `<img>` | `<img>` | Pack cover image |
| Pack name | `Typography` | `CardTitle` (shadcn) | Pack name |
| Item count | `Typography` caption | Tailwind text-muted | "12 templates" |
| Card row | Horizontal layout | Tailwind `grid grid-cols-3 gap-4` | 3 cards desktop |
| "See all" link | Link / `Button` | `Button` variant="link" | More packs |

### Individual Templates Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section header | `Typography` h2 | Heading with Tailwind | "Individual Templates" |
| Type filters | Custom tabs / pills | `ToggleGroup` (shadcn) | All, Post, WB, etc. |
| Template card | `Paper` / custom card | `Card` (shadcn) | Clickable → Template Detail |
| Template preview | `<img>` / icon | `<img>` or icon | Content-type preview |
| Template name | `Typography` | `CardTitle` (shadcn) | Template name |
| Type tag | `Chip` | `Badge` (shadcn) | Post, Whiteboard, etc. |
| Card grid | Grid layout | Tailwind `grid grid-cols-4 gap-4` | 4-col desktop |
| Load more | `Button` | `Button` variant="outline" | Pagination |

---

## Prototype Status

✅ **BUILT** — `components/template-library/TemplateLibrary.tsx` (~330 lines)

**Prototype structure:**
- Sticky search header with Input
- Category filter pills (custom buttons, not shadcn Tabs/ToggleGroup)
- **Template Packs section** — 3-column grid of pack cards (image + initials badge + description + tags), custom pagination (prev/next)
- **All Templates section** — 4-column grid of template cards (type-switched preview + name + pack badge), custom pagination
- Sub-components: `TemplatePackCard`, `TemplateCardPreview` (type-switched: Whiteboard/Space/Subspace/Post/Collab), `PackPagination`
- Data from procedurally generated `template-data.ts` (30 generated + 100 curated templates, 10 packs)

**shadcn components used:** Button, Badge, Card, Input, Tooltip

---

## Pull-Back Notes

- [ ] **Template Library is likely a NEW/ENHANCED feature** — current platform may not have this full browsing experience. Verify if current has template library at all.
- [ ] **Category filter pills** — uses custom buttons, not shadcn ToggleGroup as mapped in brief. Consider standardizing.
- [ ] **Pagination** — custom prev/next arrows, not "Load more" button as described in brief. Verify preference.
- [ ] **Type-switched previews** — 5 preview types (Whiteboard/Space/Subspace/Post/Collab). Sophisticated rendering.
- [ ] **Pack cards + template cards** — two distinct card types. Well-structured.
- [ ] **If template library is entirely new** — no pull-back needed, this IS the target design.

---

## Allowed Improvements

- **Card** — shadcn Card with hover elevation
- **Badge** — shadcn Badge for template type labels
- **ToggleGroup** — cleaner pill-style type filters
- **Input** — shadcn Input with integrated search icon
- **Separator** — shadcn Separator between sections

---

## Figma Make Instructions

```
You are recreating the Alkemio Template Library page using shadcn/ui components.

LAYOUT (keep exactly):
- Full-page layout with global header
- Page title + subtitle
- Full-width search input
- Template Packs section: section header + horizontal card row (3-col grid)
- Individual Templates section: type filters (ToggleGroup) + card grid (4-col)
- Load more button at bottom

COMPONENTS (swap to new):
- Search: shadcn Input with search icon
- Pack cards: shadcn Card (thumbnail + CardTitle + item count)
- Template cards: shadcn Card (preview + CardTitle + Badge for type)
- Type filters: shadcn ToggleGroup (All, Post, Whiteboard, etc.)
- Type tags: shadcn Badge
- Separators: shadcn Separator between sections
- Load more: shadcn Button variant="outline"

Use the design system tokens from design-system-page.md.
```

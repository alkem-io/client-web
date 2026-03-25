# Page 29: Template Pack Detail

> **Route**: `/templates/pack/:packId`  
> **Access**: Admin / Host users  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/templates/TemplatePack.tsx`

---

## Current Layout

Shows all templates within a single template pack, organized by template type.

```
┌─────────────────────────────────────────────────────┐
│  Global Header                                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ← Back to Template Library                          │
│                                                      │
│  ┌─────────────────────────────────────────────┐     │
│  │  [Pack Cover Image / Banner]                │     │
│  │                                             │     │
│  │  Pack Name                                  │     │
│  │  Pack description text — what this pack     │     │
│  │  contains and when to use it.               │     │
│  │  Created by: [Avatar] Author                │     │
│  │  12 templates • Updated 3 days ago          │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  ── Post Templates (4) ─────────────────────────     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Template │ │ Template │ │ Template │ │Template│ │
│  │ Preview  │ │ Preview  │ │ Preview  │ │Preview │ │
│  │ Name     │ │ Name     │ │ Name     │ │Name    │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                      │
│  ── Whiteboard Templates (3) ────────────────────    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Template │ │ Template │ │ Template │             │
│  │ Preview  │ │ Preview  │ │ Preview  │             │
│  │ Name     │ │ Name     │ │ Name     │             │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                      │
│  ── Innovation Flow Templates (5) ───────────────    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Template │ │ Template │ │ Template │ │Template│ │
│  │ Preview  │ │ Preview  │ │ Preview  │ │Preview │ │
│  │ Name     │ │ Name     │ │ Name     │ │Name    │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐                                        │
│  │ Template │                                        │
│  │ Preview  │                                        │
│  │ Name     │                                        │
│  └──────────┘                                        │
│                                                      │
│  [Apply Pack to Space]                               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Back Link**: Returns to Template Library
- **Pack Header**: Cover image/banner, pack name, description, author, stats
- **Template Sections by Type**: Separate sections for each template type (Post, Whiteboard, Innovation Flow, etc.)
- **Template Cards**: Grid of clickable template cards per section
- **Apply Action**: Button to apply the full pack to a space

---

## Element Inventory

### Navigation
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Back link | Link / `Button` | `Button` variant="link" with arrow | ← Back to Template Library |

### Pack Header
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Header card | `Paper` | `Card` (shadcn) | Contains pack info |
| Cover image | `<img>` | `<img>` | Pack banner |
| Pack name | `Typography` h1 | Heading with Tailwind | Large bold title |
| Description | `Typography` body | Tailwind text | Pack description |
| Author avatar | MUI `Avatar` | `Avatar` (shadcn) | Pack creator |
| Author name | `Typography` | Tailwind text | "Created by: Name" |
| Stats | `Typography` caption | Tailwind text-muted | "12 templates • Updated 3 days ago" |

### Template Sections (per type)
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section header | `Typography` h2 | Heading with Tailwind | "Post Templates (4)" |
| Section separator | `Divider` | `Separator` (shadcn) | Visual break |
| Template card | `Paper` / custom card | `Card` (shadcn) | Clickable → Template Detail |
| Template preview | `<img>` / icon | `<img>` or icon | Content-type preview |
| Template name | `Typography` | `CardTitle` (shadcn) | Template name |
| Card grid | Grid layout | Tailwind `grid grid-cols-4 gap-4` | 4-col desktop |

### Actions
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Apply button | MUI `Button` | `Button` (shadcn) variant="default" | "Apply Pack to Space" |

---

## Prototype Status

✅ **BUILT** — `components/template-library/TemplatePackDetail.tsx` (~330 lines)

**Prototype structure:**
- Sticky breadcrumb header with pack image/name/description/tags/author
- "Apply Entire Pack" primary Button
- Body: multiple Accordion sections grouping templates by type ("Space Templates", "Subspace Templates", etc.)
- Each section: grid of template cards
- Apply dialog with space selector dropdown
- "Related Packs" placeholder section
- Mock data: `currentPack` object + `userSpaces` array (4 spaces)

**shadcn components used:** Button, Badge, Card, Accordion, Dialog, Select, Separator, Tooltip, Avatar, DropdownMenu

---

## Pull-Back Notes

- [ ] **Pack detail is likely NEW** — verify if current platform has pack browsing.
- [ ] **Accordion sections by type** — matches brief description of collapsible sections.
- [ ] **"Apply Entire Pack" button** — matches brief. Verify if apply functionality exists in current.
- [ ] **Apply dialog with space selector** — good UX pattern for selecting target space.
- [ ] **Related Packs section** — placeholder only, not fully built.
- [ ] **If template system is new** — no pull-back needed.

---

## Allowed Improvements

- **Card** — shadcn Card for pack header with subtle border
- **Avatar** — shadcn Avatar with fallback for author
- **Separator** — shadcn Separator between template type sections
- **Button** — primary action button for "Apply Pack"

---

## Figma Make Instructions

```
You are recreating the Alkemio Template Pack Detail page using shadcn/ui components.

LAYOUT (keep exactly):
- Back link (← Back to Template Library)
- Pack header Card: cover image, pack name, description, author (Avatar + name), stats
- Template sections grouped by type:
  - Each section: section header with count + Separator + 4-col card grid
  - Separate sections for Post Templates, Whiteboard Templates, Innovation Flow Templates
- "Apply Pack to Space" action button at bottom

COMPONENTS (swap to new):
- Pack header: shadcn Card
- Author: shadcn Avatar + text
- Template cards: shadcn Card (preview + CardTitle)
- Section separators: shadcn Separator
- Back link: shadcn Button variant="link"
- Apply button: shadcn Button variant="default"

Use the design system tokens from design-system-page.md.
```

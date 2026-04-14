# Page 30: Individual Template Detail

> **Route**: `/templates/:templateId` or modal within Template Library  
> **Access**: Admin / Host users  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/templates/TemplateDetail.tsx`

---

## Current Layout

Shows the detail view for a single template — content-focused preview with metadata and actions.

```
┌─────────────────────────────────────────────────────┐
│  Global Header                                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ← Back to Template Library / Pack                   │
│                                                      │
│  ┌─────────────────────────────┬──────────────────┐  │
│  │                             │                  │  │
│  │  Template Preview           │  Template Name   │  │
│  │  (large content preview)    │  ──────────────  │  │
│  │                             │                  │  │
│  │  If Post: rich text         │  Type: [Post]    │  │
│  │  preview                    │  Pack: Pack Name │  │
│  │                             │  By: [Av] Author │  │
│  │  If Whiteboard: canvas      │  Updated: 3d ago │  │
│  │  preview                    │                  │  │
│  │                             │  Description:    │  │
│  │  If Innovation Flow:        │  Template desc   │  │
│  │  flow diagram preview       │  text goes here. │  │
│  │                             │                  │  │
│  │                             │  ──────────────  │  │
│  │                             │  Instructions:   │  │
│  │                             │  How to use this │  │
│  │                             │  template step   │  │
│  │                             │  by step guide.  │  │
│  │                             │                  │  │
│  │                             │  [Apply to Space]│  │
│  │                             │  [Customize]     │  │
│  └─────────────────────────────┴──────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Back Link**: Returns to Template Library or Pack Detail
- **Two-Column Layout**: Large preview on left, metadata panel on right
- **Preview Panel**: Content-specific preview (Post → rich text, Whiteboard → canvas, Innovation Flow → flow diagram)
- **Metadata Panel**: Template name, type badge, pack link, author, timestamp, description, instructions
- **Action Buttons**: "Apply to Space" primary, "Customize" secondary
- **Conditional Content**: Instructions section only shown if template has instructions

---

## Element Inventory

### Navigation
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Back link | Link / `Button` | `Button` variant="link" with arrow | ← Back |

### Two-Column Layout
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Layout container | Grid / Flex | Tailwind `grid grid-cols-[1fr_360px] gap-6` | Two-column |
| Preview panel | `Paper` | `Card` (shadcn) | Left — large preview |
| Metadata panel | `Paper` | `Card` (shadcn) | Right — info sidebar |

### Preview Panel (Left)
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Preview card | `Paper` | `Card` (shadcn) | Content preview container |
| Post preview | Markdown render | Prose classes | Rich text |
| Whiteboard preview | Canvas embed | Canvas / `<img>` | Canvas preview |
| Flow preview | Custom diagram | SVG / diagram component | Flow visualization |

### Metadata Panel (Right)
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Template name | `Typography` h2 | Heading with Tailwind | Bold title |
| Type badge | `Chip` | `Badge` (shadcn) | Post, Whiteboard, etc. |
| Pack link | Link | `Button` variant="link" | "Pack: Pack Name" |
| Author avatar | MUI `Avatar` | `Avatar` (shadcn) | Template author |
| Author name | `Typography` | Tailwind text | Author name |
| Updated time | `Typography` caption | Tailwind text-muted | "Updated 3 days ago" |
| Description | `Typography` body | Tailwind text | Template description |
| Separator | `Divider` | `Separator` (shadcn) | Between sections |
| Instructions header | `Typography` h3 | Heading with Tailwind | "Instructions" |
| Instructions text | `Typography` body | Tailwind text | How to use |
| Apply button | MUI `Button` primary | `Button` (shadcn) variant="default" | "Apply to Space" |
| Customize button | MUI `Button` outlined | `Button` (shadcn) variant="outline" | "Customize" |

---

## Prototype Status

✅ **BUILT** — `components/template-library/TemplateDetail.tsx` (907 lines)

**Prototype structure:**
- 12-column grid — 8-col main preview + 4-col sticky sidebar
- **Header:** Breadcrumb, type badge, title, description, tags, Favorite/Share/Apply buttons
- **Preview section (type-switched):**
  - `SpaceTemplatePreview` — tab-based mockup (About/Subspaces/Resources/Templates)
  - `SubspaceTemplatePreview` — numbered stage flow
  - `CollaborationToolPreview` — post + attached component card
  - `WhiteboardTemplatePreview` — canvas with toolbar mockup
  - `PostTemplatePreview` — feed-style post
  - `BriefTemplatePreview` — card list
  - `CommunityGuidelinesPreview` — document mockup
- **Sidebar (`MetadataPanel`):** Instructions panel (conditional, collapsible), About card (usage count, date, complexity, What's Included), Related Templates list

**shadcn components used:** Button, Badge, Card, Accordion, Dialog, Select, Tooltip, Avatar, Tabs, Separator, DropdownMenu, Collapsible

---

## Pull-Back Notes

- [ ] **907 lines — most complex page** in the prototype. Very fully built.
- [ ] **Type-switched previews** — 7 preview types covering all template kinds. Matches design brief exactly.
- [ ] **Conditional instructions** — only shown if template has instructions. Matches brief.
- [ ] **Two-column layout (8:4)** — matches brief description.
- [ ] **Apply dialog** — same pattern as Pack Detail.
- [ ] **Screenshots** — cross-reference `post template.png`, `collaboration tool template > post with a whiteboard.png`, `collabroation tool template > post with a post.png` for current template detail view.
- [ ] **If template system is new** — no pull-back needed, this IS the target design.

---

## Allowed Improvements

- **Card** — shadcn Card for both preview and metadata panels
- **Badge** — shadcn Badge for type labels
- **Avatar** — shadcn Avatar with fallback
- **Separator** — shadcn Separator between metadata sections
- **Button** — consistent primary/outline button styling

---

## Figma Make Instructions

```
You are recreating the Alkemio Individual Template Detail page using shadcn/ui components.

LAYOUT (keep exactly):
- Back link (← Back to Template Library or Pack)
- Two-column layout: large preview panel (left) + metadata sidebar (right, ~360px)
- Preview panel: content-specific preview (Post → rich text, Whiteboard → canvas, Flow → diagram)
- Metadata panel: template name, type Badge, pack link, author (Avatar + name), timestamp, description
- Conditional Instructions section (only if template has instructions)
- Action buttons: "Apply to Space" (primary) + "Customize" (outline)

COMPONENTS (swap to new):
- Layout: Tailwind grid, two columns
- Preview: shadcn Card (large)
- Metadata: shadcn Card (sidebar)
- Type label: shadcn Badge
- Author: shadcn Avatar + text
- Separators: shadcn Separator
- Back link: shadcn Button variant="link"
- Actions: shadcn Button variant="default" + variant="outline"

Use the design system tokens from design-system-page.md.
```

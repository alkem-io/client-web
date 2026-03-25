# Page 25: Post Detail Dialog (Level 2)

> **Route**: Triggered by clicking post title from Space Home / Subspace  
> **Access**: All space members  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/communication/discussion/views/PostDetailDialog.tsx`

---

## Current Layout

Level 2 in the post hierarchy — expanded post detail showing full content, all responses, and comments.

```
┌─────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐│
│  │  ← Back    "Post Title..."   [Share] [⋮] [X]   ││
│  ├─────────────────────────────────────────────────┤│
│  │                                                 ││
│  │  Post Title (large, bold)                       ││
│  │  [Avatar] Author Name • 4 days ago              ││
│  │                                                 ││
│  │  Full post content (rich text, images, media)   ││
│  │  [READ MORE]                                    ││
│  │                                                 ││
│  │  Contributions (8)                              ││
│  │  [All] [Posts] [Whiteboards] [Collections]      ││
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          ││
│  │  │Resp  │ │Resp  │ │Resp  │ │Resp  │           ││
│  │  │Card  │ │Card  │ │Card  │ │Card  │           ││
│  │  │Author│ │Author│ │Author│ │Author│           ││
│  │  │Date  │ │Date  │ │Date  │ │Date  │           ││
│  │  └──────┘ └──────┘ └──────┘ └──────┘          ││
│  │  [See all responses]                            ││
│  │                                                 ││
│  │  ─── Comments (12) ───────────────────────      ││
│  │  [Avatar] User: comment text    ↩ Reply         ││
│  │  [Avatar] User: comment text    ↩ Reply         ││
│  │  [Load more comments]                           ││
│  │                                                 ││
│  │  ┌────────────────────────────────────┐         ││
│  │  │ Type your comment here...   😊 @ ➤ │         ││
│  │  └────────────────────────────────────┘         ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Header Bar**: Sticky, dark — back arrow, post title, share/more/close icons
- **Post Content**: Title, author (avatar + name + timestamp), full rich text body
- **Response Cards**: Horizontal grid/row of clickable response cards (opens Level 3)
- **Response Type Filter**: All, Posts, Whiteboards, Collections, Memos
- **Comments Section**: Visually separated, comment thread with reply, sticky input box
- **Comment Input**: Textarea with emoji, mention, send

---

## Element Inventory

### Header Bar
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Back arrow | `IconButton` | `Button` variant="ghost" size="icon" | Close/back |
| Post title (truncated) | `Typography` | Heading with Tailwind | Truncated title |
| Share icon | `IconButton` | `Button` variant="ghost" size="icon" | Share |
| More menu | `IconButton` 3-dot | `DropdownMenu` (shadcn) | More actions |
| Close button | `IconButton` X | `Button` variant="ghost" size="icon" | Close dialog |

### Post Content
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Post title | `Typography` h2 | Heading with Tailwind | Large, bold |
| Author avatar | MUI `Avatar` | `Avatar` (shadcn) | Author photo |
| Author name | `Typography` | Tailwind text | Author name |
| Timestamp | `Typography` caption | Tailwind text-muted | "4 days ago" |
| Post body | Markdown render | Prose classes | Rich text content |
| Reactions | Custom reaction bar | Button group | 😊 ❤️ 👍 with counts |

### Response Cards
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Response card | Custom card | `Card` (shadcn) | Clickable → Level 3 |
| Card thumbnail | `<img>` / icon | `<img>` or Lucide icon | Type-specific preview |
| Card title | `Typography` | Heading with Tailwind | Response title |
| Card author | `Avatar` + text | `Avatar` (shadcn) + text | Author |
| Card date | `Typography` caption | Tailwind text-muted | Date |
| Type filter | Custom tabs / pills | `ToggleGroup` (shadcn) | All, Posts, WB, etc. |
| Card grid | Horizontal scroll | Tailwind `flex overflow-x-auto gap-4` | 4 visible on desktop |
| "See all" link | Link / `Button` | `Button` variant="link" | Pagination |

### Comments Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section header | `Typography` | Heading with Tailwind | "Comments (12)" |
| Section separator | `Divider` | `Separator` (shadcn) | Visual separation |
| Comment item | Custom comment | Tailwind flex row | Avatar + text + actions |
| Comment avatar | MUI `Avatar` | `Avatar` (shadcn) | Small |
| Comment text | `Typography` | Tailwind text | Comment body |
| Reply button | `Button` / link | `Button` variant="ghost" | ↩ Reply |
| Load more | `Button` | `Button` variant="outline" | "Load more comments" |
| Comment input | `TextField` | `Textarea` (shadcn) | "Type your comment..." |
| Emoji picker | Custom | Popover with emoji grid | 😊 icon trigger |
| Mention | Custom | `@` mention autocomplete | @ icon trigger |
| Send button | `IconButton` | `Button` variant="ghost" size="icon" | Send arrow |

---

## Prototype Status

✅ **BUILT** — `components/dialogs/PostDetailDialog.tsx` (250 lines)

**Prototype structure:**
- Near-fullscreen dialog (`max-w-5xl max-h-[90vh]`)
- **Sticky header bar** (64px) — title, breadcrumb, share/more/close actions
- **Scrollable content area** — post title (h1), author row (Avatar + name + timestamp), rich text body, image, "Key Discussion Points" section
- **Reactions bar** — emoji indicators with counts (Lightbulb, HandMetal, Bookmark, Heart)
- **Contributions section** (conditional) — grid of whiteboard/collection item cards; clicking one opens ResponseDetailDialog
- **Comments section** — mock comments list (Avatar + name + timestamp + text), "Load more" link
- **Sticky comment input** at bottom — Textarea + emoji + send Button

**shadcn components used:** Dialog, Button, Avatar, Badge, Separator, Card, Textarea, DropdownMenu, Tooltip, Tabs, ScrollArea, Popover

---

## Pull-Back Notes

- [ ] **Dialog size (max-w-5xl max-h-[90vh])** — matches current post detail dialog concept. Verify against screenshot (`Dialouge when Opening the post by pressing the title or the fullscreen button (level 2).png`).
- [ ] **Sticky header bar** — present in prototype. Verify current has same sticky header.
- [ ] **Reactions bar** — prototype uses emoji icons with counts. Verify current reaction pattern.
- [x] **"Key Discussion Points" section** — may be new/enhanced. Verify if current has this structured section.
- [ ] **Contributions grid** — prototype shows whiteboard/collection items. Verify matches current response cards.
- [ ] **Comments section** — standard pattern. Verify against screenshot.
- [ ] **Sticky comment input** — present at bottom. Verify current placement.

---

## Allowed Improvements

- **Card hover** — shadcn Card with better lift on hover
- **Separator** — shadcn Separator for comment section boundary
- **Avatar** — shadcn Avatar with fallback
- **ToggleGroup** — cleaner type filter pills
- **Dialog** — shadcn Dialog with smoother overlay

---

## Figma Make Instructions

```
You are recreating the Alkemio Post Detail Dialog (Level 2) using shadcn/ui components.

LAYOUT (keep exactly):
- Large modal/overlay with dark backdrop
- Sticky header bar: back arrow, post title, share/more/close icons
- Post content: title, author (avatar + name + time), full rich text body
- Response cards: horizontal scrolling row (4 visible), with type filter (All/Posts/WB/Collections)
- Comments section (visually separated): comment thread + sticky comment input

COMPONENTS (swap to new):
- Header icons: shadcn Button variant="ghost" size="icon"
- More menu: shadcn DropdownMenu
- Author: shadcn Avatar + text
- Response cards: shadcn Card (clickable → opens Level 3)
- Type filter: shadcn ToggleGroup
- Separator: shadcn Separator between responses and comments
- Comments: shadcn Avatar + text + Button variant="ghost" for reply
- Comment input: shadcn Textarea + emoji/mention triggers + send Button

Use the design system tokens from design-system-page.md.
```

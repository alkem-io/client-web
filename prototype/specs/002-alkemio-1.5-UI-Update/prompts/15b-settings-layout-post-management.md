# Settings › Layout — Post Assignment & Ordering (Figma Make Prompt)

> **Parent page**: Space Settings › Layout tab (`/space/:slug/settings/layout`)  
> **Action**: Feature addition — extends the existing Layout settings tab  
> **Context**: The Layout tab already lets users reorder and rename the four Space tabs (Home, Community, Subspaces, Knowledge). This prompt adds the ability to **assign posts to tabs** and **reorder posts within each tab** using a kanban-style grid of collapsible columns with drag-and-drop reordering and cross-column reassignment.

---

## Design Brief

### Problem

On the current Alkemio platform, the Layout settings page shows each Space tab as a card containing its assigned posts. Facilitators can drag posts to reorder them within a tab or drag them between tabs to reassign. Our redesign is missing this — it only handles tab reorder/rename, with no way to manage which posts appear in which tab or in what order.

### Goal

Add a **Tab Content** section below the existing tab reorder list. It should let facilitators:

1. See all four tabs side by side with their assigned posts (kanban overview)
2. Drag-and-drop posts to reorder within a column
3. Drag-and-drop posts between columns to reassign them to a different tab
4. Collapse/expand individual columns to focus on specific tabs
5. Identify empty tabs at a glance

### Why Kanban + Collapsible Columns

This hybrid combines the best of both patterns:

- **Side-by-side columns** give an instant overview of content distribution across all tabs — you can see "Home has 3, Subspaces has 0" without expanding anything
- **Cross-column drag-and-drop** is short-distance and intuitive when columns sit next to each other
- **Collapsible headers** let facilitators focus on specific tabs and reduce visual noise for tabs they aren't actively managing
- **Each column** acts as an accordion — collapsed shows only the header with post count, expanded shows the full post list

---

## Design Tokens (already in use — do not change)

| Token | Value |
|-------|-------|
| Font | Inter (all text) |
| Primary | `#1D384A` |
| Border radius | 6px (`--radius`) |
| Page background | white |
| Card background | white |

---

## Layout Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Layout (existing heading)                                       │
│  Customize your Space's navigation tabs...                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Existing tab reorder list — Home, Community, Subspaces,        │
│   Knowledge — with drag handles & rename]                        │
│                                                                  │
├─────────────────── Separator ────────────────────────────────────┤
│                                                                  │
│  Tab Content                                                     │
│  Manage which posts appear in each tab and their display order.  │
│  Drag posts between columns to reassign them.                    │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐│
│  │▾ 🏠 Home  (3)│ │▾ 👥 Comm. (3)│ │▸ ◈ Sub.  (0)│ │▾📖 Know(1)││
│  ├──────────────┤ ├──────────────┤ │              │ ├──────────┤│
│  │⠿ Welcome to │ │⠿ Softmann   │ │  (collapsed) │ │⠿ Design  ││
│  │  the Sandbox│ │  Radio #1   │ │              │ │  Research ││
│  │         💬 1│ │              │ │              │ │  Know.(3) ││
│  │──────────── │ │⠿ Supreme    │ │              │ │           ││
│  │⠿ Backlog of│ │  Funk Playl.│ │              │ │           ││
│  │  Insanity  │ │              │ │              │ │           ││
│  │         💬 4│ │⠿ Cosmic     │ │              │ │           ││
│  │──────────── │ │  Bangherz   │ │              │ │           ││
│  │⠿ Project   │ │              │ │              │ │           ││
│  │  Kickoff   │ │              │ │              │ │           ││
│  │  Notes     │ │              │ │              │ │           ││
│  │             │ │              │ │              │ │           ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘│
│                                                                  │
│  [Reset to Default]                          [Save Changes]      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Specification

### Section Header (new sub-section)

- **Separator**: shadcn `Separator` between the tab reorder list and this new section — `my-8`
- **Heading**: `<h3>` — "Tab Content" — `text-base font-semibold`
- **Description**: `<p>` — "Manage which posts appear in each tab and their display order. Drag posts between columns to reassign them." — `text-sm text-muted-foreground mt-1 mb-6`

### Columns Container

- **Layout**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start`
- Each column represents one Space tab
- Column order matches the tab order from the reorder list above (reactive — reordering tabs above reorders these columns)
- Columns use `items-start` so they size to their content instead of stretching to equal height

### Individual Column (Collapsible Card)

Each column is a self-contained card with a collapsible header — implemented with shadcn `Collapsible`.

- **Component**: shadcn `Collapsible`
- **Container**: `border border-border rounded-xl bg-card overflow-hidden`
- **Default state**: Non-empty columns open, empty columns collapsed

#### Column Header (Collapsible Trigger)

- **Component**: shadcn `CollapsibleTrigger` wrapping the header
- **Container**: `px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-2 w-full cursor-pointer select-none`
- **Chevron**: `ChevronDown` icon — `w-3.5 h-3.5 text-muted-foreground transition-transform duration-200` — rotates `-90deg` when collapsed
- **Tab Icon**: Matching Lucide icon from tab config — `w-4 h-4 text-muted-foreground`
- **Tab Name**: `text-sm font-medium truncate flex-1` — e.g. "Home"
- **Post Count**: shadcn `Badge` variant="secondary" — `text-xs` — e.g. "3"
- **Collapsed column**: Only the header row is visible. The column is still a valid drop target — dragging a post over a collapsed column auto-expands it after a 500ms hover delay.

#### Column Body (Collapsible Content)

- **Component**: shadcn `CollapsibleContent`
- **Container**: `p-1.5 space-y-1.5` — small padding and gap between post cards
- **Min height**: `min-h-[80px]` when expanded (even if empty) to maintain a visible drop zone
- The entire body area is a DnD drop target

### Post Card (Draggable)

Each post is a compact card within a column.

- **Container**: `flex items-start gap-2 px-2.5 py-2 bg-background border border-border rounded-lg cursor-grab active:cursor-grabbing group hover:border-primary/30 hover:shadow-sm transition-all`
- **Drag Handle**: `GripVertical` icon — `w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 mt-0.5 flex-shrink-0`
- **Content area** (`flex-1 min-w-0`):
  - **Post Title**: `text-xs font-medium leading-snug line-clamp-2` — two-line clamp for longer titles
  - **Meta row** (below title): `flex items-center gap-2 mt-1`
    - Response count (if > 0): `flex items-center gap-0.5 text-[11px] text-muted-foreground` — `MessageSquare` icon `w-3 h-3` + count
    - Post type icon (optional): `FileText` — `w-3 h-3 text-muted-foreground/50`
- **Overflow button**: `MoreHorizontal` icon in a `Button` variant="ghost" size="icon" — `w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`
  - shadcn `DropdownMenu` with:
    - "Move to →" submenu listing the other three tabs (with icons) — selecting one moves the post
    - "View Post" — navigates to the post
    - Separator
    - "Remove from Tab" — unassigns the post (destructive style text)

#### Dragging State

- **Dragging card**: `opacity-30 border-dashed scale-[1.02] rotate-[1deg] shadow-lg` — slight tilt/scale for natural feel
- **Drop placeholder**: When dragging over a column, a `h-1 bg-primary/40 rounded-full mx-1` insertion line appears between cards to show drop position
- **Column highlight on hover**: When a dragged post enters a different column's drop zone: `ring-2 ring-primary/30 ring-inset bg-primary/5` on the column body

### Empty Column Content

When a column has no posts and is expanded:

- **Container**: `flex flex-col items-center justify-center py-6`
- **Icon**: Tab's Lucide icon — `w-6 h-6 text-muted-foreground/20`
- **Text**: "No posts" — `text-xs text-muted-foreground/50 mt-1.5`
- The empty area is still a valid drop target

---

## Drag-and-Drop Behavior

- Uses `react-dnd` with `HTML5Backend` (already in prototype)
- **Item type**: `"POST_CARD"` — independent from `"TAB_CARD"` used in the tab reorder list above
- **Reorder within column**: Drag a post up/down within the same column. Insertion line indicator appears between sibling cards based on cursor position relative to the card midpoint.
- **Move between columns**: Drag a post from one column and drop it into another column's body area. The post is removed from the source column and inserted at the drop position in the target column.
- **Auto-expand collapsed columns**: When dragging a post over a collapsed column header, the column auto-expands after a 500ms hover delay so the user can drop into it.
- **Hover feedback**:
  - Source column: post slot shows as empty (the dragging card is "lifted out")
  - Target column body: `ring-2 ring-primary/30 ring-inset bg-primary/5` highlight
  - Insertion line between cards in target column

---

## Responsive Behavior

- **Desktop** (`lg`+): 4 columns side by side — optimal for cross-column drag
- **Tablet** (`sm`–`lg`): 2 columns × 2 rows (`grid-cols-2`) — cross-column drag still works within each row; for cross-row moves, collapsing/expanding helps
- **Mobile** (`<sm`): Single column stack (`grid-cols-1`)
  - Cross-column drag is less practical stacked vertically
  - Each post card shows a **"Move to"** action in its overflow menu for tab reassignment (always accessible, not just on hover)
  - Overflow button always visible on mobile: `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`
  - Consider `touch-action: none` on the drag handle for touch screens

---

## shadcn/ui Components Used

| Component | Usage |
|-----------|-------|
| `Separator` | Between tab reorder section and post assignment section |
| `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | Each column is a collapsible card |
| `Badge` | Post count in each column header |
| `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` | Per-post overflow menu with "Move to" submenu |
| `Button` | Overflow menu trigger, Reset / Save (existing footer) |

## Lucide Icons Used

| Icon | Usage |
|------|-------|
| `GripVertical` | Drag handle on each post card |
| `FileText` | Default post type icon |
| `MessageSquare` | Response/comment count indicator |
| `MoreHorizontal` | Overflow menu trigger |
| `ChevronDown` | Column expand/collapse |
| `Home`, `Users`, `Layers`, `BookOpen` | Tab icons in column headers and "Move to" submenu |
| `ArrowRight` | "Move to →" submenu indicator (optional) |
| `Eye` | "View Post" menu item icon (optional) |
| `XCircle` | "Remove from Tab" menu item icon (optional) |

---

## Sample Data

Use the following mock data to populate the design:

**Home column** (expanded):
- "Welcome to the Sandbox" — 1 response
- "Backlog of Insanity" — 4 responses
- "Project Kickoff Notes" — no responses

**Community column** (expanded):
- "Softmann Radio #1"
- "Supreme Funk Playlist"
- "Cosmic Bangherz"

**Subspaces column** (collapsed — empty):
- _(no posts — show empty state when expanded)_

**Knowledge column** (expanded):
- "Design Research Knowledge" — 3 items

---

## Integration Notes

- This section is **additive** — it goes below the existing tab reorder list, separated by a `Separator`
- The existing **Reset to Default** and **Save Changes** footer buttons apply to BOTH the tab order/naming AND the post assignments. One save action persists everything.
- The column order is **reactive** — if a user reorders the tabs in the section above, the columns in this section immediately reflect the new order.
- Keep the overall page scrollable; do not introduce a second scroll context within the post assignment area.
- Animations (card lift, insertion, column highlight) should use the `motion` library already in the prototype (Motion 12.x) for smooth transitions.

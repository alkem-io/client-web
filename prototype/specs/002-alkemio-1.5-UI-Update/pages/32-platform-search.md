# Page 32: Platform Search Overlay

> **Route**: Triggered from global header search icon (overlay, no route change)  
> **Access**: All authenticated users  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/platform/search/PlatformSearch.tsx`

---

## Current Layout

Full-screen or large overlay that provides cross-platform search. Includes search input, tag filters, category sidebar, and results organized by type.

```
┌─────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐│
│  │  🔍 Search Alkemio...                       [X] ││
│  ├─────────────────────────────────────────────────┤│
│  │                                                 ││
│  │  Search tags:                                   ││
│  │  [innovation ×] [climate ×] [+ Add tag]         ││
│  │                                                 ││
│  │  ┌────────────┬──────────────────────────────┐  ││
│  │  │ Categories │  Results                      │  ││
│  │  │            │                               │  ││
│  │  │ ○ All (42) │  ── Spaces (12) ───────────  │  ││
│  │  │ ○ Spaces   │  ┌──────┐ ┌──────┐ ┌──────┐ │  ││
│  │  │ ○ People   │  │Space │ │Space │ │Space │ │  ││
│  │  │ ○ Posts    │  │Card  │ │Card  │ │Card  │ │  ││
│  │  │ ○ WBs     │  └──────┘ └──────┘ └──────┘ │  ││
│  │  │            │  [See all spaces →]           │  ││
│  │  │            │                               │  ││
│  │  │            │  ── People (8) ────────────   │  ││
│  │  │            │  ┌──────┐ ┌──────┐ ┌──────┐ │  ││
│  │  │            │  │User  │ │User  │ │User  │ │  ││
│  │  │            │  │Card  │ │Card  │ │Card  │ │  ││
│  │  │            │  └──────┘ └──────┘ └──────┘ │  ││
│  │  │            │  [See all people →]           │  ││
│  │  │            │                               │  ││
│  │  │            │  ── Posts (22) ────────────   │  ││
│  │  │            │  ┌──────┐ ┌──────┐ ┌──────┐ │  ││
│  │  │            │  │Post  │ │Post  │ │Post  │ │  ││
│  │  │            │  │Card  │ │Card  │ │Card  │ │  ││
│  │  │            │  └──────┘ └──────┘ └──────┘ │  ││
│  │  │            │  [See all posts →]            │  ││
│  │  └────────────┴──────────────────────────────┘  ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Search Header**: Search input (full-width) + close button
- **Search Tags**: Tag-based filter chips with add/remove
- **Two-Column Body**: Category sidebar (left) + results pane (right)
- **Category Sidebar**: Radio-style list (All, Spaces, People, Posts, WBs) with result counts
- **Results Pane**: Sections per category, each with header, card row (3-col), "See all" link
- **Result Cards**: Type-specific cards (Space Card, User Card, Post Card)

---

## Element Inventory

### Search Header
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Search overlay | `Dialog` fullscreen / custom | `Dialog` (shadcn) fullscreen | Full overlay |
| Search input | `TextField` | `Input` (shadcn) with Lucide search icon | Auto-focused |
| Close button | `IconButton` X | `Button` variant="ghost" size="icon" | Close overlay |

### Search Tags
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Tag chip | `Chip` with delete | `Badge` (shadcn) + X button | Removable tags |
| Add tag | `Chip` / `Button` | `Button` variant="outline" size="sm" | "+ Add tag" |
| Tags row | Flex row | Tailwind `flex flex-wrap gap-2` | Wrapping |

### Category Sidebar (Left)
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Sidebar container | Custom | Tailwind `w-48 shrink-0` | Fixed-width sidebar |
| Category item | Radio / custom list | `RadioGroup` (shadcn) or styled list | Clickable category |
| Category label | `Typography` | Tailwind text | "Spaces" |
| Category count | `Typography` caption | `Badge` (shadcn) variant="secondary" | "(12)" |
| Active indicator | Custom | `RadioGroupItem` or Tailwind ring | Selected state |

### Results Pane (Right)
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Results container | Custom | Tailwind `flex-1` | Scrollable results |
| Section header | `Typography` h3 | Heading with Tailwind | "Spaces (12)" |
| Section separator | `Divider` | `Separator` (shadcn) | Between sections |
| Space result card | `ContributeCard` | `Card` (shadcn) | Same Space Card |
| User result card | Custom user card | `Card` (shadcn) | Avatar + name + role |
| Post result card | Custom post card | `Card` (shadcn) | Title + excerpt + author |
| Card row | Grid / Flex | Tailwind `grid grid-cols-3 gap-4` | 3 cards per section |
| "See all" link | Link / `Button` | `Button` variant="link" | "See all spaces →" |

### Empty / Loading States
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Loading spinner | `CircularProgress` | Lucide `Loader2` with `animate-spin` | While searching |
| No results | Custom empty state | Tailwind text-center | "No results found" |

---

## Prototype Status

❌ **NOT BUILT** — Prototype has no Platform Search overlay implementation.

**What exists:**
- `components/layout/Header.tsx` has a search input in the header (rounded-full, with icon) but it is **non-functional** — no overlay, no results, no category sidebar
- The search input is visual only; clicking/typing does not trigger any search overlay

**What needs to be built:**
- Full search overlay as described in design brief (per-page.md Page 32)
- Search input → Enter → tag-based search
- Category sidebar (Spaces/Posts/Responses/Users/Organizations)
- Results pane with per-category sections
- Per-section filters
- Scope dropdown (conditional, when inside a Space)
- Load more per section
- All empty/edge states

---

## Pull-Back Notes

- [x] **NOT BUILT — needs full implementation** from the design brief.
- [x] **Header search input exists but non-functional** — visual placeholder only.
- [x] **This is the most complex missing feature** — requires overlay container, search tags, category sidebar, results pane with 5 card types, per-section filters, scope dropdown, loading states, empty states.
- [ ] **Card types needed** — Space Card (reuse from Page 31), Post Card, Response Card, User Card (reuse from Page 03), Organization Card (reuse from Page 03/12).
- [ ] **Consider implementation priority** — this may be lower priority for 1:1 transfer since current platform has it but prototype doesn't.

---

## Allowed Improvements

- **Dialog** — shadcn Dialog with smooth fullscreen animation
- **Badge** — shadcn Badge for search tags (removable) and category counts
- **Input** — shadcn Input with integrated search icon
- **RadioGroup** — shadcn RadioGroup for category selection
- **Separator** — shadcn Separator between result sections
- **Loading** — Lucide Loader2 with spin animation

---

## Figma Make Instructions

```
You are recreating the Alkemio Platform Search Overlay using shadcn/ui components.

LAYOUT (keep exactly):
- Full-screen overlay (shadcn Dialog fullscreen)
- Search header: full-width Input with search icon + close Button
- Search tags row: removable Badge chips + "Add tag" Button
- Two-column body:
  - Left sidebar (~200px): category list (All, Spaces, People, Posts, WBs) with counts
  - Right results pane: sections per category, each with header + 3-col card grid + "See all" link

RESULT CARDS (type-specific):
- Space cards: same Card component as Dashboard/Explore (banner + avatar + name + tagline)
- User cards: Card with Avatar + name + role
- Post cards: Card with title + excerpt + author

COMPONENTS (swap to new):
- Overlay: shadcn Dialog (fullscreen)
- Search: shadcn Input with search icon
- Tags: shadcn Badge with X for removal
- Categories: shadcn RadioGroup or styled list with Badge counts
- Result cards: shadcn Card (type-specific)
- Section separators: shadcn Separator
- "See all" links: shadcn Button variant="link"
- Loading: Lucide Loader2 with animate-spin

Use the design system tokens from design-system-page.md.
```

# Page 26: Response Panel — Sliding Panel (Level 3)

> **Route**: Triggered by clicking a response card in Post Detail (Level 2)  
> **Access**: All space members  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/communication/discussion/views/ResponsePanel.tsx`

---

## Current Layout

Level 3 in the post hierarchy — the inline sliding panel that opens from the right edge when a user clicks a response card. The parent Level 2 dialog remains partially visible behind.

```
┌──────────────────────────────────────────────────────────┐
│  Level 2 Post Detail (dimmed, partially visible)         │
│  ┌──────────────────────────────┬───────────────────────┐│
│  │                              │  RESPONSE PANEL       ││
│  │  (Post Detail, shifted      │  ────────────────────  ││
│  │   left, dimmed)              │  ← Back    [X]        ││
│  │                              │                       ││
│  │                              │  "Response Title"     ││
│  │                              │  [Avatar] Author • 2d ││
│  │                              │                       ││
│  │                              │  Response body text   ││
│  │                              │  (rich text, images)  ││
│  │                              │                       ││
│  │                              │  ─── Comments (5) ──  ││
│  │                              │  [Av] User: comment   ││
│  │                              │  [Av] User: comment   ││
│  │                              │                       ││
│  │                              │  ┌──────────────────┐ ││
│  │                              │  │ Comment...  😊 ➤ │ ││
│  │                              │  └──────────────────┘ ││
│  │                              │                       ││
│  │                              │  ← Prev   3/8  Next → ││
│  └──────────────────────────────┴───────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Panel Width**: 400-500px fixed from right
- **Panel Header**: Back arrow, close button
- **Response Content**: Title, author (avatar + name + timestamp), full rich text body
- **Comments Thread**: Inline comments specific to this response
- **Comment Input**: Sticky at bottom of comments
- **Response Navigation**: Prev/Next buttons with position indicator (3/8)
- **Backdrop**: Parent Level 2 dimmed but visible

---

## Element Inventory

### Panel Chrome
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Panel container | Custom drawer / `Drawer` | `Sheet` (shadcn) side="right" | Slides from right |
| Back arrow | `IconButton` | `Button` variant="ghost" size="icon" | Return to L2 |
| Close button | `IconButton` X | `Button` variant="ghost" size="icon" | Close panel |
| Backdrop/overlay | Custom dim | Sheet overlay | Dimmed L2 behind |

### Response Content
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Response title | `Typography` h3 | Heading with Tailwind | Bold title |
| Author avatar | MUI `Avatar` | `Avatar` (shadcn) | Author photo |
| Author name | `Typography` | Tailwind text | Author name |
| Timestamp | `Typography` caption | Tailwind text-muted | "2 days ago" |
| Response body | Markdown render | Prose classes | Rich text content |
| Media attachments | `<img>` / embed | `<img>` / embed | Images, videos |

### Comments Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section header | `Typography` | Heading with Tailwind | "Comments (5)" |
| Section separator | `Divider` | `Separator` (shadcn) | Visual separation |
| Comment item | Custom | Tailwind flex row | Avatar + text |
| Comment avatar | MUI `Avatar` | `Avatar` (shadcn) | Small |
| Comment text | `Typography` | Tailwind text | Comment body |
| Reply button | `Button` / link | `Button` variant="ghost" | ↩ Reply |
| Comment input | `TextField` | `Textarea` (shadcn) | "Type your comment..." |
| Send button | `IconButton` | `Button` variant="ghost" size="icon" | Send arrow |

### Response Navigation
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Previous button | `Button` / `IconButton` | `Button` variant="outline" | "← Prev" |
| Position indicator | `Typography` | Tailwind text-muted | "3 of 8" |
| Next button | `Button` / `IconButton` | `Button` variant="outline" | "Next →" |
| Navigation bar | Custom | Tailwind flex justify-between | Sticky footer area |

---

## Prototype Status

⚠️ **NOT BUILT AS SEPARATE VARIANT** — Prototype only has `ResponseDetailDialog.tsx` (modal overlay), no sliding panel implementation.

**What exists instead:**
- `components/dialogs/ResponseDetailDialog.tsx` (270 lines) — **modal overlay only** (see Page 27)
- The sliding panel (Sheet side="right") concept from the brief is NOT implemented
- Prototype uses a fullscreen modal for all response detail viewing

**Note:** The current platform (screenshot `dialouge for viewing a response to the post (level 3).png`) may show which variant (sliding panel vs modal) is actually used. Cross-reference screenshot to determine which variant to implement.

---

## Pull-Back Notes

- [x] **Sliding panel variant NOT built** — prototype only has modal (Page 27). Must decide: build sliding panel to match current, or use modal.
- [x] **Sheet side="right" not implemented** — the brief specified shadcn Sheet, but this was not built.
- [ ] **Cross-reference screenshot** — check `dialouge for viewing a response to the post (level 3).png` to see if current uses sliding panel or modal.
- [ ] **If current uses sliding panel** — this needs to be built from scratch.
- [ ] **If current uses modal** — Page 27 covers this, and Page 26 brief may be unnecessary.

---

## Allowed Improvements

- **Sheet** — shadcn Sheet with proper slide-in animation
- **Avatar** — shadcn Avatar with fallback initials
- **Separator** — shadcn Separator for comments boundary
- **Navigation** — cleaner Prev/Next with outline buttons

---

## Figma Make Instructions

```
You are recreating the Alkemio Response Panel (Sliding Panel variant, Level 3) using shadcn/ui components.

LAYOUT (keep exactly):
- Right-side sliding panel, 400-500px wide
- Parent Level 2 post detail visible behind (dimmed)
- Panel header: back arrow + close button
- Response content: title, author (avatar + name + timestamp), rich text body
- Comments section (visually separated): comment thread + sticky comment input
- Bottom navigation bar: ← Prev | 3 of 8 | Next →

COMPONENTS (swap to new):
- Panel: shadcn Sheet side="right"
- Icons: shadcn Button variant="ghost" size="icon"
- Author: shadcn Avatar + text
- Separator: shadcn Separator
- Comments: shadcn Avatar + text + Button variant="ghost" for reply
- Comment input: shadcn Textarea + send Button
- Navigation: shadcn Button variant="outline" for Prev/Next

Use the design system tokens from design-system-page.md.
```

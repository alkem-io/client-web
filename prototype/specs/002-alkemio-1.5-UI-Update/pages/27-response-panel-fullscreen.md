# Page 27: Response Panel — Full Overlay Modal (Level 3 Alternative)

> **Route**: Alternative display for response detail (fullscreen variant)  
> **Access**: All space members  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/communication/discussion/views/ResponsePanelFullscreen.tsx`

---

## Current Layout

Level 3 alternative — a centered overlay modal instead of the sliding panel. Used when screen width is insufficient for the side panel or when full-screen mode is preferred.

```
┌────────────────────────────────────────────────────────┐
│  (Dimmed backdrop — Level 2 or page behind)            │
│                                                        │
│      ┌──────────────────────────────────────┐          │
│      │  ← Back               [Share] [X]    │          │
│      │  ────────────────────────────────────  │          │
│      │                                      │          │
│      │  "Response Title"                    │          │
│      │  [Avatar] Author Name • 2 days ago   │          │
│      │                                      │          │
│      │  Full response body text             │          │
│      │  (rich text, images, media, links)   │          │
│      │                                      │          │
│      │                                      │          │
│      │  ─── Comments (5) ────────────────   │          │
│      │  [Av] User: comment text  ↩ Reply    │          │
│      │  [Av] User: comment text  ↩ Reply    │          │
│      │  [Load more]                         │          │
│      │                                      │          │
│      │  ┌──────────────────────────┐        │          │
│      │  │ Comment here...   😊 @ ➤ │        │          │
│      │  └──────────────────────────┘        │          │
│      │                                      │          │
│      │  ← Prev        3 of 8        Next →  │          │
│      └──────────────────────────────────────┘          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Modal Width**: 700-900px centered
- **Modal Header**: Back arrow, share icon, close button
- **Response Content**: Title, author (avatar + name + timestamp), full rich text body — more horizontal space than sliding panel
- **Comments Thread**: Full-width comments specific to this response
- **Comment Input**: Sticky at bottom of scrollable area
- **Response Navigation**: Prev/Next + position indicator at bottom
- **Backdrop**: Dimmed overlay (no parent visible through)

---

## Element Inventory

### Modal Chrome
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Modal container | `Dialog` / `DialogWithGrid` | `Dialog` (shadcn) | Centered overlay |
| Backdrop | MUI backdrop | Dialog overlay | Dimmed background |
| Back arrow | `IconButton` | `Button` variant="ghost" size="icon" | Return |
| Share icon | `IconButton` | `Button` variant="ghost" size="icon" | Share |
| Close button | `IconButton` X | `Button` variant="ghost" size="icon" | Close modal |

### Response Content
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Response title | `Typography` h2 | Heading with Tailwind | Large bold title |
| Author avatar | MUI `Avatar` | `Avatar` (shadcn) | Author photo |
| Author name | `Typography` | Tailwind text | Author name |
| Timestamp | `Typography` caption | Tailwind text-muted | "2 days ago" |
| Response body | Markdown render | Prose classes | Rich text, wider |
| Media attachments | `<img>` / embed | `<img>` / embed | Images, videos |
| Tags / labels | `Chip` | `Badge` (shadcn) | Content tags |

### Comments Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section header | `Typography` | Heading with Tailwind | "Comments (5)" |
| Section separator | `Divider` | `Separator` (shadcn) | Visual separation |
| Comment item | Custom | Tailwind flex row | Avatar + text |
| Comment avatar | MUI `Avatar` | `Avatar` (shadcn) | Small |
| Comment text | `Typography` | Tailwind text | Comment body |
| Reply button | `Button` / link | `Button` variant="ghost" | ↩ Reply |
| Load more | `Button` | `Button` variant="outline" | Pagination |
| Comment input | `TextField` | `Textarea` (shadcn) | "Type your comment..." |
| Emoji picker | Custom | Popover + emoji grid | 😊 trigger |
| Mention trigger | Custom | `@` autocomplete | @ trigger |
| Send button | `IconButton` | `Button` variant="ghost" size="icon" | Send arrow |

### Response Navigation
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Previous button | `Button` / `IconButton` | `Button` variant="outline" | "← Prev" |
| Position indicator | `Typography` | Tailwind text-muted | "3 of 8" |
| Next button | `Button` / `IconButton` | `Button` variant="outline" | "Next →" |
| Navigation bar | Custom | Tailwind flex justify-between | Bottom of modal |

---

## Prototype Status

✅ **BUILT** — `components/dialogs/ResponseDetailDialog.tsx` (270 lines)

**Prototype structure:**
- **Level 3 dialog** with `z-[60]` — opens ON TOP of PostDetailDialog
- **Response navigation** — Previous/Next buttons with position indicator ("Response 3 of 8")
- **Peer responses preview strip** — horizontal scrollable list of contribution cards
- **Full content display** — whiteboard image with hover overlay + description
- **Author controls** — Edit/Delete buttons conditional on `isAuthor`
- **Comment section** — same pattern as Post Detail (Avatar + text + timestamp)
- **Sticky comment input** at bottom — Textarea + emoji + send Button
- Uses `Sonner` toast for notification actions

**shadcn components used:** Dialog, Button, Avatar, Badge, Card, Separator, Textarea, Tooltip, ScrollArea

---

## Pull-Back Notes

- [ ] **Modal overlay (z-[60])** — opens on top of PostDetailDialog. Verify this stacking matches current. Screenshot: `dialouge for viewing a response to the post (level 3).png`.
- [ ] **Response navigation (Prev/Next, "3 of 8")** — present. Verify current has this.
- [x] **Peer responses preview strip** — horizontal scrollable cards of other responses. May be enhanced vs current.
- [ ] **Author controls (Edit/Delete)** — conditional. Verify current has same conditional actions.
- [ ] **Comment section** — same pattern as Post Detail. Verify.
- [ ] **Content display** — whiteboard focus with hover overlay. Verify current shows response content similarly.

---

## Allowed Improvements

- **Dialog** — shadcn Dialog with smooth overlay animation
- **Avatar** — shadcn Avatar with fallback
- **Badge** — shadcn Badge for content tags
- **Separator** — shadcn Separator for comments boundary
- **Navigation** — outline button Prev/Next with consistent spacing

---

## Figma Make Instructions

```
You are recreating the Alkemio Response Panel (Full Overlay Modal variant, Level 3) using shadcn/ui components.

LAYOUT (keep exactly):
- Centered modal overlay, 700-900px wide
- Dimmed backdrop covering Level 2 / page
- Modal header: back arrow + share icon + close button
- Response content: title, author (avatar + name + timestamp), full rich text body
- Content tags as Badges
- Comments section (visually separated): comment thread + sticky comment input
- Bottom navigation bar: ← Prev | 3 of 8 | Next →

COMPONENTS (swap to new):
- Modal: shadcn Dialog (centered)
- Icons: shadcn Button variant="ghost" size="icon"
- Author: shadcn Avatar + text
- Tags: shadcn Badge
- Separator: shadcn Separator
- Comments: shadcn Avatar + text + Button variant="ghost" for reply
- Comment input: shadcn Textarea + emoji/mention triggers + send Button
- Navigation: shadcn Button variant="outline" for Prev/Next

Use the design system tokens from design-system-page.md.
```

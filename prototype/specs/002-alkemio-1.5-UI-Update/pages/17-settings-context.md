# Page 17: Space Settings — Layout Tab

> **Route**: `/space/[space-slug]/settings/layout`  
> **Access**: Space Facilitators, Space Admins  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Parent layout**: [15-space-settings-master.md](15-space-settings-master.md)

---

## Current Layout

The Layout tab lets facilitators customize and reorder the four main Space navigation tabs.

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR │  "Layout"                                 │
│          │  "Customize your Space's navigation tabs" │
│  About   │                                           │
│  Layout* │  ┌─────────────────────────────────┐      │
│  ...     │  │ ⋮⋮ 🏠 Home          (1st)  ✏️  │      │
│          │  └─────────────────────────────────┘      │
│          │  ┌─────────────────────────────────┐      │
│          │  │ ⋮⋮ 👥 Community      (2nd)  ✏️  │      │
│          │  └─────────────────────────────────┘      │
│          │  ┌─────────────────────────────────┐      │
│          │  │ ⋮⋮ 📁 Subspaces      (3rd)  ✏️  │      │
│          │  └─────────────────────────────────┘      │
│          │  ┌─────────────────────────────────┐      │
│          │  │ ⋮⋮ 📚 Knowledge Base  (4th)  ✏️  │      │
│          │  └─────────────────────────────────┘      │
│          │                                           │
│          │  [RESET TO DEFAULT]      [SAVE CHANGES]   │
└──────────┴───────────────────────────────────────────┘
```

### Key structural elements:
- **Shell**: Within Space Settings master layout
- **Instructional text**: Title + description
- **4 Draggable Tab Cards**: Vertical stack, each with drag handle, icon, name, position, edit button
- **Drag-and-Drop**: Reorder tabs by dragging
- **Inline Edit**: Rename tabs via pencil icon or click
- **Footer**: Reset to Default + Save Changes buttons

---

## Element Inventory

### Draggable Tab Cards
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Tab card | Custom card / `Paper` | `Card` (shadcn) | Draggable card |
| Drag handle | Custom icon ⋮⋮ | Lucide `GripVertical` icon | Left side |
| Tab icon | MUI icon | Lucide icon | 🏠 👥 📁 📚 |
| Tab name | `Typography` | Heading with Tailwind | Editable inline |
| Position label | `Typography` caption | Tailwind text-muted | "(1st)", "(2nd)" etc. |
| Edit button | `IconButton` pencil | `Button` variant="ghost" size="icon" | Pencil icon |
| Card container | Custom vertical list | Tailwind `flex flex-col gap-3` | Vertical stack |

### Actions
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Reset button | `Button` secondary | `Button` variant="outline" | "RESET TO DEFAULT" |
| Save button | `Button` primary | `Button` variant="default" | "SAVE CHANGES" |

---

## Prototype Status

✅ **BUILT** — `components/space/SpaceSettingsLayout.tsx` (464 lines)

**Prototype structure:**
- **NEW FEATURE — Drag-and-drop tab reordering** using react-dnd with HTML5 backend
- Inline rename for tab labels
- Icon picker popover with 24 Lucide icons per tab
- Reset to defaults button
- Save state management

**shadcn components used:** Card, Input, Button, Popover

---

## Pull-Back Notes

- [x] **This is an ENTIRELY NEW feature** — current platform does NOT have a "Layout" settings tab with drag-and-drop tab reordering. Current has a "Context" tab for editing space context text.
- [x] **Drag-and-drop (react-dnd)** — new capability not in current platform.
- [x] **Icon picker** — new capability not in current platform.
- [x] **Tab reordering** — new capability not in current platform.
- [x] **Must decide**: either pull back to simple Context editor matching current, or keep as allowed improvement. Recommend marking as enhancement.

---

## Allowed Improvements

- **Drag handle icon** — Lucide GripVertical is cleaner
- **Card styling** — shadcn Card with hover/lift states
- **Button consistency** — shadcn Button variants

---

## Figma Make Instructions

```
You are recreating the Space Settings Layout Tab using shadcn/ui components.

LAYOUT: Within Space Settings master layout (Page 15).

CONTENT (keep exactly):
- Title: "Layout" + instructional text
- 4 draggable tab cards in vertical stack:
  1. Home (with icon, position "1st", edit pencil)
  2. Community
  3. Subspaces
  4. Knowledge Base
- Footer: Reset to Default (left) + Save Changes (right)

COMPONENTS:
- Tab cards: shadcn Card with drag handle (Lucide GripVertical), icon, name, position text, edit Button
- Drag handle: Lucide GripVertical icon
- Edit: shadcn Button variant="ghost" size="icon" (pencil)
- Reset: shadcn Button variant="outline"
- Save: shadcn Button variant="default"

Use the design system tokens from design-system-page.md.
```

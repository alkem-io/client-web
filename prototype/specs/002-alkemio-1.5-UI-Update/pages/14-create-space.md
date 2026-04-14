# Page 14: Create a New Space (Modal)

> **Route**: Triggered from Dashboard "Create my own Space" button or sidebar  
> **Access**: Space creators (Facilitators, Portfolio Owners)  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/journey/space/createSpace/` dialogs

---

## Current Layout

The "Create a new Space" modal is where users set up a new space with identity, URL, and visual branding.

```
┌─────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐│
│  │  "Create a new Space"         [CHANGE TEMPLATE] ││
│  │                                           [X]   ││
│  ├─────────────────────────────────────────────────┤│
│  │                                                 ││
│  │  Title:     [________________________]          ││
│  │  URL:       [https://alkem.io/______]           ││
│  │  Tagline:   [________________________]          ││
│  │  Tags:      [tag1] [tag2] [+ add]               ││
│  │                                                 ││
│  │  Page Banner (1536 × 256px):                    ││
│  │  ┌────────────────────────────────────┐         ││
│  │  │  [UPLOAD] or drag & drop           │         ││
│  │  └────────────────────────────────────┘         ││
│  │                                                 ││
│  │  Card Banner (416 × 256px):                     ││
│  │  ┌──────────────────┐                           ││
│  │  │  [UPLOAD]         │                           ││
│  │  └──────────────────┘                           ││
│  │                                                 ││
│  │  ☐ Add Tutorials to this Space                  ││
│  │  ☐ I have read and accept the terms             ││
│  │    (click here to open them)                    ││
│  │                                                 ││
│  ├─────────────────────────────────────────────────┤│
│  │  [CANCEL]                          [CREATE]     ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Modal**: Centered, ~600-800px width, dark overlay
- **Header**: Title + optional "CHANGE TEMPLATE" button + close X
- **Form Fields**: Title, URL, Tagline, Tags
- **Image Uploads**: Page Banner (1536×256) + Card Banner (416×256)
- **Checkboxes**: Add Tutorials + Accept Terms
- **Footer**: Cancel + Create buttons

---

## Element Inventory

### Modal Structure
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Modal | `DialogWithGrid` | `Dialog` (shadcn) | Centered, ~600-800px |
| Header | Custom | `DialogHeader` + `DialogTitle` | Title + template button |
| Close button | `IconButton` X | `DialogClose` | Top-right |
| Footer | Custom | `DialogFooter` | Cancel + Create |
| Overlay | MUI Backdrop | `DialogOverlay` | Dark semi-transparent |

### Form Fields
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Title input | `TextField` / Formik | `Input` (shadcn) + `Label` | Required |
| URL input | `TextField` / Formik | `Input` (shadcn) + `Label` | URL slug, auto-generated |
| Tagline input | `TextField` | `Input` (shadcn) + `Label` | Optional |
| Tags input | Custom tag input | Pills + `Input` | Comma-separated pills |
| Help text per field | `Typography` helper | Tailwind text-muted small | Below each input |
| Info icon | `Tooltip` + icon | `Tooltip` (shadcn) + Lucide info | On tags field |

### Image Upload Sections
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Page Banner upload | Custom upload zone | Custom drag-and-drop with Tailwind | 1536×256px |
| Card Banner upload | Custom upload zone | Custom drag-and-drop with Tailwind | 416×256px |
| Upload button | `Button` | `Button` variant="outline" | "UPLOAD" |
| Preview area | `<img>` preview | `<img>` with Tailwind | Shows uploaded image |
| Help text | `Typography` | Tailwind text-muted | Resolution/usage help |

### Checkboxes & Actions
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Add Tutorials | `Checkbox` | `Checkbox` (shadcn) + label | Optional |
| Accept Terms | `Checkbox` | `Checkbox` (shadcn) + label | Required, link to terms |
| Terms link | `Typography` link | Tailwind link | Opens in new window |
| Cancel button | `Button` secondary | `Button` variant="outline" | Left-aligned |
| Create button | `Button` primary | `Button` variant="default" | Right-aligned, disabled until valid |
| Change Template | `Button` | `Button` variant="ghost" | Top-right, optional |

---

## Prototype Status

✅ **BUILT** — `pages/CreateSpaceSelectionPage.tsx` (74 lines) + `pages/CreateSpaceChatPage.tsx` (831 lines) + `components/dialogs/CreateSpaceDialog.tsx` (130 lines)

**Prototype structure:**
- **Selection Page** — centered layout with two option cards:
  - Card 1: "Use Form" → opens CreateSpaceDialog modal
  - Card 2: "Guided Creation" (featured, with "New" Badge + Sparkles icon) → navigates to `/create-space/chat`
- **CreateSpaceDialog** — 3-view state machine: selection → chat OR form. Delegates to sub-components.
- **CreateSpaceChatPage** — **831-line AI-guided wizard**: full-screen chat interface with 10-step flow (purpose → audience → workflow → subspaces → templates → banner → tags → tutorials → terms → review). Live preview sidebar on desktop. Summary/review view at end.

**shadcn components used:** Card, Button, Badge, Dialog, Input, Progress, Select, Switch, Avatar, Separator, Label, Textarea

---

## Pull-Back Notes

- [x] **Selection page with two options is NEW** — current platform has a simple "Create Space" dialog only (screenshot `create a space dialouge.png`). The selection page + AI chat wizard are enhancements.
- [x] **AI-guided chat wizard (831 lines)** — entirely new feature. Not in current platform. Mark as enhancement, do not pull back (keep for redesign value).
- [x] **CreateSpaceDialog** — this IS the pull-back target. Verify the form view within CreateSpaceDialog matches the current dialog.
- [ ] **Form dialog fields** — verify name, description, tags, visibility match current create space form.
- [x] **"Guided Creation" option** — new. Keep as allowed improvement but don't prioritize for 1:1 match.

---

## Allowed Improvements

- **Dialog styling** — shadcn Dialog with better overlay and animation
- **Checkbox styling** — shadcn Checkbox is more refined
- **Input validation** — shadcn form fields with inline validation feedback
- **Upload zones** — can be slightly improved with better drag-and-drop affordance
- **Tooltip** — shadcn Tooltip for info icons

---

## Figma Make Instructions

```
You are recreating the Alkemio Create Space Modal using shadcn/ui components.

LAYOUT (keep exactly):
- Centered modal (~600-800px width) with dark overlay
- Header: "Create a new Space" + optional "CHANGE TEMPLATE" button + close X
- Form: Title → URL → Tagline → Tags
- Image uploads: Page Banner (1536×256) + Card Banner (416×256)
- Checkboxes: Add Tutorials + Accept Terms (with link)
- Footer: Cancel (left) + Create (right)

COMPONENTS (swap to new):
- Modal: shadcn Dialog with header, content, footer
- Text fields: shadcn Input + Label + help text
- Tags: pill-style input
- Image uploads: drag-and-drop zones with shadcn Button "UPLOAD"
- Checkboxes: shadcn Checkbox + label text
- Tooltip: shadcn Tooltip for info icons
- Cancel: shadcn Button variant="outline"
- Create: shadcn Button variant="default" (disabled until valid)
- Change Template: shadcn Button variant="ghost"

Use the design system tokens from design-system-page.md.
```

# Page 6: Add Post Modal

> **Route**: Triggered from Space Home or Subspace pages  
> **Access**: Space members with post creation permission  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/communication/discussion/views/` + post creation dialogs

---

## Current Layout

The Add Post dialog is a large modal where users create posts within a space or subspace.

```
┌─────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐│
│  │  "Create a Post"                         [X]   ││
│  ├─────────────────────────────────────────────────┤│
│  │                                                 ││
│  │  Title:  [________________________]             ││
│  │                                                 ││
│  │  Tags:   [tag1] [tag2] [+ add]                  ││
│  │                                                 ││
│  │  Description:                                   ││
│  │  ┌─────────────────────────────────────────┐    ││
│  │  │ B  I  U  H  List  Link  Quote  Code     │    ││
│  │  ├─────────────────────────────────────────┤    ││
│  │  │                                         │    ││
│  │  │  Rich text editor area                  │    ││
│  │  │                                         │    ││
│  │  └─────────────────────────────────────────┘    ││
│  │                                                 ││
│  │  Additional Content: [Whiteboard ▾] [Collection]││
│  │  References:  [link input]                      ││
│  │                                                 ││
│  │  ▸ Response Options (expandable)                ││
│  │    ☐ Allow comments                             ││
│  │    ☐ Allow collections   Type: [Links ▾]        ││
│  │                                                 ││
│  │  Template: [Brainstorm ▾] [Decision] [Custom]   ││
│  │                                                 ││
│  ├─────────────────────────────────────────────────┤│
│  │  [Cancel]                            [Post]     ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Large centered modal** with dark overlay
- **Form flow**: Title → Tags → Description (rich text) → Additional Content → References → Response Options → Template
- **Rich text editor** with formatting toolbar
- **Template selector**: Pill buttons or dropdown for templates
- **Response options**: Expandable section with toggles
- **Sticky footer**: Cancel + Post buttons

---

## Element Inventory

### Modal Structure
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Modal container | `DialogWithGrid` | `Dialog` (shadcn) | Large, centered |
| Modal header | Custom header | `DialogHeader` + `DialogTitle` | Title + close button |
| Close button | `IconButton` X | `DialogClose` or Button ghost | Top-right X |
| Dark overlay | MUI Backdrop | `DialogOverlay` (shadcn) | Semi-transparent |
| Sticky footer | Custom footer | `DialogFooter` | Action buttons |

### Form Fields
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Title input | `TextField` / Formik | `Input` (shadcn) | Required |
| Tags input | Custom tag input | Custom pills + `Input` | Comma-separated or pill-style |
| Description editor | `MarkdownEditor` (custom) | Keep rich text editor | Complex component — minimal restyle |
| Editor toolbar | Custom toolbar | Keep as-is or restyle buttons | B, I, U, H, List, Link, Quote, Code |
| Content selector | `Select` / buttons | `Select` (shadcn) or `ToggleGroup` | Whiteboard, Collection, etc. |
| References input | `TextField` + add button | `Input` (shadcn) + `Button` | URL input |

### Response Options (Expandable)
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section toggle | `Accordion` / custom | `Collapsible` (shadcn) | Expandable section |
| Comments toggle | `Switch` / `Checkbox` | `Switch` (shadcn) | Allow/disallow comments |
| Collections toggle | `Switch` / `Checkbox` | `Switch` (shadcn) | Allow members to add items |
| Collection type | `Select` | `Select` (shadcn) | Links, Posts, Memos, Whiteboards |

### Template Selection
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Template pills | Custom buttons / `Chip` | `ToggleGroup` (shadcn) | Brainstorm, Decision, Announcement, etc. |
| Template dropdown | `Select` | `Select` (shadcn) | Alternative template selector |

### Action Buttons
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Cancel button | `Button` secondary | `Button` variant="outline" | Left-aligned |
| Post button | `Button` primary | `Button` variant="default" | Right-aligned, primary |
| Save Draft | `Button` secondary | `Button` variant="ghost" | Optional |

---

## Prototype Status

✅ **BUILT** — `components/space/AddPostModal.tsx`

**Prototype structure:**
- Large compose dialog (`max-w-3xl max-h-[90vh]`)
- Title input styled as borderless heading
- Custom MarkdownEditor for body content
- Attachment toggles: Whiteboard, Memo, Call to Action, Image — with conditional editors
- Collapsible settings section with Tags input, Allow Comments switch, Collection Type selector
- Footer: Save Draft + Post buttons

**shadcn components used:** Dialog, Button, Input, Badge, Select, Separator, Switch, Collapsible, Popover, Textarea, Tooltip, Checkbox, Label, DropdownMenu

---

## Pull-Back Notes

- [ ] **Dialog size** — `max-w-3xl` is close to current. Verify against screenshot (`add post .png`).
- [x] **Attachment toggles (WB/Memo/CTA/Image)** — current modal may have simpler attachment options. Verify.
- [x] **Collapsible settings** — current may show settings inline, not collapsible. Verify.
- [ ] **MarkdownEditor** — current uses a rich text editor. MarkdownEditor is a reasonable swap.
- [x] **"Save Draft" button** — current may not have draft saving. Verify.
- [ ] **Title as borderless heading** — matches current post creation style.

---

## Allowed Improvements

- **Cleaner dialog** — shadcn Dialog has better overlay and animation
- **Toggle switches** — shadcn Switch for response options is cleaner than MUI
- **Template pills** — shadcn ToggleGroup provides better toggle styling
- **Button styling** — shadcn Button variants (outline/ghost/default) are more consistent
- **Collapsible** — shadcn Collapsible for response options is smoother

---

## Figma Make Instructions

```
You are recreating the Alkemio Add Post Modal using shadcn/ui components.

LAYOUT (keep exactly):
- Large centered modal (~600-800px width) with dark overlay
- Form flow: Title → Tags → Description (rich text) → Additional Content → References → Response Options → Template
- Rich text editor with formatting toolbar
- Expandable Response Options section
- Sticky footer: Cancel (left) + Post (right)

COMPONENTS (swap to new):
- Modal: shadcn Dialog with DialogHeader, DialogContent, DialogFooter
- Text fields: shadcn Input
- Tags: pill-style custom input
- Rich text editor: keep as complex component (minimal restyle)
- Content selector: shadcn Select or ToggleGroup
- Response options: shadcn Collapsible + Switch toggles
- Template selector: shadcn ToggleGroup (pill buttons)
- Cancel: shadcn Button variant="outline"
- Post: shadcn Button variant="default" (primary)

CONTENT (keep current):
- Title, Tags, Description fields
- Additional content types: Whiteboard, Collection
- Response options: Comments toggle, Collections toggle + type
- Templates: Brainstorm, Decision, Announcement, Feedback/Survey

Use the design system tokens from design-system-page.md.
```

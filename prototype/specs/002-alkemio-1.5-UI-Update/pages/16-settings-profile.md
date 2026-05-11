# Page 16: Space Settings — About Tab

> **Route**: `/space/[space-slug]/settings/about`  
> **Access**: Space Facilitators, Space Admins  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Parent layout**: [15-space-settings-master.md](15-space-settings-master.md)

---

## Current Layout

The About tab defines the space's identity through structured sections: What, Why, and Who.

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR │  "About"                                  │
│          │  "Define your space's purpose..."         │
│  About*  │                                           │
│  Layout  │  Page Banner (1536×256px):                │
│  ...     │  ┌──────────────────────────────┐         │
│          │  │ [Current banner / UPLOAD]     │         │
│          │  └──────────────────────────────┘         │
│          │                                           │
│          │  Card Banner (416×256px):                 │
│          │  ┌──────────────┐                         │
│          │  │ [UPLOAD]      │                         │
│          │  └──────────────┘                         │
│          │                                           │
│          │  What:                                    │
│          │  ┌────────────────────────────┐           │
│          │  │ B I U H List Link Quote    │           │
│          │  │ Rich text editor           │           │
│          │  └────────────────────────────┘           │
│          │                                           │
│          │  Why: [rich text editor]                  │
│          │  Who: [rich text editor]                  │
│          │                                           │
│          │  Tags: [tag1] [tag2] [+ add]              │
│          │  References: [Title] [URL] [+ Add]        │
│          │                                           │
│          │  [Auto-save indicator: "Saved ✓"]         │
└──────────┴───────────────────────────────────────────┘
```

### Key structural elements:
- **Shell**: Within Space Settings master layout (sidebar left)
- **Page header**: Title "About" + instructional text
- **Image uploads**: Page Banner + Card Banner with upload zones
- **Three rich text sections**: What, Why, Who — each with editor toolbar
- **Tags**: Pill-style tag input
- **References**: Repeating Title + URL fields + "Add Reference"
- **Auto-save**: Changes auto-save after 1-2 seconds

---

## Element Inventory

### Image Uploads
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Page Banner zone | Custom upload | Drag-and-drop with Tailwind | 1536×256px |
| Card Banner zone | Custom upload | Drag-and-drop with Tailwind | 416×256px |
| Upload button | `Button` | `Button` variant="outline" | "UPLOAD" / "CHANGE" |
| Preview | `<img>` | `<img>` with Tailwind | Current banner preview |

### Rich Text Sections
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| What editor | `MarkdownEditor` | Keep rich text editor | Complex — minimal restyle |
| Why editor | `MarkdownEditor` | Keep rich text editor | Same component |
| Who editor | `MarkdownEditor` | Keep rich text editor | Same component |
| Section labels | `Typography` | `Label` (shadcn) or Tailwind | "What", "Why", "Who" |
| Help text | `Typography` helper | Tailwind text-muted | Per section |

### Tags & References
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Tags input | Custom tag input | Pills + `Input` | Comma-separated |
| Reference title | `TextField` | `Input` (shadcn) | Title field |
| Reference URL | `TextField` | `Input` (shadcn) | URL field |
| Add Reference | `Button` | `Button` variant="outline" | "+ Add Reference" |

### Auto-save
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Save indicator | Custom text | Tailwind text-muted + animation | "Saving..." / "Saved ✓" |

---

## Prototype Status

✅ **BUILT** — `components/space/SpaceSettingsAbout.tsx` (300 lines)

**Prototype structure:**
- 3-column grid (2:1 ratio) — form fields left, live preview card right
- Rich text editors (ReactQuill) for description fields
- Image upload areas with hover overlays for banner and card images
- Tag input chip system (add/remove tags)
- References list with add/remove
- Live preview card on right showing SpaceCard as it would appear

**shadcn components used:** Card, Input, Button, Badge

---

## Pull-Back Notes

- [ ] **3-column grid with live preview** — current About tab likely has form + preview pattern. Verify layout.
- [ ] **ReactQuill rich text editors** — current uses similar editors. Acceptable.
- [ ] **Image upload areas** — current has banner/card image uploads. Verify UI pattern.
- [ ] **Tag chip system** — current has tag management. Verify.
- [ ] **Live SpaceCard preview** — this is a KEY feature (same card shown on Browse All Spaces). Verify current has this.

---

## Allowed Improvements

- **Upload zones** — cleaner drag-and-drop affordance with Tailwind
- **Label styling** — shadcn Label is more consistent
- **Help text** — better visual hierarchy with Tailwind text-muted

---

## Figma Make Instructions

```
You are recreating the Space Settings About Tab using shadcn/ui components.

LAYOUT: Within Space Settings master layout (Page 15). Content fills the main area.

CONTENT (keep exactly):
- Title: "About" + instructional text
- Page Banner upload (1536×256px) + Card Banner upload (416×256px)
- Three rich text sections: What, Why, Who (each with editor toolbar)
- Tags input (pill-style)
- References section (repeating Title + URL + "Add Reference")
- Auto-save indicator

COMPONENTS (swap to new):
- Upload zones: drag-and-drop with shadcn Button "UPLOAD"
- Rich text editors: keep as-is (complex component)
- Labels: shadcn Label or Tailwind
- Tags: pill input
- Inputs: shadcn Input for references
- Button: shadcn Button variant="outline" for Add Reference

Use the design system tokens from design-system-page.md.
```

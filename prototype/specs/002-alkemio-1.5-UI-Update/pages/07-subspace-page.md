# Page 7: Subspace Page (Individual Subspace)

> **Route**: `/{space-slug}/challenges/{subspace-slug}`  
> **Access**: Subspace members  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/journey/subspace/layout/SubspacePageLayout.tsx`

---

## Current Layout

The Subspace Page is a focused collaboration area, similar to Space Home but for a specific subspace (e.g., "Designing Alkemio" challenge).

```
┌──────────────────────────────────────────────────────────┐
│  Top Navigation Bar                                      │
├──────────────────────────────────────────────────────────┤
│  Subspace Banner (full-width image + title + description)│
│  ← Back to [Space Name]                                 │
│  [Member avatars]  [search] [open] [settings] [share]   │
├──────────────────────────────────────────────────────────┤
│  Channel Tabs (pills): CHANNEL 1 | CHANNEL 2 | CHANNEL 3│
├─────────────┬────────────────────────────────────────────┤
│ Left        │  Activity Feed (filtered by channel)       │
│ Sidebar     │                                            │
│             │  ┌──────────────────────────────────┐      │
│ - Desc      │  │ Post Card (like Space Home)      │      │
│ - About     │  │ Author, title, content, responses│      │
│ - Collapse  │  └──────────────────────────────────┘      │
│             │                                            │
│             │  ┌──────────────────────────────────┐      │
│             │  │ Post Card 2                       │      │
│             │  └──────────────────────────────────┘      │
│             │                                            │
│             │  [+ Add Post]           [Show more]        │
└─────────────┴────────────────────────────────────────────┘
```

### Key structural elements:
- **Subspace Banner**: Large background image, subspace title, description, breadcrumb ("Back to [Space Name]")
- **Member Avatars**: Inline member avatars on the banner
- **Utility Icons**: Search, open, settings, share (right side of banner)
- **Channel Tabs**: Horizontal pill buttons for channels (filters activity feed)
- **Left Sidebar**: Description callout, About button, collapse control
- **Activity Feed**: Same post card structure as Space Home, filtered by selected channel

---

## Element Inventory

### Subspace Banner
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Banner container | Custom layout | `div` + Tailwind with bg-image | Full-width, image overlay |
| Subspace title | `Typography` heading | Heading with Tailwind | Subspace name |
| Description | `Typography` body | Tailwind body text | Subtitle |
| Breadcrumb | Link / `Breadcrumbs` | `Breadcrumb` (shadcn) or text link | "← Back to [Space Name]" |
| Member avatars | `AvatarGroup` / custom | Stacked `Avatar` (shadcn) | Inline on banner |
| Utility icons | `IconButton` group | `Button` variant="ghost" size="icon" | Search, open, settings, share |
| Background image | `<img>` with overlay | CSS `bg-cover` + overlay div | Semi-transparent dark overlay |

### Channel Tabs
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Tab container | Custom pill buttons | `ToggleGroup` (shadcn) or `Tabs` | Horizontal pills |
| Channel tab | Custom button / `Chip` | `ToggleGroupItem` or `TabsTrigger` | Channel names |
| Active indicator | Custom styling | Active variant styling | Highlighted background |
| Unread badge | `Badge` | `Badge` (shadcn) | Optional unread count |

### Left Sidebar
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Description callout | Custom box | `Card` (shadcn) | Challenge statement |
| About button | `Button` | `Button` variant="outline" | Opens subspace info |
| Collapse control | Toggle | `Button` variant="ghost" + `Collapsible` | Expand/collapse |

### Activity Feed
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Post cards | Same as Space Home | `Card` (shadcn) | Identical post card component |
| "Add Post" button | `Button` | `Button` variant="default" | Top-right of feed |
| "Show more" | `Button` | `Button` variant="outline" | Pagination |

---

## Prototype Status

✅ **BUILT** — `pages/SubspacePage.tsx` + `components/space/SubspaceHeader.tsx`, `SubspaceSidebar.tsx`, `ChannelTabs.tsx`

**Prototype structure:**
- `SubspaceHeader` — same hero banner pattern as SpaceHeader (320px, bg image, overlay), back breadcrumb to parent space, utility buttons (Search/Maximize/Settings/Share), title + description + member avatars
- `SubspaceSidebar` — collapsible (80→12 width), challenge statement card, quick action buttons, "About this Subspace" section
- `ChannelTabs` — pill-style tabs with optional count badges (All Activity/Strategy Docs/Municipal Data/Policy Drafts/Stakeholders)
- Content: `SpaceFeed` constrained to `max-w-3xl`
- No chat variants on subspace page

**shadcn components used:** Card, Badge, Avatar, Button, Tooltip (in sub-components)

---

## Pull-Back Notes

- [x] **SubspaceSidebar may need REMOVAL or simplification** — current subspace page layout may not have a collapsible sidebar. Verify against current platform.
- [x] **ChannelTabs (pill-style)** — current subspace may have different tab structure. These appear to be innovation flow stages, verify naming.
- [ ] **SubspaceHeader** — back breadcrumb and banner pattern match current. Verify action buttons.
- [ ] **SpaceFeed max-w-3xl** — content width constraint is reasonable.
- [x] **Quick action buttons** — "Project Docs", "Team Roster", "Schedule" in sidebar are new. Verify if current has these.

---

## Allowed Improvements

- **Better channel pills** — shadcn ToggleGroup or Tabs with rounded pill styling
- **Cleaner banner overlay** — Tailwind gradient overlay more precise than MUI
- **Avatar stacking** — shadcn Avatar overlap styling for member row
- **Breadcrumb** — shadcn Breadcrumb is more semantic than a plain link
- **Post cards** — same improvements as Space Home (cleaner Card, better shadows)

---

## Figma Make Instructions

```
You are recreating the Alkemio Subspace Page using shadcn/ui components.

LAYOUT (keep exactly):
- Full-width subspace banner (background image + title + description + breadcrumb)
- Member avatars inline on banner + utility icons right side
- Horizontal channel tabs (pill buttons) below banner
- Two-column layout below tabs:
  - Left sidebar (~250px): Description callout, About button, collapse
  - Main content area: Activity feed (same post cards as Space Home)

COMPONENTS (swap to new):
- Banner: div with bg-image + Tailwind overlay
- Breadcrumb: shadcn Breadcrumb or text link "← Back to [Space Name]"
- Member avatars: shadcn Avatar (stacked row)
- Utility icons: shadcn Button variant="ghost" size="icon"
- Channel tabs: shadcn ToggleGroup (pill style) or Tabs
- Post cards: shadcn Card (same as Space Home Page 2)
- Sidebar callout: shadcn Card
- Add Post: shadcn Button (primary)

CONTENT (keep current):
- Subspace banner with title, description, breadcrumb
- Channel tab names specific to the subspace
- Activity feed with post cards (same structure as Space Home)
- Left sidebar: description, about, collapse

Use the design system tokens from design-system-page.md.
```

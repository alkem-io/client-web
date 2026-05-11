# Page 2: Space Home

> **Route**: `/space/[space-slug]`  
> **Access**: Space members (Contributors, Facilitators)  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage.tsx`

---

## Current Layout

The Space Home is the most important page in the platform — it's where collaboration happens.

```
┌──────────────────────────────────────────────────────────┐
│  Top Navigation Bar                                      │
├──────────────────────────────────────────────────────────┤
│  Space Banner (full-width image + title + tagline)       │
├──────────────────────────────────────────────────────────┤
│  Tab Bar: HOME | COMMUNITY | SUBSPACES | KB  [icons]    │
├─────────────┬────────────────────────────────────────────┤
│ Left        │  Activity Feed / Posts                     │
│ Sidebar     │                                            │
│             │  ┌──────────────────────────────────┐      │
│ - Welcome   │  │ Post Card (title, author, body)  │      │
│ - Channels  │  │ [Embedded Whiteboard / Collection]│      │
│ - About     │  │ Response area (comments)          │      │
│ - Subspaces │  └──────────────────────────────────┘      │
│ - Events    │                                            │
│             │  ┌──────────────────────────────────┐      │
│             │  │ Post Card 2                       │      │
│             │  └──────────────────────────────────┘      │
│             │                                            │
│             │  [+ Add Post]           [Show more]        │
└─────────────┴────────────────────────────────────────────┘
```

### Key structural elements:
- **Space Banner**: Full-width image with dark overlay, space title + tagline overlaid, Alkemio logo badges (top-left), "POWERED BY ALKEMIO" badge (top-right), green icon badge (left below banner top)
- **Top Navigation Bar**: Same header as Dashboard — Search, Messaging, Notifications, Spaces Grid, Profile Avatar with "Beta" badge
- **Tab Bar**: HOME (active, underlined), COMMUNITY, WORKSPACES, KNOWLEDGE + right-side utility icons (clock/activity, video, bell, share, settings gear)
- **Left Sidebar** (~280px):
  - Space description card (teal/dark accent bg): space description text + "Read more" link + space lead avatar + name + location
  - "ABOUT THIS SPACE" button (full-width, outlined with info icon)
  - Subspaces list: header (space name abbreviated + settings gear icon), subspace items with colored avatar + name (e.g. Lux-Lab, Communications House, User Story Persona's)
  - Events section: header + expand icon, status message ("Since there are no events..."), "Show calendar" link + green "+" add button
- **Main Content Area**: "+ POST" button (full-width, centered at top). Vertical stack of post cards — each with: title, author name + timestamp + ⋮ more menu, body text, inline comment input (emoji picker + @ mention + text field + send arrow). Posts with replies show them inline (avatar + name + text + time + copy icon, "Reply" link).
- **Footer**: Same as Dashboard

---

## Element Inventory

### Space Banner
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Banner container | `SpacePageBanner` custom | `div` + Tailwind with bg-image | Full-width, image overlay |
| Space title | `Typography` h3/h4 | Heading with Tailwind | Space name |
| Tagline | `Typography` body | Tailwind body class | Space description |
| Background image | `<img>` with overlay | CSS `bg-cover` + overlay div | Semi-transparent dark overlay for text |

### Tab Bar
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Tab container | `HeaderNavigationTabs` | `Tabs` + `TabsList` (shadcn) | Horizontal tab bar |
| Tab items | `HeaderNavigationTab` | `TabsTrigger` (shadcn) | HOME, COMMUNITY, SUBSPACES, KB |
| Utility icons | `IconButton` | `Button` variant="ghost" size="icon" | Activity, video, share, settings |
| Settings icon | `IconButton` (admin only) | `Button` variant="ghost" size="icon" | Only visible to admins |

### Left Sidebar
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Description card | Custom callout (teal bg) | `Card` with accent background | Space description + "Read more" link |
| Lead avatar + info | `Avatar` + text | `Avatar` (shadcn) + name + location | Space lead displayed in description card |
| "ABOUT THIS SPACE" button | `Button` with info icon | `Button` variant="outline" + Lucide `Info` icon | Full-width, opens space about |
| Subspaces header | Space name + gear icon | Heading + `Button` variant="ghost" size="icon" | Abbreviated space name, settings gear |
| Subspace list items | Custom list | `Avatar` (colored) + subspace name | Each subspace with colored avatar |
| Events section header | Custom header + expand icon | Heading + `Button` variant="ghost" size="icon" | "Events" + expand/collapse |
| Events empty state | Text message | Muted text | "Since there are no events, this block is only visible for admins and leads" |
| "Show calendar" link | Link text | `Button` variant="link" + Lucide `Calendar` icon | Navigate to calendar view |
| "+ Add event" button | FAB / icon button | Green circular `Button` + Lucide `Plus` | Add new event |

### Activity Feed (Main Content)
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| "+ POST" button | `Button` (full-width, centered) | `Button` variant="outline" full-width + Lucide `Plus` | Top of feed area, centered text |
| Post card | Custom post component | `Card` + sections | Large, readable cards |
| Post title | `Typography` heading | Heading with Tailwind | Post title (clickable) |
| Post author + timestamp | `Avatar` + text + time | `Avatar` (shadcn) + name + relative time + `DropdownMenu` (⋮) | Author right-aligned with timestamp + more menu |
| Post body | Markdown render | Markdown with prose classes | Rich text content |
| Inline comment input | Custom input row | `Avatar` + emoji button + @ button + `Input` + send `Button` | "Type your comment here" with emoji/mention/send |
| Reply thread | Custom thread | Inline list: `Avatar` + name + text + time + copy icon | Shows replies inline below post, with "Reply" link |
| Embedded whiteboard | Custom preview | Image/canvas thumbnail | Preview of whiteboard content |
| Collection grid | Custom grid | CSS grid (2x2) with `Card` items | Mini-grid preview (up to 4 items) |
| "Show more" button | `Button` | `Button` variant="outline" | Pagination |

---

## Prototype Status

✅ **BUILT** — `pages/SpaceHome.tsx` + `components/space/SpaceHeader.tsx`, `SpaceSidebar.tsx`, `SpaceNavigationTabs.tsx`, `SpaceFeed.tsx`, `PostCard.tsx`

**Prototype structure:**
- `SpaceHeader` — full-width hero banner (320px) with bg image + dark overlay, top action bar (settings/share/video/chat), space title + description + member avatar stack
- `SpaceSidebar` — welcome callout card + subspaces quick-list + sticky positioning
- `SpaceNavigationTabs` — horizontal tab bar with `border-b-2 border-primary` active indicator (Home/Community/Subspaces/KB + conditional Chat tab)
- `SpaceFeed` — list of `PostCard` components (4 post types: post/whiteboard/collection/memo) with hover lift
- Chat variants A/B/C/D/E conditionally rendered

**shadcn components used:** Card, Badge, Avatar, Button, Tooltip (in sub-components)

---

## Pull-Back Notes

- [x] **SpaceSidebar EXISTS but CONTENT DIFFERS** — current platform DOES have a left sidebar. However:
  - **Current sidebar**: Description card (teal bg) with lead info → "ABOUT THIS SPACE" button → Subspaces list (colored avatars + names) → Events section (calendar + add button)
  - **Prototype sidebar**: Generic "Welcome!" callout → Subspaces list (Folder icons + counts)
  - **Must fix**: Replace prototype's generic welcome card with space description card + lead avatar. Add "ABOUT THIS SPACE" button. Replace Folder icons with colored space avatars. Remove subspace counts. Add Events section.
- [x] **Chat variants (A-E) must be REMOVED** — current platform has no inline chat on space pages.
- [ ] **SpaceHeader** — banner structure is close. Current has: Alkemio logo badges top-left, "POWERED BY ALKEMIO" top-right, green icon badge below. Verify prototype matches.
- [ ] **Tab labels** — current shows: HOME, COMMUNITY, WORKSPACES, KNOWLEDGE (not "SUBSPACES" / "KNOWLEDGE BASE"). Verify exact labels.
- [ ] **"+ POST" button** — current has full-width centered "+ POST" button at top of feed. Verify prototype matches.
- [ ] **Inline comment input** — current shows emoji picker + @ mention + text input + send arrow directly on each post card. Verify prototype has this inline pattern.
- [ ] **PostCard** — 4 post types (post/whiteboard/collection/memo) with hover lift. Current shows title, author+time+⋮ menu, body, inline comments.

---

## Allowed Improvements

- **Cleaner post cards** — shadcn Card with better shadow and spacing is an improvement
- **Better tab styling** — shadcn Tabs look more modern than MUI tabs
- **Avatar consistency** — shadcn Avatar with fallback initials
- **Button variants** — shadcn ghost/outline buttons for sidebar items look cleaner
- **Collapsible sidebar** — shadcn Collapsible for sidebar sections is smoother than MUI Collapse

---

## Figma Make Instructions

```
You are recreating the Alkemio Space Home page using shadcn/ui components.

LAYOUT (keep exactly):
- Full-width space banner (background image + dark overlay + space title + tagline overlaid)
  - Top-left: Alkemio logo badges
  - Top-right: "POWERED BY ALKEMIO" badge
  - Below top-left: Green lock/icon badge
- Horizontal tab bar below banner: HOME | COMMUNITY | WORKSPACES | KNOWLEDGE
  - Right-side utility icons: clock/activity, video, bell/notifications, share, settings gear
- Two-column layout below tabs:
  - Left sidebar (~280px):
    1. Space description card (teal/dark accent bg): description text + "Read more" + lead avatar + name + location
    2. "ABOUT THIS SPACE" button (full-width, outlined, info icon)
    3. Subspaces list: header (space name + gear icon), items with colored avatars + names
    4. Events section: header + expand icon, empty state text, "Show calendar" + green "+" add button
  - Main content area:
    1. "+ POST" button (full-width, centered)
    2. Vertical stack of post cards

POST CARD STRUCTURE:
- Title (clickable, opens post detail)
- Author name + relative timestamp + ⋮ more menu (right-aligned)
- Body text
- Inline comment input: avatar + emoji picker + @ mention + text input ("Type your comment here") + send arrow
- Reply thread (if replies exist): avatar + name + text + time + copy icon, "Reply" link

COMPONENTS (swap to new):
- Tab bar: shadcn Tabs with TabsList + TabsTrigger (or custom tabs with border-b-2 active indicator)
- Post cards: shadcn Card (large, readable)
- Description card: shadcn Card with teal/accent bg
- Sidebar items: shadcn Avatar + text for subspaces
- "ABOUT THIS SPACE": shadcn Button variant="outline" + Lucide Info icon
- "+ POST": shadcn Button variant="outline" full-width + Lucide Plus icon
- Avatars: shadcn Avatar for lead, authors, subspaces
- Utility icons: shadcn Button variant="ghost" size="icon"
- Comment input: shadcn Input + Button (ghost for emoji/mention, default for send)

CONTENT (match current exactly):
- Space banner with title and tagline on image overlay
- Left sidebar with description card (NOT generic welcome) + About button + subspaces (colored avatars) + events
- Post types: text posts, posts with whiteboards, posts with collections
- Inline comment inputs on every post
- Reply threads inline below posts

Use the design system tokens from design-system-page.md.
```

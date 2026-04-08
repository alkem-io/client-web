# Page 15: Space Settings — Master Layout

> **Route**: `/space/[space-slug]/settings/[tab]`  
> **Access**: Space Facilitators, Space Admins  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/journey/space/SpaceSettings/SpaceSettingsLayout.tsx`

---

## Current Layout

Space Settings uses a **left sidebar vertical navigation** pattern instead of horizontal tabs.

```
┌──────────────────────────────────────────────────────────┐
│  Top Navigation Bar                                      │
├──────────────────────────────────────────────────────────┤
│  Space Name + Avatar          ← Back to Space / Quit    │
├─────────────────┬────────────────────────────────────────┤
│ LEFT SIDEBAR    │  MAIN CONTENT AREA                     │
│ (200-250px)     │                                        │
│                 │  [Content changes per settings tab]     │
│ SPACE IDENTITY  │                                        │
│  ▸ About       │                                        │
│  ▸ Layout      │                                        │
│                 │                                        │
│ MEMBER MGMT    │                                        │
│  ▸ Community   │                                        │
│  ▸ Subspaces   │                                        │
│                 │                                        │
│ CONTENT        │                                        │
│  ▸ Templates   │                                        │
│  ▸ Storage     │                                        │
│                 │                                        │
│ ADVANCED       │                                        │
│  ▸ Settings    │                                        │
│  ▸ Account     │                                        │
│                 │                                        │
└─────────────────┴────────────────────────────────────────┘
```

### Key structural elements:
- **Top Header**: Space name + avatar, "Back to Space" / "Quit Settings" button
- **Left Sidebar**: Vertical nav with collapsible group headers
- **Groups**: SPACE IDENTITY, MEMBER MANAGEMENT, CONTENT & RESOURCES, ADVANCED
- **Active State**: Highlighted with background color + left accent border
- **Main Content**: Fills remaining space, content per tab (Pages 16-23)
- **Responsive**: Sidebar collapses to hamburger on mobile

---

## Element Inventory

### Top Header
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Space name | `Typography` heading | Heading with Tailwind | Space title |
| Space avatar | MUI `Avatar` | `Avatar` (shadcn) | Space icon |
| Back link | Link / `Button` | `Button` variant="ghost" or link | "← Back to Space" |
| Quit button | `Button` | `Button` variant="outline" | "Quit Settings" |

### Left Sidebar Navigation
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Sidebar container | Custom layout | `div` with Tailwind (w-60, bg-muted) | Fixed width |
| Group header | Custom collapsible | `Collapsible` (shadcn) trigger | "SPACE IDENTITY", etc. |
| Nav item | Custom list item | `Button` variant="ghost" className="w-full justify-start" | About, Layout, etc. |
| Active indicator | Custom active style | Tailwind `bg-accent border-l-2 border-primary` | Left accent border |
| Icons | MUI icons | Lucide icons | Per nav item |
| Hover state | Custom hover | Tailwind `hover:bg-accent` | Subtle highlight |

### Responsive
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Mobile sidebar | Drawer / collapse | `Sheet` (shadcn) or hamburger | Slides in from left |
| Hamburger trigger | `IconButton` | `Button` variant="ghost" + Menu icon | Mobile only |

---

## Prototype Status

✅ **BUILT** — `pages/SpaceSettingsPage.tsx` (69 lines) + `components/space/SpaceSettingsSidebar.tsx` (130 lines)

**Prototype structure:**
- Two-column layout: `SpaceSettingsSidebar` (desktop, sticky, `hidden md:flex`) + main content area (`flex-1, bg-muted/10`)
- Sidebar: grouped navigation with collapsible groups, active state with primary color, "Back to Space" link
- Main content: conditional rendering based on URL `tab` param → 8 sub-components (about/layout/community/subspaces/templates/storage/settings/account)
- Content wrapped in `bg-card border rounded-xl p-6 md:p-8 shadow-sm min-h-[500px]`
- Auto-redirect to `/settings/about` if no tab specified
- Fallback placeholder for unknown tab values
- Uses Sheet component for potential mobile sidebar (imported but not fully wired)

**shadcn components used:** Button, Sheet (imported), cn utility

---

## Pull-Back Notes

- [ ] **Two-column layout** — sidebar + content area matches current Space Settings structure.
- [ ] **Grouped sidebar navigation** — verify groups match current sidebar (likely: General, Content, Administration).
- [ ] **Auto-redirect to "about"** — verify current default tab.
- [x] **Sheet for mobile sidebar** — imported but not fully wired. Current may use different mobile pattern.
- [ ] **Rounded card wrapper for content** — verify matches current content container style.
- [ ] **"Back to Space" link** — verify current has this.

---

## Allowed Improvements

- **Sidebar styling** — shadcn-style nav with ghost buttons and accent colors
- **Group headers** — shadcn Collapsible for group headers
- **Active state** — cleaner left border accent with Tailwind
- **Icons** — Lucide icons consistent with rest of platform
- **Mobile Sheet** — shadcn Sheet for mobile sidebar is smoother than MUI Drawer

---

## Figma Make Instructions

```
You are recreating the Alkemio Space Settings Master Layout using shadcn/ui components.

LAYOUT (keep exactly):
- Top header: Space name + avatar (left), Back to Space + Quit Settings (right)
- Two-column layout:
  - Left sidebar (200-250px): Vertical navigation with grouped sections
  - Main content area: Fills remaining width (content changes per tab)

SIDEBAR STRUCTURE (keep exactly):
Group: SPACE IDENTITY → About, Layout
Group: MEMBER MANAGEMENT → Community, Subspaces
Group: CONTENT & RESOURCES → Templates, Storage
Group: ADVANCED → Settings, Account

COMPONENTS (swap to new):
- Sidebar nav items: shadcn Button variant="ghost" (full-width, left-aligned)
- Group headers: collapsible with Tailwind or shadcn Collapsible
- Active state: bg-accent + border-l-2 border-primary
- Icons: Lucide icons per nav item
- Back/Quit: shadcn Button variant="ghost" / variant="outline"
- Space avatar: shadcn Avatar
- Mobile: shadcn Sheet for sidebar

This is the SHELL layout. Each settings tab (Pages 16-23) provides the main content area.

Use the design system tokens from design-system-page.md.
```

# Page 9: My Account — Account Tab

> **Route**: `/user/[user-slug]/settings/account`  
> **Access**: Authenticated user (own account only)  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/community/user/layout/UserSettingsLayout.tsx`

---

## Current Layout

The Account tab is the main settings hub, showing account-level resources and capacities.

```
┌──────────────────────────────────────────────────────────┐
│  Top Navigation Bar                                      │
├──────────────────────────────────────────────────────────┤
│  MY PROFILE | ACCOUNT* | MEMBERSHIP | ORGS | NOTIF | SET │
├──────────────────────────────────────────────────────────┤
│  "Here you can see your resources and manage your        │
│   account allocation."                                   │
│                                                          │
│  Hosted Spaces                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  [+]           │
│  │ Space    │ │ Space    │ │ Space    │                  │
│  │ Card     │ │ Card     │ │ Card     │                  │
│  │ [⋮ menu]│ │ [⋮ menu]│ │ [⋮ menu]│                  │
│  │ Plan: +  │ │ Plan: P  │ │ Plan: F  │                  │
│  │ 2/5 cap  │ │ 1/5 cap  │ │          │                  │
│  └──────────┘ └──────────┘ └──────────┘                  │
│                                                          │
│  Virtual Contributors                                    │
│  ┌──────────┐ ┌──────────┐                [+]           │
│  │ VC Card  │ │ VC Card  │                               │
│  └──────────┘ └──────────┘                               │
│                                                          │
│  Template Packs                           [+]  0/5      │
│  [empty state]                                           │
│                                                          │
│  Custom Homepages                         [+]  0/1      │
│  [empty state]                                           │
└──────────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Horizontal Tab Bar**: MY PROFILE, ACCOUNT (active), MEMBERSHIP, ORGANIZATIONS, NOTIFICATIONS, SETTINGS
- **Help Text**: Explanatory copy at top
- **Four Resource Sections**: Hosted Spaces, Virtual Contributors, Template Packs, Custom Homepages
- **Card Grids**: Each section has a card grid with overflow menus
- **Floating + Buttons**: Create new resources per section
- **Capacity Indicators**: "2/5" showing usage vs. limit

---

## Element Inventory

### Tab Navigation
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Tab bar | `Tabs` / custom tabs | `Tabs` + `TabsList` + `TabsTrigger` (shadcn) | Horizontal account tabs |
| Active tab | Custom active style | `TabsTrigger` active state | ACCOUNT highlighted |

### Hosted Spaces Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section header | `Typography` heading | Heading with Tailwind | "Hosted Spaces" |
| Space card | `ContributeCard` / `Paper` | `Card` (shadcn) | Image, name, desc, plan badge |
| Plan badge | `Chip` | `Badge` (shadcn) | Plus, Premium, Free |
| Capacity | `Typography` | Tailwind text | "2/5" |
| Overflow menu | `IconButton` 3-dot | `DropdownMenu` (shadcn) | Edit, delete actions |
| Create button | FAB / `IconButton` + | `Button` (shadcn) | Floating + button |
| Card grid | MUI Grid / custom | Tailwind grid | Responsive grid |

### Virtual Contributors Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| VC card | Custom card / `Paper` | `Card` (shadcn) | Name, desc, capacity |
| Create button | FAB | `Button` (shadcn) | + button |

### Template Packs & Custom Homepages
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section card/area | Custom container | `Card` (shadcn) or section div | Contains content or empty state |
| Empty state | Custom empty message | Tailwind centered text | "No template packs yet" |
| Create button | FAB | `Button` (shadcn) | + button |
| Capacity counter | `Typography` | `Badge` (shadcn) | "0/5", "0/1" |

---

## Prototype Status

✅ **BUILT** — `pages/UserAccountPage.tsx` (317 lines)

**Prototype structure:**
- Sticky 6-tab navigation bar (MY PROFILE / ACCOUNT / MEMBERSHIP / ORGANIZATIONS / NOTIFICATIONS / SETTINGS)
- Info banner with primary-tinted help text
- **Hosted Spaces** section — 3-column Card grid with cover images, plan badges (Premium/Plus/Basic color-coded), + dashed "Create New Space" card
- **Virtual Contributors** section — Cards with Bot icon, description, + dashed "Create New Contributor" card
- **Template Packs** section — list-style Cards with Puzzle icon, capacity indicator (used/total), + empty slots
- **Custom Homepages** section — full empty state with PanelTop icon, CTA button

**shadcn components used:** Button, Card (+ Header/Title/Description/Content), Badge, Separator, Lucide icons

---

## Pull-Back Notes

- [x] **"Hosted Spaces" with plan badges (Premium/Plus/Basic)** — current account page (screenshot `account page.png`) may show spaces differently. Verify plan badge presence.
- [x] **"Virtual Contributors" section** — this is likely a new/enhanced feature. Verify if current has VC management on account page.
- [x] **"Template Packs" section** — may be new. Verify.
- [x] **"Custom Homepages" section** — may be new. Verify.
- [x] **Dashed "Create New" cards** — design pattern not in current. These may be enhancements.
- [ ] **6-tab navigation** — matches current account settings structure. Verify exact tab names against screenshot (`profile settings > my account.png`).
- [ ] **Capacity indicators** — used/total capacity for VCs and template packs. Verify if current has this.

---

## Allowed Improvements

- **Tab styling** — shadcn Tabs are cleaner than MUI tabs
- **Card overflow menus** — shadcn DropdownMenu is more refined
- **Badge variants** — shadcn Badge for plan tiers looks sharper
- **Empty states** — can be slightly improved with better visual treatment

---

## Figma Make Instructions

```
You are recreating the Alkemio Account Tab using shadcn/ui components.

LAYOUT (keep exactly):
- Horizontal tab bar: MY PROFILE | ACCOUNT | MEMBERSHIP | ORGANIZATIONS | NOTIFICATIONS | SETTINGS
- Help text below tabs
- Four sections stacked vertically:
  1. Hosted Spaces (card grid + overflow menus + plan badges + capacity)
  2. Virtual Contributors (card grid + overflow menus)
  3. Template Packs (card grid or empty state + capacity)
  4. Custom Homepages (card area or empty state + capacity)
- Floating + create buttons per section

COMPONENTS (swap to new):
- Tab bar: shadcn Tabs
- Cards: shadcn Card with image, name, description, plan Badge
- Overflow menu: shadcn DropdownMenu (3-dot trigger)
- Plan badge: shadcn Badge (color per tier)
- Capacity: text or Badge showing "X/Y"
- Create buttons: shadcn Button (+ icon)
- Empty states: centered text with subtle styling

Use the design system tokens from design-system-page.md.
```

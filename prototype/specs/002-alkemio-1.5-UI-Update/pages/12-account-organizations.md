# Page 12: My Account — Organizations Tab

> **Route**: `/user/[user-slug]/settings/organizations`  
> **Access**: Authenticated user (own account only)  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/community/user/views/UserOrganizationsView.tsx`

---

## Current Layout

The Organizations tab shows organizations the user is associated with.

```
┌──────────────────────────────────────────────────────────┐
│  MY PROFILE | ACCOUNT | MEMBERSHIP | ORGS* | NOTIF | SET │
├──────────────────────────────────────────────────────────┤
│  [CREATE]                                                │
│                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │  [Avatar]    │ │  [Avatar]    │ │  [Avatar]    │     │
│  │  Org Name    │ │  Org Name    │ │  Org Name    │     │
│  │  Location    │ │  Location    │ │  Location    │     │
│  │  Associates  │ │  Associates  │ │  Associates  │     │
│  │  (12)        │ │  (8)         │ │  (3)         │     │
│  │  ✓ Verified  │ │              │ │              │     │
│  │              │ │              │ │              │     │
│  │ [DISASSOC]   │ │ [DISASSOC]   │ │ [DISASSOC]   │     │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Tab Bar**: ORGANIZATIONS tab is active
- **Create Button**: Top-right, create/associate with new org
- **Org Card Grid**: Cards showing avatar, name, location, associate count, verified badge
- **Disassociate Button**: Per-org action to disassociate

---

## Element Inventory

### Organization Cards
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Org card | Custom card / `Paper` | `Card` (shadcn) | Avatar + name + meta |
| Org avatar | MUI `Avatar` | `Avatar` (shadcn) | Logo, initials, or image |
| Org name | `Typography` heading | Heading with Tailwind | Organization name |
| Location | `Typography` body | Tailwind text-muted | City / location |
| Associate count | `Badge` / `Chip` | `Badge` (shadcn) | "Associates (12)" |
| Verified badge | `Chip` with icon | `Badge` (shadcn) variant | "✓ Verified" |
| Disassociate button | `Button` | `Button` variant="destructive" or "outline" | Per-org action |
| Card grid | MUI Grid / custom | Tailwind grid | Responsive grid |

### Actions
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Create button | `Button` primary | `Button` (shadcn) | Top-right, "CREATE" |

---

## Prototype Status

✅ **BUILT** — `pages/UserOrganizationsPage.tsx` (327 lines)

**Prototype structure:**
- Same 6-tab navigation (ORGANIZATIONS active)
- Search input + "Create Organization" Button → opens inline Dialog
- **Create Organization dialog** — Form with: Organization Name (required), Tagline, Location, Website; Cancel + Create buttons
- 3-column card grid, each card: cover image with gradient overlay, DropdownMenu (View Profile/Manage Settings/Disassociate), Avatar overlapping bottom-left, Verified badge (CheckCircle2), role badge, MapPin location, description, footer (associates count + Globe website link)
- Empty state with Building2 icon
- 4 mock organizations

**shadcn components used:** Card, Badge, Button, Input, Avatar, DropdownMenu, Dialog, Label, Separator, Sonner toast

---

## Pull-Back Notes

- [ ] **3-column card grid** — matches current orgs layout. Verify against screenshot (`profile settings > organisations.png`).
- [x] **Cover images with gradient overlay** — current org cards may not have cover images. Verify.
- [x] **Verified badge (CheckCircle2)** — may be new. Verify if current has verification indicators.
- [x] **Create Organization dialog** — verify current has this inline or as separate flow.
- [ ] **DropdownMenu actions** — current may have View Profile / Manage. Verify.
- [ ] **Associate count + website link** — verify current shows these.
- [x] **Avatar overlapping image** — design pattern may be new. Verify.

---

## Allowed Improvements

- **Badge variants** — shadcn Badge for verified/associate count looks cleaner
- **Card layout** — shadcn Card with better spacing
- **Destructive button** — shadcn Button variant="destructive" for disassociate is clearer intent

---

## Figma Make Instructions

```
You are recreating the Alkemio Organizations Tab using shadcn/ui components.

LAYOUT (keep exactly):
- Horizontal tab bar (ORGANIZATIONS active)
- CREATE button top-right
- Responsive card grid of organization cards

COMPONENTS (swap to new):
- Org cards: shadcn Card with Avatar, name, location, associate count Badge, verified Badge
- Avatar: shadcn Avatar (org logo or initials)
- Associate count: shadcn Badge
- Verified: shadcn Badge variant
- Disassociate: shadcn Button variant="outline" or "destructive"
- Create: shadcn Button (primary)

Use the design system tokens from design-system-page.md.
```

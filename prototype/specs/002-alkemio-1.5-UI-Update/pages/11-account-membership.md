# Page 11: My Account — Membership Tab

> **Route**: `/user/[user-slug]/settings/membership`  
> **Access**: Authenticated user (own account only)  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/community/user/views/UserMembershipView.tsx`

---

## Current Layout

The Membership tab shows all spaces and subspaces the user belongs to.

```
┌──────────────────────────────────────────────────────────┐
│  MY PROFILE | ACCOUNT | MEMBERSHIP* | ORGS | NOTIF | SET │
├──────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Space    │ │ Space    │ │ Subspace │ │ Space    │    │
│  │ Card     │ │ Card     │ │ Card     │ │ Card     │    │
│  │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │    │
│  │ Name     │ │ Name     │ │ Name     │ │ Name     │    │
│  │ Desc     │ │ Desc     │ │ Desc     │ │ Desc     │    │
│  │ Members  │ │ Members  │ │ Members  │ │ Members  │    │
│  │ [⋮ menu]│ │ [⋮ menu]│ │ [⋮ menu]│ │ [⋮ menu]│    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  [Load more]                                             │
└──────────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Tab Bar**: MEMBERSHIP tab is active
- **Membership Card Grid**: Card grid of spaces/subspaces the user belongs to
- **Card Content**: Same Space Card component (image, name, desc, members, overflow menu)
- **Overflow Menu**: Per-card actions (view details, leave)
- **Pagination**: Load more button

---

## Element Inventory

### Membership Cards
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Space/subspace card | `ContributeCard` | `Card` (shadcn) | Same card as elsewhere |
| Card image | `<img>` | `<img>` with Tailwind | 16:9 thumbnail |
| Card name | `Typography` heading | Heading with Tailwind | Space name, linked |
| Card description | `Typography` body | Tailwind body text | 1-2 lines |
| Member count | `Typography` + icon | Text + Lucide icon | Member count |
| Overflow menu | `IconButton` 3-dot | `DropdownMenu` (shadcn) | View, leave |
| Leave action | Menu item | `DropdownMenuItem` | Leave space/subspace |
| Card grid | MUI Grid / custom | Tailwind grid | Responsive grid |

### Controls
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Load more | `Button` | `Button` variant="outline" | Pagination |
| Filter | `Select` (optional) | `Select` (shadcn) | By status, role |

---

## Prototype Status

✅ **BUILT** — `pages/UserMembershipPage.tsx` (302 lines)

**Prototype structure:**
- Same 6-tab navigation (MEMBERSHIP active)
- Search input + filter bar (All/Active/Archived segmented buttons)
- 3-column card grid, each card with: cover image (hover zoom), DropdownMenu (View Details/Leave), type+status badges, title, role Badge, plan text, description, footer (member count + last active)
- Empty state with Folder icon + "Clear Filters" button
- "Load More" ghost button at bottom
- 6 mock memberships with various roles and statuses

**shadcn components used:** Card, Badge, Button, Input, DropdownMenu, Avatar, Separator

---

## Pull-Back Notes

- [ ] **3-column card grid** — matches current membership layout concept. Verify against screenshot (`profile settings > memberships.png`).
- [x] **Filter bar (All/Active/Archived)** — current may not have status filtering. Verify.
- [x] **Status badges (Active/Archived)** — current may not distinguish membership status. Verify.
- [x] **Plan text (Premium/Standard/Basic/Free)** — current may not show plan info. Verify.
- [ ] **Role badges** — current shows roles on membership cards. Verify role names match.
- [ ] **"Load More" pagination** — verify current uses same pattern.
- [x] **DropdownMenu with "Leave"** — current may have simpler card actions. Verify.

---

## Allowed Improvements

- **Card consistency** — shadcn Card matches across all pages
- **Dropdown menu** — shadcn DropdownMenu for overflow actions
- **Hover states** — cleaner shadow transitions

---

## Figma Make Instructions

```
You are recreating the Alkemio Membership Tab using shadcn/ui components.

LAYOUT (keep exactly):
- Horizontal tab bar (MEMBERSHIP active)
- Responsive card grid of space/subspace memberships (3-4 per row)
- Per-card overflow menu (3-dot) with "leave" action
- Load more button at bottom

COMPONENTS (swap to new):
- Cards: shadcn Card (SAME card component as Dashboard, Browse All Spaces, Subspaces Tab)
- Overflow: shadcn DropdownMenu with "View details", "Leave" options
- Load more: shadcn Button variant="outline"

IMPORTANT: The membership card is the SAME Space Card component used on Pages 1, 4, 31. Keep visually identical.

Use the design system tokens from design-system-page.md.
```

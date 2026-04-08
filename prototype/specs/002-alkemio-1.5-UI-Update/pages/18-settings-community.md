# Page 18: Space Settings — Community Tab

> **Route**: `/space/[space-slug]/settings/community`  
> **Access**: Space Facilitators, Space Admins  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Parent layout**: [15-space-settings-master.md](15-space-settings-master.md)

---

## Current Layout

The Community settings tab is the hub for member management, application review, and role assignment.

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR │  "Community"                              │
│          │  "Manage your space members..."           │
│  ...     │                                           │
│  Commun* │  Pending Applications & Invitations (3)   │
│  ...     │  ┌────────────────────────────────────┐   │
│          │  │ Name | Email | Date | Status | Act │   │
│          │  │ ──────────────────────────────────  │   │
│          │  │ User1 | u@e | Jan | Pending | ⋮    │   │
│          │  │ User2 | u@e | Jan | Invited | ⋮    │   │
│          │  └────────────────────────────────────┘   │
│          │                                           │
│          │  ▸ Application Form (collapsible)         │
│          │  ▸ Community Guidelines (collapsible)     │
│          │  ▸ Applicable Organizations (collapsible) │
│          │  ▸ Virtual Contributors (collapsible)     │
│          │  ▸ Member Roles & Permissions (info)      │
└──────────┴───────────────────────────────────────────┘
```

### Key structural elements:
- **Shell**: Within Space Settings master layout
- **Applications Table**: Name, Email, Date, Status, Type + row actions
- **Collapsible Sections**: Application Form, Community Guidelines, Organizations, VCs, Roles
- **Per-row Actions**: Approve, Reject, Resend via 3-dot menu

---

## Element Inventory

### Applications Table
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Table | Custom table / MUI `Table` | `Table` (shadcn) | Sortable columns |
| Table header | `TableHead` | Tailwind or shadcn table head | Name, Email, Date, Status, Actions |
| Table row | `TableRow` | Tailwind or shadcn table row | Zebra striping |
| Status badge | `Chip` | `Badge` (shadcn) | Pending, Invited, Approved |
| Row actions | `IconButton` 3-dot | `DropdownMenu` (shadcn) | Approve, Reject, Resend |
| Count badge | `Badge` | `Badge` (shadcn) | "(3)" in header |
| Empty state | Custom text | Centered text + icon | "No pending applications" |
| Pagination | Custom controls | `Button` or pagination component | 10-25 per page |

### Collapsible Sections
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section container | `Accordion` / custom | `Collapsible` or `Accordion` (shadcn) | Expandable sections |
| Section header | Custom header | `CollapsibleTrigger` / `AccordionTrigger` | Heading + chevron |
| Section content | Custom content | `CollapsibleContent` / `AccordionContent` | Section-specific content |

### Section Contents
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Edit Form button | `Button` | `Button` variant="outline" | Application Form |
| Guidelines link | Link / `Button` | `Button` variant="link" | Community Guidelines |
| Org list | Custom list | List with `Avatar` + `Badge` | Organizations |
| Add Org button | `Button` | `Button` variant="outline" | "+ Add Organization" |
| VC list | Custom list | List with name + status | Virtual Contributors |
| Add VC button | `Button` | `Button` variant="outline" | "+ Add VC" |
| Role hierarchy | Custom display | Tailwind list | Host, Admin, Lead, Member |

---

## Prototype Status

✅ **BUILT** — `components/space/SpaceSettingsCommunity.tsx` (797 lines)

**Prototype structure:**
- Full paginated member table with sorting, search, status filter
- Status badges (Active/Pending/Invited/Suspended)
- Collapsible sections for organizations and virtual contributors
- Member management actions
- Extensive — 797 lines of code

**shadcn components used:** Card, Badge, Button, Input, DropdownMenu, Select, Table, Separator, Checkbox, Avatar, Switch, Dialog, Tabs, Tooltip

---

## Pull-Back Notes

- [ ] **Member management table** — current has member management in community settings. Verify against current UI.
- [x] **Status badges (Active/Pending/Invited/Suspended)** — prototype has richer status system. Verify current has same statuses.
- [x] **797 lines of code** — significantly more complex than current may be. Review for over-engineering.
- [ ] **Collapsible org/VC sections** — verify current has these.
- [ ] **Search + filter** — verify current has member search in settings.

---

## Allowed Improvements

- **Table styling** — shadcn Table with better row styling
- **Accordion sections** — shadcn Accordion is smoother
- **Badge variants** — shadcn Badge for status colors
- **DropdownMenu** — shadcn DropdownMenu for row actions is more polished

---

## Figma Make Instructions

```
You are recreating the Space Settings Community Tab using shadcn/ui components.

LAYOUT: Within Space Settings master layout (Page 15).

CONTENT (keep exactly):
- Title: "Community" + instructional text
- Pending Applications & Invitations table (Name, Email, Date, Status, Actions)
- 5 collapsible sections:
  1. Application Form (edit link)
  2. Community Guidelines (edit/view link)
  3. Applicable Organizations (org list + add button)
  4. Virtual Contributors (VC list + add button)
  5. Member Roles & Permissions (informational)

COMPONENTS:
- Table: shadcn Table with sortable columns
- Status badges: shadcn Badge (color per status)
- Row actions: shadcn DropdownMenu (3-dot trigger)
- Collapsible sections: shadcn Accordion or Collapsible
- Count badge: shadcn Badge in section header
- Buttons: shadcn Button variant="outline" for add/edit actions

Use the design system tokens from design-system-page.md.
```

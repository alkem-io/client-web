# Page 13: My Account — Notifications Tab

> **Route**: `/user/[user-slug]/settings/notifications`  
> **Access**: Authenticated user (own account only)  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/community/user/views/UserNotificationsView.tsx`

---

## Current Layout

The Notifications tab lets users configure how they receive notifications across the platform.

```
┌──────────────────────────────────────────────────────────┐
│  MY PROFILE | ACCOUNT | MEMBERSHIP | ORGS | NOTIF* | SET │
├──────────────────────────────────────────────────────────┤
│  "Here you can edit your notification preferences"       │
│                                                          │
│  SPACE NOTIFICATIONS                     In-app | Email  │
│  ────────────────────────────────────────────────────── │
│  Post published in my community           [✓]    [✓]    │
│  Comment added to a post                  [✓]    [ ]    │
│  Communication shared on community        [✓]    [✓]    │
│  Comment made on a post                   [✓]    [ ]    │
│                                                          │
│  PLATFORM NOTIFICATIONS                  In-app | Email  │
│  ────────────────────────────────────────────────────── │
│  New comment on discussion I follow       [✓]    [✓]    │
│  New discussion created                   [ ]    [✓]    │
│                                                          │
│  ORGANIZATION NOTIFICATIONS              In-app | Email  │
│  ────────────────────────────────────────────────────── │
│  My organization mentioned                [✓]    [✓]    │
│  Direct messages to organization          [✓]    [✓]    │
│                                                          │
│  USER NOTIFICATIONS                      In-app | Email  │
│  ────────────────────────────────────────────────────── │
│  Someone replies to my comment            [✓]    [✓]    │
│  I am mentioned                           [✓]    [✓]    │
│  Direct message received                  [✓]    [✓]    │
│  Invitation to join community             [✓]    [✓]    │
│  I join a new Space                       [✓]    [ ]    │
│                                                          │
│  VIRTUAL CONTRIBUTOR NOTIFICATIONS       In-app | Email  │
│  ────────────────────────────────────────────────────── │
│  VC manager invited to community          [✓]    [✓]    │
└──────────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Tab Bar**: NOTIFICATIONS tab is active
- **Help Text**: "Here you can edit your notification preferences"
- **5 Sections**: Space, Platform, Organization, User, Virtual Contributor
- **Per-row**: Notification description + In-app toggle + Email toggle
- **Section headers**: Bold, with explanatory text
- **Two-column toggles**: In-app | Email per notification preference

---

## Element Inventory

### Notification Sections
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section header | `Typography` heading | Heading with Tailwind | "SPACE NOTIFICATIONS" etc. |
| Section description | `Typography` body | Tailwind text-muted | Explanatory text |
| Column headers | "In-app" / "Email" labels | Tailwind column headers | Fixed position |

### Per-Notification Row
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Description text | `Typography` body | Tailwind body text | Notification description |
| In-app toggle | `Switch` / `Checkbox` | `Switch` (shadcn) | On/off per channel |
| Email toggle | `Switch` / `Checkbox` | `Switch` (shadcn) | On/off per channel |

### Page Structure
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Help text | `Typography` | Tailwind text | Top instruction |
| Section dividers | `Divider` / custom | Tailwind `border-b` or `Separator` | Between sections |
| Scrollable content | Overflow container | Tailwind `overflow-y-auto` | Long preferences list |

---

## Prototype Status

✅ **BUILT** — `pages/UserNotificationsPage.tsx` (239 lines)

**Prototype structure:**
- Same 6-tab navigation (NOTIFICATIONS active)
- Info banner ("Changes are saved automatically") with Info icon
- 5 notification sections as Cards:
  - **Space Notifications** (4 items) — post published, comment added, communication shared, comment on followed post
  - **Platform Notifications** (2 items) — discussion comment, discussion created
  - **Organization Notifications** (2 items) — org mentioned, org DM
  - **User Notifications** (5 items) — reply, mention, DM, invite, join
  - **Virtual Contributor Notifications** (1 item) — VC manager invited
- Each row: notification label + In-App Switch + Email Switch
- Column headers: "Activity" | "In-App" | "Email"

**shadcn components used:** Card, Switch, Separator, Badge, Button

---

## Pull-Back Notes

- [ ] **5 notification sections** — matches current notification settings concept. Verify against screenshot (`profile settings > notifications.png`).
- [ ] **In-App + Email dual switches** — standard pattern, likely matches current.
- [x] **"Virtual Contributor Notifications" section** — may be new. Verify if current has this.
- [ ] **"Changes saved automatically" banner** — enhancement, acceptable.
- [ ] **Column headers (Activity/In-App/Email)** — verify current uses same column layout.
- [ ] **Section grouping** — verify current groups notifications the same way.

---

## Allowed Improvements

- **Toggle switches** — shadcn Switch is visually sharper than MUI
- **Section layout** — cleaner separation with Tailwind spacing
- **Separator** — shadcn Separator between sections
- **Overall readability** — better spacing and alignment of toggle columns

---

## Figma Make Instructions

```
You are recreating the Alkemio Notifications Tab using shadcn/ui components.

LAYOUT (keep exactly):
- Horizontal tab bar (NOTIFICATIONS active)
- Help text: "Here you can edit your notification preferences"
- 5 sections stacked vertically:
  1. Space Notifications (4+ toggles)
  2. Platform Notifications (2+ toggles)
  3. Organization Notifications (2+ toggles)
  4. User Notifications (5+ toggles)
  5. Virtual Contributor Notifications (1+ toggles)
- Each row: notification description + In-app toggle + Email toggle
- Column headers: "In-app" | "Email" aligned right

COMPONENTS (swap to new):
- Section headers: Tailwind headings (bold)
- Toggles: shadcn Switch (one per channel: In-app, Email)
- Separator: shadcn Separator between sections
- Help text: Tailwind text-muted

CONTENT (keep current):
- All notification preferences exactly as documented
- Dual-channel toggles (In-app + Email)
- 5 organized sections

Use the design system tokens from design-system-page.md.
```

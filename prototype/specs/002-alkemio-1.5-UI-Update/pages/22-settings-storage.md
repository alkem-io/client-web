# Page 22: Space Settings — Settings Tab

> **Route**: `/space/[space-slug]/settings/settings`  
> **Access**: Space Facilitators, Space Admins  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Parent layout**: [15-space-settings-master.md](15-space-settings-master.md)

---

## Current Layout

The Settings tab houses advanced configuration for space behavior, membership, and permissions.

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR │  "Settings"                               │
│          │  "Configure visibility, membership..."    │
│  ...     │                                           │
│  Setti*  │  Visibility                               │
│  ...     │  ○ Public: "Visible to everyone..."       │
│          │  ● Private: "Visible to everyone but      │
│          │     content only visible to members..."    │
│          │                                           │
│          │  Membership                               │
│          │  ○ No Application Required                │
│          │  ● Application Required                   │
│          │  ○ Invitation Only                        │
│          │                                           │
│          │  ▸ Applicable Organizations               │
│          │    [Org 1] [Org 2]  [+ Add]               │
│          │                                           │
│          │  Allowed Actions                          │
│          │  Space Invitations        [on/off]        │
│          │  Create Posts             [on/off]        │
│          │  Video Calls              [on/off]        │
│          │  Guest Contributions      [on/off]        │
│          │  Create Subspaces         [on/off]        │
│          │  Subspace Events          [on/off]        │
│          │  Alkemio Support          [on/off]        │
│          │                                           │
│          │  ⚠ Danger Zone                            │
│          │  [DELETE THIS SPACE]                       │
└──────────┴───────────────────────────────────────────┘
```

### Key structural elements:
- **Visibility Section**: Radio group (Public / Private)
- **Membership Section**: Radio group (No Application / Application Required / Invitation Only)
- **Organizations Section**: Collapsible, org list + add button
- **Allowed Actions**: Grid of toggles (7 actions with on/off switches)
- **Danger Zone**: Red-styled section with Delete button

---

## Element Inventory

### Visibility
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Radio group | MUI `RadioGroup` | `RadioGroup` (shadcn) | Public / Private |
| Radio labels | `Typography` | Tailwind text | With descriptions |
| Help text | `Typography` helper | Tailwind text-muted | Per option |

### Membership
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Radio group | MUI `RadioGroup` | `RadioGroup` (shadcn) | 3 options |
| Radio labels | `Typography` | Tailwind text | With long descriptions |
| Help text | `Typography` helper | Tailwind text-muted | Per option |

### Organizations
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section | `Accordion` / collapsible | `Collapsible` (shadcn) | Expandable |
| Org list | Custom list | List with `Avatar` + `Badge` | Current orgs |
| Remove button | `IconButton` X | `Button` variant="ghost" size="icon" | Per org |
| Add button | `Button` | `Button` variant="outline" | "+ Add Organization" |

### Allowed Actions
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Action row | Custom row | Tailwind flex row | Label + description + toggle |
| Toggle | `Switch` | `Switch` (shadcn) | On/off per action |
| Action label | `Typography` bold | Tailwind font-semibold | Action name |
| Description | `Typography` body | Tailwind text-muted | What the action does |

### Danger Zone
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section container | Custom warning box | Tailwind border-destructive or `Card` | Red-styled |
| Section header | `Typography` red | Tailwind text-destructive heading | "Danger Zone" |
| Delete button | `Button` destructive | `Button` variant="destructive" | "DELETE THIS SPACE" |
| Help text | `Typography` | Tailwind text-muted | Warning text |

---

## Prototype Status

✅ **BUILT** — `components/space/SpaceSettingsSettings.tsx` (447 lines)

**Prototype structure:**
- Accordion-based settings sections:
  - **Visibility** — RadioGroup (Public/Members Only/Private)
  - **Membership** — RadioGroup (Open/Application/Invite Only)
  - **Organizations** — Switch toggles for org membership settings
  - **Allowed Actions** — Switch toggles for action permissions
- Delete space dialog with confirmation
- 447 lines of code

**shadcn components used:** Card, Badge, Button, Accordion, RadioGroup, Switch, Dialog, AlertDialog, Select, Separator, Input, Tooltip, Label, Checkbox

---

## Pull-Back Notes

- [ ] **Accordion-based settings** — verify current uses accordion/collapsible structure.
- [ ] **Visibility RadioGroup** — verify current visibility options match (Public/Members Only/Private).
- [ ] **Membership RadioGroup** — verify membership mode options.
- [ ] **Organization settings** — verify current has org membership toggles.
- [ ] **Allowed Actions** — verify current has action permission switches.
- [ ] **Delete space dialog** — verify current has delete functionality with confirmation.

---

## Allowed Improvements

- **RadioGroup** — shadcn RadioGroup with better styling
- **Switch toggles** — shadcn Switch is sharper
- **Destructive styling** — shadcn destructive variant for Danger Zone
- **Collapsible** — shadcn Collapsible for Organizations section
- **Section spacing** — better visual separation with Tailwind

---

## Figma Make Instructions

```
You are recreating the Space Settings Settings Tab using shadcn/ui components.

LAYOUT: Within Space Settings master layout (Page 15).

CONTENT (keep exactly):
- Title: "Settings" + instructional text
- Visibility section: RadioGroup (Public / Private) with descriptions
- Membership section: RadioGroup (No Application / Application Required / Invitation Only) with descriptions
- Organizations section: collapsible, org list + add button
- Allowed Actions section: 7 toggles (Space Invitations, Create Posts, Video Calls, Guest Contributions, Create Subspaces, Subspace Events, Alkemio Support) — each with label, description, Switch
- Danger Zone section: red-styled, "DELETE THIS SPACE" destructive button

COMPONENTS:
- Radio buttons: shadcn RadioGroup
- Toggles: shadcn Switch
- Organizations: shadcn Collapsible + Avatar list
- Danger Zone: Tailwind border-destructive + shadcn Button variant="destructive"
- Sections: Tailwind spacing + Separator between groups

Use the design system tokens from design-system-page.md.
```

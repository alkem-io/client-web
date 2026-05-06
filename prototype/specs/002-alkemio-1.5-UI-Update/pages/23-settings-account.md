# Page 23: Space Settings — Account Tab

> **Route**: `/space/[space-slug]/settings/account`  
> **Access**: Space Admins, Space Hosts  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Parent layout**: [15-space-settings-master.md](15-space-settings-master.md)

---

## Current Layout

The Account tab displays read-only space account information: URL, license, visibility, and host.

```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR │  "Account"                                │
│          │  "Here you find all your Spaces..."       │
│  ...     │                                           │
│  Accou*  │  URL                                      │
│  ...     │  https://alkem.io/my-space  [📋 Copy]    │
│          │                                           │
│          │  License                                  │
│          │  ┌──────────────────────────────────┐     │
│          │  │ Free                              │     │
│          │  │ • Up to 10 members               │     │
│          │  │ • Standard whiteboards           │     │
│          │  │ Capacity: 2/5 spaces             │     │
│          │  │ [Change License]                  │     │
│          │  └──────────────────────────────────┘     │
│          │                                           │
│          │  Visibility                               │
│          │  This Space is currently in *Active* mode │
│          │                                           │
│          │  Host                                     │
│          │  [Avatar] Host Name  (Host role)          │
│          │  [Change Host]                            │
│          │                                           │
│          │  [Contact Alkemio]                        │
└──────────┴───────────────────────────────────────────┘
```

### Key structural elements:
- **Read-only sections**: URL, License, Visibility, Host
- **URL**: Display with copy button
- **License Card**: License name, features, capacity, change link
- **Visibility**: Status text
- **Host**: Avatar + name + role
- **Support**: Contact Alkemio link

---

## Element Inventory

### URL Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| URL display | `Typography` | `Input` disabled or text | Read-only |
| Copy button | `IconButton` | `Button` variant="ghost" size="icon" | Copy to clipboard |

### License Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| License card | Custom card / `Paper` | `Card` (shadcn) | License info |
| License name | `Typography` heading | Heading with Tailwind | "Free", "Plus", "Premium" |
| Features list | `Typography` list | Tailwind list | Bullet list of features |
| Capacity | `Typography` | Tailwind text | "2/5 spaces used" |
| Change button | `Button` / link | `Button` variant="outline" | "Change the Space License" |
| More info link | Link | Tailwind link | External link |

### Visibility Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Status text | `Typography` | Tailwind text | "Active", "Archived" etc. |
| Help text | `Typography` helper | Tailwind text-muted | Contact for changes |

### Host Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Host avatar | MUI `Avatar` | `Avatar` (shadcn) | Host photo/initials |
| Host name | `Typography` | Heading with Tailwind | Host name |
| Host role | `Typography` caption | Tailwind text-muted | Role label |
| Change button | `Button` | `Button` variant="outline" | Admin-only |

### Support
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Contact link | `Button` / link | `Button` variant="link" | "Contact Alkemio" |

---

## Prototype Status

✅ **BUILT** — `components/space/SpaceSettingsAccount.tsx` (200 lines)

**Prototype structure:**
- URL copy field
- License card with usage bars
- Visibility status badge
- Host info section

**shadcn components used:** Card, Badge, Button, Input, Separator, Select, Dialog, AlertDialog, Progress, Avatar, Tooltip, Switch, Label

---

## Pull-Back Notes

- [ ] **URL copy field** — verify current has space URL display.
- [ ] **License card with usage bars** — verify current shows license/plan information.
- [ ] **Visibility status badge** — verify current shows visibility indicator.
- [ ] **Host info section** — verify current shows host/owner information.
- [ ] **Overall structure** — this is an admin-focused tab, verify against current platform.

---

## Allowed Improvements

- **Card styling** — shadcn Card for license section
- **Copy button** — cleaner ghost button with clipboard icon
- **Avatar** — shadcn Avatar with fallback
- **Section layout** — better spacing with Tailwind

---

## Figma Make Instructions

```
You are recreating the Space Settings Account Tab using shadcn/ui components.

LAYOUT: Within Space Settings master layout (Page 15).

CONTENT (keep exactly):
- Title: "Account" + instructional text
- URL section: read-only URL display + copy button
- License section: Card with license name, features list, capacity, change button
- Visibility section: status text
- Host section: Avatar + name + role + change button (admin-only)
- Contact Alkemio link

COMPONENTS:
- URL: read-only Input or text + shadcn Button variant="ghost" (copy icon)
- License card: shadcn Card
- Host: shadcn Avatar + text
- Change buttons: shadcn Button variant="outline"
- Contact: shadcn Button variant="link"

All sections are informational/read-only. No editing inline.

Use the design system tokens from design-system-page.md.
```

# Page 8: User Profile

> **Route**: `/user/[user-slug]`  
> **Access**: All platform users (own profile or others')  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/community/user/layout/UserPageLayout.tsx`

---

## Current Layout

The User Profile page shows a user's public identity, bio, organizations, hosted resources, and memberships.

```
┌──────────────────────────────────────────────────────────┐
│  Top Navigation Bar                                      │
├──────────────────────────────────────────────────────────┤
│  Profile Banner (decorative bg image)                    │
│  ┌─────┐                                                │
│  │     │  Name + Location                                │
│  │ AVT │  [✉ message]  [⚙ settings]                    │
│  │     │                                                │
│  └─────┘                                                │
├─────────────────────┬────────────────────────────────────┤
│  Bio                │  Resources User Hosts              │
│  (rich text)        │  ┌──────┐ ┌──────┐ ┌──────┐      │
│                     │  │Space │ │Space │ │VC    │       │
│  Associated Orgs    │  │Card  │ │Card  │ │Card  │       │
│  ┌──────┐ ┌──────┐ │  └──────┘ └──────┘ └──────┘      │
│  │ Org  │ │ Org  │ │                                    │
│  │ Card │ │ Card │ │  Spaces User Leads                 │
│  └──────┘ └──────┘ │  ┌──────┐ ┌──────┐                │
│                     │  │Space │ │Space │                 │
│                     │  └──────┘ └──────┘                │
│                     │                                    │
│                     │  Spaces User is In                 │
│                     │  ┌──────┐ ┌──────┐ ┌──────┐      │
│                     │  │Space │ │Space │ │Space │       │
│                     │  └──────┘ └──────┘ └──────┘      │
└─────────────────────┴────────────────────────────────────┘
```

### Key structural elements:
- **Profile Banner**: Decorative background image with large circular avatar, name, location
- **Action Icons**: Message (envelope), Settings (cog, own profile only)
- **Two-Column Layout**: Left (bio + orgs) / Right (resources, spaces)
- **Bio Section**: User-provided bio text (markdown)
- **Associated Organizations**: Grid of org cards/logos
- **Resources User Hosts**: Hosted spaces + virtual contributors
- **Spaces User Leads/Is In**: Card grids of spaces

---

## Element Inventory

### Profile Banner
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Banner container | Custom layout | `div` + Tailwind bg-image | Decorative background |
| Avatar | MUI `Avatar` (large) | `Avatar` (shadcn, large) | Large, circular |
| Name | `Typography` heading | Heading with Tailwind | User's name |
| Location | `Typography` body | Tailwind text-muted | City / location |
| Message icon | `IconButton` (envelope) | `Button` variant="ghost" size="icon" | Message user |
| Settings icon | `IconButton` (cog) | `Button` variant="ghost" size="icon" | Own profile only |
| Background image | `<img>` with overlay | CSS `bg-cover` + overlay | Decorative |

### Bio Section (Left Column)
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Bio text | Markdown render / `Typography` | Prose styles / Markdown | Rich text bio |
| Org cards | Custom card grid | `Card` (shadcn) grid | Org logo, name, associate count |
| Org avatar | MUI `Avatar` | `Avatar` (shadcn) | Square or circular |
| Org name | `Typography` | Heading with Tailwind | Organization name |
| Associate count | `Badge` / `Chip` | `Badge` (shadcn) | "Associates (12)" |

### Resources Column (Right)
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Section header | `Typography` heading | Heading with Tailwind | "Resources User Hosts" etc. |
| Space card | `ContributeCard` | `Card` (shadcn) | Space name, desc, privacy badge |
| VC card | Custom card | `Card` (shadcn) | Virtual contributor card |
| Lock icon | MUI `LockIcon` | Lucide `Lock` | Privacy indicator |
| Member count | `Typography` + icon | Tailwind text + icon | Member count per space |
| Card grid | MUI Grid / custom | Tailwind grid | Responsive grid |

---

## Prototype Status

✅ **BUILT** — `pages/UserProfilePage.tsx` + `components/user/UserProfileHeader.tsx`, `SpaceGridCard.tsx`, `OrganizationCard.tsx`

**Prototype structure:**
- `UserProfileHeader` — full-width banner image with hover zoom, gradient overlay, large Avatar (132-160px) with online indicator, name, location, action buttons (Message, Settings for own profile)
- 12-column grid: LEFT (col-span-4, sticky) — bio + organizations list; RIGHT (col-span-8) — tab bar + resource sections
- 5 tabs: All Resources / Hosted Spaces / Virtual Contributors / Leading / Member Of
- Tab content: SpaceGridCard grids (2-3 col), VC cards with Badge types

**shadcn components used:** Avatar, Badge, Button, Card

---

## Pull-Back Notes

- [ ] **Profile header** — banner + avatar pattern is close to current (`profile page.png`). Verify layout.
- [x] **12-column grid layout** — current profile may have different column split. Verify.
- [x] **5 tabs** — current profile may have different tabs. Verify against screenshot which tabs exist.
- [x] **"Virtual Contributors" tab** — this may be new/enhanced. Verify if current has this.
- [ ] **Organizations sidebar** — current has organization cards on profile. Verify placement.
- [x] **Online indicator dot** — may be new. Verify.

---

## Allowed Improvements

- **Better avatar** — shadcn Avatar with photo + initials fallback
- **Cleaner banner** — Tailwind background styling more precise
- **Card consistency** — shadcn Card for all space/org cards
- **Badge styling** — shadcn Badge for associate counts and privacy
- **Ghost buttons** — shadcn ghost buttons for action icons cleaner than MUI IconButton

---

## Figma Make Instructions

```
You are recreating the Alkemio User Profile page using shadcn/ui components.

LAYOUT (keep exactly):
- Decorative profile banner (background image + large circular avatar + name + location)
- Action icons: message (envelope), settings (cog, own profile only)
- Two-column layout below banner:
  - Left column: Bio text (rich text) + Associated Organizations (card grid)
  - Right column: Resources User Hosts (space/VC cards) + Spaces User Leads + Spaces User Is In

COMPONENTS (swap to new):
- Avatar: shadcn Avatar (large, circular, photo or initials)
- Action icons: shadcn Button variant="ghost" size="icon"
- Bio: markdown rendered with prose/Tailwind classes
- Org cards: shadcn Card with Avatar, name, associate count Badge
- Space cards: shadcn Card (same component as Dashboard + Browse All Spaces)
- Privacy badge: shadcn Badge with Lock icon
- Section headers: Tailwind headings

CONTENT (keep current):
- Profile banner: avatar, name, location, message/settings icons
- Bio section: user-provided rich text
- Organizations: associated org cards with logo and associate count
- Resources: Hosted spaces, VCs with name, desc, privacy
- Spaces: Leads and member-of sections with card grids

Use the design system tokens from design-system-page.md.
```

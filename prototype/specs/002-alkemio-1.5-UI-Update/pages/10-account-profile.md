# Page 10: My Account — My Profile Tab

> **Route**: `/user/[user-slug]/settings/profile`  
> **Access**: Authenticated user (own account only)  
> **Ref**: [master-brief.md](../master-brief.md) for component mapping  
> **Current source**: `src/domain/community/user/views/UserProfileView.tsx`

---

## Current Layout

The Profile tab is where users edit their personal profile information.

```
┌──────────────────────────────────────────────────────────┐
│  MY PROFILE* | ACCOUNT | MEMBERSHIP | ORGS | NOTIF | SET │
├──────────────────────────────────────────────────────────┤
│  ┌──────┐  First Name: [____________]                    │
│  │      │  Last Name:  [____________]                    │
│  │ AVT  │  Nickname:   [____________]                    │
│  │      │  Email:      user@example.com                  │
│  │ EDIT │  Org:        [____________ ▾]                  │
│  └──────┘                                                │
│                                                          │
│  Bio:                                                    │
│  ┌─────────────────────────────────────────────────┐     │
│  │ B  I  U  S  H  List  Link  Quote  Code          │     │
│  ├─────────────────────────────────────────────────┤     │
│  │ Rich text editor area                            │     │
│  └─────────────────────────────────────────────────┘     │
│                                                          │
│  Tagline: [________________________]                     │
│  City:    [________________________]                     │
│                                                          │
│  Links & Social:                                         │
│  LinkedIn: [________________________]                    │
│  Twitter:  [________________________]                    │
│  GitHub:   [________________________]                    │
│  Email:    [________________________]                    │
│  [+ Add Reference]                                       │
│                                                          │
│  [          SAVE          ]                               │
└──────────────────────────────────────────────────────────┘
```

### Key structural elements:
- **Two-column top**: Avatar (left) + form fields (right)
- **Form fields**: First Name, Last Name, Nickname, Email, Organization, Bio (rich text), Tagline, City
- **Links section**: LinkedIn, Twitter, GitHub, custom email, + Add Reference
- **Save button**: Full-width at bottom

---

## Element Inventory

### Avatar Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Avatar image | MUI `Avatar` (large) | `Avatar` (shadcn, large) | Large, circular, editable |
| Edit button | `Button` below avatar | `Button` variant="outline" | Upload/change avatar |

### Profile Form
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| First Name | `TextField` / Formik | `Input` (shadcn) + `Label` | Text input |
| Last Name | `TextField` / Formik | `Input` (shadcn) + `Label` | Text input |
| Nickname | `TextField` / Formik | `Input` (shadcn) + `Label` | Text input |
| Email | Display-only text | `Input` disabled or text | Read-only |
| Organization | `Select` / `Autocomplete` | `Select` (shadcn) or `Combobox` | Dropdown/search |
| Bio editor | `MarkdownEditor` (custom) | Keep rich text editor | Complex — minimal restyle |
| Tagline | `TextField` | `Input` (shadcn) + `Label` | Short text |
| City | `TextField` | `Input` (shadcn) + `Label` | Location text |

### Links & Social Section
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| LinkedIn input | `TextField` with icon | `Input` (shadcn) + prefix icon | URL input |
| Twitter input | `TextField` with icon | `Input` (shadcn) + prefix icon | URL input |
| GitHub input | `TextField` with icon | `Input` (shadcn) + prefix icon | URL input |
| Email input | `TextField` with icon | `Input` (shadcn) + prefix icon | Email input |
| Add Reference | `Button` | `Button` variant="outline" | "+ Add Reference" |

### Actions
| Element | Current Component | New Component (shadcn) | Notes |
|---------|------------------|----------------------|-------|
| Save button | `Button` (full-width) | `Button` variant="default" className="w-full" | Primary, full-width |

---

## Prototype Status

✅ **BUILT** — `pages/UserProfileSettingsPage.tsx` (323 lines)

**Prototype structure:**
- Same 6-tab navigation (MY PROFILE active)
- Two-column layout: LEFT (w-64) — Avatar with camera overlay + "Change Avatar" button; RIGHT (flex-1, max-w-3xl) — form sections
- **Identity section** — 2-col grid: First Name, Last Name, Email (read-only with Mail icon), Organization
- **About You section** — Tagline input, Location with MapPin, Bio via ReactQuill rich text editor with toolbar
- **Social Links section** — 4 social inputs (LinkedIn/Twitter/GitHub/Website) with colored circular icons + "Add Another Reference" button
- Sticky "Save Changes" button (mobile), regular button (desktop); triggers Sonner toast

**shadcn components used:** Card, Input, Button, Avatar, Separator, Label, Sonner toast

---

## Pull-Back Notes

- [ ] **Two-column layout (avatar left, form right)** — matches current profile settings concept. Verify against screenshot (`profile settings > my profile.png`).
- [ ] **Identity fields (name/email/org)** — standard, likely matches current.
- [x] **ReactQuill rich text editor for bio** — current may use a simpler textarea. Verify.
- [x] **Social links with colored icons** — current may have simpler reference/link inputs. Verify.
- [x] **"Add Another Reference" button** — current may have different reference management. Verify.
- [ ] **Sticky save button on mobile** — enhancement, acceptable to keep.

---

## Allowed Improvements

- **Input styling** — shadcn Input with Label is cleaner than MUI TextField
- **Rich text toolbar** — can be slightly refined but keep functionality
- **Button** — shadcn full-width Button looks more modern
- **Form layout** — consistent spacing with Tailwind gap utilities

---

## Figma Make Instructions

```
You are recreating the Alkemio My Profile Tab using shadcn/ui components.

LAYOUT (keep exactly):
- Horizontal tab bar (MY PROFILE active)
- Two-column top: Avatar with Edit button (left) + form fields (right)
- Form fields: First Name, Last Name, Nickname, Email, Organization, Bio (rich text), Tagline, City
- Links section: LinkedIn, Twitter, GitHub, Email, + Add Reference
- Full-width Save button at bottom

COMPONENTS (swap to new):
- Avatar: shadcn Avatar (large) + Button variant="outline" for Edit
- Form fields: shadcn Input + Label for each field
- Organization: shadcn Select or Combobox
- Bio: rich text editor (keep as-is, minimal restyle)
- Link inputs: shadcn Input with prefix icon (LinkedIn, Twitter, GitHub icons)
- Add Reference: shadcn Button variant="outline"
- Save: shadcn Button variant="default" full-width

Use the design system tokens from design-system-page.md.
```

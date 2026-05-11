# Alkemio 1.5 UI Update — Master Brief

> **Project**: Component refresh of the current Alkemio platform using the new shadcn-based design system  
> **Goal**: "This looks like the current Alkemio, but with modern components"  
> **Date**: February 2026  
> **Status**: In progress  
> **Related**: `specs/001-alkemio-design-brief/` (full redesign briefs — future target, not this project)

---

## 1. What We're Doing

We are **re-skinning the current Alkemio website** — same layouts, same pages, same functionality — using the new shadcn-based component library instead of the existing MUI components. This is a **UI refresh**, not a UX change.

### Why

1. The current design language feels dated and makes the platform look older than it is
2. A component-only refresh lets us modernize perception without disrupting user workflows
3. It's a stepping stone — developers can migrate component-by-component
4. It gives the product team time to research actual functionality changes (e.g., left nav panel) for a future release
5. It reduces risk — users keep their familiar layouts while getting a fresher look

### What "Done" Looks Like

A Figma Make prototype where every page of the current Alkemio is recreated using the new shadcn component library. Someone clicks through and says: *"This looks like current Alkemio, but nicer."*

### The Rules

1. **Keep the layout** — If the current site has a left sidebar + main content area + right utility icons, the refreshed version has the same structure
2. **Keep the navigation** — Same tabs, same menu items, same hierarchy, same routes
3. **Keep the functionality** — Same buttons do the same things. Same flows, same outcomes.
4. **Swap the components** — MUI Button → shadcn Button. MUI Card → shadcn Card. MUI Dialog → shadcn Dialog. Etc.
5. **Allow minor improvements** — If a shadcn component naturally handles something better (e.g., better hover states, cleaner dropdown, more readable typography), let it. Don't fight the new components to match old behavior that was merely a limitation.
6. **Don't add new features** — No new pages, no new navigation patterns, no new workflows. That's for the full redesign.

---

## 2. Starting Point: The Prototype

We're starting from the **existing redesigned Figma Make prototype** (30+ pages) and **pulling it back** toward the current website. The prototype is ~80% aligned but diverged in some areas (layout changes, IA reorganization, new UX patterns).

For each page, the per-page brief will note:
- What the **current site** actually looks like (layout, elements, structure)
- Where the **prototype diverges** (if at all)
- What needs to change to match the current site (the "pull-back" notes)
- What can stay as-is because the new component naturally improves it

**Prototype code files**: [TO BE ADDED — Jeroen will add code exports to this repo]

---

## 3. Component Mapping: MUI → shadcn

The current Alkemio client (`alkem-io/client-web`) is built with **Material UI (MUI)**. The new design system uses **shadcn/ui**. Below is the component mapping reference.

### 3.1 Layout Components

| Current (MUI / Custom) | New (shadcn / Tailwind) | Notes |
|------------------------|------------------------|-------|
| `Box` | `div` with Tailwind classes | Direct replacement; Box is just a styled div |
| `Paper` | `Card` (shadcn) | Paper with elevation → Card with shadow variant |
| `PageContent` (custom) | `div` with max-width + padding | Preserve the content width behavior |
| `PageContentBlock` (custom) | `Card` (shadcn) | Block sections → Card containers |
| `PageContentColumn` (custom) | Tailwind grid columns | Preserve column ratios |
| `Gutters` (custom) | Tailwind `gap-*` / `space-*` | 10px base unit → map to closest Tailwind spacing |
| `Container` | Tailwind `container mx-auto` | Standard container pattern |
| `Grid` (MUI) | Tailwind CSS Grid or Flexbox | Replace MUI grid with Tailwind grid |
| `Stack` | Tailwind `flex flex-col gap-*` | Direct replacement |

### 3.2 Navigation Components

| Current (MUI / Custom) | New (shadcn / Tailwind) | Notes |
|------------------------|------------------------|-------|
| `AppBar` | Custom header with shadcn components | Top navigation bar |
| `Tabs` / `HeaderNavigationTabs` | `Tabs` (shadcn) | Tab navigation (HOME, COMMUNITY, etc.) |
| `Drawer` | `Sheet` (shadcn) | Side panels, mobile nav |
| `Breadcrumbs` | `Breadcrumb` (shadcn) | Navigation breadcrumbs |
| `NavigationBar` (custom) | Custom with shadcn primitives | Platform top nav |
| `DashboardNavigation` (custom) | Custom sidebar with shadcn components | Left sidebar nav |

### 3.3 Data Display

| Current (MUI / Custom) | New (shadcn / Tailwind) | Notes |
|------------------------|------------------------|-------|
| `Typography` | Tailwind typography classes | h1-h6, body, caption mapped to Tailwind |
| `Chip` | `Badge` (shadcn) | Tags, filters, status indicators |
| `Avatar` | `Avatar` (shadcn) | User/space avatars |
| `Skeleton` | `Skeleton` (shadcn) | Loading placeholders |
| `Tooltip` | `Tooltip` (shadcn) | Hover info |
| `Markdown` (custom) | Preserve or use prose styles | Rich text rendering |
| `ContributeCard` (custom) | `Card` (shadcn) + hover styles | Space/content cards with elevation-on-hover |

### 3.4 Cards & Surfaces

| Current (MUI / Custom) | New (shadcn / Tailwind) | Notes |
|------------------------|------------------------|-------|
| `Paper` (elevation) | `Card` (shadcn) | Primary surface component |
| `ContributeCard` (custom) | `Card` + `CardHeader` + `CardContent` | Domain cards (Spaces, Subspaces) |
| `CardContent` / `CardActions` | shadcn `CardContent` / `CardFooter` | Card sub-components |
| `Accordion` | `Accordion` (shadcn) | Expandable sections |
| `SwapColors` (custom) | Tailwind `dark:` or CSS custom properties | Theme inversion for accent blocks |

### 3.5 Inputs & Forms

| Current (MUI / Custom) | New (shadcn / Tailwind) | Notes |
|------------------------|------------------------|-------|
| `TextField` | `Input` (shadcn) | Text fields |
| `InputField` (Formik-wrapped) | `Input` + form validation (React Hook Form or Formik) | Preserve validation behavior |
| `Select` | `Select` (shadcn) | Dropdown selects |
| `Autocomplete` | `Combobox` (shadcn) | Search + select |
| `Checkbox` | `Checkbox` (shadcn) | Checkboxes |
| `RadioGroup` | `RadioGroup` (shadcn) | Radio buttons |
| `Switch` | `Switch` (shadcn) | Toggle switches |
| `DatePicker` | `DatePicker` (shadcn) or custom | Date selection |
| `MarkdownEditor` (custom) | Preserve — complex component | Rich text editor (keep as-is or minimal restyle) |

### 3.6 Feedback & Overlays

| Current (MUI / Custom) | New (shadcn / Tailwind) | Notes |
|------------------------|------------------------|-------|
| `Dialog` / `DialogWithGrid` | `Dialog` (shadcn) | Modals and dialogs |
| `ConfirmationDialog` (custom) | `AlertDialog` (shadcn) | Destructive confirmations |
| `Collapse` | `Collapsible` (shadcn) | Expand/collapse sections |
| `Snackbar` / `Alert` | `Toast` (shadcn) | Notifications, success/error messages |
| `Loading` (custom) | `Skeleton` or spinner component | Loading states |
| `Popover` | `Popover` (shadcn) | Contextual overlays |
| `Menu` | `DropdownMenu` (shadcn) | Context menus, action menus |

### 3.7 Buttons & Actions

| Current (MUI / Custom) | New (shadcn / Tailwind) | Notes |
|------------------------|------------------------|-------|
| `Button` (MUI) | `Button` (shadcn) | All button variants |
| `IconButton` | `Button` variant="ghost" size="icon" | Icon-only buttons |
| `FloatingActionButtons` (custom) | Tailwind fixed-position button | FAB pattern |
| `FullWidthButton` (custom) | `Button` with `w-full` | Full-width CTA buttons |

---

## 4. Design Tokens: Current → New

### Typography

| Current (Montserrat + Source Sans Pro) | New (shadcn default or custom) | Guidance |
|----------------------------------------|-------------------------------|----------|
| H1: Montserrat 25px Bold | Use design system heading scale | Maintain hierarchy; exact sizes may shift |
| H2: Montserrat 22px Semibold | Use design system heading scale | |
| Body: Source Sans Pro 16px | Use design system body text | |
| Caption: Source Sans Pro 12px | Use design system small text | |

### Spacing

| Current | New | Notes |
|---------|-----|-------|
| `gutters(1)` = 10px | Tailwind `gap-2.5` (10px) or `gap-3` (12px) | Map to closest Tailwind value |
| `gutters(2)` = 20px | Tailwind `gap-5` (20px) | Direct match |
| `gutters(4)` = 40px | Tailwind `gap-10` (40px) | Direct match |
| `borderRadius: 12` | Tailwind `rounded-xl` (12px) | Direct match |

### Colors

| Current | Value | Notes |
|---------|-------|-------|
| Primary | `#1D384A` | Dark blue — map to primary in design system |
| Background | `#F1F4F5` | Light gray — page background |
| Paper | `#FFFFFF` | Card/surface background |
| Positive | Custom green | Success states |
| Negative | Custom red | Error states |
| Muted | Custom gray | Disabled/secondary text |

**Guidance**: The exact color values will come from the new design system / shadcn theme. The mapping should maintain semantic meaning (primary = primary, error = destructive, etc.) rather than trying to match hex values.

---

## 5. Per-Page Brief Format

Each page file in `pages/` follows this structure:

```markdown
# Page [N]: [Page Name]

## Current Layout
What the live Alkemio website shows for this page.
Describes: structure, columns, sidebar, header, content zones.

## Element Inventory
Every UI element on the page, grouped by zone (header, sidebar, main, footer).

## Component Mapping
Table: Current element → New shadcn component → Notes.

## Prototype Status
What the current Figma Make prototype already has for this page.
[TO BE FILLED once prototype code is added]

## Pull-Back Notes
Where the prototype needs to be adjusted to match the current site layout.
[TO BE FILLED once prototype code is added]

## Allowed Improvements
Where the new component naturally handles something better — keep these.

## Figma Make Instructions
Concise, copy-paste-ready prompt for recreating this page in Figma Make.
```

---

## 6. Page Index

All pages to be refreshed, with links to their individual briefs:

### Core Pages
| # | Page | File | Priority |
|---|------|------|----------|
| 1 | Dashboard (Home) | `pages/01-dashboard.md` | High |
| 2 | Space Home | `pages/02-space-home.md` | High |
| 3 | Community Tab | `pages/03-community-tab.md` | High |
| 4 | Subspaces Tab | `pages/04-subspaces-tab.md` | High |
| 5 | Knowledge Base Tab | `pages/05-knowledge-base-tab.md` | High |
| 6 | Post Content Dialog | `pages/06-post-dialog.md` | High |
| 7 | Subspace Page | `pages/07-subspace-page.md` | High |
| 8 | User Profile | `pages/08-user-profile.md` | Medium |

### Account & Settings
| # | Page | File | Priority |
|---|------|------|----------|
| 9 | Account / Settings (Master) | `pages/09-account-settings.md` | Medium |
| 10 | My Account — Profile Tab | `pages/10-account-profile.md` | Medium |
| 11 | My Account — Membership Tab | `pages/11-account-membership.md` | Medium |
| 12 | My Account — Organizations Tab | `pages/12-account-organizations.md` | Medium |
| 13 | My Account — Notifications Tab | `pages/13-account-notifications.md` | Medium |
| 14 | Create Space Modal | `pages/14-create-space.md` | Medium |

### Space Settings
| # | Page | File | Priority |
|---|------|------|----------|
| 15 | Space Settings (Master Layout) | `pages/15-space-settings-master.md` | Medium |
| 16 | Space Settings — Profile | `pages/16-settings-profile.md` | Low |
| 17 | Space Settings — Context | `pages/17-settings-context.md` | Low |
| 18 | Space Settings — Community | `pages/18-settings-community.md` | Low |
| 19 | Space Settings — Updates | `pages/19-settings-updates.md` | Low |
| 20 | Space Settings — Subspaces | `pages/20-settings-subspaces.md` | Low |
| 21 | Space Settings — Templates | `pages/21-settings-templates.md` | Low |
| 22 | Space Settings — Storage | `pages/22-settings-storage.md` | Low |
| 23 | Space Settings — Account | `pages/23-settings-account.md` | Low |

### Content & Detail Views
| # | Page | File | Priority |
|---|------|------|----------|
| 25 | Post Detail Page | `pages/25-post-detail.md` | High |
| 26 | Response Panel (Inline) | `pages/26-response-panel-inline.md` | Medium |
| 27 | Response Panel (Fullscreen) | `pages/27-response-panel-fullscreen.md` | Medium |

### Templates
| # | Page | File | Priority |
|---|------|------|----------|
| 28 | Template Library | `pages/28-template-library.md` | Low |
| 29 | Template Pack Detail | `pages/29-template-pack.md` | Low |
| 30 | Individual Template | `pages/30-individual-template.md` | Low |

### Discovery
| # | Page | File | Priority |
|---|------|------|----------|
| 31 | Explore All Spaces | `pages/31-explore-spaces.md` | Medium |
| 32 | Platform Search Overlay | `pages/32-platform-search.md` | Medium |

---

## 7. How to Use This Brief

### If you're working in Figma Make:
1. Open the existing prototype (duplicate file)
2. Pick a page from the index above
3. Open its per-page brief
4. Compare the current layout (described in the brief) against what the prototype currently shows
5. Apply the pull-back notes (adjust layout to match current site)
6. Apply the component mapping (swap to new shadcn components)
7. Keep the allowed improvements
8. Use the Figma Make instructions for any sections that need to be rebuilt

### If you're comparing against the live site:
- Visit `https://alkem.io/` (authenticated) for each page
- The per-page brief describes the expected layout — use it as a checklist

### If you're a developer implementing this later:
- The component mapping table (Section 3) is your migration guide
- Each per-page brief shows exactly what component goes where
- The `alkem-io/client-web` repo structure maps to these pages via the routes documented

---

## 8. Reference Sources

| Source | What it tells us | Where |
|--------|-----------------|-------|
| Live website | Current layout, visual reference | `https://alkem.io/` (authenticated) |
| Client repo | Current component structure, routes | `github.com/alkem-io/client-web` |
| Page inventory | Element inventory per page | `specs/001-alkemio-design-brief/page-inventory.md` |
| Design briefs (redesign) | Detailed per-page element lists | `specs/001-alkemio-design-brief/design-brief-per-page.md` |
| Design system docs | New component catalog | `specs/001-alkemio-design-brief/design-system-page.md` |
| shadcn/ui docs | Component API reference | `https://ui.shadcn.com/` |
| Prototype code | Current state of Figma Make file | [TO BE ADDED] |

---

*This master brief is the single source of truth for the 1.5 UI Update project. All per-page files reference back to this document for component mapping and project rules.*

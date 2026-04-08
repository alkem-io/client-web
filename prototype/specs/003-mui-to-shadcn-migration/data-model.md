# Data Model: MUI to shadcn/ui Migration

**Feature**: 003-mui-to-shadcn-migration  
**Date**: 2026-03-23  
**Status**: Complete

---

## 1. Entity Model Overview

This migration has no database or API model changes. The "data model" for a UI migration defines the structural entities that govern how the migration operates: components, tokens, mappings, and module boundaries.

---

## 2. Design Token Entity

Design tokens are the named CSS custom properties that define the visual language. They replace MUI's `createTheme()` palette/spacing/typography configuration.

### Token Schema (from prototype `theme.css`)

```
Token
├── name: string                    (CSS custom property name, e.g. "--primary")
├── value: rgba() | px | calc()     (CSS value)
├── scope: "light" | "dark"         (color mode — dark is preserved but not shipped)
├── category: enum                  (color | spacing | typography | radius | shadow | sidebar)
└── tailwind-alias: string          (Tailwind color name, e.g. "primary")
```

### Token Categories

| Category | Tokens | Example |
|----------|--------|---------|
| **Color — Semantic** | `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground` | `--primary: rgba(29, 56, 74, 1.00)` |
| **Color — Surface** | `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground` | `--background: rgba(255, 255, 255, 1.00)` |
| **Color — Input** | `--border`, `--input`, `--input-background`, `--ring` | `--border: rgba(226, 232, 240, 1.00)` |
| **Color — Status** | `--success`, `--success-foreground`, `--warning`, `--warning-foreground`, `--info`, `--info-foreground` | `--success: rgba(34, 197, 94, 1.00)` |
| **Color — Chart** | `--chart-1` through `--chart-5` | Sequential data visualization palette |
| **Color — Sidebar** | `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring` | Sidebar-specific tokens |
| **Radius** | `--radius` (base), derived: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` | `--radius: 6px` |
| **Shadow** | `--elevation-sm` | `0px 4px 6px 0px rgba(0,0,0,0.09)` |
| **Typography** | `--text-4xl` through `--text-sm`, `--font-weight-normal`, `--font-weight-medium`, `--font-size` | `--text-base: 16px` |

### Token → Tailwind Mapping (via `@theme inline`)

| CSS Variable | Tailwind Utility | Usage |
|-------------|-----------------|-------|
| `--primary` | `tw-bg-primary`, `tw-text-primary` | Buttons, links, interactive elements |
| `--primary-foreground` | `tw-text-primary-foreground` | Text on primary backgrounds |
| `--secondary` | `tw-bg-secondary` | Secondary buttons |
| `--muted` | `tw-bg-muted` | Disabled elements |
| `--muted-foreground` | `tw-text-muted-foreground` | Secondary text |
| `--destructive` | `tw-bg-destructive` | Delete buttons, error states |
| `--background` | `tw-bg-background` | Page background |
| `--foreground` | `tw-text-foreground` | Default text |
| `--card` | `tw-bg-card` | Card backgrounds |
| `--border` | `tw-border-border` | Element borders |
| `--ring` | `tw-ring-ring` | Focus rings |
| `--radius` | `tw-rounded-lg` (base) | Border radius |

---

## 3. Component Mapping Entity

Defines the 1:1 correspondence between MUI components and their shadcn/Tailwind replacements.

### Mapping Schema

```
ComponentMapping
├── mui_component: string          (MUI component name)
├── mui_import: string             (Import path, e.g. "@mui/material/Button")
├── shadcn_component: string       (shadcn component name, or "Tailwind" for utility-only)
├── shadcn_file: string            (Source file in prototype, e.g. "ui/button.tsx")
├── prop_changes: PropChange[]     (API differences)
├── files_affected: number         (Count of files importing this MUI component)
└── migration_complexity: "low" | "medium" | "high"
```

### Complete Component Mapping Table

#### Layout Components (Low Complexity)

| MUI Component | shadcn/Tailwind | Files | Complexity | Key Changes |
|---------------|----------------|-------|------------|-------------|
| `Box` | `div` + Tailwind classes | ~300 | Low | Remove `sx` prop → Tailwind classes |
| `Paper` | `Card` (shadcn) | ~50 | Low | `elevation` → shadow variant |
| `Container` | `tw-container tw-mx-auto` | ~10 | Low | Direct replacement |
| `Grid` | Tailwind CSS Grid/Flexbox | ~80 | Medium | `xs={12} md={6}` → `tw-grid tw-grid-cols-1 md:tw-grid-cols-2` |
| `Stack` | `tw-flex tw-flex-col tw-gap-*` | ~40 | Low | Direct replacement |
| `Divider` | `Separator` (shadcn) | ~20 | Low | Direct replacement |

#### Navigation Components (Medium Complexity)

| MUI Component | shadcn/Tailwind | Files | Complexity | Key Changes |
|---------------|----------------|-------|------------|-------------|
| `Tabs` / `Tab` | `Tabs` (shadcn) | ~30 | Medium | MUI `onChange` → shadcn `onValueChange` |
| `Breadcrumbs` | `Breadcrumb` (shadcn) | ~5 | Low | Direct replacement |
| `Drawer` | `Sheet` (shadcn) | ~10 | Medium | Different animation model |
| `AppBar` | Custom header + Tailwind | ~5 | Medium | Full restyle |

#### Data Display (Low–Medium Complexity)

| MUI Component | shadcn/Tailwind | Files | Complexity | Key Changes |
|---------------|----------------|-------|------------|-------------|
| `Typography` | Tailwind text utilities | ~64 | Low | `variant="h1"` → `tw-text-2xl tw-font-bold` |
| `Chip` | `Badge` (shadcn) | ~30 | Low | `onDelete` → custom close button |
| `Avatar` | `Avatar` (shadcn) | ~40 | Low | Direct replacement |
| `Skeleton` | `Skeleton` (shadcn) | ~15 | Low | Direct replacement |
| `Tooltip` | `Tooltip` (shadcn) | ~20 | Low | Different wrapping pattern (Radix requires trigger child) |

#### Cards & Surfaces (Low Complexity)

| MUI Component | shadcn/Tailwind | Files | Complexity | Key Changes |
|---------------|----------------|-------|------------|-------------|
| `Card` | `Card` (shadcn) | ~50 | Low | Sub-components: `CardHeader`, `CardContent`, `CardFooter` |
| `Accordion` | `Accordion` (shadcn) | ~10 | Low | Direct replacement |
| `Collapse` | `Collapsible` (shadcn) | ~15 | Low | Different trigger mechanism |

#### Inputs & Forms (High Complexity)

| MUI Component | shadcn/Tailwind | Files | Complexity | Key Changes |
|---------------|----------------|-------|------------|-------------|
| `TextField` | `Input` (shadcn) | ~50 | Medium | No built-in label — use `Label` separately |
| `Select` | `Select` (shadcn) | ~25 | Medium | Radix-based, different option rendering |
| `Autocomplete` | `Command` (cmdk) | ~15 | High | Entirely different API (cmdk command palette) |
| `Checkbox` | `Checkbox` (shadcn) | ~10 | Low | Direct replacement |
| `RadioGroup` | `RadioGroup` (shadcn) | ~5 | Low | Direct replacement |
| `Switch` | `Switch` (shadcn) | ~10 | Low | Direct replacement |
| `DatePicker` (MUI X) | `Calendar` (react-day-picker) | 1 | Medium | Different API |
| `DataGrid` (MUI X) | TanStack Table + `Table` | 11 | High | Headless library — requires full rewrite |

#### Feedback & Overlays (Medium Complexity)

| MUI Component | shadcn/Tailwind | Files | Complexity | Key Changes |
|---------------|----------------|-------|------------|-------------|
| `Dialog` | `Dialog` (shadcn) | ~319 | Medium | Radix-based, different open/close pattern |
| `AlertDialog` (confirm pattern) | `AlertDialog` (shadcn) | ~20 | Low | Built-in confirm/cancel pattern |
| `Snackbar` / `Alert` | `Sonner` (sonner) | ~15 | Medium | Toast-based, different API (toast() function) |
| `Popover` | `Popover` (shadcn) | ~10 | Low | Direct replacement |
| `Menu` | `DropdownMenu` (shadcn) | ~25 | Medium | Radix-based, different trigger pattern |

#### Buttons & Actions (Low Complexity)

| MUI Component | shadcn/Tailwind | Files | Complexity | Key Changes |
|---------------|----------------|-------|------------|-------------|
| `Button` | `Button` (shadcn) | ~252 | Low | Variant names: `contained`→`default`, `outlined`→`outline`, `text`→`ghost` |
| `IconButton` | `Button` variant="ghost" size="icon" | ~50 | Low | Size/variant combo |
| `LoadingButton` | `Button` + spinner | ~10 | Low | Add spinner conditional |

---

## 4. Icon Mapping Entity

### Schema

```
IconMapping
├── mui_name: string               (MUI icon component name)
├── mui_import: string             (e.g. "@mui/icons-material/Close")
├── lucide_name: string            (Lucide icon component name)
├── lucide_import: string          (e.g. "lucide-react")
├── usage_count: number            (Files importing this icon)
└── size_default: string           (Default size in pixels, typically 24)
```

203 unique icon mappings — full mapping generated from codebase analysis as part of Phase B implementation. Top 20 documented in [research.md](research.md).

---

## 5. Form Schema Migration Entity

### Schema

```
FormSchemaMigration
├── file_path: string              (Source file containing Yup schema)
├── yup_schema: YupSchemaShape     (Current Yup validation shape)
├── zod_schema: ZodSchemaShape     (Equivalent Zod validation shape)
├── form_component: string         (Formik form component using this schema)
├── graphql_mutation: string       (Apollo mutation the form submits to)
└── fields: FormField[]            (Field names, types, validation rules)
```

### Yup → Zod Conversion Patterns

| Yup | Zod | Notes |
|-----|-----|-------|
| `Yup.string().required()` | `z.string().min(1)` | Zod's `required` is default; min(1) enforces non-empty |
| `Yup.string().email()` | `z.string().email()` | Direct equivalent |
| `Yup.string().url()` | `z.string().url()` | Direct equivalent |
| `Yup.string().max(255)` | `z.string().max(255)` | Direct equivalent |
| `Yup.string().min(3)` | `z.string().min(3)` | Direct equivalent |
| `Yup.number().positive()` | `z.number().positive()` | Direct equivalent |
| `Yup.number().integer()` | `z.number().int()` | Method name differs |
| `Yup.boolean()` | `z.boolean()` | Direct equivalent |
| `Yup.array().of(...)` | `z.array(...)` | Syntax differs |
| `Yup.object().shape({})` | `z.object({})` | Direct equivalent |
| `Yup.mixed().oneOf([...])` | `z.enum([...])` | Different API |
| `Yup.string().nullable()` | `z.string().nullable()` | Direct equivalent |
| `Yup.string().optional()` | `z.string().optional()` | Direct equivalent |
| `Yup.ref('field')` | `z.refine()` (custom) | Cross-field validation requires refine |
| `Yup.string().when(...)` | `z.discriminatedUnion()` or `.refine()` | Conditional validation |

---

## 6. Module Dependency Graph

```
core/ui/         ← PRIMARY TARGET (shared primitives)
    ↑
domain/*          ← SECONDARY TARGET (domain components import core/ui)
    ↑
main/             ← TERTIARY TARGET (page shells import domain)
```

### Migration Order Constraint
Core/ui must be migrated first because all domain and main modules depend on it. Within core/ui, dependencies flow:

```
themes/ → palette/ → typography/ → button/ → card/ → dialog/ → forms/ → ...
```

The `themes/` directory (MUI ThemeProvider, createTheme) is replaced first with CSS custom properties. Then individual component directories can be migrated in any order, as they primarily depend on tokens (now CSS vars) rather than each other.

---

## 7. Page-to-Module Mapping

All 32 pages from the master brief (`specs/002-alkemio-1.5-UI-Update/master-brief.md` Section 6):

| # | Page (from master brief) | Primary Module | Priority |
|---|--------------------------|---------------|----------|
| 1 | Dashboard (Home) | `main/topLevelPages/`, `domain/shared/` | P1 |
| 2 | Space Home | `domain/space/` | P1 |
| 3 | Community Tab | `domain/community/` | P1 |
| 4 | Subspaces Tab | `domain/space/` | P1 |
| 5 | Knowledge Base Tab | `domain/collaboration/` | P1 |
| 6 | Post Content Dialog | `domain/collaboration/` | P1 |
| 7 | Subspace Page | `domain/space/` | P1 |
| 8 | User Profile | `domain/community/` | P2 |
| 9 | Account / Settings (Master) | `domain/account/`, `main/topLevelPages/` | P2 |
| 10 | My Account — Profile Tab | `domain/account/` | P2 |
| 11 | My Account — Membership Tab | `domain/account/` | P2 |
| 12 | My Account — Organizations Tab | `domain/account/` | P2 |
| 13 | My Account — Notifications Tab | `domain/account/` | P2 |
| 14 | Create Space Modal | `domain/space/` | P2 |
| 15 | Space Settings (Master Layout) | `domain/spaceAdmin/` | P2 |
| 16 | Space Settings — Profile | `domain/spaceAdmin/` | P2 |
| 17 | Space Settings — Context | `domain/spaceAdmin/` | P2 |
| 18 | Space Settings — Community | `domain/spaceAdmin/` | P2 |
| 19 | Space Settings — Updates | `domain/spaceAdmin/` | P2 |
| 20 | Space Settings — Subspaces | `domain/spaceAdmin/` | P2 |
| 21 | Space Settings — Templates | `domain/spaceAdmin/` | P2 |
| 22 | Space Settings — Storage | `domain/spaceAdmin/` | P2 |
| 23 | Space Settings — Account | `domain/spaceAdmin/` | P2 |
| 25 | Post Detail Page | `domain/collaboration/` | P1 |
| 26 | Response Panel (Inline) | `domain/collaboration/` | P2 |
| 27 | Response Panel (Fullscreen) | `domain/collaboration/` | P2 |
| 28 | Template Library | `domain/templates/` | P3 |
| 29 | Template Pack Detail | `domain/templates/` | P3 |
| 30 | Individual Template | `domain/templates/` | P3 |
| 31 | Explore All Spaces | `domain/space/`, `main/topLevelPages/` | P3 |
| 32 | Platform Search Overlay | `core/ui/search/`, `main/` | P3 |

> Note: Page 24 is not listed in the master brief (numbering gap). Total: 31 pages.

---

## 8. State Transitions

### Component Migration States

```
[MUI Only] → [MUI + shadcn Coexist] → [shadcn Only] → [Cleanup Complete]
```

Each file progresses through these states individually. The overall project is "Cleanup Complete" only when ALL files have reached that state and MUI dependencies are removed from package.json.

### Page Migration States

```
[Not Started] → [Core Components Ready] → [Page Migrated] → [Visually Verified] → [Done]
```

A page is "Done" when:
1. All components on the page use shadcn/Tailwind
2. Visual output matches the prototype reference
3. All interactive elements function correctly
4. Existing tests pass

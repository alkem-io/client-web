# Research: MUI to shadcn/ui Migration

**Feature**: 003-mui-to-shadcn-migration  
**Date**: 2026-03-23  
**Status**: Complete

---

## 1. Tailwind CSS v4 + MUI Coexistence

### Decision: Use `tw-` prefix for Tailwind classes during transition

### Rationale
- MUI uses Emotion CSS-in-JS which generates `.css-xxxxx` class names at runtime
- Tailwind CSS v4 generates utility classes like `.flex`, `.p-4`, `.bg-primary`
- Without prefixing, potential conflicts exist for class names like `container`, `hidden`, `visible` which both systems may define
- Tailwind v4 supports prefix configuration natively via `@import "tailwindcss" prefix(tw)`
- The `tw-` prefix adds ~3 characters per class but eliminates any collision risk
- After MUI removal (Phase F), the prefix is removed globally via find-and-replace

### Alternatives Considered
1. **No prefix**: Risk of subtle CSS specificity bugs during coexistence — rejected for safety
2. **CSS Layers (`@layer`)**: Tailwind v4 uses layers by default but doesn't prevent name collisions — insufficient alone
3. **CSS Modules**: Would require rewriting all component files — too invasive during migration

### Implementation
```css
/* client-web/styles/tailwind.css */
@import 'tailwindcss' prefix(tw) source(none);
@source '../src/**/*.{js,ts,jsx,tsx}';
@import 'tw-animate-css';
```

---

## 2. shadcn/ui Component Integration Strategy

### Decision: Copy 47 shadcn primitives from prototype, adapt for client-web patterns

### Rationale
- The prototype (`prototype/src/app/components/ui/`) contains 47 pre-configured shadcn components already using Alkemio's design tokens
- These are not npm packages — shadcn components are source files that you own and modify
- The prototype components use `@/` path alias which maps to `client-web/src/` equivalently
- Components depend on: `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/*` packages, `lucide-react`

### Component Inventory (47 primitives from prototype)

| Component | Radix Dependency | Used in Pages |
|-----------|-----------------|---------------|
| accordion | @radix-ui/react-accordion | Settings, FAQ |
| alert-dialog | @radix-ui/react-alert-dialog | Confirmations |
| alert | — | Error/success messages |
| aspect-ratio | @radix-ui/react-aspect-ratio | Images |
| avatar | @radix-ui/react-avatar | User/space avatars |
| badge | — | Tags, status |
| breadcrumb | — | Navigation |
| button | @radix-ui/react-slot | All pages |
| calendar | react-day-picker | Date selection |
| card | — | All pages |
| carousel | embla-carousel-react | Gallery |
| chart | recharts | Analytics |
| checkbox | @radix-ui/react-checkbox | Forms |
| collapsible | @radix-ui/react-collapsible | Expandable sections |
| command | cmdk | Command palette |
| context-menu | @radix-ui/react-context-menu | Right-click menus |
| dialog | @radix-ui/react-dialog | Modals |
| drawer | vaul | Mobile drawers |
| dropdown-menu | @radix-ui/react-dropdown-menu | Action menus |
| form | react-hook-form | All forms |
| hover-card | @radix-ui/react-hover-card | User previews |
| input-otp | input-otp | Verification codes |
| input | — | All forms |
| label | @radix-ui/react-label | Form labels |
| markdown-editor | — | Rich text |
| menubar | @radix-ui/react-menubar | Menu bars |
| navigation-menu | @radix-ui/react-navigation-menu | Top nav |
| pagination | — | List pagination |
| popover | @radix-ui/react-popover | Popovers |
| progress | @radix-ui/react-progress | Progress bars |
| radio-group | @radix-ui/react-radio-group | Form radios |
| resizable | react-resizable-panels | Panel layouts |
| scroll-area | @radix-ui/react-scroll-area | Scrollable areas |
| select | @radix-ui/react-select | Dropdowns |
| separator | @radix-ui/react-separator | Visual dividers |
| sheet | @radix-ui/react-dialog | Side panels |
| sidebar | — | App sidebar |
| skeleton | — | Loading states |
| slider | @radix-ui/react-slider | Range inputs |
| sonner | sonner | Toast notifications |
| switch | @radix-ui/react-switch | Toggle switches |
| table | — | Data tables |
| tabs | @radix-ui/react-tabs | Tabbed content |
| textarea | — | Multi-line input |
| toggle-group | @radix-ui/react-toggle-group | Toggle buttons |
| toggle | @radix-ui/react-toggle | Toggle buttons |
| tooltip | @radix-ui/react-tooltip | Hover tooltips |

### Adaptation Required
- Path alias: prototype uses `@/` → client-web uses `@/` (same, via tsconfig paths)
- The `cn()` utility from `prototype/src/app/components/ui/utils.ts` must be placed at `client-web/src/core/ui/utils/cn.ts`
- Each shadcn component gets Tailwind classes with `tw-` prefix during coexistence

---

## 3. TanStack Table for DataGrid Replacement

### Decision: TanStack Table v8 (headless) + shadcn Table component

### Rationale
- MUI X DataGrid (`@mui/x-data-grid`) is used in 11 files, primarily in admin/settings pages
- TanStack Table is headless — it handles sorting, filtering, pagination, column resizing logic without any UI
- shadcn's Table component provides the visual layer
- This matches the prototype's architecture (no MUI data grid dependency)
- TanStack Table has React 19 support and is actively maintained

### Alternatives Considered
1. **AG Grid Community**: Heavier dependency, different API surface — rejected as over-engineered for 11 files
2. **Keep MUI X DataGrid**: Would prevent full MUI removal — rejected per FR-013
3. **Custom table with Tailwind**: No sorting/pagination logic — rejected as under-engineered

### Migration Pattern
```tsx
// Before (MUI X DataGrid)
import { DataGrid, GridColDef } from '@mui/x-data-grid';
const columns: GridColDef[] = [...];
<DataGrid rows={data} columns={columns} />

// After (TanStack Table + shadcn)
import { useReactTable, getCoreRowModel, ... } from '@tanstack/react-table';
import { Table, TableBody, TableRow, TableCell, ... } from '@/core/ui/table';
const table = useReactTable({ data, columns, getCoreRowModel() });
<Table>...</Table>
```

---

## 4. React Hook Form + Zod for Form Migration

### Decision: Full Formik+Yup → React Hook Form+Zod migration

### Rationale
- Formik is used in 96 files, Yup schemas in 63 files
- React Hook Form (RHF) is the shadcn/ui default form library — the prototype's `form.tsx` component wraps RHF
- RHF is smaller (8.6kB vs Formik 12.7kB), faster (fewer re-renders via uncontrolled inputs), and has native React 19 support
- Zod provides TypeScript type inference from schemas, reducing duplicate type definitions
- The prototype already demonstrates the RHF+Zod pattern in its form components

### Alternatives Considered
1. **Keep Formik**: Would create an inconsistent developer experience with shadcn form patterns — rejected
2. **Formik + Zod** (hybrid): Non-standard, fragile — rejected
3. **Migrate forms last**: Spec requires full migration — forms cannot be deferred indefinitely, but they ARE migrated in Phase D (after visual components)

### Migration Pattern
```tsx
// Before (Formik + Yup)
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
const schema = Yup.object({ name: Yup.string().required() });
<Formik validationSchema={schema} onSubmit={handleSubmit}>
  <Form><Field name="name" component={InputField} /></Form>
</Formik>

// After (React Hook Form + Zod)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
const schema = z.object({ name: z.string().min(1) });
const form = useForm({ resolver: zodResolver(schema) });
<Form {...form}><FormField name="name" render={...} /></Form>
```

---

## 5. Icon Migration: MUI Icons → Lucide React

### Decision: Full migration of 203 unique MUI icons to Lucide React equivalents

### Rationale
- `@mui/icons-material` is imported in 281 files using 203 unique icon components
- Lucide React is the shadcn/ui default icon library (tree-shakeable, consistent style)
- The prototype already uses Lucide React exclusively
- Creating an icon alias file enables incremental migration without mass import changes

### Approach
1. Create `client-web/src/core/ui/icon/icons.ts` — re-exports mapping MUI icon names to Lucide equivalents
2. Existing imports like `import HelpOutlineIcon from '@mui/icons-material/HelpOutline'` become `import { HelpCircle as HelpOutlineIcon } from 'lucide-react'` during file migration
3. The alias file allows a two-phase approach: first create aliases, then update call sites file-by-file

### Key Mappings (203 icons — top 20 by usage)

| MUI Icon | Lucide Equivalent |
|----------|------------------|
| `Close` | `X` |
| `Add` | `Plus` |
| `Edit` | `Pencil` |
| `Delete` / `DeleteOutlined` | `Trash2` |
| `Search` | `Search` |
| `Settings` / `SettingsOutlined` | `Settings` |
| `MoreVert` | `MoreVertical` |
| `ExpandMore` | `ChevronDown` |
| `ExpandLess` | `ChevronUp` |
| `ArrowBack` | `ArrowLeft` |
| `ArrowForward` | `ArrowRight` |
| `CheckCircle` / `CheckCircleOutlined` | `CheckCircle` |
| `Info` / `InfoOutlined` | `Info` |
| `Warning` / `WarningAmber` | `AlertTriangle` |
| `Error` / `ErrorOutline` | `AlertCircle` |
| `Help` / `HelpOutline` | `HelpCircle` |
| `Send` | `Send` |
| `Download` | `Download` |
| `ContentCopy` | `Copy` |
| `Visibility` / `VisibilityOff` | `Eye` / `EyeOff` |

Complete mapping will be generated as part of Phase B (icon alias file).

---

## 6. Design Token Integration

### Decision: Adopt prototype's CSS custom properties via theme.css

### Rationale
- The prototype defines all design tokens in `prototype/src/styles/theme.css`
- Tokens use the shadcn/ui convention: `--primary`, `--background`, `--border`, etc.
- Tailwind v4's `@theme inline` directive maps CSS variables to Tailwind color utilities
- The current MUI theme uses `createTheme()` with `palette.ts` — this is replaced entirely

### Stakeholder-Confirmed Token Changes

| Token | Current Value | New Value (Prototype) | Decision |
|-------|--------------|----------------------|----------|
| Primary color | `#1D384A` | `#1D384A` (rgba) | Keep — same value |
| Font family | Montserrat + Source Sans Pro | Inter | ADOPT prototype |
| Border radius | 12px | 6px | ADOPT prototype |
| Page background | `#F1F4F5` | White (`#FFFFFF`) | ADOPT prototype |
| Card background | White | White | Keep — same |
| Muted foreground | Custom gray | `#64748B` (slate-500) | ADOPT prototype |

---

## 7. Gutters Spacing System Migration

### Decision: Map gutters() calls to Tailwind spacing utilities

### Rationale
- The `gutters()` function returns `n × 10px` and is used in 292 files
- Tailwind uses a 4px base spacing scale (1 = 0.25rem = 4px)
- Not all gutters values have exact Tailwind matches — nearest values used

### Mapping Table

| `gutters()` Call | Pixels | Tailwind Class | Exact Match? |
|-----------------|--------|----------------|-------------|
| `gutters(0.5)` | 5px | `tw-p-1.5` (6px) | ~1px off |
| `gutters(1)` | 10px | `tw-p-2.5` (10px) | Exact |
| `gutters(1.5)` | 15px | `tw-p-4` (16px) | ~1px off |
| `gutters(2)` | 20px | `tw-p-5` (20px) | Exact |
| `gutters(3)` | 30px | `tw-p-8` (32px) | ~2px off |
| `gutters(4)` | 40px | `tw-p-10` (40px) | Exact |

### Note
As the prototype is the visual target (not pixel-perfect current site), the slight differences are acceptable. The prototype's spacing already uses Tailwind's default scale.

---

## 8. Typography Migration

### Decision: Create Tailwind-based wrapper components with same export names

### Rationale
- 289 files import custom typography components (`PageTitle`, `BlockTitle`, `BlockSectionTitle`, `Tagline`, `Caption`, `CaptionSmall`, `CardText`, `Text`)
- Keeping the same component names avoids mass import path changes
- Components become thin Tailwind class wrappers instead of MUI Typography wrappers

### New Typography Components

| Component | HTML Element | Tailwind Classes |
|-----------|-------------|-----------------|
| `PageTitle` | `h1` | `tw-text-lg tw-font-bold tw-font-sans` |
| `BlockTitle` | `h2` | `tw-text-[15px] tw-font-normal tw-font-sans` |
| `BlockSectionTitle` | `h3` | `tw-text-xs tw-font-normal tw-font-sans` |
| `Tagline` | `h4` | `tw-text-base tw-italic tw-font-sans` |
| `Text` | `p` | `tw-text-sm tw-font-sans` |
| `CardText` | `p` | `tw-text-xs tw-text-muted-foreground tw-font-sans` |
| `Caption` | `span` | `tw-text-xs tw-font-sans` |
| `CaptionSmall` | `span` | `tw-text-xs tw-italic tw-font-sans` |

Note: Font family is Inter (adopted from prototype) — `tw-font-sans` maps to Inter via Tailwind config.

---

## 9. SwapColors Theme Inversion

### Decision: Replace MUI ThemeProvider inversion with CSS class-based approach

### Rationale
- `SwapColors` is used in 19 files to invert the color scheme (e.g., dark nav bars, accent sections)
- Currently works by wrapping content in a `<ThemeProvider>` with an inverted MUI theme
- Tailwind + CSS custom properties enable a simpler pattern using a CSS class

### Implementation
```css
/* In theme.css */
.inverted-theme {
  --background: var(--primary);
  --foreground: var(--primary-foreground);
  /* ... other inversions */
}
```
```tsx
// Before
<SwapColors><NavBar /></SwapColors>

// After
<div className="inverted-theme"><NavBar /></div>
```

---

## 10. Build Pipeline Changes

### Decision: Add Tailwind CSS v4 Vite plugin, keep existing build pipeline

### Rationale
- Vite already used as the build tool — Tailwind v4 has a first-party `@tailwindcss/vite` plugin
- No changes to chunk splitting strategy during migration (MUI vendor chunks will naturally shrink)
- After final MUI removal, update `vite.config.mjs` to remove MUI-specific optimizations

### New Dependencies

| Package | Version (from prototype) | Purpose |
|---------|-------------------------|---------|
| `tailwindcss` | 4.1.12 | CSS utility framework |
| `@tailwindcss/vite` | 4.1.12 | Vite build plugin |
| `class-variance-authority` | 0.7.1 | Component variant API |
| `clsx` | 2.1.1 | Conditional class joining |
| `tailwind-merge` | 3.2.0 | Tailwind class deduplication |
| `tw-animate-css` | 1.3.8 | Animation utilities |
| `lucide-react` | 0.487.0 | Icon library |
| `react-hook-form` | 7.55.0 | Form management |
| `zod` | (latest) | Schema validation |
| `@hookform/resolvers` | (latest) | Zod resolver for RHF |
| `@tanstack/react-table` | (latest) | Headless data table |
| `sonner` | 2.0.3 | Toast notifications |
| `cmdk` | 1.1.1 | Command palette |
| `vaul` | 1.1.2 | Drawer component |
| `embla-carousel-react` | 8.6.0 | Carousel |
| `react-day-picker` | 8.10.1 | Calendar/date picker |
| `input-otp` | 1.4.2 | OTP input |
| `react-resizable-panels` | 2.1.7 | Resizable panels |
| `@radix-ui/react-*` | Various | 20+ Radix UI primitives |

### Packages Removed (Phase F only)

| Package | Reason |
|---------|--------|
| `@mui/material` | Replaced by shadcn/ui |
| `@mui/icons-material` | Replaced by Lucide React |
| `@mui/system` | Replaced by Tailwind CSS |
| `@mui/x-data-grid` | Replaced by TanStack Table |
| `@mui/x-date-pickers` | Replaced by react-day-picker |
| `@mui/types` | No longer needed |
| `@emotion/react` | No longer needed (Tailwind replaces CSS-in-JS) |
| `@emotion/styled` | No longer needed |
| `formik` | Replaced by React Hook Form |
| `yup` | Replaced by Zod |

---

## 11. Testing Strategy

### Decision: Adapt existing tests, no new test framework

### Rationale
- Existing tests use Vitest + @testing-library/react
- @testing-library queries by text, role, label — not by component library internals
- Most tests should pass after migration with minimal changes to render wrappers
- Tests that query MUI-specific classes or data attributes need updating

### Test Migration Approach
1. **Unit tests**: Update component render wrappers (replace MUI ThemeProvider with plain render)
2. **Integration tests**: Verify form submissions still work after Formik→RHF migration
3. **Visual regression**: Add screenshot comparison for P1 pages against prototype
4. **Performance baseline**: Capture pre-migration LCP and bundle size metrics before starting

---

## 12. Prototype Data Gaps

### Decision: Follow the data gap analysis — remove UI elements with no API backing

### Rationale
- The data gap analysis (`specs/002-alkemio-1.5-UI-Update/data-gap-analysis.md`) documents 20 RED items (UI shows data not in API)
- These prototype UI elements must be removed or adapted during migration
- Key items affected: like counts, share buttons, online status dots, storage breakdown, read receipts

### Items to Remove from Prototype Before Copying
- Like count on PostCard
- Share button on PostCard
- "Last visited" on RecentSpaces
- Online status green dots
- Read receipts on messages
- Storage breakdown details
- Platform uptime/active sessions admin stats

### Items to Adapt
- Author role badges: use API community roles (Member/Lead/Admin) only
- Channel names: use "Callout" terminology to match API
- Plan names: use entitlement details or generic labels

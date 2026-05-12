# Implementation Plan: MUI to shadcn/ui Migration

**Branch**: `003-mui-to-shadcn-migration` | **Date**: 2026-03-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-mui-to-shadcn-migration/spec.md`

## Summary

Migrate the Alkemio `client-web` production frontend from MUI v7 + Emotion to shadcn/ui + Tailwind CSS v4, using the working prototype in `prototype/` as the visual and component reference. The migration replaces the full UI component layer (765 files with MUI imports), form system (Formik+Yup → React Hook Form+Zod in 96 files), icon library (203 unique MUI icons → Lucide React in 281 files), and custom styling system (`sx` prop in 435 files, `gutters()` in 292 files, `styled()` in 51 files) while preserving all GraphQL API integrations, routing, authentication, i18n, and business logic. Tailwind CSS prefixing (`tw-`) enables incremental coexistence during transition.

## Technical Context

**Language/Version**: TypeScript 5.8, React 19.2, Node.js 24+
**Primary Dependencies**:
  - **Current**: MUI v7 (`@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`, `@mui/x-date-pickers`), Emotion (`@emotion/react`, `@emotion/styled`), Formik 2.x, Yup 1.x
  - **Target**: shadcn/ui (Radix UI primitives), Tailwind CSS v4, Lucide React, React Hook Form 7.x, Zod, TanStack Table, Sonner, class-variance-authority, tailwind-merge, clsx
  - **Preserved**: Apollo Client 3.x (GraphQL), React Router v7, react-i18next, TipTap 3.x, @dnd-kit, Excalidraw, Sentry, Vite 7
**Storage**: N/A (GraphQL API — no changes)
**Testing**: Vitest + @testing-library/react + Playwright
**Target Platform**: Web (modern browsers, SPA)
**Project Type**: Web application (single-page app)
**Performance Goals**: Dashboard LCP within 10% of pre-migration baseline; bundle size ≤ pre-migration baseline
**Constraints**: Zero functional regressions, all existing automated tests must pass, light mode only
**Scale/Scope**: 1,681 source files (1,119 .tsx + 562 .ts), 765 files with MUI imports, 32 pages across 3 modules (core/, domain/, main/)

## Constitution Check

*GATE: The repository constitution is a template (not customized). Applying general SDD principles.*

| Gate | Status | Notes |
|------|--------|-------|
| No new features added | PASS | Migration is purely visual — same functionality, new component library |
| Incremental delivery | PASS | Page-by-page migration with MUI/shadcn coexistence via Tailwind prefixing |
| Test coverage preserved | PASS | Existing tests kept; component render wrappers may change |
| No breaking API changes | PASS | GraphQL layer untouched |
| Performance maintained | PASS | SC-004 (bundle ≤ baseline), SC-006 (LCP within 10%) |
| Accessibility preserved | PASS | Radix UI provides accessible defaults; SC-007 requires equal or better scores |

## Project Structure

### Documentation (this feature)

```text
specs/003-mui-to-shadcn-migration/
├── plan.md              # This file
├── research.md          # Phase 0 output — technology decisions & rationale
├── data-model.md        # Phase 1 output — component & token mapping model
├── quickstart.md        # Phase 1 output — developer onboarding guide
├── contracts/           # Phase 1 output — component API contracts
│   ├── component-api.md       # shadcn component integration contract
│   ├── design-tokens.md       # CSS custom property token contract
│   └── form-migration.md      # React Hook Form + Zod migration contract
├── checklists/          # Quality checklists
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
client-web/
├── src/
│   ├── core/
│   │   ├── ui/                    # PRIMARY MIGRATION TARGET — shared UI components
│   │   │   ├── actions/           # → shadcn Button + DropdownMenu
│   │   │   ├── avatar/            # → shadcn Avatar
│   │   │   ├── button/            # → shadcn Button (variants)
│   │   │   ├── card/              # → shadcn Card
│   │   │   ├── dialog/            # → shadcn Dialog + AlertDialog
│   │   │   ├── forms/             # → React Hook Form + Zod + shadcn Input/Select
│   │   │   ├── grid/              # → Tailwind CSS Grid/Flexbox
│   │   │   ├── icon/              # → Lucide React icons
│   │   │   ├── layout/            # → Tailwind layout utilities
│   │   │   ├── loading/           # → shadcn Skeleton
│   │   │   ├── markdown/          # → Preserve TipTap core, restyle wrapper
│   │   │   ├── menu/              # → shadcn DropdownMenu
│   │   │   ├── navigation/        # → shadcn Tabs, Breadcrumb, custom nav
│   │   │   ├── table/             # → TanStack Table + shadcn Table
│   │   │   ├── tabs/              # → shadcn Tabs
│   │   │   ├── tags/              # → shadcn Badge
│   │   │   ├── themes/            # → REMOVE: replaced by theme.css + Tailwind
│   │   │   ├── tooltip/           # → shadcn Tooltip
│   │   │   ├── typography/        # → Tailwind typography wrappers
│   │   │   └── ...               # 40 subdirs total
│   │   ├── apollo/                # Preserved — no changes
│   │   ├── auth/                  # Preserved — no changes
│   │   ├── i18n/                  # Preserved — no changes
│   │   ├── routing/               # Preserved — no changes
│   │   └── ...
│   ├── domain/                    # SECONDARY TARGET — domain components using core/ui
│   │   ├── space/                 # Space pages & components
│   │   ├── community/             # Community pages & components
│   │   ├── collaboration/         # Collaboration components
│   │   ├── communication/         # Chat/messaging components
│   │   └── ...                    # 18 subdirs total
│   └── main/                      # TERTIARY TARGET — app shell, routing, layouts
│       ├── topLevelPages/         # Route-level page components
│       └── ...
├── styles/                        # NEW — Tailwind + theme CSS
│   ├── tailwind.css               # Tailwind entry with tw- prefix
│   ├── theme.css                  # CSS custom properties (from prototype)
│   └── fonts.css                  # Inter font import
└── package.json                   # Add shadcn deps, remove MUI deps (final phase)

prototype/                          # REFERENCE — visual target, component source
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── ui/                # 47 shadcn components — copy to client-web
│   │   └── pages/                 # 26 page implementations — visual reference
│   └── styles/
│       ├── tailwind.css           # Tailwind config with source directive
│       ├── theme.css              # Design tokens (CSS custom properties)
│       └── fonts.css              # Inter font
└── package.json                   # Reference for dependency versions
```

**Structure Decision**: The migration modifies the existing `client-web/` structure in-place. The `core/ui/` layer is refactored to use shadcn components from the prototype. No new top-level directories or projects are created. A `styles/` directory is added for Tailwind/theme CSS files.

## Quantified Migration Scope

| Category | Files Affected | Approach |
|----------|---------------|----------|
| MUI component imports (`@mui/material`) | 721 files | Replace with shadcn + Tailwind |
| MUI icon imports (`@mui/icons-material`) | 281 files (203 unique icons) | Replace with Lucide React |
| MUI `sx` prop usage | 435 files | Replace with Tailwind classes + `cn()` |
| Custom `gutters()` spacing | 292 files | Map to Tailwind spacing scale |
| Custom Typography components | 289 files | Create Tailwind-based wrappers |
| `styled()` usage | 51 files | Replace with Tailwind classes |
| `useTheme()` usage | 40 files | Replace with CSS custom properties |
| MUI Dialog usage | 319 files | Replace with shadcn Dialog/AlertDialog |
| MUI Button usage | 252 files | Replace with shadcn Button |
| Formik forms | 96 files | Migrate to React Hook Form + Zod |
| Yup schemas | 63 files | Convert to Zod schemas |
| `SwapColors` theme inversion | 19 files | Replace with CSS class-based inversion |
| `ThemeProvider` usage | 19 files | Remove (CSS custom properties instead) |
| MUI X DataGrid | 11 files | Replace with TanStack Table |
| MUI X DatePickers | 1 file | Replace with shadcn DatePicker (react-day-picker) |
| `@dnd-kit` integration | 9 files | Preserve — restyle only |
| TipTap editor | 16 files | Preserve core — restyle wrapper chrome |

## Migration Architecture

### Coexistence Strategy (During Transition)

Tailwind CSS v4 is configured with `tw-` prefix to prevent class name collisions with Emotion-generated classes. Both styling systems are active simultaneously during the transition. After all components are migrated: remove Emotion, remove `tw-` prefix, strip MUI packages.

### Component Migration Flow

```
Per component:
1. Copy shadcn primitive from prototype/src/app/components/ui/
2. Adapt to client-web patterns (i18n, GraphQL data, routing)
3. Create wrapper that exports with same component name as existing MUI wrapper
4. Update imports in consuming files (file-by-file)
5. Verify visual parity against prototype
6. Remove old MUI-based implementation
```

### Phase Order

| Phase | Scope | Files | Rationale |
|-------|-------|-------|-----------|
| Phase 1–2 | Foundation: Tailwind + theme + shadcn primitives + `cn()` | ~10 new files | Prerequisites for all other work |
| Phase 3 | `core/ui/` — shared component layer | ~471 files (core/) | All pages depend on core/ui; migrate once, benefit everywhere |
| Phase 4 | P1 Pages — Dashboard, Space Home, Community, Subspaces, Knowledge Base, Post Detail, Subspace Page | ~150 domain files | Highest user-facing impact |
| Phase 5–6 | P2 Pages — User Profile, Account Settings, Space Settings, Create Space | ~200 domain files | Forms migration (RHF+Zod) concentrated here |
| Phase 7 | P3 Pages — Explore, Search, Templates, Admin | ~100 domain files | Lower traffic, can be done last |
| Phase 8–9 | Cleanup — remove MUI/Emotion/Formik/Yup deps, remove tw- prefix, polish | package.json + all files | Only after 100% migration |

## Key Technical Decisions

| # | Decision | Chosen | Rationale |
|---|----------|--------|-----------|
| 1 | Data grid replacement | TanStack Table (headless) + shadcn Table | Full control over rendering, matches prototype pattern, 11 files affected |
| 2 | Form library | React Hook Form + Zod | Prototype already uses RHF; Zod integrates natively with shadcn Form; 96 Formik files to migrate |
| 3 | Icon library | Lucide React (full migration) | Prototype uses Lucide; 203 unique icons need mapping; create alias file for incremental replacement |
| 4 | Color mode | Light only (dark mode deferred) | Reduces scope; dark mode CSS custom properties preserved in theme.css for future use |
| 5 | CSS coexistence | Tailwind `tw-` prefix | Prevents Emotion/Tailwind class collisions; removed in final cleanup phase |
| 6 | Typography strategy | Tailwind wrappers with same component names | 289 files import PageTitle/BlockTitle/etc; keeping names avoids mass import changes |
| 7 | Spacing strategy | Tailwind scale mapped from gutters() | gutters(1)=10px→tw-p-2.5, gutters(2)=20px→tw-p-5, etc.; 292 files affected |
| 8 | Theme strategy | CSS custom properties (from prototype theme.css) | Replace MUI createTheme + ThemeProvider; tokens already defined in prototype |
| 9 | Font | Inter (adopt prototype) | Stakeholder decision; replaces Montserrat + Source Sans Pro |
| 10 | Border radius | 6px base (adopt prototype) | Stakeholder decision; replaces 12px |
| 11 | Background color | White (adopt prototype) | Stakeholder decision; replaces #F1F4F5 |

## Cross-References

| Document | Location | Purpose |
|----------|----------|---------|
| Feature Specification | [spec.md](spec.md) | Requirements, acceptance criteria, success metrics |
| Master Brief | [../002-alkemio-1.5-UI-Update/master-brief.md](../002-alkemio-1.5-UI-Update/master-brief.md) | Component mapping tables, design tokens, page index |
| Per-Page Briefs | [../002-alkemio-1.5-UI-Update/pages/](../002-alkemio-1.5-UI-Update/pages/) | 31 individual page migration guides |
| Prototype Coverage | [../002-alkemio-1.5-UI-Update/prototype-coverage-summary.md](../002-alkemio-1.5-UI-Update/prototype-coverage-summary.md) | Which pages have prototype implementations |
| Data Gap Analysis | [../002-alkemio-1.5-UI-Update/data-gap-analysis.md](../002-alkemio-1.5-UI-Update/data-gap-analysis.md) | API data availability for prototype UI elements |
| Implementation Strategy | [../002-alkemio-1.5-UI-Update/redesign-implementation-strategy.md](../002-alkemio-1.5-UI-Update/redesign-implementation-strategy.md) | Phased approach, icon mapping, spacing mapping |
| Prototype Source | [../../prototype/](../../prototype/) | Visual reference and component source code |

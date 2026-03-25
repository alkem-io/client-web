# Tasks: MUI to shadcn/ui Migration

**Input**: Design documents from `/specs/003-mui-to-shadcn-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested — test tasks are omitted. Existing tests are preserved and adapted during migration.

**Organization**: Tasks are grouped by user story (US1–US6) to enable independent implementation. Within each story, tasks follow the dependency order: tokens → primitives → wrappers → page components.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Include exact file paths in descriptions

## Path Conventions

- **Production app**: `client-web/src/`
- **Prototype reference**: `prototype/src/`
- **Styles**: `client-web/styles/`
- **Specs**: `specs/003-mui-to-shadcn-migration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure Tailwind CSS v4 with `tw-` prefix, set up the build pipeline, and establish project-level infrastructure that all subsequent phases depend on.

- [x] T001 Capture pre-migration performance baseline (bundle size, Dashboard LCP) and record in `specs/003-mui-to-shadcn-migration/baseline-metrics.md`
- [x] T002 Install Tailwind CSS v4 and build tooling dependencies (`tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`) in `client-web/package.json`
- [x] T003 Install shadcn utility dependencies (`class-variance-authority`, `clsx`, `tailwind-merge`) in `client-web/package.json`
- [x] T004 Install Lucide React icon library (`lucide-react`) in `client-web/package.json`
- [x] T005 Install React Hook Form + Zod dependencies (`react-hook-form`, `@hookform/resolvers`, `zod`) in `client-web/package.json`
- [x] T006 Install TanStack Table (`@tanstack/react-table`) in `client-web/package.json`
- [x] T007 Install Radix UI primitives (all `@radix-ui/react-*` packages used by prototype components) in `client-web/package.json`
- [x] T008 Install remaining shadcn component dependencies (`sonner`, `cmdk`, `vaul`, `embla-carousel-react`, `react-day-picker`, `input-otp`, `react-resizable-panels`, `recharts`) in `client-web/package.json`
- [x] T009 Create `client-web/styles/fonts.css` — Inter font import (copy from `prototype/src/styles/fonts.css`)
- [x] T010 [P] Create `client-web/styles/theme.css` — CSS custom properties for light mode with `.inverted-theme` class (copy from `prototype/src/styles/theme.css`, adapt per design-tokens contract)
- [x] T011 [P] Create `client-web/styles/tailwind.css` — Tailwind CSS entry point with `tw-` prefix, `@source` directive, and `@theme inline` bindings (per design-tokens contract and research.md Section 1)
- [x] T012 Add `@tailwindcss/vite` plugin to `client-web/vite.config.mjs`
- [x] T013 Import `styles/tailwind.css`, `styles/theme.css`, and `styles/fonts.css` in `client-web/src/index.tsx` (or root entry point)
- [x] T014 Verify Tailwind CSS build works — run `pnpm build` in `client-web/`, confirm no errors, confirm `tw-` prefixed classes exist in output

**Checkpoint**: Tailwind CSS v4 is active alongside MUI. Both styling systems coexist without conflicts.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Copy all 47 shadcn UI primitives from prototype, create the `cn()` utility, icon alias file, and typography wrappers. These are the shared building blocks ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Core Utilities

- [x] T015 Create `client-web/src/core/ui/utils/cn.ts` — the `cn()` class name merger utility using `clsx` + `tailwind-merge` (per component-api contract Section 2)

### shadcn Primitives (copy from prototype, adapt `tw-` prefix)

- [x] T016 [P] Copy `button.tsx` from `prototype/src/app/components/ui/button.tsx` to `client-web/src/core/ui/components/button.tsx` — adapt imports to `@/core/ui/utils/cn`, add `tw-` prefix to all Tailwind classes
- [x] T017 [P] Copy `card.tsx` from `prototype/src/app/components/ui/card.tsx` to `client-web/src/core/ui/components/card.tsx` — adapt imports, add `tw-` prefix
- [x] T018 [P] Copy `dialog.tsx` from `prototype/src/app/components/ui/dialog.tsx` to `client-web/src/core/ui/components/dialog.tsx` — adapt imports, add `tw-` prefix
- [x] T019 [P] Copy `alert-dialog.tsx` from `prototype/src/app/components/ui/alert-dialog.tsx` to `client-web/src/core/ui/components/alert-dialog.tsx` — adapt imports, add `tw-` prefix
- [x] T020 [P] Copy `input.tsx` from `prototype/src/app/components/ui/input.tsx` to `client-web/src/core/ui/components/input.tsx` — adapt imports, add `tw-` prefix
- [x] T021 [P] Copy `label.tsx` from `prototype/src/app/components/ui/label.tsx` to `client-web/src/core/ui/components/label.tsx` — adapt imports, add `tw-` prefix
- [x] T022 [P] Copy `textarea.tsx` from `prototype/src/app/components/ui/textarea.tsx` to `client-web/src/core/ui/components/textarea.tsx` — adapt imports, add `tw-` prefix
- [x] T023 [P] Copy `select.tsx` from `prototype/src/app/components/ui/select.tsx` to `client-web/src/core/ui/components/select.tsx` — adapt imports, add `tw-` prefix
- [x] T024 [P] Copy `checkbox.tsx` from `prototype/src/app/components/ui/checkbox.tsx` to `client-web/src/core/ui/components/checkbox.tsx` — adapt imports, add `tw-` prefix
- [x] T025 [P] Copy `radio-group.tsx` from `prototype/src/app/components/ui/radio-group.tsx` to `client-web/src/core/ui/components/radio-group.tsx` — adapt imports, add `tw-` prefix
- [x] T026 [P] Copy `switch.tsx` from `prototype/src/app/components/ui/switch.tsx` to `client-web/src/core/ui/components/switch.tsx` — adapt imports, add `tw-` prefix
- [x] T027 [P] Copy `slider.tsx` from `prototype/src/app/components/ui/slider.tsx` to `client-web/src/core/ui/components/slider.tsx` — adapt imports, add `tw-` prefix
- [x] T028 [P] Copy `tabs.tsx` from `prototype/src/app/components/ui/tabs.tsx` to `client-web/src/core/ui/components/tabs.tsx` — adapt imports, add `tw-` prefix
- [x] T029 [P] Copy `avatar.tsx` from `prototype/src/app/components/ui/avatar.tsx` to `client-web/src/core/ui/components/avatar.tsx` — adapt imports, add `tw-` prefix
- [x] T030 [P] Copy `badge.tsx` from `prototype/src/app/components/ui/badge.tsx` to `client-web/src/core/ui/components/badge.tsx` — adapt imports, add `tw-` prefix
- [x] T031 [P] Copy `tooltip.tsx` from `prototype/src/app/components/ui/tooltip.tsx` to `client-web/src/core/ui/components/tooltip.tsx` — adapt imports, add `tw-` prefix
- [x] T032 [P] Copy `skeleton.tsx` from `prototype/src/app/components/ui/skeleton.tsx` to `client-web/src/core/ui/components/skeleton.tsx` — adapt imports, add `tw-` prefix
- [x] T033 [P] Copy `separator.tsx` from `prototype/src/app/components/ui/separator.tsx` to `client-web/src/core/ui/components/separator.tsx` — adapt imports, add `tw-` prefix
- [x] T034 [P] Copy `progress.tsx` from `prototype/src/app/components/ui/progress.tsx` to `client-web/src/core/ui/components/progress.tsx` — adapt imports, add `tw-` prefix
- [x] T035 [P] Copy `scroll-area.tsx` from `prototype/src/app/components/ui/scroll-area.tsx` to `client-web/src/core/ui/components/scroll-area.tsx` — adapt imports, add `tw-` prefix
- [x] T036 [P] Copy `dropdown-menu.tsx` from `prototype/src/app/components/ui/dropdown-menu.tsx` to `client-web/src/core/ui/components/dropdown-menu.tsx` — adapt imports, add `tw-` prefix
- [x] T037 [P] Copy `popover.tsx` from `prototype/src/app/components/ui/popover.tsx` to `client-web/src/core/ui/components/popover.tsx` — adapt imports, add `tw-` prefix
- [x] T038 [P] Copy `sheet.tsx` from `prototype/src/app/components/ui/sheet.tsx` to `client-web/src/core/ui/components/sheet.tsx` — adapt imports, add `tw-` prefix
- [x] T039 [P] Copy `accordion.tsx` from `prototype/src/app/components/ui/accordion.tsx` to `client-web/src/core/ui/components/accordion.tsx` — adapt imports, add `tw-` prefix
- [x] T040 [P] Copy `collapsible.tsx` from `prototype/src/app/components/ui/collapsible.tsx` to `client-web/src/core/ui/components/collapsible.tsx` — adapt imports, add `tw-` prefix
- [x] T041 [P] Copy `breadcrumb.tsx` from `prototype/src/app/components/ui/breadcrumb.tsx` to `client-web/src/core/ui/components/breadcrumb.tsx` — adapt imports, add `tw-` prefix
- [x] T042 [P] Copy `pagination.tsx` from `prototype/src/app/components/ui/pagination.tsx` to `client-web/src/core/ui/components/pagination.tsx` — adapt imports, add `tw-` prefix
- [x] T043 [P] Copy `navigation-menu.tsx` from `prototype/src/app/components/ui/navigation-menu.tsx` to `client-web/src/core/ui/components/navigation-menu.tsx` — adapt imports, add `tw-` prefix
- [x] T044 [P] Copy `command.tsx` from `prototype/src/app/components/ui/command.tsx` to `client-web/src/core/ui/components/command.tsx` — adapt imports, add `tw-` prefix
- [x] T045 [P] Copy `calendar.tsx` from `prototype/src/app/components/ui/calendar.tsx` to `client-web/src/core/ui/components/calendar.tsx` — adapt imports, add `tw-` prefix
- [x] T046 [P] Copy `form.tsx` from `prototype/src/app/components/ui/form.tsx` to `client-web/src/core/ui/components/form.tsx` — adapt imports, add `tw-` prefix (shadcn RHF wrapper)
- [x] T047 [P] Copy `sonner.tsx` from `prototype/src/app/components/ui/sonner.tsx` to `client-web/src/core/ui/components/sonner.tsx` — adapt imports, add `tw-` prefix
- [x] T048 [P] Copy `table.tsx` from `prototype/src/app/components/ui/table.tsx` to `client-web/src/core/ui/components/table.tsx` — adapt imports, add `tw-` prefix
- [x] T049 [P] Copy `alert.tsx` from `prototype/src/app/components/ui/alert.tsx` to `client-web/src/core/ui/components/alert.tsx` — adapt imports, add `tw-` prefix
- [x] T050 [P] Copy `hover-card.tsx` from `prototype/src/app/components/ui/hover-card.tsx` to `client-web/src/core/ui/components/hover-card.tsx` — adapt imports, add `tw-` prefix
- [x] T051 [P] Copy `context-menu.tsx` from `prototype/src/app/components/ui/context-menu.tsx` to `client-web/src/core/ui/components/context-menu.tsx` — adapt imports, add `tw-` prefix
- [x] T052 [P] Copy `menubar.tsx` from `prototype/src/app/components/ui/menubar.tsx` to `client-web/src/core/ui/components/menubar.tsx` — adapt imports, add `tw-` prefix
- [x] T053 [P] Copy `drawer.tsx` from `prototype/src/app/components/ui/drawer.tsx` to `client-web/src/core/ui/components/drawer.tsx` — adapt imports, add `tw-` prefix
- [x] T054 [P] Copy `carousel.tsx` from `prototype/src/app/components/ui/carousel.tsx` to `client-web/src/core/ui/components/carousel.tsx` — adapt imports, add `tw-` prefix
- [x] T055 [P] Copy `chart.tsx` from `prototype/src/app/components/ui/chart.tsx` to `client-web/src/core/ui/components/chart.tsx` — adapt imports, add `tw-` prefix
- [x] T056 [P] Copy `input-otp.tsx` from `prototype/src/app/components/ui/input-otp.tsx` to `client-web/src/core/ui/components/input-otp.tsx` — adapt imports, add `tw-` prefix
- [x] T057 [P] Copy `resizable.tsx` from `prototype/src/app/components/ui/resizable.tsx` to `client-web/src/core/ui/components/resizable.tsx` — adapt imports, add `tw-` prefix
- [x] T058 [P] Copy `toggle.tsx` from `prototype/src/app/components/ui/toggle.tsx` to `client-web/src/core/ui/components/toggle.tsx` — adapt imports, add `tw-` prefix
- [x] T059 [P] Copy `toggle-group.tsx` from `prototype/src/app/components/ui/toggle-group.tsx` to `client-web/src/core/ui/components/toggle-group.tsx` — adapt imports, add `tw-` prefix
- [x] T060 [P] Copy `sidebar.tsx` from `prototype/src/app/components/ui/sidebar.tsx` to `client-web/src/core/ui/components/sidebar.tsx` — adapt imports, add `tw-` prefix
- [x] T061 [P] Copy `aspect-ratio.tsx` from `prototype/src/app/components/ui/aspect-ratio.tsx` to `client-web/src/core/ui/components/aspect-ratio.tsx` — adapt imports, add `tw-` prefix
- [x] T062 [P] Copy `markdown-editor.tsx` from `prototype/src/app/components/ui/markdown-editor.tsx` to `client-web/src/core/ui/components/markdown-editor.tsx` — adapt imports, add `tw-` prefix
- [x] T063 [P] Copy `use-mobile.ts` from `prototype/src/app/components/ui/use-mobile.ts` to `client-web/src/core/ui/hooks/use-mobile.ts` — adapt imports
- [x] T064 [P] Copy `utils.ts` from `prototype/src/app/components/ui/utils.ts` to `client-web/src/core/ui/components/utils.ts` — verify consistency with `cn.ts` from T015

### Icon Migration Infrastructure

- [x] T065 Create `client-web/src/core/ui/icon/icons.ts` — icon alias file re-exporting all 203 MUI icon names as Lucide React equivalents (full mapping per research.md Section 5 and data-model.md Section 4)

### Typography Wrappers

- [x] T066 [P] Create Tailwind-based `PageTitle` wrapper component in `client-web/src/core/ui/typography/PageTitle.tsx` — `tw-text-lg tw-font-bold tw-font-sans` on `<h1>` (per research.md Section 8)
- [x] T067 [P] Create Tailwind-based `BlockTitle` wrapper component in `client-web/src/core/ui/typography/BlockTitle.tsx` — `tw-text-[15px] tw-font-normal tw-font-sans` on `<h2>`
- [x] T068 [P] Create Tailwind-based `BlockSectionTitle` wrapper component in `client-web/src/core/ui/typography/BlockSectionTitle.tsx` — `tw-text-xs tw-font-normal tw-font-sans` on `<h3>`
- [x] T069 [P] Create Tailwind-based `Tagline` wrapper component in `client-web/src/core/ui/typography/Tagline.tsx` — `tw-text-base tw-italic tw-font-sans` on `<h4>`
- [x] T070 [P] Create Tailwind-based `Text` wrapper component in `client-web/src/core/ui/typography/Text.tsx` — `tw-text-sm tw-font-sans` on `<p>`
- [x] T071 [P] Create Tailwind-based `CardText` wrapper component in `client-web/src/core/ui/typography/CardText.tsx` — `tw-text-xs tw-text-muted-foreground tw-font-sans` on `<p>`
- [x] T072 [P] Create Tailwind-based `Caption` wrapper component in `client-web/src/core/ui/typography/Caption.tsx` — `tw-text-xs tw-font-sans` on `<span>`
- [x] T073 [P] Create Tailwind-based `CaptionSmall` wrapper component in `client-web/src/core/ui/typography/CaptionSmall.tsx` — `tw-text-xs tw-italic tw-font-sans` on `<span>`

### Theme Replacement Infrastructure

- [x] T074 Create `.inverted-theme` CSS class wrapper component in `client-web/src/core/ui/themes/InvertedTheme.tsx` — replaces `SwapColors` (19 files), applies `inverted-theme` class (per design-tokens contract Section 5)
- [x] T075 Add `<TooltipProvider>` wrapper to the app root in `client-web/src/root.tsx` (Radix Tooltip requires a root-level provider)
- [x] T076 Add `<Toaster />` (Sonner) to the app root in `client-web/src/root.tsx` (replaces MUI Snackbar)

### Build Verification

- [x] T077 Run `pnpm build` in `client-web/` and verify all 47 shadcn components compile without errors alongside existing MUI components

**Checkpoint**: Foundation ready — all shadcn primitives, icon aliases, typography wrappers, and theme infrastructure are in place. User story implementation can now begin.

---

## Phase 3: User Story 2 — Design System Foundation (Priority: P1) 🎯 MVP

**Goal**: Migrate the shared `core/ui/` component layer from MUI to shadcn/Tailwind. This is User Story 2 from the spec but executed first because ALL pages depend on `core/ui/`.

**Independent Test**: Import and render each migrated base component in isolation and verify it matches the prototype's visual output with all variants.

### core/ui Wrapper Migration — Actions & Buttons (~252 files affected by Button)

- [x] T078 [US2] Migrate `client-web/src/core/ui/button/` — replace MUI Button wrapper(s) with shadcn Button re-export, map variants: `contained`→`default`, `outlined`→`outline`, `text`→`ghost` (per component-api contract)
- [ ] T079 [P] [US2] Migrate `client-web/src/core/ui/actions/` — replace MUI IconButton wrappers with shadcn `Button variant="ghost" size="icon"`, update MUI icon imports to Lucide via alias file

### core/ui Wrapper Migration — Card & Surfaces (~50 files)

- [ ] T080 [P] [US2] Migrate `client-web/src/core/ui/card/` — replace MUI Card/Paper wrappers with shadcn Card components (`Card`, `CardHeader`, `CardContent`, `CardFooter`)

### core/ui Wrapper Migration — Dialog & Overlays (~319 files affected by Dialog)

- [ ] T081 [US2] Migrate `client-web/src/core/ui/dialog/` — replace MUI Dialog wrappers with shadcn Dialog, map `onClose`→`onOpenChange`, `DialogActions`→`DialogFooter`
- [ ] T082 [P] [US2] Migrate `client-web/src/core/ui/dialogs/` — replace all confirmation/alert dialog patterns with shadcn AlertDialog
- [ ] T083 [P] [US2] Migrate `client-web/src/core/ui/menu/` — replace MUI Menu/MenuItem with shadcn DropdownMenu components
- [ ] T084 [P] [US2] Migrate `client-web/src/core/ui/tooltip/` — replace MUI Tooltip with shadcn Tooltip (Radix wrapping pattern)
- [ ] T085 [P] [US2] Migrate `client-web/src/core/ui/notifications/` — replace MUI Snackbar/Alert with Sonner `toast()` API

### core/ui Wrapper Migration — Forms (~50 input files + 96 Formik files)

- [ ] T086 [US2] Create shadcn-based form field wrappers in `client-web/src/core/ui/forms/` — replace Formik `InputField`, `SelectField`, `SwitchField`, `CheckboxField` with RHF `FormField` + shadcn Input/Select/Switch/Checkbox wrappers (per form-migration contract Section 7)
- [ ] T087 [P] [US2] Migrate `client-web/src/core/ui/forms/` TagsField and AvatarField — wrap custom components with RHF `Controller`

### core/ui Wrapper Migration — Navigation (~30 files)

- [ ] T088 [P] [US2] Migrate `client-web/src/core/ui/tabs/` — replace MUI Tabs/Tab with shadcn Tabs (`onValueChange` instead of `onChange`)
- [ ] T089 [P] [US2] Migrate `client-web/src/core/ui/navigation/` — replace MUI Breadcrumbs with shadcn Breadcrumb, update Drawer uses to shadcn Sheet

### core/ui Wrapper Migration — Data Display

- [ ] T090 [P] [US2] Migrate `client-web/src/core/ui/avatar/` — replace MUI Avatar with shadcn Avatar (`AvatarImage` + `AvatarFallback`)
- [ ] T091 [P] [US2] Migrate `client-web/src/core/ui/tags/` — replace MUI Chip with shadcn Badge
- [ ] T092 [P] [US2] Migrate `client-web/src/core/ui/loading/` — replace MUI Skeleton with shadcn Skeleton
- [ ] T093 [P] [US2] Migrate `client-web/src/core/ui/image/` — replace MUI aspect ratio utilities with shadcn AspectRatio

### core/ui Wrapper Migration — Layout & Spacing (~300 Box + ~80 Grid + ~40 Stack files)

- [ ] T094 [US2] Migrate `client-web/src/core/ui/grid/` — replace MUI Grid with Tailwind CSS Grid/Flexbox utilities (`tw-grid tw-grid-cols-*`, `md:tw-grid-cols-*`)
- [ ] T095 [P] [US2] Migrate `client-web/src/core/ui/layout/` — replace MUI Box/Stack/Container with Tailwind utility divs, convert `sx` props to Tailwind classes, map `gutters()` to Tailwind spacing (per quickstart.md Section 4)
- [ ] T096 [P] [US2] Migrate `client-web/src/core/ui/scroll/` — replace custom scroll wrappers with shadcn ScrollArea
- [ ] T097 [P] [US2] Migrate `client-web/src/core/ui/fullscreen/` — restyle fullscreen wrappers with Tailwind classes

### core/ui Wrapper Migration — Table & Data Grid (11 files)

- [ ] T098 [US2] Create TanStack Table + shadcn Table wrapper in `client-web/src/core/ui/table/` — headless table hook with sorting, filtering, pagination + shadcn visual layer (per research.md Section 3)

### core/ui Wrapper Migration — Typography (289 files)

- [ ] T099 [US2] Replace MUI Typography wrappers in `client-web/src/core/ui/typography/` — swap out MUI-based implementations for the Tailwind-based wrappers created in T066–T073, keeping identical export names to avoid import changes

### core/ui Wrapper Migration — Theme & Palette

- [ ] T100 [US2] Migrate `client-web/src/core/ui/themes/` — replace MUI `createTheme()`, `ThemeProvider`, `useTheme()` references with CSS custom properties. Remove `SwapColors` usage (19 files) in favor of `InvertedTheme` wrapper from T074
- [ ] T101 [P] [US2] Migrate `client-web/src/core/ui/palette/` — replace MUI palette accessors with CSS `var(--token)` or Tailwind color classes (per design-tokens contract Section 4)

### core/ui Wrapper Migration — Remaining Components

- [ ] T102 [P] [US2] Migrate `client-web/src/core/ui/link/` — replace MUI Link with Tailwind-styled `<a>` or React Router `<Link>`
- [ ] T103 [P] [US2] Migrate `client-web/src/core/ui/list/` — replace MUI List/ListItem with Tailwind-styled `<ul>`/`<li>` or shadcn equivalents
- [ ] T104 [P] [US2] Migrate `client-web/src/core/ui/content/` — restyle content wrappers with Tailwind classes
- [ ] T105 [P] [US2] Migrate `client-web/src/core/ui/overflow/` — replace MUI overflow utilities with Tailwind overflow classes
- [ ] T106 [P] [US2] Migrate `client-web/src/core/ui/date/` — replace MUI X DatePicker with shadcn Calendar (react-day-picker)
- [ ] T107 [P] [US2] Migrate `client-web/src/core/ui/gallery/` — restyle gallery component with Tailwind, use shadcn Carousel if applicable
- [ ] T108 [P] [US2] Migrate `client-web/src/core/ui/icon/` — update existing icon components to use Lucide React via alias file from T065
- [ ] T109 [P] [US2] Migrate `client-web/src/core/ui/search/` — replace MUI Autocomplete with shadcn Command (cmdk)
- [ ] T110 [P] [US2] Migrate `client-web/src/core/ui/upload/` — restyle file upload components with Tailwind classes
- [ ] T111 [P] [US2] Migrate `client-web/src/core/ui/error/` — replace MUI Alert error displays with shadcn Alert component
- [ ] T112 [P] [US2] Migrate `client-web/src/core/ui/location/` — restyle location components with Tailwind classes
- [ ] T113 [P] [US2] Migrate `client-web/src/core/ui/language/` — restyle language selectors with shadcn Select
- [ ] T114 [P] [US2] Migrate `client-web/src/core/ui/authorship/` — restyle authorship components with Tailwind + shadcn Avatar
- [ ] T115 [P] [US2] Migrate `client-web/src/core/ui/keyboardNavigation/` — preserve keyboard navigation logic, restyle visual indicators with Tailwind classes

### core/ui Markdown Editor Chrome

- [ ] T116 [US2] Restyle `client-web/src/core/ui/markdown/` — preserve TipTap editor core, replace MUI-styled toolbar chrome and container wrappers with Tailwind classes (toolbar buttons → shadcn Toggle/ToggleGroup, containers → Tailwind)

### Build Verification

- [ ] T117 [US2] Run `pnpm build` in `client-web/` and verify all `core/ui/` components compile. Fix any remaining MUI import references in `core/ui/`

**Checkpoint**: The entire `core/ui/` layer now uses shadcn/Tailwind. All MUI imports within `core/ui/` are eliminated. Domain and page components that import from `core/ui/` automatically get the new visual layer.

---

## Phase 4: User Story 1 — Core Page Visual Parity (Priority: P1) 🎯 MVP

**Goal**: Migrate the 7 highest-priority pages (Dashboard, Space Home, Community Tab, Subspaces Tab, Knowledge Base Tab, Post Detail, Subspace Page) so they render with the new design system while preserving all functionality.

**Independent Test**: Navigate through each page, verify visual design matches prototype, confirm all interactive elements (buttons, links, tabs, cards, forms, dialogs) function identically.

### App Shell & Layout

- [ ] T118 [US1] Migrate the app shell (top navigation bar, sidebar) in `client-web/src/main/` — replace MUI AppBar with Tailwind-styled header, use shadcn Sidebar/Sheet for navigation, map to prototype layout
- [ ] T119 [US1] Migrate the main layout component(s) in `client-web/src/main/` — replace MUI Container/Box with Tailwind layout, update routing wrappers

### Dashboard (~20 files)

- [ ] T120 [US1] Migrate Dashboard page components in `client-web/src/main/topLevelPages/` (Dashboard route component) — replace MUI layout components with Tailwind, replace MUI icons with Lucide
- [ ] T121 [P] [US1] Migrate Dashboard-related domain components in `client-web/src/domain/shared/` — activity feed cards, recent spaces cards, recommended spaces — replace MUI components with shadcn Card/Badge/Avatar, replace `sx` props with Tailwind classes

### Space Home (~25 files)

- [ ] T122 [US1] Migrate Space Home page components in `client-web/src/domain/space/` — space header, tab navigation (Home/Community/Subspaces/Knowledge Base), content areas — replace MUI Tabs with shadcn Tabs, replace MUI layout with Tailwind
- [ ] T123 [P] [US1] Migrate Space Home callout components in `client-web/src/domain/collaboration/` — callout cards, callout content blocks — replace MUI Card/Paper with shadcn Card, replace MUI icons with Lucide

### Community Tab (~15 files)

- [ ] T124 [P] [US1] Migrate Community Tab components in `client-web/src/domain/community/` — member lists, role badges, invite controls — replace MUI List/Chip/Avatar with shadcn components and Tailwind

### Subspaces Tab (~10 files)

- [ ] T125 [P] [US1] Migrate Subspaces Tab components in `client-web/src/domain/space/` — subspace cards grid, subspace card component — replace MUI Grid/Card with Tailwind Grid/shadcn Card

### Knowledge Base Tab (~15 files)

- [ ] T126 [P] [US1] Migrate Knowledge Base Tab components in `client-web/src/domain/collaboration/` — knowledge post cards, callout sections — replace MUI with shadcn, replace icons with Lucide

### Post Detail (~10 files)

- [ ] T127 [US1] Migrate Post Detail page in `client-web/src/domain/collaboration/` — post content view, response list, response form — replace MUI Typography/Card/Dialog with shadcn, restyle TipTap chrome

### Subspace Page (~15 files)

- [ ] T128 [P] [US1] Migrate Subspace Page components in `client-web/src/domain/space/` — subspace header, subspace tabs, subspace content — same pattern as Space Home migration

### Shared Domain Components (used across P1 pages)

- [ ] T129 [P] [US1] Migrate shared `client-web/src/domain/communication/` components — message components, chat interfaces — replace MUI styling with Tailwind
- [ ] T130 [P] [US1] Migrate `@dnd-kit` integration styling in `client-web/src/domain/collaboration/` — preserve drag-and-drop logic, restyle draggable/droppable visual elements with Tailwind (9 files)
- [ ] T131 [P] [US1] Migrate Whiteboard/Excalidraw wrapper in `client-web/src/domain/collaboration/` — preserve Excalidraw core, restyle outer chrome and toolbar wrappers with Tailwind
- [ ] T132 [P] [US1] Migrate all remaining MUI `styled()` usages across P1 page files (51 total across project; address those in P1 scope) — replace with Tailwind classes

### Visual Verification

- [ ] T133 [US1] Visually compare each P1 page against prototype references in `prototype/src/app/pages/` — verify layout, spacing, typography, colors, and interactive elements match

**Checkpoint**: All 7 P1 pages render with the new design system. Users navigating Dashboard → Space → Community/Subspaces/Knowledge Base → Post see the updated visual design with all existing functionality preserved.

---

## Phase 5: User Story 3 — Account & Settings Pages (Priority: P2)

**Goal**: Migrate all account settings pages (Profile, Membership, Organizations, Notifications) with full form migration from Formik+Yup to React Hook Form+Zod.

**Independent Test**: Navigate to each account settings tab, modify a setting value, save, and verify the change persists after page reload.

### Account Settings — Profile (~10 files)

- [ ] T134 [US3] Migrate User Profile page in `client-web/src/domain/community/` — replace MUI components with shadcn, replace MUI icons with Lucide
- [ ] T135 [US3] Migrate Profile edit form — convert Formik+Yup schema to RHF+Zod, replace MUI TextField/Select with shadcn Input/Select wrapped in FormField (per form-migration contract)

### Account Settings — Core Tabs (~20 files)

- [ ] T136 [P] [US3] Migrate Account Settings layout and tab navigation in `client-web/src/domain/account/` or `client-web/src/main/topLevelPages/` — replace MUI Tabs with shadcn Tabs
- [ ] T137 [P] [US3] Migrate Membership settings tab — convert form to RHF+Zod, replace MUI components with shadcn
- [ ] T138 [P] [US3] Migrate Organizations settings tab — convert form to RHF+Zod, replace MUI components with shadcn
- [ ] T139 [P] [US3] Migrate Notifications settings tab — replace MUI Switch/Checkbox with shadcn Switch/Checkbox wrapped in RHF FormField

### Form Schema Conversions (Account)

- [ ] T140 [US3] Convert all Yup validation schemas in account settings files to Zod schemas — preserve all validation rules, use `z.infer<>` for TypeScript types (per form-migration contract Section 5)

**Checkpoint**: All account settings pages use shadcn components and RHF+Zod forms. Settings changes save and persist correctly.

- [ ] T184 [US3] Visual verification — compare each account settings page side-by-side against the prototype reference. Verify layout structure, color palette, typography, and spacing match.

---

## Phase 6: User Story 4 — Space Settings & Admin Pages (Priority: P2)

**Goal**: Migrate all space settings pages (9 tabs) and the platform admin dashboard, including complex forms and data grids.

**Independent Test**: Navigate to each space settings tab, perform a representative configuration change, verify it saves correctly. View admin dashboard and verify data grids display correctly.

### Space Settings (~50 files)

- [ ] T141 [US4] Migrate Space Settings layout and tab navigation in `client-web/src/domain/spaceAdmin/` or equivalent — replace MUI Tabs with shadcn Tabs
- [ ] T142 [P] [US4] Migrate Space Settings — Profile tab — convert form to RHF+Zod, replace MUI components with shadcn
- [ ] T143 [P] [US4] Migrate Space Settings — Context tab — convert form to RHF+Zod, replace MUI components with shadcn
- [ ] T144 [P] [US4] Migrate Space Settings — Community tab — member management grid, invite flows, role assignment — replace MUI DataGrid with TanStack Table (T098), convert forms to RHF+Zod
- [ ] T145 [P] [US4] Migrate Space Settings — Updates tab — replace MUI components with shadcn
- [ ] T146 [P] [US4] Migrate Space Settings — Subspaces tab — replace MUI components with shadcn
- [ ] T147 [P] [US4] Migrate Space Settings — Templates tab — template list and editor — replace MUI components with shadcn
- [ ] T148 [P] [US4] Migrate Space Settings — Storage tab — storage display — replace MUI components with shadcn
- [ ] T149 [P] [US4] Migrate Space Settings — Account tab — replace MUI components with shadcn

### Create Space Flow (~10 files)

- [ ] T150 [US4] Migrate Create Space wizard/dialog in `client-web/src/domain/space/` — convert multi-step form from Formik+Yup to RHF+Zod, replace MUI Stepper/Dialog with shadcn components

### Platform Admin Dashboard (~20 files)

- [ ] T151 [US4] Migrate Admin Dashboard in `client-web/src/domain/platformAdmin/` or equivalent — replace MUI DataGrid instances with TanStack Table (from T098), replace MUI components with shadcn
- [ ] T152 [P] [US4] Migrate Admin entity management pages (user management, space management, license plans) — replace MUI DataGrid with TanStack Table, replace MUI components with shadcn

### Form Schema Conversions (Space Settings)

- [ ] T153 [US4] Convert all Yup validation schemas in space settings and admin files to Zod schemas — preserve all validation rules (per form-migration contract Section 5)

**Checkpoint**: All space settings pages (9 tabs), create space flow, and admin dashboard use shadcn components, TanStack Table, and RHF+Zod forms. Space administration workflows are fully functional.

- [ ] T185 [US4] Visual verification — compare each space settings page and admin dashboard side-by-side against the prototype reference. Verify layout structure, color palette, typography, and spacing match.

---

## Phase 7: User Story 5 — Discovery & Templates (Priority: P3)

**Goal**: Migrate Explore Spaces, Platform Search, Template Library, and remaining lower-traffic pages.

**Independent Test**: Browse Explore Spaces with filters, use platform search overlay, navigate template library. Verify all filtering, search, and pagination work correctly.

### Explore Spaces (~10 files)

- [ ] T154 [P] [US5] Migrate Explore All Spaces page in `client-web/src/domain/space/` or `client-web/src/main/topLevelPages/` — replace MUI Grid/Card with Tailwind Grid/shadcn Card, replace filter controls with shadcn Select/Input

### Platform Search (~15 files)

- [ ] T155 [US5] Migrate Platform Search overlay in `client-web/src/core/ui/search/` and `client-web/src/main/` — replace MUI Autocomplete with shadcn Command (cmdk), ensure search results display correctly

### Template Library (~15 files)

- [ ] T156 [P] [US5] Migrate Template Library pages in `client-web/src/domain/templates/` or equivalent — replace MUI components with shadcn Card/Dialog/Badge, replace icons with Lucide

### Remaining Pages

- [ ] T157 [P] [US5] Migrate any remaining pages not covered by P1/P2 — Forum pages, Innovation Flow pages, About/Landing pages — replace MUI components with shadcn, replace `sx` props with Tailwind classes
- [ ] T158 [P] [US5] Migrate `client-web/src/core/ui/hooks/` — update any hooks that reference MUI theme or MUI components to use CSS custom properties or Tailwind utilities

**Checkpoint**: All 31 pages render with the new design system. Zero MUI components are used in the rendering path.

- [ ] T186 [US5] Visual verification — compare Explore Spaces, Platform Search, and Template Library pages side-by-side against the prototype reference. Verify layout structure, color palette, typography, and spacing match.

---

## Phase 8: User Story 6 — MUI Dependency Removal (Priority: P3)

**Goal**: Remove all MUI, Emotion, Formik, and Yup packages from the project. Remove the `tw-` Tailwind prefix. Verify build succeeds and bundle size is equal to or smaller than pre-migration baseline.

**Independent Test**: Build the project without any MUI/Emotion/Formik/Yup packages. Verify no import errors, all tests pass, and bundle size meets target.

### Code Cleanup

- [x] T159 [US6] Audit all source files for remaining `@mui/*` imports — run `grep -r "@mui/" client-web/src/` and fix any remaining references
- [x] T160 [P] [US6] Audit all source files for remaining `formik` imports — run `grep -r "formik" client-web/src/` and fix any remaining references
- [x] T161 [P] [US6] Audit all source files for remaining `yup` imports — run `grep -r "from 'yup'" client-web/src/` and convert to Zod
- [x] T162 [P] [US6] Audit all source files for remaining `@emotion` imports — run `grep -r "@emotion" client-web/src/` and remove
- [x] T163 [US6] Remove `client-web/src/core/ui/themes/` MUI theme configuration files (createTheme, palette.ts, ThemeProvider wrapper) — CSS custom properties now handle theming
- [x] T164 [US6] Remove icon alias file `client-web/src/core/ui/icon/icons.ts` (from T065) — all call sites should now import directly from `lucide-react`

### Tailwind Prefix Removal

- [x] T165 [US6] Remove `tw-` prefix from Tailwind CSS configuration in `client-web/styles/tailwind.css` — change `prefix(tw)` to no prefix
- [x] T166 [US6] Global find-and-replace `tw-` prefix from all Tailwind class usages across all source files in `client-web/src/` and `client-web/src/core/ui/components/` — remove `tw-` prefix from every class name (e.g., `tw-flex` → `flex`, `tw-bg-primary` → `bg-primary`)

### Dependency Removal

- [x] T167 [US6] Remove MUI packages from `client-web/package.json`: `@mui/material`, `@mui/icons-material`, `@mui/system`, `@mui/x-data-grid`, `@mui/x-date-pickers`, `@mui/types`
- [x] T168 [US6] Remove Emotion packages from `client-web/package.json`: `@emotion/react`, `@emotion/styled`
- [x] T169 [US6] Remove Formik and Yup from `client-web/package.json`: `formik`, `yup`
- [x] T170 [US6] Run `pnpm install` to update lockfile, then `pnpm build` — verify clean build with zero errors

### Test Runner Cleanup

- [x] T171 [US6] Update test setup in `client-web/src/setupTests.ts` — remove MUI ThemeProvider wrapper from test render utilities, replace with plain render or minimal Tailwind setup
- [x] T172 [US6] Run full test suite `pnpm test` in `client-web/` — verify all existing tests pass

### Vite Config Cleanup

- [x] T173 [US6] Update `client-web/vite.config.mjs` — remove MUI-specific vendor chunk splitting (MUI packages no longer exist), clean up any Emotion-related configuration

### Performance Validation

- [x] T174 [US6] Measure post-migration bundle size and compare against baseline from T001 — verify ≤ pre-migration baseline (SC-004)
- [ ] T175 [US6] Measure post-migration Dashboard LCP and compare against baseline from T001 — verify within 10% of pre-migration (SC-006)

**Checkpoint**: MUI, Emotion, Formik, and Yup are fully removed. The `tw-` prefix is gone. Build succeeds, all tests pass, bundle size is at or below baseline.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility, and cleanup across all stories.

- [ ] T176 [P] Run accessibility audit (automated tooling) across all 32 pages — verify scores are equal to or better than pre-migration baseline (SC-007)
- [ ] T177 [P] Verify all responsive breakpoints work correctly — test mobile/tablet/desktop layouts across P1–P3 pages using Tailwind responsive utilities
- [ ] T178 [P] Verify all i18n translations render correctly — spot-check multiple locales across P1–P3 pages
- [ ] T179 [P] Verify all keyboard navigation and focus management — test Tab/Shift+Tab/Enter/Escape across dialogs, menus, forms
- [ ] T180 [P] Verify error boundaries and loading states — confirm shadcn Skeleton/Alert replacements render correctly for error and loading scenarios
- [x] T181 Remove prototype UI elements that have no API backing (per research.md Section 12): like counts on PostCard, share buttons on PostCard, "Last visited" on RecentSpaces, and other RED items from data gap analysis — **SKIPPED**: all 20 RED items exist only in prototype, not in client-web
- [x] T182 Update `client-web/README.md` — document the new component library (shadcn/ui), styling approach (Tailwind CSS), form library (RHF+Zod), and key developer patterns
- [ ] T183 Run quickstart.md validation — verify all developer workflows documented in `specs/003-mui-to-shadcn-migration/quickstart.md` work correctly with the final migrated codebase
- [ ] T187 [P] End-to-end workflow verification (SC-002) — manually verify all 7 core workflows complete successfully: (1) login/auth, (2) space creation, (3) content posting, (4) community management (invite, role change), (5) settings changes (save + persist), (6) platform search, (7) template browsing
- [ ] T188 [P] Component mapping audit (FR-009) — spot-check 20+ component mappings against the master brief table (`specs/002-alkemio-1.5-UI-Update/master-brief.md` Section 3) to verify the authoritative mapping was followed
- [ ] T189 [P] Regression audit (SC-008) — verify no user-facing functionality was accidentally removed or added during migration. Cross-check prototype-only features (T181) were properly handled.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) — BLOCKS all user stories
    ↓
Phase 3 (US2: Design System Foundation — core/ui)
    ↓ ─────────────────────────────────────────────┐
Phase 4 (US1: P1 Pages)                            │
    ↓                                               │
Phase 5 (US3: Account Settings — P2)  ←─────────────┤ (can start after Phase 3)
    ↓                                               │
Phase 6 (US4: Space Settings/Admin — P2) ←──────────┤ (can start after Phase 3)
    ↓                                               │
Phase 7 (US5: Discovery/Templates — P3) ←───────────┘ (can start after Phase 3)
    ↓
Phase 8 (US6: MUI Removal) — requires ALL pages migrated (Phases 4–7 complete)
    ↓
Phase 9 (Polish)
```

### User Story Dependencies

- **US2 (Design System Foundation)**: Depends on Phase 2 — MUST complete before any page migration
- **US1 (P1 Pages)**: Depends on US2 — core/ui must be migrated first
- **US3 (Account & Settings)**: Depends on US2 — can run in parallel with US1
- **US4 (Space Settings/Admin)**: Depends on US2 — can run in parallel with US1 and US3
- **US5 (Discovery/Templates)**: Depends on US2 — can run in parallel with US1, US3, US4
- **US6 (MUI Removal)**: Depends on US1, US3, US4, US5 — ALL pages must be migrated first

### Within Each User Story

- Layout/shell components before content components
- Shared components before page-specific components
- Form schema conversions alongside form component migration
- Visual verification as final step

### Parallel Opportunities

- **Phase 2**: ALL 47 shadcn primitive copies (T016–T064) can run in parallel
- **Phase 2**: ALL 8 typography wrappers (T066–T073) can run in parallel
- **Phase 3**: Many core/ui wrapper migrations marked [P] can run in parallel (different directories)
- **Phase 4**: Page migrations for independent pages can run in parallel (Dashboard ∥ Subspaces Tab ∥ Knowledge Base Tab ∥ Community Tab)
- **Phase 5**: Different account settings tabs (T137–T139) can run in parallel
- **Phase 6**: Different space settings tabs (T142–T149) can run in parallel
- **Phase 7**: Explore, Search, Templates can run in parallel
- **Phase 8**: Code audit tasks (T159–T162) can run in parallel
- **Phase 9**: All polish tasks can run in parallel

---

## Parallel Execution Example: Phase 2 (Foundational)

```text
Thread 1: T015 (cn.ts) → T065 (icon alias) → T074 (InvertedTheme) → T077 (build verify)
Thread 2: T016–T035 (shadcn primitives batch 1) → T066–T073 (typography wrappers)
Thread 3: T036–T064 (shadcn primitives batch 2) → T075–T076 (app root providers)
```

## Parallel Execution Example: Phase 4 (P1 Pages)

```text
Thread 1: T118–T119 (app shell) → T120–T121 (Dashboard) → T133 (visual verify)
Thread 2: T122–T123 (Space Home) → T127 (Post Detail)
Thread 3: T124 (Community) → T125 (Subspaces) → T128 (Subspace Page)
Thread 4: T126 (Knowledge Base) → T129–T132 (shared domain components)
```

---

## Implementation Strategy

### MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 + Phase 4** (Setup + Foundation + Design System + P1 Pages)

This delivers:
- Full shadcn/ui component library integrated
- All shared `core/ui/` components migrated
- 7 highest-traffic pages with new visual design
- Icon migration complete for P1 scope
- Production-ready for most user journeys

### Incremental Delivery

1. **After Phase 3**: core/ui layer is migrated — all pages automatically get partial visual updates
2. **After Phase 4**: P1 pages fully match prototype — deploy for user feedback
3. **After Phases 5–6**: Forms and admin pages migrated — settings workflows validated
4. **After Phase 7**: All pages migrated — ready for MUI removal
5. **After Phase 8**: Clean codebase, reduced bundle — fully complete

# Feature Specification: MUI to shadcn/ui Migration

**Feature Branch**: `003-mui-to-shadcn-migration`  
**Created**: 2026-03-23  
**Status**: Draft  
**Input**: User description: "As a platform maintainer of Alkemio, I want to migrate the client-web frontend from MUI to shadcn/ui + Tailwind CSS by using a working redesign prototype as the visual reference, so that the production application matches the new design system while preserving all existing functionality and API integrations."

## Context

The Alkemio platform has two codebases in this repository:

- **`client-web/`** — The production application built with React 19, MUI v7, Emotion, Apollo Client (GraphQL), React Router v7, Formik + Yup, react-i18next, and TipTap for rich text editing. It contains 200+ components across ~2000+ files organized into `core/`, `domain/`, and `main/` modules.
- **`prototype/`** — A working redesign prototype built with React, shadcn/ui (Radix UI primitives), Tailwind CSS v4, Lucide icons, React Hook Form, and Sonner for toasts. It contains 47 UI components (plus 2 utility files) and 25+ pages that demonstrate the target visual design.

The existing master brief (`specs/002-alkemio-1.5-UI-Update/master-brief.md`) documents the component mapping strategy (MUI → shadcn), design token mappings, and per-page migration approach. This specification formalizes the migration as an executable feature to be planned, tasked, and implemented.

### Migration Philosophy

The **prototype is the visual target**. The production application should look like the prototype when migration is complete. The prototype generally follows the same layout and navigation structure as the current site, but where the prototype's design diverges (spacing, proportions, component styling, layout refinements), **the prototype takes precedence**.

The migration MUST preserve:

- All existing user workflows and functionality
- All GraphQL API integrations and data flows
- All authentication, authorization, and routing behavior
- All i18n/localization support

What changes:

- Visual appearance matches the prototype, not the current production site
- Component library changes from MUI to shadcn/ui + Tailwind CSS
- Layout and styling details follow the prototype's implementation, even where they differ from the current site

What does NOT change:

- No new features, pages, or user-facing functionality are added
- No existing functionality is removed
- The underlying data layer, routing, and business logic remain untouched

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Core Page Visual Parity (Priority: P1)

As a platform user, I navigate the high-priority pages (Dashboard, Space Home, Community Tab, Subspaces Tab, Knowledge Base Tab, Post Detail, Subspace Page) and see the updated visual design from the prototype, while all content, interactions, and navigation continue to work exactly as before.

**Why this priority**: These 7 pages represent the primary user journey through the platform. Visual parity on these pages delivers the majority of the perceived modernization value and covers the most-used paths.

**Independent Test**: Navigate through each high-priority page, verify the visual design matches the prototype reference, and confirm all interactive elements (buttons, links, tabs, cards, forms, dialogs) function identically to the current production behavior.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the Dashboard, **When** they view the page, **Then** the layout uses the new design system components (shadcn Cards, updated typography, new color palette) while displaying the same content sections (recent activity, my spaces, recommended spaces) as the current production site.
2. **Given** a user navigating to a Space Home page, **When** the page loads, **Then** the space header, tab navigation (Home, Community, Subspaces, Knowledge Base), and content areas render with shadcn components while preserving all existing functionality (join space, view callouts, navigate tabs).
3. **Given** a user on the Knowledge Base tab, **When** they interact with callout cards, post content, or open detail dialogs, **Then** all interactions complete successfully using the new component library with no loss of functionality.
4. **Given** a user viewing a Post Detail page, **When** they read content, view responses, or submit a response, **Then** the full read/write flow works identically to the current system using the new visual components.

---

### User Story 2 — Design System Foundation (Priority: P1)

As a developer, I can use the shared shadcn/ui component library and Tailwind CSS design tokens from the prototype as the foundation for all migrated pages, ensuring visual consistency across the entire application.

**Why this priority**: Without a solid design system foundation (components, tokens, theme), individual page migrations would be inconsistent. This is the prerequisite for all other work.

**Independent Test**: Import and render each base component (Button, Card, Input, Dialog, Avatar, Badge, Tabs, etc.) in isolation and verify they match the prototype's visual output and support all required variants.

**Acceptance Scenarios**:

1. **Given** the design system is integrated into client-web, **When** a developer imports a shadcn Button component, **Then** it renders with the correct typography, colors, spacing, and variant styles matching the prototype.
2. **Given** the Tailwind CSS configuration is applied, **When** design tokens (colors, spacing, typography, border-radius) are used, **Then** they produce output consistent with the prototype's theme.css definitions (primary: `#1D384A`, font: Inter, spacing scale matching Tailwind defaults).
3. **Given** the light mode theme is applied, **When** any component renders, **Then** it uses the correct CSS custom property values matching the prototype's light theme.

---

### User Story 3 — Account & Settings Pages (Priority: P2)

As a user managing my account, I can access all settings pages (Profile, Membership, Organizations, Notifications) and they display correctly with the new design system while all settings changes save and persist as before.

**Why this priority**: Settings pages are used less frequently than core pages but are essential for account management. They typically use many form components (inputs, selects, switches, checkboxes) which makes them a thorough integration test of the form component migration.

**Independent Test**: Navigate to each account settings tab, modify a setting value, save, and verify the change persists after page reload.

**Acceptance Scenarios**:

1. **Given** a user on the Profile Settings page, **When** they update their display name and save, **Then** the form uses shadcn Input, Select, and Button components, and the GraphQL mutation fires successfully, and the change is reflected on page reload.
2. **Given** a user on the Notifications Settings page, **When** they toggle notification preferences, **Then** shadcn Switch components render correctly and changes persist via the existing API.

---

### User Story 4 — Space Settings & Admin Pages (Priority: P2)

As a space administrator, I can access all space settings pages (Profile, Context, Community, Updates, Subspaces, Templates, Storage, Account) and the admin dashboard, and manage my space using the updated components with no functional regressions.

**Why this priority**: Space settings involve complex forms, data grids, and multi-step workflows. Migrating these validates that the new component library handles advanced use cases. Admin pages affect platform governance.

**Independent Test**: Navigate to each space settings tab, perform a representative configuration change, and verify it saves correctly.

**Acceptance Scenarios**:

1. **Given** a space admin on Space Settings — Community, **When** they invite a member or change a role, **Then** the flow completes using the new UI components with the same steps and confirmations as the current system.
2. **Given** a platform admin on the Admin Dashboard, **When** they view and manage platform entities, **Then** data grids, filters, and action buttons work correctly with the new component library.

---

### User Story 5 — Discovery & Templates (Priority: P3)

As a user exploring the platform, I can browse all spaces, search the platform, and view the template library using the updated design, with all filtering, pagination, and navigation working as before.

**Why this priority**: Discovery pages are important for new users and content exploration but represent a smaller surface area. Template pages are used less frequently.

**Independent Test**: Use the Explore Spaces page to filter and browse spaces, use the platform search overlay, and navigate the template library. Verify all filtering, search, and pagination mechanisms work.

**Acceptance Scenarios**:

1. **Given** a user on the Explore All Spaces page, **When** they apply filters and browse results, **Then** space cards render with shadcn Card components and filtering/pagination work identically.
2. **Given** a user triggering the platform search overlay, **When** they type a search query, **Then** results display using the new autocomplete/combobox components with no loss of search functionality.

---

### User Story 6 — MUI Dependency Removal (Priority: P3)

As a platform maintainer, after all pages and components have been migrated, the MUI packages (@mui/material, @mui/icons-material, @mui/system, @mui/x-data-grid, @mui/x-date-pickers), Emotion (@emotion/react, @emotion/styled), Formik, and Yup are fully removed from the project dependencies, reducing bundle size and eliminating legacy libraries.

**Why this priority**: This is the cleanup story that can only happen after all components and forms are migrated. Bundle size reduction and dependency simplification are maintenance benefits, not user-facing value.

**Independent Test**: Run the build process and verify it succeeds without any MUI, Emotion, Formik, or Yup imports. Check that none of these packages remain in package.json.

**Acceptance Scenarios**:

1. **Given** all components have been migrated, **When** the project is built, **Then** no MUI, Emotion, Formik, or Yup packages appear in the dependency tree and the build succeeds.
2. **Given** the migration is complete, **When** comparing the production bundle size, **Then** the total bundle is smaller than or equal to the pre-migration bundle.

---

### Edge Cases

- What happens when a MUI component has no direct shadcn equivalent (e.g., MUI X DataGrid)? — MUI X DataGrid is replaced with TanStack Table (headless) styled with shadcn Table components, providing full sorting, filtering, pagination, and column features without MUI. Other gaps are documented in the per-page briefs in `specs/002-alkemio-1.5-UI-Update/pages/`.
- What happens when MUI components are deeply integrated with Formik? — Formik + Yup is replaced with React Hook Form + Zod as part of this migration. All form validation behavior must be preserved with equivalent schemas and error handling.
- What happens when collaborative editing components (TipTap, Hocuspocus) use MUI-styled wrappers? — The rich text editor core is preserved; only the surrounding chrome (toolbars, containers) is restyled.
- How does the migration handle MUI theme references in deeply nested components? — Components that read from MUI's `useTheme()` or `styled()` must be refactored to use Tailwind classes or CSS custom properties.
- What happens during the migration when both MUI and shadcn components coexist? — Tailwind CSS prefixing (e.g., `tw-` prefix) is used to prevent class name collisions between Emotion (MUI) and Tailwind during the transition. Migration proceeds module-by-module to minimize coexistence windows.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST render all existing pages using shadcn/ui components and Tailwind CSS classes instead of MUI components and Emotion styles.
- **FR-002**: All existing user workflows (authentication, space creation, community management, content posting, settings management) MUST continue to function identically after migration.
- **FR-003**: All GraphQL queries, mutations, and subscriptions MUST remain unchanged — the migration is purely presentational.
- **FR-004**: The application MUST use the prototype's design tokens (colors, typography, spacing, border-radius) as defined in the prototype's `theme.css` and Tailwind configuration.
- **FR-005**: The application MUST support light color mode using CSS custom properties, consistent with the prototype's theme implementation. Dark mode is out of scope for this migration.
- **FR-006**: All internationalized text (i18n via react-i18next) MUST continue to render correctly with no changes to translation keys or loading behavior.
- **FR-007**: The application MUST preserve all existing keyboard navigation, focus management, and screen reader compatibility. shadcn's Radix UI primitives provide accessible defaults that must not be degraded.
- **FR-008**: The application MUST maintain all existing responsive breakpoints and mobile-friendly layouts, adapting them to Tailwind's responsive utilities.
- **FR-009**: The component mapping MUST follow the mapping table defined in `specs/002-alkemio-1.5-UI-Update/master-brief.md` (Section 3) as the authoritative reference.
- **FR-010**: Complex domain components (MarkdownEditor/TipTap, Whiteboard, collaborative editing) MUST preserve their core functionality — only their outer styling wrappers are migrated.
- **FR-011**: Drag-and-drop functionality (currently using @dnd-kit) MUST continue to work. Only the visual styling of draggable/droppable elements is updated.
- **FR-012**: All existing error boundaries, loading states, and skeleton screens MUST be preserved using shadcn equivalents.
- **FR-013**: The application MUST support incremental migration — MUI and shadcn components MUST coexist without style conflicts during the transition period, using Tailwind CSS prefixing to prevent class name collisions.
- **FR-014**: All MUI icon imports (@mui/icons-material) MUST be replaced with Lucide React equivalents.
- **FR-015**: All Formik + Yup form handling MUST be migrated to React Hook Form + Zod, preserving all existing validation rules and error handling behavior.

### Key Entities

- **Design Token**: A named value (color, spacing, font size, border-radius, shadow) that defines the visual language. Tokens are defined as CSS custom properties in `theme.css` and consumed via Tailwind utility classes.
- **Component**: A reusable UI element (Button, Card, Dialog, Input, etc.) that replaces a corresponding MUI component. Components are sourced from the prototype's `src/app/components/ui/` directory.
- **Page**: A route-level view (Dashboard, Space Home, Settings, etc.) composed of multiple components. Each page has a corresponding entry in the page index at `specs/002-alkemio-1.5-UI-Update/master-brief.md` (Section 6).
- **Component Mapping**: The correspondence between a current MUI component and its shadcn replacement, including any behavioral or API differences. Defined in the master brief Section 3.

## Assumptions

- The prototype's 47 shadcn/ui components cover the full set of primitives needed for the migration. Where gaps exist, new components will be created following shadcn conventions.
- MUI X DataGrid is replaced with TanStack Table (headless) + shadcn Table styling for all data grid use cases (admin tables, community member lists, license plans).
- The prototype's visual design is the authoritative visual reference; the Figma file is supplementary.
- The existing GraphQL schema and API contracts are stable and will not change during the migration.
- Formik + Yup is fully replaced with React Hook Form + Zod, aligning with the prototype's form handling approach. All existing validation schemas are converted to Zod equivalents.
- All MUI icons (@mui/icons-material) are replaced with Lucide React icons, matching the prototype's icon library.
- Only light mode is in scope. Dark mode token structure from the prototype is preserved in CSS custom properties for potential future use but is not tested or shipped.
- React Router v7 routing structure remains unchanged.
- The i18n system (react-i18next) remains unchanged.
- Authentication and authorization mechanisms are unaffected.
- The migration will proceed page-by-page, allowing partial deployment during the transition.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 31 pages listed in the page index (master brief Section 6, pages 1–23 and 25–32) render correctly using shadcn/ui components and Tailwind CSS, with visual output matching the prototype reference. Visual parity is verified by manual side-by-side comparison of layout structure, color palette, typography, and spacing against the prototype.
- **SC-002**: 100% of existing end-to-end user workflows (login, space creation, content posting, community management, settings changes, search, template browsing) complete successfully after migration.
- **SC-003**: Zero MUI, Emotion, Formik, or Yup packages remain in the production dependency tree after migration is complete.
- **SC-004**: The production bundle size is equal to or smaller than the pre-migration baseline.
- **SC-005**: All existing automated tests (unit, integration) pass without modification to test assertions (only component render wrappers may change).
- **SC-006**: Page load time for the Dashboard remains within 10% of the pre-migration baseline.
- **SC-007**: Application accessibility score (measured by automated tooling) is equal to or better than the pre-migration baseline.
- **SC-008**: No user-facing functionality is removed, altered, or added — the migration is purely visual.

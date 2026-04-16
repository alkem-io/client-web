# Research: CRD Space L0 Page Migration

**Branch**: `042-crd-space-page` | **Date**: 2026-04-07

## R1: CRD/MUI CSS Isolation for Inline Components

**Decision**: Callout rendering must be CRD (not MUI composition slots)

**Rationale**: The 039 spec reused MUI dialogs via portals — these mount outside `.crd-root` so Tailwind preflight never touches them. Callouts render **inline** as children of the CRD layout, **inside** `.crd-root`. Tailwind's preflight (margin resets, font normalization, border-box) would break MUI Paper, Box, Typography, and Button styling. The visual result would also be obviously two-toned (shadcn sidebar next to Material Design content area).

**Alternatives considered**:
- Composition slots (MUI callouts inside CRD layout): Rejected due to CSS conflicts and visual inconsistency
- CSS reset exclusion zones (wrapping MUI in a `.no-preflight` class): Fragile, defeats the purpose of consistent design
- Full MUI removal first: Too risky, blocks incremental delivery

## R2: Whiteboard Integration Boundary

**Decision**: WhiteboardPreview (inline thumbnail) → CRD. WhiteboardDialog (collaboration system) → MUI portal.

**Rationale**: The whiteboard system is 1200+ lines of collaboration infrastructure (Collab class for scene sync, Portal class for WebSocket with binary encoding, file management pipeline, preview generation with Auto/Custom/Fixed modes, guest session management). All of it renders inside WhiteboardDialog, which portals outside `.crd-root`. The inline preview is just an `<img>` tag + 2 buttons — trivial to rebuild in CRD.

**Alternatives considered**:
- Full whiteboard system migration: Massive scope, no benefit (dialog already escapes CRD scope)
- Iframe embedding: Unnecessary complexity, current portal pattern works
- Wrapping WhiteboardPreview in MUI: Would bring MUI inline into `.crd-root` (preflight conflict)

**Update (2026-04-15)**: This decision has been **revised** in [whiteboard/research.md](./whiteboard/research.md) (R-WB-1). The dialog **chrome** (header, footer, display name) is being migrated to CRD via a slot pattern, while the Excalidraw collaboration infrastructure stays unchanged. The inline previews remain CRD as originally decided.

## R3: Rich Text Rendering vs Editing

**Decision**: Read-only markdown → CRD `MarkdownContent` component. Tiptap editor → integration layer wraps existing component.

**Rationale**: Read-only markdown display (callout descriptions, memo previews) is just sanitized HTML rendering — no Tiptap dependency needed. The CRD component receives `htmlContent: string` and renders it. For editing (callout forms), the existing Tiptap editor component is rendered by the integration layer (FormikFieldConnector pattern), not imported into `src/crd/`.

**Alternatives considered**:
- Rebuilding markdown renderer: Unnecessary, markdown-to-HTML is a solved problem
- Importing Tiptap in `src/crd/`: Violates "no business logic" rule and adds complexity

## R4: Form State Management

**Decision**: Formik stays in integration layer via Connector pattern.

**Rationale**: Callout forms are complex (nested objects, conditional fields, cross-field validation, file uploads). Formik handles this well. CRD form components are pure UI: `<input value={v} onChange={fn} error={err} />`. The integration layer (`CalloutFormConnector`) creates a Formik context, binds CRD inputs to Formik fields, and handles submission.

**Alternatives considered**:
- Plain React state in integration layer: Feasible but would re-implement Formik's validation, dirty tracking, and error handling
- Zod + react-hook-form: Could work but adds new dependency; Formik is already battle-tested here
- Form state in CRD: Violates CRD rules (no business logic)

## R5: Tab Content Decoupling from Position

**Decision**: Tab content components are registered by section type, not hardcoded by index.

**Rationale**: The current MUI implementation hardcodes `sectionIndex === 0 → Dashboard`, etc. in `SpaceTabbedPages`. For CRD, `CrdSpaceTabbedPages` will use a mapping that can be refactored to a layout setting in the future. Each section component (Dashboard, Community, Subspaces, Custom) is a standalone component that receives its tab's Innovation Flow state.

**Alternatives considered**:
- Full layout setting now: Over-engineering for this spec; add when backend supports it
- Keep hardcoded positions: Works now but blocks future configurability

## R6: Existing Hooks Reuse

**Decision**: Reuse `useSpace()`, `useSpaceTabProvider()`, `useCalloutsSet()`, `useRoleSetManager()`, `useApplicationButton()` from `src/domain/`.

**Rationale**: These hooks encapsulate complex GraphQL query orchestration, pagination, filtering, and subscription logic. Rebuilding them would be wasteful and risky. Integration layer hooks compose them and map output to CRD-compatible types. No data layer changes needed.

**Alternatives considered**:
- New GraphQL queries: Unnecessary, all data already available
- Direct Apollo usage in integration: Would bypass tested hooks
- Hooks in `src/crd/`: Violates CRD rules (no Apollo, no domain)

## R7: SpaceContextProvider Reuse

**Decision**: SpaceContextProvider is reused unchanged inside the CRD route tree.

**Rationale**: SpaceContextProvider loads space data, permissions, entitlements, and visibility. It's used by both MUI and CRD tab pages. Moving it or duplicating it would be wasteful. The CRD route tree wraps SpaceContextProvider around CrdSpacePageLayout, same as the MUI tree wraps it around SpacePageLayout.

## R8: Mobile Tab Navigation

**Decision**: CRD bottom navigation with Radix-based overflow drawer.

**Rationale**: Current MUI uses `BottomNavigation` component with a custom drawer. CRD replaces this with a fixed-bottom flex container + Radix Sheet for the "More" menu. Tabs are `<button>` elements with `aria-selected`. Same UX, CRD-styled.

**Alternatives considered**:
- Radix Tabs (full component): Radix Tabs doesn't natively support bottom placement with overflow drawer
- CSS-only responsive tabs: Insufficient for the overflow pattern
- Keep MUI BottomNavigation: Would bring MUI inline (preflight conflict)

## R9: Contribution Detail Pages Out of Scope

**Decision**: When a user clicks a contribution card, the existing MUI contribution detail page renders.

**Rationale**: Contribution detail pages (`/collaboration/:calloutNameId/:contributionId`) are separate routes that render full-page views. They're used across L0/L1/L2 spaces. Migrating them in this spec would expand scope significantly. They render inside CrdSpacePageLayout's Outlet (same as settings/subspace routes).

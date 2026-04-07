# Implementation Plan: CRD Space L0 Page Migration (with Callouts)

**Branch**: `042-crd-space-page` | **Date**: 2026-04-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/042-crd-space-page/spec.md`

## Summary

Migrate the Space L0 page from MUI to the CRD design system (shadcn/ui + Tailwind CSS), including the page shell (banner, dynamic tab navigation), all 4+ tab pages, and the full callout content system (rendering, creation/editing forms, contributions, templates, comments). Uses the established three-layer architecture from 039: CRD presentational components (`src/crd/`) → integration layer (`src/main/crdPages/space/`) → route-level toggle in `TopLevelRoutes.tsx`. Complex dialogs (WhiteboardDialog, MemoDialog, Activity, Share, etc.) remain MUI and render as portals outside `.crd-root`.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), class-variance-authority, lucide-react, Apollo Client (existing, unchanged)
**Storage**: N/A (frontend SPA; data via existing GraphQL queries, no new backend APIs)
**Testing**: Vitest with jsdom (~57 files / 595 tests currently)
**Target Platform**: Web SPA (Vite, localhost:3001, backend at localhost:3000)
**Project Type**: Web SPA — existing monorepo with established CRD layer
**Performance Goals**: Equal or better than MUI version (no additional network requests, no slower initial render)
**Constraints**: Zero MUI/Emotion in `src/crd/`, WCAG 2.1 AA, React Compiler compatible (no manual memoization), `.crd-root` CSS scoping, form state (Formik) stays in integration layer
**Scale/Scope**: ~40-50 new CRD components, ~20 integration layer files, 1 new i18n namespace (`crd-space`), ~600 lines of spec across 14 user stories and 119 FRs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Domain-Driven Frontend Boundaries | PASS | CRD components are purely presentational; domain logic remains in `src/domain/` and integration layer |
| II | React 19 Concurrent UX Discipline | PASS | No legacy patterns; Suspense for lazy loading; no manual memoization (React Compiler) |
| III | GraphQL Contract Fidelity | PASS | Reuse existing generated hooks via integration layer; no schema changes |
| IV | State & Side-Effect Isolation | PASS | CRD components have visual-only state; side effects isolated in integration hooks |
| V | Experience Quality & Safeguards | PASS | WCAG 2.1 AA required (FR-105 to FR-115); responsive design (FR-092 to FR-097) |
| Arch 1 | Feature directory taxonomy | PASS | `src/crd/` for design system, `src/main/crdPages/space/` for integration |
| Arch 2 | Styling standard | **VIOLATION** (intentional) | Tailwind CSS alongside MUI — required for incremental migration. Same violation as 039, tracked below |
| Arch 3 | i18n pipeline | PASS | New `crd-space` namespace in `src/crd/i18n/space/`; EN only edited, CRD translations manually managed |
| Arch 4 | Build determinism | PASS | No Vite config changes |
| Arch 5 | Import transparency | PASS | No barrel exports; explicit file paths |
| Arch 6 | SOLID / DRY | PASS | Tab content components decoupled from positional indices; shared callout components across tabs |
| Eng 5 | Root cause analysis | PASS | No workarounds; all design decisions documented |

## Project Structure

### Documentation (this feature)

```text
specs/042-crd-space-page/
├── plan.md              # This file
├── spec.md              # Feature specification (with callouts)
├── research.md          # Phase 0: research findings
├── data-model.md        # Phase 1: CRD prop type definitions
├── quickstart.md        # Phase 1: development setup guide
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/crd/
├── components/
│   ├── space/
│   │   ├── SpaceBanner.tsx              # Banner with visual, title, tagline
│   │   ├── SpaceTabs.tsx                # Dynamic tab navigation (Innovation Flow states)
│   │   ├── SpaceTabLayout.tsx           # Sidebar + content area two-column layout
│   │   ├── SpaceVisibilityNotice.tsx    # Archived/Demo/Inactive notice bar
│   │   ├── SpaceWelcomeBlock.tsx        # Dashboard sidebar: description + leads
│   │   ├── SpaceDashboardNav.tsx        # Dashboard sidebar: related spaces links
│   │   ├── SpaceCalendarSection.tsx     # Dashboard sidebar: upcoming events
│   │   ├── SpaceLeadsSection.tsx        # Lead users/orgs (sidebar block)
│   │   ├── SpaceMemberCard.tsx          # Wide-format member/org card
│   │   ├── SpaceMemberGrid.tsx          # Community: member/org card grid
│   │   ├── SpaceGuidelinesBlock.tsx     # Community guidelines sidebar block
│   │   ├── SpaceSubspaceList.tsx        # Subspaces sidebar: searchable link list
│   │   └── SpaceAboutView.tsx           # About page content layout
│   ├── callout/
│   │   ├── CalloutBlock.tsx             # Main callout container (title, desc, framing, contributions)
│   │   ├── CalloutList.tsx              # Scrollable group of callout blocks
│   │   ├── CalloutHeader.tsx            # Title + settings trigger + author
│   │   ├── CalloutSidebarList.tsx       # Sidebar searchable callout list
│   │   ├── CalloutTagCloud.tsx          # Tag cloud filter with selectable chips
│   │   ├── CalloutContextMenu.tsx       # Settings dropdown (edit, publish, delete, move, share)
│   │   ├── CalloutDraftBadge.tsx        # Draft indicator
│   │   ├── CalloutFramingMemo.tsx       # Rendered markdown with expand
│   │   ├── CalloutFramingWhiteboard.tsx # Preview thumbnail + open button
│   │   ├── CalloutFramingLink.tsx       # CTA button with URL
│   │   ├── CalloutFramingMedia.tsx      # Image grid
│   │   ├── CalloutFramingPoll.tsx       # Poll questions, options, voting UI
│   │   ├── CalloutComments.tsx          # Threaded comment list + add form
│   │   └── CalloutCommentItem.tsx       # Single comment: avatar, name, timestamp, content
│   ├── contribution/
│   │   ├── ContributionGrid.tsx         # Expandable card grid (5 cols, 2 rows collapsed)
│   │   ├── ContributionPostCard.tsx     # Post: title, author, date, comment count
│   │   ├── ContributionWhiteboardCard.tsx # Whiteboard: preview thumbnail + title
│   │   ├── ContributionMemoCard.tsx     # Memo: markdown preview + title
│   │   ├── ContributionLinkList.tsx     # Link contributions list
│   │   ├── ContributionPreview.tsx      # Inline preview with navigation
│   │   └── ContributionCreateButton.tsx # Type-specific create trigger
│   └── common/
│       ├── ExpandableDescription.tsx    # Truncated text with expand/collapse
│       ├── MarkdownContent.tsx          # Read-only rendered markdown
│       └── ContentBlock.tsx             # Generic sidebar/content block with accent
├── forms/
│   ├── callout/
│   │   ├── CalloutFormLayout.tsx        # Form shell (title, desc, tags, refs, actions)
│   │   ├── CalloutFramingSelector.tsx   # 6-option type selector with icons
│   │   ├── CalloutContributionSettings.tsx # Allowed types, comments toggle
│   │   ├── CalloutVisibilitySelector.tsx # Draft/Published toggle
│   │   ├── PollOptionsEditor.tsx        # Poll question + 2-10 option fields
│   │   └── LinkFramingFields.tsx        # URL + display name inputs
│   └── contribution/
│       └── ContributionFormLayout.tsx   # Post/Memo/Whiteboard/Link creation form shell
├── i18n/
│   └── space/
│       ├── space.en.json               # English translations
│       ├── space.bg.json
│       ├── space.de.json
│       ├── space.es.json
│       ├── space.fr.json
│       └── space.nl.json
└── hooks/
    └── (existing useMediaQuery, useScreenSize)

src/main/crdPages/
├── space/
│   ├── routing/
│   │   └── CrdSpaceRoutes.tsx           # Route tree (mirrors SpaceRoutes, CRD layout)
│   ├── layout/
│   │   └── CrdSpacePageLayout.tsx       # Page shell integration (banner + tabs + outlet)
│   ├── tabs/
│   │   ├── CrdSpaceDashboardPage.tsx    # Dashboard tab integration
│   │   ├── CrdSpaceCommunityPage.tsx    # Community tab integration
│   │   ├── CrdSpaceSubspacesPage.tsx    # Subspaces tab integration
│   │   ├── CrdSpaceCustomTabPage.tsx    # Custom tab integration (Knowledge Base+)
│   │   └── CrdSpaceTabbedPages.tsx      # Tab router (sectionIndex → page)
│   ├── about/
│   │   └── CrdSpaceAboutPage.tsx        # About route integration
│   ├── callout/
│   │   ├── CalloutBlockConnector.tsx    # Maps callout GraphQL data → CRD CalloutBlock props
│   │   ├── CalloutListConnector.tsx     # Maps CalloutsSet → CRD CalloutList, handles lazy loading
│   │   ├── CalloutFormConnector.tsx     # Wraps CRD form UI with Formik + GraphQL mutations
│   │   ├── CalloutEditConnector.tsx     # Edit form with data pre-fill
│   │   ├── CalloutManagementConnector.tsx # Context menu actions → GraphQL mutations
│   │   ├── ContributionGridConnector.tsx # Maps contributions → CRD ContributionGrid
│   │   ├── ContributionCreateConnector.tsx # Wraps creation forms with mutations
│   │   ├── CalloutCommentsConnector.tsx # Maps comments data + mutation wiring
│   │   ├── TemplateImportConnector.tsx  # Wraps MUI ImportTemplatesDialog trigger
│   │   └── FramingEditorConnector.tsx   # Wraps Tiptap/whiteboard editors in form context
│   ├── dataMappers/
│   │   ├── spacePageDataMapper.ts       # Space → SpacePageData (banner, tabs)
│   │   ├── calloutDataMapper.ts         # Callout GraphQL → CalloutData (CRD props)
│   │   ├── contributionDataMapper.ts    # Contributions → ContributionData
│   │   ├── communityDataMapper.ts       # Members/leads → CRD card props
│   │   └── subspaceCardDataMapper.ts    # Subspaces → SubspaceCardData
│   └── hooks/
│       ├── useCrdSpaceTabs.ts           # Innovation Flow states → tab definitions
│       ├── useCrdSpaceDashboard.ts      # Dashboard data orchestration
│       ├── useCrdSpaceCommunity.ts      # Community data orchestration
│       ├── useCrdCalloutList.ts         # Callout fetching, filtering, lazy loading
│       └── useCrdCalloutForm.ts         # Form state management (Formik bridge)
├── spaces/                              # (existing from 039)
└── useCrdEnabled.ts                     # (existing from 039)
```

**Structure Decision**: Follows the established three-layer architecture from 039/041:
- `src/crd/components/` and `src/crd/forms/`: Pure presentational components (zero MUI, plain TS props, Tailwind styling)
- `src/main/crdPages/space/`: Integration layer (data mapping, hooks, mutation wiring, dialog bridging)
- `TopLevelRoutes.tsx`: Route-level CRD/MUI toggle

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Arch #2: Tailwind alongside MUI | Incremental migration — both design systems coexist during transition | Full MUI removal requires all pages migrated simultaneously; too risky |

## Design Decisions

### D1: Three-layer architecture (same as 039/041)
CRD presentational → integration layer → routing toggle. Proven pattern, consistent with existing migrations.

### D2: Route-level CRD/MUI split via feature toggle
TopLevelRoutes conditionally routes `:spaceNameId/*` to either CrdSpaceRoutes (crdEnabled) or SpaceRoutes (!crdEnabled). CrdLayoutWrapper wraps the entire space route tree when CRD is active. SpaceContextProvider is reused unchanged inside both route trees.

### D3: CrdSpacePageLayout replaces SpacePageLayout
New CRD equivalent provides: banner + dynamic tabs (desktop top / mobile bottom) + Outlet. Sub-routes (settings, subspaces, callout detail) render inside the Outlet. Settings pages show their own admin layout below the CRD banner. Subspaces use SubspacePageLayout internally.

### D4: Tab content components decoupled from position
Each tab section (Dashboard, Community, Subspaces, Custom) is a standalone component registered by tab type, not by positional index. The current positional mapping (0=Dashboard, 1=Community, 2=Subspaces, 3+=Custom) is a configuration, not hardcoded logic. This prepares for a future layout setting that controls which sections appear on which tabs.

### D5: Callout rendering fully in CRD
All 5 framing types (Memo, Whiteboard, Link, Media Gallery, Poll) have CRD presentational components. This avoids the CSS isolation problem of embedding MUI callout blocks inside CRD layouts (Tailwind preflight would affect inline MUI components). Callout blocks render inside `.crd-root` — they must be CRD.

### D6: Complex dialogs remain MUI via portal boundary
WhiteboardDialog (+ entire collaboration stack: Collab, Portal, file management, preview generation, guest sessions), MemoDialog (+ Tiptap editor), Activity dialog, Video Call dialog, Share dialog, Direct Message dialog, Application flow — all remain MUI. They render as portals outside `.crd-root`, so no CSS isolation issue. CRD components trigger them via `onOpen*` callback props; the integration layer manages dialog state and renders the MUI dialog.

### D7: Form state management in integration layer
Callout creation/editing forms use Formik for state management (validation, dirty tracking, field-level errors). Formik is NOT imported in `src/crd/`. CRD form components (`CalloutFormLayout`, `CalloutFramingSelector`, etc.) are pure UI: inputs, selectors, radio groups. The integration layer (`CalloutFormConnector`) wraps them in Formik context, passes `value`/`onChange`/`error` props, and handles submission via GraphQL mutations.

### D8: Tiptap wrapped by integration layer
For read-only markdown display (callout descriptions, memo previews): CRD `MarkdownContent` component renders sanitized HTML — no Tiptap needed. For editing (callout creation forms): `FramingEditorConnector` in the integration layer renders the existing Tiptap-based markdown editor component, passing content up via Formik field binding. The Tiptap component itself is unchanged.

### D9: Whiteboard preview as simple CRD component
`CalloutFramingWhiteboard` in CRD is just: `<img>` (preview URI) + `<button>` ("Open"). When clicked, the integration layer opens WhiteboardDialog (MUI portal). The entire collaboration stack (1200+ lines of Collab/Portal/FileManager) is invoked by the dialog — none enters `src/crd/`. Same for whiteboard contribution cards: just `<img>` + title.

### D10: i18n namespace `crd-space`
New namespace for Space page labels. Registered in `src/core/i18n/config.ts` under `crdNamespaceImports`. All 6 languages (en, nl, es, bg, de, fr). Components use `useTranslation('crd-space')`. Business data (space names, descriptions, callout content) passed as props, never translated in CRD.

### D11: Existing hooks reused where possible
`useSpace()`, `useSpaceTabProvider()`, `useCalloutsSet()`, `useRoleSetManager()`, `useApplicationButton()` — all existing hooks in `src/domain/` continue to work unchanged. Integration layer hooks (`useCrdSpaceDashboard`, etc.) compose them and map output to CRD-compatible types via data mappers.

### D12: Responsive via Tailwind breakpoints
Desktop (>960px): tabs above content, sidebar + content 2-column layout.
Tablet (600-960px): tabs above, narrower sidebar.
Mobile (<600px): bottom tab bar with overflow drawer, single column, sidebar hidden or stacked above content.
All via Tailwind responsive classes (`sm:`, `md:`, `lg:`), no MUI breakpoint system.

### D13: Contribution grid responsive columns
Desktop: 5 cards/row (matching current MUI). Tablet: 3 cards/row. Mobile: 1 card/row. Uses Tailwind grid with `grid-cols-[repeat(auto-fill,minmax(200px,1fr))]` or explicit breakpoints. Expand/collapse controlled by CRD component visual state.

### D14: Lazy loading via IntersectionObserver
Callout blocks load progressively as user scrolls, matching current behavior. CRD component accepts `onVisible` callback; integration layer triggers data fetch. The `useCalloutsSet` hook already supports this via `fetchMore`.

### D15: Poll voting as CRD component
Poll questions, options, and voting UI rendered in CRD. Vote submission via `onVote` callback to integration layer. Real-time updates via existing GraphQL subscriptions (data layer unchanged). Vote results display with counts and percentages — pure presentation.

### D16: Mobile bottom navigation
CRD `SpaceTabs` component renders as horizontal tabs on desktop (above content) and as a fixed bottom bar on mobile (below content). Overflow actions (Activity, Video Call, Share, Settings) accessible via a "More" button that opens a drawer (Radix Dialog/Sheet). Same UX as current MUI BottomNavigation but CRD-styled.

## Phased Implementation

| Phase | User Stories | What Ships | Effort |
|-------|-------------|-----------|--------|
| P0 | US1 | Page shell: CrdSpaceRoutes, CrdSpacePageLayout, SpaceBanner, SpaceTabs, route toggle | Medium |
| P1 | US2, US3, US4 | Tab content + callout blocks: Dashboard, Subspaces, all 5 framing types | High |
| P2 | US5, US6, US7, US8, US9, US10 | Community, Custom tabs, callout forms/management, contributions | High |
| P3 | US11, US12, US13, US14 | Templates, comments, About page, mobile polish | Medium |

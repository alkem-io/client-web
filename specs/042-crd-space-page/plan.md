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

### Prototype Visual Reference

CRD components use `prototype/src/app/components/space/` as the **visual design reference** — matching the look, layout, spacing, and styling patterns. The code architecture follows CRD conventions (plain TS props, no business logic, Tailwind styling). Key prototype files:

| Prototype File | Purpose |
|---|---|
| `SpaceShell.tsx` | 12-col grid layout: 1-col margin, 2-col sidebar, 8-col content, 1-col margin |
| `SpaceHeader.tsx` | 320px hero banner with gradient, member avatars, action icons |
| `SpaceNavigationTabs.tsx` | Text-only horizontal scroll tabs, border-bottom active indicator |
| `SpaceSidebar.tsx` | Variant-based sidebar (home/community/subspaces/knowledge) with sub-sections |
| `PostCard.tsx` | Card with author+role header, framing preview (whiteboard image), contribution slot, children slot (polls) |
| `SpaceFeed.tsx` | Vertical list of PostCards + "Add Post" button |
| `SpaceMembers.tsx` | Search + role filters + paginated UserCard/OrgCard grid |
| `SpaceSubspacesList.tsx` | Status filters + SpaceCard grid + "Create Subspace" |
| `AddPostModal.tsx` | Rich post composition with attachments and settings |

### Component Mapping: CRD ← MUI ← Prototype

| New CRD Component | Existing MUI Component | Prototype Reference |
|---|---|---|
| **Shell & Layout** | | |
| `crd/layouts/SpaceShell.tsx` | `domain/space/layout/SpacePageLayout.tsx` | `SpaceShell.tsx` |
| `crd/components/space/SpaceHeader.tsx` | `domain/space/layout/tabbedLayout/layout/SpacePageBanner.tsx` | `SpaceHeader.tsx` |
| `crd/components/space/SpaceNavigationTabs.tsx` | `domain/space/layout/tabbedLayout/Tabs/SpaceTabs.tsx` | `SpaceNavigationTabs.tsx` |
| `crd/components/space/SpaceVisibilityNotice.tsx` | `domain/space/layout/tabbedLayout/layout/SpaceVisibilityNotice.tsx` | *(not in prototype)* |
| **Sidebar** | | |
| `crd/components/space/SpaceSidebar.tsx` | *(sidebar sections scattered across tab pages)* | `SpaceSidebar.tsx` |
| `crd/components/space/sidebar/InfoBlock.tsx` | *(inline in SpaceDashboardView)* | `SpaceSidebar.tsx → InfoBlock` |
| `crd/components/space/sidebar/SubspacesSection.tsx` | `domain/space/components/spaceDashboardNavigation/` | `SpaceSidebar.tsx → SubspacesSection` |
| `crd/components/space/sidebar/EventsSection.tsx` | `domain/timeline/calendar/DashboardCalendarSection.tsx` | `SpaceSidebar.tsx → EventsSection` |
| `crd/components/space/sidebar/LeadBlock.tsx` | `domain/space/layout/tabbedLayout/Tabs/SpaceCommunityPage/` | `SpaceSidebar.tsx → LeadBlock` |
| `crd/components/space/sidebar/VirtualContributorsSection.tsx` | `domain/community/virtualContributor/` components | `SpaceSidebar.tsx → VirtualContributorsSection` |
| `crd/components/space/sidebar/CommunityGuidelinesSection.tsx` | `domain/community/guidelines/` components | `SpaceSidebar.tsx → CommunityGuidelinesSection` |
| `crd/components/space/sidebar/KnowledgeIndexSection.tsx` | *(inline in SpaceCustomTabPage)* | `SpaceSidebar.tsx → KnowledgeIndexSection` |
| **Content** | | |
| `crd/components/space/PostCard.tsx` | `domain/collaboration/callout/` CalloutView + CalloutsGroupView | `PostCard.tsx` |
| `crd/components/space/SpaceFeed.tsx` | `domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView.tsx` | `SpaceFeed.tsx` |
| `crd/components/space/SpaceMembers.tsx` | `domain/community/` member components + `useRoleSetManager` | `SpaceMembers.tsx` |
| `crd/components/space/SpaceSubspacesList.tsx` | `domain/space/components/subspaces/SubspaceView.tsx` | `SpaceSubspacesList.tsx` |
| `crd/components/space/SpaceAboutView.tsx` | `domain/space/about/SpaceAboutPage.tsx` | *(not in prototype — about is spec-only)* |
| **Callout-specific** (non-PostCard framing) | | |
| `crd/components/callout/CalloutWhiteboardPreview.tsx` | `domain/collaboration/whiteboard/WhiteboardPreview.tsx` | `PostCard.tsx` (whiteboard type) |
| `crd/components/callout/CalloutPoll.tsx` | `domain/collaboration/poll/PollView.tsx` + `PollVotingControls.tsx` + `PollVoterAvatars.tsx` | *(not in prototype — designed from MUI equivalent)* |
| `crd/components/common/PollVoterAvatars.tsx` | `domain/collaboration/poll/PollVoterAvatars.tsx` | *(not in prototype)* |
| `crd/components/dialogs/ConfirmationDialog.tsx` | `core/ui/dialogs/ConfirmationDialog.tsx` | *(not in prototype — generic AlertDialog wrapper)* |
| `crd/forms/callout/PollSettingsDialog.tsx` | `domain/collaboration/poll/PollFormSettingsSection.tsx` | *(not in prototype)* |
| `crd/components/callout/CalloutMediaGallery.tsx` | `domain/collaboration/callout/media/` components | *(not in prototype)* |
| `crd/components/callout/CalloutLinkAction.tsx` | `domain/collaboration/callout/link/` components | *(not in prototype)* |
| `crd/components/callout/CalloutContextMenu.tsx` | `domain/collaboration/callout/edit/` CalloutSettingsMenu | *(not in prototype)* |
| **Callout detail dialog** | | |
| `crd/components/callout/CalloutDetailDialog.tsx` | `domain/collaboration/callout/calloutBlock/CalloutBlockView.tsx` (expandable view) | `PostDetailDialog.tsx` — sticky header, scrollable body, sticky input footer |
| **Comments** (`crd/components/comment/`) | `domain/communication/room/Comments/` | `PostDetailDialog.tsx` (Discussion section), `ResponseDetailDialog.tsx` |
| `crd/components/comment/CommentThread.tsx` | `CommentsComponent.tsx` + `MessagesThread.tsx` | Discussion section inside `CalloutDetailDialog` |
| `crd/components/comment/CommentItem.tsx` | `MessageView.tsx` | Single comment row |
| `crd/components/comment/CommentInput.tsx` | `FormikCommentInputField.tsx` + `CommentInputField.tsx` | Sticky footer inside `CalloutDetailDialog` |
| `crd/components/comment/CommentReactions.tsx` | `CommentReactions.tsx` + `ReactionView.tsx` | Emoji pills below comments |
| `crd/components/comment/CollapsibleComments.tsx` | `CollapsibleCommentsThread.tsx` | *(deprecated — collapsible-below-card mode removed)* |
| `crd/components/comment/CommentEmojiPicker.tsx` | `core/ui/forms/emoji/EmojiSelector.tsx` | Emoji picker popover |
| **Forms** | | |
| `crd/forms/callout/AddPostModal.tsx` | `domain/collaboration/callout/edit/CalloutEditDialog.tsx` | `AddPostModal.tsx` |
| `crd/forms/callout/CalloutFramingSelector.tsx` | `domain/collaboration/callout/edit/` type selector | `AddPostModal.tsx` (attachment buttons) |
| **Contributions** | | |
| `crd/components/contribution/ContributionGrid.tsx` | `domain/collaboration/callout/contributions/` grid | `PostCard.tsx` (collection/whiteboards type) |
| `crd/components/contribution/ContributionPostCard.tsx` | `domain/collaboration/post/` card components | `PostCard.tsx` (items in collection) |
| **Integration Layer** | | |
| `main/crdPages/space/layout/CrdSpacePageLayout.tsx` | `domain/space/layout/SpacePageLayout.tsx` | — |
| `main/crdPages/space/routing/CrdSpaceRoutes.tsx` | `domain/space/routing/SpaceRoutes.tsx` | — |
| `main/crdPages/space/tabs/CrdSpaceDashboardPage.tsx` | `domain/space/.../SpaceDashboardPage.tsx` | `pages/SpaceHome.tsx` |
| `main/crdPages/space/tabs/CrdSpaceCommunityPage.tsx` | `domain/space/.../SpaceCommunityPage.tsx` | `pages/SpaceCommunity.tsx` |
| `main/crdPages/space/tabs/CrdSpaceSubspacesPage.tsx` | `domain/space/.../SpaceSubspacesPage.tsx` | `pages/SpaceSubspaces.tsx` |
| `main/crdPages/space/tabs/CrdSpaceCustomTabPage.tsx` | `domain/space/.../SpaceCustomTabPage.tsx` | `pages/SpaceKnowledgeBase.tsx` |
| **Whiteboard** (see [whiteboard/plan.md](./whiteboard/plan.md)) | | |
| `crd/components/whiteboard/WhiteboardEditorShell` | `WhiteboardDialog` + `SingleUserWhiteboardDialog` (chrome) | — |
| `crd/components/whiteboard/WhiteboardDisplayName` | `WhiteboardDialog/WhiteboardDisplayName` | — |
| `crd/components/whiteboard/WhiteboardCollabFooter` | `WhiteboardDialog/WhiteboardDialogFooter` | — |
| `crd/components/whiteboard/WhiteboardSaveFooter` | `SingleUserWhiteboardDialog` footer (Save+Delete) | — |
| `crd/components/whiteboard/PreviewSettingsDialog` | `WhiteboardPreviewSettings/WhiteboardPreviewSettingsDialog` | — |
| `crd/components/whiteboard/PreviewCropDialog` | `WhiteboardPreviewSettings/WhiteboardPreviewCustomSelectionDialog` | — |
| `crd/components/whiteboard/JoinWhiteboardDialog` | `main/public/whiteboard/JoinWhiteboardDialog` | — |
| `crd/components/whiteboard/WhiteboardErrorState` | `main/public/whiteboard/PublicWhiteboardError` | — |
| `main/crdPages/whiteboard/CrdWhiteboardDialog` | `WhiteboardDialog` (multi-user, full wiring) | — |
| `main/crdPages/whiteboard/CrdSingleUserWhiteboardDialog` | `SingleUserWhiteboardDialog` (single-user, full wiring) | — |
| `main/crdPages/whiteboard/CrdWhiteboardView` | `WhiteboardsManagement/WhiteboardView` | — |
| `main/crdPages/whiteboard/CrdPublicWhiteboardPage` | `main/public/whiteboard/PublicWhiteboardPage` | — |

**Design Decisions from prototype review:**
- **D-proto-1**: 12-col grid layout (prototype grid) instead of flex sidebar+content
- **D-proto-2**: Desktop tabs are text-only links inside the content column (no icons), matching prototype
- **D-proto-3**: Mobile tabs use spec bottom bar with overflow drawer (not prototype's simple scroll — better mobile UX)
- **D-proto-4**: All callouts render as PostCard with slots for type-specific content: whiteboard framing shows a preview image; contributions are rendered by the integration layer via a `contributionsPreview` slot using the appropriate CRD contribution components; polls use the existing `children` slot
- **D-proto-5**: Sidebar is a single variant-based component with extracted sub-components, matching prototype architecture

### Source Code (repository root)

```text
src/crd/
├── layouts/
│   └── SpaceShell.tsx               # 12-col grid layout (sidebar + tabs + content)
├── components/
│   ├── space/
│   │   ├── SpaceHeader.tsx          # 320px hero banner (gradient, avatars, actions)
│   │   ├── SpaceNavigationTabs.tsx  # Desktop: text tabs with scroll. Mobile: bottom bar + drawer
│   │   ├── SpaceSidebar.tsx         # Variant-based sidebar (home/community/subspaces/knowledge)
│   │   ├── SpaceVisibilityNotice.tsx # Archived/Demo/Inactive notice bar
│   │   ├── PostCard.tsx             # Callout card (author header, type badge, framing preview, contribution slot, children slot)
│   │   ├── SpaceFeed.tsx            # Vertical PostCard list + "Add Post" button
│   │   ├── SpaceMembers.tsx         # Search + role filters + paginated member grid
│   │   ├── SpaceSubspacesList.tsx   # Status filters + SpaceCard grid + "Create Subspace"
│   │   ├── SpaceAboutView.tsx       # About page content layout
│   │   └── sidebar/                 # Sidebar sub-components (extracted from SpaceSidebar)
│   │       ├── InfoBlock.tsx        # Primary-colored description + "Read more"
│   │       ├── SubspacesSection.tsx  # Avatar + name list + "Show all"
│   │       ├── EventsSection.tsx    # Collapsible events + "Show calendar"
│   │       ├── LeadBlock.tsx        # Lead user card (avatar, name, location, bio)
│   │       ├── VirtualContributorsSection.tsx # AI contributor list
│   │       ├── CommunityGuidelinesSection.tsx # Bulleted guidelines
│   │       └── KnowledgeIndexSection.tsx      # Scrollable post index
│   ├── callout/
│   │   ├── CalloutDetailDialog.tsx       # Full-screen dialog: sticky header+footer, scrollable body with Discussion
│   │   ├── CalloutWhiteboardPreview.tsx  # Whiteboard framing: img + "Open" button
│   │   ├── CalloutPoll.tsx               # Poll framing: full-featured (single/multi-choice, results modes, custom options, voter avatars)
│   │   ├── CalloutMediaGallery.tsx       # Media framing: image grid
│   │   ├── CalloutLinkAction.tsx         # Link framing: CTA button
│   │   ├── CalloutSidebarList.tsx        # Sidebar searchable callout list
│   │   ├── CalloutTagCloud.tsx           # Tag cloud filter
│   │   └── CalloutContextMenu.tsx        # Settings dropdown
│   ├── comment/
│   │   ├── CommentThread.tsx            # Thread list: sort toggle + comment items (no sticky input)
│   │   ├── CommentItem.tsx              # Single comment: avatar, name, timestamp, content, actions
│   │   ├── CommentInput.tsx             # Auto-expanding textarea + emoji + send
│   │   ├── CommentReactions.tsx         # Emoji reaction pills + overflow
│   │   ├── CollapsibleComments.tsx      # (deprecated — collapsible-below-card mode removed)
│   │   └── CommentEmojiPicker.tsx       # Popover wrapping emoji-picker-react
│   ├── common/
│   │   ├── ExpandableDescription.tsx
│   │   ├── MarkdownContent.tsx
│   │   ├── ContentBlock.tsx
│   │   └── PollVoterAvatars.tsx         # Stacked voter avatars with hover expand + overflow
│   └── dialogs/
│       └── ConfirmationDialog.tsx       # Generic confirm/cancel dialog (AlertDialog wrapper)
├── forms/
│   └── callout/
│       ├── AddPostModal.tsx         # Rich post composition (matches prototype AddPostModal)
│       ├── PollOptionsEditor.tsx    # Drag-and-drop options + settings slot + status toggle
│       ├── PollSettingsDialog.tsx   # Poll settings modal (single/multi, custom, visibility, avatars)
│       └── (other form components as needed)
├── i18n/
│   └── space/
│       └── (6 language files)
└── hooks/
    └── (existing useMediaQuery, useScreenSize)

src/main/crdPages/
├── space/
│   ├── routing/
│   │   └── CrdSpaceRoutes.tsx
│   ├── layout/
│   │   └── CrdSpacePageLayout.tsx    # Wires SpaceShell + SpaceHeader + SpaceNavigationTabs
│   ├── tabs/
│   │   ├── CrdSpaceDashboardPage.tsx # SpaceSidebar(home) + SpaceFeed
│   │   ├── CrdSpaceCommunityPage.tsx # SpaceSidebar(community) + SpaceMembers + SpaceFeed
│   │   ├── CrdSpaceSubspacesPage.tsx # SpaceSidebar(subspaces) + SpaceSubspacesList + SpaceFeed
│   │   ├── CrdSpaceCustomTabPage.tsx # SpaceSidebar(knowledge) + SpaceFeed
│   │   └── CrdSpaceTabbedPages.tsx
│   ├── about/
│   │   └── CrdSpaceAboutPage.tsx
│   ├── callout/
│   ├── callout/
│   │   ├── CalloutListConnector.tsx  # Maps callouts → PostCard (text/memo) or custom (wb/poll/media)
│   │   ├── CalloutCommentsConnector.tsx # Maps Room → CommentData[], wires mutations, renders CommentThread
│   │   ├── CalloutDetailDialogConnector.tsx # Wraps CalloutDetailDialog: passes callout data + comment slots
│   │   └── (other connectors as needed)
│   ├── dataMappers/
│   │   ├── spacePageDataMapper.ts
│   │   ├── calloutDataMapper.ts
│   │   ├── communityDataMapper.ts
│   │   └── subspaceCardDataMapper.ts
│   └── hooks/
│       ├── useCrdSpaceTabs.ts
│       ├── useCrdSpaceDashboard.ts
│       ├── useCrdSpaceCommunity.ts
│       └── useCrdCalloutList.ts
├── spaces/                           # (existing from 039)
└── useCrdEnabled.ts                  # (existing from 039)
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
Callout creation/editing forms use Formik for state management (validation, dirty tracking, field-level errors). Formik is NOT imported in `src/crd/`. CRD form components (`AddPostModal`, `CalloutFramingSelector`, etc.) are pure UI: inputs, selectors, radio groups. The integration layer (`CalloutFormConnector`) wraps them in Formik context, passes `value`/`onChange`/`error` props, and handles submission via GraphQL mutations.

### D8: Tiptap wrapped by integration layer
For read-only markdown display (callout descriptions, memo previews): CRD `MarkdownContent` component renders sanitized HTML — no Tiptap needed. For editing (callout creation forms): a **new CRD markdown editor** (`src/crd/forms/markdown/MarkdownEditor.tsx`) wraps Tiptap with a fresh CRD toolbar (lucide-react + Tailwind) and bundles the markdown ↔ HTML conversion. It is used as the callout description field via a `descriptionSlot` on `AddPostModal`. The `FramingEditorConnector` handles framing-type-specific editors (poll options, link fields, etc.) separately. See **[CRD Markdown Editor sub-spec](./markdown-editor/spec.md)** for full design.

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

### D13: Contributions rendered via slot, not baked into PostCard
PostCard does NOT know about contribution types. It provides a `contributionsPreview?: ReactNode` slot that the integration layer fills with the appropriate CRD contribution components. This separation means:
- PostCard stays generic — it renders framing content (whiteboard preview image) and delegates everything else to slots
- The integration layer (`ContributionsPreviewConnector`) decides which contribution components to use based on the callout's allowed contribution types: `ContributionWhiteboardCard` for whiteboards (image grid), `ContributionPostCard` for posts, `ContributionMemoCard` for memos, `ContributionLinkList` for links (rendered as a list, not cards)
- `PostType` is simplified to `'text' | 'whiteboard'` — only the framing type matters for PostCard's internal rendering
- The old `enrichPostDataWithContributions` function is removed; contribution data flows through the connector, not through PostCardData

**Contribution preview behavior**: The connector shows up to 4 contributions inline. If there are more than 4, the last (4th) slot renders as a "+N more" button that opens the callout detail dialog. The `useCalloutContributions` hook already supports this — it's called with `pageSize: 4` and provides `total` for the "+N more" count. Full contributions are shown inside the callout detail dialog (where `setFetchAll(true)` loads everything).

This follows the same pattern as polls (rendered via `children` slot by `CalloutPollConnector`) and avoids leaking GraphQL types or contribution-type logic into `src/crd/`.

### D14: Contribution preview layout
The inline contribution preview (inside PostCard) shows up to 4 items in a 2-column grid (sm+) or single column (mobile). When total > 4, the 4th slot becomes a "+N more" button. Full contributions are shown in the callout detail dialog where ContributionGrid provides the full expandable grid (5/3/1 cols, 2-row collapsed + expand button). This keeps the PostCard compact while still showing meaningful previews.

### D14: Lazy loading via IntersectionObserver
Callout blocks load progressively as user scrolls, matching current behavior. CRD component accepts `onVisible` callback; integration layer triggers data fetch. The `useCalloutsSet` hook already supports this via `fetchMore`.

### D15: Poll voting as CRD component
Poll questions, options, and voting UI rendered in CRD. Vote submission via `onVote` callback to integration layer. Real-time updates via existing GraphQL subscriptions (data layer unchanged). Vote results display with counts and percentages — pure presentation.

### D16: Mobile bottom navigation
CRD `SpaceTabs` component renders as horizontal tabs on desktop (above content) and as a fixed bottom bar on mobile (below content). Overflow actions (Activity, Video Call, Share, Settings) accessible via a "More" button that opens a drawer (Radix Dialog/Sheet). Same UX as current MUI BottomNavigation but CRD-styled.

### D19: Comments live inside `CalloutDetailDialog`, not below the callout card on the feed

Comments and discussions are **not** shown inline below the callout card in the feed. Instead, they are surfaced inside the `CalloutDetailDialog`, which opens when the user clicks the callout title or the "X comments" footer button. This matches the prototype `PostDetailDialog.tsx` layout: the dialog owns the full callout reading experience (title, author, description, reactions bar, contributions, discussion).

**Why this approach**: Rendering comments below each card would clutter the feed and conflict with the callout card's compact design. The prototype never shows comments on the feed — they are always in the detail dialog. This approach also avoids the complexity of a collapsible container competing for space with callout content.

**`CalloutDetailDialog`** (`src/crd/components/callout/CalloutDetailDialog.tsx`): pure CRD presentational, three zones:
- **Sticky top header**: `DialogTitle` (callout title), subtitle (space path), close/share/more-options buttons
- **Scrollable body**: `<h1>` title, author row, prose description, optional banner image, reactions+share bar (`border-y`), Contributions section (when applicable), Discussion section (`CommentThread`)
- **Sticky bottom footer**: `CommentInput` (rendered only when `canComment`)

Prop slots for flexible content injection: `commentsSlot: ReactNode`, `commentInputSlot?: ReactNode`, `contributionsSlot?: ReactNode`. This keeps the dialog presentational while the integration connector controls what is injected.

**CRD layer** (`src/crd/components/comment/`): reusable comment components:
- `CommentThread` — thread list (sort toggle, comment items, replies). Does NOT own the sticky input — that is injected by the dialog footer.
- `CommentItem`, `CommentInput`, `CommentReactions`, `CommentEmojiPicker` — unchanged from initial implementation.
- `CollapsibleComments` — **deprecated** (collapsible-below-card mode is removed; dialog always shows full-height). Kept as dead code until T084a clean-up.

**Integration layer**:
- `CalloutCommentsConnector` — maps Room → `CommentData[]`, wires mutations and subscriptions, renders `CommentThread`
- `CalloutDetailDialogConnector` — wraps `CalloutDetailDialog`, passes mapped callout data + `CalloutCommentsConnector` as `commentsSlot` + `CommentInput` (with callbacks from connector) as `commentInputSlot`
- `LazyCalloutItem` — manages `dialogOpen` state; opens dialog on title click or comments-button click; no longer renders `CalloutCommentsConnector` below the card

**Deferred**: @mentions via `react-mentions` — input reserves toolbar space but doesn't implement it. Will be added in a follow-up.

### D17: Reuse `SpaceCard` (from 039) for the Subspaces tab grid
Rather than maintaining a second subspace tile implementation inside `SpaceSubspacesList`, the subspaces grid composes the existing `@/crd/components/space/SpaceCard` component built for the 039 explore-spaces page. This matches Assumption 7 in the spec ("Subspace cards can reuse or extend the SpaceCard CRD component from 039") and gives subspace cards the richer prototype visual treatment (banner image with gradient overlay, privacy badge, stacked parent/child avatars, leads footer) at zero cost. The data mapper (`subspaceCardDataMapper.ts`) maps GraphQL results into `SpaceCardData`, including a deterministic `avatarColor` derived from the subspace id.

Pinning (FR-031) is handled by adding an optional `isPinned?: boolean` to `SpaceCardData` and rendering a `Pin` icon badge next to the privacy badge. The data mapper takes a `sortMode?: SpaceSortMode` argument and forces `isPinned: false` for any mode other than `SpaceSortMode.Alphabetical`, so the indicator only appears when it is semantically meaningful.

### D18: Section-header pattern for top-of-tab gallery sections
The Community and Subspaces tab top sections (`SpaceMembers`, `SpaceSubspacesList`) share a section-header pattern: `<h2>` title + `<p>` descriptive subtitle + optional primary action button (Invite Member / Create Subspace). Title and subtitle accept optional prop overrides but default to `useTranslation('crd-space')` keys, so a future consumer on a different tab can reuse the component with different copy. The primary action only renders when both the permission flag (`canInvite` / `canCreate`) and its callback (`onInvite` / `onCreateClick`) are provided by the integration layer, keeping the components self-contained and permission-agnostic.

Both MUI dialogs are rendered inside the integration-layer page (`CrdSpaceCommunityPage` / `CrdSpaceSubspacesPage`) — `InviteContributorsDialog` (the dialog-only component, not the button-wrapper `InviteContributorsWizard`) for invites, and `CreateSubspace` for creation — controlled by local `useState`. In the Community tab, the same `onInvite` callback is passed to both the sidebar and the section-header button, so either entry point opens the same dialog.

### D19: Community sidebar — unified Lead block, Contact Leads via MUI portal, entitlement-gated VC section
The prototype shows a single "SPACE LEAD(S)" card containing every lead rather than one card per lead. `LeadBlock` takes `leads: LeadItem[]`, auto-returns `null` when empty, and chooses the singular or plural heading based on `leads.length`. Each row is compact (avatar + name + location, no bio) so multiple leads stack cleanly in the narrow sidebar column; organizations render with `rounded-md` avatars to mirror the members-grid treatment. The leads list is built in the integration layer from `usersByRole[Lead]` + `organizationsByRole[Lead]` returned by `useRoleSetManager` — that payload carries the richer profile (location, avatar) the sidebar needs, so we do not fall back to `space.about.membership?.leadUsers` (which is a lighter subset).

"Contact Leads" in the sidebar opens the existing MUI `DirectMessageDialog` rendered inline in `CrdSpaceCommunityPage.tsx` and controlled by local `useState`. Message receivers are built from `leadUsers` only (lead organizations are not direct-message targets). Both the dialog and the button are gated on `leadUsers.length > 0 && Boolean(communityId)` — the button is hidden whenever no receivers exist, so the component never opens an unusable dialog. The mutation comes from `useSendMessageToCommunityLeads(communityId)` unchanged.

The Virtual Contributors section requires BOTH an entitlement check (`LicenseEntitlementType.SpaceFlagVirtualContributorAccess` in `useSpace().entitlements`) AND at least one visible VC (hidden-search VCs filtered out). `SpaceSidebar` exposes a `showVirtualContributors?: boolean` prop (default true) so the integration layer can pass the entitlement flag explicitly; the VC sub-component already hides itself when the list is empty. Both conditions must be true for the section to render.

### D22: Full poll feature parity — CRD CalloutPoll replaces skeleton with MUI-equivalent functionality

The initial `CalloutPoll.tsx` was a placeholder: single-choice only, simple button-based voting, no results modes, no custom options, no debounce, no voter avatars. D22 rewrites it to match every feature of the MUI `PollView` + `PollVotingControls` + `PollVoterAvatars` stack:

**CRD component** (`src/crd/components/callout/CalloutPoll.tsx`): Pure presentational, receives all state as props. Renders RadioGroup (single-choice) or Checkbox group (multi-choice). Each option row shows text + optional results overlay (progress bar + counts/percentages + stacked voter avatars). Custom option input row with inline text field + submit/cancel. Footer with status messages (Progress primitive for debounce, spinner for mutations), "Voted — Remove my vote" link, "Closed" label, "Anonymous" label, helper text for min/max constraints. No business logic — debounce, optimistic updates, and subscription handling all live in the connector.

**Connector** (`src/main/crdPages/space/callout/CalloutPollConnector.tsx`): Orchestration layer that mirrors MUI `PollView.tsx` logic — `usePollVote` for mutations with optimistic responses, `usePollSubscriptions` for real-time sync, `usePollOptionManagement` for custom option CRUD, `useDebouncedSubmit(2000)` for multi-choice debounce with progress tracking, local `selectedOptionIds` state synced with server via `useEffect`, `ConfirmationDialog` for vote removal, subscription-driven vote revocation handling.

**Form enhancements** (`src/crd/forms/callout/PollOptionsEditor.tsx` + new `PollSettingsDialog.tsx`): Drag-and-drop via @dnd-kit (UI library, acceptable in CRD), settings dialog with toggles for single/multi, custom options, results visibility, voter avatars. Open/Close poll status toggle with confirmation. All form state managed by the connector; CRD components receive values + callbacks as props.

**New primitives**: AlertDialog, Tooltip, RadioGroup, Checkbox, Progress — ported from prototype. Radix packages installed.

**Voter avatars**: Simple `PollVoterAvatars` component shows stacked Avatar primitives from data already in the poll response (name + avatarUrl). No hover-fetch — `ContributorTooltip` with lazy GraphQL is deferred to a future phase.

### D20: Subspace filter — search + tag chips + Show More, not status pills
The earlier iteration shipped a placeholder All/Active/Archived pill row, but neither the API nor the prototype distinguishes archived subspaces — real data always maps to "active", so the filter was non-functional. D20 replaces it with the MUI `SpaceFilter` pattern adapted to CRD:

- **Search input**: matches against `name` + `description`, styled identically to the Community tab's member search (icon prefix, focus ring, full-width).
- **Tag chips**: a pure `collectTags(subspaces)` helper aggregates every unique tag across the subspace list, sorts by frequency (desc) then alphabetically, and returns the deduplicated list. Each tag renders as a toggleable chip that wraps onto multiple rows when they exceed the container width (`flex flex-wrap gap-2`). Selecting multiple chips composes with AND semantics (the subspace must carry every selected tag) and composes with the text search (both apply simultaneously).
- **Show More pagination**: the grid renders only `initialVisibleCount` cards (default 6 — a 3-column grid with 2 rows) and appends a centered "Show N more" button when the filtered set exceeds the cap. Clicking toggles to "Show less" to collapse back. This is purely client-side — the underlying `useSpaceSubspaceCardsQuery` still returns the full list — but it keeps the callouts rendered below the subspaces section reachable without the user having to scroll past 20+ subspace cards first.

The earlier `SubspaceFilter` type and hard-coded `FILTERS` constant are deleted. Filter state lives in the component as three `useState` hooks (`searchQuery`, `selectedTags`, `showAll`) that reset together via a single `resetFilters()` helper invoked by the empty-state's Clear filters button.

### D21: Role filters are overlapping sets, not mutually exclusive
Admin + Lead + Member are not hierarchical labels but orthogonal roles — a single user can hold several. `MemberCardData` therefore carries both:
- `role: MemberRoleKey` — the single most-elevated role, used for the display badge (precedence Admin > Lead > Member).
- `roles: MemberRoleKey[]` — the full inclusive list, used by the filter pills.

The `deriveUserRolesList(roles)` helper in `communityDataMapper.ts` walks the role set and pushes every applicable key (admin, lead, member) so an Admin who is also a Lead lands in both buckets. `SpaceMembers`'s filter logic checks `m.roles?.includes(activeFilter)` rather than `m.role === activeFilter`, so selecting "Lead" surfaces every user who holds the Lead role — including admins — while the display badge on the card still reads "Admin" (the higher-precedence role). Organizations always carry `role: 'organization'` and `roles: ['organization']`; they match only the Organization filter.

## Phased Implementation

| Phase | User Stories | What Ships | Effort |
|-------|-------------|-----------|--------|
| P0 | US1 | Page shell: CrdSpaceRoutes, CrdSpacePageLayout, SpaceBanner, SpaceTabs, route toggle | Medium |
| P1 | US2, US3, US4 | Tab content + callout blocks: Dashboard, Subspaces, all 5 framing types | High |
| P2 | US5, US6, US7, US8, US9, US10 | Community, Custom tabs, callout forms/management, contributions | High |
| P3 | US11, US12, US13, US14 | Templates, comments, About page, mobile polish | Medium |
| P4 | US4 (poll parity) | Full poll feature parity: single/multi-choice, debounce, custom options, vote removal, results modes, voter avatars, settings dialog, drag-and-drop reordering, open/close toggle, subscriptions | High |
| P5 | US7 (markdown editor) | CRD markdown editor for callout description field: Tiptap-based, fresh toolbar, bundled converter, `descriptionSlot` on AddPostModal | Medium |

## Sub-Specifications

Detailed design for cross-cutting concerns that span multiple components:

- **[Iframe Whitelist Context](./iframe-whitelist/plan.md)** — `MarkdownConfigProvider` context + `useMarkdownConfig` hook to deliver iframe whitelist into `MarkdownContent` without domain imports.
- **[CRD Markdown Editor](./markdown-editor/plan.md)** — 8 new files in `src/crd/forms/markdown/`: converter, extension config, editor state hook, toolbar, link dialog, styles, and main component. Wired via `CalloutFormConnector` → `descriptionSlot`.
- **[CRD Memos](./memos/plan.md)** — Full memo migration: `CalloutMemoPreview` (framing), refined `ContributionMemoCard` + generalized "+N more" overlay, `MemoEditorShell` + `CollaborativeMarkdownEditor` (CRD, shares `MarkdownToolbar`). Hocuspocus + Yjs stay in `src/main/crdPages/memo/` as opaque provider props.
- **[CRD Media Gallery](./mediaGallery/plan.md)** — Framing-only migration (no contributions): `MediaGalleryFeedGrid` (4-tile feed preview mirroring the whiteboard-contribution grid, per-tile "Open image" hover, "+N more" overlay), `CalloutMediaGalleryCarousel` rendered **inline** in `CalloutDetailDialog` (no separate lightbox — shadcn/Embla carousel ported to `src/crd/primitives/carousel.tsx`), plus a `@dnd-kit`-powered `MediaGalleryField` with client-side validation. Two-step upload (`useAddVisualToMediaGalleryMutation` → `useUploadVisualMutation`) stays in `src/main/crdPages/space/callout/`.

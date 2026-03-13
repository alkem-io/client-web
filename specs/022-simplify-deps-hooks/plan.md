# Implementation Plan: Simplify Codebase — Dependency Cleanup & Hooks-First Architecture

**Branch**: `022-simplify-deps-hooks` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-simplify-deps-hooks/spec.md`

## Summary

Reduce the project's dependency count by 15+ packages and refactor the component architecture from Page/View/Container (MVC-like) to hooks-first composition. This eliminates ~25+ KB of unused vendor code, consolidates duplicated libraries (3 D&D libs → 1), replaces obsolete patterns (render-prop containers → custom hooks), and enforces clean UI/logic separation across 17 impure View files. The goal is a leaner, more maintainable codebase that's ready for the upcoming shadcn/Tailwind migration.

## Technical Context

**Language/Version**: TypeScript 5.8.3, React 19.2.1
**Primary Dependencies**: Apollo Client 3.10, React Router 7.4, @dnd-kit 6.3/10.0, Vite 7.3
**Storage**: N/A (Apollo cache, no direct storage changes)
**Testing**: Vitest 4.0 with jsdom, 247+ tests across 19+ files
**Target Platform**: Web (modern browsers, Node 24+)
**Project Type**: Web SPA
**Performance Goals**: Reduce vendor bundle by ≥25 KB gzipped; eliminate runtime CSS-in-JS overhead from removed libs
**Constraints**: Zero user-facing behavior changes; all existing tests must pass; React Compiler compatibility
**Scale/Scope**: ~1,650 .tsx files total; 9 files (immer), 8 files (resize-detector), 5 files (hello-pangea), 3 files (xstate), 17 View files, 10 Container files directly affected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | PASS | Hooks stay in `src/domain/<context>` or `src/core`. New hooks follow same domain taxonomy. |
| II. React 19 Concurrent UX Discipline | PASS | Hooks-first pattern is concurrent-safe. useReducer is pure. No legacy lifecycle patterns introduced. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes. Generated hooks remain untouched. |
| IV. State & Side-Effect Isolation | PASS | Moving state from render-props to hooks improves isolation. Effects stay in dedicated hooks. |
| V. Experience Quality & Safeguards | PASS | No UI changes. Accessibility unaffected. Tests required to pass. |
| Architecture #1 (Domain directories) | PASS | New hooks placed alongside their former Containers in same domain directories. |
| Architecture #2 (MUI theming) | N/A | No styling changes in this initiative. |
| Architecture #3 (i18n) | PASS | No i18n changes. |
| Architecture #4 (Build determinism) | PASS | Only removing deps from package.json and simplifying scripts. |
| Architecture #5 (Import transparency) | PASS | No barrel exports. Direct file paths maintained. |
| Architecture #6 (SOLID) | PASS | SRP: hooks separate concerns. DIP: components depend on hook abstractions. ISP: hooks return only needed interface. |
| Engineering Workflow #5 (Root Cause) | PASS | Each replacement addresses the root cause (unnecessary dependency), not a symptom. |

**Post-Phase 1 Re-check**: All gates remain PASS. No new architectural patterns introduced that violate constitution.

## Project Structure

### Documentation (this feature)

```text
specs/022-simplify-deps-hooks/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output - technical research
├── data-model.md        # Phase 1 output - notification state model
├── quickstart.md        # Phase 1 output - verification guide
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (affected areas)

```text
src/
├── core/
│   ├── container/
│   │   └── SimpleContainer.ts          # DELETE after migration
│   ├── state/
│   │   ├── GlobalStateProvider.tsx      # MODIFY: xstate → useReducer
│   │   └── global/notifications/
│   │       └── notificationMachine.ts   # REPLACE with useNotifications.ts
│   ├── ui/
│   │   ├── forms/
│   │   │   └── MarkdownInputControls/  # MODIFY: remove immer (2 files)
│   │   ├── hooks/
│   │   │   └── useResizeObserver.ts    # NEW: native ResizeObserver hook
│   │   ├── language/
│   │   │   └── LanguageSelect.tsx      # MODIFY: render-prop → hook
│   │   ├── notifications/
│   │   │   └── NotificationHandler.tsx  # MODIFY: xstate → useContext
│   │   └── overflow/
│   │       └── AutomaticOverflowGradient.tsx  # MODIFY: resize-detector → hook
│   └── auth/authentication/pages/       # MODIFY: remove immer (4 files)
├── domain/
│   ├── access/ApplicationsAndInvitations/
│   │   └── ApplicationButtonContainer.tsx  # REPLACE with useApplicationButton.ts
│   ├── collaboration/
│   │   ├── callout/calloutBlock/
│   │   │   └── CalloutSettingsContainer.tsx  # REPLACE with useCalloutSettings.ts
│   │   ├── calloutsSet/CalloutsView/
│   │   │   └── CalloutsInViewWrapper.tsx     # REPLACE with useCalloutDetails.ts
│   │   ├── InnovationFlow/                   # MODIFY: @hello-pangea/dnd → @dnd-kit (3 files)
│   │   └── whiteboard/containers/
│   │       └── WhiteboardActionsContainer.tsx  # REPLACE with useWhiteboardActions.ts
│   ├── community/
│   │   ├── invitations/
│   │   │   └── InvitationActionsContainer.tsx  # REPLACE with useInvitationActions.ts
│   │   ├── community/CommunityGuidelines/
│   │   │   └── CommunityGuidelinesContainer.tsx  # REPLACE with useCommunityGuidelines.ts
│   │   └── pendingMembership/
│   │       └── PendingMemberships.tsx  # MODIFY: hydrator render-props → hooks
│   ├── innovationHub/InnovationHubsSettings/
│   │   └── InnovationHubSpacesField.tsx  # MODIFY: @hello-pangea/dnd → @dnd-kit
│   ├── space/
│   │   ├── layout/.../SpaceDashboard/
│   │   │   ├── SpaceDashboardPage.tsx   # MODIFY: absorb View logic
│   │   │   └── SpaceDashboardView.tsx   # MODIFY: extract business logic to hooks
│   │   └── components/spaceDashboardNavigation/
│   │       └── DashboardNavigation.tsx  # MODIFY: remove immer
│   └── timeline/calendar/views/
│       └── CalendarEventDetailView.tsx  # MODIFY: remove react-scroll
└── main/
    └── topLevelPages/
        ├── topLevelSpaces/
        │   └── SpaceExplorerContainer.tsx  # REPLACE with hook
        └── myDashboard/ExploreSpaces/
            └── ExploreSpacesContainer.tsx  # REPLACE with hook
```

**Structure Decision**: No new directories created. New hooks are placed alongside their former Container files in the same domain directories, following the existing convention (e.g., `useApplicationButton.ts` next to the deleted `ApplicationButtonContainer.tsx`). The only new shared file is `src/core/ui/hooks/useResizeObserver.ts`.

## Implementation Phases

### Phase 1: Drop Unused Packages

**Scope**: Remove 7 packages with zero or obsolete imports. Zero code changes except package.json.

**Packages**:
| Package | Reason | Code Changes |
|---------|--------|-------------|
| `@atlaskit/pragmatic-drag-and-drop` | 0 imports | None |
| `date-fns` | 0 imports (dayjs used) | None |
| `@sentry/tracing` v7 | 0 imports (@sentry/react v9 covers it) | None |
| `@elastic/apm-rum-react` | 0 imports | None |
| `@types/jest` | Wrong test framework (Vitest) | None |
| `source-map-explorer` | Not in scripts (visualizer used) | None |
| `@types/yup` | Yup v1 has built-in types | None |

**Verification**: `pnpm install && pnpm lint && pnpm vitest run && pnpm build`

### Phase 2: Replace XState with useReducer

**Scope**: 3 files. Replace the notification state machine.

**Steps**:
1. Create `src/core/state/global/notifications/useNotifications.ts`:
   - Define `NotificationAction` type: `{ type: 'PUSH'; payload } | { type: 'CLEAR'; payload: { id } }`
   - Implement reducer function (PUSH appends with UUID, CLEAR filters by id)
   - Export `useNotifications()` hook returning `[notifications, dispatch]`
2. Update `GlobalStateProvider.tsx`: Replace `useActorRef(notificationMachine)` with `useNotifications()`
3. Update `NotificationHandler.tsx`: Replace `useSelector` with `useContext`, replace `send()` with `dispatch()`
4. Delete `notificationMachine.ts`
5. Remove `xstate`, `@xstate/react` from package.json

**Verification**: Trigger success/error/info notifications in the app. Verify they appear, stack, and dismiss.

### Phase 3: Replace Trivial Libraries with Native APIs

**Scope**: 10 files across 3 libraries.

#### 3a: react-scroll (1 file)
- `CalendarEventDetailView.tsx`: Replace `scroller.scrollTo()` with `element.scrollIntoView({ behavior: 'smooth' })`
- Remove `react-scroll` from package.json

#### 3b: cross-env (scripts only)
- Update package.json scripts: `cross-env NODE_ENV=production node ...` → `NODE_ENV=production node ...`
- Remove `cross-env` from package.json

#### 3c: react-resize-detector (8 files)
1. Create `src/core/ui/hooks/useResizeObserver.ts`:
   - Wraps native `ResizeObserver`
   - Returns `{ ref, width, height }` — same interface as `useResizeDetector`
2. Update 8 consumer files: Replace `import { useResizeDetector } from 'react-resize-detector'` with `import { useResizeObserver } from '@/core/ui/hooks/useResizeObserver'`
3. Remove `react-resize-detector` from package.json

**Files**: PlatformNavigationBar, CookieConsent, CalendarEventDetailView, LinesFitter, TwoLinesTagsContainer, SearchBox, AutomaticOverflowGradient, PageContentBlockHeader

### Phase 4: Replace Immer with Spread Syntax

**Scope**: 9 files. Replace each `produce()` call with explicit object spread.

**Pattern**: `produce(obj, draft => { draft.prop = value })` → `{ ...obj, prop: value }`

**Files by group**:
1. **Auth pages** (4 files): LoginPage, RegistrationPage, SignUp, VerificationPage — Kratos form UI state updates
2. **Apollo subscription** (1 file): useSubscriptionToSubEntity — cache update callback
3. **Toolbar controls** (2 files): ToolbarButton, ToolbarMenuItem — editor state updates
4. **Dashboard** (1 file): DashboardNavigation — viewport snap state
5. **Admin** (1 file): useStorageAdminTree — tree state updates

Remove `immer` from package.json after all 9 files are migrated.

### Phase 5: Consolidate D&D to @dnd-kit

**Scope**: 5 files. Migrate from `@hello-pangea/dnd` render-prop API to `@dnd-kit` hook API.

**Migration mapping**:
| @hello-pangea/dnd | @dnd-kit |
|---|---|
| `<DragDropContext onDragEnd={...}>` | `<DndContext onDragEnd={...}>` |
| `<Droppable>` render-prop | `useDroppable()` hook |
| `<Draggable>` render-prop | `useDraggable()` hook or `useSortable()` |
| `OnDragEndResponder` | `DragEndEvent` handler |
| `DroppableProvidedProps` | `useDroppable()` return values |

**Files**:
1. `InnovationFlowDragNDropEditor.tsx` — horizontal D&D → `SortableContext` with `horizontalListSortingStrategy`
2. `InnovationHubSpacesField.tsx` — vertical sortable list → `SortableContext` with `verticalListSortingStrategy`
3. `CalloutContributionsSortDialog.tsx` — sortable contributions → `SortableContext`
4. `InnovationFlowCollaborationToolsBlock.tsx` — draggable tools → `useSortable()`
5. `PageContentBlock.tsx` — `DroppableProvidedProps` type → `useDroppable()` ref/props

Remove `@hello-pangea/dnd` from package.json after all 5 files migrated.

### Phase 6: Hooks-First Refactoring — Containers

**Scope**: 10 render-prop Container components → custom hooks.

**For each Container**:
1. Create a new hook file (e.g., `useApplicationButton.ts`) in the same directory
2. Move all logic from the Container component body into the hook function
3. Return the same `Provided` interface that was passed to `children()`
4. Update all consumer components to use the hook instead of wrapping in Container
5. Delete the Container file
6. Delete `SimpleContainerProps` type and `src/core/container/SimpleContainer.ts` when all consumers are migrated

**Containers to refactor** (ordered by dependency — leaf nodes first):

| Container | Hook | Consumer Count |
|-----------|------|---------------|
| `LanguageSelect.tsx` | `useLanguageSelect()` | 1 |
| `CharacterCountContext.tsx` | Simplify to context-only | 1 |
| `InvitationActionsContainer.tsx` | `useInvitationActions()` | 1 |
| `CommunityGuidelinesContainer.tsx` | `useCommunityGuidelines()` | 1 |
| `WhiteboardActionsContainer.tsx` | `useWhiteboardActions()` | 1 |
| `CalloutsInViewWrapper.tsx` | `useCalloutDetails()` | ~3 |
| `CalloutSettingsContainer.tsx` | `useCalloutSettings()` | ~5 |
| `ApplicationButtonContainer.tsx` | `useApplicationButton()` | ~3 |
| `SpaceExplorerContainer.tsx` | `useSpaceExplorer()` | 1 |
| `ExploreSpacesContainer.tsx` | `useExploreSpaces()` | 1 |

Plus 2 hydrators in `PendingMemberships.tsx`:
- `InvitationHydrator` → `useInvitationHydrator()`
- `ApplicationHydrator` → `useApplicationHydrator()`

### Phase 7: Hooks-First Refactoring — Impure Views

**Scope**: 17 View files containing business logic (useState, useEffect, localStorage, data transformations).

**For each View**:
1. Identify business logic vs UI-only state
2. Extract business logic into a custom hook (colocated with the View)
3. Keep the View as pure presentation: receives data as props, returns JSX
4. If the View is trivially small after extraction, merge it into the parent Page component

**Classification of state in Views**:
- **Business logic (MUST extract)**: data fetching, localStorage/sessionStorage access, navigation logic, data transformations, computed permissions, cache reads
- **UI-only state (MAY keep in View)**: dialog open/close booleans, hover states, animation states, scroll positions — these are presentation concerns

**Files** (grouped by domain):
1. **collaboration**: CalloutView, CalloutsGroupView, WhiteboardView (3)
2. **communication**: MessageWithRepliesView, DiscussionView, UserMessagingConversationView (3)
3. **community**: AssociatesView, CommunityUpdatesView, AccountResourcesView, ContributorAccountView (4)
4. **space**: SpaceDashboardView, SubspaceView, DashboardNavigationItemView (3)
5. **timeline**: CalendarEventDetailView (1)
6. **main**: SpaceExplorerView, ExploreSpacesView, SearchView (3)

**Approach per file**:
- Read the file, separate hooks into "business" vs "UI-only"
- Create `use<FeatureName>.ts` hook for business logic
- Update View to receive hook results as props (or merge into Page if trivial)
- Verify parent Page/component correctly wires the hook

## Complexity Tracking

No constitution violations. No complexity justifications needed.

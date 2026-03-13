# Feature Specification: Simplify Codebase — Dependency Cleanup & Hooks-First Architecture

**Feature Branch**: `022-simplify-deps-hooks`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "Simplify codebase: less code to maintain/migrate, fewer 3rd party deps, less explicit memoization (React 19 supports it implicitly), clean UI vs business logic separation. Drop unused deps, consolidate D&D libs, replace XState with useReducer, adopt hooks-first component architecture."

## Clarifications

### Session 2026-03-13

- Q: Is the Page/View consolidation limited to files directly associated with the refactored Containers, or does it extend to all Page/View pairs exhibiting business logic in Views? → A: All Page/View pairs where the View contains business logic (broader audit across the entire codebase).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove Unused Dependencies (Priority: P1)

A developer opens the project and runs `pnpm install`. The dependency tree is smaller because unused and redundant packages have been removed. Build times improve, the lockfile is shorter, and there are no phantom dependencies that confuse new team members.

**Why this priority**: Zero-risk, immediate value. Removing unused packages requires no code changes (or trivial ones) and reduces maintenance surface. Every subsequent task benefits from a leaner dependency tree.

**Independent Test**: Run `pnpm install && pnpm build && pnpm vitest run` after removing each package. All tests pass, build succeeds, and no runtime errors occur.

**Acceptance Scenarios**:

1. **Given** `@atlaskit/pragmatic-drag-and-drop` is in package.json but has zero imports in src/, **When** it is removed from dependencies, **Then** `pnpm build` and all tests pass without errors.
2. **Given** `date-fns` is in package.json but has zero imports in src/ (only `dayjs` is used), **When** it is removed, **Then** all date-related functionality continues to work.
3. **Given** `@sentry/tracing` v7 is installed but `@sentry/react` v9 provides all tracing integrations, **When** `@sentry/tracing` is removed, **Then** Sentry error tracking and performance monitoring work correctly.
4. **Given** `@elastic/apm-rum-react` has zero imports in src/, **When** it is removed, **Then** Elastic APM monitoring (`@elastic/apm-rum`) continues to function.
5. **Given** `@types/jest` is installed but the project uses Vitest, **When** it is removed, **Then** all test types resolve correctly via Vitest's built-in types.
6. **Given** `source-map-explorer` is not referenced in any script (project uses `rollup-plugin-visualizer`), **When** it is removed, **Then** bundle analysis via `pnpm analyze` works as before.
7. **Given** `@types/yup` is installed but Yup v1 ships its own types, **When** it is removed, **Then** all Yup-related type checking works.

---

### User Story 2 - Consolidate Drag-and-Drop to One Library (Priority: P2)

The codebase currently uses two active D&D libraries (`@hello-pangea/dnd` in 5 files and `@dnd-kit` in 5 files) plus one unused (`@atlaskit/pragmatic-drag-and-drop`). A developer working on drag-and-drop features should find a single, consistent API. All drag-and-drop functionality is migrated to `@dnd-kit`.

**Why this priority**: Reduces bundle size (removing one D&D library), eliminates developer confusion about which library to use, and establishes a single pattern for all future D&D work. Low file count makes this tractable.

**Independent Test**: Each D&D interaction (sortable lists, drag-and-drop editors, flow editors) can be manually tested after migration by performing drag operations and verifying correct reordering/movement.

**Acceptance Scenarios**:

1. **Given** `InnovationFlowDragNDropEditor` uses `@hello-pangea/dnd` for horizontal drag-and-drop, **When** migrated to `@dnd-kit`, **Then** dragging flow states horizontally reorders them correctly.
2. **Given** `InnovationHubSpacesField` uses `@hello-pangea/dnd` for reorderable space lists, **When** migrated to `@dnd-kit`, **Then** dragging spaces reorders them and the new order persists.
3. **Given** `CalloutContributionsSortDialog` uses `@hello-pangea/dnd` for contribution sorting, **When** migrated to `@dnd-kit`, **Then** drag-sorting contributions produces the correct sort order.
4. **Given** `PageContentBlock` imports the type `DroppableProvidedProps` from `@hello-pangea/dnd`, **When** migrated, **Then** the block continues to support drop targets via `@dnd-kit` APIs.
5. **Given** `InnovationFlowCollaborationToolsBlock` uses `@hello-pangea/dnd`, **When** migrated to `@dnd-kit`, **Then** dragging collaboration tools reorders them correctly.
6. **Given** all 5 files are migrated, **When** `@hello-pangea/dnd` is removed from package.json, **Then** `pnpm build` succeeds and no imports reference the removed package.

---

### User Story 3 - Replace XState with useReducer (Priority: P2)

The notification system currently uses XState v5 (a ~25 KB state machine library) for a single, trivial PUSH/CLEAR notification machine. A developer reading the notification code should find plain React primitives (`useReducer` + Context) instead of a framework that requires knowledge of state machine concepts.

**Why this priority**: High impact-to-effort ratio. XState is used in only 3 files for one trivial state machine. Replacing it removes ~25 KB from the bundle and eliminates a conceptual dependency that requires specialized knowledge.

**Independent Test**: Trigger in-app notifications (success, error, info). Verify they appear, stack correctly, and auto-dismiss or can be manually dismissed.

**Acceptance Scenarios**:

1. **Given** the notification machine defines PUSH and CLEAR events, **When** replaced with a `useReducer`, **Then** pushing a notification adds it to the list and clearing removes it — same as before.
2. **Given** `GlobalStateProvider` creates the XState actor, **When** replaced with a `useReducer` + Context provider, **Then** all components consuming notification state continue to work.
3. **Given** `NotificationHandler` uses `useSelector` from `@xstate/react`, **When** replaced with `useContext`, **Then** notifications render identically.
4. **Given** XState and `@xstate/react` are removed from package.json, **When** `pnpm build` runs, **Then** no imports reference the removed packages.

---

### User Story 4 - Replace Trivial Library Usages with Native APIs (Priority: P3)

Several libraries are used minimally and can be replaced with browser-native APIs or thin custom hooks, reducing the dependency count and bundle size.

**Why this priority**: Each individual replacement is low-risk and low-effort, but collectively they reduce the dependency count significantly and establish a pattern of preferring native APIs.

**Independent Test**: Each replacement can be tested in isolation — the specific UI feature (scrolling, resize detection) works identically after the library is removed.

**Acceptance Scenarios**:

1. **Given** `react-scroll` is used in 1 file (`CalendarEventDetailView.tsx`) for smooth scrolling, **When** replaced with `element.scrollIntoView({ behavior: 'smooth' })`, **Then** the calendar event detail view scrolls smoothly to the target element.
2. **Given** `react-resize-detector` is used in 8 files via `useResizeDetector`, **When** replaced with a custom `useResizeObserver` hook wrapping the native `ResizeObserver` API, **Then** all 8 components correctly detect and respond to container size changes.
3. **Given** `cross-env` is used only in package.json scripts and the project runs on Node 22+, **When** `cross-env` calls are replaced with direct environment variable setting, **Then** all build and dev scripts work on macOS, Linux, and CI environments.

---

### User Story 5 - Replace Immer with Native Alternatives (Priority: P3)

Immer's `produce` function is used in 9 files for immutable state updates. Modern JavaScript provides `structuredClone` for deep cloning and spread syntax for shallow updates. Developers should use native language features instead of a library abstraction.

**Why this priority**: Medium effort (9 files to review), removes a dependency, and aligns with the goal of fewer abstractions. Each file can be migrated independently.

**Independent Test**: Each file's functionality is tested after migration — the state update produces the same result as before.

**Acceptance Scenarios**:

1. **Given** Immer `produce` is used in auth pages (Login, Registration, SignUp, Verification) to update Kratos form state, **When** replaced with spread/structuredClone, **Then** form state updates work identically and auth flows complete successfully.
2. **Given** Immer `produce` is used in `useSubscriptionToSubEntity` for Apollo cache updates, **When** replaced with spread syntax, **Then** subscription data updates propagate correctly.
3. **Given** Immer `produce` is used in `ToolbarButton.tsx` and `ToolbarMenuItem.tsx` for editor state updates, **When** replaced with native updates, **Then** markdown toolbar actions work correctly.
4. **Given** Immer `produce` is used in `DashboardNavigation.tsx` and `useStorageAdminTree.tsx`, **When** replaced with spread/structuredClone, **Then** navigation and storage admin tree updates behave identically.
5. **Given** `immer` is removed from package.json, **When** `pnpm build` runs, **Then** no imports reference the removed package.

---

### User Story 6 - Adopt Hooks-First Component Architecture (Priority: P4)

The codebase currently uses a Page → View → Container pattern where Containers use render-props (`children(provided)`) to pass state and callbacks to children. This pre-hooks pattern creates unnecessary component nesting, prop drilling, and indirection. Developers should find logic encapsulated in custom hooks, with components acting as composition roots rather than prop-forwarding stations.

**Why this priority**: This is the largest and most impactful change. It requires refactoring ~10 render-prop Container files to hooks AND auditing all Page/View pairs across the codebase to merge or extract logic from Views that contain business logic (state management, effects, localStorage reads). It establishes the architectural foundation for future work (component library migration, potential SSR). Prioritized after dependency cleanup so the codebase is leaner before structural refactoring begins.

**Independent Test**: Each refactored Container can be tested independently — the feature it supports (application button, callout settings, calendar events, etc.) works identically after the render-prop pattern is replaced with a hook.

**Acceptance Scenarios**:

1. **Given** `ApplicationButtonContainer` uses `children(provided, loading)` render-prop pattern, **When** refactored to a `useApplicationButton()` hook, **Then** the application/join button on Space dashboards works identically — showing/hiding based on membership, handling join actions, and displaying loading states.
2. **Given** `CalloutSettingsContainer` manages 7+ dialog states via render-props, **When** refactored to a `useCalloutSettings()` hook, **Then** all callout settings actions (edit, publish, delete, sort, save-as-template, share, reposition) work identically.
3. **Given** `CommunityGuidelinesContainer` uses `SimpleContainerProps`, **When** refactored to a `useCommunityGuidelines()` hook, **Then** guidelines display and editing work identically.
4. **Given** `WhiteboardActionsContainer` uses `SimpleContainerProps`, **When** refactored to a `useWhiteboardActions()` hook, **Then** whiteboard actions (export, share, etc.) work identically.
5. **Given** `CalendarEventsContainer` and `CalendarEventDetailContainer` use render-props, **When** refactored to `useCalendarEvents()` and `useCalendarEventDetail()` hooks, **Then** calendar event listing, detail viewing, and event creation work identically.
6. **Given** `SpaceExplorerContainer` and `ExploreSpacesContainer` use render-props, **When** refactored to hooks, **Then** space browsing and exploration work identically.
7. **Given** `InvitationActionsContainer` uses `SimpleContainerProps`, **When** refactored to a `useInvitationActions()` hook, **Then** invitation accept/decline actions work identically.
8. **Given** `CommunityUpdatesContainer` uses render-props, **When** refactored to a `useCommunityUpdates()` hook, **Then** community updates display and interaction work identically.
9. **Given** the `SimpleContainerProps` type and `src/core/container/SimpleContainer.ts` are the foundation of the render-prop pattern, **When** all consumers are migrated to hooks, **Then** the type and file are deleted.
10. **Given** a codebase-wide audit identifies all Page/View pairs where the View contains business logic (state management via `useState`/`useEffect`, localStorage reads, navigation logic, or data transformations beyond simple formatting), **When** each such View is either merged into its Page component or has its logic extracted into custom hooks, **Then** every remaining View file is a pure presentation component (receives data as props, returns JSX, uses only `useTranslation` and UI-only state like dialog open/close).

---

### Edge Cases

- What happens if a `@hello-pangea/dnd` feature uses an API that has no direct `@dnd-kit` equivalent (e.g., `Droppable` render-prop pattern)? The migration must use `@dnd-kit`'s `useDroppable` hook instead.
- What happens if removing `cross-env` breaks CI on a non-Unix runner? Verify CI runs on Linux containers where `NODE_ENV=production` works natively. If Windows runners exist, use Node's `--env-file` or inline env var syntax.
- What happens if `structuredClone` fails on a value containing non-cloneable objects (functions, DOM nodes, Symbols)? Review each Immer usage to verify the data being cloned is plain data. For cases involving non-cloneable values, use spread syntax instead.
- What happens if a Container being refactored is consumed by multiple parents with different render-prop signatures? The replacement hook must return a superset of all needed values.
- What happens if removing a library triggers a peer dependency warning from another package? Review pnpm peer dependency warnings after each removal and address as needed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST build and all tests MUST pass after each individual dependency removal or replacement.
- **FR-002**: All drag-and-drop functionality MUST be served by a single library (`@dnd-kit`), with `@hello-pangea/dnd` and `@atlaskit/pragmatic-drag-and-drop` fully removed.
- **FR-003**: The notification system MUST use `useReducer` + Context instead of XState, supporting the same PUSH/CLEAR semantics.
- **FR-004**: All 8 files using `react-resize-detector` MUST use a custom `useResizeObserver` hook wrapping the native `ResizeObserver` API.
- **FR-005**: All 9 files using Immer's `produce` MUST use native JavaScript alternatives (spread syntax, `structuredClone`).
- **FR-006**: The `react-scroll` usage in `CalendarEventDetailView.tsx` MUST be replaced with the native `scrollIntoView` API.
- **FR-007**: All `*Container.tsx` files using the render-prop pattern (via `SimpleContainerProps` or `children(provided)`) MUST be refactored to custom hooks that return the same interface.
- **FR-012**: All `*View.tsx` files across the codebase MUST be audited. Any View containing business logic (state management, effects, localStorage/sessionStorage access, navigation logic, or data transformations beyond formatting) MUST have that logic extracted to custom hooks or be merged into its parent Page component.
- **FR-008**: The `SimpleContainerProps` type and `src/core/container/SimpleContainer.ts` MUST be deleted after all consumers are migrated.
- **FR-009**: Package.json scripts MUST work without `cross-env` on Node 22+ (macOS, Linux, CI environments).
- **FR-010**: No new `useMemo` or `useCallback` calls SHOULD be introduced during refactoring, as React 19's compiler handles memoization automatically.
- **FR-011**: The following unused packages MUST be removed: `@atlaskit/pragmatic-drag-and-drop`, `date-fns`, `@sentry/tracing`, `@elastic/apm-rum-react`, `@types/jest`, `source-map-explorer`, `@types/yup`.

### Key Entities

- **Notification**: A transient message (success, error, info) shown to the user. Currently modeled as XState machine context; will become `useReducer` state.
- **Container (render-prop)**: A component that encapsulates data fetching/state management and passes results to children via a function. Target for elimination.
- **Custom Hook**: A function prefixed with `use` that encapsulates reusable stateful logic. The replacement for Containers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dependency count is reduced by at least 12 packages (from current ~91 runtime + dev dependencies).
- **SC-002**: All existing tests (247+ tests across 19+ files) pass without modification to test logic (only import paths may change).
- **SC-003**: Production build succeeds with no new warnings related to the changes.
- **SC-004**: Zero `*Container.tsx` files use the `SimpleContainerProps` render-prop pattern after completion.
- **SC-005**: The project has exactly one drag-and-drop library (`@dnd-kit`) in its dependency tree.
- **SC-006**: No imports from `xstate`, `@xstate/react`, `immer`, `react-scroll`, `react-resize-detector`, `@hello-pangea/dnd`, or any removed package exist in the source code.
- **SC-007**: Bundle analysis (`pnpm analyze`) shows reduced vendor chunk sizes compared to the baseline before this initiative.

## Assumptions

- **Node 22+ in all environments**: CI runners and developer machines use Node 22+ where `cross-env` is unnecessary. If Windows development environments exist, they use WSL or compatible tooling.
- **markdown-it-sanitizer**: While initially considered for removal, it has 1 active import (AI chat widget message rendering). It will be kept for now as removing it requires verifying the sanitization pipeline has equivalent coverage elsewhere.
- **Container files that are NOT render-prop patterns**: Some `*Container.tsx` files (e.g., `GridContainer.tsx`, `TwoLinesTagsContainer.tsx`, `AuthPageContentContainer.tsx`, `ConsentContainer.tsx`, `TextContainer.tsx`) are layout/wrapper components, not render-prop containers. These will be evaluated individually — only files using `children(provided)` or `SimpleContainerProps` are in scope for the hooks-first refactoring.
- **React Compiler compatibility**: All replacement patterns (useReducer, custom hooks, native APIs) are fully compatible with the React Compiler. No manual memoization is needed.
- **No user-facing behavior changes**: This is a purely internal refactoring. No UI, functionality, or API changes are expected.

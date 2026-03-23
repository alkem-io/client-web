# Research: Simplify Codebase — Dependency Cleanup & Hooks-First Architecture

**Date**: 2026-03-13
**Branch**: `022-simplify-deps-hooks`

## Decision 1: XState → useReducer

**Decision**: Replace XState v5 + @xstate/react with useReducer + Context.

**Rationale**: The notification machine is a single-state machine with only context mutations via `assign()`. No state transitions, guards, or side effects. The entire machine is:
- Context: `{ notifications: Notification[] }`
- Events: `PUSH` (append notification with UUID) and `CLEAR` (filter by id)
- Consumed via `useActorRef` (provider) and `useSelector` (consumer)

A `useReducer` with two action types achieves identical behavior in ~20 lines. XState adds ~25 KB for no architectural benefit here.

**Alternatives considered**: Keep XState (rejected — overkill for this use case), Zustand (rejected — adds another state library).

## Decision 2: Immer → Spread Syntax

**Decision**: Replace Immer's `produce` with spread syntax in all 9 files.

**Rationale**: All 9 usages are shallow property updates on objects with known shapes. The `produce` callback makes them look like mutations, but each can be expressed with spread:
- Auth pages (4 files): `{ ...flow.ui, messages: [...(flow.ui.messages ?? []), newMessage] }` — straightforward object spread
- Apollo subscription (1 file): `{ ...prev, [key]: updatedValue }` — cache update with known path
- Dashboard navigation (1 file): `{ ...snap, top: newTop, height: newHeight }` — two property updates
- Toolbar controls (2 files): Similar shallow updates on editor state
- Storage admin (1 file): Tree node update with known path

None involve deeply nested mutations that would be error-prone with spread.

**Alternatives considered**: Keep Immer (rejected — user goal is fewer dependencies, and all usages are simple), structuredClone (rejected — unnecessary for shallow updates, and doesn't handle functions).

## Decision 3: react-resize-detector → useResizeObserver Hook

**Decision**: Create a custom `useResizeObserver` hook wrapping the native `ResizeObserver` API.

**Rationale**: `react-resize-detector` provides `useResizeDetector()` returning `{ ref, width, height }`. The native `ResizeObserver` API provides the same data. A thin hook (~15 lines) returns the same interface:
```tsx
function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, ...size };
}
```

All 8 consumer files use the same pattern: attach ref, read width/height in effects.

**Alternatives considered**: Keep react-resize-detector (rejected — unnecessary wrapper around a native API).

## Decision 4: D&D Consolidation to @dnd-kit

**Decision**: Migrate 5 `@hello-pangea/dnd` files to `@dnd-kit`, remove `@hello-pangea/dnd` and `@atlaskit/pragmatic-drag-and-drop`.

**Rationale**: `@hello-pangea/dnd` uses render-props (`Draggable`, `Droppable`) — the exact pattern we're eliminating. `@dnd-kit` uses hooks (`useDraggable`, `useDroppable`, `useSortable`) — aligned with hooks-first architecture. Already used in 5 files.

The 5 files to migrate:
1. `InnovationFlowDragNDropEditor.tsx` — horizontal D&D editor
2. `InnovationHubSpacesField.tsx` — reorderable list
3. `CalloutContributionsSortDialog.tsx` — sortable contributions
4. `InnovationFlowCollaborationToolsBlock.tsx` — draggable tools
5. `PageContentBlock.tsx` — `DroppableProvidedProps` type usage

**Alternatives considered**: Migrate everything to `@hello-pangea/dnd` (rejected — it uses render-props, contradicts hooks-first goal), Pragmatic D&D (rejected — unused, and we'd need to migrate 10 files instead of 5).

## Decision 5: Impure View Files Audit

**Decision**: Audit and refactor all 19 View files containing useState/useEffect.

**Rationale**: View files (`*View.tsx`) should be pure presentation components. 19 files currently import `useState` or `useEffect`, containing business logic that belongs in hooks or parent components:

**Files identified**:
1. `CalloutView.tsx` — custom hooks (useCalloutComments, etc.)
2. `UserMessagingConversationView.tsx` — UI state + effects
3. `SpaceExplorerView.tsx`
4. `ExploreSpacesView.tsx`
5. `SearchView.tsx`
6. `CalendarEventDetailView.tsx`
7. `SpaceDashboardView.tsx` — 4 state pieces + localStorage effects
8. `SubspaceView.tsx`
9. `DashboardNavigationItemView.tsx`
10. `AssociatesView.tsx`
11. `CommunityUpdatesView.tsx`
12. `AccountResourcesView.tsx`
13. `ContributorAccountView.tsx`
14. `MessageWithRepliesView.tsx`
15. `DiscussionView.tsx`
16. `WhiteboardView.tsx`
17. `CalloutsGroupView.tsx`
18. `OrganizationAssociatesView.tsx` — uses React.useState, imports Apollo hooks
19. `OrganizationAuthorizationRoleAssignementView.tsx` — uses React.useState, imports Apollo hooks

For each: extract business logic to custom hooks, leave View as pure JSX.

**Note**: Some Views may have legitimate UI-only state (dialog open/close, hover). These are acceptable in Views. Only business logic (data fetching, localStorage, navigation, data transformations) must be extracted.

## Decision 6: Render-Prop Container Refactoring

**Decision**: Refactor 14 render-prop Container files to custom hooks.

**Rationale**: All 14 files follow the `SimpleContainerProps<T>` pattern, `children(provided)` render-prop pattern, or equivalent render-prop delivery. Each becomes a hook returning the same interface:

1. `ApplicationButtonContainer.tsx` → `useApplicationButton()`
2. `CalloutSettingsContainer.tsx` → `useCalloutSettings()`
3. `CommunityGuidelinesContainer.tsx` → `useCommunityGuidelines()`
4. `WhiteboardActionsContainer.tsx` → `useWhiteboardActions()`
5. `CalloutsInViewWrapper.tsx` → `useCalloutDetails()`
6. `InvitationActionsContainer.tsx` → `useInvitationActions()`
7. `LanguageSelect.tsx` → `useLanguageSelect()`
8. `CharacterCountContext.tsx` → simplify to context-only
9. `CalendarEventsContainer.tsx` → `useCalendarEvents()`
10. `CalendarEventDetailContainer.tsx` → `useCalendarEventDetail()`
11. `CommunityUpdatesContainer.tsx` → `useCommunityUpdates()`
12. `AssociatedOrganizationContainer.ts` → `useAssociatedOrganization()`
13. `SpaceExplorerContainer.tsx` → `useSpaceExplorer()`
14. `ExploreSpacesContainer.tsx` → `useExploreSpaces()`

Plus 2 hydrators in `PendingMemberships.tsx`:
- `InvitationHydrator` → `useInvitationHydrator()`
- `ApplicationHydrator` → `useApplicationHydrator()`

## Decision 7: cross-env Removal

**Decision**: Remove `cross-env` and use direct env var syntax in scripts.

**Rationale**: Node 22+ supports `--env-file` flag natively. The project's `engines.node` is `>=24.0.0`. CI runs on Linux containers. Developer machines are macOS. No Windows development environments exist (confirmed by Node/pnpm Volta pinning which is Unix-native). Replace `cross-env NODE_ENV=production` with `NODE_ENV=production` directly in scripts.

**Alternatives considered**: Node `--env-file` (not needed — simple inline vars work on all target platforms).

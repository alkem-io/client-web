# Quickstart: 022-simplify-deps-hooks

## Prerequisites

- Node >=22.0.0 (Volta pins 22.21.1)
- pnpm 10.17.1+
- Running backend at localhost:3000 (for manual testing of D&D, notifications, forms)

## Verification Commands

```bash
# After each change — must pass
pnpm install && pnpm lint && pnpm vitest run

# Full build verification
pnpm build

# Bundle size comparison (run before and after)
pnpm analyze
```

## Work Order

### Phase 1: Drop Unused Packages (zero code changes)
Remove from package.json: `@atlaskit/pragmatic-drag-and-drop`, `date-fns`, `@sentry/tracing`, `@elastic/apm-rum-react`, `@types/jest`, `source-map-explorer`, `@types/yup`. Run `pnpm install && pnpm build && pnpm vitest run`.

### Phase 2: Replace XState (3 files)
1. Create `src/core/state/global/notifications/useNotifications.ts` with useReducer
2. Update `GlobalStateProvider.tsx` to use the new hook
3. Update `NotificationHandler.tsx` to use useContext
4. Remove `xstate`, `@xstate/react` from package.json

### Phase 3: Replace Trivial Libraries
1. `react-scroll` (1 file) → `scrollIntoView`
2. `cross-env` → direct env vars in scripts
3. `react-resize-detector` (8 files) → custom `useResizeObserver` hook

### Phase 4: Replace Immer (9 files)
Replace each `produce()` call with spread syntax. One file at a time, verify build.

### Phase 5: Consolidate D&D (5 files)
Migrate `@hello-pangea/dnd` usages to `@dnd-kit`. Remove `@hello-pangea/dnd`.

### Phase 6: Hooks-First Refactoring
1. Convert 10 render-prop Containers to custom hooks
2. Audit 17 impure View files, extract business logic to hooks
3. Delete `SimpleContainerProps` and `src/core/container/`

## Manual Testing Checklist

After each phase, verify:
- [ ] Notifications appear and dismiss (Phase 2)
- [ ] Calendar event scrolling works (Phase 3)
- [ ] Component resize detection works (Phase 3)
- [ ] Auth forms (login, register, verify) work (Phase 4)
- [ ] All D&D interactions work (Phase 5)
- [ ] Space dashboard renders correctly (Phase 6)
- [ ] Application/join button works (Phase 6)
- [ ] Callout settings menu works (Phase 6)

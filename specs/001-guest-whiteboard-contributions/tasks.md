# Tasks: Guest Whiteboard Contributions Toggle

**Status**: ✅ PARTIALLY IMPLEMENTED (Space Settings Complete)
**Implementation Date**: November 2025

**What was built**: Space-level admin toggle for `allowGuestContributions` setting with optimistic updates

**What was NOT built**: Share dialog integration (deferred to feature 002 - PUBLIC_SHARE privilege system)

---

## Completed Tasks

### Phase 1: Setup

- [x] T001 Verify backend GraphQL schema includes allowGuestContributions field in SpaceSettingsCollaboration type
- [x] T002 Run pnpm install to ensure dependencies are current

### Phase 2: Foundational (GraphQL & Domain Setup)

- [x] T004 Update SpaceSettings.graphql fragment to include allowGuestContributions field
- [x] T005 Update UpdateSpaceSettings.graphql mutation to include allowGuestContributions input
- [x] T006 Run pnpm run codegen to regenerate GraphQL types and hooks
- [x] T007 Update SpaceSettingsModel.ts interface to include allowGuestContributions field
- [x] T008 Update SpaceDefaultSettings.tsx to include allowGuestContributions: false default

### Phase 3: User Story 1 - Admin Toggle (MVP)

- [x] T009 Create useSpaceGuestContributions hook
- [x] T010 Add optimistic state management with useOptimistic and useTransition
- [x] T011 Add allowGuestContributions parameter to handleUpdateSettings function
- [x] T012 Add guest contributions toggle UI to Member Actions section
- [x] T013 Add translation keys for toggle labels and messages
- [x] T014 Implement error handling with optimistic reversion and toast notifications
- [x] T015 Add ARIA labels and keyboard navigation for WCAG 2.1 AA compliance

### Phase 4: Share Dialog Integration

**Note**: This phase was NOT implemented. Share dialog integration was deferred to feature 002 (PUBLIC_SHARE privilege system).

- [ ] ~~T016 Create WhiteboardShareControls component with Switch toggle~~ - Deferred to feature 002
- [ ] ~~T017 Add conditional rendering based on space setting and user authorization~~ - Deferred to feature 002
- [ ] ~~T018 Implement authorization check (creators and admins only)~~ - Deferred to feature 002
- [ ] ~~T019 Add translation keys for Share dialog guest access UI~~ - Deferred to feature 002
- [ ] ~~T020 Add TextField with integrated copy button for guest URL~~ - Deferred to feature 002

### Additional Improvements

- [x] Create spaceLevel utility functions (isSubspace, isNotLastLevel) for DRY compliance
- [x] Update constitution to v1.0.5 with comprehensive SOLID principles
- [x] Document space hierarchy independence (no inheritance between spaces/subspaces)
- [x] Refactored SpaceAdminSettingsPage.tsx to extract settings components (MemberActionsSettings, MembershipSettings, VisibilitySettings)

---

## Implementation Summary

### Files Created

1. `src/domain/space/settings/useSpaceGuestContributions.ts` - Domain façade hook
2. `src/domain/space/utils/spaceLevel.ts` - Shared space level utilities
3. `src/domain/spaceAdmin/SpaceAdminSettings/components/MemberActionsSettings.tsx` - Extracted settings component
4. `src/domain/spaceAdmin/SpaceAdminSettings/components/MembershipSettings.tsx` - Extracted settings component
5. `src/domain/spaceAdmin/SpaceAdminSettings/components/VisibilitySettings.tsx` - Extracted settings component
6. `src/domain/spaceAdmin/SpaceAdminSettings/useSpaceSettingsUpdate.ts` - Settings update hook

### Files Modified

1. `src/domain/spaceAdmin/SpaceAdminSettings/graphql/SpaceSettings.graphql`
2. `src/domain/spaceAdmin/SpaceAdminSettings/graphql/UpdateSpaceSettings.graphql`
3. `src/domain/space/settings/SpaceSettingsModel.ts`
4. `src/domain/spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings.tsx`
5. `src/domain/spaceAdmin/SpaceAdminSettings/SpaceAdminSettingsPage.tsx` - Refactored to use extracted components
6. `src/domain/spaceAdmin/SpaceAdminSettings/components/MemberActionsSettings.tsx`
7. `src/domain/spaceAdmin/SpaceAdminSettings/components/VisibilitySettings.tsx`
8. `src/domain/spaceAdmin/SpaceAdminSettings/components/MembershipSettings.tsx`
9. `src/core/i18n/en/translation.en.json`
10. `.specify/memory/constitution.md` (v1.0.5)
11. `src/domain/templates/graphql/TemplateContent.graphql`
12. `src/domain/spaceAdmin/SpaceAdminSettings/useSpaceSettingsUpdate.ts`

### What Works

1. **Admin Control**: Space admins can toggle guest contributions on/off in Space Settings
2. **Domain Hook**: `useSpaceGuestContributions()` hook provides type-safe access to space setting
3. **Optimistic Updates**: UI updates immediately with React 19 `useOptimistic` and `useTransition`
4. **Reactive UI**: All controls respond to space setting changes
5. **Accessibility**: Full WCAG 2.1 AA compliance with ARIA labels
6. **Space Independence**: Each space/subspace has independent settings (no inheritance)
7. **Code Quality**: Refactored settings page using SOLID principles (extracted components)

### Not Implemented (Deferred to Feature 002)

- Share dialog integration (guest access toggle in whiteboard Share dialog)
- Guest URL display field with copy button
- Authorization check for whiteboard creators/admins in Share dialog
- Share dialog translation keys for guest access UI

### Backend Integration Status

- Backend provides `allowGuestContributions` field in SpaceSettingsCollaboration ✅
- Backend provides PUBLIC_SHARE privilege system ✅ (added for feature 002)
- Public URL generation - **Not Yet Implemented**
- Public whiteboard access endpoint - **Not Yet Implemented**
- Guest session management - **Not Yet Implemented**

---

## Constitution Compliance

- ✅ Domain-Driven Boundaries (Principle I)
- ✅ React 19 Concurrent UX (Principle II)
- ✅ GraphQL Contract Fidelity (Principle III)
- ✅ State & Effect Isolation (Principle IV)
- ✅ Experience Quality & Safeguards (Principle V)
- ✅ SOLID Principles + DRY (Architecture Standard #6)

---

**Total Tasks Completed**: 15/20 (75%)
**Status**: Space settings implementation complete; Share dialog integration deferred to feature 002 (PUBLIC_SHARE privilege system)

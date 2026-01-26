# Implementation Plan: User "Me" Route Shortcut

**Branch**: `012-user-me-route` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-user-me-route/spec.md`

## Summary

Implement a `/user/me` route shortcut that displays the authenticated user's profile page without requiring them to know their nameId. The route will use `useCurrentUserContext()` to get the current user's ID and render the same `UserProfilePage` component used for regular user profiles. The URL will remain `/user/me` (no redirect to `/user/{nameId}`).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: React Router v6, Apollo Client, MUI, react-i18next
**Storage**: N/A (uses existing Apollo cache)
**Testing**: Vitest with jsdom environment
**Target Platform**: Web browser (SPA)
**Project Type**: Web application (React SPA)
**Performance Goals**: Same as existing user profile page (standard page load time)
**Constraints**: Must work within existing UrlResolverProvider architecture
**Scale/Scope**: Single route addition with sub-route support

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | ✅ PASS | New routing logic in `src/domain/community/user/routing/`, reuses existing domain façades (`useCurrentUserContext`, `useUserProvider`) |
| II. React 19 Concurrent UX Discipline | ✅ PASS | Uses existing Suspense boundaries, loading states follow established patterns |
| III. GraphQL Contract Fidelity | ✅ PASS | No new GraphQL operations needed; reuses `useCurrentUserFullQuery` (via context) and existing profile queries |
| IV. State & Side-Effect Isolation | ✅ PASS | No new state; uses React context for current user data |
| V. Experience Quality & Safeguards | ✅ PASS | Accessibility maintained (same components), no performance regression |
| Architecture Standard 3 (i18n) | ✅ PASS | No new user-visible strings required |
| Architecture Standard 5 (Import Transparency) | ✅ PASS | Explicit file paths, no barrel exports |
| Architecture Standard 6 (SOLID) | ✅ PASS | SRP: separate "me" route resolution from profile display; DIP: depends on abstractions (`useCurrentUserContext`) |

**Pre-design violations**: None

### Post-Design Re-check (Phase 1 Complete)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | ✅ PASS | `MeUserContext` in `src/domain/community/user/routing/`, orchestrates existing domain service `useCurrentUserContext` |
| II. React 19 Concurrent UX Discipline | ✅ PASS | No blocking operations; uses existing Suspense boundaries and loading patterns |
| III. GraphQL Contract Fidelity | ✅ PASS | No new GraphQL operations; uses generated hooks exclusively |
| IV. State & Side-Effect Isolation | ✅ PASS | New context is pure data passing, no side effects |
| V. Experience Quality & Safeguards | ✅ PASS | Same components = same accessibility; no performance regression (fewer queries for /me) |
| Architecture Standard 5 (Import Transparency) | ✅ PASS | All imports use explicit paths, no index.ts barrels |
| Architecture Standard 6c (LSP) | ✅ PASS | `UserProfilePage` behavior unchanged, context provides compatible userId type |
| Architecture Standard 6e (DIP) | ✅ PASS | Profile page depends on context abstraction, not routing implementation details |
| Engineering Workflow 5 (Root Cause) | ✅ PASS | Design addresses actual need (shortcut route) without workarounds |

**Post-design violations**: None - design approved for implementation

## Project Structure

### Documentation (this feature)

```text
specs/012-user-me-route/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no new API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/domain/community/user/
├── routing/
│   ├── UserRoute.tsx              # Modify: add /me route handling
│   └── UserMeRoute.tsx            # NEW: "me" route wrapper component
├── userProfilePage/
│   ├── UserProfilePage.tsx        # Existing (no changes)
│   └── UserProfilePageView.tsx    # Existing (no changes)
├── hooks/
│   └── useUserProvider.ts         # Existing (no changes)
└── layout/
    └── UserPageLayout.tsx         # Existing (no changes)

src/domain/community/userCurrent/
├── useCurrentUserContext.ts       # Existing (no changes)
└── CurrentUserProvider/
    └── CurrentUserProvider.tsx    # Existing (no changes)

src/core/routing/
└── NoIdentityRedirect.tsx         # Existing (no changes, already used)

tests/ (if tests are added)
└── unit/
    └── domain/community/user/routing/
        └── UserMeRoute.test.tsx   # NEW: Unit tests for me route
```

**Structure Decision**: Minimal modification approach - add one new component (`UserMeRoute.tsx`) and modify one existing file (`UserRoute.tsx`) to handle the `/me` path. This follows the existing architecture where route components are in `routing/` directories.

## Complexity Tracking

> No violations requiring justification - design follows existing patterns with minimal additions.

## Technical Design Summary

### Approach

The implementation follows a **wrapper component pattern**:

1. **UserMeRoute** - A new wrapper component that:
   - Gets the current user's ID from `useCurrentUserContext()`
   - Renders a `MeUserIdProvider` context that provides the userId to children
   - Handles loading states while user data loads

2. **Modified UserRoute** - Add a route for `/me/*` that:
   - Matches before the `:userNameId/*` pattern (more specific routes first)
   - Wraps children in `UserMeRoute`
   - Reuses `UserPageLayout` and `UserProfilePage` via nested routes

3. **MeUserIdProvider** - A minimal context provider that:
   - Provides the current user's ID to the `useUrlResolver` consumers
   - Allows existing `UserProfilePage` to work unchanged

### Key Implementation Details

**Route matching order** (React Router matches first valid route):
```
/user/me/*        → UserMeRoute wrapper → UserPageLayout → UserProfilePage
/user/:userNameId/* → standard UrlResolver → UserPageLayout → UserProfilePage
```

**UserMeRoute component**:
- Uses `useCurrentUserContext()` to get `userModel.id`
- Provides this ID via a `MeUserContext`
- `UserProfilePage` detects "me" context and uses provided ID instead of `useUrlResolver()`

**Alternative considered**: Modifying `UserProfilePage` directly to check for "me" - rejected because it violates SRP and couples the profile page to routing concerns.

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/domain/community/user/routing/UserMeRoute.tsx` | CREATE | Wrapper providing current user's ID |
| `src/domain/community/user/routing/MeUserContext.tsx` | CREATE | Context for "me" route user ID |
| `src/domain/community/user/routing/UserRoute.tsx` | MODIFY | Add `/me/*` route before `:userNameId/*` |
| `src/domain/community/user/userProfilePage/UserProfilePage.tsx` | MODIFY | Check MeUserContext before useUrlResolver |

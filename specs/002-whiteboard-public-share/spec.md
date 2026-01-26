# Feature Specification: Whiteboard PUBLIC_SHARE Privilege

**Feature Branch**: `002-whiteboard-public-share`
**Created**: 2025-01-20
**Status**: Draft
**Input**: User description: "Implement PUBLIC_SHARE privilege system for whiteboards. Backend grants privilege to space admins and whiteboard owners when allowGuestContributions is ON. Client checks authorization before showing Guest access toggle. No inheritance between space/subspace levels."

## Clarifications

### Session 2025-11-05

- Q: What should the loading state look like when privilege data is missing/delayed? → A: no loading state
- Q: Should the privilege be named `PUBLIC_SHARE`, `WHITEBOARD_PUBLIC_SHARE`, or `ENABLE_GUEST_ACCESS`? → A: `PUBLIC_SHARE`
- Q: When whiteboard query fails, should UI hide controls or show "Unable to determine permissions" message? → A: Hide controls silently
- Q: Should frontend use GraphQL subscriptions, polling, or refetch-on-focus for privilege updates? → A: Refetch on Share dialog open + Apollo cache updates
- Q: Should `myPrivileges` array be typed as `string[]` or use enum/union type for known privileges? → A: `AuthorizationPrivilege[]`

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Privilege-Based Toggle Visibility (Priority: P1)

As a **whiteboard editor**, when I open the Share dialog, I need to **see the Guest access toggle only if I have PUBLIC_SHARE privilege in my whiteboard authorization**, so that I can enable guest contributions when authorized.

**Why this priority**: This is the core frontend requirement - checking the privilege from the authorization object and conditionally rendering UI. Without this, the frontend cannot properly gate guest access controls.

**Independent Test**: Can be fully tested by mocking whiteboard authorization responses with/without PUBLIC_SHARE in `myPrivileges` array and verifying toggle visibility in the Share dialog.

**Acceptance Scenarios**:

1. **Given** I open a whiteboard Share dialog AND `authorization.myPrivileges` includes `PUBLIC_SHARE`, **When** the dialog renders, **Then** I see the Guest access toggle
2. **Given** I open a whiteboard Share dialog AND `authorization.myPrivileges` does NOT include `PUBLIC_SHARE`, **When** the dialog renders, **Then** I do NOT see the Guest access toggle
3. **Given** the Share dialog is open with Guest access toggle visible AND my privileges change (cache update removes `PUBLIC_SHARE`), **When** the UI re-renders, **Then** the Guest access toggle disappears gracefully
4. **Given** I have `PUBLIC_SHARE` privilege BUT Space has `allowGuestContributions=false`, **When** backend calculates privileges (excludes `PUBLIC_SHARE` from `myPrivileges`), **Then** UI hides the toggle (backend enforces space-level precedence)

---

### User Story 2 - Read-Only View for Members (Priority: P2)

As a **Space member without edit access**, when I open a whiteboard Share dialog, I need to **see the Guest access URL if enabled (read-only)**, so that I can share the link even though I can't toggle the setting.

**Why this priority**: Improves sharing UX by allowing non-editors to copy guest links. Depends on P1 privilege check being operational.

**Independent Test**: Can be fully tested by mocking member role (no PUBLIC_SHARE privilege) with guest access enabled, verifying read-only URL field appears without toggle.

**Acceptance Scenarios**:

1. **Given** I am a member (not editor) AND guest access is enabled on the whiteboard, **When** I open Share dialog, **Then** I see the read-only Guest access URL field with copy button
2. **Given** I am a member AND guest access is NOT enabled, **When** I open Share dialog, **Then** I see NO guest access controls (no URL, no toggle)
3. **Given** I am an editor with PUBLIC_SHARE privilege, **When** I open Share dialog, **Then** I see BOTH the toggle AND the URL field (full control)

---

### User Story 3 - GraphQL Integration & Cache Updates (Priority: P3)

As a **frontend developer**, I need to **access PUBLIC_SHARE privilege from whiteboard authorization.myPrivileges and handle cache updates**, so that the UI stays synchronized with backend privilege changes.

**Why this priority**: Ensures the UI responds to real-time authorization changes. This is foundational plumbing that makes P1 and P2 work correctly.

**Independent Test**: Can be fully tested by triggering GraphQL queries, mocking `authorization.myPrivileges` arrays with/without `PUBLIC_SHARE`, and verifying UI re-renders with updated privilege state.

**Acceptance Scenarios**:

1. **Given** the whiteboard query includes `authorization { myPrivileges }`, **When** frontend fetches whiteboard data, **Then** the privileges array is included in the Apollo cache
2. **Given** the `myPrivileges` array changes (cache update or refetch adds/removes `PUBLIC_SHARE`), **When** the Share dialog is open, **Then** the Guest access toggle visibility updates
3. **Given** a GraphQL error occurs when fetching whiteboard authorization, **When** the Share dialog renders, **Then** the UI gracefully hides guest controls (no error flash, no loading state)
4. **Given** I run `pnpm run codegen` after backend adds `PUBLIC_SHARE` to the privilege enum, **Then** TypeScript types are regenerated and the UI compiles without errors

---

### Edge Cases

- What happens when the GraphQL query for whiteboard `authorization.myPrivileges` times out or fails?
  - UI must gracefully hide guest controls immediately (no error flash, no loading state shown to user)
- What happens when a user's privilege is revoked while the Share dialog is open?
  - Apollo cache update removes `PUBLIC_SHARE` from `myPrivileges` → re-render → Guest access toggle disappears gracefully
- What happens when the backend adds `PUBLIC_SHARE` to privilege enum but frontend hasn't regenerated types?
  - TypeScript compilation fails; `pnpm run codegen` must be run before merge
- What happens when frontend requests authorization for a whiteboard that doesn't exist?
  - GraphQL returns error; Share dialog handles gracefully (doesn't crash)
- What happens when Space setting is toggled OFF while user has Share dialog open?
  - Backend recalculates privileges, excludes `PUBLIC_SHARE` from `myPrivileges` → cache update → UI hides toggle (reactive to backend state)

## Requirements _(mandatory)_

This feature satisfies the Constitution by:

- **Domain-Driven Frontend Boundaries (I)**: Authorization logic resides in backend domain services. Frontend consumes authorization state via GraphQL queries and displays UI based on privilege checks. No authorization business rules are implemented in React components.

- **React 19 Concurrent UX Discipline (II)**: Privilege checks use Suspense-compatible GraphQL queries. UI state changes (showing/hiding Guest access toggle) are handled via conditional rendering based on authorization data. No blocking operations or lifecycle violations.

- **GraphQL Contract Fidelity (III)**: New GraphQL operations will be added to check PUBLIC_SHARE privilege. Schema changes will be regenerated via `pnpm run codegen`. No raw `useQuery` calls; all privilege checks use generated hooks. Component prop types will be explicitly declared, not exported from generated types.

- **State & Side-Effect Isolation (IV)**: Authorization state lives in Apollo cache populated by backend responses. Frontend has no client-side privilege calculation. Privilege checks are read-only queries with no side effects in components.

- **Experience Quality & Safeguards (V)**: Guest access controls remain keyboard-navigable and screen-reader accessible. No performance regression expected (authorization check is a single GraphQL field). Tests will verify privilege-based visibility logic.

### Functional Requirements

**Frontend UI Requirements:**

- **FR-001**: Share dialog MUST check if `PUBLIC_SHARE` exists in `whiteboard.authorization.myPrivileges` array when rendering controls
- **FR-002**: Share dialog MUST show Guest access toggle only when `myPrivileges.includes('PUBLIC_SHARE')`
- **FR-003**: Share dialog MUST hide Guest access toggle when `PUBLIC_SHARE` is NOT in `myPrivileges` (backend enforces space-level precedence in privilege calculation)
- **FR-004**: Share dialog MUST show read-only Guest access URL field (without toggle) for members when guest access is enabled
- **FR-005**: Share dialog MUST handle missing or delayed `authorization.myPrivileges` data gracefully (hide guest controls immediately, no loading state shown)

**GraphQL Integration Requirements:**

- **FR-006**: Frontend MUST use existing `authorization { myPrivileges }` field from whiteboard queries (already exists in schema)
- **FR-007**: Frontend MUST regenerate types after backend adds `PUBLIC_SHARE` to privilege enum via `pnpm run codegen`
- **FR-008**: Frontend MUST use `AuthorizationPrivilege[]` type for `myPrivileges` array (type-safe privilege checks)
- **FR-009**: Frontend MUST declare explicit TypeScript interfaces for component props (not export generated GraphQL types)
- **FR-010**: Frontend MUST handle GraphQL errors for whiteboard queries (timeout, network failure, malformed response)

**State Management Requirements:**

- **FR-011**: Authorization privileges MUST live in Apollo cache via existing whiteboard query structure (no client-side privilege calculation)
- **FR-012**: UI MUST react to Apollo cache updates when `myPrivileges` array changes (via cache updates or refetch on Share dialog open)
- **FR-013**: Guest access toggle visibility MUST update within 2 seconds of privilege change in cache

**Accessibility & Performance Requirements:**

- **FR-014**: Guest access toggle MUST remain keyboard-navigable when visible
- **FR-015**: Guest access toggle MUST have proper ARIA labels for screen readers
- **FR-016**: Checking `myPrivileges` array MUST add <10ms overhead (simple array check, no GraphQL query needed)

### Key Entities

- **authorization.myPrivileges**: Array of `AuthorizationPrivilege` enum values on whiteboard/callout GraphQL objects. Calculated by backend based on user roles, Space settings, and whiteboard ownership. Includes new `PUBLIC_SHARE` privilege when user is authorized to enable guest access.
- **PUBLIC_SHARE Privilege**: New privilege enum value added to backend authorization system. Present in `myPrivileges` array when user can enable guest contributions on a whiteboard.
- **WhiteboardShareControls Component**: React component in Share dialog that conditionally renders Guest access toggle based on presence of `AuthorizationPrivilege.PUBLIC_SHARE` in `authorization.myPrivileges` array.
- **Apollo Cache**: Client-side GraphQL cache storing whiteboard/callout data including `authorization.myPrivileges`. Source of truth for UI rendering decisions.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: When `PUBLIC_SHARE` is added to `myPrivileges` array, Guest access toggle appears in Share dialog within **2 seconds**
- **SC-002**: When `PUBLIC_SHARE` is NOT in `myPrivileges`, Guest access toggle is **never visible** regardless of Space settings
- **SC-003**: Checking `myPrivileges` array adds **<10ms overhead** (simple array includes check, measured via React DevTools Profiler)
- **SC-004**: Guest access controls remain **WCAG 2.1 AA compliant** (keyboard navigation, screen reader labels)
- **SC-005**: GraphQL errors for whiteboard queries result in **graceful degradation** (hidden controls immediately, no error flash, no loading state)
- **SC-006**: After running `pnpm run codegen`, frontend **compiles without TypeScript errors** when backend adds `PUBLIC_SHARE` to privilege enum

### Quality Gates

- Guest access toggle visibility must be deterministic (based solely on `myPrivileges.includes(AuthorizationPrivilege.PUBLIC_SHARE)`)
- Frontend must never implement authorization logic (e.g., checking Space settings client-side)
- All authorization state must come from Apollo cache `myPrivileges` array typed as `AuthorizationPrivilege[]` (no local state)
- Guest access controls must work correctly for all user roles (admin, editor, member)
- All authorization UI scenarios must have automated tests (unit + integration)

---

## Backend Dependencies

**This frontend feature depends on the following backend capabilities** (tracked separately in backend repo):

- ✅ `allowGuestContributions` Space setting (already exists - implemented in feature 001)
- ✅ `authorization.myPrivileges` field on whiteboard/callout queries (already exists)
- ⏳ `PUBLIC_SHARE` privilege enum value added to authorization system (not yet implemented)
- ⏳ Backend logic to include `PUBLIC_SHARE` in `myPrivileges` when conditions met (not yet implemented)
- ⏳ Privilege grant/revoke when Space setting changes (not yet implemented)
- ⏳ Space-level independence in privilege calculation (no inheritance) (not yet implemented)

**Frontend work can begin once backend adds `PUBLIC_SHARE` to the privilege enum.** No schema changes needed - just a new enum value in existing `authorization.myPrivileges` field.

---

## Constitution Compliance Check

✅ **Domain-Driven Frontend Boundaries**: Authorization logic in backend, frontend consumes via GraphQL
✅ **React 19 Concurrent UX Discipline**: Suspense-compatible queries, conditional rendering, no blocking
✅ **GraphQL Contract Fidelity**: New schema fields, codegen workflow, explicit prop types
✅ **State & Side-Effect Isolation**: Apollo cache for authorization state, no client-side privilege calculation
✅ **Experience Quality & Safeguards**: Accessibility maintained, performance measured, tests required

**No violations identified. This specification aligns with Constitution v1.0.5 principles.**

- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

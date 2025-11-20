# Requirements Checklist: Whiteboard PUBLIC_SHARE Privilege (Frontend)

**Purpose**: Track frontend requirements for PUBLIC_SHARE authorization integration
**Created**: 2025-11-05
**Feature**: [spec.md](./spec.md)

---

## Backend Dependencies (External - Not Client Repo)

- [ ] BACKEND-001 Backend adds `PUBLIC_SHARE` to privilege enum in authorization system
- [ ] BACKEND-002 Backend includes `PUBLIC_SHARE` in `authorization.myPrivileges` when user is authorized (Space admin/whiteboard owner + allowGuestContributions=true)
- [ ] BACKEND-003 Backend enforces Space-level independence (no privilege inheritance between parent/subspace)
- [ ] BACKEND-004 Backend handles privilege lifecycle when Space `allowGuestContributions` setting changes

**⚠️ Frontend work blocked until BACKEND-001 is complete (just add enum value - no schema changes needed).**

---

## Frontend UI Requirements

- [ ] REQ-001 Share dialog checks if `PUBLIC_SHARE` exists in `whiteboard.authorization.myPrivileges` array
- [ ] REQ-002 Guest access toggle renders only when `myPrivileges.includes('PUBLIC_SHARE')`
- [ ] REQ-003 Guest access toggle hidden when `PUBLIC_SHARE` NOT in `myPrivileges`
- [ ] REQ-004 Read-only Guest access URL shown to members (no toggle) when guest access enabled
- [ ] REQ-005 Missing/delayed `authorization.myPrivileges` data handled gracefully (loading state, no errors)

## GraphQL Integration

- [ ] REQ-006 Use existing `authorization { myPrivileges }` field from whiteboard/callout queries
- [ ] REQ-007 Regenerate types after backend adds `PUBLIC_SHARE` enum value via `pnpm run codegen`
- [ ] REQ-008 Use generated privilege enum type for type-safe array checks
- [ ] REQ-009 Explicit TypeScript interfaces for component props (no exported generated types)
- [ ] REQ-010 Handle GraphQL errors gracefully (timeout, network failure, malformed response)
- [ ] REQ-011 Update WhiteboardShareControls to check `myPrivileges` array for `PUBLIC_SHARE`

## State Management

- [ ] REQ-012 Authorization privileges live in Apollo cache via existing whiteboard query (no client-side calculation)
- [ ] REQ-013 UI reacts to Apollo cache updates for `myPrivileges` array changes
- [ ] REQ-014 Guest access toggle visibility updates within 2 seconds of cache change
- [ ] REQ-015 No local state for privilege check (single source of truth: Apollo cache `myPrivileges`)

## Accessibility & Performance

- [ ] REQ-016 Guest access toggle keyboard-navigable when visible
- [ ] REQ-017 Guest access toggle has ARIA labels for screen readers
- [ ] REQ-018 Checking `myPrivileges` array adds <10ms overhead (simple array.includes check)
- [ ] REQ-019 WCAG 2.1 AA compliance maintained for all guest access controls

## Testing

- [ ] REQ-020 Unit test: Toggle visible when `myPrivileges` includes `PUBLIC_SHARE`
- [ ] REQ-021 Unit test: Toggle hidden when `myPrivileges` does NOT include `PUBLIC_SHARE`
- [ ] REQ-022 Unit test: Read-only URL shown for members when guest access enabled
- [ ] REQ-023 Integration test: Apollo cache update triggers UI re-render
- [ ] REQ-024 Integration test: GraphQL error handled gracefully (no crash)
- [ ] REQ-025 Accessibility test: Keyboard navigation works
- [ ] REQ-026 Accessibility test: Screen reader announces controls correctly

## Success Criteria Validation

- [ ] SC-001 Verified: Toggle appears within 2s when `PUBLIC_SHARE` added to `myPrivileges`
- [ ] SC-002 Verified: Toggle never visible when `PUBLIC_SHARE` NOT in `myPrivileges`
- [ ] SC-003 Verified: Array check <10ms overhead (React DevTools Profiler)
- [ ] SC-004 Verified: WCAG 2.1 AA compliance (axe DevTools scan)
- [ ] SC-005 Verified: GraphQL errors result in graceful degradation
- [ ] SC-006 Verified: TypeScript compiles after `pnpm run codegen`

## Edge Cases Handled

- [ ] EDGE-001 GraphQL query timeout → UI shows loading or hides controls
- [ ] EDGE-002 Privilege revoked mid-session → Apollo cache removes `PUBLIC_SHARE` → toggle disappears
- [ ] EDGE-003 Backend adds enum value but types not regenerated → TypeScript error
- [ ] EDGE-004 Whiteboard query returns error → Share dialog doesn't crash
- [ ] EDGE-005 Space setting toggled OFF → Backend removes `PUBLIC_SHARE` from `myPrivileges` → UI reacts

## Open Questions Resolved

- [ ] OQ-001 Privilege enum naming confirmed (`PUBLIC_SHARE`)
- [ ] OQ-002 Error handling strategy decided (hide controls silently)
- [ ] OQ-003 Cache update mechanism chosen (refetch + Apollo updates)
- [ ] OQ-004 TypeScript type safety approach confirmed (use generated enum type)

## Constitution Compliance

- [ ] CONST-001 Authorization logic NOT implemented in frontend (backend calculates `myPrivileges`)
- [ ] CONST-002 GraphQL types regenerated via `pnpm run codegen` after enum update
- [ ] CONST-003 Explicit component prop interfaces (no generated type exports)
- [ ] CONST-004 Apollo cache used for authorization state (no client calculation)
- [ ] CONST-005 Accessibility maintained (WCAG 2.1 AA)
- [ ] CONST-006 Performance measured (<10ms array check)
- [ ] CONST-007 Tests cover all UI authorization scenarios

---

**Progress**: 0/44 items completed (0%)

**Next Actions**:

1. **BLOCKED**: Wait for backend to add `PUBLIC_SHARE` to privilege enum (BACKEND-001)
2. Once unblocked: Run `pnpm run codegen` to regenerate types with new enum value (REQ-007)
3. Update WhiteboardShareControls to check `myPrivileges.includes(AuthorizationPrivilege.PUBLIC_SHARE)` (REQ-011)
4. Write unit tests for toggle visibility logic (REQ-020 to REQ-022)
5. Validate accessibility and performance (REQ-016 to REQ-019)

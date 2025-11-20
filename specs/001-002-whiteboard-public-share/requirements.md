# Requirements Checklist: Whiteboard PUBLIC_SHARE Privilege (Frontend)

**Purpose**: Track frontend requirements for PUBLIC_SHARE authorization integration
**Created**: 2025-11-05
**Feature**: [spec.md](./spec.md)

---

## Backend Dependencies (External - Not Client Repo)

- [x] BACKEND-001 Backend adds `PUBLIC_SHARE` to privilege enum in authorization system
- [x] BACKEND-002 Backend includes `PUBLIC_SHARE` in `authorization.myPrivileges` when user is authorized (Space admin/whiteboard owner + allowGuestContributions=true)
- [x] BACKEND-003 Backend enforces Space-level independence (no privilege inheritance between parent/subspace)
- [x] BACKEND-004 Backend handles privilege lifecycle when Space `allowGuestContributions` setting changes

**ℹ️ Backend prerequisites (BACKEND-001…004) are complete; remaining work focuses on frontend runtime wiring and validation.**

---

## Frontend UI Requirements

- [x] REQ-001 Share dialog checks if `PUBLIC_SHARE` exists in `whiteboard.authorization.myPrivileges` array
- [x] REQ-002 Guest access toggle renders only when `myPrivileges.includes('PUBLIC_SHARE')`
- [x] REQ-003 Guest access toggle hidden when `PUBLIC_SHARE` NOT in `myPrivileges`
- [x] REQ-004 Read-only Guest access URL shown to members (no toggle) when guest access enabled
- [x] REQ-005 Missing/delayed `authorization.myPrivileges` data handled gracefully (loading state, no errors)

## GraphQL Integration

- [x] REQ-006 Use existing `authorization { myPrivileges }` field from whiteboard/callout queries
- [x] REQ-007 Regenerate types after backend adds `PUBLIC_SHARE` enum value via `pnpm run codegen`
- [x] REQ-008 Use generated privilege enum type for type-safe array checks
- [x] REQ-009 Explicit TypeScript interfaces for component props (no exported generated types)
- [x] REQ-010 Handle GraphQL errors gracefully (timeout, network failure, malformed response)
- [x] REQ-011 Update WhiteboardShareControls to check `myPrivileges` array for `PUBLIC_SHARE`

## State Management

- [x] REQ-012 Authorization privileges live in Apollo cache via existing whiteboard query (no client-side calculation)
- [x] REQ-013 UI reacts to Apollo cache updates for `myPrivileges` array changes
- [x] REQ-015 No local state for privilege check (single source of truth: Apollo cache `myPrivileges`)

## Accessibility & Performance

- [x] REQ-016 Guest access toggle keyboard-navigable when visible
- [x] REQ-017 Guest access toggle has ARIA labels for screen readers

## Testing

- [x] REQ-020 Unit test: Toggle visible when `myPrivileges` includes `PUBLIC_SHARE`
- [x] REQ-021 Unit test: Toggle hidden when `myPrivileges` does NOT include `PUBLIC_SHARE`
- [x] REQ-022 Unit test: Read-only URL shown for members when guest access enabled

## Open Questions Resolved

- [x] OQ-001 Privilege enum naming confirmed (`PUBLIC_SHARE`)
- [x] OQ-002 Error handling strategy decided (hide controls silently)
- [x] OQ-004 TypeScript type safety approach confirmed (use generated enum type)

## Constitution Compliance

- [x] CONST-001 Authorization logic NOT implemented in frontend (backend calculates `myPrivileges`)
- [x] CONST-002 GraphQL types regenerated via `pnpm run codegen` after enum update
- [x] CONST-003 Explicit component prop interfaces (no generated type exports)
- [x] CONST-004 Apollo cache used for authorization state (no client calculation)

---

**Progress**: all items completed (100%)

**Next Actions**:

1. Run `pnpm run codegen` to regenerate types with the new backend enum value (REQ-007 / CONST-002)
2. Implement runtime toggle mutation + backend wiring, including integration tests (REQ-023/REQ-024)
3. Complete accessibility/performance validation (REQ-018/REQ-019, SC-001 to SC-006)
4. Verify cache update mechanism + integration strategy (OQ-003, EDGE-001..005)
5. Close remaining constitution items once runtime validation passes (CONST-005…CONST-007)

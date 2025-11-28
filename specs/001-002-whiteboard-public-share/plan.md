# Implementation Plan: Whiteboard PUBLIC_SHARE Privilege

**Branch**: `001-002-whiteboard-public-share` | **Date**: 2025-11-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-002-whiteboard-public-share/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Enable frontend to conditionally render Guest access toggle in whiteboard Share dialog based on user's PUBLIC_SHARE privilege from backend authorization system.

**Technical Approach**: Check for `AuthorizationPrivilege.PUBLIC_SHARE` in existing `authorization.myPrivileges` array from GraphQL whiteboard queries. No new GraphQL fields needed—backend adds enum value to existing authorization system. Frontend performs type-safe array check and conditionally renders UI. On error/missing data, hide controls silently (no loading state).

## Technical Context

**Language/Version**: TypeScript 5.x (React 19)
**Primary Dependencies**: React 19, Apollo Client, MUI v5, react-i18next
**Storage**: Apollo Client cache (GraphQL data), no backend storage changes
**Testing**: Vitest (unit tests), React Testing Library (component tests)
**Target Platform**: Web browsers (modern evergreen browsers via Vite build)
**Project Type**: Single-page web application (frontend only)
**Performance Goals**: <10ms array check overhead, <2s UI updates on privilege changes
**Constraints**: WCAG 2.1 AA accessibility, no loading states, hide controls on error
**Scale/Scope**: 1 component update (WhiteboardShareControls), 1 privilege check, ~50-100 LOC

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Domain Alignment**: ✅ No new domain contexts needed. Update existing `src/domain/collaboration/whiteboard/WhiteboardShareDialog/WhiteboardShareControls.tsx` component to check `authorization.myPrivileges` array. Component remains orchestration-only—authorization logic stays in backend. No new façades required.

- **React 19 Concurrency**: ✅ Privilege check uses existing GraphQL query (Suspense-compatible). UI updates via conditional rendering based on `myPrivileges` array from Apollo cache. No blocking operations. No new components—updating existing WhiteboardShareControls with type-safe array check.

- **GraphQL Contract**: ✅ No new GraphQL operations needed—using existing `authorization { myPrivileges }` field. Backend adds `PUBLIC_SHARE` to `AuthorizationPrivilege` enum. Frontend runs `pnpm run codegen` to regenerate types. Component props explicitly typed (no exported generated types). Schema diff: +1 enum value.

- **State & Effects**: ✅ Authorization state lives in Apollo cache via existing whiteboard queries. No client-side privilege calculation. Component checks array and renders conditionally—pure function, no side effects. Refetch on Share dialog open uses existing Apollo patterns.

- **Experience Safeguards**: ✅ Accessibility: Existing controls already keyboard-navigable and screen-reader accessible (no changes needed). Performance: <10ms array check (simple `includes()` operation). Testing: Unit tests for privilege-based visibility, integration tests for cache updates. No loading states—controls hide immediately on error.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── collaboration/
│       └── whiteboard/
│           └── WhiteboardShareDialog/
│               └── WhiteboardShareControls.tsx  # UPDATE: Add privilege check
├── core/
│   ├── apollo/
│   │   └── generated/
│   │       ├── graphql-schema.ts                # REGEN: +PUBLIC_SHARE enum value
│   │       └── apollo-hooks.ts                  # REGEN: Updated types
│   └── i18n/
│       └── en/
│           └── translation.en.json              # VERIFY: Guest access keys exist
└── main/
    # No changes needed - existing shells consume domain components

tests/
# To be created in Phase 2 (tasks.md)
```

**Structure Decision**: Single-project web application structure. All changes confined to existing `src/domain/collaboration/whiteboard` context. No new directories needed—updating one component file and regenerating GraphQL types.

---

## Phase 0: Research & Design Decisions

**Objective**: Resolve all technical unknowns before design phase.

**Entry Criteria**:

- Spec clarified (5 open questions resolved in Session 2025-11-05)
- Constitution Check complete (all principles ✅ passing)

**Deliverable**: [`research.md`](./research.md) - Design decisions document

**Artifacts Created**:

- ✅ `research.md` (5 design decisions with rationale & alternatives)
  - Decision 1: Type-safe privilege check using `AuthorizationPrivilege` enum
  - Decision 2: Silent failure mode (hide controls on error)
  - Decision 3: Refetch-on-open cache strategy (no subscriptions)
  - Decision 4: Generated TypeScript types from GraphQL schema
  - Decision 5: No loading state UI (immediate conditional rendering)

**Exit Criteria**: ✅ **Phase 0 Complete**

- All clarification questions resolved
- Design decisions documented with rationale
- No unresolved technical ambiguities
- Backend coordination requirements identified

---

## Phase 1: Contracts & Data Model

**Objective**: Define external contracts (GraphQL schema) and internal data structures.

**Entry Criteria**:

- Phase 0 research complete
- Backend coordination initiated

**Deliverables**:

1. [`data-model.md`](./data-model.md) - Data structures & types
2. [`contracts/graphql-schema-changes.md`](./contracts/graphql-schema-changes.md) - GraphQL schema extension
3. [`quickstart.md`](./quickstart.md) - Developer implementation guide

**Artifacts Created**:

### 1. data-model.md ✅

**Purpose**: Document GraphQL types, TypeScript interfaces, and data flow.

**Key Sections**:

- GraphQL schema (existing `Authorization` type, `AuthorizationPrivilege` enum extension)
- Generated TypeScript types (after `pnpm run codegen`)
- Component props interfaces (`WhiteboardShareControlsProps` updated)
- Data flow diagrams (authorization flow, cache update flow)
- State transitions (privilege state machine)
- Validation rules (runtime checks, backend responsibilities)
- Performance considerations (<10ms array check overhead)

**Outcome**: Clear understanding of data structures—no new backend models, minimal frontend prop changes.

---

### 2. contracts/graphql-schema-changes.md ✅

**Purpose**: Define backend GraphQL schema changes and frontend contract expectations.

**Key Sections**:

- Schema changes: `AuthorizationPrivilege` enum + `PUBLIC_SHARE` value
- Authorization logic rules (Space setting + user role checks)
- Example scenarios (Space admin, regular member, whiteboard owner, disabled setting)
- Existing queries (no schema changes—already query `myPrivileges`)
- Generated TypeScript types (auto-generated after codegen)
- Migration strategy (backend first, then frontend—safe rollout)
- Backward compatibility (graceful degradation before backend deploys)
- Contract validation checklist (backend/frontend responsibilities)
- Open questions for backend team (subspace inheritance, privilege persistence, real-time updates)

**Outcome**: Clear backend coordination plan—frontend safely consumes backend changes after codegen.

---

### 3. quickstart.md ✅

**Purpose**: Step-by-step developer guide for implementing the feature.

**Key Sections**:

- Prerequisites (backend schema readiness verification)
- Step 1: Regenerate GraphQL types (`pnpm run codegen`)
- Step 2: Verify whiteboard queries include `authorization.myPrivileges`
- Step 3: Update `WhiteboardShareControls.tsx` (add privilege check)
- Step 4: Update parent `WhiteboardShareDialog.tsx` (remove old prop)
- Step 5: Run type checks & lints
- Step 6: Manual testing (5 test cases: admin, member, owner, disabled setting, mid-session change)
- Step 7: Automated tests (unit test examples)
- Step 8: Build & smoke test
- Troubleshooting guide (common issues & fixes)
- Performance checklist
- Deployment checklist
- Success criteria

**Outcome**: Complete implementation guide—estimated 45 minutes total (30 min coding + 15 min testing).

---

**Exit Criteria**: ✅ **Phase 1 Complete**

- Data model documented (types, flows, validation rules)
- GraphQL contract defined (backend coordination clear)
- Developer quickstart guide ready (step-by-step instructions)
- All deliverables created and reviewed

**Next Phase**: Phase 2 (Task Breakdown) - Create `tasks.md` with implementation checklist.

---

## Phase 2: Task Breakdown

**Objective**: Create detailed implementation tasks based on Phase 0-1 deliverables.

**Entry Criteria**:

- Phase 1 contracts & data model complete
- Backend coordination plan clear

**Deliverable**: `tasks.md` - Granular implementation checklist

**Task Categories** (to be broken down):

1. **Backend Coordination** (BLOCKER)
   - Verify `PUBLIC_SHARE` added to `AuthorizationPrivilege` enum
   - Verify authorization logic grants privilege to Space admins + whiteboard owners
   - Verify privilege respects Space setting `allowGuestContributions`
   - Confirm backend deployed to dev environment

2. **Codegen & Type Updates**
   - Run `pnpm run codegen` to regenerate GraphQL types
   - Verify `AuthorizationPrivilege.PublicShare` exists in generated schema
   - Verify whiteboard queries include `authorization.myPrivileges` field
   - Commit generated type files

3. **Component Implementation**
   - Update `WhiteboardShareControls.tsx` props interface
   - Add privilege check logic (`myPrivileges.includes(AuthorizationPrivilege.PublicShare)`)
   - Remove old `canEnablePublicSharing` prop references
   - Update parent `WhiteboardShareDialog.tsx` to remove old prop
   - Add optional refetch-on-open for fresh privilege data

4. **Testing**
   - Write unit tests for privilege check logic (3 scenarios: has privilege, no privilege, missing auth)
   - Manual test: Space admin sees toggle (allowGuestContributions=true)
   - Manual test: Regular member doesn't see toggle
   - Manual test: Whiteboard owner sees toggle
   - Manual test: Toggle hidden when Space setting disabled
   - Manual test: Mid-session privilege change (refetch on reopen)

5. **Quality Assurance**
   - Run `pnpm run lint:prod` (TypeScript type check)
   - Run `pnpm run lint` (ESLint check)
   - Run `pnpm run vitest run --reporter=basic` (all tests pass)
   - Run `pnpm run build` (production build succeeds)
   - Performance check: <10ms privilege check overhead
   - Accessibility check: no new violations (controls already accessible)

6. **Documentation & PR**
   - Update PR description with test evidence (screenshots/recordings)
   - Include feature diff summary (per agents.md `/done` requirements)
   - Link to spec, plan, contracts, quickstart in PR description
   - Verify Constitution Check documented in PR
   - Request review from frontend team

**Exit Criteria**: Phase 2 tasks defined, ready for implementation.

**Next Phase**: Phase 3 (Implementation) - Execute tasks in `tasks.md`.

---

## Complexity Tracking

**Complexity Assessment**: ⬜ Not Required

**Rationale**: Feature does not meet complexity thresholds for detailed tracking:

- Single component update (~50-100 LOC)
- No new backend models or migrations
- No new abstractions (reusing existing `AuthorizationPrivilege` enum)
- Estimated effort: <2 hours total (45 min implementation + 15 min testing + overhead)
- Risk: Low (graceful degradation, type-safe, minimal surface area)

Per Constitution & agents.md, complexity tracking is reserved for:

- Multi-sprint features
- External contract changes (this is enum extension—non-breaking)
- High ambiguity (all resolved in Phase 0)

**Decision**: Proceed with standard planning artifacts. No complexity tracking file needed.

---

## Summary

**Planning Status**: ✅ Phase 0-1 Complete

**Deliverables Created**:

1. ✅ `research.md` (5 design decisions documented)
2. ✅ `data-model.md` (GraphQL types, data flows, validation rules)
3. ✅ `contracts/graphql-schema-changes.md` (schema extension, backend coordination)
4. ✅ `quickstart.md` (step-by-step implementation guide)
5. ⏳ `tasks.md` (Phase 2 - next step)

**Key Decisions**:

- Use existing `authorization.myPrivileges` array (no new GraphQL fields)
- Type-safe check with `AuthorizationPrivilege.PublicShare` enum
- Silent failure mode (hide controls on error)
- Refetch-on-open cache strategy (simpler than subscriptions)
- No loading state UI (immediate conditional rendering)

**Implementation Ready**: After backend deploys `PUBLIC_SHARE` enum value.

**Estimated Effort**: ~45 minutes (30 min coding + 15 min testing).

**Next Steps**:

1. Create `tasks.md` (Phase 2 deliverable)
2. Wait for backend to deploy `PUBLIC_SHARE` to dev environment
3. Execute implementation tasks
4. Submit PR with test evidence

---

**Plan Complete**: ✅ Ready for Phase 2 (Task Breakdown)

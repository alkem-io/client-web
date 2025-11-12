# Tasks: Fix Callout Icon Display

**Input**: Design documents from `/specs/001-fix-callout-icons/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/graphql-contracts.md

**Tests**: Tests are NOT explicitly requested in the specification, therefore test tasks are excluded. Focus on implementation and manual QA verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions
- Tag Constitution coverage where relevant:
  - `Domain` for updates in `src/domain` façades
  - `GraphQL` when queries, fragments, or codegen involved
  - `React19` for component updates
  - `Quality` for accessibility, performance, or observability

## Path Conventions

Based on plan.md structure: Single web application project with:

- `src/domain/collaboration/callout/` - Icon logic and utilities
- `src/domain/collaboration/calloutsSet/` - GraphQL queries and list components
- `src/core/apollo/generated/` - Generated GraphQL types
- Tests follow existing Vitest structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification

- [ ] T001 Verify development environment (Node 20.15.1, pnpm 10.17.1+, backend running at http://localhost:3000)
- [ ] T002 [P] Install dependencies via `pnpm install` if needed
- [ ] T003 [P] Verify GraphQL endpoint accessible via `curl http://localhost:3000/graphql`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: GraphQL contract updates and type generation that MUST be complete before ANY user story work

**⚠️ CRITICAL**: No user story implementation can begin until GraphQL types are regenerated with `allowedTypes` field

- [x] T004 [GraphQL] Update `Callout` fragment in `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` to add `settings { contribution { allowedTypes } }` field
- [x] T005 [GraphQL] Run `pnpm codegen` to regenerate GraphQL types with `CalloutFragment` including `contribution.allowedTypes`
- [x] T006 [GraphQL] Verify generated types in `src/core/apollo/generated/graphql-schema.ts` include `CalloutContributionType[]` for `allowedTypes`
- [x] T007 [P] Verify no TypeScript errors after codegen via `pnpm lint`

**Checkpoint**: GraphQL types regenerated - user story implementation can now begin

---

## Phase 3: User Story 1 - Visual Callout Type Recognition (Priority: P1) 🎯 MVP

**Goal**: Update icon selection logic to dynamically display correct icons based on framing type AND contribution allowed types, implementing the precedence rule (Framing > Contribution > Post)

**Independent Test**: View any page with callouts (Preview, Manage Flow, Template dialogs) and verify icons match callout configuration:

- Callout with Memo framing → Memo icon (20px)
- Callout with no framing, POST allowed → Post icon (20px)
- Callout with Whiteboard framing + POST allowed → Whiteboard icon (framing takes precedence, 20px)
- Callout with no framing, no allowed types → Post icon (fallback, 20px)

### Implementation for User Story 1

- [x] T008 [P] [US1] [Domain] Update `CalloutIconProps` interface in `src/domain/collaboration/callout/icons/calloutIcons.ts` to replace `contributionType?: CalloutContributionType` with `allowedTypes?: CalloutContributionType[]`
- [x] T009 [P] [US1] [Domain] Update `getCalloutIconBasedOnType` function in `src/domain/collaboration/callout/icons/calloutIcons.ts` to accept `allowedTypes` array and use `allowedTypes[0]` when framing is None
- [x] T010 [P] [US1] [Domain] Update `getCalloutIconLabelKey` function in `src/domain/collaboration/callout/icons/calloutIcons.ts` to accept `allowedTypes` array and use `allowedTypes[0]` for i18n key selection
- [x] T011 [US1] [Domain] Update `CalloutIcon` component in `src/domain/collaboration/callout/icons/calloutIcons.ts` to pass `allowedTypes` parameter to both icon selection and label functions
- [x] T012 [US1] [React19] Update `CalloutsList.tsx` in `src/domain/collaboration/callout/calloutsList/CalloutsList.tsx` to pass `allowedTypes={callout.settings?.contribution?.allowedTypes}` prop to CalloutIcon component
- [x] T013 [US1] [Quality] Add `fontSize: 'small'` to iconProps in `src/domain/collaboration/callout/calloutsList/CalloutsList.tsx` for 20px icon sizing
- [x] T014 [US1] [React19] Check and update `CalloutCard.tsx` in `src/domain/collaboration/callout/calloutCard/CalloutCard.tsx` (if it displays icons) to pass `allowedTypes` prop and `fontSize: 'small'`
  - CalloutCard: No changes needed (uses static GenericCalloutIcon)
  - InnovationFlowCollaborationToolsBlock: Manual changes applied (see notes below)
  - InnovationFlowCalloutsPreview: Manual changes applied (see notes below)
  - calloutIcons.ts: Exported new `getCalloutIcon()` function for component wrappers
- [ ] T015 [US1] Run `pnpm lint` to verify no TypeScript errors in updated files

**Note on T014 - Innovation Flow Components Manual Changes**:

**InnovationFlowCollaborationToolsBlock**:

- Changed `Icon` prop type from `Component` to `ReactNode` to accept JSX elements
- Updated ListItem to render `{Icon}` instead of `<Icon />`
- Added flexbox layout: `display: 'flex'`, `flexDirection: 'row'`, `alignItems: 'center'`
- Added `gap: gutters(0.5)` for spacing between icon and text
- Moved `Caption` to wrap only displayName and activity
- Integrated `CalloutIcon` with dynamic `framingType={callout.framing?.type || CalloutFramingType.None}` and `allowedTypes={callout.settings?.contribution?.allowedTypes}`
- Applied `fontSize: 'small'` and `tooltip` props for consistency

**InnovationFlowCalloutsPreview**:

- Import changed from `GenericCalloutIcon` to `getCalloutIcon`
- Updated RoundedIcon to use `getCalloutIcon(callout.framing.type, callout.settings?.contribution?.allowedTypes)`
- Now dynamically displays icons based on callout type (Memo, Whiteboard, Link, Post)
- Uses `getCalloutIcon()` function instead of CalloutIcon component due to RoundedIcon wrapper requirements

**calloutIcons.ts Enhancement**:

- Exported new `getCalloutIcon()` function: `(framingType, allowedTypes?) => ComponentType<SvgIconProps>`
- Provides bare icon component without styling/tooltips for wrapper components like RoundedIcon

**Checkpoint**: Icon logic updated, icons display correctly based on type precedence, size is 20px

---

## Phase 4: User Story 2 - Response Indicator Preservation (Priority: P1)

**Goal**: Ensure "(n)" response counter continues to display correctly alongside the updated icons

**Independent Test**: Create/view callouts with various response counts:

- Callout with 0 responses → No "(n)" marker, only icon
- Callout with 3 responses → "(3)" marker displayed alongside icon
- After new response added → Counter increments to "(4)"

### Implementation for User Story 2

- [ ] T016 [US2] [React19] Verify `CalloutsListItemTitle` component in `src/domain/collaboration/calloutsSet/CalloutsView/CalloutsListItemTitle.tsx` (or similar) still displays response count "(n)" marker
- [ ] T017 [US2] Manually test response counter display with icons by viewing callouts with different response counts
- [ ] T018 [US2] Verify counter increments when new response added (integration with existing functionality)

**Checkpoint**: Response counter "(n)" displays correctly alongside all icon types

---

## Phase 5: User Story 3 - Contextual Icon Tooltips (Priority: P2)

**Goal**: Ensure tooltips display correct contextual text using existing i18n pattern for all icon types

**Independent Test**: Hover over various callout icons and verify tooltip text:

- Memo icon → Displays "Memo" (from `common.calloutType.MEMO`)
- Post icon → Displays "Post" (from `common.calloutType.POST`)
- Whiteboard icon → Displays "Whiteboard" (from `common.calloutType.WHITEBOARD`)
- Link icon → Displays "Link" (from `common.calloutType.LINK`)

### Implementation for User Story 3

- [ ] T019 [US3] [Quality] Verify `CalloutIcon` component in `src/domain/collaboration/callout/icons/calloutIcons.ts` has `tooltip={true}` prop set in all usages
- [ ] T020 [US3] [Quality] Verify i18n keys exist in `src/core/i18n/en/translation.en.json` for all callout types (MEMO, POST, WHITEBOARD, LINK, NONE)
- [ ] T021 [US3] Manually test tooltips by hovering over icons in different views (Preview, Manage Flow, Template dialogs)
- [ ] T022 [US3] [Quality] Test keyboard accessibility: Tab to icon, verify tooltip appears on focus

**Checkpoint**: Tooltips display correct text for all icon types, keyboard accessible

---

## Phase 6: User Story 4 - Consistent Visual Alignment (Priority: P2)

**Goal**: Reduce spacing between icon and text, ensure 20px icons and consistent spacing across all views

**Independent Test**: Navigate through Preview page, Manage Flow, Template dialogs and visually verify:

- Icons are 20px (smaller than before)
- Spacing between icon and text is reduced (approximately 8px gap)
- Visual presentation is consistent across all contexts

### Implementation for User Story 4

- [x] T023 [US4] [React19] Add `sx={{ minWidth: theme.spacing(4) }}` to `ListItemIcon` in `src/domain/collaboration/callout/calloutsList/CalloutsList.tsx` to reduce spacing
- [ ] T024 [US4] [React19] Verify `fontSize: 'small'` is applied in all callout list contexts (already done in T013, verify here)
- [ ] T025 [US4] Check `CalloutCard.tsx` and any other components rendering callout icons to ensure consistent spacing
- [ ] T026 [US4] Manually verify visual consistency by navigating to Preview page, Manage Flow page, and Template dialogs
- [ ] T027 [US4] Measure icon size using browser DevTools to confirm 20px (fontSize: 'small' should render at 20x20)
- [ ] T028 [US4] Measure spacing using browser DevTools to confirm reduced gap (theme.spacing(4) = 32px minWidth vs default 56px)

**Checkpoint**: All callout icons are 20px, spacing is consistent, visual presentation matches across all views

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks, documentation, and cross-cutting improvements

- [ ] T029 [P] [Quality] Run full lint check: `pnpm lint:prod`
- [ ] T030 [P] [Quality] Run unit tests (if any exist for icon logic): `pnpm vitest run`
- [ ] T031 [Quality] Manual QA: Test all acceptance scenarios from spec.md across all 4 user stories
- [ ] T032 [Quality] Edge case testing: Test missing/undefined allowedTypes, null framing, empty arrays
- [ ] T033 [Quality] Performance check: Use Apollo DevTools to verify query payload size increase is <10% (research.md target)
- [ ] T034 [Quality] Accessibility audit: Test keyboard navigation, screen reader compatibility, tooltip accessibility
- [ ] T035 [Quality] Cross-browser testing: Verify icons display correctly in Chrome, Firefox, Safari, Edge
- [ ] T036 [P] Run production build: `pnpm build` to verify no build errors
- [ ] T037 [P] Review quickstart.md and verify all steps work correctly
- [ ] T038 Update README.md or feature documentation if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational phase (T004-T007) - Core icon logic implementation
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion - Verifies counter works with new icons
- **User Story 3 (Phase 5)**: Depends on User Story 1 completion - Can run in parallel with US2
- **User Story 4 (Phase 6)**: Depends on User Story 1 completion - Can run in parallel with US2/US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Foundational (Phase 2)
    ├── GraphQL fragment update (T004)
    ├── Codegen (T005-T007)
    └── [BLOCKS ALL USER STORIES]
         ↓
User Story 1 (Phase 3) - Visual Callout Type Recognition [P1] 🎯 MVP
    ├── Icon logic update (T008-T011)
    ├── Component updates (T012-T014)
    └── [ENABLES US2, US3, US4]
         ↓
    ┌────┴────┬────────┬────────┐
    │         │        │        │
    US2      US3      US4    Polish
    (P1)     (P2)     (P2)   (Phase 7)
```

### MVP Scope (Recommended)

**Minimum Viable Product**: Complete through **User Story 1 (Phase 3)**

- Delivers core icon display functionality
- Icons dynamically reflect callout type
- 20px icon sizing implemented
- Independently testable and deployable

**Full Feature**: Complete through **Phase 7**

- All user stories (US1-US4)
- Response counter verification
- Tooltips validated
- Consistent visual alignment
- Full QA and polish

### Parallel Opportunities

**Within Foundational Phase**:

- T002 (pnpm install) and T003 (verify GraphQL) can run in parallel
- T007 (verify lint) runs after T005 (codegen)

**Within User Story 1**:

- T008, T009, T010 (icon logic updates) can be done in same file, sequential
- T012, T013, T014 (component updates) can run in parallel if different developers

**After User Story 1 Complete**:

- US2, US3, US4 can all run in parallel (different aspects of the feature)
- Different team members can work on different user stories simultaneously

**Within Polish Phase**:

- T029, T030, T036, T037 (lint, tests, build, quickstart) can run in parallel
- T031-T035 (manual testing) should be sequential for thoroughness

### Execution Strategy

**Single Developer (Sequential)**:

1. Complete Setup (5 min)
2. Complete Foundational (15 min)
3. Complete User Story 1 (45 min) ← MVP checkpoint
4. Complete User Story 2 (15 min)
5. Complete User Story 3 (20 min)
6. Complete User Story 4 (30 min)
7. Complete Polish (60 min)

**Total: ~3 hours**

**Team (Parallel)**:

1. Dev 1: Setup + Foundational (20 min)
2. Dev 1: User Story 1 (45 min) ← MVP checkpoint
3. Dev 2: User Story 2 (15 min, starts after US1)
4. Dev 3: User Story 3 (20 min, starts after US1)
5. Dev 4: User Story 4 (30 min, starts after US1)
6. Team: Polish (QA in parallel, 30 min)

**Total: ~1.5 hours** (with 4 developers)

---

## Task Summary

### Total Tasks: 38

**By Phase**:

- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 4 tasks ← **Critical blocking phase**
- Phase 3 (User Story 1 - P1): 8 tasks ← **MVP**
- Phase 4 (User Story 2 - P1): 3 tasks
- Phase 5 (User Story 3 - P2): 4 tasks
- Phase 6 (User Story 4 - P2): 6 tasks
- Phase 7 (Polish): 10 tasks

**By User Story**:

- US1 (Visual Recognition): 8 tasks - Core icon logic
- US2 (Response Counter): 3 tasks - Verification only
- US3 (Tooltips): 4 tasks - i18n validation
- US4 (Visual Alignment): 6 tasks - Spacing and consistency

**Parallel Opportunities**: 12 tasks marked [P] can run in parallel within their phase

**Independent Testability**:

- ✅ Each user story has clear independent test criteria
- ✅ MVP (US1) is independently deployable
- ✅ Each subsequent story builds on US1 but remains testable independently

**Constitution Coverage**:

- [Domain]: 5 tasks (icon logic updates)
- [GraphQL]: 3 tasks (fragment updates, codegen)
- [React19]: 6 tasks (component updates)
- [Quality]: 11 tasks (accessibility, performance, testing)

---

## Implementation Notes

### Critical Path

The critical path goes through:

1. Foundational phase (T004-T007) - MUST complete first
2. User Story 1 (T008-T015) - Core functionality
3. User Stories 2-4 can then proceed in any order

### Risk Mitigation

- **GraphQL Performance** (research.md): T033 validates <10% payload increase
- **Missing Data** (data-model.md): Icon logic has fallbacks for null/undefined
- **Visual Regression** (research.md): T026-T028 include manual visual verification
- **Accessibility** (spec.md): T022, T034 validate keyboard nav and screen readers

### Quality Gates

- After Foundational: TypeScript must compile (T007)
- After User Story 1: Icons must display correctly for all type combinations (T015)
- After User Story 4: Visual consistency across all views (T026)
- After Polish: All acceptance scenarios pass (T031)

### Success Criteria Mapping

From spec.md success criteria:

- **SC-001** (2-second recognition): Validated by T031 (manual QA)
- **SC-002** (100% accuracy): Validated by T031 (all scenarios)
- **SC-003** (20px icons, spacing): Validated by T027-T028 (measurements)
- **SC-004** (accessible tooltips): Validated by T022, T034 (keyboard, screen reader)
- **SC-005** ("(n)" marker accuracy): Validated by T016-T018 (US2)
- **SC-006** (performance <5%): Validated by T033 (Apollo DevTools)
- **SC-007** (zero missing icons): Validated by T032 (edge cases)

---

## Next Steps

1. **Start Implementation**: Begin with Phase 1 (Setup) - T001-T003
2. **Block on Foundational**: Complete Phase 2 (T004-T007) before any user story work
3. **Deliver MVP**: Complete User Story 1 (T008-T015) for initial deployment
4. **Iterate**: Add User Stories 2-4 as needed
5. **Polish**: Complete Phase 7 before final release

**Recommended First PR**: Phases 1-3 (Setup + Foundational + User Story 1) = MVP

**Recommended Second PR**: Phases 4-6 (User Stories 2-4) = Full feature

**Recommended Final PR**: Phase 7 (Polish) = Production ready

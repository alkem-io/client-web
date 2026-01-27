---
description: 'Task list for implementing the Tag Cloud Filter for Knowledge Base feature'
---

# Tasks: Tag Cloud Filter for Knowledge Base

**Input**: Design documents from `/specs/001-tag-cloud/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included where the specification calls for coverage of non-trivial logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions
- Tag Constitution coverage where relevant:
  - `Domain` for updates in `src/domain`/`src/core` façades or `src/main` shells wiring them.
  - `GraphQL` when queries, fragments, generated hooks, or `pnpm run codegen` are involved.
  - `React19` for new components adopting Suspense/transitions/Actions or documenting legacy concurrency risks.
  - `Quality` for accessibility checks, performance safeguards, required tests, or observability instrumentation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm workspace prerequisites before modifying feature code.

- [x] T001 Run `pnpm install` to align workspace dependencies in . (Quality)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data-layer groundwork required before any user story development.

- [x] T002 Create CalloutsSetTags query in src/domain/collaboration/calloutsSet/tagCloud/CalloutsSetTags.graphql (Domain, GraphQL)
- [x] T003 Run `pnpm run codegen` after GraphQL updates in . (GraphQL)
- [x] T004 Create useCalloutsSetTags hook to fetch and normalize tag data in src/domain/collaboration/calloutsSet/tagCloud/useCalloutsSetTags.ts (Domain, GraphQL)
- [x] T005 Update tagCloudSelectors to work with string array from backend in src/domain/collaboration/calloutsSet/tagCloud/tagCloudSelectors.ts (Domain)

**Checkpoint**: ✅ CalloutsSetTags query available; tag data ready for aggregation logic.

---

## Phase 3: User Story 1 - View Tag Cloud on Knowledge Base (Priority: P1) 🎯 MVP

**Goal**: Display a tag cloud above the knowledge base callouts showing all unique callout tags with an empty state fallback.

**Independent Test**: With a space that has tagged callouts, visit the knowledge base tab and verify the tag cloud renders each unique tag once; when no tags exist the block is hidden or shows an empty message.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Add unit test covering tag normalization from string array in src/domain/collaboration/calloutsSet/tagCloud/**tests**/tagCloudSelectors.test.ts (Quality)
- [ ] T007 [US1] Update tag aggregation selectors to work with backend string array in src/domain/collaboration/calloutsSet/tagCloud/tagCloudSelectors.ts (Domain)
- [ ] T008 [US1] Create useCalloutTagCloud hook integrating useCalloutsSetTags and exposing chips in src/domain/collaboration/calloutsSet/tagCloud/useCalloutTagCloud.ts (Domain, React19)
- [ ] T009 [P] [US1] Build TagCloud presentational component rendering chips and empty state in src/domain/collaboration/calloutsSet/tagCloud/CalloutTagCloud.tsx (Domain)
- [ ] T010 [P] [US1] Add tag cloud labels and empty state strings in src/core/i18n/en/translation.en.json (Quality)
- [ ] T011 [US1] Integrate tag cloud component into the knowledge base column in src/domain/space/layout/tabbedLayout/Tabs/FlowStateTabPage/FlowStateTabPage.tsx (Domain, React19)

**Checkpoint**: Tag cloud appears with correct data but without interactive filtering.

---

## Phase 4: User Story 2 - Filter Callouts by Tag (Priority: P1)

**Goal**: Enable single-tag selection that filters callouts and surfaces a "X results – clear filter" summary row.

**Independent Test**: Select a tag and confirm only matching callouts remain while the summary row reflects the filtered count and offers a clear action that resets the view.

### Implementation for User Story 2

- [ ] T012 [P] [US2] Add unit test validating single-tag filtering and summary counts in src/domain/collaboration/calloutsSet/tagCloud/**tests**/useCalloutTagCloud.test.ts (Quality)
- [ ] T013 [US2] Extend useCalloutTagCloud with selection state, useTransition, and client-side callout filtering logic in src/domain/collaboration/calloutsSet/tagCloud/useCalloutTagCloud.ts (Domain, React19)
- [ ] T014 [US2] Enable chip interactions and pressed styling in src/domain/collaboration/calloutsSet/tagCloud/CalloutTagCloud.tsx (Domain, Quality)
- [ ] T015 [US2] Render results summary row between tag cloud and callouts list in src/domain/space/layout/tabbedLayout/Tabs/FlowStateTabPage/FlowStateTabPage.tsx (Domain)
- [ ] T016 [P] [US2] Implement ResultsSummary component with accessible clear filter action in src/domain/space/layout/tabbedLayout/Tabs/FlowStateTabPage/ResultsSummary.tsx (Quality)
- [ ] T017 [P] [US2] Localize results summary strings with pluralisation rules in src/core/i18n/en/translation.en.json (Quality)
- [ ] T018 [US2] Wire filtered callouts back into CalloutsGroupView rendering in src/domain/space/layout/tabbedLayout/Tabs/FlowStateTabPage/FlowStateTabPage.tsx (Domain)

**Checkpoint**: Knowledge base supports single-tag filtering with reset affordance.

---

## Phase 5: User Story 3 - Multiple Tag Selection (Priority: P2)

**Goal**: Allow users to select multiple tags simultaneously using AND logic and keep the summary accurate.

**Independent Test**: Select two tags and verify only callouts containing both tags remain; clearing one tag updates the results count and filtered list accordingly.

### Implementation for User Story 3

- [ ] T019 [P] [US3] Extend filtering tests to cover multi-tag AND logic in src/domain/collaboration/calloutsSet/tagCloud/**tests**/useCalloutTagCloud.test.ts (Quality)
- [ ] T020 [US3] Implement multi-select handling and AND filtering in src/domain/collaboration/calloutsSet/tagCloud/useCalloutTagCloud.ts (Domain, React19)
- [ ] T021 [US3] Update chip component to reflect multi-select state (pressed + deselect) in src/domain/collaboration/calloutsSet/tagCloud/CalloutTagCloud.tsx (Domain, Quality)
- [ ] T022 [US3] Ensure summary row hides when selections clear in src/domain/space/layout/tabbedLayout/Tabs/FlowStateTabPage/ResultsSummary.tsx (Quality)

**Checkpoint**: Multiple tag selections behave correctly with accurate counts and reset flow.

---

## Phase 6: User Story 4 - Expand/Collapse Tag Cloud (Priority: P2)

**Goal**: Limit chips to two rows with a "+N" overflow chip and caret-up collapse control.

**Independent Test**: With many tags, verify the cloud initially shows two rows with a "+N" chip, expanding reveals all tags, and collapsing restores the limited view maintaining scroll position.

### Implementation for User Story 4

- [ ] T023 [P] [US4] Add tests for collapsed vs expanded chip sets and hidden counts in src/domain/collaboration/calloutsSet/tagCloud/**tests**/tagCloudSelectors.test.ts (Quality)
- [ ] T024 [US4] Compute two-row layout and hidden count logic in src/domain/collaboration/calloutsSet/tagCloud/tagCloudSelectors.ts (Domain)
- [ ] T025 [US4] Render overflow chip with +N / caret-up states in src/domain/collaboration/calloutsSet/tagCloud/CalloutTagCloud.tsx (Domain)
- [ ] T026 [US4] Manage expand/collapse state with transition-friendly updates in src/domain/collaboration/calloutsSet/tagCloud/useCalloutTagCloud.ts (Domain, React19)

**Checkpoint**: Users can expand or collapse the tag cloud while understanding hidden counts.

---

## Phase 7: User Story 5 - Visual Tag Selection and Ordering (Priority: P2)

**Goal**: Make selected tags visually distinct, move them to the front, and maintain deterministic ordering.

**Independent Test**: Select any tag and confirm it moves to the beginning with a primary-dark background and accessible state; deselecting returns it to its frequency-based position.

### Implementation for User Story 5

- [ ] T027 [P] [US5] Add ordering and styling assertions to chip tests in src/domain/collaboration/calloutsSet/tagCloud/**tests**/useCalloutTagCloudOrdering.test.ts (Quality)
- [ ] T028 [US5] Implement selected-first ordering while preserving relative frequency in src/domain/collaboration/calloutsSet/tagCloud/tagCloudSelectors.ts (Domain)
- [ ] T029 [US5] Apply primary dark background and focus-visible outlines for selected chips in src/domain/collaboration/calloutsSet/tagCloud/CalloutTagCloud.tsx (Quality)
- [ ] T030 [US5] Set aria-pressed and keyboard interactions documentation within component props in src/domain/collaboration/calloutsSet/tagCloud/CalloutTagCloud.tsx (Quality)

**Checkpoint**: Chip styling and ordering meet visual and accessibility requirements.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final QA, documentation, and performance validation across stories.

- [ ] T031 [P] Refresh quickstart manual QA steps with tag cloud verification in specs/001-tag-cloud/quickstart.md (Quality)
- [ ] T032 Run targeted Vitest suites for tag cloud modules in . (Quality)
- [ ] T033 Document accessibility findings for new UI in docs/features/tag-cloud-filter.md (Quality)
- [ ] T034 Execute `pnpm lint` to ensure repository standards in . (Quality)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → prerequisite for all subsequent work.
- **Phase 2 (Foundational)** → T002-T003 create and codegen the CalloutsSetTags query; T004 creates hook to fetch tags; T005 updates selectors. Must complete before any user story phases begin.
- **Phases 3 & 4 (P1 stories)** → can proceed after foundational work; deliver MVP when Phase 3 completes.
- **Phases 5–7 (P2 stories)** → depend on foundational work and build on the tag cloud infrastructure but remain independently testable per story.
- **Phase 8 (Polish)** → after all targeted user stories are feature-complete.

### User Story Dependencies

- **US1**: depends on foundational tasks T002-T005 (CalloutsSetTags query, hook, and selectors).
- **US2**: depends on US1 assets (tag cloud component/hook) and requires client-side filtering logic against callout data.
- **US3**: depends on US2's filtering scaffolding.
- **US4**: depends on US1's chip rendering to add collapse controls (can start after US1 if expand logic isolated).
- **US5**: depends on US1 and US2 structures to adjust ordering and styling.

### Within-Story Flow

1. Execute tests (if present) before implementation for TDD alignment.
2. Implement domain logic/utilities.
3. Wire React components.
4. Update translations/accessibility metadata.
5. Validate with story-specific independent tests.

---

### Parallel Opportunities

- Foundational tasks T002–T003 (query + codegen) run sequentially; T004 (hook) can follow; T005 (selectors update) depends on T004.
- For **US1**, tasks T006 (tests), T009 (component), T010 (translations) can run in parallel after T007 (selectors) completes.
- For **US2**, tasks T016 and T017 operate on separate files and may run in parallel once hook updates (T013) are ready.
- For **US3**, tasks T019 and T021 can proceed concurrently after T020 completes.
- For **US4**, tasks T023 and T025 may run in parallel after T024 sets layout logic.
- For **US5**, tasks T027 and T029 are parallelizable once ordering logic (T028) is in place.
- Polish phase tasks labelled [P] are independent and may be distributed across the team.

### Parallel Execution Examples per Story

- **US1**: After T007 completes, run T006 (tests) and T009 (component) concurrently while T010 adds translations.
- **US2**: With T013 merged, T016 (summary component) and T017 (translations) can proceed in parallel before integrating via T018.
- **US3**: Once T020 updates the hook, T019 (test extension) and T021 (chip UI) can be tackled simultaneously.
- **US4**: Following T024, implement UI control (T025) while refining tests (T023) concurrently.
- **US5**: After ordering logic (T028), styling (T029) and test assertions (T027) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1 & 2.
2. Deliver Phase 3 (US1) to present a read-only tag cloud.
3. Validate UI and data accuracy before moving on.

### Incremental Delivery

1. Ship MVP (US1) to expose tag overview.
2. Layer in filtering (US2) for immediate user value uplift.
3. Iterate with multi-select (US3) and expand/collapse (US4) enhancements.
4. Finalize with styling/order refinements (US5) and polish tasks.

### Parallel Team Strategy

- Assign one developer to complete foundational changes.
- Post-foundation, different developers can own individual user story phases based on priority.
- Reserve time for a final QA sweep (Phase 8) shared across the team.

---

## Notes

- Tasks tagged `Domain`, `GraphQL`, `React19`, `Quality` highlight constitution touchpoints.
- Each user story phase concludes with an independently testable increment.
- Record evidence (screenshots, test outputs) for accessibility and performance tasks per constitution Principle V.
- Commit changes per task or cohesive slice to maintain review clarity.

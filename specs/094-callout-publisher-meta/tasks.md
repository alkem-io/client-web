---
description: "Task list for feature 094-callout-publisher-meta"
---

# Tasks: Show publisher (not creator) on callout meta

**Input**: Design documents from `/specs/094-callout-publisher-meta/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No new test tasks. The spec did not request tests, no targeted unit tests exist for the affected mappers/components today, and per research.md/D6 verification is type-system + browser-driven (`pnpm lint`, `pnpm vitest run`, manual scenarios in quickstart.md).

**Organization**: Tasks are grouped by user story so each story remains independently testable. The two user stories share the same data layer (fragments, view-model, hook) — that work is consolidated in the Foundational phase. Story-specific work is the per-surface name binding (US1) and the per-surface date binding (US2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps task to user story (US1 = publisher rendering, US2 = draft fallback)
- File paths are absolute from repository root

## Path Conventions

Web application (single React frontend). Source under `src/`. No `tests/` directory needs creating — Vitest co-locates with sources.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the local environment can perform `pnpm codegen` against the backend.

- [ ] T001 Verify the Alkemio backend is running and reachable at `http://localhost:4000/graphql` so that `pnpm codegen` will succeed in Phase 2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the GraphQL fragments and propagate the new fields through the domain view-model + hook so that *every* presentation surface in Phases 3 and 4 can resolve `publishedBy` / `createdDate` against well-typed Apollo data.

**⚠️ CRITICAL**: No US1 or US2 task can begin until Phase 2 is complete — the consumer code in those phases will not type-check otherwise.

- [ ] T002 [P] Extend the main Callout fragment in `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` (lines 131–142) by adding `createdDate` and a `publishedBy` selection that mirrors the existing `createdBy` shape exactly (`{ id profile { id displayName avatar: visual(type: AVATAR) { id uri } } }`). See `specs/094-callout-publisher-meta/contracts/callout-fragment.graphql` for the precise diff.
- [ ] T003 [P] Extend the `SearchResultCallout` fragment in `src/main/search/SearchQueries.graphql` (lines 130–164) by adding `createdBy`, `createdDate`, `publishedBy`, and `publishedDate` to the nested `callout` selection — none of these are queried today. Mirror the same User shape used in T002. See `specs/094-callout-publisher-meta/contracts/search-callout-fragment.graphql` for the precise diff.
- [ ] T004 Run `pnpm codegen` from the repo root and stage the regenerated outputs under `src/core/apollo/generated/`. Verify the regenerated `apollo-hooks.ts` includes the new selections for both fragments. (Depends on T002 + T003.)
- [ ] T005 Extend the `CalloutModelExtension<T>` type in `src/domain/collaboration/callout/models/CalloutModelLight.ts` (lines 42–63) by adding `createdDate?: Date | undefined` and a `publishedBy?` field whose nested shape matches the existing `createdBy` field one-for-one. (Depends on T004 — generated types must exist for editor type-checking.)
- [ ] T006 In `src/domain/collaboration/callout/useCalloutDetails/useCalloutDetails.ts` (around line 72, where `publishedDate` is converted to a `Date`), pass `publishedBy` through unchanged and apply the same `Date`-coercion pattern to `createdDate` so consumers receive `Date | undefined` for both date fields. (Depends on T005.)

**Checkpoint**: All four presentation surfaces can now read `callout.publishedBy`, `callout.publishedDate`, `callout.createdBy`, and `callout.createdDate` from the view-model with full TypeScript safety. US1 and US2 phases may begin.

---

## Phase 3: User Story 1 — Reader sees who published a callout (Priority: P1) 🎯 MVP

**Goal**: On every callout-meta surface (MUI dialog header, three CRD presentations, CRD search-result card), display the publisher's name when the callout has been published — falling back to the creator when the publisher is absent (and to the localised `Unknown` label only as the last resort, in search-result cards specifically).

**Independent Test**: Open a published callout where the publisher and creator are different users. In CRD: confirm the summary card and the detail dialog show the publisher. In MUI: confirm the callout dialog header shows the publisher. In CRD search: search for the callout and confirm the result card shows the publisher (no longer `Unknown`). All four observations must show the same publisher name.

### Implementation for User Story 1

- [ ] T007 [P] [US1] In `src/domain/collaboration/callout/calloutBlock/CalloutHeader.tsx` (line 53), change the `<Authorship>` `author` prop from `callout.createdBy` to `callout.publishedBy ?? callout.createdBy`. Leave the `date` prop untouched in this phase — US2 owns it.
- [ ] T008 [P] [US1] In `src/main/crdPages/space/dataMappers/calloutDataMapper.ts`, update the `author` expression in all three callout mappers — `mapCalloutLightToPostCard` (around line 40), `mapCalloutDetailsToPostCard` (around line 61), and `mapCalloutDetailsToDialogData` (around line 128). In each, prepend `const authorSource = callout.publishedBy ?? callout.createdBy;` and replace every `callout.createdBy` reference inside the `author` literal with `authorSource`. Leave the `timestamp` expression untouched in this phase — US2 owns it.
- [ ] T009 [P] [US1] In `src/main/crdPages/search/searchDataMapper.ts`, replace the hard-coded `author: { name: unknownLabel }` in the `mappedCallouts` block (lines 145–156) with the same fallback chain used for whiteboard / memo / post results, but rooted at `publishedBy ?? createdBy`. Specifically, prepend `const authorSource = r.callout.publishedBy ?? r.callout.createdBy;` inside the `.map(r => …)` body and emit `author: { name: authorSource?.profile?.displayName ?? unknownLabel, avatarUrl: authorSource?.profile?.avatar?.uri }`. The `?? unknownLabel` last-resort matches the existing whiteboard / memo / post pattern. Leave the `date: ''` literal untouched in this phase — US2 owns it.

**Checkpoint**: US1 is fully functional and testable independently. Published callouts now show the publisher across all four surfaces. Drafts may still render with an empty / missing date in some surfaces — that is US2's job. Out-of-scope surfaces (post / whiteboard / memo cards, comments, calendar) are untouched.

---

## Phase 4: User Story 2 — Reader sees attribution on draft callouts (Priority: P2)

**Goal**: When a callout is a draft (no publisher and/or no publish date), every callout-meta surface falls back to the creator's name and creation date — eliminating the existing inconsistency where MUI shows a name but no date for drafts and where CRD search results show empty dates. Per the Q1 clarification, the two fields fall back **independently**.

**Independent Test**: Open or create a draft callout (no publisher, no publish date). In CRD: confirm the summary card and the detail dialog show the creator's name and the creation date. In MUI: confirm the callout dialog header shows the creator's name and the creation date (today this is blank for the date — the fix lands in this phase). In CRD search: confirm the search result for the draft shows the creator and the creation date.

### Implementation for User Story 2

- [ ] T010 [P] [US2] In `src/domain/collaboration/callout/calloutBlock/CalloutHeader.tsx` (line 53), change the `<Authorship>` `date` prop from `callout.publishedDate` to `callout.publishedDate ?? callout.createdDate`. (Same line as T007's edit; sequence after T007 to avoid an in-line conflict.)
- [ ] T011 [P] [US2] In `src/main/crdPages/space/dataMappers/calloutDataMapper.ts`, update the `timestamp` expression in all three callout mappers (same call sites as T008). In each, prepend `const dateSource = callout.publishedDate ?? callout.createdDate;` and replace `callout.publishedDate` inside the `timestamp` ternary with `dateSource`, e.g. `timestamp: dateSource ? formatRelativeDate(dateSource, t) : undefined`. (Same file as T008; sequence after T008.)
- [ ] T012 [P] [US2] In `src/main/crdPages/search/searchDataMapper.ts` (`mappedCallouts`, same call site as T009), prepend `const dateSource = r.callout.publishedDate ?? r.callout.createdDate;` and replace the literal `date: ''` with `date: dateSource ? formatDate(dateSource) : ''`. The empty-string fallback remains as the last-resort case (callouts where `createdDate` is somehow null), matching the surrounding mappings' tolerance for missing data.

**Checkpoint**: US1 + US2 both work independently. Draft callouts now show creator + creation date in all four surfaces. SC-002 (no blank or partially populated meta lines) is satisfied. Per FR-005, the visual presentation (avatar / name / separator / formatted date layout) is unchanged in every surface — only the resolved values differ.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate the change end-to-end against the spec's success criteria before opening the PR.

- [ ] T013 Run `pnpm lint` from the repo root. Must pass with zero new warnings or errors. This validates the type contract from the GraphQL fragments through the model, hook, and all five presentation call sites.
- [ ] T014 Run `pnpm vitest run` from the repo root. Full suite must remain green (~595 tests). No new tests are expected to be added.
- [ ] T015 [P] Browser verification of `quickstart.md` **Scenario 1** (published callout, 4 surfaces). Confirm CRD summary card, CRD detail dialog, MUI dialog header, and CRD search result all show the same publisher and publish date.
- [ ] T016 [P] Browser verification of `quickstart.md` **Scenario 2** (draft callout fallback). Confirm both UIs show the creator's name and the creation date — no blank date in MUI, no missing fields anywhere.
- [ ] T017 [P] Browser verification of `quickstart.md` **Scenario 3** (CRD search-result cards). Confirm a published callout shows the publisher (no longer `Unknown`); a draft callout shows the creator; a callout with neither still falls back to the localised `Unknown` label.
- [ ] T018 [P] Browser verification of `quickstart.md` **Scenario 4** (out-of-scope surfaces unchanged). Confirm post / whiteboard / memo contribution cards, comments, calendar event meta, and non-callout search results all behave identically to pre-change.
- [ ] T019 Capture PR screenshots per `quickstart.md` definition-of-done: (a) published callout in CRD, (b) published callout in MUI, (c) draft callout in either UI showing the new fallback date, (d) CRD search result for a callout showing the publisher (no `Unknown`).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T001 is a one-time environment check.
- **Foundational (Phase 2)**: T002 + T003 can run in parallel. T004 depends on both. T005 depends on T004. T006 depends on T005. **BLOCKS all US1 and US2 work.**
- **US1 (Phase 3)**: All of T007 / T008 / T009 can run in parallel — they touch three different files.
- **US2 (Phase 4)**: All of T010 / T011 / T012 can run in parallel — three different files. However, each US2 task lands in the same file as its US1 counterpart (T010↔T007, T011↔T008, T012↔T009), so each US2 task must wait for its US1 counterpart to land first to avoid line-conflicting edits.
- **Polish (Phase 5)**: T013 + T014 must wait for both US1 and US2. T015–T018 can run in parallel after T013 + T014 succeed. T019 follows the verification scenarios.

### User Story Dependencies

- **US1 (P1)**: Independent of US2 once Phase 2 is complete. Shippable as an MVP that fixes the misleading attribution on published callouts (the principal value of the feature). Drafts may still show a missing date in MUI / empty date in CRD search until US2 lands.
- **US2 (P2)**: Depends on US1 only because the two stories edit the same three source files line-adjacently (US1 changes the author prop / field; US2 changes the date prop / field). Functionally, US2 could be delivered first, but ordering US1 → US2 keeps the per-file diffs cleanly attributable.

### Within Each User Story

- No tests are written first (none requested).
- No models or services to introduce — all data shape work is in Foundational.
- All three implementation tasks per story are pure presentation-layer edits and can run in parallel.

### Parallel Opportunities

- **Phase 2**: T002 + T003 in parallel.
- **Phase 3**: T007 + T008 + T009 in parallel.
- **Phase 4**: T010 + T011 + T012 in parallel (after their US1 counterparts).
- **Phase 5**: T015 + T016 + T017 + T018 in parallel.

---

## Parallel Example: User Story 1

```text
# After Phase 2 completes, launch all three US1 tasks in parallel:
T007 — Switch MUI binding in CalloutHeader.tsx
T008 — Switch CRD bindings in calloutDataMapper.ts (3 call sites in one file)
T009 — Switch CRD search binding in searchDataMapper.ts
```

## Parallel Example: User Story 2

```text
# After US1 lands, launch all three US2 tasks in parallel:
T010 — Switch MUI date prop in CalloutHeader.tsx
T011 — Switch CRD timestamps in calloutDataMapper.ts
T012 — Switch CRD search date in searchDataMapper.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001).
2. Complete Phase 2 (T002 → T006). **Critical — blocks all UI work.**
3. Complete Phase 3 (T007 + T008 + T009 in parallel).
4. **STOP and VALIDATE**: confirm Scenario 1 passes in all four surfaces (Scenario 3 partially passes — search shows publisher names).
5. The misleading-attribution problem is solved at this point. Demo or merge.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → publisher rendering everywhere → Scenario 1 + Scenario 3 (partial) → Demo MVP.
3. US2 → draft fallback completes the picture → Scenario 2 + Scenario 3 (full) → Demo full feature.
4. Polish → lint, tests, screenshots, PR.

### Single-Developer Strategy

1. T001 (one minute).
2. T002 + T003 in two consecutive edits (≈ five minutes).
3. T004 codegen (≈ thirty seconds, plus reviewing the generated diff).
4. T005 + T006 model + hook propagation (≈ five minutes).
5. T007 + T008 + T009 — three small edits, one file each (≈ ten minutes).
6. T010 + T011 + T012 — three more small edits (≈ ten minutes).
7. T013 + T014 — static checks (≈ two minutes).
8. T015 – T019 — browser verification + screenshots (≈ fifteen minutes).

Total realistic effort: ≈ 45–60 minutes including codegen and PR screenshots.

---

## Notes

- `[P]` markers apply within a single phase only — never across phases that touch the same file.
- US1 and US2 are split along the field axis (name vs. date) rather than the surface axis. This produces clean independent acceptance criteria while keeping each per-file diff small and reviewable.
- Stop at the US1 checkpoint to validate the MVP independently before continuing to US2.
- No commits are scheduled inside the task list — commits are made manually outside the harness per the user's signing workflow.

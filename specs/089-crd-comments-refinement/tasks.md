---

description: "Task list for feature 089-crd-comments-refinement"
---

# Tasks: CRD Comments Refinement (Parity with Legacy Experience)

**Input**: Design documents from `/specs/089-crd-comments-refinement/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/crd-presentational.md

**Tests**: No new automated tests. Per plan.md, the refinement is presentation-only and is covered by the existing Vitest suite plus the manual verification matrix in `quickstart.md`. The existing upstream domain tests (`usePostMessageMutations`, `useCommentReactionsMutations`, `useRemoveMessageOnRoomMutation`) continue to cover all mutation flows.

**Organization**: Tasks are grouped by user story (US1–US4, in priority order). All edits are contained within the CRD presentation layer (`src/crd/`) and the single CRD integration hook that wires it (`src/main/crdPages/space/hooks/useCrdRoomComments.tsx`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths are absolute from the repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the working environment before touching code.

- [X] T001 Confirm active branch is `089-crd-comments-refinement`, run `pnpm install` if dependencies have drifted, and start the dev server with `pnpm start` (localhost:3001) so the browser verification matrix can be exercised while each task lands.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None required.

This is a presentation-layer refinement — there are no shared infrastructure pieces, no new GraphQL operations, no new types, and no new translation namespaces. All user stories can begin immediately after Phase 1.

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Keep event context visible while reading comments (Priority: P1) 🎯 MVP

**Goal**: The timeline event detail modal's comments list gets its own bounded-height scroll region so long threads do not push the event banner, title, date, location, or description off-screen.

**Independent Test**: Open a calendar event with 20+ comments. Verify the comments area shows an internal scroll bar while the event body stays pinned above/beside it and the dialog itself does not scroll past the event details.

### Implementation for User Story 1

- [X] T002 [US1] In `src/crd/components/space/timeline/EventDetailView.tsx`, rework the `commentsColumn` JSX (around lines 191–200): remove `min-h-0 flex-1` from the column wrapper and remove `min-h-0 flex-1` from the inner comments-list wrapper; wrap `commentsSlot` in `<div className="max-h-[400px] overflow-y-auto pr-2">{commentsSlot}</div>` so the list has its own bounded scroll region independent of the dialog scroll. (Combined with T003 into a single Edit in the same JSX block.)

**Checkpoint**: Timeline event modal shows a bounded-height comments list with internal scroll; the event body remains visible on desktop and mobile even with long threads.

---

## Phase 4: User Story 2 — Post a comment without hunting for the input (Priority: P1)

**Goal**: The comment input is rendered directly below the "Comments (N)" header and above the thread on both the timeline event modal and the callout discussion modal. The callout dialog's sticky-footer input is removed.

**Independent Test**: Open (a) a timeline event and (b) a callout discussion. Verify the input is the first interactive element beneath the comments header on both, with no sticky footer on the callout dialog.

### Implementation for User Story 2

- [X] T003 [US2] In `src/crd/components/space/timeline/EventDetailView.tsx`, reorder the `commentsColumn` JSX so `commentInputSlot` renders directly after the `<h4>` header and **above** the bounded-height list wrapper produced in T002; remove the `border-t border-border pt-3` separator that previously wrapped the bottom-positioned `commentInputSlot`. (Done in the same Edit as T002.)
- [X] T004 [P] [US2] In `src/crd/components/callout/CalloutDetailDialog.tsx`, move the `commentInputSlot` render from the sticky footer block (lines ~192–197) to directly above `commentsSlot` in the scrollable body (~line 187); delete the sticky footer `<div className="shrink-0 p-4 bg-background border-t border-border z-20">…</div>` block entirely so the input flows with the thread content. JSDoc on the `commentInputSlot` prop also updated to reflect new placement.

**Checkpoint**: Input placement is identical on both modals — first interactive element under the comments header, ahead of the thread. (Completes the P1 MVP together with US1.)

---

## Phase 5: User Story 3 — See the most recent comments first (Priority: P2)

**Goal**: Top-level comments are ordered newest-first unconditionally and the user-facing sort toggle is removed. Replies within a parent remain oldest-first. The unused `canComment` and `onAddComment` props on `CommentsContainerData` are removed (ISP cleanup enabled by the toggle removal).

**Independent Test**: Open any thread with ≥5 comments spanning a few days. Verify the most recent comment is at the top, no sort toggle is visible in the header, and posting a new comment places it at the top of the list.

### Implementation for User Story 3

- [X] T005 [US3] In `src/crd/components/comment/CommentThread.tsx`, remove the `useState<SortOrder>` import/declaration, the sort-toggle `Button` + its `onClick` handler in the header row, and the `t('comments.sortNewest')` / `t('comments.sortOldest')` lookups; hard-code the top-level sort comparator to `new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()` (newest-first); leave the `repliesByParent` oldest-first sort untouched; keep the "N comments" count label on the left of the header row; remove the now-unused `Button` import if no other usage remains.
- [X] T006 [P] [US3] In `src/crd/components/comment/types.ts`, remove the `canComment: boolean` and `onAddComment: (content: string) => void` fields from the `CommentsContainerData` type so the exported contract matches what `CommentThread` actually consumes (see `contracts/crd-presentational.md` §1). Leave `CommentAuthor`, `CommentReaction`, `CommentReactionSender`, and `CommentData` unchanged.
- [X] T007 [US3] In `src/main/crdPages/space/hooks/useCrdRoomComments.tsx`, remove the `canComment={canComment}` and `onAddComment={content => void postMessage(content)}` props from the `<CommentThread>` element (around lines 96–124). Keep the hook's local `canComment` variable and the `postMessage` closure — both are still used to decide whether to return `commentInput` (the separately rendered `<CommentInput>`). (Depends on T006.) Also fixed a second call site discovered during lint: `src/crd/app/pages/SpacePage.tsx` (standalone CRD preview app mock usage).
- [X] T008 [P] [US3] Remove the now-unreferenced `"sortNewest"` and `"sortOldest"` keys from the `comments` block in each of the six CRD locale files: `src/crd/i18n/space/space.en.json`, `src/crd/i18n/space/space.nl.json`, `src/crd/i18n/space/space.es.json`, `src/crd/i18n/space/space.bg.json`, `src/crd/i18n/space/space.de.json`, `src/crd/i18n/space/space.fr.json`. Preserve all other keys. CRD translations are managed manually (not Crowdin), so editing all six files is the correct workflow per `src/crd/CLAUDE.md` §i18n.

**Checkpoint**: Top-level comments render newest-first with no toggle control; TypeScript compiles cleanly against the trimmed `CommentsContainerData`; no locale file references the removed keys.

---

## Phase 6: User Story 4 — Reply once, not recursively (Priority: P2)

**Goal**: The Reply button is hidden on reply items, so the UI no longer advertises a capability the data layer silently discards. Delete on replies is unchanged.

**Independent Test**: Open a thread with at least one top-level comment that has a reply. Verify the Reply button appears only on the top-level comment, never on the reply itself; verify the reply author can still delete their own reply.

### Implementation for User Story 4

- [X] T009 [P] [US4] In `src/crd/components/comment/CommentItem.tsx`, tighten the Reply button's render guard (currently `!comment.isDeleted` around lines 53–62) to also require `!isReply`, i.e., render the Reply button only when both `!comment.isDeleted` and `!isReply`. Leave the Delete button conditional (`comment.canDelete && !comment.isDeleted`) unchanged so reply authors retain the ability to delete their own replies. Do not change the inline `CommentInput` render below a top-level comment when `isReplying` is true.

**Checkpoint**: All four user stories are independently functional; each can be demo'd and validated against its acceptance scenarios without the others landing.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification of the combined changes.

- [X] T010 Run `pnpm lint` from the repository root. Confirm TypeScript passes and Biome/ESLint are clean. First pass surfaced a second call site (`src/crd/app/pages/SpacePage.tsx`) that was fixed under T007; second pass returned EXIT=0 with only pre-existing warnings (no new errors).
- [X] T011 Run `pnpm vitest run` from the repository root. **Result**: 592 passed / 3 skipped / 0 failed across 58 files (11.73s). Baseline unchanged.
- [ ] T012 Walk the manual verification matrix in `specs/089-crd-comments-refinement/quickstart.md` sections A (timeline modal, 12 checks), B (callout dialog, 6 checks), C (cross-surface consistency, 3 checks), and D (edge cases, 4 checks) in a browser with `localStorage.setItem('alkemio-crd-enabled', 'true'); location.reload()` applied. Capture screenshots or a short screen recording for the PR description, per Constitution §Engineering Workflow #4 (testing evidence). **Deferred to user** — requires running backend at localhost:3000 and human-eyes browser verification.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Empty — non-blocking.
- **User Stories (Phases 3–6)**: All can begin immediately after Setup.
  - US1 (P1) and US2 (P1) together form the MVP.
  - US3 (P2) and US4 (P2) are additive.
- **Polish (Phase 7)**: Depends on the user stories the PR intends to ship.

### User Story Dependencies

- **US1 (Bounded-height)** and **US2 (Input-on-top)** both edit the same JSX block in `EventDetailView.tsx`. T002 (US1) should land before T003 (US2) to keep diffs clean; T004 (US2 callout) is independent of both.
- **US3 (Newest-first)** has an internal sequence: T006 (type trim) must land before T007 (call-site fix). T005 (CommentThread rewrite), T006, and T008 (locale files) are parallelizable with each other and with US1/US2/US4.
- **US4 (Reply affordance)** — T009 touches only `CommentItem.tsx` and is parallelizable with every other task except the Polish phase.

### Within Each User Story

- No sub-sequencing beyond the per-task notes above.

### Parallel Opportunities

- After T002 lands, the following can all run in parallel: T004, T005, T006, T008, T009. T003 must wait for T002 and T007 must wait for T006; everything else is independent.
- Polish tasks (T010, T011, T012) run after all chosen user-story tasks land.

---

## Parallel Example: After T002 completes

```bash
# These can run simultaneously (different files, no cross-dependencies):
Task: "T004 Move commentInputSlot out of the sticky footer in src/crd/components/callout/CalloutDetailDialog.tsx"
Task: "T005 Remove sort toggle state + button in src/crd/components/comment/CommentThread.tsx"
Task: "T006 Trim CommentsContainerData in src/crd/components/comment/types.ts"
Task: "T008 Remove sortNewest/sortOldest keys from all six src/crd/i18n/space/space.*.json files"
Task: "T009 Gate Reply button on !isReply in src/crd/components/comment/CommentItem.tsx"
```

After that batch lands, serialize the two remaining ordered tasks:

```bash
Task: "T003 Reorder commentsColumn slots in EventDetailView.tsx (depends on T002)"
Task: "T007 Drop removed props at useCrdRoomComments.tsx call site (depends on T006)"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 only)

Because US1 and US2 share priority P1 and overlap in the same JSX block (EventDetailView), ship them together as the MVP:

1. Complete Phase 1 (T001).
2. Land T002 (US1 bounded-height).
3. Land T003 (US2 EventDetailView reorder) + T004 (US2 callout dialog) in parallel.
4. Run T010 (lint) + T011 (tests) + T012 (manual matrix sections A, B, C, D) against the MVP scope.
5. Deploy/demo: users gain event-context visibility and consistent input placement.

### Incremental Delivery

After the MVP:
6. Add US3 (T005, T006, T007, T008) — newest-first + type cleanup + locale cleanup. Re-run T010/T011/T012.
7. Add US4 (T009) — Reply affordance fix. Re-run T010/T011/T012.

Each increment adds value without breaking previous stories.

### Parallel Team Strategy

With one developer the sequence above is natural. With multiple developers, after T002 lands the rest of the work can fan out (see Parallel Example above); rejoin for the Polish phase.

---

## Notes

- **File overlap**: T002 and T003 both modify `EventDetailView.tsx`. Land T002 first, then T003 — avoid simultaneous edits to the same file.
- **Locale files (T008)**: Per `src/crd/CLAUDE.md`, CRD translations are manual (not Crowdin). All six locale files MUST be edited in the same PR, not just English.
- **No new tests**: Per plan.md Technical Context (Testing). The refinement is presentation-only; the existing test suite plus `quickstart.md`'s manual matrix are the testing strategy.
- **Constitution alignment**: All 11 Constitution principles continue to pass per plan.md §Constitution Check. No new MUI imports, no new GraphQL, no new manual memoization, no new domain logic.
- **Pre-commit**: Husky + lint-staged run on commit. `pnpm lint` in T010 catches most issues before commit.
- **Commit granularity**: Commit after each task (or logically grouped task batch). Signed commits required per CLAUDE.md.

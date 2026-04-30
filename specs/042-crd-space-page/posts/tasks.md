# Tasks: CRD Post Contribution Migration

**Feature**: CRD Post Contribution Migration (sub-spec of `042-crd-space-page`)
**Spec**: [./spec.md](./spec.md) | **Plan**: [./plan.md](./plan.md)

## Terminology reminder

"Post" is overloaded. In this sub-spec it always means **post-as-contribution** (a contribution card with title + markdown description + tags + references + comments). The CRD callout-level classes named `PostCard` / `PostDetailDialog` / `AddPostModal` are *callouts*, not post contributions — out of scope here. Every new file uses the explicit `PostContribution*` form to avoid confusion.

## User Stories (derived from spec acceptance criteria)

- **US1 (P1)** — Post contribution edit dialog: clicking an existing post contribution card opens `CrdPostContributionDialog` in edit mode, prefilled. Save → `useUpdatePostMutation`. Delete (gated by privilege) → `useDeleteContributionMutation`. Two-layer dialog stacking — callout dialog stays mounted behind.
- **US2 (P1)** — Post contribution create flow: on a post-contribution callout, the trailing "Add post" trigger appears for users with create privilege. Clicking it opens `CrdPostContributionDialog` in create mode. Submit → `useCreatePostOnCalloutMutation`. The new card appears in the grid.
- **US3 (P1)** — Contribution-level comments: in edit mode, `CalloutCommentsConnector` is rendered below the form, identical in behaviour to callout-level comments.
- **US4 (P1)** — `ContributionCreateConnector.handleSubmit` post branch: the inline contribution form's `'post'` submit branch fires `useCreatePostOnCalloutMutation` instead of being a no-op TODO.
- **US5 (P2)** — Parity, a11y, cleanup: dirty-state confirm-on-close, i18n keys all routed through `useTranslation('crd-space')`, keyboard / focus-trap QA across the stacked dialogs, MUI residual import sweep.

US1 and US2 are independently testable with stub-clicks; US3 and US4 layer on top; US5 is a pass/fail checklist.

---

## Phase 1: Setup

> **Folder creation note**: `src/main/crdPages/post/` is created implicitly by the first task that lands a file in it (T010). No placeholder `index.ts` — barrels are forbidden per `src/crd/CLAUDE.md`.

- [X] T001 [P] **Decision: (c) skip references in v1, defer to follow-up.** `src/crd/forms/callout/ReferencesEditor.tsx` exists but is tightly coupled to `useCrdCalloutForm`'s `ReferenceRow` type and the callout-form's "More options" placement. Lifting it for the post dialog would mean teaching it a generic prop shape and porting the i18n keys; not justified for v1. Posts ship without a references field; users can manage references via the legacy MUI page until a future sub-spec ports the editor.
- [X] T002 [P] Audit confirmed: `ContributionPostCard.tsx`, `ContributionFormLayout.tsx`, and the post mapping at `contributionDataMapper.ts:137` match the spec. The mapping was extended with `postId` (mirroring the existing `memoId` field) so the dialog can call `usePostSettingsQuery` directly without a contribution → post lookup hop.
- [X] T002a [P] Audit confirmed: routing pattern mirrors memo/whiteboard exactly. `CalloutDetailDialogConnector` uses `setMemoContributionId` / `setMemoId` for the memo path; `setWhiteboardContributionId` for whiteboard. `handleContributionClick(id, entityId?)` second-arg is `memoId` for memo and now `postId` for post. `ContributionsSlot` `trailingSlot` switches on `contributionType`.

---

## Phase 2: Foundational (blocking prerequisites)

- [X] T003 [US1, US2] **Pivoted: form fields inlined into the dialog.** The expected second consumer (an inline contribution-form path via `ContributionFormLayout`) already exists with its own field rendering, so a separate `PostContributionFormFields` component would have one consumer. Saved one file, kept the dialog's form colocated with its mutation/dirty-state logic. Title `<Input>` + `<MarkdownEditor>` + `<TagsInput>` rendered directly inside `CrdPostContributionDialog`. Decision visible in `plan.md` P5 ("create flow lives inside the dialog").
- [X] T004 [US1, US2] Created `src/main/crdPages/post/postContributionFormSchema.ts` with Yup schema reusing `displayNameValidator({ required: true })` and `MarkdownValidator(LONG_MARKDOWN_TEXT_LENGTH, { required: true })`. References field included in the schema for forward compatibility, validated as empty array in v1.
- [X] T005 [P] [US1, US2, US5] Added i18n keys under `callout.*` (matching the existing `addMemo`/`createMemo` pattern, not the spec's proposed `post.contribution.*` group — this kept the schema flat and consistent with the surrounding keys). Keys: `addPost`, `createPost`, `editPost`, `defaultPostName`, `postNameLabel`, `postDescriptionLabel`, `postDescriptionPlaceholder`, `postTagsLabel`, `postSave`, `postCreate`, `postDelete`, `postDeleteConfirmTitle`, `postDeleteConfirmDescription`, `postUnsavedCloseTitle`, `postUnsavedCloseDescription`, `postUnsavedCloseConfirm`, `postUnsavedCloseCancel`. **English only** — other languages tracked under T042 (US5 cleanup).

**Checkpoint**: After T003–T005, US1 and US2 can both start. US3, US4, US5 layer on top.

---

## Phase 3: User Story 1 — Edit dialog (P1)

**Goal**: Clicking an existing post contribution card opens `CrdPostContributionDialog` in edit mode. Save / delete / close-with-confirm work end-to-end. The callout dialog stays mounted behind.

**Independent test**: With CRD on, open a callout with at least one post contribution → click a card → dialog opens prefilled → edit title or description → save → grid card reflects the new content. Click delete → confirm → card disappears. Close with unsaved edits → confirm dialog appears.

- [X] T010 [US1] Created `src/main/crdPages/post/CrdPostContributionDialog.tsx`. Edit mode wired to `usePostSettingsQuery` (prefill), `useUpdatePostMutation` (save with the existing tagset id), `useDeleteContributionMutation` (delete with `refetchQueries: ['CalloutDetails', 'CalloutContributions']`). Width `sm:max-w-3xl` + `min-w-0` per plan P3. Dirty-state confirm and delete confirm both use `ConfirmationDialog` (destructive variant).
- [X] T011 [US1] **Decision: inlined the query.** `usePostSettingsQuery` is called directly inside `CrdPostContributionDialog`. No `usePostContributionData` wrapper — single consumer, no need for indirection.
- [X] T012 [US1] Created `src/main/crdPages/space/callout/PostContributionConnector.tsx`. Thin connector — receives `{ open, calloutId, contributionId, postId, onClose }`, mounts the dialog in edit mode.
- [X] T013 [US1] Updated `CalloutDetailDialogConnector.tsx`:
  - Added `postContributionId` / `setPostContributionId` and `postId` / `setPostId` state alongside the memo / whiteboard parallels.
  - Added `initialPostId` prop (parallel to `initialMemoId`) for deep-link / feed-thumbnail entry points.
  - Extended `handleContributionClick(id, entityId?)` with a `Post` branch that stores `postContributionId` + `postId`.
  - Mounted `<PostContributionConnector ...>` as `postOverlay` alongside `whiteboardOverlay` / `memoOverlay`, in both branches (with-comments and without-comments) of the connector's render.
- [ ] T014 [US1] Manual click test pending — needs the dev server. Plan: with CRD on, open a post-contribution callout → click each contribution card → dialog opens with the right post → close → callout dialog still mounted at the same scroll position.

---

## Phase 4: User Story 2 — Create flow (P1)

**Goal**: Members on a callout configured for post contributions see an "Add post" trigger; clicking it opens `CrdPostContributionDialog` in create mode; submitting creates the post via `useCreatePostOnCalloutMutation` and the new card appears in the grid.

**Independent test**: With create privileges, open a post-contribution callout → trailing "Add post" card visible → click → dialog opens with empty form → enter title + description → submit → grid shows the new card; dialog closes. Without create privileges, the trailing card is not rendered.

- [X] T015 [US2] Extended `CrdPostContributionDialog` to handle `mode === 'create'`. Empty values prefill (with `defaultDisplayName` fallback), `useCreatePostOnCalloutMutation` fires on submit with `{ profileData: { displayName, description }, tags }` and the right refetch queries. Note: spec wrote `profile`, schema actually wants `profileData` per `CreatePostInput`.
- [X] T016 [US2] Created `src/main/crdPages/space/callout/PostContributionAddConnector.tsx`. Thin connector — renders `ContributionAddCard` (MessageSquare icon, `callout.addPost` label), opens the dialog in create mode on click.
- [X] T017 [US2] Updated `ContributionsSlot` in `CalloutDetailDialogConnector` — added a `Post` branch to the `trailingSlot` ternary that mounts `<PostContributionAddConnector calloutId={callout.id} onCreated={onContributionCreated} />` when `canCreateContribution && contributionType === Post`.
- [ ] T018 [US2] Manual create test pending — needs the dev server.

---

## Phase 5: User Story 3 — Contribution-level comments (P1)

**Goal**: In edit mode the dialog renders the post contribution's comment thread below the form using `CalloutCommentsConnector`, identical in behaviour to callout-level comments.

**Independent test**: Open an existing post contribution → comments section visible below the form → post a comment → it appears in the thread. Permission denied → comments thread hidden or read-only as configured.

- [X] T020 [US3] Wired `<CalloutCommentsConnector roomId={commentsRoom.id} contributionId={contributionId} roomData={commentsRoom} />` below a divider in edit mode. The dialog calls `useCalloutContributionCommentsQuery` itself to obtain the room; passing `roomData` makes the inner connector skip its own fetch (no duplicate query).
- [X] T021 [US3] Applied `max-h-[90vh] overflow-y-auto` on `DialogContent` so the dialog body scrolls (not the page) when comments stack up.

---

## Phase 6: User Story 4 — Inline contribution-form post branch (P1)

**Goal**: Submitting the inline post form rendered by `ContributionFormLayout` (via `ContributionCreateConnector`) actually creates a post — replacing the long-standing `// TODO` stub at `ContributionCreateConnector.tsx:20`.

**Independent test**: Toggle CRD on, render `ContributionCreateConnector` with `allowedTypes` including `'post'`, click the "post" trigger, fill the inline form, submit → `useCreatePostOnCalloutMutation` fires; on success, parent receives `onCreated()`; form resets. (Note: the inline-form path is separate from the dialog-based path in US2 — they coexist; this task does not remove either.)

- [X] T030 [US4] Updated `ContributionCreateConnector.tsx`. Added optional `calloutId?: string` prop. Replaced the `// TODO` stub for the `'post'` branch with `useCreatePostOnCalloutMutation` (only fires when `calloutId` is set and `title.trim()` is non-empty). Tags split by comma, trimmed, deduped via `filter(Boolean)`. Other branches still stubbed and tracked by their own sub-specs.
- [X] T031 [US4] No callsites exist today (`grep -rn "ContributionCreateConnector" src/` shows only the connector itself). The inline-form path is forward-looking — wired to be ready when a future surface mounts it. Documented in comments.

---

## Phase 7: User Story 5 — Parity, a11y, cleanup (P2)

- [ ] T040 [US5] Manual a11y + parity pass (MUI vs CRD side by side via the toggle):
  - Keyboard path: callout detail dialog → post contribution dialog → close → focus returns to the originating card.
  - Tab order inside the dialog: title → description editor → tags → references → save / delete / close.
  - Escape closes only the topmost dialog.
  - Focus trap stays inside the topmost dialog; Tab does not escape to the callout behind.
  - Scroll position of `CalloutDetailDialog` preserved after closing the post dialog.
  - Validation errors are announced via `aria-live` (or the CRD form-field convention).
  - Delete confirm + dirty-close confirm both reachable by keyboard alone.
- [ ] T041 [P] [US5] String sweep: grep `src/crd/forms/post/`, `src/main/crdPages/post/`, `src/main/crdPages/space/callout/PostContribution*` for hardcoded strings inside JSX. Each user-visible string must resolve via `useTranslation('crd-space')` and a `post.contribution.*` key from T005. Add missing keys.
- [ ] T042 [P] [US5] Add the i18n keys from T005 to the other 5 language files (`bg`, `de`, `es`, `fr`, `nl`) in `src/crd/i18n/space/space.<lang>.json`. Translations are AI-assisted and live in this PR — CRD translations are NOT managed via Crowdin (per `src/crd/CLAUDE.md`).
- [ ] T043 [US5] Forbidden-import sweep: grep `src/crd/` for any new `@mui/`, `@emotion/` import introduced by this work. Zero hits expected. Also sweep `src/main/crdPages/post/` and the new connectors for `@mui/` imports — those are allowed in `src/main/` in general, but should not creep into the post integration unless there is no CRD equivalent. Document any necessary MUI use.
- [ ] T044 [US5] Document the deferred move-to-callout feature in the PR description (per spec / plan P6) — call it out as a known parity gap with the MUI dialog so reviewers don't expect it.

---

## Dependencies

```
Setup (T001, T002, T002a)
   │
Foundational (T003, T004, T005)
   │
   ├──► US1 (T010–T014)        ← T010 depends on T003, T004
   │      │
   │      └──► US3 (T020–T021)  ← needs the edit-mode dialog
   │
   ├──► US2 (T015–T018)        ← T015 extends T010; T016 mirrors MemoContributionAddConnector
   │
   └──► US4 (T030, T031)       ← independent of US1/US2; can land in parallel
                │
                └──► US5 (T040–T044)
```

- US1 and US2 share `CrdPostContributionDialog` (T010 / T015) — T010 must land before T015.
- US3 must wait for US1's edit-mode dialog to exist.
- US4 is structurally independent — different connector, different surface — and can ship in parallel.
- US5 is gating cleanup; do not start until US1 + US2 + US3 + US4 are merged.

## Parallel Execution Examples

**After Foundational completes:**
- Contributor A: US1 end-to-end (T010 → T012 → T013 → T014).
- Contributor B: T030 / T031 (US4) in parallel — different file, no overlap.

**Inside US1 + US2 (same person, sequential):**
- T010 (edit) → T015 (extend to create) → T012 / T016 (connectors, parallel) → T013 / T017 (detail-dialog wiring, sequential because both edit the same file).

## Implementation Strategy

- **MVP** = US1 + US4. With these alone, post contributions can be edited via the dialog AND created via the inline form. Stakeholders can validate end-to-end without the dialog-create flow.
- **US2 second** — adds the dialog-based create flow that matches how memos and whiteboards are added. Symmetric UX, slightly more work.
- **US3 last among P1s** — comments are a higher-risk integration (`CalloutCommentsConnector` permission gating) and benefit from being added once the dialog shape is settled.
- **US5 closes** — i18n, a11y, cleanup, parity gap documentation.

## Format Validation

All tasks follow `- [ ] TNNN [P?] [USn] Description with file path` — checkboxes present, file paths included, story labels on Phase 3+ tasks. Total: **18 tasks** (T001, T002, T002a, T003, T004, T005, T010–T013, T015–T017, T020, T021, T030, T031, T040–T044) before counting the T002a / T044 inserts that are typed as their own IDs.

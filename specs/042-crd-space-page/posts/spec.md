# CRD Post Contribution Migration

## Problem

A **post contribution** is one of Alkemio's contribution types — a single-author card with title, markdown description, tags, and references. It is conceptually the simplest contribution type and is the historical default ("Post" predates Memo and Whiteboard).

> **Terminology gotcha** — "Post" in this codebase means two distinct things. (1) The CRD class `PostCard` / `PostDetailDialog` / `AddPostModal` actually represents a **callout** (the box with framing + contributions). (2) A **post contribution / post response** is a contribution *inside* a callout, with a title and a markdown description. This sub-spec is exclusively about (2). All file names introduced here use the explicit form `PostContribution*` to avoid collision with the callout-named classes.

Today on the CRD side:
- The presentational card `src/crd/components/contribution/ContributionPostCard.tsx` is implemented (title, author, date, snippet, tags, comment count) and rendered by `ContributionsPreviewConnector` / `ContributionGridConnector` for `CalloutContributionType.Post`.
- The dashed "+N more" treatment for posts is in place (intentional — posts are text-like, not image-like).
- The data mapper at `src/main/crdPages/space/dataMappers/contributionDataMapper.ts` (~lines 137–150) maps `item.post` to `ContributionCardData`.

What is **missing** end-to-end:
- **No detail / edit dialog.** Clicking a post contribution card today is a no-op in CRD. There is nothing analogous to `CrdMemoDialog` or `CrdSingleUserWhiteboardDialog` for posts.
- **No "Add post" trigger / create flow.** No equivalent of `MemoContributionAddConnector` or `WhiteboardContributionAddConnector`. The "Add Response" button never appears for the post contribution type.
- **No `Post` branch in `CalloutDetailDialogConnector`'s contribution-click routing or `ContributionsSlot`.** State only exists for `whiteboardContributionId` and `memoContributionId`.
- **`ContributionCreateConnector.handleSubmit` is a `// TODO` stub** — no mutation is called for any type, including `'post'`.

The legacy MUI flow at `src/domain/collaboration/calloutContributions/post/CalloutContributionDialogPost.tsx` is the behavioural reference: edit form (title + markdown description + tags + references), delete (gated by `Delete` privilege), move-to-callout (gated by `MovePost` privilege), close-with-confirm-on-dirty.

This sub-spec migrates the post contribution lifecycle to CRD, mirroring the memo and whiteboard sub-specs in shape but **without** collaboration infrastructure, **without** framing (posts are only ever a contribution type — there is no `CalloutFramingType.Post`), and **without** server-side template content.

## Current MUI Implementation (reference)

| Concern | File | Role |
|---|---|---|
| Detail / edit dialog | `src/domain/collaboration/calloutContributions/post/CalloutContributionDialogPost.tsx` | `DialogWithGrid` + `PostForm` + delete button + move-to-callout autocomplete |
| Edit form | `src/domain/collaboration/post/PostForm/PostForm.tsx` | Formik form: name, description (markdown), tagsets, references |
| Settings hook | `src/domain/collaboration/post/graphql/usePostSettings.ts` | Wraps `usePostSettingsQuery` + `useUpdatePostMutation` + `useDeletePostMutation` and exposes `handleAddReference` / `handleRemoveReference` |
| Create button | `src/domain/collaboration/calloutContributions/post/CreateContributionButtonPost.tsx` | Trigger + `useCreatePostOnCalloutMutation` |

Key facts verified:
- Posts are **never** a framing type — `CalloutFramingType` has `Memo | Whiteboard | None | CallToAction | Image | Poll`. There is no post-framing flow to migrate, only the contribution flow.
- Post mutations live in the generated Apollo hooks: `useCreatePostOnCalloutMutation`, `useUpdatePostMutation`, `useDeletePostMutation`, plus the cross-type `useDeleteContributionMutation` and `useMoveContributionToCalloutMutation`.
- A post contribution carries: `id`, `profile.{displayName, description, tagset.tags, references}`, `createdBy.profile.{displayName, avatar.uri}`, `createdDate`, `comments.{id, messagesCount, authorization}`.

## Solution

### Scope

The **full post contribution lifecycle** in CRD:

- **Create**: on a callout configured for post contributions, members see an "Add post" trigger in the contribution-grid trailing slot. Clicking it opens `CrdPostContributionDialog` in *create* mode. The user fills in title and description (and optionally tags / references), submits, and `useCreatePostOnCalloutMutation` fires; the dialog closes after `awaitRefetchQueries: ['CalloutDetails', 'CalloutContributions']`. (Symmetric with the memo flow but with an inline form instead of a name-only popup, because posts have meaningful content to author up front.)
- **Edit**: clicking an existing post contribution card (from the feed preview OR from inside the detail dialog's contribution grid) opens `CrdPostContributionDialog` in *edit* mode, prefilled from `usePostSettingsQuery`. Save → `useUpdatePostMutation`. Two-layer dialog stacking — the callout dialog stays mounted behind. Same rule as memos and whiteboards.
- **Delete**: `CrdPostContributionDialog` exposes a Delete action (gated by `AuthorizationPrivilege.Delete`). Deletion uses `useDeleteContributionMutation` and refetches `CalloutDetails` + `CalloutContributions`. Confirmation via the existing CRD `ConfirmationDialog` primitive.
- **Discussion comments**: post contributions support a contribution-level comment thread (`post.comments`). The dialog renders this thread below the form using the existing `CalloutCommentsConnector`, the same component the callout dialog uses for callout-level comments.

The `ContributionCreateConnector` `// TODO` mutation stub is replaced for the `'post'` branch (only). Other types stay unchanged in this sub-spec — they have their own lifecycle work tracked under `memos/` and `whiteboard/`.

### Visual treatments

**Contribution card** — *no work*. `ContributionPostCard` exists and is correct. This sub-spec only verifies the click target wires through to the new dialog.

**"+N more" overlay** — *no work*. Posts continue to render the dashed "+N more" card (the unified treatment from `memos/` already keeps posts on the dashed-card branch as text-like).

**Feed-level preview inside `PostCard`** — *no work*. Post-typed callouts already render normally (text framing); there is no special feed-level treatment analogous to the whiteboard thumbnail or the memo cropped-markdown.

### Editor dialog

New CRD `PostContributionEditorShell` component (or simply `CrdPostContributionDialog` if a dedicated shell adds no reuse — to be decided in plan), structurally simpler than `MemoEditorShell` because there is no editor slot and no collab infrastructure:

```
CrdPostContributionDialog
├── header: title + close + delete-button (in edit mode, when permitted)
├── body:   form fields — title input, MarkdownEditor for description,
│           TagsField, ReferencesEditor (collapsed by default)
├── divider (only in edit mode)
└── below:  contribution-level comments (CalloutCommentsConnector)
            — only in edit mode, only when comments are enabled and the user has read permission
```

Implemented as a Radix Dialog + the existing CRD primitives. The description editor is the existing CRD `MarkdownEditor` (non-collaborative). No new editor component is needed.

The dialog uses the same width treatment as `ResponseDefaultsDialog` (after the recent fix): `sm:max-w-2xl` with `min-w-0` on the inner content wrapper so the markdown toolbar's `overflow-x-auto` clips correctly inside the grid column. Comments below the form may benefit from a wider treatment (`sm:max-w-3xl`) because the discussion thread reads better at desktop width — to be decided in plan.

A close-with-confirm flow protects against accidental loss of unsaved edits, mirroring the MUI `closeConfirmDialogOpen` pattern. Reuse `ConfirmationDialog`.

### Integration layer

New files under `src/main/crdPages/post/` and `src/main/crdPages/space/callout/`:

- `src/main/crdPages/post/CrdPostContributionDialog.tsx` — the create/edit dialog. Calls `usePostSettingsQuery` (or a thin equivalent) on edit, `useCreatePostOnCalloutMutation` on create, `useUpdatePostMutation` on save, `useDeleteContributionMutation` on delete. Handles dirty-state confirmation.
- `src/main/crdPages/post/postContributionFormSchema.ts` — Yup validation schema for `{ displayName, description, tags, references }`. Reuses existing displayName / markdown validators from the legacy form so length and content rules stay identical.
- `src/main/crdPages/space/callout/PostContributionConnector.tsx` — mirrors `MemoContributionConnector`. Receives `{ open, calloutId, contributionId, onClose }`, fetches via `usePostSettingsQuery`, renders `<CrdPostContributionDialog mode="edit" ...>` with delete plumbing.
- `src/main/crdPages/space/callout/PostContributionAddConnector.tsx` — mirrors `MemoContributionAddConnector`. Renders `ContributionAddCard` (with a `MessageSquare` or `FileText` icon — to be decided in plan); on click opens `<CrdPostContributionDialog mode="create" calloutId={...} onCreated={...} />`. The create-mutation call lives inside the dialog rather than the connector so dirty-state and validation stay in one place.
- `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx` updates — symmetric with the memo additions:
  - Add `postContributionId` / `setPostContributionId` state alongside the existing `whiteboardContributionId` / `memoContributionId`.
  - `handleContributionClick` routes to `setPostContributionId` when `contributionType === CalloutContributionType.Post`.
  - `ContributionsSlot` adds a `Post` branch that renders `<PostContributionAddConnector calloutId={callout.id} onCreated={onContributionCreated} />` in the trailing slot when `canCreateContribution && contributionType === CalloutContributionType.Post`.
  - When `postContributionId` is set, mount `<PostContributionConnector ...>` as the overlay (same stacking pattern as memo/whiteboard overlays).
- `src/main/crdPages/space/callout/LazyCalloutItem.tsx` — confirm `initialContributionId` / `initialMemoId` / etc. routing already covers post; if a post-specific routing prop is needed (e.g. `initialPostId` from a deep link), add it parallel to the memo case.
- `src/main/crdPages/space/callout/ContributionCreateConnector.tsx` — replace the `'post'` branch of the `// TODO` stub: when the user submits the post form, call `useCreatePostOnCalloutMutation` with `calloutId` + `{ profile: { displayName, description }, tags }` + `awaitRefetchQueries: ['CalloutDetails', 'CalloutContributions']`. Other type branches stay as `// TODO` (handled by their own sub-specs).

> **Naming**: prefer the explicit form `PostContribution*` for every new file under `src/main/crdPages/space/callout/` and `src/main/crdPages/post/`. The CRD callout-level files (`PostCard`, `PostDetailDialog`, `AddPostModal`) keep their existing names — renaming them is out of scope and would balloon the diff.

### Out of scope

- **Collaborative editing of posts.** Posts are single-author. No Yjs / Hocuspocus.
- **Move-to-callout.** The MUI dialog supports moving a post to another callout (gated by `MovePost`). Defer to a follow-up sub-spec — it is admin-grade and rarely used. List it as a known parity gap in the PR description.
- **References editor reuse.** If no CRD `ReferencesEditor` exists yet (it might — there is one in `CalloutFormConnector`), check first. If the existing one is callout-form-specific, mark "reuse-or-extract" as an open question in the plan rather than building a new one here.
- **Renaming the misnamed callout-side `PostCard` / `PostDetailDialog` / `AddPostModal`.** Tracked separately, not in this sub-spec.
- **Public/anonymous post viewing route.** No equivalent to `/public/whiteboard/:id`.
- **Mentions, slash commands, file-attachment surface beyond the markdown editor's existing image/iframe extensions.**

## Open questions

These need a decision in `plan.md`:

- **Dialog width**: `sm:max-w-2xl` for the form-only view, or `sm:max-w-3xl` consistently (since comments will appear below)? Lean: a single `sm:max-w-3xl` value, the form just doesn't fill it on create.
- **Editor shell vs. plain dialog**: is the structure reusable enough to extract a `PostContributionEditorShell`, or does it stay inlined in `CrdPostContributionDialog`? Lean: inline. The dialog is form-shaped, not editor-shell-shaped — there is no Tiptap canvas slot, no full-screen variant, no fullscreen-toggle button.
- **References field**: build a minimal CRD `ReferencesEditor` here, or reuse the one already in `CalloutFormConnector`?
- **Post creation entry point ergonomics**: should the "Add post" trigger render the dialog directly (one click → modal with empty form), or render an `inline` form like `ContributionFormLayout` does today (one click → expanded inline form)? Lean: dialog, for visual parity with how memos and whiteboards are added.
- **i18n namespace**: reuse `crd-space` (current convention for memos and whiteboards) or split a new `crd-post`? Lean: reuse `crd-space` unless key count exceeds ~15.

## Acceptance

- Toggle CRD on → open a callout configured for post contributions → the contribution grid trailing slot shows an "Add post" trigger when the viewer can create.
- Click "Add post" → `CrdPostContributionDialog` opens in create mode → fill title + description + tags → submit → the new post contribution card appears in the grid; the dialog closes; the callout dialog stays open behind.
- Click an existing post contribution card → `CrdPostContributionDialog` opens in edit mode, prefilled with the post's current data → save → the card reflects the new content. The callout dialog stays mounted behind.
- With delete privilege, the dialog exposes a Delete button → click → confirm → the post contribution disappears from the grid; the dialog closes.
- Below the form (edit mode only), the contribution-level comments thread is rendered using `CalloutCommentsConnector`, identical in behaviour to comment threads on the callout itself.
- Closing the dialog with unsaved changes shows a confirmation; closing with no changes closes immediately.
- `ContributionCreateConnector.handleSubmit` is no longer a no-op for the `'post'` branch — submitting the inline post form fires `useCreatePostOnCalloutMutation`.
- Zero `@mui/*` or `@emotion/*` imports anywhere under `src/crd/` introduced by this work.

# Implementation Plan: CRD Post Contribution Migration

**Parent**: [../plan.md](../plan.md) | **Spec**: [./spec.md](./spec.md)

## Summary

Migrate the post contribution lifecycle to CRD: detail/edit dialog, create flow, delete, and contribution-level comments. Posts are single-author and have no framing — this is contribution-only work, simpler than the memo and whiteboard sub-specs. No collaboration infrastructure, no new editor component, no `CalloutFramingType.Post` (it doesn't exist), no public route.

The strategy is to copy the memo *contribution* layer (not the *framing* layer) and replace the editor body with a plain Yup-validated form using the existing CRD `MarkdownEditor`. The mutation set (`useCreatePostOnCalloutMutation`, `useUpdatePostMutation`, `useDeletePostMutation`, `useDeleteContributionMutation`) is already generated.

## Component Inventory

### New in `src/crd/`

| Path | Role | Notes |
|---|---|---|
| `forms/post/PostContributionFormFields.tsx` | Reusable form-fields block | Title input + `MarkdownEditor` description + `TagsField` + collapsible references. Plain TS props (`value` / `onChange`) — no Formik. Used by both the dialog and any future inline create flow. |

> **No new editor shell.** The dialog inlines `Dialog` + form + comments. A separate `PostContributionEditorShell` is not justified — there is no second consumer (unlike `MemoEditorShell` which is shared across framing and contribution).

Refinements to existing CRD files:
- `forms/contribution/ContributionFormLayout.tsx` — confirm the existing layout (post / memo / whiteboard / link) keeps the post variant for the inline `ContributionCreateConnector` flow. Likely zero changes; verify in T002.
- `components/contribution/ContributionPostCard.tsx` — no changes. Card is correct as-is.

### New in `src/main/crdPages/post/`

| Path | Role |
|---|---|
| `CrdPostContributionDialog.tsx` | Create/edit dialog. Branches on `mode: 'create' \| 'edit'`. On create: calls `useCreatePostOnCalloutMutation`, refetches `CalloutDetails` + `CalloutContributions`, calls `onCreated`. On edit: calls `usePostSettingsQuery` for prefill, `useUpdatePostMutation` for save, `useDeleteContributionMutation` for delete. Owns dirty-state tracking, close-with-confirm, and form validation via `postContributionFormSchema`. |
| `postContributionFormSchema.ts` | Yup schema. Reuses `displayNameValidator` and `MarkdownValidator(LONG_MARKDOWN_TEXT_LENGTH, { required: true })` from the legacy form so length + required rules stay identical to the MUI dialog. |
| `usePostContributionData.ts` | Thin hook over `usePostSettingsQuery` that returns `{ post, loading, error }`. Exists so the dialog stays focused on UI/UX concerns and the data shape can evolve independently. May be omitted if the query is used in only one place (revisit during T010). |

### New in `src/main/crdPages/space/callout/`

| Path | Role |
|---|---|
| `PostContributionConnector.tsx` | Mirrors `MemoContributionConnector`. Receives `{ open, calloutId, contributionId, onClose }`, renders `<CrdPostContributionDialog mode="edit" ...>`. |
| `PostContributionAddConnector.tsx` | Mirrors `MemoContributionAddConnector`. Renders `ContributionAddCard` with a `MessageSquare` icon → opens `<CrdPostContributionDialog mode="create" calloutId onCreated />`. |

Refinements to existing integration:

- `CalloutDetailDialogConnector.tsx`:
  - Add `postContributionId` state (parallel to `whiteboardContributionId` / `memoContributionId`).
  - Extend `handleContributionClick` (the click router) with a `Post` branch that calls `setPostContributionId(id)`.
  - Extend the `ContributionsSlot` trailing-slot logic with a `Post` branch that mounts `<PostContributionAddConnector calloutId={callout.id} onCreated={onContributionCreated} />` when `canCreateContribution`.
  - Mount `<PostContributionConnector open={!!postContributionId} ...>` as a sibling overlay alongside the memo and whiteboard overlays.

- `LazyCalloutItem.tsx`:
  - If we already pass an `initialContributionId` through to `CalloutDetailDialogConnector`, the post case is handled by the type branch inside the connector (post is the *default* contribution type per `ContributionsPreviewConnector`). No change expected. Confirm in T012.

- `ContributionCreateConnector.tsx`:
  - Replace the `'post'` branch of `handleSubmit`'s `// TODO` stub with `useCreatePostOnCalloutMutation`. Other branches remain TODOs (handled by their own sub-specs).

- `dataMappers/contributionDataMapper.ts`:
  - No changes. The post mapping at lines 137–150 already produces the right `ContributionCardData` shape (`title`, `author`, `description`, `tags`, `commentCount`, `createdDate`).

## Design Decisions

### P1: No collaboration, no editor shell
Posts are single-author. The description uses the existing CRD `MarkdownEditor` (non-collaborative). There is no second consumer of a "post editor shell", so the dialog inlines its layout. This is the single largest simplification vs. the memo plan.

### P2: Naming uses explicit `PostContribution*` form
Every new file (`CrdPostContributionDialog`, `PostContributionConnector`, `PostContributionAddConnector`, `PostContributionFormFields`, `postContributionFormSchema`) uses the long form. The CRD callout-side classes (`PostCard`, `PostDetailDialog`, `AddPostModal`) keep their misleading short names — renaming them is out of scope. The terminology gotcha is documented in the spec front-matter.

### P3: Dialog width — single value
Use `sm:max-w-3xl` consistently. The form alone won't fill it; the comments thread below benefits from the extra width. This is one width to maintain rather than a mode-dependent toggle. Apply `min-w-0` to the inner content wrapper (same pattern as the recent `ResponseDefaultsDialog` fix) so the markdown toolbar's `overflow-x-auto` clips inside the column.

### P4: Comments below the form, edit mode only
Render `<CalloutCommentsConnector commentsId={post.comments.id} ...>` below the form fields when `mode === 'edit'` and `post.comments` is permitted. Hidden in create mode (the post doesn't exist yet, so there's no thread). Same component the callout dialog uses for callout-level comments — proven in production.

### P5: Create flow lives inside the dialog
`PostContributionAddConnector` is a thin trigger; the actual `useCreatePostOnCalloutMutation` call happens inside `CrdPostContributionDialog` so dirty-state, validation, error handling, and success UX are colocated. This is the same shape as `MemoContributionAddConnector` (the connector triggers, the dialog mutates).

### P6: Move-to-callout is deferred
The MUI dialog's `useMoveContributionToCalloutMutation` flow (and the `Autocomplete` of target callouts) is **not** in scope. Document this as a known parity gap — admin-grade, rarely used. A follow-up sub-spec can add it without disturbing the structure introduced here.

### P7: References field — pragmatic reuse
First check whether `CalloutFormConnector` already has a `ReferencesEditor` that can be lifted into `src/crd/forms/post/` or `src/crd/forms/common/` (T001). If yes, lift and share. If no, build a minimal one inline in `PostContributionFormFields` — title + url + description rows with add / remove. The legacy `ReferenceSegment` is too entangled with admin tagsets to port wholesale.

### P8: i18n in `crd-space`
All post-contribution-specific strings (`post.contribution.addLabel`, `post.contribution.editTitle`, `post.contribution.createTitle`, `post.contribution.delete`, `post.contribution.unsavedClose.title`, `post.contribution.unsavedClose.description`) go under the existing `crd-space` namespace. Split to a new `crd-post` namespace only if key count exceeds ~15. This matches the memo decision (M7).

### P9: Dirty-state confirmation — reuse `ConfirmationDialog`
The CRD primitive `ConfirmationDialog` already handles the "are you sure you want to discard?" pattern. Wire it inside `CrdPostContributionDialog` with a local `closeConfirmOpen` boolean, mirroring the MUI `closeConfirmDialogOpen` flag.

### P10: Scope boundary — `usePostSettings` not reused
The legacy `usePostSettings` hook bundles `usePostSettingsQuery` + mutations + reference handlers + a delete-callback indirection. The CRD dialog calls the underlying hooks directly (`usePostSettingsQuery`, `useUpdatePostMutation`, `useDeleteContributionMutation`) and lifts only the parts it needs. This avoids importing a domain-MUI helper and keeps the dialog's data flow legible. The reference add/remove logic is small enough to reimplement inside `PostContributionFormFields`.

## Phased Implementation

| Phase | What ships | Effort |
|---|---|---|
| P0 | Setup + foundational: form-fields component, validation schema, references reuse decision | S |
| P1 | `CrdPostContributionDialog` (edit mode) + `PostContributionConnector` + `CalloutDetailDialogConnector` click routing | M |
| P2 | Create mode: `PostContributionAddConnector` + dialog create-mode wiring + `ContributionsSlot` trailing-slot post branch | M |
| P3 | Comments thread integration (`CalloutCommentsConnector` below the form) | S |
| P4 | `ContributionCreateConnector.handleSubmit` post-branch wiring + dirty-state confirm + i18n + a11y pass | S |

## Complexity Tracking

| Risk | Mitigation |
|---|---|
| `usePostSettingsQuery` returns shape differs from the form-fields shape | Add a small `mapPostToFormValues` helper next to the schema; covered by T010. |
| Click routing in `CalloutDetailDialogConnector` already handles three contribution types — adding a fourth could push it past readability | If the connector grows past ~250 lines of dispatch code, extract a `useContributionOverlayState` hook and migrate all four overlays. Decide during T020 (when the `Post` branch is added). |
| References field — building yet another `ReferencesEditor` if no reusable one exists | T001 is explicitly the audit step. If absent, scope a minimal version in T003 inside `PostContributionFormFields` (title + url + add/remove rows, no description per row, no reorder). |
| `useCreatePostOnCalloutMutation` write to Apollo cache vs. refetch | Use `awaitRefetchQueries: true` + `refetchQueries: ['CalloutDetails', 'CalloutContributions']` (same pattern memos and whiteboards use). Skip optimistic updates — the create flow closes the dialog on success and the refetch latency is acceptable. |
| Markdown editor toolbar overflow inside the dialog | Apply `min-w-0` to the form wrapper (same fix as `ResponseDefaultsDialog`). Verified pattern, no risk. |

## Open Items (resolved during implementation)

- **`usePostContributionData` worth extracting?** — decide in T010. If only `CrdPostContributionDialog` reads the post, inline the query and skip the wrapper.
- **References editor reuse vs. new** — T001 audit decides.
- **Comments thread permission gating** — confirm during T015 which authorization privilege governs read-vs-write on `post.comments` and how `CalloutCommentsConnector` consumes it. Match the callout-level behaviour exactly.

# Tasks: CRD Callout Dialog — Create / Edit / Lifecycle

**Parent**: [../tasks.md](../tasks.md) | **Plan**: [./plan.md](./plan.md) | **Spec**: [./spec.md](./spec.md)

Legend: `[P]` — can be done in parallel with other `[P]` items in the same phase.

## P0 — Form shell rewrite (text-callout parity)

- [ ] **T001** Rewrite `src/main/crdPages/space/hooks/useCrdCalloutForm.ts` with the full value type (add: `memoMarkdown`, `referenceRows`, `prePopulateLinkRows`, `responseType`, `allowedActors`, `contributionCommentsEnabled`, `contributionDefaults`, `initialValues`). Keep existing fields. Remove `framingType` + `allowedContributionTypes` array (now derived). Export `dirty` (via `isEqual(values, initialValues)`).
- [ ] **T002** Add yup schema + `validate()` + `translateValidationMessage()` inside the hook, following `useCreateSubspace.ts` lines 95-133. Cover FR-80..FR-87.
- [ ] **T003 [P]** Add translation keys under `validation.*` in `src/crd/i18n/space/space.en.json`. Mirror in the other 5 languages.
- [ ] **T004** Create `src/crd/forms/callout/FramingChipStrip.tsx` (single-select radiogroup, `locked?: boolean`, `lockedTo?: ChipId`, Document chip always disabled). Include unit test for chip semantics.
- [ ] **T005** Rewrite `src/crd/forms/callout/AddPostModal.tsx`: accept `mode`, `dirty`, `onFindTemplate?`, the new slots (`framingEditorSlot`, `responsesSlot`, `moreOptionsSlot`, `notifyCheckboxSlot`). Reorder zones per prototype. Add `handleCloseAttempt`.
- [ ] **T006** Create `src/crd/components/dialogs/DiscardChangesDialog.tsx`. Wire into `AddPostModal`'s close flow.
- [ ] **T007** Add `beforeunload` handler while dirty (copy from `useDirtyTabGuard.ts` lines 47-57).
- [ ] **T008** Update `src/main/crdPages/space/callout/CalloutFormConnector.tsx`: consume the new hook shape, split `mapFormToCalloutCreationInput()` into a pure helper in a new file `src/main/crdPages/space/callout/calloutFormMapper.ts`. Wire `dirty` down to the modal.
- [ ] **T009** Manual smoke: create simple text callout with title + description + tags. Verify validation errors render, confirm-on-close works, notify checkbox toggles `sendNotification`.

## P1 — All five framings

- [ ] **T010** Create `src/crd/forms/callout/MemoFramingEditor.tsx` wrapping `@/crd/forms/markdown/MarkdownEditor`. Inline card with icon + label.
- [ ] **T011** Update `src/main/crdPages/space/callout/FramingEditorConnector.tsx` `case 'memo'`: render `MemoFramingEditor` bound to `values.memoMarkdown`.
- [ ] **T012 [P]** Add `framing.memo = { markdown, profile: { displayName } }` branch in `calloutFormMapper.ts` (T008).
- [ ] **T013 [P]** Create `src/crd/forms/callout/DocumentFramingPlaceholder.tsx` (disabled panel with "Coming soon" copy).
- [ ] **T014** Verify whiteboard framing: clicking Whiteboard chip → Configure opens `CrdSingleUserWhiteboardDialog` → save → chip card shows "Configured" + Edit. Smoke test only (no code change).
- [ ] **T015** Verify link framing: `LinkFramingFields` renders, URL validation triggers for `^https?://`. Smoke test only.
- [ ] **T016** Verify poll framing: `PollOptionsEditor` + `PollSettingsDialog` work as-is. Verify `PollSettingsDialog` hide-results-until-voted + voter-avatars flags propagate.
- [ ] **T017** Verify media-gallery framing: upload files, reorder, delete. Smoke test.
- [ ] **T018 [P]** Add translation keys under `framing.*`, `callout.memo`, `callout.document` in all 6 languages.

## P2 — Responses, defaults, references, tags

- [ ] **T020** Create `src/crd/forms/callout/ResponseTypeChipStrip.tsx` (single-select radiogroup, Document disabled, `locked` support).
- [ ] **T021** Create `src/crd/forms/callout/ActorSwitches.tsx` with the hierarchy rule (D4). Unit-test the four state transitions.
- [ ] **T022** Create `src/crd/forms/callout/ResponsePanel.tsx` + per-type sub-panels: `LinksPanel` (rows + actor switches), `PostsPanel` (actors + comments + Set Default Response button), `MemosPanel` (actors + defaults button), `WhiteboardsPanel` (actors + defaults button), `DocumentsPanel` (placeholder).
- [ ] **T023** Create `src/crd/forms/callout/LinksPrePopulateRows.tsx` (used inside `LinksPanel`): rows of title/url/description + add / delete. Validates non-empty uri requires non-empty title (FR-85).
- [ ] **T024** Create `src/crd/forms/callout/ReferencesEditor.tsx` (inside "More options"): rows of title/url/description, add/delete, FR-84 validation.
- [ ] **T025** Create `src/crd/forms/callout/ResponseDefaultsDialog.tsx` per FR-40..FR-46. Accept `type`, `values`, `onChange`, `onSave`, `onCancel`, `templateSlot?`, `whiteboardSlot?`.
- [ ] **T026** Create `src/main/crdPages/space/callout/ResponseDefaultsConnector.tsx`: wraps the defaults dialog, fetches `useSpaceContentTemplatesOnSpaceQuery` (already in use by `useCreateSubspace`), provides the template-picker popover (ported from prototype lines 594-642), and provides the `CrdSingleUserWhiteboardDialog` launcher for whiteboard defaults.
- [ ] **T027** Wire `calloutFormMapper.ts` to map:
  - `contributionDefaults` → `{ defaultDisplayName, postDescription, whiteboardContent }`.
  - `contributions` (create mode only) from pre-populate link rows (D19).
  - `framing.profile.references` from `referenceRows` (non-empty rows).
  - `framing.profile.tagsets` from the comma-separated `tags` string (D3).
  - `settings.contribution.{ enabled, allowedTypes, canAddContributions, commentsEnabled }` from `responseType` + `allowedActors` + `contributionCommentsEnabled` (D4).
- [ ] **T028** Update `useCrdCalloutForm.validate()` with pre-populate-links, references, min-poll-options, poll-option-required rules.
- [ ] **T029** Manual smoke: create a callout with each response type; verify server payload via network tab.
- [ ] **T030 [P]** Translation keys: `contributionSettings.*`, `responseDefaults.*`, `references.*`, `forms.tagsHelpText`, `forms.notifyMembers`, `callout.document` across 6 languages.

## P3 — Edit mode

- [ ] **T040** Create `src/main/crdPages/space/callout/dataMappers/mapCalloutDetailsToFormValues.ts` — pure function from `useCalloutContentQuery` data → form values. Mirror the MUI `EditCalloutDialog` mapping at lines 56-122.
- [ ] **T041** Wire edit pre-fill in `CalloutFormConnector`: on `mode === 'edit'`, run `useCalloutContentQuery`; in an effect, call `form.prefill(mapCalloutDetailsToFormValues(data))` once data lands. Store the mapped values as `initialValues` so `dirty` is computed correctly.
- [ ] **T042** Make `FramingChipStrip` / `ResponseTypeChipStrip` honour `locked` (D6). Clicking a locked non-active chip is a no-op; clicking the active chip fires `onDeselect`.
- [ ] **T043** Create `src/crd/components/dialogs/DeleteFramingDialog.tsx` (wrapper over `ConfirmationDialog`). Hook into the framing-chip deselect flow.
- [ ] **T044** Update `calloutFormMapper.ts` with an `UpdateCalloutEntityInput` branch: omits `settings.contribution.allowedTypes` (read-only), uses `mapProfileModelToUpdateProfileInput` for the profile, maps link / whiteboard / poll framing per MUI `EditCalloutDialog` lines 236-268.
- [ ] **T045** Create `src/main/crdPages/space/hooks/useCrdCalloutPollOptionDiff.ts` — pure diff helper (D7). Unit-test.
- [ ] **T046** Wire poll-option incremental save in `CalloutFormConnector` edit branch using `usePollOptionManagement` (already in domain). Fail-safe behaviour: on error, show notification + keep dialog open.
- [ ] **T047** Wire media-gallery diff on edit: pass `existingVisualIds` + `originalSortOrders` into `uploadMediaGalleryVisuals`. Mirror MUI `EditCalloutDialog` lines 123-130 + 305-316.
- [ ] **T048** Whiteboard on edit: replace the "Configure" button with an "Open whiteboard" action that launches `CrdWhiteboardDialog` (collaborative). Content changes are persisted inside the dialog — the form does not track whiteboard content on edit.
- [ ] **T049** Replace the `CalloutEditConnector` stub with a thin wrapper: `<CalloutFormConnector mode="edit" calloutId={calloutId} {...rest} />`.
- [ ] **T050** Remove the `visibility` draft/published selector and the `notifyMembers` field from the form settings area — those live in footer + visibility-change dialog only (FR-70..FR-72). Clean up `CalloutVisibilitySelector` if unused after this change.
- [ ] **T051** Manual smoke: edit each framing type, verify locked chips, verify poll-option add/remove/update/reorder, verify media-gallery add/delete/reorder, verify tags round-trip correctly.

## P4 — Context menu + lifecycle

- [ ] **T060** Update `src/crd/components/space/PostCard.tsx`: add `settingsSlot?: ReactNode` prop; replace the current 3-dots `<Button onClick={onSettingsClick}>` with the slot (so the consumer can render `DropdownMenu` with its own trigger). Update props / types.
- [ ] **T061** Update `src/crd/components/callout/CalloutDetailDialog.tsx`: add `settingsSlot?: ReactNode` in the sticky-header cluster.
- [ ] **T062** Create `src/main/crdPages/space/callout/CalloutSettingsConnector.tsx` — renders `CalloutContextMenu` with callbacks wired to: open edit dialog, open visibility-change dialog, open delete dialog, open sort dialog, open save-as-template dialog (conditionally), open MUI `ShareDialog`, fire move actions.
- [ ] **T063** Update `LazyCalloutItem.tsx` to render `<CalloutSettingsConnector .../>` as `settingsSlot`. Pass neighbour context.
- [ ] **T064** Update `CalloutDetailDialogConnector.tsx` similarly — render the same connector as the dialog's `settingsSlot`.
- [ ] **T065** Create `src/main/crdPages/space/hooks/useCrdCalloutMoveActions.ts` (D9). Given the callout list + callout id, returns `{ isTop, isBottom, onMoveUp, onMoveDown, onMoveToTop, onMoveToBottom }`. Wraps `useUpdateCalloutsSortOrderMutation` with optimistic reordering.
- [ ] **T066** Update `CalloutListConnector.tsx` to compute neighbour context per callout and pass it to `LazyCalloutItem`.
- [ ] **T067** Create `src/crd/components/callout/CalloutVisibilityChangeDialog.tsx` (D10). Props per plan.
- [ ] **T068** Wire `CalloutVisibilityChangeDialog` in `CalloutSettingsConnector` for Publish / Unpublish; reuse `changeCalloutVisibility` from `useCalloutManager`.
- [ ] **T069** Create `src/crd/components/dialogs/DeleteCalloutDialog.tsx` (thin wrapper over `ConfirmationDialog`); wire Delete action in `CalloutSettingsConnector` to `deleteCallout` from `useCalloutManager`.
- [ ] **T070** Create `src/crd/components/callout/CalloutContributionsSortDialog.tsx` (D11). `@dnd-kit` sortable list. Confirm button calls `onConfirm(sortedIds)`.
- [ ] **T071** Wire sort dialog in `CalloutSettingsConnector`: fetch contributions, map to `{ id, title, icon }`, on confirm call the appropriate contribution-sort mutation (verify exact mutation name during implementation; MUI source of truth: `CalloutContributionsSortDialog.tsx`).
- [ ] **T072** Wire MUI `ShareDialog` as a sibling in `CalloutSettingsConnector`, opened on the Share menu item.
- [ ] **T073 [P]** Translation keys: `contextMenu.*`, `visibilityChange.*`, `sortContributions.*`, `deleteCallout.*` across 6 languages.
- [ ] **T074** Manual smoke: publish → unpublish → delete → sort contributions → move up → move down → move to top → move to bottom → share. Each should behave correctly with permissions gating.

## P5 — Templates

- [ ] **T080** Rewrite `src/main/crdPages/space/callout/TemplateImportConnector.tsx` (D22). Renders MUI `ImportTemplatesDialog` as a sibling. On select, runs `useTemplateContentLazyQuery`, maps template → partial form values, calls parent `onTemplateSelected` with a confirm-overwrite flow.
- [ ] **T081** Wire "Find Template" button in `AddPostModal` header (create mode): `onFindTemplate?: () => void`. The connector passes a handler that opens `ImportTemplatesDialog`.
- [ ] **T082** Create `src/crd/components/callout/SaveAsTemplateDialog.tsx` (D12). Minimal CRD dialog: Name input + description + visibility + Save/Cancel.
- [ ] **T083** Wire Save-as-Template in `CalloutSettingsConnector` using the existing `useCreateCalloutTemplate` hook. If mapping the CRD form values into the expected `TemplateCalloutFormSubmittedValues` proves too complex, hide the menu item behind a local const and file a follow-up issue.
- [ ] **T084** Manual smoke: Find Template → select → form pre-fills. Save as Template from the menu → entered fields land on the server.

## P6 — Cleanup & polish

- [ ] **T090** Delete unused CRD code after the rewrite: `CalloutVisibilitySelector.tsx` (if the inline selector is gone), `CalloutFramingSelector.tsx` (was never consumed), dead branches in `useCrdCalloutForm`.
- [ ] **T091** Delete MUI-only files referenced only by the old stub paths if any. Confirm nothing else imports them first.
- [ ] **T092** Ensure `pnpm lint` + `pnpm vitest run` pass.
- [ ] **T093** Visual regression pass: compare create / edit dialog against the prototype side-by-side across mobile / tablet / desktop viewports; file follow-ups for any cosmetic mismatch.
- [ ] **T094** Update `src/main/crdPages/space/callout/index.md` if present, or add a brief comment block to the top of `CalloutFormConnector` describing the new connector surface.
- [ ] **T095** Final i18n sweep: every key used appears in all 6 language files; `pnpm vitest run` passes the translation completeness tests (if any).

## Checkpoints

- **After P0**: a user can create a simple text callout + see correct validation + confirm-on-close behaviour.
- **After P1**: all five supported framings create successfully; document chip is a disabled placeholder.
- **After P2**: callouts can be created with response types + defaults + references + tags; server receives the correct payload for each.
- **After P3**: existing callouts can be edited; framing type + allowedTypes locking works; poll options + media gallery save correctly.
- **After P4**: every callout action (edit, publish, unpublish, delete, sort, move, share) is reachable from the context menu on both the feed card and the detail dialog.
- **After P5**: Find-Template and Save-as-Template work (or Save-as-Template is explicitly hidden with a follow-up).
- **After P6**: lint clean, tests green, no dead code, all 6 languages synchronized.

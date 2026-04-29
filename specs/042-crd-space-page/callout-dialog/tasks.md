# Tasks: CRD Callout Dialog — Create / Edit / Lifecycle

**Parent**: [../tasks.md](../tasks.md) | **Plan**: [./plan.md](./plan.md) | **Spec**: [./spec.md](./spec.md)

Legend: `[P]` — can be done in parallel with other `[P]` items in the same phase.

## P0 — Form shell rewrite (text-callout parity)

- [X] **T001** Rewrite `src/main/crdPages/space/hooks/useCrdCalloutForm.ts` with the full value type (add: `memoMarkdown`, `referenceRows`, `prePopulateLinkRows`, `responseType`, `allowedActors`, `contributionCommentsEnabled`, `framingCommentsEnabled`, `contributionDefaults`, `initialValues`). Keep existing fields. Remove `framingType` + `allowedContributionTypes` array (now derived). Export `dirty` (via `isEqual(values, initialValues)`).
- [X] **T002** Add yup schema + `validate()` + `translateValidationMessage()` inside the hook, following `useCreateSubspace.ts` lines 95-133. Cover FR-80..FR-87.
- [X] **T003 [P]** Add translation keys under `validation.*` in `src/crd/i18n/space/space.en.json`. Mirror in the other 5 languages.
- [X] **T004** Create `src/crd/forms/callout/FramingChipStrip.tsx` (single-select radiogroup, `locked?: boolean`, `lockedTo?: ChipId`, Document chip always disabled). Include unit test for chip semantics.
- [X] **T005** Rewrite `src/crd/forms/callout/AddPostModal.tsx`: accept `mode`, `dirty`, `submitting`, `onFindTemplate?`, the new slots (`framingEditorSlot`, `responsesSlot`, `moreOptionsSlot`, `notifySwitchSlot`). Reorder zones per prototype. Add `handleCloseAttempt` (branches on `dirty` prop only — no `isEqual` / `initialValues` inside the modal, per D21). Implement FR-73: while `submitting === true`, the Save Draft / Publish / Save buttons render `aria-busy={true}` + `disabled`, and all other form inputs are disabled. Notify-members slot renders the CRD `Switch` primitive (D16) — not a checkbox.
- [X] **T006** Create `src/crd/components/dialogs/DiscardChangesDialog.tsx`. Wire into `AddPostModal`'s close flow.
- [X] **T007** Add a `beforeunload` handler while the form is dirty — register it inside `CalloutFormConnector` (or extract a small `useBeforeUnloadGuard(dirty)` hook co-located with it). Mirror `useDirtyTabGuard.ts` lines 47-57. Do **not** add it inside `AddPostModal` (CRD Golden Rule #2 — no browser-API side effects in `src/crd/`).
- [X] **T008** Update `src/main/crdPages/space/callout/CalloutFormConnector.tsx`: consume the new hook shape, split `mapFormToCalloutCreationInput()` into a pure helper in a new file `src/main/crdPages/space/callout/calloutFormMapper.ts`. Wire `dirty` down to the modal.
- [ ] **T009** Manual smoke: create simple text callout with title + description + tags. Verify validation errors render, confirm-on-close works, notify checkbox toggles `sendNotification`.

## P1 — All five framings

- [X] **T010** Create `src/crd/forms/callout/MemoFramingEditor.tsx` wrapping `@/crd/forms/markdown/MarkdownEditor`. Inline card with icon + label.
- [X] **T011** Update `src/main/crdPages/space/callout/FramingEditorConnector.tsx` `case 'memo'`: render `MemoFramingEditor` bound to `values.memoMarkdown`.
- [X] **T012 [P]** Add `framing.memo = { markdown, profile: { displayName } }` branch in `calloutFormMapper.ts` (T008).
- [X] **T013 [P]** Create `src/crd/forms/callout/DocumentFramingPlaceholder.tsx` (disabled panel with "Coming soon" copy).
- [ ] **T014** Verify whiteboard framing: clicking Whiteboard chip → Configure opens `CrdSingleUserWhiteboardDialog` → save → chip card shows "Configured" + Edit. Smoke test only (no code change).
- [ ] **T015** Verify link framing: `LinkFramingFields` renders, URL validation triggers for `^https?://`. Smoke test only.
- [ ] **T016** Verify poll framing: `PollOptionsEditor` + `PollSettingsDialog` work as-is. Verify `PollSettingsDialog` hide-results-until-voted + voter-avatars flags propagate.
- [ ] **T017** Verify media-gallery framing: upload files, reorder, delete. Smoke test.
- [X] **T018 [P]** Add translation keys under `framing.*`, `callout.memo`, `callout.document` in all 6 languages.

## P2 — Responses, defaults, references, tags

- [X] **T020** Create `src/crd/forms/callout/ResponseTypeChipStrip.tsx` (single-select radiogroup, Document disabled, `locked` support).
- [X] **T021** Create `src/crd/forms/callout/ActorSwitches.tsx` with the hierarchy rule (D4). Unit-test the four reachable state transitions, **plus an assertion that `{ members: true, admins: false }` is unreachable**: toggling `members` on while `admins` is off flips `admins` to on (never produces the forbidden state).
- [X] **T022** Create `src/crd/forms/callout/ResponsePanel.tsx` + per-type sub-panels: `LinksPanel` (rows + actor switches), `PostsPanel` (actors + comments + Set Default Response button), `MemosPanel` (actors + defaults button), `WhiteboardsPanel` (actors + defaults button), `DocumentsPanel` (placeholder).
- [X] **T023** Create `src/crd/forms/callout/LinksPrePopulateRows.tsx` (used inside `LinksPanel`): rows of title/url/description + add / delete. Validates non-empty uri requires non-empty title (FR-85).
- [X] **T024** Create `src/crd/forms/callout/ReferencesEditor.tsx` (inside "More options"): rows of title/url/description, add/delete, FR-84 validation.
- [X] **T024a** Create `src/crd/forms/callout/AllowCommentsField.tsx` — framing-level "Allow Comments" toggle shown inside the MORE OPTIONS section (FR-09, distinct from the contribution-level Posts comments switch in FR-32). Uses the CRD `Switch` primitive with visible `<label>` (FR-132). Props: `value: boolean`, `onChange: (v: boolean) => void`, `disabled?: boolean`. Rendered by the integration layer inside `moreOptionsSlot`.
- [X] **T025** Create `src/crd/forms/callout/ResponseDefaultsDialog.tsx` per FR-40..FR-46. Accept `type`, `values`, `onChange`, `onSave`, `onCancel`, `templateSlot?`, `whiteboardSlot?`.
- [X] **T026** Create `src/main/crdPages/space/callout/ResponseDefaultsConnector.tsx`: wraps the defaults dialog, fetches `useSpaceContentTemplatesOnSpaceQuery` (already in use by `useCreateSubspace`), provides the template-picker popover (ported from prototype lines 594-642), and provides the `CrdSingleUserWhiteboardDialog` launcher for whiteboard defaults.
- [X] **T027** Wire `calloutFormMapper.ts` to map:
  - `contributionDefaults` → `{ defaultDisplayName, postDescription, whiteboardContent }`.
  - `contributions` (create mode only) from pre-populate link rows (D19).
  - `framing.profile.references` from `referenceRows` (non-empty rows).
  - `framing.profile.tagsets` from the comma-separated `tags` string (D3).
  - `settings.contribution.{ enabled, allowedTypes, canAddContributions, commentsEnabled }` from `responseType` + `allowedActors` + `contributionCommentsEnabled` (D4).
  - `settings.framing.commentsEnabled` from `values.framingCommentsEnabled` (FR-09 framing-level toggle, wired by T024a).
- [X] **T028** Update `useCrdCalloutForm.validate()` with pre-populate-links, references, min-poll-options, poll-option-required rules.
- [ ] **T029** Manual smoke: create a callout with each response type; verify server payload via network tab.
- [X] **T030 [P]** Translation keys: `contributionSettings.*`, `responseDefaults.*`, `references.*`, `forms.tagsHelpText`, `forms.notifyMembers`, `forms.allowComments` (label + description for T024a's framing-level toggle), `callout.document` across 6 languages.

## P3 — Edit mode

- [X] **T040** Create `src/main/crdPages/space/callout/dataMappers/mapCalloutDetailsToFormValues.ts` — pure function from `useCalloutContentQuery` data → form values. Mirror the MUI `EditCalloutDialog` mapping at lines 56-122. Must set `framingCommentsEnabled` from `callout.settings.framing.commentsEnabled` so edit-mode round-trips the framing-level Allow Comments toggle (FR-09 / T024a).
- [X] **T041** Wire edit pre-fill in `CalloutFormConnector`: on `mode === 'edit'`, run `useCalloutContentQuery`; in an effect, call `form.prefill(mapCalloutDetailsToFormValues(data))` once data lands. Store the mapped values as `initialValues` so `dirty` is computed correctly.
- [X] **T042** Make `FramingChipStrip` / `ResponseTypeChipStrip` honour `locked` (D6). Clicking a locked non-active chip is a no-op; clicking the active chip fires `onDeselect`.
- [X] **T043** Create `src/crd/components/dialogs/DeleteFramingDialog.tsx` (wrapper over `ConfirmationDialog`). Hook into the framing-chip deselect flow.
- [X] **T043a** In edit mode, do not render `LinksPrePopulateRows` inside `LinksPanel` (US12 acceptance #6, D19). Accept an `isEditMode` prop on `LinksPanel` (or read `mode` from the form hook) and gate the rows. Actor switches and "Enable comments" remain visible and editable.
- [X] **T044** Update `calloutFormMapper.ts` with an `UpdateCalloutEntityInput` branch: omits `settings.contribution.allowedTypes` (read-only), uses `mapProfileModelToUpdateProfileInput` for the profile, maps link / whiteboard / poll framing per MUI `EditCalloutDialog` lines 236-268. Includes `settings.framing.commentsEnabled` from `values.framingCommentsEnabled` (FR-09).
- [X] **T045** Create `src/main/crdPages/space/hooks/useCrdCalloutPollOptionDiff.ts` — pure diff helper (D7). Unit-test.
- [X] **T046** Wire poll-option incremental save in `CalloutFormConnector` edit branch using `usePollOptionManagement` (already in domain). Fail-safe behaviour: on error, show notification + keep dialog open.
- [X] **T047** Wire media-gallery diff on edit: pass `existingVisualIds` + `originalSortOrders` into `uploadMediaGalleryVisuals`. Mirror MUI `EditCalloutDialog` lines 123-130 + 305-316.
- [X] **T048** Whiteboard on edit: replace the "Configure" button with an "Open whiteboard" action that launches `CrdWhiteboardDialog` (collaborative). Content changes are persisted inside the dialog — the form does not track whiteboard content on edit.
- [X] **T048a** Memo on edit (FR-21a, symmetric to T048): in `FramingEditorConnector` `case 'memo'`, branch on `mode`. In edit mode, replace `MemoFramingEditor` with a read-only memo preview (rendered markdown) + an "Open memo" button that launches `CrdMemoDialog` (collaborative) — content is persisted by the dialog itself, the main form does not track `memoMarkdown` on edit. In create mode, keep the T010/T011 inline `MarkdownEditor` binding. Update `mapCalloutDetailsToFormValues` (T040) to skip the memo body on edit (or set it but mark it as not dirty-tracked).
- [X] **T049** Replace the `CalloutEditConnector` stub with a thin wrapper: `<CalloutFormConnector mode="edit" calloutId={calloutId} {...rest} />`.
- [X] **T050** Remove the `visibility` draft/published selector and the `notifyMembers` field from the form settings area — those live in footer + visibility-change dialog only (FR-70..FR-72). Deletion of the now-unused `CalloutVisibilitySelector.tsx` is handled in T090 (consolidated cleanup).
- [ ] **T051** Manual smoke: edit each framing type, verify locked chips, verify poll-option add/remove/update/reorder, verify media-gallery add/delete/reorder, verify tags round-trip correctly.

## P4 — Context menu + lifecycle

- [X] **T060** Update `src/crd/components/space/PostCard.tsx`: add `settingsSlot?: ReactNode` prop; replace the current 3-dots `<Button onClick={onSettingsClick}>` with the slot (so the consumer can render `DropdownMenu` with its own trigger). Update props / types.
- [X] **T061** Update `src/crd/components/callout/CalloutDetailDialog.tsx`: add `settingsSlot?: ReactNode` in the sticky-header cluster.
- [X] **T062** Create `src/main/crdPages/space/callout/CalloutSettingsConnector.tsx` — renders `CalloutContextMenu` with callbacks wired to: open edit dialog, open visibility-change dialog, open delete dialog, open sort dialog, open save-as-template dialog (conditionally), open MUI `ShareDialog`, fire move actions. **Permission gating (FR-101) is implemented here**, not merely tested in T099: derive item visibility from `callout.authorization.myPrivileges`, `callout.settings.contribution.enabled`, contribution count, callout `visibility`, neighbour presence, and the `CRD_SAVE_AS_TEMPLATE_ENABLED` constant. Extract the rule into a pure helper (co-located, e.g., `deriveCalloutMenuVisibility.ts`) so T099 can unit-test it in isolation. Produce the prop bag consumed by `CalloutContextMenu` (matches the optional `useCrdCalloutSettingsMenu` shape hinted in plan File Inventory).
- [X] **T063** Update `LazyCalloutItem.tsx` to render `<CalloutSettingsConnector .../>` as `settingsSlot`. Pass neighbour context.
- [X] **T064** Update `CalloutDetailDialogConnector.tsx` similarly — render the same connector as the dialog's `settingsSlot`.
- [X] **T065** Create `src/main/crdPages/space/hooks/useCrdCalloutMoveActions.ts` (D9). Given the callout list + callout id, returns `{ isTop, isBottom, onMoveUp, onMoveDown, onMoveToTop, onMoveToBottom }`. Wraps `useUpdateCalloutsSortOrderMutation` and refetches the callout list on success (no optimistic reordering — see D9). On mutation failure, surface a localized toast via `useNotification` and leave the list order unchanged.
- [X] **T066** Update `CalloutListConnector.tsx` to compute neighbour context per callout and pass it to `LazyCalloutItem`.
- [X] **T067** Create `src/crd/components/callout/CalloutVisibilityChangeDialog.tsx` (D10). Props per plan. Notify-members control is the CRD `Switch` primitive (D16), not a checkbox.
- [X] **T068** Wire `CalloutVisibilityChangeDialog` in `CalloutSettingsConnector` for Publish / Unpublish; reuse `changeCalloutVisibility` from `useCalloutManager`.
- [X] **T069** Create `src/crd/components/dialogs/DeleteCalloutDialog.tsx` (thin wrapper over `ConfirmationDialog`); wire Delete action in `CalloutSettingsConnector` to `deleteCallout` from `useCalloutManager`.
- [X] **T070** Create `src/crd/components/callout/CalloutContributionsSortDialog.tsx` (D11). `@dnd-kit` sortable list. Confirm button calls `onConfirm(sortedIds)`.
- [X] **T071** Wire sort dialog in `CalloutSettingsConnector`: fetch contributions via `useCalloutContributionsSortOrderQuery`, map to `{ id, title, icon }`, and on confirm call `useUpdateContributionsSortOrderMutation({ variables: { calloutID, sortOrder: sortedIds } })`. Reference implementation: `src/domain/collaboration/calloutContributions/calloutsContributionsSortDialog/CalloutContributionsSortDialog.tsx`.
- [X] **T072** Wire MUI `ShareDialog` as a sibling in `CalloutSettingsConnector`, opened on the Share menu item.
- [X] **T073 [P]** Translation keys: `contextMenu.*`, `visibilityChange.*`, `sortContributions.*`, `deleteCallout.*` across 6 languages.
- [ ] **T074** Manual smoke: publish → unpublish → delete → sort contributions → move up → move down → move to top → move to bottom → share. Each should behave correctly with permissions gating.

## P5 — Templates

- [X] **T080** Rewrite `src/main/crdPages/space/callout/TemplateImportConnector.tsx` (D22). Renders MUI `ImportTemplatesDialog` as a sibling outside `.crd-root`. On select, runs `useTemplateContentLazyQuery`, maps template → partial form values, calls parent `onTemplateSelected` with a confirm-overwrite flow (re-uses `ConfirmationDialog`) when the form already has content.
- [X] **T081** Wire "Find Template" button in `AddPostModal` header (create mode): `onFindTemplate?: () => void`. The connector passes a handler that opens `ImportTemplatesDialog`. Explicitly test the overwrite-confirmation branch (US19): when the form is **dirty** (any field diverges from initial state — same flag from D14/D21/D22), selecting a template triggers the confirm dialog before prefilling. When the form is clean, prefill runs without confirmation.
- [X] **T082** Wire the MUI `CreateTemplateDialog` as a sibling portal of `AddPostModal` inside `CalloutSettingsConnector` (rendered outside `.crd-root`, same pattern as `ShareDialog`). Import path must be `@/domain/templates/...`, not `@mui/*` directly. Declare a local `CRD_SAVE_AS_TEMPLATE_ENABLED` constant defaulting to `true`; when `false`, the Save-as-Template menu item is hidden.
- [ ] **T083** Smoke-test the Save-as-Template flow end-to-end: open the menu → click Save as Template → the MUI dialog opens over the CRD route, form fields render, submit creates a template on the server. If integration is blocked (missing context providers, prop mismatch), flip `CRD_SAVE_AS_TEMPLATE_ENABLED = false` and file a follow-up issue — verify the menu item disappears.
- [ ] **T084** Manual smoke: Find Template → select → form pre-fills. Save as Template from the menu → entered fields land on the server.

## P6 — Cleanup & polish

- [X] **T090** Delete unused CRD code after the rewrite: `src/crd/forms/callout/CalloutVisibilitySelector.tsx` (replaced by footer buttons + visibility-change dialog), `src/crd/forms/callout/CalloutFramingSelector.tsx` (never consumed), `src/crd/forms/callout/CalloutContributionSettings.tsx` (replaced by `ResponsePanel` + per-type panels + `ActorSwitches` — confirm no remaining import before deleting), dead branches in `useCrdCalloutForm`.
- [X] **T091** Delete MUI-only files referenced only by the old stub paths if any. Confirm nothing else imports them first. _(Verified: no remaining references to deleted selectors; `CalloutEditConnector` reduced to the thin CRD wrapper in T049.)_
- [X] **T092** Ensure `pnpm lint` + `pnpm vitest run` pass.
- [ ] **T093** Visual regression pass: compare create / edit dialog against the prototype side-by-side across mobile / tablet / desktop viewports; file follow-ups for any cosmetic mismatch.
- [X] **T094** Update `src/main/crdPages/space/callout/index.md` if present, or add a brief comment block to the top of `CalloutFormConnector` describing the new connector surface. _(Header comment added to `CalloutFormConnector.tsx` describing mode branching, sibling connectors, form-state/mapper sources, and dirty-tracking.)_
- [X] **T095** Final i18n sweep: every key used appears in all 6 language files. Add a Vitest parity test that walks `src/crd/i18n/space/space.en.json` and asserts every key also exists in `nl`, `es`, `bg`, `de`, `fr` (FR-121). Failure lists missing keys.
- [X] **T096** A11y pass (FR-130..FR-135). Add Vitest + Testing-Library assertions on the key interactive components: `FramingChipStrip` / `ResponseTypeChipStrip` expose `role="radiogroup"` with `aria-label` and each chip has `aria-pressed`; disabled Document chip has `aria-disabled="true"`; validation error region has `aria-live="polite"`; icon-only buttons (3-dots trigger, row-delete, gear) have `aria-label`. Manual keyboard-only walkthrough: Tab reaches every control in a logical order; Escape closes dialogs; Enter activates focused buttons; focus is trapped inside the dialog. _(Automated assertions added: `FramingChipStrip.test.tsx`, new `ResponseTypeChipStrip.test.tsx`, and new `AddPostModal.test.tsx` cover radiogroup + aria-label + aria-checked [radio-role equivalent of aria-pressed] + aria-disabled Document chip + aria-live polite error region + close-button aria-label. Manual keyboard walkthrough remains for T051/T074.)_
- [X] **T097** Aria-busy coverage (FR-73). Assert that Save Draft / Publish / Save buttons render `aria-busy={true}` and `disabled` while the mutation is in flight, and that the rest of the form is inert (other inputs `disabled`). _(Covered in `AddPostModal.test.tsx` — Publish / Save Draft / edit-mode Save / Find Template / title input all asserted while `submitting={true}`.)_
- [X] **T098** Notify-members visibility rule (FR-72). Assert the checkbox is absent when the title is empty and appears when the title is non-empty (create mode only). Edit mode never renders it in the form footer. _(Covered in `AddPostModal.test.tsx` — modal renders `notifySwitchSlot` only in create mode and only when non-null; the connector's rule `mode === 'create' && values.title.trim().length > 0` gates when the slot is passed as null at `CalloutFormConnector.tsx:307`.)_
- [X] **T099** Permission-gating tests (FR-101). Unit-test `CalloutSettingsConnector` (or the permission-derivation helper) across the privilege matrix: Edit / Publish / Unpublish / Delete / Save-as-Template visibility change depending on `authorization.myPrivileges` and callout visibility; Move items hide at top / bottom edges.

## Checkpoints

- **After P0**: a user can create a simple text callout + see correct validation + confirm-on-close behaviour.
- **After P1**: all five supported framings create successfully; document chip is a disabled placeholder.
- **After P2**: callouts can be created with response types + defaults + references + tags; server receives the correct payload for each.
- **After P3**: existing callouts can be edited; framing type + allowedTypes locking works; poll options + media gallery save correctly.
- **After P4**: every callout action (edit, publish, unpublish, delete, sort, move, share) is reachable from the context menu on both the feed card and the detail dialog.
- **After P5**: Find-Template and Save-as-Template work (or Save-as-Template is explicitly hidden with a follow-up).
- **After P6**: lint clean, tests green, no dead code, all 6 languages synchronized.
